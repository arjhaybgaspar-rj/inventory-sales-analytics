from functools import wraps
from flask import session, jsonify


def login_required(allowed_roles=None):
    def decorator(function):
        @wraps(function)
        def wrapper(*args, **kwargs):

            if "user_id" not in session:
                return jsonify({
                    "success": False,
                    "message": "Authentication required."
                }), 401

            if allowed_roles:
                user_role = session.get("role")

                if user_role not in allowed_roles:
                    return jsonify({
                        "success": False,
                        "message": "Access denied."
                    }), 403

            return function(*args, **kwargs)

        return wrapper

    return decorator