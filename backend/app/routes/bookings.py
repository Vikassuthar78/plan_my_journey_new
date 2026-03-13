from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from datetime import datetime
from bson import ObjectId

from app import get_db
from app.middleware import role_required, get_current_user
from app.utils.helpers import serialize_doc

bookings_bp = Blueprint('bookings', __name__)


@bookings_bp.route('/', methods=['POST'])
@jwt_required()
@role_required('customer')
def create_booking():
    user = get_current_user()
    data = request.get_json()
    db = get_db()

    trip_id = data.get('trip_id')
    if not trip_id:
        return jsonify({"error": "Trip ID is required"}), 400

    try:
        trip = db.trips.find_one({"_id": ObjectId(trip_id), "customer_id": user['_id']})
    except:
        return jsonify({"error": "Invalid trip ID"}), 400

    if not trip:
        return jsonify({"error": "Trip not found"}), 404

    # Check for existing booking
    existing = db.bookings.find_one({"trip_id": ObjectId(trip_id), "status": {"$ne": "cancelled"}})
    if existing:
        return jsonify({"error": "Booking already exists for this trip"}), 409

    booking = {
        "trip_id": ObjectId(trip_id),
        "customer_id": user['_id'],
        "customer_name": user['name'],
        "customer_email": user['email'],
        "status": "pending",
        "total_amount": trip.get('total_cost', 0),
        "payment_status": "pending",
        "travelers": trip.get('travelers', []),
        "special_requests": data.get('special_requests', ''),
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }

    result = db.bookings.insert_one(booking)

    # Update trip status
    db.trips.update_one(
        {"_id": ObjectId(trip_id)},
        {"$set": {"status": "confirmed", "booking_id": str(result.inserted_id), "updated_at": datetime.utcnow()}}
    )

    booking['_id'] = result.inserted_id
    return jsonify({
        "message": "Booking created successfully",
        "booking": serialize_doc(booking)
    }), 201


@bookings_bp.route('/<booking_id>', methods=['GET'])
@jwt_required()
def get_booking(booking_id):
    user = get_current_user()
    db = get_db()

    try:
        booking = db.bookings.find_one({"_id": ObjectId(booking_id)})
    except:
        return jsonify({"error": "Invalid booking ID"}), 400

    if not booking:
        return jsonify({"error": "Booking not found"}), 404

    # Check access
    if user['role'] == 'customer' and booking.get('customer_id') != user['_id']:
        return jsonify({"error": "Access denied"}), 403

    if user['role'] == 'guide':
        return jsonify({"error": "Access denied"}), 403

    return jsonify({"booking": serialize_doc(booking)}), 200


@bookings_bp.route('/<booking_id>/cancel', methods=['PUT'])
@jwt_required()
@role_required('customer')
def cancel_booking(booking_id):
    user = get_current_user()
    db = get_db()

    try:
        booking = db.bookings.find_one({"_id": ObjectId(booking_id), "customer_id": user['_id']})
    except:
        return jsonify({"error": "Invalid booking ID"}), 400

    if not booking:
        return jsonify({"error": "Booking not found"}), 404

    if booking['status'] in ['cancelled', 'completed']:
        return jsonify({"error": "Cannot cancel this booking"}), 400

    db.bookings.update_one(
        {"_id": ObjectId(booking_id)},
        {"$set": {"status": "cancelled", "updated_at": datetime.utcnow()}}
    )

    if booking.get('trip_id'):
        db.trips.update_one(
            {"_id": booking['trip_id']},
            {"$set": {"status": "cancelled", "updated_at": datetime.utcnow()}}
        )

    return jsonify({"message": "Booking cancelled successfully"}), 200
