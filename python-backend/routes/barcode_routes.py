from flask import Blueprint, jsonify, request
from config.database import get_db_connection
from utils.auth import login_required
import requests

barcode_bp = Blueprint("barcode", __name__)

@barcode_bp.route("/api/barcode/lookup", methods=["GET"])
@login_required(["admin", "owner", "manager", "cashier"])
def lookup_barcode():
    barcode = request.args.get("barcode", "").strip()

    if not barcode:
        return jsonify({
            "success": False,
            "message": "Barcode is required."
        }), 400

    if not barcode.isdigit():
        return jsonify({
            "success": False,
            "message": "Barcode must contain numbers only."
        }), 400

    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        cursor.execute("""
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
        """, (barcode,))

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

    if existing_product:
        return jsonify({
            "success": True,
            "exists": True,
            "found_in_api": False,
            "message": "This product is already in your product list.",
            "product": existing_product
        })

    api_url = (
        f"https://world.openfoodfacts.org/"
        f"api/v3/product/{barcode}"
        f"?product_type=all"
    )

    headers = {
        "User-Agent": "InventorySalesAnalytics/1.0"
    }

    try:
        response = requests.get(
            api_url,
            headers=headers,
            timeout=20
        )

    except requests.exceptions.Timeout:
        return jsonify({
            "success": False,
            "message": "Product API request timed out."
        }), 504

    except requests.exceptions.RequestException as e:
        return jsonify({
            "success": False,
            "message": "Unable to connect to Open Food Facts.",
            "error": str(e)
        }), 502

    if response.status_code == 404:
        return jsonify({
            "success": True,
            "exists": False,
            "found_in_api": False,
            "message": "Product barcode was not found in Open Food Facts.",
            "product": {
                "barcode": barcode,
                "product_name": "",
                "brand": "",
                "category": "",
                "unit": "",
                "image_url": "",
                "api_source": "",
                "selling_price": None
            }
        })

    if response.status_code != 200:
        return jsonify({
            "success": False,
            "message": "Open Food Facts returned an error.",
            "status_code": response.status_code
        }), 502

    try:
        data = response.json()

    except ValueError:
        return jsonify({
            "success": False,
            "message": "Invalid response from Open Food Facts."
        }), 502

    product_data = data.get("product")

    if not product_data:
        return jsonify({
            "success": True,
            "exists": False,
            "found_in_api": False,
            "message": "Product barcode was not found in Open Food Facts.",
            "product": {
                "barcode": barcode,
                "product_name": "",
                "brand": "",
                "category": "",
                "unit": "",
                "image_url": "",
                "api_source": "",
                "selling_price": None
            }
        })

    product_name = (
        product_data.get("product_name")
        or product_data.get("product_name_en")
        or product_data.get("generic_name")
        or ""
    )

    brand = product_data.get("brands") or ""
    category = product_data.get("categories") or ""
    unit = product_data.get("quantity") or ""

    image_url = (
        product_data.get("image_front_url")
        or product_data.get("image_url")
        or product_data.get("image_front_small_url")
        or ""
    )

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
            "selling_price": None
        }
    })