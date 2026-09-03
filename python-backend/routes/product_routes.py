from flask import Blueprint, request, jsonify
from config.database import get_db_connection
from utils.auth import login_required

product_bp = Blueprint("products", __name__, url_prefix="/api/products")


@product_bp.route("", methods=["POST"])
@login_required(["admin", "owner", "manager"])
def add_product():
    data = request.get_json()

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

        connection.commit()

        product_id = cursor.lastrowid

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
@login_required(["admin", "owner", "manager"])
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
                status,
                created_at
            FROM products
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