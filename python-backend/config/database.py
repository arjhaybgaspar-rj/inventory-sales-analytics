import os

import mysql.connector


def get_db_connection():
    app_env = os.getenv("APP_ENV", "development").strip().lower()
    db_password = os.getenv("DB_PASSWORD", "")

    if app_env == "production" and not db_password:
        raise RuntimeError("DB_PASSWORD must be set in production.")

    return mysql.connector.connect(
        host=os.getenv("DB_HOST", "localhost"),
        port=int(os.getenv("DB_PORT", "3306")),
        user=os.getenv("DB_USER", "root"),
        password=db_password,
        database=os.getenv("DB_NAME", "inventory_sale_analytics"),
        connection_timeout=10,
    )
