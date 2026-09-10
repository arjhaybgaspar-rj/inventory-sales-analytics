from flask import Blueprint, request, jsonify, session
from config.database import get_db_connection
from utils.auth import login_required

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()

    full_name = data.get("full_name")
    username = data.get("username")
    password = data.get("password")
    confirm_password = data.get("confirm_password")

    if not full_name or not username or not password or not confirm_password:
        return jsonify({
            "success": False,
            "message": "All fields are required."
        }), 400

    if password != confirm_password:
        return jsonify({
            "success": False,
            "message": "Passwords do not match."
        }), 400

    if len(password) < 6:
        return jsonify({
            "success": False,
            "message": "Password must be at least 6 characters."
        }), 400

    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        cursor.execute(
            """
            SELECT user_id
            FROM users
            WHERE username = %s
            LIMIT 1
            """,
            (username,)
        )

        existing_user = cursor.fetchone()

        if existing_user:
            return jsonify({
                "success": False,
                "message": "Username is already taken."
            }), 409

        cursor.execute(
            """
            INSERT INTO users
            (
                username,
                password,
                full_name,
                role,
                status
            )
            VALUES
            (
                %s,
                %s,
                %s,
                'cashier',
                'active'
            )
            """,
            (
                username,
                password,
                full_name
            )
        )

        connection.commit()

        return jsonify({
            "success": True,
            "message": "Registration successful."
        }), 201

    except Exception as e:
        if connection:
            connection.rollback()

        print("Registration error:", e)

        return jsonify({
            "success": False,
            "message": "Unable to register user."
        }), 500

    finally:
        if cursor:
            cursor.close()

        if connection:
            connection.close()

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()

    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({
            "success": False,
            "message": "Username and password are required."
        }), 400

    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        cursor.execute(
            """
            SELECT
                user_id,
                username,
                password,
                full_name,
                role,
                status
            FROM users
            WHERE username = %s
            LIMIT 1
            """,
            (username,)
        )

        user = cursor.fetchone()

        if not user:
            return jsonify({
                "success": False,
                "message": "Invalid username or password."
            }), 401

        if user["password"] != password:
            return jsonify({
                "success": False,
                "message": "Invalid username or password."
            }), 401

        if user["status"] != "active":
            return jsonify({
                "success": False,
                "message": "This account is inactive."
            }), 403

        session["user_id"] = user["user_id"]
        session["username"] = user["username"]
        session["full_name"] = user["full_name"]
        session["role"] = user["role"]

        return jsonify({
            "success": True,
            "message": "Login successful.",
            "user": {
                "user_id": user["user_id"],
                "username": user["username"],
                "full_name": user["full_name"],
                "role": user["role"]
            }
        }), 200

    except Exception as e:
        print("Login error:", e)

        return jsonify({
            "success": False,
            "message": "Unable to process login."
        }), 500

    finally:
        if cursor:
            cursor.close()

        if connection:
            connection.close()

@auth_bp.route("/logout", methods=["POST"])
def logout():
    session.clear()

    return jsonify({
        "success": True,
        "message": "Logout successful."
    }), 200

@auth_bp.route("/me", methods=["GET"])
@login_required()
def get_current_user():
    return jsonify({
        "success": True,
        "user": {
            "user_id": session.get("user_id"),
            "username": session.get("username"),
            "full_name": session.get("full_name"),
            "role": session.get("role")
        }
    }), 200