from flask import Blueprint, request, jsonify, session
from config.database import get_db_connection

auth_bp = Blueprint("auth", __name__)


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

        query = """
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
        """

        cursor.execute(query, (username,))
        user = cursor.fetchone()

        if not user:
            return jsonify({
                "success": False,
                "message": "Invalid username or password."
            }), 401

        if user["status"] != "active":
            return jsonify({
                "success": False,
                "message": "This account is inactive."
            }), 403

        if user["password"] != password:
            return jsonify({
                "success": False,
                "message": "Invalid username or password."
            }), 401

        session.clear()

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
                "role": user["role"],
                "status": user["status"]
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