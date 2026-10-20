from flask import Blueprint, request, jsonify, session
from config.database import get_db_connection
from utils.auth import login_required

inventory_bp = Blueprint("inventory", __name__, url_prefix="/api/inventory")


@inventory_bp.route("", methods=["GET"])
@login_required(["admin", "owner", "manager"])
def get_inventory():
    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        query = """
            SELECT
                i.inventory_id,
                i.batch_id,
                i.quantity,
                i.reorder_level,
                i.last_updated,
                b.batch_number,
                b.expiry_date,
                b.received_date,
                b.acquisition_cost,
                b.status AS batch_status,
                p.product_id,
                p.product_name,
                p.barcode,
                p.brand,
                p.unit,
                p.selling_price,
                p.image_url
            FROM inventory i
            INNER JOIN batches b
                ON i.batch_id = b.batch_id
            INNER JOIN products p
                ON b.product_id = p.product_id
            ORDER BY
                b.expiry_date IS NULL,
                b.expiry_date ASC,
                p.product_name ASC
        """

        cursor.execute(query)
        inventory = cursor.fetchall()

        return jsonify({
            "success": True,
            "inventory": inventory
        }), 200

    except Exception as e:
        print("Get inventory error:", repr(e))

        return jsonify({
            "success": False,
            "message": "Unable to retrieve inventory."
        }), 500

    finally:
        if cursor:
            cursor.close()

        if connection:
            connection.close()


@inventory_bp.route("/alerts", methods=["GET"])
@login_required(["admin", "owner", "manager"])
def get_inventory_alerts():
    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        # Stock alerts are calculated once per product using all usable batches.
        # Expired batches and batches not marked "available" do not contribute
        # to usable stock. LEAST() matches the availability calculation used by sales.
        stock_query = """
            SELECT
                p.product_id,
                p.product_name,
                p.barcode,
                p.brand,
                COALESCE(
                    SUM(
                        CASE
                            WHEN b.status = 'available'
                                AND (b.expiry_date IS NULL OR b.expiry_date >= CURDATE())
                            THEN GREATEST(
                                LEAST(
                                    COALESCE(i.quantity, 0),
                                    COALESCE(b.quantity, 0)
                                ),
                                0
                            )
                            ELSE 0
                        END
                    ),
                    0
                ) AS total_usable_stock,
                COALESCE(MAX(i.reorder_level), 0) AS reorder_level,
                COUNT(i.inventory_id) AS inventory_record_count
            FROM products p
            LEFT JOIN batches b
                ON b.product_id = p.product_id
            LEFT JOIN inventory i
                ON i.batch_id = b.batch_id
            WHERE p.status = 'active'
            GROUP BY
                p.product_id,
                p.product_name,
                p.barcode,
                p.brand
            HAVING COUNT(i.inventory_id) > 0
            ORDER BY p.product_name ASC
        """

        cursor.execute(stock_query)
        product_stock_rows = cursor.fetchall()

        stock_alerts = []

        for product in product_stock_rows:
            total_stock = int(product["total_usable_stock"] or 0)
            reorder_level = int(product["reorder_level"] or 0)

            if total_stock == 0:
                alert_type = "Out of Stock"
            elif total_stock <= reorder_level:
                alert_type = "Low Stock"
            else:
                # Sufficient stock in any usable batch prevents a false stock alert.
                continue

            stock_alerts.append({
                "alert_id": f"stock-{product['product_id']}",
                "inventory_id": None,
                "batch_id": None,
                "quantity": total_stock,
                "reorder_level": reorder_level,
                "batch_number": "All batches",
                "expiry_date": None,
                "batch_status": None,
                "product_id": product["product_id"],
                "product_name": product["product_name"],
                "barcode": product["barcode"],
                "brand": product["brand"],
                "alert_type": alert_type
            })

        # Expiration alerts intentionally remain batch-specific.
        expiry_query = """
            SELECT
                i.inventory_id,
                i.batch_id,
                GREATEST(
                    LEAST(
                        COALESCE(i.quantity, 0),
                        COALESCE(b.quantity, 0)
                    ),
                    0
                ) AS quantity,
                i.reorder_level,
                b.batch_number,
                b.expiry_date,
                b.status AS batch_status,
                p.product_id,
                p.product_name,
                p.barcode,
                p.brand,
                CASE
                    WHEN b.expiry_date < CURDATE() THEN 'Expired'
                    ELSE 'Expiring Soon'
                END AS alert_type
            FROM inventory i
            INNER JOIN batches b
                ON i.batch_id = b.batch_id
            INNER JOIN products p
                ON b.product_id = p.product_id
            WHERE p.status = 'active'
                AND b.expiry_date IS NOT NULL
                AND b.expiry_date <= DATE_ADD(CURDATE(), INTERVAL 30 DAY)
            ORDER BY
                b.expiry_date ASC,
                p.product_name ASC,
                b.batch_number ASC
        """

        cursor.execute(expiry_query)
        expiry_alerts = cursor.fetchall()

        for alert in expiry_alerts:
            alert["alert_id"] = f"expiry-{alert['batch_id']}"
            alert["quantity"] = int(alert["quantity"] or 0)
            alert["reorder_level"] = int(alert["reorder_level"] or 0)

        # Keep stock-level alerts first, followed by batch-level expiry alerts.
        stock_alerts.sort(
            key=lambda alert: (
                0 if alert["alert_type"] == "Out of Stock" else 1,
                alert["product_name"].casefold()
            )
        )
        alerts = stock_alerts + expiry_alerts

        return jsonify({
            "success": True,
            "alerts": alerts
        }), 200

    except Exception as e:
        print("Get inventory alerts error:", repr(e))

        return jsonify({
            "success": False,
            "message": "Unable to retrieve inventory alerts."
        }), 500

    finally:
        if cursor:
            cursor.close()

        if connection:
            connection.close()

@inventory_bp.route("/stock-in", methods=["POST"])
@login_required(["admin", "owner", "manager"])
def stock_in():
    data = request.get_json()

    product_id = data.get("product_id")
    batch_number = data.get("batch_number")
    quantity = data.get("quantity")
    acquisition_cost = data.get("acquisition_cost")
    expiry_date = data.get("expiry_date")
    received_date = data.get("received_date")
    reorder_level = data.get("reorder_level", 10)
    created_by = session.get("user_id")

    if not product_id:
        return jsonify({
            "success": False,
            "message": "Product ID is required."
        }), 400

    if not quantity or int(quantity) <= 0:
        return jsonify({
            "success": False,
            "message": "Quantity must be greater than zero."
        }), 400

    if acquisition_cost is None or float(acquisition_cost) < 0:
        return jsonify({
            "success": False,
            "message": "Acquisition cost is required."
        }), 400

    if not received_date:
        return jsonify({
            "success": False,
            "message": "Received date is required."
        }), 400

    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        connection.start_transaction()

        cursor.execute(
            """
            SELECT
                product_id
            FROM products
            WHERE product_id = %s
            AND status = 'active'
            LIMIT 1
            """,
            (product_id,)
        )

        product = cursor.fetchone()

        if not product:
            connection.rollback()

            return jsonify({
                "success": False,
                "message": "Product not found."
            }), 404

        cursor.execute(
            """
            INSERT INTO batches
            (
                product_id,
                batch_number,
                quantity,
                acquisition_cost,
                expiry_date,
                received_date,
                status
            )
            VALUES
            (
                %s,
                %s,
                %s,
                %s,
                %s,
                %s,
                'available'
            )
            """,
            (
                product_id,
                batch_number,
                quantity,
                acquisition_cost,
                expiry_date,
                received_date
            )
        )

        batch_id = cursor.lastrowid

        cursor.execute(
            """
            INSERT INTO inventory
            (
                batch_id,
                quantity,
                reorder_level
            )
            VALUES
            (
                %s,
                %s,
                %s
            )
            """,
            (
                batch_id,
                quantity,
                reorder_level
            )
        )

        inventory_id = cursor.lastrowid

        cursor.execute(
            """
            INSERT INTO inventory_movements
            (
                batch_id,
                movement_type,
                quantity,
                reference_id,
                notes,
                created_by
            )
            VALUES
            (
                %s,
                'IN',
                %s,
                %s,
                %s,
                %s
            )
            """,
            (
                batch_id,
                quantity,
                inventory_id,
                "Stock-in transaction",
                created_by
            )
        )

        connection.commit()

        return jsonify({
            "success": True,
            "message": "Stock-in completed successfully.",
            "batch_id": batch_id,
            "inventory_id": inventory_id
        }), 201

    except Exception as e:
        if connection:
            connection.rollback()

        print("Stock-in error:", repr(e))

        return jsonify({
            "success": False,
            "message": "Unable to process stock-in."
        }), 500

    finally:
        if cursor:
            cursor.close()

        if connection:
            connection.close()


@inventory_bp.route("/movements", methods=["GET"])
@login_required(["admin", "owner", "manager"])
def get_inventory_movements():
    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        query = """
            SELECT
                im.movement_id,
                im.batch_id,
                im.movement_type,
                im.quantity,
                im.reference_id,
                im.notes,
                im.created_by,
                im.created_at,
                b.batch_number,
                b.expiry_date,
                p.product_id,
                p.product_name,
                p.barcode,
                u.full_name AS created_by_name
            FROM inventory_movements im
            INNER JOIN batches b
                ON im.batch_id = b.batch_id
            INNER JOIN products p
                ON b.product_id = p.product_id
            LEFT JOIN users u
                ON im.created_by = u.user_id
            ORDER BY im.movement_id DESC
        """

        cursor.execute(query)
        movements = cursor.fetchall()

        return jsonify({
            "success": True,
            "movements": movements
        }), 200

    except Exception as e:
        print("Get inventory movements error:", repr(e))

        return jsonify({
            "success": False,
            "message": "Unable to retrieve inventory movements."
        }), 500

    finally:
        if cursor:
            cursor.close()

        if connection:
            connection.close()
