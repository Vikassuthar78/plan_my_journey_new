from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from datetime import datetime
from bson import ObjectId

from app import get_db
from app.middleware import role_required, get_current_user
from app.utils.helpers import serialize_doc, paginate
from app.utils.validators import sanitize_dict

admin_bp = Blueprint('admin', __name__)


@admin_bp.route('/dashboard', methods=['GET'])
@jwt_required()
@role_required('admin')
def dashboard():
    db = get_db()

    total_bookings = db.bookings.count_documents({})
    active_trips = db.trips.count_documents({"status": "ongoing"})
    upcoming_trips = db.trips.count_documents({"status": {"$in": ["confirmed", "planning"]}})
    completed_trips = db.trips.count_documents({"status": "completed"})
    customer_count = db.users.count_documents({"role": "customer"})
    guide_count = db.users.count_documents({"role": "guide"})

    # Revenue
    pipeline = [{"$group": {"_id": None, "total": {"$sum": "$amount"}}}]
    revenue_result = list(db.payments.aggregate(pipeline))
    total_revenue = revenue_result[0]['total'] if revenue_result else 0

    # Recent bookings (enriched with customer & trip info)
    recent_bookings = list(db.bookings.find().sort("created_at", -1).limit(10))
    for b in recent_bookings:
        try:
            cust = db.users.find_one({"_id": b.get("customer_id")})
            b["customer_name"] = cust["name"] if cust else "N/A"
        except Exception:
            b["customer_name"] = "N/A"
        try:
            trip = db.trips.find_one({"_id": b.get("trip_id")})
            b["destination_name"] = trip.get("title", "N/A") if trip else "N/A"
        except Exception:
            b["destination_name"] = "N/A"

    return jsonify({
        "total_bookings": total_bookings,
        "total_revenue": total_revenue,
        "active_trips": active_trips,
        "upcoming_trips": upcoming_trips,
        "completed_trips": completed_trips,
        "customer_count": customer_count,
        "guide_count": guide_count,
        "recent_bookings": serialize_doc(recent_bookings)
    }), 200


@admin_bp.route('/customers', methods=['GET'])
@jwt_required()
@role_required('admin')
def get_customers():
    db = get_db()
    page = request.args.get('page', 1, type=int)
    search = request.args.get('search', '')

    query = {"role": "customer"}
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"email": {"$regex": search, "$options": "i"}}
        ]

    result = paginate(db.users, query, page=page)
    for item in result['items']:
        item.pop('password', None)
        # Enrich with trip count
        try:
            item['total_trips'] = db.trips.count_documents({"customer_id": item['_id']})
        except Exception:
            item['total_trips'] = 0

    return jsonify(result), 200


@admin_bp.route('/guides', methods=['GET'])
@jwt_required()
@role_required('admin')
def get_guides():
    db = get_db()
    page = request.args.get('page', 1, type=int)
    search = request.args.get('search', '')

    query = {"role": "guide"}
    if search:
        query["name"] = {"$regex": search, "$options": "i"}

    result = paginate(db.users, query, page=page)
    for item in result['items']:
        item.pop('password', None)
        # Enrich with assigned trip count
        try:
            item['assigned_trips'] = db.trips.count_documents({"guide_id": item['_id']})
        except Exception:
            item['assigned_trips'] = 0

    return jsonify(result), 200


@admin_bp.route('/bookings', methods=['GET'])
@jwt_required()
@role_required('admin')
def get_all_bookings():
    db = get_db()
    page = request.args.get('page', 1, type=int)
    status = request.args.get('status', '')
    date_from = request.args.get('date_from', '')
    date_to = request.args.get('date_to', '')

    query = {}
    if status:
        query["status"] = status
    if date_from:
        query["created_at"] = {"$gte": datetime.fromisoformat(date_from)}
    if date_to:
        query.setdefault("created_at", {})["$lte"] = datetime.fromisoformat(date_to)

    result = paginate(db.bookings, query, page=page)

    # Enrich bookings with trip + customer details
    for item in result['items']:
        # Enrich from trip
        trip_id = item.get('trip_id')
        if trip_id:
            try:
                trip = db.trips.find_one({"_id": ObjectId(trip_id)})
                if trip:
                    # Build destination name from state/cities
                    city_names = [c.get('name', '') for c in trip.get('cities', []) if c.get('name')]
                    dest = trip.get('state', '')
                    if city_names:
                        dest = ', '.join(city_names[:2])
                        if len(city_names) > 2:
                            dest += f' +{len(city_names)-2}'
                    item['destination_name'] = item.get('destination_name') or dest
                    item['start_date'] = item.get('start_date') or trip.get('start_date', '')
                    # Travelers can be array or number
                    trip_travelers = trip.get('travelers', [])
                    item['travelers'] = len(trip_travelers) if isinstance(trip_travelers, list) else (trip_travelers or 1)
                    item['duration_days'] = trip.get('duration_days', '')
                    item['trip_title'] = trip.get('title', '')
            except Exception:
                pass
        # Enrich customer name from users if not already set
        if not item.get('customer_name') and item.get('customer_id'):
            try:
                cust = db.users.find_one({"_id": ObjectId(item['customer_id'])})
                if cust:
                    item['customer_name'] = cust.get('name', '')
            except Exception:
                pass
        # Normalise amount field
        if not item.get('amount'):
            item['amount'] = item.get('total_amount', 0)

    return jsonify(result), 200


@admin_bp.route('/trips', methods=['GET'])
@jwt_required()
@role_required('admin')
def get_all_trips():
    db = get_db()
    page = request.args.get('page', 1, type=int)
    status = request.args.get('status', '')

    query = {}
    if status:
        query["status"] = status

    result = paginate(db.trips, query, page=page)

    # Enrich trips with customer/guide/destination names
    for item in result['items']:
        # Customer name
        cust_id = item.get('customer_id')
        if cust_id and not item.get('customer_name'):
            try:
                cust = db.users.find_one({"_id": ObjectId(cust_id)})
                if cust:
                    item['customer_name'] = cust.get('name', '')
            except Exception:
                pass
        # Guide name
        guide_id = item.get('guide_id')
        if guide_id and not item.get('guide_name'):
            try:
                guide = db.users.find_one({"_id": ObjectId(guide_id)})
                if guide:
                    item['guide_name'] = guide.get('name', '')
            except Exception:
                pass
        # Destination name from state + cities
        if not item.get('destination_name') and not item.get('city_name'):
            city_names = [c.get('name', '') for c in item.get('cities', []) if c.get('name')]
            state = item.get('state', '')
            if city_names:
                item['destination_name'] = ', '.join(city_names[:2])
                if len(city_names) > 2:
                    item['destination_name'] += f' +{len(city_names)-2}'
            elif state:
                item['destination_name'] = state
        # Duration days from dates
        if not item.get('duration_days') and item.get('start_date') and item.get('end_date'):
            try:
                sd = datetime.fromisoformat(str(item['start_date']))
                ed = datetime.fromisoformat(str(item['end_date']))
                item['duration_days'] = (ed - sd).days + 1
            except Exception:
                pass
        # Travelers count
        travelers = item.get('travelers', [])
        if isinstance(travelers, list):
            item['travelers_count'] = len(travelers)
        else:
            item['travelers_count'] = travelers or 1

    return jsonify(result), 200


@admin_bp.route('/trips/<trip_id>/assign-guide', methods=['PUT'])
@jwt_required()
@role_required('admin')
def assign_guide(trip_id):
    data = sanitize_dict(request.get_json())
    guide_id = data.get('guide_id')
    db = get_db()

    if not guide_id:
        return jsonify({"error": "Guide ID is required"}), 400

    try:
        guide = db.users.find_one({"_id": ObjectId(guide_id), "role": "guide"})
    except:
        return jsonify({"error": "Invalid guide ID"}), 400

    if not guide:
        return jsonify({"error": "Guide not found"}), 404

    try:
        result = db.trips.update_one(
            {"_id": ObjectId(trip_id)},
            {"$set": {"guide_id": guide_id, "updated_at": datetime.utcnow()}}
        )
    except:
        return jsonify({"error": "Invalid trip ID"}), 400

    if result.matched_count == 0:
        return jsonify({"error": "Trip not found"}), 404

    # Send notification to guide
    db.notifications.insert_one({
        "user_id": guide_id,
        "type": "trip_assignment",
        "message": f"You have been assigned to a new trip",
        "trip_id": trip_id,
        "read": False,
        "created_at": datetime.utcnow()
    })

    # Log action
    user = get_current_user()
    db.audit_logs.insert_one({
        "user_id": user['_id'],
        "action": "assign_guide",
        "details": {"trip_id": trip_id, "guide_id": guide_id},
        "timestamp": datetime.utcnow()
    })

    return jsonify({"message": "Guide assigned successfully"}), 200


@admin_bp.route('/trips/<trip_id>/status', methods=['PUT'])
@jwt_required()
@role_required('admin')
def update_trip_status(trip_id):
    data = sanitize_dict(request.get_json())
    new_status = data.get('status')
    db = get_db()

    valid_statuses = ['planning', 'confirmed', 'ongoing', 'completed', 'cancelled']
    if new_status not in valid_statuses:
        return jsonify({"error": f"Invalid status. Must be one of: {', '.join(valid_statuses)}"}), 400

    try:
        result = db.trips.update_one(
            {"_id": ObjectId(trip_id)},
            {"$set": {"status": new_status, "updated_at": datetime.utcnow()}}
        )
    except:
        return jsonify({"error": "Invalid trip ID"}), 400

    if result.matched_count == 0:
        return jsonify({"error": "Trip not found"}), 404

    return jsonify({"message": f"Trip status updated to {new_status}"}), 200


@admin_bp.route('/bookings/<booking_id>/cancel', methods=['PUT'])
@jwt_required()
@role_required('admin')
def cancel_booking(booking_id):
    db = get_db()
    data = sanitize_dict(request.get_json())
    reason = data.get('reason', 'Cancelled by admin')

    try:
        booking = db.bookings.find_one({"_id": ObjectId(booking_id)})
    except:
        return jsonify({"error": "Invalid booking ID"}), 400

    if not booking:
        return jsonify({"error": "Booking not found"}), 404

    db.bookings.update_one(
        {"_id": ObjectId(booking_id)},
        {"$set": {"status": "cancelled", "cancel_reason": reason, "updated_at": datetime.utcnow()}}
    )

    # Update trip status
    if booking.get('trip_id'):
        db.trips.update_one(
            {"_id": booking['trip_id']},
            {"$set": {"status": "cancelled", "updated_at": datetime.utcnow()}}
        )

    # Create notification for customer
    db.notifications.insert_one({
        "user_id": str(booking.get('customer_id', '')),
        "type": "booking_cancelled",
        "message": f"Your booking has been cancelled. Reason: {reason}",
        "read": False,
        "created_at": datetime.utcnow()
    })

    return jsonify({"message": "Booking cancelled successfully"}), 200


@admin_bp.route('/bookings/<booking_id>/refund', methods=['POST'])
@jwt_required()
@role_required('admin')
def process_refund(booking_id):
    db = get_db()
    data = sanitize_dict(request.get_json())
    amount = data.get('amount', 0)

    try:
        booking = db.bookings.find_one({"_id": ObjectId(booking_id)})
    except:
        return jsonify({"error": "Invalid booking ID"}), 400

    if not booking:
        return jsonify({"error": "Booking not found"}), 404

    refund = {
        "booking_id": ObjectId(booking_id),
        "amount": amount,
        "status": "processed",
        "type": "refund",
        "created_at": datetime.utcnow()
    }
    db.payments.insert_one(refund)

    db.bookings.update_one(
        {"_id": ObjectId(booking_id)},
        {"$set": {"refund_status": "processed", "refund_amount": amount, "updated_at": datetime.utcnow()}}
    )

    return jsonify({"message": "Refund processed successfully"}), 200


@admin_bp.route('/destinations', methods=['POST'])
@jwt_required()
@role_required('admin')
def create_destination():
    data = sanitize_dict(request.get_json())
    db = get_db()

    destination = {
        "name": data.get('name', ''),
        "state": data.get('state', ''),
        "description": data.get('description', ''),
        "image": data.get('image', ''),
        "is_active": True,
        "created_at": datetime.utcnow()
    }

    result = db.destinations.insert_one(destination)
    destination['_id'] = result.inserted_id

    return jsonify({"message": "Destination created", "destination": serialize_doc(destination)}), 201


@admin_bp.route('/cities', methods=['POST'])
@jwt_required()
@role_required('admin')
def create_city():
    data = sanitize_dict(request.get_json())
    db = get_db()

    city = {
        "name": data.get('name', ''),
        "state_id": data.get('state_id', ''),
        "state_name": data.get('state_name', ''),
        "description": data.get('description', ''),
        "image": data.get('image', ''),
        "is_active": True,
        "created_at": datetime.utcnow()
    }

    result = db.cities.insert_one(city)
    city['_id'] = result.inserted_id

    return jsonify({"message": "City created", "city": serialize_doc(city)}), 201


@admin_bp.route('/attractions', methods=['POST'])
@jwt_required()
@role_required('admin')
def create_attraction():
    data = sanitize_dict(request.get_json())
    db = get_db()

    attraction = {
        "name": data.get('name', ''),
        "city_id": data.get('city_id', ''),
        "city_name": data.get('city_name', ''),
        "description": data.get('description', ''),
        "image": data.get('image', ''),
        "entry_fee": data.get('entry_fee', 0),
        "duration": data.get('duration', ''),
        "category": data.get('category', 'sightseeing'),
        "is_active": True,
        "created_at": datetime.utcnow()
    }

    result = db.attractions.insert_one(attraction)
    attraction['_id'] = result.inserted_id

    return jsonify({"message": "Attraction created", "attraction": serialize_doc(attraction)}), 201


@admin_bp.route('/hotels', methods=['POST'])
@jwt_required()
@role_required('admin')
def create_hotel():
    data = sanitize_dict(request.get_json())
    db = get_db()

    hotel = {
        "name": data.get('name', ''),
        "city_id": data.get('city_id', ''),
        "city_name": data.get('city_name', ''),
        "description": data.get('description', ''),
        "image": data.get('image', ''),
        "address": data.get('address', ''),
        "rating": data.get('rating', 3),
        "price_per_night": data.get('price_per_night', 0),
        "amenities": data.get('amenities', []),
        "is_active": True,
        "created_at": datetime.utcnow()
    }

    result = db.hotels.insert_one(hotel)
    hotel['_id'] = result.inserted_id

    return jsonify({"message": "Hotel created", "hotel": serialize_doc(hotel)}), 201


@admin_bp.route('/destinations', methods=['GET'])
@jwt_required()
@role_required('admin')
def get_destinations():
    db = get_db()
    destinations = list(db.destinations.find({}))
    return jsonify({"states": [serialize_doc(d) for d in destinations]}), 200


@admin_bp.route('/destinations/<dest_id>', methods=['PUT'])
@jwt_required()
@role_required('admin')
def update_destination(dest_id):
    data = sanitize_dict(request.get_json())
    db = get_db()
    data.pop('_id', None)
    data['updated_at'] = datetime.utcnow()
    db.destinations.update_one({"_id": ObjectId(dest_id)}, {"$set": data})
    return jsonify({"message": "Destination updated"}), 200


@admin_bp.route('/destinations/<dest_id>', methods=['DELETE'])
@jwt_required()
@role_required('admin')
def delete_destination(dest_id):
    db = get_db()
    db.destinations.delete_one({"_id": ObjectId(dest_id)})
    return jsonify({"message": "Destination deleted"}), 200


@admin_bp.route('/cities', methods=['GET'])
@jwt_required()
@role_required('admin')
def get_cities():
    db = get_db()
    cities = list(db.cities.find({}))
    return jsonify({"cities": [serialize_doc(c) for c in cities]}), 200


@admin_bp.route('/cities/<city_id>', methods=['PUT'])
@jwt_required()
@role_required('admin')
def update_city(city_id):
    data = sanitize_dict(request.get_json())
    db = get_db()
    data.pop('_id', None)
    data['updated_at'] = datetime.utcnow()
    db.cities.update_one({"_id": ObjectId(city_id)}, {"$set": data})
    return jsonify({"message": "City updated"}), 200


@admin_bp.route('/cities/<city_id>', methods=['DELETE'])
@jwt_required()
@role_required('admin')
def delete_city(city_id):
    db = get_db()
    db.cities.delete_one({"_id": ObjectId(city_id)})
    return jsonify({"message": "City deleted"}), 200


@admin_bp.route('/attractions', methods=['GET'])
@jwt_required()
@role_required('admin')
def get_attractions():
    db = get_db()
    attractions = list(db.attractions.find({}))
    return jsonify({"attractions": [serialize_doc(a) for a in attractions]}), 200


@admin_bp.route('/attractions/<attr_id>', methods=['PUT'])
@jwt_required()
@role_required('admin')
def update_attraction(attr_id):
    data = sanitize_dict(request.get_json())
    db = get_db()
    data.pop('_id', None)
    data['updated_at'] = datetime.utcnow()
    db.attractions.update_one({"_id": ObjectId(attr_id)}, {"$set": data})
    return jsonify({"message": "Attraction updated"}), 200


@admin_bp.route('/attractions/<attr_id>', methods=['DELETE'])
@jwt_required()
@role_required('admin')
def delete_attraction(attr_id):
    db = get_db()
    db.attractions.delete_one({"_id": ObjectId(attr_id)})
    return jsonify({"message": "Attraction deleted"}), 200


@admin_bp.route('/hotels', methods=['GET'])
@jwt_required()
@role_required('admin')
def get_hotels():
    db = get_db()
    hotels = list(db.hotels.find({}))
    return jsonify({"hotels": [serialize_doc(h) for h in hotels]}), 200


@admin_bp.route('/hotels/<hotel_id>', methods=['PUT'])
@jwt_required()
@role_required('admin')
def update_hotel(hotel_id):
    data = sanitize_dict(request.get_json())
    db = get_db()
    data.pop('_id', None)
    data['updated_at'] = datetime.utcnow()
    db.hotels.update_one({"_id": ObjectId(hotel_id)}, {"$set": data})
    return jsonify({"message": "Hotel updated"}), 200


@admin_bp.route('/hotels/<hotel_id>', methods=['DELETE'])
@jwt_required()
@role_required('admin')
def delete_hotel(hotel_id):
    db = get_db()
    db.hotels.delete_one({"_id": ObjectId(hotel_id)})
    return jsonify({"message": "Hotel deleted"}), 200


@admin_bp.route('/audit-logs', methods=['GET'])
@jwt_required()
@role_required('admin')
def get_audit_logs():
    db = get_db()
    page = request.args.get('page', 1, type=int)
    result = paginate(db.audit_logs, {}, page=page, sort_field='timestamp')
    return jsonify(result), 200
