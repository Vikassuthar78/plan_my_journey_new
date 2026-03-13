from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from bson import ObjectId

from app import get_db
from app.utils.helpers import serialize_doc

destinations_bp = Blueprint('destinations', __name__)


@destinations_bp.route('/states', methods=['GET'])
@jwt_required()
def get_states():
    db = get_db()
    states = list(db.destinations.find({"is_active": True}).sort("name", 1))
    return jsonify({"states": serialize_doc(states)}), 200


@destinations_bp.route('/states/<state_id>/cities', methods=['GET'])
@jwt_required()
def get_cities(state_id):
    db = get_db()
    cities = list(db.cities.find({"state_id": state_id, "is_active": True}).sort("name", 1))
    return jsonify({"cities": serialize_doc(cities)}), 200


@destinations_bp.route('/cities/<city_id>/attractions', methods=['GET'])
@jwt_required()
def get_attractions(city_id):
    db = get_db()
    category = request.args.get('category', '')

    query = {"city_id": city_id, "is_active": True}
    if category:
        query["category"] = category

    attractions = list(db.attractions.find(query).sort("name", 1))
    return jsonify({"attractions": serialize_doc(attractions)}), 200


@destinations_bp.route('/cities/<city_id>/hotels', methods=['GET'])
@jwt_required()
def get_hotels(city_id):
    db = get_db()
    min_price = request.args.get('min_price', 0, type=int)
    max_price = request.args.get('max_price', 100000, type=int)
    min_rating = request.args.get('min_rating', 0, type=int)

    query = {
        "city_id": city_id,
        "is_active": True,
        "price_per_night": {"$gte": min_price, "$lte": max_price},
        "rating": {"$gte": min_rating}
    }

    hotels = list(db.hotels.find(query).sort("rating", -1))
    return jsonify({"hotels": serialize_doc(hotels)}), 200


@destinations_bp.route('/search', methods=['GET'])
@jwt_required()
def search_destinations():
    db = get_db()
    q = request.args.get('q', '')

    if not q:
        return jsonify({"results": []}), 200

    results = {
        "states": serialize_doc(list(db.destinations.find(
            {"name": {"$regex": q, "$options": "i"}, "is_active": True}
        ).limit(5))),
        "cities": serialize_doc(list(db.cities.find(
            {"name": {"$regex": q, "$options": "i"}, "is_active": True}
        ).limit(5))),
        "attractions": serialize_doc(list(db.attractions.find(
            {"name": {"$regex": q, "$options": "i"}, "is_active": True}
        ).limit(5)))
    }

    return jsonify({"results": results}), 200
