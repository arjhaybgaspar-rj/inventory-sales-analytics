from flask import Blueprint, request, jsonify, session
from config.database import get_db_connection
from utils.auth import login_required

sales_bp = Blueprint("sales", __name__, url_prefix="/api/sales")


@sales_bp.route("", methods=["GET"])
@login_required(["manager", "cashier"])
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


@sales_bp.route("/products/<int:product_id>/eligible-batches", methods=["GET"])
@login_required(["manager", "cashier"])
def get_eligible_batches(product_id):
    """Return usable batches in FEFO order for a product at checkout."""
    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        cursor.execute(
            """
            SELECT
                p.product_id,
                p.product_name
            FROM products p
            WHERE p.product_id = %s
                AND p.status = 'active'
            LIMIT 1
            """,
            (product_id,)
        )
        product = cursor.fetchone()

        if not product:
            return jsonify({
                "success": False,
                "message": "Active product not found."
            }), 404

        cursor.execute(
            """
            SELECT
                i.inventory_id,
                i.batch_id,
                i.quantity AS inventory_quantity,
                b.batch_number,
                b.quantity AS batch_quantity,
                b.expiry_date,
                GREATEST(
                    LEAST(
                        COALESCE(i.quantity, 0),
                        COALESCE(b.quantity, 0)
                    ),
                    0
                ) AS available_quantity
            FROM inventory i
            INNER JOIN batches b
                ON b.batch_id = i.batch_id
            WHERE b.product_id = %s
                AND i.quantity > 0
                AND b.quantity > 0
                AND b.status = 'available'
                AND (
                    b.expiry_date IS NULL
                    OR b.expiry_date >= CURDATE()
                )
            ORDER BY
                b.expiry_date IS NULL,
                b.expiry_date ASC,
                b.batch_id ASC
            """,
            (product_id,)
        )
        batches = cursor.fetchall()

        for batch in batches:
            batch["inventory_quantity"] = int(
                batch["inventory_quantity"] or 0
            )
            batch["batch_quantity"] = int(
                batch["batch_quantity"] or 0
            )
            batch["available_quantity"] = int(
                batch["available_quantity"] or 0
            )

        return jsonify({
            "success": True,
            "product": product,
            "recommended_batch_id": (
                int(batches[0]["batch_id"]) if batches else None
            ),
            "batches": batches
        }), 200

    except Exception as e:
        print("Eligible sales batches error:", repr(e))
        return jsonify({
            "success": False,
            "message": "Unable to load eligible batches for this product."
        }), 500

    finally:
        if cursor:
            cursor.close()

        if connection:
            connection.close()


@sales_bp.route("/<int:sale_id>", methods=["GET"])
@login_required(["manager", "cashier"])
def get_sale_receipt(sale_id):
    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        cursor.execute(
            """
            SELECT
                s.sale_id,
                s.user_id,
                u.full_name AS cashier,
                u.username,
                s.total_amount,
                s.payment_method,
                s.sale_date
            FROM sales s
            LEFT JOIN users u
                ON s.user_id = u.user_id
            WHERE s.sale_id = %s
            LIMIT 1
            """,
            (sale_id,)
        )
        sale = cursor.fetchone()

        if not sale:
            return jsonify({
                "success": False,
                "message": "Sale not found."
            }), 404

        cursor.execute(
            """
            SELECT
                p.product_id,
                p.product_name,
                p.unit,
                si.unit_price,
                SUM(si.quantity) AS quantity,
                SUM(si.subtotal) AS subtotal
            FROM sale_items si
            INNER JOIN batches b
                ON si.batch_id = b.batch_id
            INNER JOIN products p
                ON b.product_id = p.product_id
            WHERE si.sale_id = %s
            GROUP BY
                p.product_id,
                p.product_name,
                p.unit,
                si.unit_price
            ORDER BY p.product_name ASC
            """,
            (sale_id,)
        )
        items = cursor.fetchall()

        sale["total_amount"] = float(sale["total_amount"] or 0)
        for item in items:
            item["unit_price"] = float(item["unit_price"] or 0)
            item["quantity"] = int(item["quantity"] or 0)
            item["subtotal"] = float(item["subtotal"] or 0)

        return jsonify({
            "success": True,
            "receipt": {
                "sale_id": sale["sale_id"],
                "cashier": sale["cashier"] or sale["username"] or "Staff",
                "sale_date": sale["sale_date"],
                "payment_method": sale["payment_method"],
                "total_amount": sale["total_amount"],
                "items": items
            }
        }), 200

    except Exception as e:
        print("Sale receipt error:", repr(e))
        return jsonify({
            "success": False,
            "message": "Unable to retrieve this receipt."
        }), 500

    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()


@sales_bp.route("", methods=["POST"])
@login_required(["manager", "cashier"])
def create_sale():
    data = request.get_json()

    if not data:
        return jsonify({
            "success": False,
            "message": "Request data is required."
        }), 400

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
            requested_batch_id = item.get("batch_id")
            batch_override_reason = str(
                item.get("batch_override_reason") or ""
            ).strip()

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
                    i.quantity AS inventory_quantity,
                    b.batch_number,
                    b.quantity AS batch_quantity,
                    b.expiry_date,
                    b.status
                FROM inventory i
                INNER JOIN batches b
                    ON i.batch_id = b.batch_id
                WHERE b.product_id = %s
                AND i.quantity > 0
                AND b.quantity > 0
                AND b.status = 'available'
                AND (
                    b.expiry_date IS NULL
                    OR b.expiry_date >= CURDATE()
                )
                ORDER BY
                    b.expiry_date IS NULL,
                    b.expiry_date ASC,
                    b.batch_id ASC
                FOR UPDATE
                """,
                (product_id,)
            )

            batches = cursor.fetchall()
            is_fefo_override = False

            if requested_batch_id is not None:
                try:
                    requested_batch_id = int(requested_batch_id)
                except (TypeError, ValueError):
                    connection.rollback()

                    return jsonify({
                        "success": False,
                        "message": "Selected batch ID must be a valid number."
                    }), 400

                selected_batch = next(
                    (
                        batch for batch in batches
                        if int(batch["batch_id"]) == requested_batch_id
                    ),
                    None
                )

                if not selected_batch:
                    connection.rollback()

                    return jsonify({
                        "success": False,
                        "message": (
                            "The selected batch is no longer available or is "
                            "not valid for this product. Refresh the batch list."
                        )
                    }), 409

                recommended_batch_id = (
                    int(batches[0]["batch_id"]) if batches else None
                )
                is_fefo_override = (
                    requested_batch_id != recommended_batch_id
                )

                if is_fefo_override and len(batch_override_reason) < 5:
                    connection.rollback()

                    return jsonify({
                        "success": False,
                        "message": (
                            "Enter a short reason when selecting a batch "
                            "other than the FEFO recommendation."
                        )
                    }), 400

                if is_fefo_override and len(batch_override_reason) > 250:
                    connection.rollback()

                    return jsonify({
                        "success": False,
                        "message": (
                            "The batch override reason must be 250 "
                            "characters or fewer."
                        )
                    }), 400

                # Keep the selected batch first, then fulfill any remaining
                # quantity from the other eligible batches in FEFO order.
                # This preserves a user-selected batch preference while
                # calculating stock across the product's full eligible stock.
                batches = [selected_batch] + [
                    batch for batch in batches
                    if int(batch["batch_id"]) != requested_batch_id
                ]

            available_quantity = sum(
                min(
                    int(batch["inventory_quantity"]),
                    int(batch["batch_quantity"])
                )
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

                inventory_quantity = int(
                    batch["inventory_quantity"]
                )

                batch_quantity = int(
                    batch["batch_quantity"]
                )

                available_batch_quantity = min(
                    inventory_quantity,
                    batch_quantity
                )

                quantity_to_sell = min(
                    remaining_quantity,
                    available_batch_quantity
                )

                unit_price = float(
                    product["selling_price"]
                )

                subtotal = (
                    quantity_to_sell *
                    unit_price
                )

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
                    UPDATE batches
                    SET quantity = quantity - %s
                    WHERE batch_id = %s
                    AND quantity >= %s
                    """,
                    (
                        quantity_to_sell,
                        batch["batch_id"],
                        quantity_to_sell
                    )
                )

                if cursor.rowcount == 0:
                    connection.rollback()

                    return jsonify({
                        "success": False,
                        "message": "Unable to update batch stock."
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
                        (
                            "Sale transaction; FEFO override reason: "
                            + batch_override_reason
                            if is_fefo_override
                            else "Sale transaction"
                        ),
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

            if remaining_quantity > 0:
                connection.rollback()

                return jsonify({
                    "success": False,
                    "message": (
                        "Unable to complete the sale for "
                        + product["product_name"]
                    )
                }), 400

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

        item_summary = "; ".join(
            f"{item['product_name']} x {item['quantity']}"
            for item in sale_items
        )
        cursor.execute(
            """
            INSERT INTO activity_logs (user_id, action, description)
            VALUES (%s, %s, %s)
            """,
            (
                user_id,
                "SALE_COMPLETED",
                (
                    f"Sale #{sale_id} completed by {user['full_name']} "
                    f"({user['role']}); total ₱{float(total_amount):,.2f}; "
                    f"payment: {payment_method}; items: {item_summary}"
                )
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


@sales_bp.route("/<int:sale_id>", methods=["GET"])
@login_required(["manager", "cashier"])
def get_sale_details(sale_id):
    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        cursor.execute(
            """
            SELECT
                s.sale_id,
                s.user_id,
                u.full_name AS cashier,
                s.total_amount,
                s.payment_method,
                s.sale_date
            FROM sales s
            INNER JOIN users u
                ON s.user_id = u.user_id
            WHERE s.sale_id = %s
            LIMIT 1
            """,
            (sale_id,)
        )

        sale = cursor.fetchone()

        if not sale:
            return jsonify({
                "success": False,
                "message": "Transaction not found."
            }), 404

        if (
            session.get("role") == "cashier"
            and sale["user_id"] != session.get("user_id")
        ):
            return jsonify({
                "success": False,
                "message": "Access denied."
            }), 403

        cursor.execute(
            """
            SELECT
                p.product_id,
                p.product_name,
                si.batch_id,
                b.batch_number,
                si.quantity,
                si.unit_price,
                si.subtotal
            FROM sale_items si
            INNER JOIN batches b
                ON si.batch_id = b.batch_id
            INNER JOIN products p
                ON b.product_id = p.product_id
            WHERE si.sale_id = %s
            ORDER BY p.product_name ASC, si.batch_id ASC
            """,
            (sale_id,)
        )

        items = cursor.fetchall()

        return jsonify({
            "success": True,
            "sale": sale,
            "items": items
        }), 200

    except Exception as e:
        print("Get sale details error:", repr(e))

        return jsonify({
            "success": False,
            "message": str(e)
        }), 500

    finally:
        if cursor:
            cursor.close()

        if connection:
            connection.close()
