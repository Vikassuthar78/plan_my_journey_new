from functools import wraps
from flask import jsonify
from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request
from app import get_db


def role_required(*roles):
    """Decorator to enforce role-based access control."""
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            verify_jwt_in_request()
            identity = get_jwt_identity()
            db = get_db()
            user = db.users.find_one({"email": identity})
            if not user:
                return jsonify({"error": "User not found"}), 404
            if user.get("role") not in roles:
                return jsonify({"error": "Access denied. Insufficient permissions."}), 403
            return fn(*args, **kwargs)
        return wrapper
    return decorator


def get_current_user():
    """Get current authenticated user from DB."""
    identity = get_jwt_identity()
    db = get_db()
    user = db.users.find_one({"email": identity})
    if user:
        user['_id'] = str(user['_id'])
    return user
