from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from datetime import datetime
from bson import ObjectId

from app import get_db
from app.middleware import role_required, get_current_user
from app.utils.helpers import serialize_doc, paginate, generate_itinerary
from app.utils.validators import sanitize_dict

customer_bp = Blueprint('customer', __name__)


@customer_bp.route('/dashboard', methods=['GET'])
@jwt_required()
@role_required('customer')
def dashboard():
    user = get_current_user()
    db = get_db()
    user_id = user['_id']

    upcoming = list(db.trips.find({"customer_id": user_id, "status": {"$in": ["confirmed", "planning"]}}).sort("start_date", 1).limit(5))
    ongoing = list(db.trips.find({"customer_id": user_id, "status": "ongoing"}).limit(5))
    past = list(db.trips.find({"customer_id": user_id, "status": "completed"}).sort("end_date", -1).limit(5))

    return jsonify({
        "upcoming_trips": serialize_doc(upcoming),
        "ongoing_trips": serialize_doc(ongoing),
        "past_trips": serialize_doc(past),
        "user_name": user['name']
    }), 200


@customer_bp.route('/trips', methods=['GET'])
@jwt_required()
@role_required('customer')
def get_trips():
    user = get_current_user()
    db = get_db()
    page = request.args.get('page', 1, type=int)
    status = request.args.get('status', '')

    query = {"customer_id": user['_id']}
    if status:
        query["status"] = status

    result = paginate(db.trips, query, page=page)
    return jsonify(result), 200


@customer_bp.route('/trips/<trip_id>', methods=['GET'])
@jwt_required()
@role_required('customer')
def get_trip_detail(trip_id):
    user = get_current_user()
    db = get_db()

    try:
        trip = db.trips.find_one({"_id": ObjectId(trip_id), "customer_id": user['_id']})
    except:
        return jsonify({"error": "Invalid trip ID"}), 400

    if not trip:
        return jsonify({"error": "Trip not found"}), 404

    # Get related data
    booking = db.bookings.find_one({"trip_id": ObjectId(trip_id)})
    guide = None
    if trip.get('guide_id'):
        guide = db.users.find_one({"_id": ObjectId(trip['guide_id'])})
        if guide:
            guide.pop('password', None)

    hotel_ids = trip.get('hotel_ids', [])
    hotels = list(db.hotels.find({"_id": {"$in": [ObjectId(h) for h in hotel_ids]}})) if hotel_ids else []

    return jsonify({
        "trip": serialize_doc(trip),
        "booking": serialize_doc(booking),
        "guide": serialize_doc(guide),
        "hotels": serialize_doc(hotels)
    }), 200


@customer_bp.route('/trips', methods=['POST'])
@jwt_required()
@role_required('customer')
def create_trip():
    user = get_current_user()
    data = sanitize_dict(request.get_json())
    db = get_db()

    # Build trip
    trip = {
        "customer_id": user['_id'],
        "title": data.get('title', 'My Journey'),
        "state": data.get('state', ''),
        "cities": data.get('cities', []),
        "attractions": data.get('attractions', []),
        "travel_mode": data.get('travel_mode', 'train'),
        "hotel_ids": data.get('hotel_ids', []),
        "travelers": data.get('travelers', []),
        "start_date": data.get('start_date', ''),
        "end_date": data.get('end_date', ''),
        "itinerary": [],
        "status": "planning",
        "guide_id": None,
        "total_cost": data.get('total_cost', 0),
        "notes": data.get('notes', ''),
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }

    # Generate itinerary
    trip['itinerary'] = generate_itinerary(trip)

    result = db.trips.insert_one(trip)
    trip['_id'] = result.inserted_id

    return jsonify({
        "message": "Trip created successfully",
        "trip": serialize_doc(trip)
    }), 201


@customer_bp.route('/trips/<trip_id>', methods=['PUT'])
@jwt_required()
@role_required('customer')
def update_trip(trip_id):
    user = get_current_user()
    data = sanitize_dict(request.get_json())
    db = get_db()

    try:
        trip = db.trips.find_one({"_id": ObjectId(trip_id), "customer_id": user['_id']})
    except:
        return jsonify({"error": "Invalid trip ID"}), 400

    if not trip:
        return jsonify({"error": "Trip not found"}), 404

    if trip['status'] not in ['planning', 'confirmed']:
        return jsonify({"error": "Cannot modify this trip"}), 400

    allowed = ['title', 'cities', 'attractions', 'travel_mode', 'hotel_ids', 'travelers', 'start_date', 'end_date', 'notes']
    updates = {k: data[k] for k in allowed if k in data}
    updates['updated_at'] = datetime.utcnow()

    if 'start_date' in updates or 'end_date' in updates:
        merged = {**serialize_doc(trip), **updates}
        updates['itinerary'] = generate_itinerary(merged)

    db.trips.update_one({"_id": ObjectId(trip_id)}, {"$set": updates})

    return jsonify({"message": "Trip updated successfully"}), 200


@customer_bp.route('/trips/<trip_id>/review', methods=['POST'])
@jwt_required()
@role_required('customer')
def add_review(trip_id):
    user = get_current_user()
    data = sanitize_dict(request.get_json())
    db = get_db()

    try:
        trip = db.trips.find_one({"_id": ObjectId(trip_id), "customer_id": user['_id'], "status": "completed"})
    except:
        return jsonify({"error": "Invalid trip ID"}), 400

    if not trip:
        return jsonify({"error": "Can only review completed trips"}), 404

    review = {
        "trip_id": ObjectId(trip_id),
        "customer_id": user['_id'],
        "rating": min(5, max(1, data.get('rating', 5))),
        "comment": data.get('comment', ''),
        "created_at": datetime.utcnow()
    }

    db.reviews.insert_one(review)
    return jsonify({"message": "Review submitted successfully"}), 201
