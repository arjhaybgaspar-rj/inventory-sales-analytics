
from flask import Blueprint, jsonify
from config.database import get_db_connection
from utils.auth import login_required

audit_bp = Blueprint(
    "audit",
    __name__,
    url_prefix="/api/audit-logs"
)


@audit_bp.route("/", methods=["GET"])
@login_required(["admin"])
def get_audit_logs():
    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        cursor.execute("SET time_zone = '+08:00'")

        cursor.execute("""
            SELECT
                activity_logs.log_id,
                activity_logs.user_id,
                users.username,
                users.full_name,
                users.role,
                activity_logs.action,
                activity_logs.description,
                activity_logs.created_at
            FROM activity_logs
            LEFT JOIN users
                ON activity_logs.user_id = users.user_id
            ORDER BY activity_logs.created_at DESC
        """)

        logs = cursor.fetchall()

        return jsonify({
            "success": True,
            "logs": logs
        }), 200

    except Exception as e:
        print("Audit logs error:", e)

        return jsonify({
            "success": False,
            "message": "Unable to retrieve audit logs."
        }), 500

    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()
