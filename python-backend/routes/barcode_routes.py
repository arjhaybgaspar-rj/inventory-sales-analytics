from flask import Blueprint, jsonify, request
from config.database import get_db_connection
import requests


barcode_bp = Blueprint("barcode", __name__)


@barcode_bp.route("/api/barcode/lookup", methods=["GET"])
def lookup_barcode():

    # Get barcode from request
    barcode = request.args.get("barcode")

    if not barcode:
        return jsonify({
            "success": False,
            "message": "Barcode is required."
        }), 400

    # ==========================================
    # 1. CHECK OUR DATABASE FIRST
    # ==========================================

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
                category,
                brand,
                image_url,
                api_source,
                unit,
                selling_price,
                status
            FROM products
            WHERE barcode = %s
        """

        cursor.execute(query, (barcode,))
        existing_product = cursor.fetchone()

    except Exception as e:
        return jsonify({
            "success": False,
            "message": "Database error.",
            "error": str(e)
        }), 500

    finally:
        if cursor:
            cursor.close()

        if connection:
            connection.close()

    # ==========================================
    # 2. PRODUCT ALREADY EXISTS
    # ==========================================

    if existing_product:

        return jsonify({
            "success": True,
            "exists": True,
            "found_in_api": False,
            "message": "This product is already in your product list.",
            "product": existing_product
        })

    # ==========================================
    # 3. PRODUCT DOES NOT EXIST
    #    SEARCH OPEN FOOD FACTS
    # ==========================================

    api_url = (
        f"https://world.openfoodfacts.org/api/v2/product/{barcode}.json"
    )

    headers = {
        "User-Agent": "InventorySalesAnalytics/1.0"
    }

    try:

        response = requests.get(
            api_url,
            headers=headers,
            timeout=15
        )

    except requests.exceptions.Timeout:

        return jsonify({
            "success": False,
            "message": "Product API request timed out."
        }), 504

    except requests.exceptions.RequestException as e:

        return jsonify({
            "success": False,
            "message": "Unable to connect to product API.",
            "error": str(e)
        }), 502

    # ==========================================
    # 4. CHECK API RESPONSE
    # ==========================================

    if response.status_code != 200:

        return jsonify({
            "success": False,
            "message": "Product API returned an error.",
            "status_code": response.status_code
        }), 502

    try:

        data = response.json()

    except ValueError:

        return jsonify({
            "success": False,
            "message": "Invalid response from product API."
        }), 502

    # ==========================================
    # 5. PRODUCT NOT FOUND IN OPEN FOOD FACTS
    # ==========================================

    if data.get("status") != 1:

        return jsonify({
            "success": True,
            "exists": False,
            "found_in_api": False,
            "message": "Product barcode was not found."
        }), 404

    # ==========================================
    # 6. GET PRODUCT INFORMATION
    # ==========================================

    product = data.get("product", {})

    product_name = product.get("product_name") or ""
    brand = product.get("brands") or ""
    category = product.get("categories") or ""
    unit = product.get("quantity") or ""
    image_url = product.get("image_url") or ""

    # ==========================================
    # 7. RETURN PRODUCT DETAILS
    # ==========================================

    return jsonify({
        "success": True,
        "exists": False,
        "found_in_api": True,
        "message": "Product found. Owner must set the selling price.",

        "product": {
            "barcode": barcode,
            "product_name": product_name,
            "brand": brand,
            "category": category,
            "unit": unit,
            "image_url": image_url,
            "api_source": "Open Food Facts",

            # IMPORTANT:
            # Owner will enter this manually.
            "selling_price": None
        }
    })