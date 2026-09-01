from flask import Blueprint, jsonify, request
from config.database import get_db_connection

product_bp = Blueprint("products", __name__)


@product_bp.route("/api/products", methods=["POST"])
def create_product():

    data = request.get_json()

    if not data:
        return jsonify({
            "success": False,
            "message": "Product data is required."
        }), 400

    barcode = data.get("barcode")
    product_name = data.get("product_name")
    brand = data.get("brand")
    category = data.get("category")
    unit = data.get("unit")
    image_url = data.get("image_url")
    selling_price = data.get("selling_price")

    # Required fields
    if not barcode:
        return jsonify({
            "success": False,
            "message": "Barcode is required."
        }), 400

    if not product_name:
        return jsonify({
            "success": False,
            "message": "Product name is required."
        }), 400

    if not unit:
        unit = "piece"

    if selling_price is None:
        return jsonify({
            "success": False,
            "message": "Selling price is required."
        }), 400

    # Check price
    try:
        selling_price = float(selling_price)

        if selling_price < 0:
            return jsonify({
                "success": False,
                "message": "Selling price cannot be negative."
            }), 400

    except (ValueError, TypeError):
        return jsonify({
            "success": False,
            "message": "Selling price must be a valid number."
        }), 400

    connection = None
    cursor = None

    try:

        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        # ==========================================
        # CHECK IF BARCODE ALREADY EXISTS
        # ==========================================

        cursor.execute(
            """
            SELECT product_id, product_name, barcode
            FROM products
            WHERE barcode = %s
            """,
            (barcode,)
        )

        existing_product = cursor.fetchone()

        if existing_product:
            return jsonify({
                "success": False,
                "exists": True,
                "message": "This product is already in your product list.",
                "product": existing_product
            }), 409

        # ==========================================
        # INSERT PRODUCT
        # ==========================================

        insert_query = """
            INSERT INTO products
            (
                barcode,
                product_name,
                category,
                brand,
                image_url,
                api_source,
                unit,
                selling_price
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """

        cursor.execute(
            insert_query,
            (
                barcode,
                product_name,
                category,
                brand,
                image_url,
                "Open Food Facts",
                unit,
                selling_price
            )
        )

        connection.commit()

        product_id = cursor.lastrowid

        # ==========================================
        # GET SAVED PRODUCT
        # ==========================================

        cursor.execute(
            """
            SELECT
                product_id,
                barcode,
                product_name,
                category,
                brand,
                image_url,
                api_source,
                unit,
                selling_price,
                status,
                created_at
            FROM products
            WHERE product_id = %s
            """,
            (product_id,)
        )

        saved_product = cursor.fetchone()

        return jsonify({
            "success": True,
            "message": "Product added successfully.",
            "product": saved_product
        }), 201

    except Exception as e:

        if connection:
            connection.rollback()

        return jsonify({
            "success": False,
            "message": "Failed to add product.",
            "error": str(e)
        }), 500

    finally:

        if cursor:
            cursor.close()

        if connection:
            connection.close()