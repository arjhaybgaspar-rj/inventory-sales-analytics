

from flask import Blueprint, request, jsonify, session
from config.database import get_db_connection
from utils.auth import login_required

product_bp = Blueprint("products", __name__, url_prefix="/api/products")


@product_bp.route("", methods=["POST"])
@login_required(["owner", "manager"])
def add_product():
    data = request.get_json() or {}

    barcode = data.get("barcode")
    product_name = data.get("product_name")
    brand = data.get("brand")
    category = data.get("category")
    unit = data.get("unit")
    selling_price = data.get("selling_price")
    image_url = data.get("image_url")
    api_source = data.get("api_source")

    if not barcode or not product_name or selling_price is None:
        return jsonify({
            "success": False,
            "message": "Barcode, product name, and selling price are required."
        }), 400

    try:
        selling_price = float(selling_price)

        if selling_price <= 0:
            return jsonify({
                "success": False,
                "message": "Selling price must be greater than 0."
            }), 400

    except (TypeError, ValueError):
        return jsonify({
            "success": False,
            "message": "Please provide a valid selling price."
        }), 400

    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        cursor.execute(
            "SELECT product_id FROM products WHERE barcode = %s LIMIT 1",
            (barcode,)
        )

        existing_product = cursor.fetchone()

        if existing_product:
            return jsonify({
                "success": False,
                "message": "This product is already in your product list."
            }), 409

        query = """
            INSERT INTO products
            (
                barcode,
                product_name,
                brand,
                category,
                unit,
                selling_price,
                image_url,
                api_source,
                status
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, 'active')
        """

        cursor.execute(
            query,
            (
                barcode,
                product_name,
                brand,
                category,
                unit,
                selling_price,
                image_url,
                api_source
            )
        )

        product_id = cursor.lastrowid
        cursor.execute(
            """
            INSERT INTO activity_logs (user_id, action, description)
            VALUES (%s, %s, %s)
            """,
            (
                session.get("user_id"),
                "PRODUCT_CREATED",
                f"Added product #{product_id}: {product_name} "
                f"(barcode: {barcode}, price: ₱{selling_price:,.2f})."
            )
        )

        connection.commit()

        return jsonify({
            "success": True,
            "message": "Product added successfully.",
            "product_id": product_id
        }), 201

    except Exception as e:
        if connection:
            connection.rollback()

        print("Add product error:", e)

        return jsonify({
            "success": False,
            "message": "Unable to add product."
        }), 500

    finally:
        if cursor:
            cursor.close()

        if connection:
            connection.close()


@product_bp.route("", methods=["GET"])
@login_required(["owner", "manager", "cashier"])
def get_products():
    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        query = """
            SELECT
                product_id,
                barcode,
                product_name,
                brand,
                category,
                unit,
                selling_price,
                image_url,
                api_source,
                near_expiry_days,
                status,
                created_at
            FROM products
            WHERE status = 'active'
            ORDER BY product_id DESC
        """

        cursor.execute(query)
        products = cursor.fetchall()

        return jsonify({
            "success": True,
            "products": products
        }), 200

    except Exception as e:
        print("Get products error:", e)

        return jsonify({
            "success": False,
            "message": "Unable to retrieve products."
        }), 500

    finally:
        if cursor:
            cursor.close()

        if connection:
            connection.close()


@product_bp.route("/<int:product_id>", methods=["PUT"])
@login_required(["owner", "manager"])
def update_product(product_id):
    data = request.get_json() or {}

    allowed_fields = {
        "product_name",
        "brand",
        "category",
        "unit",
        "selling_price",
        "status"
    }

    updates = {
        key: value
        for key, value in data.items()
        if key in allowed_fields
    }

    if not updates:
        return jsonify({
            "success": False,
            "message": "No valid product information was provided."
        }), 400

    if "product_name" in updates and not str(updates["product_name"]).strip():
        return jsonify({
            "success": False,
            "message": "Product name cannot be empty."
        }), 400

    if "selling_price" in updates:
        try:
            price = float(updates["selling_price"])

            if price <= 0:
                return jsonify({
                    "success": False,
                    "message": "Selling price must be greater than 0."
                }), 400

            updates["selling_price"] = price

        except (TypeError, ValueError):
            return jsonify({
                "success": False,
                "message": "Please provide a valid selling price."
            }), 400

    if "status" in updates:
        if updates["status"] not in ["active", "inactive"]:
            return jsonify({
                "success": False,
                "message": "Status must be active or inactive."
            }), 400

    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        cursor.execute(
            """
            SELECT product_id, product_name, brand, category, unit,
                   selling_price, status
            FROM products
            WHERE product_id = %s
            LIMIT 1
            """,
            (product_id,)
        )

        existing_product = cursor.fetchone()

        if not existing_product:
            return jsonify({
                "success": False,
                "message": "Product not found."
            }), 404

        changes = []
        for field, new_value in updates.items():
            old_value = existing_product.get(field)
            if old_value != new_value:
                changes.append(f"{field}: '{old_value}' → '{new_value}'")

        if not changes:
            return jsonify({
                "success": True,
                "message": "No product information changed."
            }), 200

        set_clause = ", ".join(
            f"{field} = %s"
            for field in updates.keys()
        )

        values = list(updates.values())
        values.append(product_id)

        query = f"""
            UPDATE products
            SET {set_clause}
            WHERE product_id = %s
        """

        cursor.execute(query, tuple(values))

        cursor.execute(
            """
            INSERT INTO activity_logs (user_id, action, description)
            VALUES (%s, %s, %s)
            """,
            (
                session.get("user_id"),
                "PRODUCT_UPDATED",
                f"Updated product #{product_id} ({existing_product['product_name']}): "
                f"{'; '.join(changes)}."
            )
        )

        connection.commit()

        return jsonify({
            "success": True,
            "message": "Product updated successfully."
        }), 200

    except Exception as e:
        if connection:
            connection.rollback()

        print("Update product error:", e)

        return jsonify({
            "success": False,
            "message": "Unable to update product."
        }), 500

    finally:
        if cursor:
            cursor.close()

        if connection:
            connection.close()
