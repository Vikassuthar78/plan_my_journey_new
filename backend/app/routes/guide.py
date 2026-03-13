from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from datetime import datetime, timedelta
from bson import ObjectId

from app import get_db
from app.middleware import role_required, get_current_user
from app.utils.helpers import serialize_doc

guide_bp = Blueprint('guide', __name__)


def enrich_trip(db, trip_doc):
    """Enrich a trip document with customer name, destination info, traveler count."""
    t = serialize_doc(trip_doc) if not isinstance(trip_doc, dict) else trip_doc
    # Customer name
    cust_id = t.get('customer_id')
    if cust_id and not t.get('customer_name'):
        try:
            cust = db.users.find_one({"_id": ObjectId(cust_id)})
            if cust:
                t['customer_name'] = cust.get('name', '')
                t['customer_phone'] = cust.get('phone', '')
                t['customer_email'] = cust.get('email', '')
        except Exception:
            pass
    # Destination name from state + cities
    if not t.get('destination_name'):
        city_names = [c.get('name', '') for c in t.get('cities', []) if c.get('name')]
        state = t.get('state', '')
        if city_names:
            t['destination_name'] = ', '.join(city_names[:2])
            if len(city_names) > 2:
                t['destination_name'] += f' +{len(city_names) - 2}'
        elif state:
            t['destination_name'] = state
    # Travelers count
    travelers = t.get('travelers', [])
    if isinstance(travelers, list):
        t['travelers_count'] = len(travelers) or 1
    else:
        t['travelers_count'] = travelers or 1
    # Duration
    if not t.get('duration_days') and t.get('start_date') and t.get('end_date'):
        try:
            sd = datetime.fromisoformat(str(t['start_date']))
            ed = datetime.fromisoformat(str(t['end_date']))
            t['duration_days'] = (ed - sd).days + 1
        except Exception:
            pass
    # Hotels from cities
    if not t.get('hotel') and t.get('cities'):
        for city in t['cities']:
            if city.get('hotel') and city['hotel'].get('name'):
                t['hotel'] = city['hotel']
                break
    return t


@guide_bp.route('/dashboard', methods=['GET'])
@jwt_required()
@role_required('guide')
def dashboard():
    user = get_current_user()
    db = get_db()
    guide_id = user['_id']

    raw_trips = list(db.trips.find({"guide_id": str(guide_id)}).sort("start_date", 1))
    assigned_trips = [enrich_trip(db, t) for t in raw_trips]

    today = datetime.utcnow().strftime('%Y-%m-%d')
    todays_pickups = [
        t for t in assigned_trips
        if str(t.get('start_date', '')).startswith(today) and t.get('status') in ['confirmed', 'ongoing']
    ]

    active_trips = [t for t in assigned_trips if t.get('status') == 'ongoing']
    upcoming_trips = [t for t in assigned_trips if t.get('status') in ['confirmed', 'planning']]
    completed_trips = [t for t in assigned_trips if t.get('status') == 'completed']

    # Unread notifications count
    unread_notifs = db.notifications.count_documents({"user_id": str(guide_id), "read": False})

    return jsonify({
        "assigned_trips": serialize_doc(assigned_trips),
        "todays_pickups": serialize_doc(todays_pickups),
        "active_trips": len(active_trips),
        "upcoming_trips": len(upcoming_trips),
        "completed_trips": len(completed_trips),
        "total_trips": len(assigned_trips),
        "unread_notifications": unread_notifs,
        "guide_name": user['name']
    }), 200


@guide_bp.route('/trips', methods=['GET'])
@jwt_required()
@role_required('guide')
def get_all_trips():
    """Get all trips assigned to this guide with optional status filter."""
    user = get_current_user()
    db = get_db()
    guide_id = str(user['_id'])
    status = request.args.get('status', '')

    query = {"guide_id": guide_id}
    if status:
        query["status"] = status

    raw_trips = list(db.trips.find(query).sort("start_date", -1))
    trips = [enrich_trip(db, t) for t in raw_trips]

    return jsonify({"trips": serialize_doc(trips)}), 200


@guide_bp.route('/schedule', methods=['GET'])
@jwt_required()
@role_required('guide')
def get_schedule():
    """Get upcoming schedule for the guide."""
    user = get_current_user()
    db = get_db()
    guide_id = str(user['_id'])

    today = datetime.utcnow().strftime('%Y-%m-%d')
    raw_trips = list(
        db.trips.find({
            "guide_id": guide_id,
            "status": {"$in": ["confirmed", "ongoing", "planning"]},
            "start_date": {"$gte": today}
        }).sort("start_date", 1)
    )
    # Also get trips that started but not completed (ongoing)
    ongoing = list(
        db.trips.find({
            "guide_id": guide_id,
            "status": "ongoing"
        }).sort("start_date", 1)
    )
    # Merge without duplicates
    seen = set()
    all_trips = []
    for t in ongoing + raw_trips:
        tid = str(t['_id'])
        if tid not in seen:
            seen.add(tid)
            all_trips.append(enrich_trip(db, t))

    return jsonify({"schedule": serialize_doc(all_trips)}), 200


@guide_bp.route('/trips/<trip_id>', methods=['GET'])
@jwt_required()
@role_required('guide')
def get_trip_detail(trip_id):
    user = get_current_user()
    db = get_db()

    try:
        trip = db.trips.find_one({"_id": ObjectId(trip_id), "guide_id": str(user['_id'])})
    except:
        return jsonify({"error": "Invalid trip ID"}), 400

    if not trip:
        return jsonify({"error": "Trip not found or not assigned to you"}), 404

    enriched = enrich_trip(db, trip)

    # Get hotels from cities
    hotels = []
    for city in enriched.get('cities', []):
        if city.get('hotel') and city['hotel'].get('name'):
            hotels.append(city['hotel'])

    # Flatten attractions from cities
    all_attractions = []
    for city in enriched.get('cities', []):
        for attr in city.get('attractions', []):
            if isinstance(attr, dict):
                attr['city_name'] = city.get('name', '')
                all_attractions.append(attr)
            elif isinstance(attr, str):
                all_attractions.append({"name": attr, "city_name": city.get('name', '')})

    enriched['all_attractions'] = all_attractions
    enriched['all_hotels'] = hotels

    # Get issues for this trip
    issues = list(db.issues.find({"trip_id": trip_id}).sort("created_at", -1))

    return jsonify({
        "trip": serialize_doc(enriched),
        "issues": serialize_doc(issues)
    }), 200


@guide_bp.route('/trips/<trip_id>/status', methods=['PUT'])
@jwt_required()
@role_required('guide')
def update_trip_status(trip_id):
    user = get_current_user()
    db = get_db()
    data = request.get_json()
    new_status = data.get('status')

    # Guides can only set arrived or completed
    allowed_statuses = ['ongoing', 'completed']
    if new_status not in allowed_statuses:
        return jsonify({"error": f"Guides can only update status to: {', '.join(allowed_statuses)}"}), 400

    try:
        trip = db.trips.find_one({"_id": ObjectId(trip_id), "guide_id": str(user['_id'])})
    except:
        return jsonify({"error": "Invalid trip ID"}), 400

    if not trip:
        return jsonify({"error": "Trip not found or not assigned to you"}), 404

    db.trips.update_one(
        {"_id": ObjectId(trip_id)},
        {"$set": {"status": new_status, "updated_at": datetime.utcnow()}}
    )

    # Notify admin
    db.notifications.insert_one({
        "user_id": "admin",
        "type": "trip_status_update",
        "message": f"Guide {user['name']} updated trip status to {new_status}",
        "trip_id": trip_id,
        "read": False,
        "created_at": datetime.utcnow()
    })

    return jsonify({"message": f"Trip status updated to {new_status}"}), 200


@guide_bp.route('/trips/<trip_id>/report-issue', methods=['POST'])
@jwt_required()
@role_required('guide')
def report_issue(trip_id):
    user = get_current_user()
    db = get_db()
    data = request.get_json()

    try:
        trip = db.trips.find_one({"_id": ObjectId(trip_id), "guide_id": str(user['_id'])})
    except:
        return jsonify({"error": "Invalid trip ID"}), 400

    if not trip:
        return jsonify({"error": "Trip not found or not assigned to you"}), 404

    issue = {
        "trip_id": trip_id,
        "guide_id": str(user['_id']),
        "guide_name": user['name'],
        "type": data.get('type', 'general'),
        "description": data.get('description', ''),
        "severity": data.get('severity', 'medium'),
        "status": "open",
        "created_at": datetime.utcnow()
    }

    db.issues.insert_one(issue)

    # Notify all admins
    db.notifications.insert_one({
        "user_id": "admin",
        "type": "issue_reported",
        "message": f"Guide {user['name']} reported an issue: {data.get('description', '')[:50]}",
        "trip_id": trip_id,
        "read": False,
        "created_at": datetime.utcnow()
    })

    return jsonify({"message": "Issue reported successfully"}), 201


@guide_bp.route('/notifications', methods=['GET'])
@jwt_required()
@role_required('guide')
def get_notifications():
    user = get_current_user()
    db = get_db()

    notifications = list(
        db.notifications.find({"user_id": str(user['_id'])})
        .sort("created_at", -1)
        .limit(50)
    )

    return jsonify({"notifications": serialize_doc(notifications)}), 200


@guide_bp.route('/notifications/read', methods=['PUT'])
@jwt_required()
@role_required('guide')
def mark_notifications_read():
    user = get_current_user()
    db = get_db()
    data = request.get_json() or {}
    notif_ids = data.get('ids', [])

    if notif_ids:
        # Mark specific notifications
        db.notifications.update_many(
            {"_id": {"$in": [ObjectId(nid) for nid in notif_ids]}, "user_id": str(user['_id'])},
            {"$set": {"read": True}}
        )
    else:
        # Mark all as read
        db.notifications.update_many(
            {"user_id": str(user['_id']), "read": False},
            {"$set": {"read": True}}
        )

    return jsonify({"message": "Notifications marked as read"}), 200
