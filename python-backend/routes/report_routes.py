from flask import Blueprint, jsonify
from config.database import get_db_connection
from utils.auth import login_required

report_bp = Blueprint("reports", __name__, url_prefix="/api/reports")


@report_bp.route("/summary", methods=["GET"])
@login_required(["admin", "owner", "manager"])
def get_summary():
    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        cursor.execute(
            """
            SELECT
                COALESCE(SUM(total_amount), 0) AS total_sales,
                COUNT(*) AS total_transactions
            FROM sales
            """
        )

        sales_summary = cursor.fetchone()

        cursor.execute(
            """
            SELECT
                COALESCE(SUM(quantity), 0) AS total_items_sold
            FROM sale_items
            """
        )

        items_summary = cursor.fetchone()

        cursor.execute(
            """
            SELECT
                COUNT(*) AS total_products
            FROM products
            WHERE status = 'active'
            """
        )

        products_summary = cursor.fetchone()

        cursor.execute(
            """
            SELECT
                COALESCE(SUM(quantity), 0) AS total_stock
            FROM inventory
            """
        )

        inventory_summary = cursor.fetchone()

        cursor.execute(
            """
            SELECT
                COUNT(*) AS low_stock_items
            FROM inventory
            WHERE quantity <= reorder_level
            """
        )

        low_stock_summary = cursor.fetchone()

        cursor.execute(
            """
            SELECT
                COUNT(*) AS expiring_items
            FROM inventory i
            INNER JOIN batches b
                ON i.batch_id = b.batch_id
            WHERE b.expiry_date IS NOT NULL
            AND b.expiry_date >= CURDATE()
            AND b.expiry_date <= DATE_ADD(CURDATE(), INTERVAL 30 DAY)
            """
        )

        expiring_summary = cursor.fetchone()

        return jsonify({
            "success": True,
            "summary": {
                "total_sales": float(sales_summary["total_sales"]),
                "total_transactions": int(sales_summary["total_transactions"]),
                "total_items_sold": int(items_summary["total_items_sold"]),
                "total_products": int(products_summary["total_products"]),
                "total_stock": int(inventory_summary["total_stock"]),
                "low_stock_items": int(low_stock_summary["low_stock_items"]),
                "expiring_items": int(expiring_summary["expiring_items"])
            }
        }), 200

    except Exception as e:
        print("Report summary error:", repr(e))

        return jsonify({
            "success": False,
            "message": str(e)
        }), 500

    finally:
        if cursor:
            cursor.close()

        if connection:
            connection.close()


@report_bp.route("/top-products", methods=["GET"])
@login_required(["admin", "owner", "manager"])
def get_top_products():
    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        query = """
            SELECT
                p.product_id,
                p.product_name,
                p.barcode,
                SUM(si.quantity) AS total_quantity_sold,
                SUM(si.subtotal) AS total_sales
            FROM sale_items si
            INNER JOIN batches b
                ON si.batch_id = b.batch_id
            INNER JOIN products p
                ON b.product_id = p.product_id
            GROUP BY
                p.product_id,
                p.product_name,
                p.barcode
            ORDER BY
                total_quantity_sold DESC,
                total_sales DESC
            LIMIT 10
        """

        cursor.execute(query)
        products = cursor.fetchall()

        for product in products:
            product["total_quantity_sold"] = int(product["total_quantity_sold"])
            product["total_sales"] = float(product["total_sales"])

        return jsonify({
            "success": True,
            "products": products
        }), 200

    except Exception as e:
        print("Top products report error:", repr(e))

        return jsonify({
            "success": False,
            "message": str(e)
        }), 500

    finally:
        if cursor:
            cursor.close()

        if connection:
            connection.close()


@report_bp.route("/payment-methods", methods=["GET"])
@login_required(["admin", "owner", "manager"])
def get_payment_methods():
    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        query = """
            SELECT
                payment_method,
                COUNT(*) AS transaction_count,
                COALESCE(SUM(total_amount), 0) AS total_sales
            FROM sales
            GROUP BY payment_method
            ORDER BY total_sales DESC
        """

        cursor.execute(query)
        payments = cursor.fetchall()

        for payment in payments:
            payment["transaction_count"] = int(payment["transaction_count"])
            payment["total_sales"] = float(payment["total_sales"])

        return jsonify({
            "success": True,
            "payment_methods": payments
        }), 200

    except Exception as e:
        print("Payment method report error:", repr(e))

        return jsonify({
            "success": False,
            "message": str(e)
        }), 500

    finally:
        if cursor:
            cursor.close()

        if connection:
            connection.close()


@report_bp.route("/recent-sales", methods=["GET"])
@login_required(["admin", "owner", "manager"])
def get_recent_sales():
    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        query = """
            SELECT
                s.sale_id,
                u.full_name,
                s.total_amount,
                s.payment_method,
                s.sale_date
            FROM sales s
            INNER JOIN users u
                ON s.user_id = u.user_id
            ORDER BY s.sale_id DESC
            LIMIT 10
        """

        cursor.execute(query)
        sales = cursor.fetchall()

        for sale in sales:
            sale["total_amount"] = float(sale["total_amount"])

        return jsonify({
            "success": True,
            "sales": sales
        }), 200

    except Exception as e:
        print("Recent sales report error:", repr(e))

        return jsonify({
            "success": False,
            "message": str(e)
        }), 500

    finally:
        if cursor:
            cursor.close()

        if connection:
            connection.close()