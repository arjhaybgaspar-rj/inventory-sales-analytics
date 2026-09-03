from flask import Blueprint, request, jsonify, session
from config.database import get_db_connection
from utils.auth import login_required

sales_bp = Blueprint("sales", __name__, url_prefix="/api/sales")


@sales_bp.route("", methods=["GET"])
@login_required(["admin", "owner", "manager", "cashier"])
def get_sales():
    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        query = """
            SELECT
                s.sale_id,
                s.user_id,
                u.full_name,
                s.total_amount,
                s.payment_method,
                s.sale_date
            FROM sales s
            INNER JOIN users u
                ON s.user_id = u.user_id
            ORDER BY s.sale_id DESC
        """

        cursor.execute(query)
        sales = cursor.fetchall()

        return jsonify({
            "success": True,
            "sales": sales
        }), 200

    except Exception as e:
        print("Get sales error:", repr(e))

        return jsonify({
            "success": False,
            "message": str(e)
        }), 500

    finally:
        if cursor:
            cursor.close()

        if connection:
            connection.close()


@sales_bp.route("", methods=["POST"])
@login_required(["admin", "owner", "manager", "cashier"])
def create_sale():
    data = request.get_json()

    user_id = session.get("user_id")
    payment_method = data.get("payment_method")
    items = data.get("items")

    if payment_method not in ["cash", "gcash", "card"]:
        return jsonify({
            "success": False,
            "message": "Invalid payment method."
        }), 400

    if not items or not isinstance(items, list):
        return jsonify({
            "success": False,
            "message": "Sale items are required."
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
                user_id,
                full_name,
                role
            FROM users
            WHERE user_id = %s
            AND status = 'active'
            LIMIT 1
            """,
            (user_id,)
        )

        user = cursor.fetchone()

        if not user:
            connection.rollback()

            return jsonify({
                "success": False,
                "message": "Active user not found."
            }), 404

        cursor.execute(
            """
            INSERT INTO sales
            (
                user_id,
                total_amount,
                payment_method
            )
            VALUES
            (
                %s,
                0.00,
                %s
            )
            """,
            (
                user_id,
                payment_method
            )
        )

        sale_id = cursor.lastrowid
        total_amount = 0
        sale_items = []

        for item in items:
            product_id = item.get("product_id")
            requested_quantity = item.get("quantity")

            if not product_id:
                connection.rollback()

                return jsonify({
                    "success": False,
                    "message": "Product ID is required for every item."
                }), 400

            if requested_quantity is None:
                connection.rollback()

                return jsonify({
                    "success": False,
                    "message": "Quantity is required for every item."
                }), 400

            try:
                requested_quantity = int(requested_quantity)
            except (TypeError, ValueError):
                connection.rollback()

                return jsonify({
                    "success": False,
                    "message": "Quantity must be a valid number."
                }), 400

            if requested_quantity <= 0:
                connection.rollback()

                return jsonify({
                    "success": False,
                    "message": "Quantity must be greater than zero."
                }), 400

            cursor.execute(
                """
                SELECT
                    product_id,
                    product_name,
                    selling_price
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
                SELECT
                    i.inventory_id,
                    i.batch_id,
                    i.quantity,
                    b.batch_number,
                    b.expiry_date,
                    b.status
                FROM inventory i
                INNER JOIN batches b
                    ON i.batch_id = b.batch_id
                WHERE b.product_id = %s
                AND i.quantity > 0
                AND b.status = 'available'
                ORDER BY
                    b.expiry_date IS NULL,
                    b.expiry_date ASC,
                    b.batch_id ASC
                FOR UPDATE
                """,
                (product_id,)
            )

            batches = cursor.fetchall()

            available_quantity = sum(
                int(batch["quantity"])
                for batch in batches
            )

            if available_quantity < requested_quantity:
                connection.rollback()

                return jsonify({
                    "success": False,
                    "message": (
                        "Insufficient stock for "
                        + product["product_name"]
                        + ". Available stock: "
                        + str(available_quantity)
                    )
                }), 400

            remaining_quantity = requested_quantity

            for batch in batches:
                if remaining_quantity <= 0:
                    break

                batch_quantity = int(batch["quantity"])

                quantity_to_sell = min(
                    remaining_quantity,
                    batch_quantity
                )

                unit_price = float(product["selling_price"])
                subtotal = quantity_to_sell * unit_price

                cursor.execute(
                    """
                    UPDATE inventory
                    SET quantity = quantity - %s
                    WHERE inventory_id = %s
                    AND quantity >= %s
                    """,
                    (
                        quantity_to_sell,
                        batch["inventory_id"],
                        quantity_to_sell
                    )
                )

                if cursor.rowcount == 0:
                    connection.rollback()

                    return jsonify({
                        "success": False,
                        "message": "Unable to update inventory stock."
                    }), 400

                cursor.execute(
                    """
                    INSERT INTO sale_items
                    (
                        sale_id,
                        batch_id,
                        quantity,
                        unit_price,
                        subtotal
                    )
                    VALUES
                    (
                        %s,
                        %s,
                        %s,
                        %s,
                        %s
                    )
                    """,
                    (
                        sale_id,
                        batch["batch_id"],
                        quantity_to_sell,
                        unit_price,
                        subtotal
                    )
                )

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
                        'OUT',
                        %s,
                        %s,
                        %s,
                        %s
                    )
                    """,
                    (
                        batch["batch_id"],
                        quantity_to_sell,
                        sale_id,
                        "Sale transaction",
                        user_id
                    )
                )

                sale_items.append({
                    "product_id": product["product_id"],
                    "product_name": product["product_name"],
                    "batch_id": batch["batch_id"],
                    "batch_number": batch["batch_number"],
                    "quantity": quantity_to_sell,
                    "unit_price": unit_price,
                    "subtotal": subtotal
                })

                total_amount += subtotal
                remaining_quantity -= quantity_to_sell

        cursor.execute(
            """
            UPDATE sales
            SET total_amount = %s
            WHERE sale_id = %s
            """,
            (
                total_amount,
                sale_id
            )
        )

        connection.commit()

        return jsonify({
            "success": True,
            "message": "Sale completed successfully.",
            "sale_id": sale_id,
            "user_id": user_id,
            "cashier": user["full_name"],
            "total_amount": total_amount,
            "payment_method": payment_method,
            "items": sale_items
        }), 201

    except Exception as e:
        if connection:
            connection.rollback()

        print("Create sale error:", repr(e))

        return jsonify({
            "success": False,
            "message": str(e)
        }), 500

    finally:
        if cursor:
            cursor.close()

        if connection:
            connection.close()