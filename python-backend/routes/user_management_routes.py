
from flask import Blueprint, request, jsonify, session
from config.database import get_db_connection
from utils.auth import login_required
from werkzeug.security import generate_password_hash

user_management_bp = Blueprint(
    "user_management",
    __name__,
    url_prefix="/api/users"
)


@user_management_bp.route("/", methods=["GET"])
@login_required(["admin"])
def get_users():
    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        cursor.execute("""
            SELECT user_id, username, full_name, role, status, created_at
            FROM users
            ORDER BY created_at DESC
        """)

        users = cursor.fetchall()

        return jsonify({
            "success": True,
            "users": users
        }), 200

    except Exception as e:
        print("Get users error:", e)
        return jsonify({
            "success": False,
            "message": "Unable to retrieve users."
        }), 500

    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()


@user_management_bp.route("/", methods=["POST"])
@login_required(["admin"])
def add_user():
    data = request.get_json(silent=True) or {}

    username = data.get("username", "").strip()
    full_name = data.get("full_name", "").strip()
    password = data.get("password", "")
    role = data.get("role", "").strip().lower()

    allowed_roles = ["admin", "owner", "manager", "cashier"]

    if not username or not full_name or not password or not role:
        return jsonify({
            "success": False,
            "message": "All fields are required."
        }), 400

    if len(username) > 50 or len(full_name) > 100:
        return jsonify({
            "success": False,
            "message": "Username or full name is too long."
        }), 400

    if len(password) < 8:
        return jsonify({
            "success": False,
            "message": "Password must be at least 8 characters."
        }), 400

    if role not in allowed_roles:
        return jsonify({
            "success": False,
            "message": "Invalid user role."
        }), 400

    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        cursor.execute("""
            SELECT user_id
            FROM users
            WHERE username = %s
            LIMIT 1
        """, (username,))

        if cursor.fetchone():
            return jsonify({
                "success": False,
                "message": "Username is already being used."
            }), 409

        cursor.execute("""
            INSERT INTO users (username, password, full_name, role, status)
            VALUES (%s, %s, %s, %s, 'active')
        """, (
            username,
            generate_password_hash(password),
            full_name,
            role
        ))

        new_user_id = cursor.lastrowid

        cursor.execute("""
            INSERT INTO activity_logs (user_id, action, description)
            VALUES (%s, %s, %s)
        """, (
            session["user_id"],
            "USER_CREATED",
            f"Created user account: {username} ({role})"
        ))

        connection.commit()

        return jsonify({
            "success": True,
            "message": "User created successfully.",
            "user_id": new_user_id
        }), 201

    except Exception as e:
        if connection:
            connection.rollback()

        print("Add user error:", e)

        return jsonify({
            "success": False,
            "message": "Unable to create user."
        }), 500

    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()


@user_management_bp.route("/<int:user_id>", methods=["PUT"])
@login_required(["admin"])
def update_user(user_id):
    data = request.get_json(silent=True) or {}

    username = data.get("username", "").strip()
    full_name = data.get("full_name", "").strip()
    role = data.get("role", "").strip().lower()

    allowed_roles = ["admin", "owner", "manager", "cashier"]

    if not username or not full_name or not role:
        return jsonify({
            "success": False,
            "message": "Username, full name, and role are required."
        }), 400

    if len(username) > 50 or len(full_name) > 100:
        return jsonify({
            "success": False,
            "message": "Username or full name is too long."
        }), 400

    if role not in allowed_roles:
        return jsonify({
            "success": False,
            "message": "Invalid user role."
        }), 400

    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        cursor.execute("""
            SELECT user_id, username, role
            FROM users
            WHERE user_id = %s
            LIMIT 1
        """, (user_id,))

        existing_user = cursor.fetchone()

        if not existing_user:
            return jsonify({
                "success": False,
                "message": "User not found."
            }), 404

        if user_id == session["user_id"] and role != "admin":
            return jsonify({
                "success": False,
                "message": "You cannot remove your own admin role."
            }), 400

        cursor.execute("""
            SELECT user_id
            FROM users
            WHERE username = %s AND user_id != %s
            LIMIT 1
        """, (username, user_id))

        if cursor.fetchone():
            return jsonify({
                "success": False,
                "message": "Username is already being used."
            }), 409

        cursor.execute("""
            UPDATE users
            SET username = %s, full_name = %s, role = %s
            WHERE user_id = %s
        """, (username, full_name, role, user_id))

        cursor.execute("""
            INSERT INTO activity_logs (user_id, action, description)
            VALUES (%s, %s, %s)
        """, (
            session["user_id"],
            "USER_UPDATED",
            f"Updated user account: {username}"
        ))

        connection.commit()

        return jsonify({
            "success": True,
            "message": "User updated successfully."
        }), 200

    except Exception as e:
        if connection:
            connection.rollback()

        print("Update user error:", e)

        return jsonify({
            "success": False,
            "message": "Unable to update user."
        }), 500

    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()


@user_management_bp.route("/<int:user_id>/deactivate", methods=["PUT"])
@login_required(["admin"])
def deactivate_user(user_id):
    if user_id == session["user_id"]:
        return jsonify({
            "success": False,
            "message": "You cannot deactivate your own account."
        }), 400

    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        cursor.execute("""
            SELECT user_id, username, status
            FROM users
            WHERE user_id = %s
            LIMIT 1
        """, (user_id,))

        user = cursor.fetchone()

        if not user:
            return jsonify({
                "success": False,
                "message": "User not found."
            }), 404

        if user["status"] == "inactive":
            return jsonify({
                "success": False,
                "message": "User is already inactive."
            }), 400

        cursor.execute("""
            UPDATE users
            SET status = 'inactive'
            WHERE user_id = %s
        """, (user_id,))

        cursor.execute("""
            INSERT INTO activity_logs (user_id, action, description)
            VALUES (%s, %s, %s)
        """, (
            session["user_id"],
            "USER_DEACTIVATED",
            f"Deactivated user account: {user['username']}"
        ))

        connection.commit()

        return jsonify({
            "success": True,
            "message": "User deactivated successfully."
        }), 200

    except Exception as e:
        if connection:
            connection.rollback()

        print("Deactivate user error:", e)

        return jsonify({
            "success": False,
            "message": "Unable to deactivate user."
        }), 500

    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()
