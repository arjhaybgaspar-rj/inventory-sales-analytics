from flask import Flask, session
from flask_cors import CORS

from routes.barcode_routes import barcode_bp
from routes.product_routes import product_bp
from routes.auth_routes import auth_bp
from routes.inventory_routes import inventory_bp
from routes.sales_routes import sales_bp
from routes.report_routes import report_bp

app = Flask(__name__)

app.secret_key = "inventory-sales-analytics-secret-key"

CORS(
    app,
    supports_credentials=True,
    origins=["http://localhost:5173"]
)

app.register_blueprint(barcode_bp)
app.register_blueprint(product_bp)
app.register_blueprint(auth_bp)
app.register_blueprint(inventory_bp)
app.register_blueprint(sales_bp)
app.register_blueprint(report_bp)


@app.route("/")
def home():
    return "Inventory Sales Analytics API is running!"


if __name__ == "__main__":
    app.run(
        host="127.0.0.1",
        port=5000,
        debug=True
    )