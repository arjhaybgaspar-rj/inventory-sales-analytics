
import os

from dotenv import load_dotenv
from flask import Flask
from flask_cors import CORS

load_dotenv()

from routes.barcode_routes import barcode_bp
from routes.product_routes import product_bp
from routes.auth_routes import auth_bp
from routes.inventory_routes import inventory_bp
from routes.sales_routes import sales_bp
from routes.report_routes import report_bp
from routes.user_management_routes import user_management_bp
from routes.audit_routes import audit_bp


app = Flask(__name__)

APP_ENV = os.getenv("APP_ENV", "development").strip().lower()
IS_PRODUCTION = APP_ENV == "production"

secret_key = os.getenv("FLASK_SECRET_KEY", "").strip()

if not secret_key:
    if IS_PRODUCTION:
        raise RuntimeError("FLASK_SECRET_KEY must be set in production.")
    secret_key = "local-development-only-change-before-deployment"

app.config.update(
    SECRET_KEY=secret_key,
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SAMESITE="Lax",
    SESSION_COOKIE_SECURE=IS_PRODUCTION,
)

# CORS configuration
origins_setting = os.getenv("FRONTEND_ORIGINS", "").strip()

if origins_setting:
    cors_origins = [
        origin.strip()
        for origin in origins_setting.split(",")
        if origin.strip()
    ]
elif IS_PRODUCTION:
    cors_origins = []
else:
    cors_origins = [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://localhost:64239",
    ]

CORS(
    app,
    supports_credentials=True,
    origins=cors_origins
)

# Register blueprints
app.register_blueprint(barcode_bp)
app.register_blueprint(product_bp)
app.register_blueprint(auth_bp)
app.register_blueprint(inventory_bp)
app.register_blueprint(sales_bp)
app.register_blueprint(report_bp)
app.register_blueprint(user_management_bp)
app.register_blueprint(audit_bp)


@app.route("/")
def home():
    return "Inventory Sales Analytics API is running!"


if __name__ == "__main__":
    debug_enabled = os.getenv(
        "FLASK_DEBUG",
        "true" if not IS_PRODUCTION else "false"
    ).lower() in {"1", "true", "yes"}

    app.run(
        host=os.getenv("FLASK_HOST", "0.0.0.0"),
        port=int(os.getenv("FLASK_PORT", "5000")),
        debug=debug_enabled,
    )
