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

        query = """
            SELECT
                i.inventory_id,
                i.batch_id,
                i.quantity,
                i.reorder_level,
                b.batch_number,
                b.expiry_date,
                b.status AS batch_status,
                p.product_id,
                p.product_name,
                p.barcode,
                p.brand
            FROM inventory i
            INNER JOIN batches b
                ON i.batch_id = b.batch_id
            INNER JOIN products p
                ON b.product_id = p.product_id
            WHERE
                i.quantity = 0
                OR (
                    i.quantity > 0
                    AND i.quantity <= i.reorder_level
                )
                OR (
                    b.expiry_date IS NOT NULL
                    AND b.expiry_date < CURDATE()
                )
                OR (
                    b.expiry_date IS NOT NULL
                    AND b.expiry_date >= CURDATE()
                    AND b.expiry_date <= DATE_ADD(CURDATE(), INTERVAL 30 DAY)
                )
            ORDER BY
                i.quantity ASC,
                b.expiry_date IS NULL,
                b.expiry_date ASC,
                p.product_name ASC
        """

        cursor.execute(query)
        alerts = cursor.fetchall()

        from datetime import date, timedelta

        today = date.today()
        thirty_days_from_now = today + timedelta(days=30)

        for alert in alerts:
            expiry_date = alert["expiry_date"]
            quantity = int(alert["quantity"])
            reorder_level = int(alert["reorder_level"])

            if quantity == 0:
                alert["alert_type"] = "Out of Stock"
            elif expiry_date is not None and expiry_date < today:
                alert["alert_type"] = "Expired"
            elif (
                expiry_date is not None
                and today <= expiry_date <= thirty_days_from_now
            ):
                alert["alert_type"] = "Expiring Soon"
            elif quantity <= reorder_level:
                alert["alert_type"] = "Low Stock"
            else:
                alert["alert_type"] = "Available"

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