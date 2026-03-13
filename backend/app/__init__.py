from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from pymongo import MongoClient
from datetime import timedelta
from app.config import Config
import os

mongo_client = None
db = None
jwt = JWTManager()
limiter = Limiter(key_func=get_remote_address, default_limits=["200 per hour"])

def get_db():
    global db
    return db

def create_app():
    global mongo_client, db

    app = Flask(__name__)
    app.config['SECRET_KEY'] = Config.SECRET_KEY
    app.config['JWT_SECRET_KEY'] = Config.JWT_SECRET_KEY
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(seconds=Config.JWT_ACCESS_TOKEN_EXPIRES)
    app.config['JWT_REFRESH_TOKEN_EXPIRES'] = timedelta(seconds=Config.JWT_REFRESH_TOKEN_EXPIRES)
    app.config['JWT_TOKEN_LOCATION'] = ['headers']
    app.config['JWT_HEADER_NAME'] = 'Authorization'
    app.config['JWT_HEADER_TYPE'] = 'Bearer'

    # CORS
    CORS(app, resources={r"/api/*": {"origins": Config.FRONTEND_URL}}, supports_credentials=True)

    # JWT
    jwt.init_app(app)

    # Rate limiter
    limiter.init_app(app)

    # MongoDB
    mongo_client = MongoClient(Config.MONGO_URI)
    db = mongo_client.get_database()

    # Create indexes
    _create_indexes(db)

    # Register blueprints
    from app.routes.auth import auth_bp
    from app.routes.customer import customer_bp
    from app.routes.admin import admin_bp
    from app.routes.guide import guide_bp
    from app.routes.destinations import destinations_bp
    from app.routes.bookings import bookings_bp
    from app.routes.payments import payments_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(customer_bp, url_prefix='/api/customer')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    app.register_blueprint(guide_bp, url_prefix='/api/guide')
    app.register_blueprint(destinations_bp, url_prefix='/api/destinations')
    app.register_blueprint(bookings_bp, url_prefix='/api/bookings')
    app.register_blueprint(payments_bp, url_prefix='/api/payments')

    # Error handlers
    @app.errorhandler(404)
    def not_found(e):
        return {"error": "Resource not found"}, 404

    @app.errorhandler(500)
    def server_error(e):
        return {"error": "Internal server error"}, 500

    @app.errorhandler(429)
    def rate_limit_exceeded(e):
        return {"error": "Rate limit exceeded. Try again later."}, 429

    return app


def _create_indexes(db):
    db.users.create_index("email", unique=True)
    db.users.create_index("role")
    db.trips.create_index("customer_id")
    db.trips.create_index("guide_id")
    db.trips.create_index("status")
    db.bookings.create_index("customer_id")
    db.bookings.create_index("trip_id")
    db.destinations.create_index("state")
    db.cities.create_index("state_id")
    db.attractions.create_index("city_id")
    db.hotels.create_index("city_id")
    db.payments.create_index("booking_id")
    db.notifications.create_index("user_id")
    db.reviews.create_index("trip_id")
