
from flask import Blueprint, request, jsonify, session
from config.database import get_db_connection
from werkzeug.security import generate_password_hash, check_password_hash

auth_bp = Blueprint("auth", __name__)


def verify_password(stored_password, entered_password):
    if stored_password.startswith(("scrypt:", "pbkdf2:")):
        return check_password_hash(stored_password, entered_password)

    return stored_password == entered_password


def log_user_activity(user_id, action, description):
    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        cursor.execute("SET time_zone = '+08:00'")

        cursor.execute("""
            INSERT INTO activity_logs
                (user_id, action, description)
            VALUES (%s, %s, %s)
        """, (user_id, action, description))

        connection.commit()

    except Exception as e:
        if connection:
            connection.rollback()

        print("Audit logging error:", e)

    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()


def authenticate_user(username, password):
    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        cursor.execute("""
            SELECT user_id, username, password, full_name, role, status
            FROM users
            WHERE username = %s
            LIMIT 1
        """, (username,))

        user = cursor.fetchone()

        if not user:
            return None, "Invalid username or password.", 401

        if user["status"] != "active":
            return None, "This account is inactive.", 403

        if not verify_password(user["password"], password):
            return None, "Invalid username or password.", 401

        if not user["password"].startswith(("scrypt:", "pbkdf2:")):
            cursor.execute("""
                UPDATE users
                SET password = %s
                WHERE user_id = %s
            """, (
                generate_password_hash(password),
                user["user_id"]
            ))
            connection.commit()

        return user, None, 200

    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()


def create_user_session(user):
    session.clear()
    session["user_id"] = user["user_id"]
    session["username"] = user["username"]
    session["full_name"] = user["full_name"]
    session["role"] = user["role"]


def user_response(user):
    return {
        "user_id": user["user_id"],
        "username": user["username"],
        "full_name": user["full_name"],
        "role": user["role"],
        "status": user["status"]
    }


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json(silent=True) or {}

    username = data.get("username", "").strip()
    password = data.get("password", "")

    if not username or not password:
        return jsonify({
            "success": False,
            "message": "Username and password are required."
        }), 400

    try:
        user, error, status_code = authenticate_user(username, password)

        if error:
            return jsonify({
                "success": False,
                "message": error
            }), status_code

        create_user_session(user)

        log_user_activity(
            user["user_id"],
            "LOGIN",
            f'{user["full_name"]} ({user["role"]}) logged in successfully.'
        )

        return jsonify({
            "success": True,
            "message": "Login successful.",
            "user": user_response(user)
        }), 200

    except Exception as e:
        print("Login error:", e)

        return jsonify({
            "success": False,
            "message": "Unable to process login."
        }), 500


@auth_bp.route("/mobile/login", methods=["POST"])
def mobile_login():
    data = request.get_json(silent=True) or {}

    username = data.get("username", "").strip()
    password = data.get("password", "")

    if not username or not password:
        return jsonify({
            "success": False,
            "message": "Username and password are required."
        }), 400

    try:
        user, error, status_code = authenticate_user(username, password)

        if error:
            return jsonify({
                "success": False,
                "message": error
            }), status_code

        if user["role"] not in ["cashier", "owner"]:
            return jsonify({
                "success": False,
                "message": "Only owner and cashier accounts can access the mobile app."
            }), 403

        create_user_session(user)

        log_user_activity(
            user["user_id"],
            "LOGIN",
            f'{user["full_name"]} ({user["role"]}) logged in through mobile.'
        )

        return jsonify({
            "success": True,
            "message": "Login successful.",
            "user": user_response(user)
        }), 200

    except Exception as e:
        print("Mobile login error:", e)

        return jsonify({
            "success": False,
            "message": "Unable to process login."
        }), 500


@auth_bp.route("/profile/update", methods=["PUT"])
def update_profile():
    if "user_id" not in session:
        return jsonify({
            "success": False,
            "message": "Not authenticated."
        }), 401

    data = request.get_json(silent=True) or {}

    full_name = data.get("full_name", "").strip()
    username = data.get("username", "").strip()
    current_password = data.get("current_password", "")
    new_password = data.get("new_password", "")

    if not full_name or not username:
        return jsonify({
            "success": False,
            "message": "Full name and username are required."
        }), 400

    if len(full_name) > 100 or len(username) > 50:
        return jsonify({
            "success": False,
            "message": "Full name or username is too long."
        }), 400

    if new_password and len(new_password) < 8:
        return jsonify({
            "success": False,
            "message": "New password must be at least 8 characters."
        }), 400

    if new_password and not current_password:
        return jsonify({
            "success": False,
            "message": "Enter your current password to change it."
        }), 400

    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        user_id = session["user_id"]

        cursor.execute("""
            SELECT user_id, username, password, full_name, role, status
            FROM users
            WHERE user_id = %s
            LIMIT 1
        """, (user_id,))

        user = cursor.fetchone()

        if not user or user["status"] != "active":
            session.clear()

            return jsonify({
                "success": False,
                "message": "Your account is unavailable. Please log in again."
            }), 401

        if new_password and not verify_password(
            user["password"],
            current_password
        ):
            return jsonify({
                "success": False,
                "message": "Your current password is incorrect."
            }), 400

        cursor.execute("""
            SELECT user_id
            FROM users
            WHERE username = %s AND user_id != %s
            LIMIT 1
        """, (username, user_id))

        existing_user = cursor.fetchone()

        if existing_user:
            return jsonify({
                "success": False,
                "message": "That username is already being used."
            }), 409

        if new_password:
            cursor.execute("""
                UPDATE users
                SET full_name = %s,
                    username = %s,
                    password = %s
                WHERE user_id = %s
            """, (
                full_name,
                username,
                generate_password_hash(new_password),
                user_id
            ))
        else:
            cursor.execute("""
                UPDATE users
                SET full_name = %s,
                    username = %s
                WHERE user_id = %s
            """, (
                full_name,
                username,
                user_id
            ))

        connection.commit()

        session["username"] = username
        session["full_name"] = full_name

        return jsonify({
            "success": True,
            "message": "Profile updated successfully.",
            "user": {
                "user_id": user_id,
                "username": username,
                "full_name": full_name,
                "role": user["role"],
                "status": user["status"]
            }
        }), 200

    except Exception as e:
        if connection:
            connection.rollback()

        print("Profile update error:", e)

        return jsonify({
            "success": False,
            "message": "Unable to update your profile."
        }), 500

    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()


@auth_bp.route("/logout", methods=["POST"])
def logout():
    if "user_id" in session:
        log_user_activity(
            session["user_id"],
            "LOGOUT",
            f'{session.get("full_name", session.get("username"))} ({session.get("role")}) logged out.'
        )

    session.clear()

    return jsonify({
        "success": True,
        "message": "Logout successful."
    }), 200


@auth_bp.route("/me", methods=["GET"])
def get_current_user():
    if "user_id" not in session:
        return jsonify({
            "success": False,
            "message": "Not authenticated."
        }), 401

    return jsonify({
        "success": True,
        "user": {
            "user_id": session["user_id"],
            "username": session["username"],
            "full_name": session["full_name"],
            "role": session["role"]
        }
    }), 200
