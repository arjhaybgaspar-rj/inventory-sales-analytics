from flask import Blueprint, request, jsonify, session
from config.database import get_db_connection
from utils.auth import login_required

inventory_bp = Blueprint("inventory", __name__, url_prefix="/api/inventory")


def get_near_expiry_days(cursor):
    cursor.execute(
        "SELECT near_expiry_days FROM inventory_settings WHERE setting_id = 1"
    )
    setting = cursor.fetchone()
    return max(1, min(int((setting or {}).get("near_expiry_days", 30)), 365))


@inventory_bp.route("/settings/near-expiry-days", methods=["GET"])
@login_required(["admin", "owner", "manager"])
def get_near_expiry_setting():
    connection = None
    cursor = None
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        days = get_near_expiry_days(cursor)
        return jsonify({"success": True, "near_expiry_days": days}), 200
    except Exception as e:
        print("Get near-expiry setting error:", repr(e))
        return jsonify({"success": False, "message": "Unable to retrieve the near-expiry setting."}), 500
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()


@inventory_bp.route("/settings/near-expiry-days", methods=["PUT"])
@login_required(["admin", "owner", "manager"])
def update_near_expiry_setting():
    data = request.get_json(silent=True) or {}
    days = data.get("near_expiry_days")
    if isinstance(days, bool):
        return jsonify({"success": False, "message": "Enter a whole number from 1 to 365."}), 400
    try:
        days = int(days)
        if not 1 <= days <= 365:
            raise ValueError
    except (TypeError, ValueError):
        return jsonify({"success": False, "message": "Enter a whole number from 1 to 365."}), 400

    connection = None
    cursor = None
    try:
        connection = get_db_connection()
        cursor = connection.cursor()
        cursor.execute(
            "SELECT near_expiry_days FROM inventory_settings WHERE setting_id = 1"
        )
        previous_setting = cursor.fetchone()
        previous_days = int(previous_setting[0]) if previous_setting else 30
        cursor.execute(
            """INSERT INTO inventory_settings
               (setting_id, near_expiry_days, updated_by)
               VALUES (1, %s, %s)
               ON DUPLICATE KEY UPDATE
                   near_expiry_days = VALUES(near_expiry_days),
                   updated_by = VALUES(updated_by)""",
            (days, session.get("user_id"))
        )
        if previous_days != days:
            cursor.execute(
                """INSERT INTO activity_logs (user_id, action, description)
                   VALUES (%s, %s, %s)""",
                (
                    session.get("user_id"),
                    "UPDATE_NEAR_EXPIRY_THRESHOLD",
                    f"Changed the near-expiry alert threshold from "
                    f"{previous_days} to {days} days."
                )
            )
        connection.commit()
        return jsonify({"success": True, "message": "Near-expiry threshold updated.", "near_expiry_days": days}), 200
    except Exception as e:
        if connection:
            connection.rollback()
        print("Update near-expiry setting error:", repr(e))
        return jsonify({"success": False, "message": "Unable to save the near-expiry setting."}), 500
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()


@inventory_bp.route("", methods=["GET"])
@login_required(["admin", "manager"])
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
                b.supplier_invoice_number,
                b.initial_quantity,
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
            INNER JOIN batches b ON i.batch_id = b.batch_id
            INNER JOIN products p ON b.product_id = p.product_id
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

        near_expiry_days = get_near_expiry_days(cursor)

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
                                AND (
                                    b.expiry_date IS NULL
                                    OR b.expiry_date >= CURDATE()
                                )
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
                    WHEN b.expiry_date < CURDATE()
                        THEN 'Expired'
                    ELSE 'Expiring Soon'
                END AS alert_type
            FROM inventory i
            INNER JOIN batches b
                ON i.batch_id = b.batch_id
            INNER JOIN products p
                ON b.product_id = p.product_id
            WHERE p.status = 'active'
                AND b.expiry_date IS NOT NULL
                AND b.expiry_date <= DATE_ADD(
                    CURDATE(),
                    INTERVAL %s DAY
                )
                AND GREATEST(
                    LEAST(
                        COALESCE(i.quantity, 0),
                        COALESCE(b.quantity, 0)
                    ),
                    0
                ) > 0
            ORDER BY
                b.expiry_date ASC,
                p.product_name ASC,
                b.batch_number ASC
        """

        cursor.execute(expiry_query, (near_expiry_days,))
        expiry_alerts = cursor.fetchall()

        for alert in expiry_alerts:
            alert["alert_id"] = f"expiry-{alert['batch_id']}"
            alert["quantity"] = int(alert["quantity"] or 0)
            alert["reorder_level"] = int(
                alert["reorder_level"] or 0
            )

        stock_alerts.sort(
            key=lambda alert: (
                0 if alert["alert_type"] == "Out of Stock" else 1,
                alert["product_name"].casefold()
            )
        )

        alerts = stock_alerts + expiry_alerts

        return jsonify({
            "success": True,
            "alerts": alerts,
            "near_expiry_days": near_expiry_days
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
    data = request.get_json(silent=True) or {}

    product_id = data.get("product_id")
    batch_number = data.get("batch_number")
    supplier_invoice_number = str(data.get("supplier_invoice_number") or "").strip() or None
    quantity = data.get("quantity")
    acquisition_cost = data.get("acquisition_cost")
    expiry_date = data.get("expiry_date")
    received_date = data.get("received_date")
    reorder_level = data.get("reorder_level", 10)
    created_by = session.get("user_id")

    try:
        if not product_id:
            return jsonify({
                "success": False,
                "message": "Product ID is required."
            }), 400

        if quantity is None or int(quantity) <= 0:
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

        if supplier_invoice_number and len(supplier_invoice_number) > 100:
            return jsonify({
                "success": False,
                "message": "Supplier invoice/reference number must be 100 characters or fewer."
            }), 400

        if int(reorder_level) < 0:
            return jsonify({
                "success": False,
                "message": "Reorder level cannot be negative."
            }), 400

    except (TypeError, ValueError):
        return jsonify({
            "success": False,
            "message": "Quantity, cost, and reorder level must be valid numbers."
        }), 400

    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        connection.start_transaction()

        cursor.execute(
            """
            SELECT product_id
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
            INSERT INTO batches (
                product_id,
                batch_number,
                supplier_invoice_number,
                quantity,
                initial_quantity,
                acquisition_cost,
                expiry_date,
                received_date,
                status
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, 'available')
            """,
            (
                product_id,
                batch_number,
                supplier_invoice_number,
                int(quantity),
                int(quantity),
                float(acquisition_cost),
                expiry_date or None,
                received_date
            )
        )

        batch_id = cursor.lastrowid
        effective_batch_number = str(batch_number or "").strip()
        if not effective_batch_number:
            effective_batch_number = f"B-{int(batch_id):06d}"
            cursor.execute(
                "UPDATE batches SET batch_number = %s WHERE batch_id = %s",
                (effective_batch_number, batch_id)
            )

        cursor.execute(
            """
            INSERT INTO inventory (
                batch_id,
                quantity,
                reorder_level
            )
            VALUES (%s, %s, %s)
            """,
            (
                batch_id,
                int(quantity),
                int(reorder_level)
            )
        )

        inventory_id = cursor.lastrowid

        cursor.execute(
            """
            INSERT INTO inventory_movements (
                batch_id,
                movement_type,
                quantity,
                reference_id,
                notes,
                created_by
            )
            VALUES (%s, 'IN', %s, %s, %s, %s)
            """,
            (
                batch_id,
                int(quantity),
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
            "batch_number": effective_batch_number,
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


@inventory_bp.route("/adjustments", methods=["POST"])
@login_required(["admin", "owner", "manager"])
def adjust_inventory():
    data = request.get_json(silent=True) or {}
    batch_id = data.get("batch_id")
    counted_quantity = data.get("counted_quantity")
    reason = str(data.get("reason") or "").strip()
    notes = str(data.get("notes") or "").strip()
    user_id = session.get("user_id")

    try:
        if isinstance(batch_id, bool):
            raise ValueError
        batch_id = int(batch_id)
        if batch_id <= 0:
            raise ValueError

        if isinstance(counted_quantity, bool):
            raise ValueError
        counted_quantity = int(counted_quantity)
        if counted_quantity < 0:
            raise ValueError
    except (TypeError, ValueError):
        return jsonify({
            "success": False,
            "message": "A valid batch ID and non-negative counted quantity are required."
        }), 400

    if not reason:
        return jsonify({
            "success": False,
            "message": "A reason is required for an inventory adjustment."
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
                i.inventory_id,
                i.quantity AS inventory_quantity,
                b.batch_id,
                b.quantity AS batch_quantity,
                b.batch_number,
                b.status AS batch_status,
                p.product_name
            FROM inventory i
            INNER JOIN batches b ON i.batch_id = b.batch_id
            INNER JOIN products p ON b.product_id = p.product_id
            WHERE b.batch_id = %s
            LIMIT 1
            FOR UPDATE
            """,
            (batch_id,)
        )
        record = cursor.fetchone()

        if not record:
            connection.rollback()
            return jsonify({
                "success": False,
                "message": "Inventory batch not found."
            }), 404

        if record["batch_status"] == "disposed":
            connection.rollback()
            return jsonify({
                "success": False,
                "message": "Disposed batches cannot be adjusted."
            }), 409

        previous_inventory_quantity = int(record["inventory_quantity"])
        previous_batch_quantity = int(record["batch_quantity"])
        inventory_difference = counted_quantity - previous_inventory_quantity
        batch_difference = counted_quantity - previous_batch_quantity

        if (
            previous_inventory_quantity == counted_quantity
            and previous_batch_quantity == counted_quantity
        ):
            connection.rollback()
            return jsonify({
                "success": True,
                "message": "The recorded quantity already matches the counted quantity.",
                "adjustment": {
                    "batch_id": batch_id,
                    "previous_quantity": counted_quantity,
                    "counted_quantity": counted_quantity,
                    "difference": 0
                }
            }), 200

        cursor.execute(
            """
            UPDATE inventory
            SET quantity = %s
            WHERE inventory_id = %s
            """,
            (counted_quantity, record["inventory_id"])
        )

        cursor.execute(
            """
            UPDATE batches
            SET quantity = %s
            WHERE batch_id = %s
            """,
            (counted_quantity, batch_id)
        )

        movement_notes = (
            "Physical count adjustment. "
            f"Previous inventory quantity: {previous_inventory_quantity}; "
            f"previous batch quantity: {previous_batch_quantity}; "
            f"counted quantity: {counted_quantity}; "
            f"inventory quantity change: {inventory_difference:+d}; "
            f"batch quantity change: {batch_difference:+d}; "
            f"reason: {reason}"
        )
        if notes:
            movement_notes += f"; notes: {notes}"

        cursor.execute(
            """
            INSERT INTO inventory_movements (
                batch_id,
                movement_type,
                quantity,
                reference_id,
                notes,
                created_by
            )
            VALUES (%s, 'ADJUSTMENT', %s, %s, %s, %s)
            """,
            (
                batch_id,
                max(abs(inventory_difference), abs(batch_difference)),
                record["inventory_id"],
                movement_notes,
                user_id
            )
        )

        connection.commit()
        return jsonify({
            "success": True,
            "message": f"Inventory count adjusted for {record['product_name']}.",
            "adjustment": {
                "batch_id": batch_id,
                "batch_number": record["batch_number"],
                "previous_inventory_quantity": previous_inventory_quantity,
                "previous_batch_quantity": previous_batch_quantity,
                "counted_quantity": counted_quantity,
                "inventory_difference": inventory_difference,
                "batch_difference": batch_difference
            }
        }), 200

    except Exception as e:
        if connection:
            connection.rollback()
        print("Inventory adjustment error:", repr(e))
        return jsonify({
            "success": False,
            "message": "Unable to record the inventory adjustment."
        }), 500

    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()


@inventory_bp.route("/losses", methods=["POST"])
@login_required(["admin", "owner", "manager"])
def record_inventory_loss():
    data = request.get_json(silent=True) or {}
    batch_id = data.get("batch_id")
    quantity = data.get("quantity")
    reason = str(data.get("reason") or "").strip().lower()
    notes = str(data.get("notes") or "").strip()
    user_id = session.get("user_id")
    allowed_reasons = {"expired", "damaged", "lost", "spoiled", "other"}

    try:
        if isinstance(batch_id, bool):
            raise ValueError
        batch_id = int(batch_id)
        if batch_id <= 0:
            raise ValueError

        if isinstance(quantity, bool):
            raise ValueError
        quantity = int(quantity)
        if quantity <= 0:
            raise ValueError
    except (TypeError, ValueError):
        return jsonify({
            "success": False,
            "message": "A valid batch ID and positive loss quantity are required."
        }), 400

    if reason not in allowed_reasons:
        return jsonify({
            "success": False,
            "message": "Choose a valid loss reason."
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
                i.inventory_id,
                i.quantity AS inventory_quantity,
                b.batch_id,
                b.quantity AS batch_quantity,
                b.batch_number,
                b.status AS batch_status,
                b.expiry_date < CURDATE() AS is_expired,
                p.product_name
            FROM inventory i
            INNER JOIN batches b ON i.batch_id = b.batch_id
            INNER JOIN products p ON b.product_id = p.product_id
            WHERE b.batch_id = %s
            LIMIT 1
            FOR UPDATE
            """,
            (batch_id,)
        )
        record = cursor.fetchone()

        if not record:
            connection.rollback()
            return jsonify({
                "success": False,
                "message": "Inventory batch not found."
            }), 404

        if reason == "expired" and not record["is_expired"]:
            connection.rollback()
            return jsonify({
                "success": False,
                "message": "Expired stock can only be disposed after its expiry date has passed."
            }), 400

        if record["batch_status"] == "disposed":
            connection.rollback()
            return jsonify({
                "success": False,
                "message": "This batch has already been disposed."
            }), 409

        inventory_quantity = int(record["inventory_quantity"])
        batch_quantity = int(record["batch_quantity"])

        if inventory_quantity != batch_quantity:
            connection.rollback()
            return jsonify({
                "success": False,
                "message": "The inventory and batch quantities differ. Record a physical count adjustment before recording this loss."
            }), 409

        if quantity > inventory_quantity:
            connection.rollback()
            return jsonify({
                "success": False,
                "message": f"Loss quantity exceeds the available batch quantity ({inventory_quantity})."
            }), 400

        remaining_quantity = inventory_quantity - quantity

        cursor.execute(
            """
            UPDATE inventory
            SET quantity = %s
            WHERE inventory_id = %s
            """,
            (remaining_quantity, record["inventory_id"])
        )

        cursor.execute(
            """
            UPDATE batches
            SET quantity = %s,
                status = CASE WHEN %s = 'expired' THEN 'expired' ELSE status END
            WHERE batch_id = %s
            """,
            (remaining_quantity, reason, batch_id)
        )

        cursor.execute(
            """
            INSERT INTO inventory_losses (
                batch_id,
                quantity,
                reason,
                notes,
                recorded_by
            )
            VALUES (%s, %s, %s, %s, %s)
            """,
            (batch_id, quantity, reason, notes or None, user_id)
        )
        loss_id = cursor.lastrowid

        movement_notes = f"Inventory loss recorded. Reason: {reason}."
        if notes:
            movement_notes += f" Notes: {notes}"

        cursor.execute(
            """
            INSERT INTO inventory_movements (
                batch_id,
                movement_type,
                quantity,
                reference_id,
                notes,
                created_by
            )
            VALUES (%s, 'LOSS', %s, %s, %s, %s)
            """,
            (batch_id, quantity, loss_id, movement_notes, user_id)
        )

        connection.commit()
        return jsonify({
            "success": True,
            "message": f"Inventory loss recorded for {record['product_name']}.",
            "loss": {
                "loss_id": loss_id,
                "batch_id": batch_id,
                "batch_number": record["batch_number"],
                "product_name": record["product_name"],
                "quantity": quantity,
                "remaining_quantity": remaining_quantity,
                "reason": reason
            }
        }), 201

    except Exception as e:
        if connection:
            connection.rollback()
        print("Inventory loss error:", repr(e))
        return jsonify({
            "success": False,
            "message": "Unable to record the inventory loss."
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
                b.supplier_invoice_number,
                b.expiry_date,
                p.product_id,
                p.product_name,
                p.barcode,
                u.full_name AS created_by_name
            FROM inventory_movements im
            INNER JOIN batches b ON im.batch_id = b.batch_id
            INNER JOIN products p ON b.product_id = p.product_id
            LEFT JOIN users u ON im.created_by = u.user_id
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
