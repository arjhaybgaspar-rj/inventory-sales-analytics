import unittest
from unittest.mock import Mock, patch

from flask import Flask

from routes.sales_routes import sales_bp


class SalesRouteTests(unittest.TestCase):
    def setUp(self):
        self.app = Flask(__name__)
        self.app.secret_key = "test"
        self.app.register_blueprint(sales_bp)

    def test_receipt_and_transaction_detail_have_distinct_routes(self):
        route_endpoints = {
            rule.rule: rule.endpoint
            for rule in self.app.url_map.iter_rules()
            if rule.rule in {
                "/api/sales/<int:sale_id>",
                "/api/sales/receipt/<int:sale_id>",
            }
        }

        self.assertEqual(
            route_endpoints["/api/sales/<int:sale_id>"],
            "sales.get_sale_details",
        )
        self.assertEqual(
            route_endpoints["/api/sales/receipt/<int:sale_id>"],
            "sales.get_sale_receipt",
        )

    def test_cashier_sales_list_only_contains_their_own_sales(self):
        cursor = Mock()
        cursor.fetchall.return_value = []
        connection = Mock()
        connection.cursor.return_value = cursor
        client = self.app.test_client()

        with client.session_transaction() as session:
            session["user_id"] = 12
            session["role"] = "cashier"

        with patch(
            "routes.sales_routes.get_db_connection",
            return_value=connection,
        ):
            response = client.get("/api/sales")

        self.assertEqual(response.status_code, 200)
        query, params = cursor.execute.call_args.args
        self.assertIn("WHERE s.user_id = %s", query)
        self.assertEqual(params, (12,))

    def test_owner_can_read_mobile_details_and_web_receipts(self):
        sale = {
            "sale_id": 245,
            "user_id": 12,
            "cashier": "Store Cashier",
            "total_amount": 40,
            "payment_method": "cash",
            "sale_date": "2026-11-18T10:00:00",
        }
        item = {
            "product_id": 3,
            "product_name": "Sample Product",
            "batch_id": 8,
            "batch_number": "B-1",
            "unit": "pcs",
            "quantity": 2,
            "unit_price": 20,
            "subtotal": 40,
        }
        client = self.app.test_client()

        with client.session_transaction() as session:
            session["user_id"] = 99
            session["role"] = "owner"

        for path, expected_key in (
            ("/api/sales/245", "sale"),
            ("/api/sales/receipt/245", "receipt"),
        ):
            cursor = Mock()
            cursor.fetchone.return_value = sale.copy()
            cursor.fetchall.return_value = [item.copy()]
            connection = Mock()
            connection.cursor.return_value = cursor

            with patch(
                "routes.sales_routes.get_db_connection",
                return_value=connection,
            ):
                response = client.get(path)

            self.assertEqual(response.status_code, 200)
            self.assertTrue(response.json["success"])
            self.assertIn(expected_key, response.json)
            items = (
                response.json["items"]
                if expected_key == "sale"
                else response.json["receipt"]["items"]
            )
            self.assertEqual(len(items), 1)


if __name__ == "__main__":
    unittest.main()
