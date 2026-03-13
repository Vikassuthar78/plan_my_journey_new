from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token, create_refresh_token,
    jwt_required, get_jwt_identity
)
from datetime import datetime
import bcrypt
from bson import ObjectId

from app import get_db
from app.utils.validators import validate_email, validate_password, sanitize_dict
from app.utils.helpers import serialize_doc
from app.middleware import get_current_user

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/signup', methods=['POST'])
def signup():
    data = sanitize_dict(request.get_json())
    if not data:
        return jsonify({"error": "No data provided"}), 400

    name = data.get('name', '').strip()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    role = data.get('role', 'customer')
    phone = data.get('phone', '')

    if not name or not email or not password:
        return jsonify({"error": "Name, email, and password are required"}), 400

    if not validate_email(email):
        return jsonify({"error": "Invalid email format"}), 400

    valid, msg = validate_password(password)
    if not valid:
        return jsonify({"error": msg}), 400

    if role not in ['customer', 'guide']:
        return jsonify({"error": "Invalid role. Use 'customer' or 'guide'"}), 400

    db = get_db()

    if db.users.find_one({"email": email}):
        return jsonify({"error": "Email already registered"}), 409

    hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

    user = {
        "name": name,
        "email": email,
        "password": hashed.decode('utf-8'),
        "role": role,
        "phone": phone,
        "avatar": "",
        "saved_travelers": [],
        "saved_payment_methods": [],
        "saved_places": [],
        "is_active": True,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }

    result = db.users.insert_one(user)

    access_token = create_access_token(identity=email)
    refresh_token = create_refresh_token(identity=email)

    return jsonify({
        "message": "Account created successfully",
        "access_token": access_token,
        "refresh_token": refresh_token,
        "user": {
            "id": str(result.inserted_id),
            "name": name,
            "email": email,
            "role": role
        }
    }), 201


@auth_bp.route('/login', methods=['POST'])
def login():
    data = sanitize_dict(request.get_json())
    if not data:
        return jsonify({"error": "No data provided"}), 400

    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    db = get_db()
    user = db.users.find_one({"email": email})

    if not user:
        return jsonify({"error": "Invalid email or password"}), 401

    if not user.get('is_active', True):
        return jsonify({"error": "Account is deactivated"}), 403

    if not bcrypt.checkpw(password.encode('utf-8'), user['password'].encode('utf-8')):
        return jsonify({"error": "Invalid email or password"}), 401

    access_token = create_access_token(identity=email)
    refresh_token = create_refresh_token(identity=email)

    db.audit_logs.insert_one({
        "user_id": str(user['_id']),
        "action": "login",
        "timestamp": datetime.utcnow(),
        "ip": request.remote_addr
    })

    return jsonify({
        "message": "Login successful",
        "access_token": access_token,
        "refresh_token": refresh_token,
        "user": {
            "id": str(user['_id']),
            "name": user['name'],
            "email": user['email'],
            "role": user['role']
        }
    }), 200


@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    identity = get_jwt_identity()
    access_token = create_access_token(identity=identity)
    return jsonify({"access_token": access_token}), 200


@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_me():
    user = get_current_user()
    if not user:
        return jsonify({"error": "User not found"}), 404
    user.pop('password', None)
    return jsonify({"user": serialize_doc(user)}), 200


@auth_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    user = get_current_user()
    if not user:
        return jsonify({"error": "User not found"}), 404

    data = sanitize_dict(request.get_json())
    allowed_fields = ['name', 'phone', 'avatar', 'saved_travelers', 'saved_payment_methods', 'saved_places']
    updates = {f: data[f] for f in allowed_fields if f in data}

    if updates:
        updates['updated_at'] = datetime.utcnow()
        db = get_db()
        db.users.update_one({"email": user['email']}, {"$set": updates})

    return jsonify({"message": "Profile updated successfully"}), 200


@auth_bp.route('/change-password', methods=['PUT'])
@jwt_required()
def change_password():
    user = get_current_user()
    if not user:
        return jsonify({"error": "User not found"}), 404

    data = request.get_json()
    old_password = data.get('old_password', '')
    new_password = data.get('new_password', '')

    if not bcrypt.checkpw(old_password.encode('utf-8'), user['password'].encode('utf-8')):
        return jsonify({"error": "Current password is incorrect"}), 400

    valid, msg = validate_password(new_password)
    if not valid:
        return jsonify({"error": msg}), 400

    hashed = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt())
    db = get_db()
    db.users.update_one(
        {"email": user['email']},
        {"$set": {"password": hashed.decode('utf-8'), "updated_at": datetime.utcnow()}}
    )

    return jsonify({"message": "Password changed successfully"}), 200
