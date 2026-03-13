import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'fallback-secret-key')
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'fallback-jwt-secret')
    MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/plan_my_journey')
    FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://localhost:5173')
    JWT_ACCESS_TOKEN_EXPIRES = 3600  # 1 hour
    JWT_REFRESH_TOKEN_EXPIRES = 2592000  # 30 days
    RATE_LIMIT_DEFAULT = "200 per hour"
    UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'uploads')
