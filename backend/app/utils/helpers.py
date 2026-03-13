from bson import ObjectId
from datetime import datetime


def serialize_doc(doc):
    """Convert MongoDB document to JSON-serializable dict."""
    if doc is None:
        return None
    if isinstance(doc, list):
        return [serialize_doc(d) for d in doc]
    if isinstance(doc, dict):
        result = {}
        for key, value in doc.items():
            if isinstance(value, ObjectId):
                result[key] = str(value)
            elif isinstance(value, datetime):
                result[key] = value.isoformat()
            elif isinstance(value, dict):
                result[key] = serialize_doc(value)
            elif isinstance(value, list):
                result[key] = [serialize_doc(item) if isinstance(item, (dict, ObjectId)) else item for item in value]
            else:
                result[key] = value
        return result
    if isinstance(doc, ObjectId):
        return str(doc)
    return doc


def paginate(collection, query, page=1, per_page=20, sort_field='created_at', sort_order=-1):
    """Paginate MongoDB query results."""
    skip = (page - 1) * per_page
    total = collection.count_documents(query)
    items = list(
        collection.find(query)
        .sort(sort_field, sort_order)
        .skip(skip)
        .limit(per_page)
    )
    return {
        "items": serialize_doc(items),
        "total": total,
        "page": page,
        "per_page": per_page,
        "pages": (total + per_page - 1) // per_page
    }


def generate_itinerary(trip_data):
    """Generate a personalized itinerary based on trip selections."""
    cities = trip_data.get('cities', [])
    attractions = trip_data.get('attractions', [])
    start_date = trip_data.get('start_date')
    end_date = trip_data.get('end_date')

    if not start_date or not end_date:
        return []

    from datetime import timedelta
    start = datetime.fromisoformat(start_date) if isinstance(start_date, str) else start_date
    end = datetime.fromisoformat(end_date) if isinstance(end_date, str) else end_date
    total_days = (end - start).days + 1

    itinerary = []
    attraction_idx = 0

    for day in range(total_days):
        current_date = start + timedelta(days=day)
        day_plan = {
            "day": day + 1,
            "date": current_date.isoformat(),
            "activities": []
        }

        # Distribute attractions across days
        attractions_per_day = max(1, len(attractions) // total_days)
        for _ in range(attractions_per_day):
            if attraction_idx < len(attractions):
                day_plan["activities"].append({
                    "type": "attraction",
                    "name": attractions[attraction_idx].get('name', 'Sightseeing'),
                    "time": "10:00 AM" if len(day_plan["activities"]) == 0 else "02:00 PM",
                    "duration": "2-3 hours"
                })
                attraction_idx += 1

        # Add meals
        day_plan["activities"].insert(0, {"type": "meal", "name": "Breakfast at hotel", "time": "08:00 AM"})
        day_plan["activities"].append({"type": "meal", "name": "Lunch", "time": "12:30 PM"})
        day_plan["activities"].append({"type": "meal", "name": "Dinner", "time": "07:30 PM"})

        itinerary.append(day_plan)

    return itinerary
