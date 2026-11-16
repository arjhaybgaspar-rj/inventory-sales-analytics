from datetime import date, timedelta
from math import ceil

from flask import Blueprint, jsonify, request, session

from config.database import get_db_connection
from utils.auth import login_required


report_bp = Blueprint(
    "reports",
    __name__,
    url_prefix="/api/reports"
)


# ============================================================
# DATABASE HELPER
# ============================================================

def close_database(cursor=None, connection=None):
    if cursor:
        cursor.close()

    if connection:
        connection.close()


# ============================================================
# DATE FILTER HELPER
# ============================================================

def get_sales_date_filter(alias="s"):
    """Return a parameterized, inclusive date filter for sales queries."""

    start_raw = request.args.get("start_date", "").strip()
    end_raw = request.args.get("end_date", "").strip()

    start_date = None
    end_date = None

    try:
        if start_raw:
            start_date = date.fromisoformat(start_raw)

            if start_date.isoformat() != start_raw:
                raise ValueError

        if end_raw:
            end_date = date.fromisoformat(end_raw)

            if end_date.isoformat() != end_raw:
                raise ValueError

    except ValueError:
        return None, None, "Dates must use YYYY-MM-DD format."

    if start_date and end_date and start_date > end_date:
        return None, None, "Start date must be on or before end date."

    conditions = []
    parameters = []

    if start_date:
        conditions.append(f"{alias}.sale_date >= %s")
        parameters.append(start_date.isoformat())

    if end_date:
        conditions.append(
            f"{alias}.sale_date < DATE_ADD(%s, INTERVAL 1 DAY)"
        )
        parameters.append(end_date.isoformat())

    return " AND ".join(conditions) or "1 = 1", parameters, None


# Original quantities for old batches can sometimes be reconstructed from
# current stock plus recorded sales and losses. Do that only when there are no
# adjustment movements; otherwise an adjustment could make the reconstruction
# inaccurate. Prefer the explicit original quantity or stock-in movements.
BATCH_COST_BASIS_SQL = """
    SELECT
        batch.batch_id,
        COALESCE(
            NULLIF(batch.initial_quantity, 0),
            NULLIF(received.received_quantity, 0),
            CASE
                WHEN COALESCE(adjustments.adjustment_count, 0) = 0 THEN
                    batch.current_quantity
                    + COALESCE(sales.sold_quantity, 0)
                    + COALESCE(losses.loss_quantity, 0)
                ELSE NULL
            END
        ) AS original_quantity
    FROM (
        SELECT
            batch_id,
            quantity AS current_quantity,
            initial_quantity
        FROM batches
    ) batch
    LEFT JOIN (
        SELECT batch_id, SUM(quantity) AS received_quantity
        FROM inventory_movements
        WHERE movement_type = 'IN'
        GROUP BY batch_id
    ) received ON received.batch_id = batch.batch_id
    LEFT JOIN (
        SELECT batch_id, SUM(quantity) AS sold_quantity
        FROM sale_items
        GROUP BY batch_id
    ) sales ON sales.batch_id = batch.batch_id
    LEFT JOIN (
        SELECT batch_id, SUM(quantity) AS loss_quantity
        FROM inventory_losses
        GROUP BY batch_id
    ) losses ON losses.batch_id = batch.batch_id
    LEFT JOIN (
        SELECT batch_id, COUNT(*) AS adjustment_count
        FROM inventory_movements
        WHERE movement_type = 'ADJUSTMENT'
        GROUP BY batch_id
    ) adjustments ON adjustments.batch_id = batch.batch_id
"""


# ============================================================
# GROSS PROFIT REPORT
# ============================================================

@report_bp.route("/gross-profit", methods=["GET"])
@login_required(["admin", "owner", "manager"])
def get_gross_profit_report():
    """Report gross profit using recorded or safely reconstructed batch quantities."""

    date_filter, date_parameters, date_error = get_sales_date_filter("s")

    if date_error:
        return jsonify({
            "success": False,
            "message": date_error
        }), 400

    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        query = f"""
            SELECT
                COALESCE(SUM(si.subtotal), 0) AS sales_revenue,

                COALESCE(SUM(
                    CASE
                        WHEN cost_basis.original_quantity > 0
                            AND b.acquisition_cost IS NOT NULL
                        THEN
                            (b.acquisition_cost / cost_basis.original_quantity)
                            * si.quantity
                        ELSE 0
                    END
                ), 0) AS known_cost_of_goods_sold,

                COALESCE(SUM(
                    CASE
                        WHEN cost_basis.original_quantity IS NULL
                            OR cost_basis.original_quantity <= 0
                            OR b.acquisition_cost IS NULL
                        THEN si.subtotal
                        ELSE 0
                    END
                ), 0) AS revenue_with_unknown_cost,

                SUM(
                    CASE
                        WHEN cost_basis.original_quantity IS NULL
                            OR cost_basis.original_quantity <= 0
                            OR b.acquisition_cost IS NULL
                        THEN 1
                        ELSE 0
                    END
                ) AS sale_lines_with_unknown_cost

            FROM sale_items si

            INNER JOIN sales s
                ON s.sale_id = si.sale_id

            INNER JOIN batches b
                ON b.batch_id = si.batch_id

            INNER JOIN (
                {BATCH_COST_BASIS_SQL}
            ) cost_basis ON cost_basis.batch_id = b.batch_id

            WHERE {date_filter}
        """

        cursor.execute(query, tuple(date_parameters))
        result = cursor.fetchone() or {}

        revenue = float(result.get("sales_revenue") or 0)
        cogs = float(result.get("known_cost_of_goods_sold") or 0)
        unknown_revenue = float(
            result.get("revenue_with_unknown_cost") or 0
        )

        known_revenue = max(revenue - unknown_revenue, 0)

        gross_profit = known_revenue - cogs

        margin = (
            gross_profit / known_revenue * 100
            if known_revenue > 0
            else None
        )

        return jsonify({
            "success": True,
            "sales_revenue": round(revenue, 2),
            "known_cost_of_goods_sold": round(cogs, 2),
            "gross_profit_on_costed_sales": round(gross_profit, 2),
            "gross_margin_percent_on_costed_sales": (
                round(margin, 1) if margin is not None else None
            ),
            "revenue_with_unknown_cost": round(unknown_revenue, 2),
            "sale_lines_with_unknown_cost": int(
                result.get("sale_lines_with_unknown_cost") or 0
            ),
            "message": (
                "Gross profit excludes sales from batches whose cost basis "
                "cannot be recovered from batch, stock-in, or unadjusted stock "
                "history. This report does not include "
                "operating expenses, taxes, discounts outside recorded sale "
                "subtotals, or other overhead."
            )
        }), 200

    except Exception as e:
        print("Gross profit report error:", repr(e))

        return jsonify({
            "success": False,
            "message": "Unable to calculate gross profit."
        }), 500

    finally:
        close_database(cursor, connection)


# ============================================================
# PRODUCT PROFITABILITY REPORT
# ============================================================

@report_bp.route("/product-profitability", methods=["GET"])
@login_required(["admin", "owner", "manager"])
def get_product_profitability_report():
    """Summarize revenue, known cost, and gross profit per product."""

    date_filter, date_parameters, date_error = get_sales_date_filter("s")

    if date_error:
        return jsonify({
            "success": False,
            "message": date_error
        }), 400

    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        query = f"""
            SELECT
                p.product_id,
                p.product_name,
                p.barcode,

                SUM(si.quantity) AS units_sold,

                COALESCE(SUM(si.subtotal), 0) AS sales_revenue,

                COALESCE(SUM(
                    CASE
                        WHEN cost_basis.original_quantity > 0
                            AND b.acquisition_cost IS NOT NULL
                        THEN (
                            b.acquisition_cost / cost_basis.original_quantity
                        ) * si.quantity
                        ELSE 0
                    END
                ), 0) AS known_cost_of_goods_sold,

                COALESCE(SUM(
                    CASE
                        WHEN cost_basis.original_quantity IS NULL
                            OR cost_basis.original_quantity <= 0
                            OR b.acquisition_cost IS NULL
                        THEN si.subtotal
                        ELSE 0
                    END
                ), 0) AS revenue_with_unknown_cost,

                SUM(
                    CASE
                        WHEN cost_basis.original_quantity IS NULL
                            OR cost_basis.original_quantity <= 0
                            OR b.acquisition_cost IS NULL
                        THEN 1
                        ELSE 0
                    END
                ) AS sale_lines_with_unknown_cost

            FROM sale_items si

            INNER JOIN sales s
                ON s.sale_id = si.sale_id

            INNER JOIN batches b
                ON b.batch_id = si.batch_id

            INNER JOIN (
                {BATCH_COST_BASIS_SQL}
            ) cost_basis ON cost_basis.batch_id = b.batch_id

            INNER JOIN products p
                ON p.product_id = b.product_id

            WHERE {date_filter}

            GROUP BY
                p.product_id,
                p.product_name,
                p.barcode

            ORDER BY
                sales_revenue DESC,
                p.product_name ASC
        """

        cursor.execute(query, tuple(date_parameters))
        rows = cursor.fetchall()

        products = []

        for row in rows:
            revenue = float(row["sales_revenue"] or 0)

            unknown_revenue = float(
                row["revenue_with_unknown_cost"] or 0
            )

            unknown_cost_lines = int(
                row["sale_lines_with_unknown_cost"] or 0
            )

            known_revenue = max(revenue - unknown_revenue, 0)

            cogs = float(
                row["known_cost_of_goods_sold"] or 0
            )

            profit = known_revenue - cogs

            products.append({
                "product_id": int(row["product_id"]),
                "product_name": row["product_name"],
                "barcode": row["barcode"],
                "units_sold": int(row["units_sold"] or 0),
                "sales_revenue": round(revenue, 2),
                "known_cost_of_goods_sold": round(cogs, 2),
                "gross_profit_on_costed_sales": round(profit, 2),
                "gross_margin_percent_on_costed_sales": (
                    round(profit / known_revenue * 100, 1)
                    if known_revenue > 0
                    else None
                ),
                "revenue_with_unknown_cost": round(
                    unknown_revenue, 2
                ),
                "sale_lines_with_unknown_cost": unknown_cost_lines,
                "historical_cost_data_incomplete": (
                    unknown_cost_lines > 0
                )
            })

        return jsonify({
            "success": True,
            "products": products,
            "message": (
                "Profit and margin use only sales from batches with "
                "a recorded or safely reconstructed original quantity. "
                "Unknown-cost revenue is shown separately."
            )
        }), 200

    except Exception as e:
        print("Product profitability report error:", repr(e))

        return jsonify({
            "success": False,
            "message": "Unable to calculate product profitability."
        }), 500

    finally:
        close_database(cursor, connection)


# ============================================================
# REPORT SUMMARY
# ============================================================

@report_bp.route("/summary", methods=["GET"])
def get_summary():

    date_filter, date_parameters, date_error = get_sales_date_filter("s")

    if date_error:
        return jsonify({
            "success": False,
            "message": date_error
        }), 400

    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        # Total sales and transactions

        query = f"""
            SELECT
                COALESCE(SUM(s.total_amount), 0) AS total_sales,
                COUNT(*) AS total_transactions
            FROM sales s
            WHERE {date_filter}
        """

        cursor.execute(query, tuple(date_parameters))
        sales_summary = cursor.fetchone() or {}

        # Total items sold

        query = f"""
            SELECT
                COALESCE(SUM(si.quantity), 0) AS total_items_sold
            FROM sale_items si

            INNER JOIN sales s
                ON si.sale_id = s.sale_id

            WHERE {date_filter}
        """

        cursor.execute(query, tuple(date_parameters))
        items_summary = cursor.fetchone() or {}

        # Total active products

        cursor.execute("""
            SELECT
                COUNT(*) AS total_products
            FROM products
            WHERE status = 'active'
        """)

        products_summary = cursor.fetchone() or {}

        # Total inventory stock

        cursor.execute("""
            SELECT
                COALESCE(SUM(quantity), 0) AS total_stock
            FROM inventory
        """)

        inventory_summary = cursor.fetchone() or {}

        # Low-stock products, using the same combined stock level as alerts.

        cursor.execute("""
            SELECT
                COUNT(*) AS low_stock_items
            FROM (
                SELECT
                    p.product_id,
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
                    COALESCE(MAX(i.reorder_level), 0) AS reorder_level
                FROM products p
                LEFT JOIN batches b
                    ON b.product_id = p.product_id
                LEFT JOIN inventory i
                    ON i.batch_id = b.batch_id
                WHERE p.status = 'active'
                GROUP BY p.product_id
                HAVING COUNT(i.inventory_id) > 0
                    AND total_usable_stock <= reorder_level
            ) low_stock_products
        """)

        low_stock_summary = cursor.fetchone() or {}

        # Expiring items within 30 days

        cursor.execute("""
            SELECT
                COUNT(DISTINCT p.product_id) AS expiring_items
            FROM inventory i

            INNER JOIN batches b
                ON i.batch_id = b.batch_id
            INNER JOIN products p
                ON b.product_id = p.product_id

            WHERE b.expiry_date IS NOT NULL
                AND b.expiry_date >= CURDATE()
                AND b.expiry_date <= DATE_ADD(
                    CURDATE(),
                    INTERVAL 30 DAY
                )
        """)

        expiring_summary = cursor.fetchone() or {}

        return jsonify({
            "success": True,
            "summary": {
                "total_sales": float(
                    sales_summary.get("total_sales") or 0
                ),
                "total_transactions": int(
                    sales_summary.get("total_transactions") or 0
                ),
                "total_items_sold": int(
                    items_summary.get("total_items_sold") or 0
                ),
                "total_products": int(
                    products_summary.get("total_products") or 0
                ),
                "total_stock": int(
                    inventory_summary.get("total_stock") or 0
                ),
                "low_stock_items": int(
                    low_stock_summary.get("low_stock_items") or 0
                ),
                "expiring_items": int(
                    expiring_summary.get("expiring_items") or 0
                )
            }
        }), 200

    except Exception as e:
        print("Report summary error:", repr(e))

        return jsonify({
            "success": False,
            "message": str(e)
        }), 500

    finally:
        close_database(cursor, connection)


# ============================================================
# TOP-SELLING PRODUCTS
# ============================================================

@report_bp.route("/top-products", methods=["GET"])
def get_top_products():

    date_filter, date_parameters, date_error = get_sales_date_filter("s")

    if date_error:
        return jsonify({
            "success": False,
            "message": date_error
        }), 400

    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        query = f"""
            SELECT
                p.product_id,
                p.product_name,
                p.barcode,

                SUM(si.quantity) AS total_quantity_sold,
                SUM(si.subtotal) AS total_sales

            FROM sale_items si

            INNER JOIN sales s
                ON si.sale_id = s.sale_id

            INNER JOIN batches b
                ON si.batch_id = b.batch_id

            INNER JOIN products p
                ON b.product_id = p.product_id

            WHERE {date_filter}

            GROUP BY
                p.product_id,
                p.product_name,
                p.barcode

            ORDER BY
                total_quantity_sold DESC,
                total_sales DESC

            LIMIT 10
        """

        cursor.execute(query, tuple(date_parameters))
        products = cursor.fetchall()

        for product in products:
            product["total_quantity_sold"] = int(
                product["total_quantity_sold"] or 0
            )

            product["total_sales"] = float(
                product["total_sales"] or 0
            )

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
        close_database(cursor, connection)


# ============================================================
# LEAST-SELLING PRODUCTS
# ============================================================

@report_bp.route("/least-products", methods=["GET"])
@login_required(["admin", "owner", "manager"])
def get_least_selling_products():
    """Return active products with the fewest sales in the selected period."""

    date_filter, date_parameters, date_error = get_sales_date_filter("s")

    if date_error:
        return jsonify({
            "success": False,
            "message": date_error
        }), 400

    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        query = f"""
            SELECT
                p.product_id,
                p.product_name,
                p.barcode,

                COALESCE(
                    SUM(
                        CASE
                            WHEN s.sale_id IS NOT NULL
                            THEN si.quantity
                            ELSE 0
                        END
                    ),
                    0
                ) AS total_quantity_sold,

                COALESCE(
                    SUM(
                        CASE
                            WHEN s.sale_id IS NOT NULL
                            THEN si.subtotal
                            ELSE 0
                        END
                    ),
                    0
                ) AS total_sales,

                COUNT(
                    DISTINCT CASE
                        WHEN s.sale_id IS NOT NULL
                        THEN DATE(s.sale_date)
                        ELSE NULL
                    END
                ) AS sales_days,

                MAX(s.sale_date) AS last_sold_date

            FROM products p

            LEFT JOIN batches b
                ON b.product_id = p.product_id

            LEFT JOIN sale_items si
                ON si.batch_id = b.batch_id

            LEFT JOIN sales s
                ON s.sale_id = si.sale_id
                AND {date_filter}

            WHERE p.status = 'active'

            GROUP BY
                p.product_id,
                p.product_name,
                p.barcode

            ORDER BY
                total_quantity_sold ASC,
                total_sales ASC,
                p.product_name ASC

            LIMIT 10
        """

        cursor.execute(query, tuple(date_parameters))
        products = cursor.fetchall()

        for product in products:
            product["total_quantity_sold"] = int(
                product["total_quantity_sold"] or 0
            )

            product["total_sales"] = float(
                product["total_sales"] or 0
            )

            product["sales_days"] = int(
                product["sales_days"] or 0
            )

        return jsonify({
            "success": True,
            "products": products,
            "message": (
                "Products are ranked from fewest units sold to most units "
                "sold within the selected date range. Products with no "
                "sales in the period are included."
            )
        }), 200

    except Exception as e:
        print("Least-selling products report error:", repr(e))

        return jsonify({
            "success": False,
            "message": str(e)
        }), 500

    finally:
        close_database(cursor, connection)


# ============================================================
# PAYMENT METHODS REPORT
# ============================================================

@report_bp.route("/payment-methods", methods=["GET"])
@login_required(["admin", "owner", "manager"])
def get_payment_methods():

    date_filter, date_parameters, date_error = get_sales_date_filter("s")

    if date_error:
        return jsonify({
            "success": False,
            "message": date_error
        }), 400

    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        query = f"""
            SELECT
                s.payment_method,
                COUNT(*) AS transaction_count,
                COALESCE(SUM(s.total_amount), 0) AS total_sales

            FROM sales s

            WHERE {date_filter}

            GROUP BY s.payment_method

            ORDER BY total_sales DESC
        """

        cursor.execute(query, tuple(date_parameters))
        payments = cursor.fetchall()

        for payment in payments:
            payment["transaction_count"] = int(
                payment["transaction_count"] or 0
            )

            payment["total_sales"] = float(
                payment["total_sales"] or 0
            )

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
        close_database(cursor, connection)


# ============================================================
# RECENT SALES
# ============================================================

@report_bp.route("/recent-sales", methods=["GET"])
def get_recent_sales():

    date_filter, date_parameters, date_error = get_sales_date_filter("s")

    if date_error:
        return jsonify({
            "success": False,
            "message": date_error
        }), 400

    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        query = f"""
            SELECT
                s.sale_id,
                s.user_id,
                u.full_name,
                s.total_amount,
                s.payment_method,
                s.sale_date

            FROM sales s

            LEFT JOIN users u
                ON s.user_id = u.user_id

            WHERE {date_filter}

            ORDER BY s.sale_id DESC

            LIMIT 10
        """

        cursor.execute(query, tuple(date_parameters))
        sales = cursor.fetchall()

        for sale in sales:
            sale["total_amount"] = float(
                sale["total_amount"] or 0
            )

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
        close_database(cursor, connection)


# ============================================================
# INDIVIDUAL SALE DETAILS
# ============================================================

@report_bp.route("/sales/<int:sale_id>", methods=["GET"])
def get_sale_details(sale_id):

    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        cursor.execute("""
            SELECT
                s.sale_id,
                s.user_id,
                u.full_name,
                s.total_amount,
                s.payment_method,
                s.sale_date

            FROM sales s

            LEFT JOIN users u
                ON s.user_id = u.user_id

            WHERE s.sale_id = %s

            LIMIT 1
        """, (sale_id,))

        sale = cursor.fetchone()

        if not sale:
            return jsonify({
                "success": False,
                "message": "Transaction not found."
            }), 404

        cursor.execute("""
            SELECT
                si.sale_item_id,
                p.product_id,
                p.product_name,
                p.barcode,
                si.batch_id,
                si.quantity,
                si.unit_price,
                si.subtotal

            FROM sale_items si

            INNER JOIN batches b
                ON si.batch_id = b.batch_id

            INNER JOIN products p
                ON b.product_id = p.product_id

            WHERE si.sale_id = %s

            ORDER BY si.sale_item_id ASC
        """, (sale_id,))

        items = cursor.fetchall()

        sale["total_amount"] = float(
            sale["total_amount"] or 0
        )

        for item in items:
            item["quantity"] = int(
                item["quantity"] or 0
            )

            item["unit_price"] = float(
                item["unit_price"] or 0
            )

            item["subtotal"] = float(
                item["subtotal"] or 0
            )

            if item["product_id"] is not None:
                item["product_id"] = int(
                    item["product_id"]
                )

            if item["sale_item_id"] is not None:
                item["sale_item_id"] = int(
                    item["sale_item_id"]
                )

            if item["batch_id"] is not None:
                item["batch_id"] = int(
                    item["batch_id"]
                )

        return jsonify({
            "success": True,
            "sale": sale,
            "items": items
        }), 200

    except Exception as e:
        print("Sale details report error:", repr(e))

        return jsonify({
            "success": False,
            "message": str(e)
        }), 500

    finally:
        close_database(cursor, connection)


# ============================================================
# 7-DAY SALES FORECAST
# ============================================================

@report_bp.route("/sales-forecast", methods=["GET"])
@login_required(["admin", "owner", "manager"])
def get_sales_forecast():
    """Build a short-term daily revenue forecast from complete calendar data."""

    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        cursor.execute("SELECT CURDATE() AS today")
        today = cursor.fetchone()["today"]

        # Retrieve the last 30 completed calendar days.

        cursor.execute("""
            SELECT
                DATE(sale_date) AS sale_day,
                COALESCE(SUM(total_amount), 0) AS daily_revenue

            FROM sales

            WHERE sale_date >= DATE_SUB(
                CURDATE(),
                INTERVAL 30 DAY
            )
                AND sale_date < CURDATE()

            GROUP BY DATE(sale_date)

            ORDER BY sale_day ASC
        """)

        rows = cursor.fetchall()

        revenue_by_day = {
            row["sale_day"].isoformat(): float(
                row["daily_revenue"] or 0
            )
            for row in rows
        }

        history_start = today - timedelta(days=30)
        history = []

        for offset in range(30):
            day = history_start + timedelta(days=offset)
            day_key = day.isoformat()

            history.append({
                "date": day_key,
                "revenue": round(
                    revenue_by_day.get(day_key, 0), 2
                )
            })

        recorded_sales_days = sum(
            1
            for revenue in revenue_by_day.values()
            if revenue > 0
        )

        actual = history[-14:]

        # Backtest the trailing seven-day average.

        validation_errors = []

        for target_index in range(23, 30):

            trailing_window = history[
                target_index - 7:target_index
            ]

            predicted = sum(
                day["revenue"]
                for day in trailing_window
            ) / 7

            observed = history[target_index]["revenue"]

            validation_errors.append({
                "absolute_error": abs(observed - predicted),
                "observed": observed,
                "predicted": predicted
            })

        backtest_mae = (
            sum(
                item["absolute_error"]
                for item in validation_errors
            ) / len(validation_errors)
        )

        nonzero_validation = [
            item
            for item in validation_errors
            if item["observed"] > 0
        ]

        backtest_mape = None

        if nonzero_validation:
            backtest_mape = sum(
                abs(
                    item["observed"] - item["predicted"]
                ) / item["observed"]
                for item in nonzero_validation
            ) / len(nonzero_validation) * 100

        sufficient_history = recorded_sales_days >= 14

        data_support = (
            "moderate"
            if recorded_sales_days >= 25
            else "limited"
            if sufficient_history
            else "low"
        )

        forecast = []
        forecast_daily_average = None

        if sufficient_history:

            forecast_daily_average = sum(
                day["revenue"]
                for day in history[-7:]
            ) / 7

            for offset in range(1, 8):

                forecast_day = today + timedelta(days=offset)

                forecast.append({
                    "date": forecast_day.isoformat(),
                    "revenue": round(
                        forecast_daily_average, 2
                    )
                })

        return jsonify({
            "success": True,
            "model": "7-day trailing average",
            "history_days": 30,
            "recorded_sales_days": recorded_sales_days,
            "data_support": data_support,
            "forecast_available": sufficient_history,
            "actual": actual,
            "forecast": forecast,
            "forecast_daily_average": (
                round(forecast_daily_average, 2)
                if forecast_daily_average is not None
                else None
            ),
            "backtest": {
                "evaluation_days": len(validation_errors),
                "mean_absolute_error": round(backtest_mae, 2),
                "mean_absolute_percentage_error": (
                    round(backtest_mape, 1)
                    if backtest_mape is not None
                    else None
                ),
                "note": (
                    "Backtest compares trailing seven-day estimates "
                    "with the latest seven observed days. Percentage "
                    "error excludes days with zero revenue."
                )
            },
            "message": (
                "Forecast uses the previous seven completed calendar "
                "days and assumes recent revenue remains similar. It is "
                "unavailable until at least 14 distinct days with sales "
                "exist in the 30-day history."
            )
        }), 200

    except Exception as e:
        print("Sales forecast error:", repr(e))

        return jsonify({
            "success": False,
            "message": "Unable to calculate sales forecast."
        }), 500

    finally:
        close_database(cursor, connection)


# ============================================================
# 30-DAY MONTHLY SALES FORECAST
# ============================================================

@report_bp.route("/monthly-sales-forecast", methods=["GET"])
@login_required(["admin", "owner", "manager"])
def get_monthly_sales_forecast():
    """Forecast the next 30 days using weekday patterns and a 30-day backtest."""

    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        cursor.execute("SELECT CURDATE() AS today")
        today = cursor.fetchone()["today"]

        # Retrieve the last 90 completed days.

        cursor.execute("""
            SELECT
                DATE(sale_date) AS sale_day,
                COALESCE(SUM(total_amount), 0) AS daily_revenue

            FROM sales

            WHERE sale_date >= DATE_SUB(
                CURDATE(),
                INTERVAL 90 DAY
            )
                AND sale_date < CURDATE()

            GROUP BY DATE(sale_date)

            ORDER BY sale_day ASC
        """)

        rows = cursor.fetchall()

        revenue_by_day = {
            row["sale_day"].isoformat(): float(
                row["daily_revenue"] or 0
            )
            for row in rows
        }

        history_start = today - timedelta(days=90)

        history = []

        for offset in range(90):

            day = history_start + timedelta(days=offset)

            history.append({
                "date": day.isoformat(),
                "weekday": day.weekday(),
                "revenue": round(
                    revenue_by_day.get(day.isoformat(), 0), 2
                )
            })

        # Group historical revenue by weekday.

        weekday_samples = {
            weekday: []
            for weekday in range(7)
        }

        for day in history:
            weekday_samples[day["weekday"]].append(
                day["revenue"]
            )

        sales_days = sum(
            1
            for day in history
            if day["revenue"] > 0
        )

        valid_weekdays = all(
            sum(1 for value in values if value > 0) >= 3
            for values in weekday_samples.values()
        )

        forecast_available = (
            sales_days >= 28 and valid_weekdays
        )

        # Rolling-origin backtest.

        errors = []

        for target_index in range(60, 90):

            training = history[
                target_index - 56:target_index
            ]

            same_weekday = [
                day["revenue"]
                for day in training
                if day["weekday"] == history[target_index]["weekday"]
            ]

            predicted = (
                sum(same_weekday) / len(same_weekday)
                if same_weekday
                else 0
            )

            observed = history[target_index]["revenue"]

            baseline_predicted = history[
                target_index - 7
            ]["revenue"]

            errors.append({
                "predicted": predicted,
                "baseline_predicted": baseline_predicted,
                "observed": observed
            })

        model_absolute_error = sum(
            abs(
                item["observed"] - item["predicted"]
            )
            for item in errors
        )

        baseline_absolute_error = sum(
            abs(
                item["observed"] - item["baseline_predicted"]
            )
            for item in errors
        )

        mae = model_absolute_error / len(errors)

        actual_total = sum(
            item["observed"]
            for item in errors
        )

        wape = (
            model_absolute_error / actual_total * 100
            if actual_total > 0
            else None
        )

        baseline_wape = (
            baseline_absolute_error / actual_total * 100
            if actual_total > 0
            else None
        )

        if wape is None or baseline_wape is None:
            forecast_comparison = "not_comparable"

        elif wape < baseline_wape:
            forecast_comparison = "lower_error_than_baseline"

        elif wape > baseline_wape:
            forecast_comparison = "higher_error_than_baseline"

        else:
            forecast_comparison = "same_error_as_baseline"

        # Calculate weekday averages.

        weekday_average = {
            weekday: sum(values) / len(values)
            for weekday, values in weekday_samples.items()
            if values
        }

        forecast = []

        if forecast_available:

            for offset in range(1, 31):

                forecast_day = today + timedelta(days=offset)

                forecast.append({
                    "date": forecast_day.isoformat(),
                    "revenue": round(
                        weekday_average.get(
                            forecast_day.weekday(), 0
                        ),
                        2
                    )
                })

        support = (
            "strong"
            if sales_days >= 63
            else "moderate"
            if sales_days >= 42
            else "limited"
        )

        return jsonify({
            "success": True,
            "model": "90-day weekday average",
            "forecast_horizon_days": 30,
            "history_days": 90,
            "recorded_sales_days": sales_days,
            "data_support": support,
            "forecast_available": forecast_available,
            "actual": history[-30:],
            "forecast": forecast,
            "projected_30_day_revenue": (
                round(
                    sum(item["revenue"] for item in forecast),
                    2
                )
                if forecast_available
                else None
            ),
            "backtest": {
                "evaluation_days": len(errors),
                "mean_absolute_error": round(mae, 2),
                "weighted_absolute_percentage_error": (
                    round(wape, 1)
                    if wape is not None
                    else None
                ),
                "baseline_name": (
                    "Previous week's same weekday revenue"
                ),
                "baseline_weighted_absolute_percentage_error": (
                    round(baseline_wape, 1)
                    if baseline_wape is not None
                    else None
                ),
                "model_vs_baseline": forecast_comparison,
                "note": (
                    "The 90-day weekday model and the previous-week "
                    "same-weekday baseline are evaluated over the same "
                    "latest 30 historical days. WAPE is unavailable "
                    "when total actual revenue is zero."
                )
            },
            "message": (
                "Forecast uses average revenue for the matching weekday "
                "over the last 90 complete days. Its backtest is compared "
                "with the previous week's same-weekday revenue. It requires "
                "at least 28 sales days and at least 3 sales days for each "
                "weekday."
                if forecast_available
                else
                "Not enough history for a reliable 30-day forecast. "
                "Record at least 28 sales days, including at least "
                "3 sales days for each weekday."
            )
        }), 200

    except Exception as e:
        print("Monthly sales forecast error:", repr(e))

        return jsonify({
            "success": False,
            "message": "Unable to calculate monthly sales forecast."
        }), 500

    finally:
        close_database(cursor, connection)


# ============================================================
# PRODUCT DEMAND FORECAST
# ============================================================

@report_bp.route("/product-demand-forecast", methods=["GET"])
@login_required(["admin", "owner", "manager"])
def get_product_demand_forecast():
    """Estimate each active product's next-30-day demand and stockout risk."""

    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        cursor.execute("SELECT CURDATE() AS today")
        today = cursor.fetchone()["today"]

        # Retrieve product sales for the last 120 completed days.

        cursor.execute("""
            SELECT
                b.product_id,
                DATE(s.sale_date) AS sale_day,
                SUM(si.quantity) AS units

            FROM sale_items si

            INNER JOIN sales s
                ON s.sale_id = si.sale_id

            INNER JOIN batches b
                ON b.batch_id = si.batch_id

            WHERE s.sale_date >= DATE_SUB(
                CURDATE(),
                INTERVAL 120 DAY
            )
                AND s.sale_date < CURDATE()

            GROUP BY
                b.product_id,
                DATE(s.sale_date)
        """)

        daily_sales = cursor.fetchall()

        units_by_product_day = {}

        for row in daily_sales:

            units_by_product_day.setdefault(
                int(row["product_id"]), {}
            )[row["sale_day"].isoformat()] = int(
                row["units"] or 0
            )

        # Retrieve active products and available inventory.

        cursor.execute("""
            SELECT
                p.product_id,
                p.product_name,
                p.barcode,

                COALESCE(
                    stock.available_stock,
                    0
                ) AS available_stock,

                COALESCE(
                    stock.reorder_level,
                    0
                ) AS reorder_level,

                COALESCE(
                    replenishment.lead_time_days,
                    7
                ) AS lead_time_days

            FROM products p

            LEFT JOIN (
                SELECT
                    b.product_id,

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
                    ) AS available_stock,

                    COALESCE(
                        MAX(i.reorder_level),
                        0
                    ) AS reorder_level

                FROM batches b

                LEFT JOIN inventory i
                    ON i.batch_id = b.batch_id

                GROUP BY b.product_id

            ) stock
                ON stock.product_id = p.product_id

            LEFT JOIN product_replenishment_settings replenishment
                ON replenishment.product_id = p.product_id

            WHERE p.status = 'active'

            ORDER BY p.product_name ASC
        """)

        products = cursor.fetchall()

        history_start = today - timedelta(days=120)

        forecasts = []

        for product in products:

            product_id = int(product["product_id"])

            by_day = units_by_product_day.get(
                product_id, {}
            )

            daily = []

            for offset in range(120):

                day = history_start + timedelta(days=offset)

                daily.append(
                    by_day.get(day.isoformat(), 0)
                )

            # Last 90 completed days for the forecast.

            training = daily[30:120]

            # First 90 days for backtesting.

            backtest_training = daily[:90]
            backtest_actual = daily[90:120]

            sale_days = sum(
                1 for value in training if value > 0
            )

            stock = max(
                int(product["available_stock"] or 0),
                0
            )

            reorder_level = max(
                int(product["reorder_level"] or 0),
                0
            )

            lead_time_days = max(
                1,
                min(
                    int(product["lead_time_days"] or 7),
                    365
                )
            )

            available = sale_days >= 14

            projected = (
                sum(training) / 90 * 30
                if available
                else None
            )

            # Suggested replenishment quantity.

            suggested_restock = (
                max(
                    0,
                    ceil(
                        (
                            projected / 30 * lead_time_days
                        )
                        + reorder_level
                        - stock
                    )
                )
                if projected is not None
                else None
            )

            daily_demand = (
                projected / 30
                if projected is not None
                else None
            )

            stockout_days = (
                stock / daily_demand
                if daily_demand and daily_demand > 0
                else None
            )

            # Backtesting.

            backtest_sale_days = sum(
                1
                for value in backtest_training
                if value > 0
            )

            backtest_actual_units = sum(
                backtest_actual
            )

            backtest_predicted_units = (
                sum(backtest_training) / 90 * 30
                if backtest_sale_days >= 14
                else None
            )

            baseline_predicted_units = sum(
                backtest_training[60:90]
            )

            wape = (
                abs(
                    backtest_actual_units
                    - backtest_predicted_units
                )
                / backtest_actual_units * 100
                if (
                    backtest_predicted_units is not None
                    and backtest_actual_units > 0
                )
                else None
            )

            baseline_wape = (
                abs(
                    backtest_actual_units
                    - baseline_predicted_units
                )
                / backtest_actual_units * 100
                if backtest_actual_units > 0
                else None
            )

            if wape is None or baseline_wape is None:
                forecast_comparison = "not_comparable"

            elif wape < baseline_wape:
                forecast_comparison = "lower_error_than_baseline"

            elif wape > baseline_wape:
                forecast_comparison = "higher_error_than_baseline"

            else:
                forecast_comparison = "same_error_as_baseline"

            forecast_skill_percent = (
                (
                    (baseline_wape - wape)
                    / baseline_wape
                ) * 100
                if (
                    wape is not None
                    and baseline_wape is not None
                    and baseline_wape > 0
                )
                else None
            )

            support = (
                "strong"
                if sale_days >= 45
                else "moderate"
                if sale_days >= 28
                else "limited"
            )

            forecasts.append({
                "product_id": product_id,
                "product_name": product["product_name"],
                "barcode": product["barcode"],

                "available_stock": stock,
                "reorder_level": reorder_level,
                "supplier_lead_time_days": lead_time_days,

                "sales_days_last_90_days": sale_days,

                "forecast_available": available,

                "projected_units_next_30_days": (
                    round(projected, 1)
                    if projected is not None
                    else None
                ),

                "suggested_restock_quantity": suggested_restock,

                "estimated_days_until_stockout": (
                    round(stockout_days, 1)
                    if stockout_days is not None
                    else None
                ),

                "stockout_risk": (
                    "likely_within_30_days"
                    if (
                        stockout_days is not None
                        and stockout_days <= 30
                    )
                    else "not_indicated"
                    if available
                    else "insufficient_history"
                ),

                "data_support": (
                    support if available else "low"
                ),

                "backtest": {
                    "training_days": 90,
                    "evaluation_days": 30,

                    "predicted_units": (
                        round(backtest_predicted_units, 1)
                        if backtest_predicted_units is not None
                        else None
                    ),

                    "actual_units": backtest_actual_units,

                    "absolute_error_units": (
                        round(
                            abs(
                                backtest_actual_units
                                - backtest_predicted_units
                            ),
                            1
                        )
                        if backtest_predicted_units is not None
                        else None
                    ),

                    "wape_percent": (
                        round(wape, 1)
                        if wape is not None
                        else None
                    ),

                    "baseline_name": "Previous 30-day total",

                    "baseline_predicted_units": (
                        baseline_predicted_units
                    ),

                    "baseline_wape_percent": (
                        round(baseline_wape, 1)
                        if baseline_wape is not None
                        else None
                    ),

                    "comparison": forecast_comparison,

                    "skill_percent_vs_baseline": (
                        round(forecast_skill_percent, 1)
                        if forecast_skill_percent is not None
                        else None
                    )
                },

                "forecast_comparison": forecast_comparison
            })

        return jsonify({
            "success": True,
            "history_days": 90,
            "forecast_horizon_days": 30,
            "model": "90-day average daily product demand",
            "products": forecasts,
            "message": (
                "Forecasts use each product's average daily units over "
                "the last 90 complete days. The backtest compares this "
                "model with a baseline that repeats the previous 30-day "
                "unit total. A product forecast requires at least 14 "
                "distinct sales days. Suggested restock quantity covers "
                "expected demand during the configured supplier lead "
                "time plus the existing reorder level."
            )
        }), 200

    except Exception as e:
        print("Product demand forecast error:", repr(e))

        return jsonify({
            "success": False,
            "message": "Unable to calculate product demand forecasts."
        }), 500

    finally:
        close_database(cursor, connection)


# ============================================================
# UPDATE PRODUCT SUPPLIER LEAD TIME
# ============================================================

@report_bp.route(
    "/product-demand-forecast/lead-time",
    methods=["PUT"]
)
@login_required(["admin", "owner", "manager"])
def update_product_supplier_lead_time():

    data = request.get_json(silent=True) or {}

    try:
        product_id = int(data.get("product_id"))
        lead_time_days = int(data.get("lead_time_days"))

        if (
            isinstance(data.get("product_id"), bool)
            or isinstance(data.get("lead_time_days"), bool)
        ):
            raise ValueError

        if product_id <= 0 or not 1 <= lead_time_days <= 365:
            raise ValueError

    except (TypeError, ValueError):

        return jsonify({
            "success": False,
            "message": (
                "Choose a product and enter a lead time "
                "from 1 to 365 days."
            )
        }), 400

    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        cursor.execute(
            """
            SELECT
                p.product_name,

                COALESCE(
                    settings.lead_time_days,
                    7
                ) AS lead_time_days

            FROM products p

            LEFT JOIN product_replenishment_settings settings
                ON settings.product_id = p.product_id

            WHERE p.product_id = %s
                AND p.status = 'active'

            LIMIT 1
            """,
            (product_id,)
        )

        product = cursor.fetchone()

        if not product:
            connection.rollback()

            return jsonify({
                "success": False,
                "message": "Active product not found."
            }), 404

        previous_days = int(product[1])

        cursor.execute(
            """
            INSERT INTO product_replenishment_settings
                (product_id, lead_time_days, updated_by)

            VALUES (%s, %s, %s)

            ON DUPLICATE KEY UPDATE
                lead_time_days = VALUES(lead_time_days),
                updated_by = VALUES(updated_by)
            """,
            (
                product_id,
                lead_time_days,
                session.get("user_id")
            )
        )

        if previous_days != lead_time_days:

            cursor.execute(
                """
                INSERT INTO activity_logs
                    (user_id, action, description)

                VALUES (%s, %s, %s)
                """,
                (
                    session.get("user_id"),
                    "UPDATE_SUPPLIER_LEAD_TIME",
                    (
                        f"Updated supplier lead time for {product[0]} "
                        f"(product ID {product_id}) from "
                        f"{previous_days} to {lead_time_days} days."
                    )
                )
            )

        connection.commit()

        return jsonify({
            "success": True,
            "message": "Supplier lead time saved."
        }), 200

    except Exception as e:

        if connection:
            connection.rollback()

        print("Supplier lead-time update error:", repr(e))

        return jsonify({
            "success": False,
            "message": "Unable to save supplier lead time."
        }), 500

    finally:
        close_database(cursor, connection)


# ============================================================
# INVENTORY RISK ANALYSIS
# ============================================================

@report_bp.route("/inventory-risk", methods=["GET"])
@login_required(["admin", "owner", "manager"])
def get_inventory_risk():
    """Estimate stockout timing and flag products with falling sales."""

    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        cursor.execute("SELECT CURDATE() AS today")
        today = cursor.fetchone()["today"]

        # Retrieve product stock and sales information.

        cursor.execute("""
            SELECT
                p.product_id,
                p.product_name,
                p.barcode,

                COALESCE(
                    stock.available_stock,
                    0
                ) AS available_stock,

                COALESCE(
                    sales.recent_units,
                    0
                ) AS recent_units,

                COALESCE(
                    sales.recent_revenue,
                    0
                ) AS recent_revenue,

                COALESCE(
                    sales.recent_sales_days,
                    0
                ) AS recent_sales_days,

                COALESCE(
                    sales.previous_units,
                    0
                ) AS previous_units,

                COALESCE(
                    sales.previous_revenue,
                    0
                ) AS previous_revenue,

                COALESCE(
                    sales.previous_sales_days,
                    0
                ) AS previous_sales_days

            FROM products p

            LEFT JOIN (
                SELECT
                    b.product_id,

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
                    ) AS available_stock

                FROM batches b

                LEFT JOIN inventory i
                    ON i.batch_id = b.batch_id

                GROUP BY b.product_id

            ) stock
                ON stock.product_id = p.product_id

            LEFT JOIN (
                SELECT
                    b.product_id,

                    SUM(
                        CASE
                            WHEN s.sale_date >= DATE_SUB(
                                CURDATE(),
                                INTERVAL 29 DAY
                            )
                                AND s.sale_date < DATE_ADD(
                                    CURDATE(),
                                    INTERVAL 1 DAY
                                )
                            THEN si.quantity
                            ELSE 0
                        END
                    ) AS recent_units,

                    SUM(
                        CASE
                            WHEN s.sale_date >= DATE_SUB(
                                CURDATE(),
                                INTERVAL 29 DAY
                            )
                                AND s.sale_date < DATE_ADD(
                                    CURDATE(),
                                    INTERVAL 1 DAY
                                )
                            THEN si.subtotal
                            ELSE 0
                        END
                    ) AS recent_revenue,

                    COUNT(
                        DISTINCT CASE
                            WHEN s.sale_date >= DATE_SUB(
                                CURDATE(),
                                INTERVAL 29 DAY
                            )
                                AND s.sale_date < DATE_ADD(
                                    CURDATE(),
                                    INTERVAL 1 DAY
                                )
                            THEN DATE(s.sale_date)
                            ELSE NULL
                        END
                    ) AS recent_sales_days,

                    SUM(
                        CASE
                            WHEN s.sale_date >= DATE_SUB(
                                CURDATE(),
                                INTERVAL 59 DAY
                            )
                                AND s.sale_date < DATE_SUB(
                                    CURDATE(),
                                    INTERVAL 29 DAY
                                )
                            THEN si.quantity
                            ELSE 0
                        END
                    ) AS previous_units,

                    SUM(
                        CASE
                            WHEN s.sale_date >= DATE_SUB(
                                CURDATE(),
                                INTERVAL 59 DAY
                            )
                                AND s.sale_date < DATE_SUB(
                                    CURDATE(),
                                    INTERVAL 29 DAY
                                )
                            THEN si.subtotal
                            ELSE 0
                        END
                    ) AS previous_revenue,

                    COUNT(
                        DISTINCT CASE
                            WHEN s.sale_date >= DATE_SUB(
                                CURDATE(),
                                INTERVAL 59 DAY
                            )
                                AND s.sale_date < DATE_SUB(
                                    CURDATE(),
                                    INTERVAL 29 DAY
                                )
                            THEN DATE(s.sale_date)
                            ELSE NULL
                        END
                    ) AS previous_sales_days

                FROM sale_items si

                INNER JOIN sales s
                    ON s.sale_id = si.sale_id

                INNER JOIN batches b
                    ON b.batch_id = si.batch_id

                WHERE s.sale_date >= DATE_SUB(
                    CURDATE(),
                    INTERVAL 59 DAY
                )
                    AND s.sale_date < DATE_ADD(
                        CURDATE(),
                        INTERVAL 1 DAY
                    )

                GROUP BY b.product_id

            ) sales
                ON sales.product_id = p.product_id

            WHERE p.status = 'active'

            ORDER BY p.product_name ASC
        """)

        rows = cursor.fetchall()

        # Retrieve overall revenue trends.

        cursor.execute("""
            SELECT
                COALESCE(
                    SUM(
                        CASE
                            WHEN sale_date >= DATE_SUB(
                                CURDATE(),
                                INTERVAL 29 DAY
                            )
                            THEN total_amount
                            ELSE 0
                        END
                    ),
                    0
                ) AS recent_revenue,

                COALESCE(
                    SUM(
                        CASE
                            WHEN sale_date < DATE_SUB(
                                CURDATE(),
                                INTERVAL 29 DAY
                            )
                            THEN total_amount
                            ELSE 0
                        END
                    ),
                    0
                ) AS previous_revenue

            FROM sales

            WHERE sale_date >= DATE_SUB(
                CURDATE(),
                INTERVAL 59 DAY
            )
                AND sale_date < DATE_ADD(
                    CURDATE(),
                    INTERVAL 1 DAY
                )
        """)

        revenue_row = cursor.fetchone() or {}

        recent_revenue = float(
            revenue_row["recent_revenue"] or 0
        )

        previous_revenue = float(
            revenue_row["previous_revenue"] or 0
        )

        # Determine overall revenue trend.

        if previous_revenue > 0:

            revenue_change_percent = (
                (
                    recent_revenue - previous_revenue
                ) / previous_revenue
            ) * 100

            if revenue_change_percent <= -10:
                revenue_status = "declining"

            elif revenue_change_percent >= 10:
                revenue_status = "increasing"

            else:
                revenue_status = "stable"

        else:

            revenue_change_percent = None

            revenue_status = (
                "insufficient_data"
                if recent_revenue <= 0
                else "new_activity"
            )

        revenue_trend = {
            "recent_30_day_revenue": round(
                recent_revenue, 2
            ),

            "previous_30_day_revenue": round(
                previous_revenue, 2
            ),

            "change_percent": (
                round(revenue_change_percent, 1)
                if revenue_change_percent is not None
                else None
            ),

            "status": revenue_status
        }

        # Initialize risk result collections.

        stockout_risks = []
        insufficient_demand_history = []
        declining_sales = []

        # Analyze individual products.

        for row in rows:

            stock = max(
                int(row["available_stock"] or 0),
                0
            )

            recent_units = max(
                int(row["recent_units"] or 0),
                0
            )

            recent_product_revenue = max(
                float(row["recent_revenue"] or 0),
                0
            )

            previous_units = max(
                int(row["previous_units"] or 0),
                0
            )

            previous_product_revenue = max(
                float(row["previous_revenue"] or 0),
                0
            )

            recent_sales_days = max(
                int(row["recent_sales_days"] or 0),
                0
            )

            previous_sales_days = max(
                int(row["previous_sales_days"] or 0),
                0
            )

            daily_demand = recent_units / 30

            # Determine demand data support.

            if recent_sales_days >= 14:
                data_support = "moderate"

            elif recent_sales_days >= 7:
                data_support = "limited"

            else:
                data_support = "low"

            # Stockout risk analysis.

            if daily_demand > 0:

                if recent_sales_days < 7:

                    insufficient_demand_history.append({
                        "product_id": int(row["product_id"]),
                        "product_name": row["product_name"],
                        "barcode": row["barcode"],
                        "available_stock": stock,
                        "units_sold_last_30_days": recent_units,
                        "sales_days_last_30_days": recent_sales_days,
                        "data_support": data_support,
                        "message": (
                            "Too few distinct sales days for a useful "
                            "stockout date estimate."
                        )
                    })

                else:

                    days_until_stockout = stock / daily_demand

                    if days_until_stockout <= 30:

                        estimated_date = today + timedelta(
                            days=max(
                                0,
                                int(days_until_stockout)
                            )
                        )

                        stockout_risks.append({
                            "product_id": int(row["product_id"]),
                            "product_name": row["product_name"],
                            "barcode": row["barcode"],

                            "available_stock": stock,

                            "units_sold_last_30_days": recent_units,

                            "sales_days_last_30_days": recent_sales_days,

                            "average_daily_demand": round(
                                daily_demand, 2
                            ),

                            "estimated_days_until_stockout": round(
                                days_until_stockout, 1
                            ),

                            "estimated_stockout_date": (
                                estimated_date.isoformat()
                            ),

                            "data_support": data_support,

                            "risk_level": (
                                "high"
                                if days_until_stockout <= 7
                                else "watch"
                            ),

                            "basis": (
                                "Average daily units sold over the last "
                                "30 days; assumes demand stays similar."
                            )
                        })

            # Compare equal 30-day sales periods.
            # Require at least 7 distinct selling days in the prior period.

            if (
                previous_sales_days >= 7
                and (
                    previous_units > 0
                    or previous_product_revenue > 0
                )
            ):

                unit_decline_percent = max(
                    (
                        (
                            previous_units - recent_units
                        ) / previous_units * 100
                    )
                    if previous_units > 0
                    else 0,
                    0
                )

                revenue_decline_percent = max(
                    (
                        (
                            previous_product_revenue
                            - recent_product_revenue
                        ) / previous_product_revenue * 100
                    )
                    if previous_product_revenue > 0
                    else 0,
                    0
                )

                decline_basis = []

                if unit_decline_percent >= 20:
                    decline_basis.append("units")

                if revenue_decline_percent >= 20:
                    decline_basis.append("revenue")

                if decline_basis:

                    declining_sales.append({
                        "product_id": int(row["product_id"]),
                        "product_name": row["product_name"],
                        "barcode": row["barcode"],

                        "units_sold_last_30_days": recent_units,

                        "units_sold_previous_30_days": previous_units,

                        "revenue_last_30_days": round(
                            recent_product_revenue, 2
                        ),

                        "revenue_previous_30_days": round(
                            previous_product_revenue, 2
                        ),

                        "sales_days_last_30_days": recent_sales_days,

                        "sales_days_previous_30_days": (
                            previous_sales_days
                        ),

                        "unit_decline_percent": round(
                            unit_decline_percent, 1
                        ),

                        "revenue_decline_percent": round(
                            revenue_decline_percent, 1
                        ),

                        "decline_basis": decline_basis
                    })

        # Sort risk results.

        stockout_risks.sort(
            key=lambda item: item["estimated_days_until_stockout"]
        )

        declining_sales.sort(
            key=lambda item: max(
                item["unit_decline_percent"],
                item["revenue_decline_percent"]
            ),
            reverse=True
        )

        return jsonify({
            "success": True,

            "analysis_period_days": 60,

            "revenue_trend": revenue_trend,

            "stockout_risks": stockout_risks,

            "insufficient_demand_history": (
                insufficient_demand_history
            ),

            "declining_sales": declining_sales,

            "message": (
                "Estimates compare current usable stock with average "
                "daily sales over the last 30 days and require at least "
                "7 separate sales days. Product declines compare both "
                "unit sales and item revenue across equal 30-day windows, "
                "require at least 7 distinct sales days in the prior "
                "window, and flag a 20% or greater drop in either "
                "measure. Actual demand may change."
            )
        }), 200

    except Exception as e:
        print("Inventory risk report error:", repr(e))

        return jsonify({
            "success": False,
            "message": str(e)
        }), 500

    finally:
        close_database(cursor, connection)
