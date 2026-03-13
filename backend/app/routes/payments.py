from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from datetime import datetime
from bson import ObjectId

from app import get_db
from app.middleware import role_required, get_current_user
from app.utils.helpers import serialize_doc

payments_bp = Blueprint('payments', __name__)


@payments_bp.route('/process', methods=['POST'])
@jwt_required()
@role_required('customer')
def process_payment():
    user = get_current_user()
    data = request.get_json()
    db = get_db()

    booking_id = data.get('booking_id')
    payment_method = data.get('payment_method', 'card')
    amount = data.get('amount', 0)

    if not booking_id or amount <= 0:
        return jsonify({"error": "Valid booking ID and amount are required"}), 400

    try:
        booking = db.bookings.find_one({"_id": ObjectId(booking_id), "customer_id": user['_id']})
    except:
        return jsonify({"error": "Invalid booking ID"}), 400

    if not booking:
        return jsonify({"error": "Booking not found"}), 404

    if booking.get('payment_status') == 'completed':
        return jsonify({"error": "Payment already completed"}), 400

    # Simulate payment processing
    payment = {
        "booking_id": ObjectId(booking_id),
        "customer_id": user['_id'],
        "amount": amount,
        "payment_method": payment_method,
        "status": "completed",
        "type": "payment",
        "transaction_id": f"TXN-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}-{str(user['_id'])[-6:]}",
        "created_at": datetime.utcnow()
    }

    result = db.payments.insert_one(payment)

    # Update booking
    db.bookings.update_one(
        {"_id": ObjectId(booking_id)},
        {"$set": {
            "payment_status": "completed",
            "payment_id": str(result.inserted_id),
            "status": "confirmed",
            "updated_at": datetime.utcnow()
        }}
    )

    # Send confirmation notification
    db.notifications.insert_one({
        "user_id": str(user['_id']),
        "type": "payment_success",
        "message": f"Payment of ₹{amount} successful. Your booking is confirmed!",
        "read": False,
        "created_at": datetime.utcnow()
    })

    payment['_id'] = result.inserted_id
    return jsonify({
        "message": "Payment processed successfully",
        "payment": serialize_doc(payment)
    }), 200


@payments_bp.route('/history', methods=['GET'])
@jwt_required()
@role_required('customer')
def payment_history():
    user = get_current_user()
    db = get_db()

    payments = list(
        db.payments.find({"customer_id": user['_id']})
        .sort("created_at", -1)
        .limit(50)
    )

    return jsonify({"payments": serialize_doc(payments)}), 200


@payments_bp.route('/<payment_id>', methods=['GET'])
@jwt_required()
def get_payment(payment_id):
    user = get_current_user()
    db = get_db()

    try:
        payment = db.payments.find_one({"_id": ObjectId(payment_id)})
    except:
        return jsonify({"error": "Invalid payment ID"}), 400

    if not payment:
        return jsonify({"error": "Payment not found"}), 404

    # Only admin and the paying customer can see payment details
    if user['role'] == 'customer' and payment.get('customer_id') != user['_id']:
        return jsonify({"error": "Access denied"}), 403
    if user['role'] == 'guide':
        return jsonify({"error": "Access denied"}), 403

    return jsonify({"payment": serialize_doc(payment)}), 200
