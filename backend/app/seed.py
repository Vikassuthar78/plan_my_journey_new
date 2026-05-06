"""
Database seed script for Plan My Journey.
Run: python -m app.seed
"""
from pymongo import MongoClient
from datetime import datetime, timedelta
import bcrypt
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/plan_my_journey')

client = MongoClient(MONGO_URI)
db = client.get_database()


def hash_pw(password):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')


def seed():
    print("🌱 Seeding database...")

    # Clear existing data
    for col in ['users', 'destinations', 'cities', 'attractions', 'hotels', 'trips', 'bookings', 'payments', 'reviews', 'notifications', 'audit_logs', 'issues']:
        db[col].delete_many({})

    # --- USERS ---
    users = [
        {"name": "Admin User", "email": "admin@planmyjourney.com", "password": hash_pw("Admin@123"), "role": "admin", "phone": "+91-9876543210", "avatar": "", "saved_travelers": [], "saved_payment_methods": [], "saved_places": [], "is_active": True, "created_at": datetime.utcnow(), "updated_at": datetime.utcnow()},
        {"name": "Vikas Suthar", "email": "vikas@example.com", "password": hash_pw("Customer@123"), "role": "customer", "phone": "+91-9876543211", "avatar": "", "saved_travelers": [{"name": "Vikas Suthar", "age": 25, "id_type": "Aadhar", "id_number": "XXXX-XXXX-1234"}], "saved_payment_methods": [{"type": "card", "last4": "4242", "brand": "Visa"}], "saved_places": ["Rajasthan", "Goa"], "is_active": True, "created_at": datetime.utcnow(), "updated_at": datetime.utcnow()},
        {"name": "Priya Sharma", "email": "priya@example.com", "password": hash_pw("Customer@123"), "role": "customer", "phone": "+91-9876543212", "avatar": "", "saved_travelers": [], "saved_payment_methods": [], "saved_places": [], "is_active": True, "created_at": datetime.utcnow(), "updated_at": datetime.utcnow()},
        {"name": "Rajesh Guide", "email": "rajesh@guide.com", "password": hash_pw("Guide@1234"), "role": "guide", "phone": "+91-9876543213", "avatar": "", "saved_travelers": [], "saved_payment_methods": [], "saved_places": [], "is_active": True, "created_at": datetime.utcnow(), "updated_at": datetime.utcnow()},
        {"name": "Amit Driver", "email": "amit@guide.com", "password": hash_pw("Guide@1234"), "role": "guide", "phone": "+91-9876543214", "avatar": "", "saved_travelers": [], "saved_payment_methods": [], "saved_places": [], "is_active": True, "created_at": datetime.utcnow(), "updated_at": datetime.utcnow()},
    ]
    user_ids = db.users.insert_many(users).inserted_ids
    print(f"  ✅ {len(users)} users created")

    # --- DESTINATIONS (States) ---
    states = [
        {"name": "Rajasthan", "state": "Rajasthan", "description": "The Land of Kings — a vibrant tapestry of desert landscapes, majestic forts, and colorful culture.", "image": "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800", "is_active": True, "created_at": datetime.utcnow()},
        {"name": "Goa", "state": "Goa", "description": "Sun, sand, and serenity — India's paradise on the western coast.", "image": "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800", "is_active": True, "created_at": datetime.utcnow()},
        {"name": "Kerala", "state": "Kerala", "description": "God's Own Country — lush backwaters, tea gardens, and tropical beaches.", "image": "https://th.bing.com/th/id/OIP.YJjLxGxNQ8Y9YlI1XlmZMAHaEK?w=333&h=187&c=7&r=0&o=7&dpr=2.5&pid=1.7&rm=3", "is_active": True, "created_at": datetime.utcnow()},
        {"name": "Himachal Pradesh", "state": "Himachal Pradesh", "description": "The abode of snow — stunning Himalayan valleys, ancient temples, and adventure sports.", "image": "https://th.bing.com/th/id/OIP.2ttZBXJxWbxyarSM87r8iAHaE8?w=253&h=180&c=7&r=0&o=7&dpr=2.5&pid=1.7&rm=3", "is_active": True, "created_at": datetime.utcnow()},
        {"name": "Karnataka", "state": "Karnataka", "description": "From the tech hub of Bangalore to the ruins of Hampi — a land of contrasts.", "image": "D:\\desk\\VIBECODE_APP\\frontend\\public\\STATES IMAGE\\KARNATAKA_5.jpg", "is_active": True, "created_at": datetime.utcnow()},
        {"name": "Tamil Nadu", "state": "Tamil Nadu", "description": "Ancient temples, colonial heritage, and serene hill stations.", "image": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800", "is_active": True, "created_at": datetime.utcnow()},
        {"name": "Uttarakhand", "state": "Uttarakhand", "description": "Dev Bhoomi — the land of gods with spiritual destinations and adventure trails.", "image": "https://images.unsplash.com/photo-1564574685150-a6d2375d5862?w=800", "is_active": True, "created_at": datetime.utcnow()},
        {"name": "Maharashtra", "state": "Maharashtra", "description": "From the bustling streets of Mumbai to the caves of Ajanta and Ellora.", "image": "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=800", "is_active": True, "created_at": datetime.utcnow()},
    ]
    state_ids = db.destinations.insert_many(states).inserted_ids
    print(f"  ✅ {len(states)} destinations created")

    # --- CITIES ---
    cities_data = [
        # Rajasthan
        {"name": "Jaipur", "state_id": str(state_ids[0]), "state_name": "Rajasthan", "description": "The Pink City — royal palaces, forts, and vibrant bazaars.", "image": "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=800", "is_active": True, "created_at": datetime.utcnow()},
        {"name": "Udaipur", "state_id": str(state_ids[0]), "state_name": "Rajasthan", "description": "The City of Lakes — romantic palaces and serene waterways.", "image": "https://images.unsplash.com/photo-1602217013927-45af8f95b5a3?w=800", "is_active": True, "created_at": datetime.utcnow()},
        {"name": "Jodhpur", "state_id": str(state_ids[0]), "state_name": "Rajasthan", "description": "The Blue City — majestic Mehrangarh Fort and vibrant markets.", "image": "https://images.unsplash.com/photo-1558431382-27e303142255?w=800", "is_active": True, "created_at": datetime.utcnow()},
        {"name": "Jaisalmer", "state_id": str(state_ids[0]), "state_name": "Rajasthan", "description": "The Golden City — desert safari and sandstone architecture.", "image": "https://images.unsplash.com/photo-1611834037592-a3a0a16c4a56?w=800", "is_active": True, "created_at": datetime.utcnow()},
        # Goa
        {"name": "North Goa", "state_id": str(state_ids[1]), "state_name": "Goa", "description": "Beaches, nightlife, and Portuguese heritage.", "image": "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800", "is_active": True, "created_at": datetime.utcnow()},
        {"name": "South Goa", "state_id": str(state_ids[1]), "state_name": "Goa", "description": "Serene beaches and peaceful villages.", "image": "https://images.unsplash.com/photo-1587922546307-776227941871?w=800", "is_active": True, "created_at": datetime.utcnow()},
        # Kerala
        {"name": "Munnar", "state_id": str(state_ids[2]), "state_name": "Kerala", "description": "Rolling tea gardens and misty mountains.", "image": "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800", "is_active": True, "created_at": datetime.utcnow()},
        {"name": "Alleppey", "state_id": str(state_ids[2]), "state_name": "Kerala", "description": "Houseboat cruises through backwaters.", "image": "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?w=800", "is_active": True, "created_at": datetime.utcnow()},
        {"name": "Kochi", "state_id": str(state_ids[2]), "state_name": "Kerala", "description": "A port city with rich colonial and cultural history.", "image": "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=800", "is_active": True, "created_at": datetime.utcnow()},
        # Himachal
        {"name": "Manali", "state_id": str(state_ids[3]), "state_name": "Himachal Pradesh", "description": "A paradise for adventure lovers and honeymooners.", "image": "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800", "is_active": True, "created_at": datetime.utcnow()},
        {"name": "Shimla", "state_id": str(state_ids[3]), "state_name": "Himachal Pradesh", "description": "The Queen of Hills — colonial charm meets mountain beauty.", "image": "https://images.unsplash.com/photo-1597074866923-dc0589150887?w=800", "is_active": True, "created_at": datetime.utcnow()},
        {"name": "Dharamshala", "state_id": str(state_ids[3]), "state_name": "Himachal Pradesh", "description": "Home of the Dalai Lama and Tibetan culture.", "image": "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=800", "is_active": True, "created_at": datetime.utcnow()},
    ]
    city_ids = db.cities.insert_many(cities_data).inserted_ids
    print(f"  ✅ {len(cities_data)} cities created")

    # --- ATTRACTIONS ---
    attractions_data = [
        # Jaipur
        {"name": "Amber Fort", "city_id": str(city_ids[0]), "city_name": "Jaipur", "description": "A stunning hilltop fort with intricate mirror work and panoramic views.", "image": "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800", "entry_fee": 500, "duration": "2-3 hours", "category": "heritage", "is_active": True, "created_at": datetime.utcnow()},
        {"name": "Hawa Mahal", "city_id": str(city_ids[0]), "city_name": "Jaipur", "description": "The iconic Palace of Winds with 953 windows.", "image": "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=800", "entry_fee": 200, "duration": "1-2 hours", "category": "heritage", "is_active": True, "created_at": datetime.utcnow()},
        {"name": "City Palace", "city_id": str(city_ids[0]), "city_name": "Jaipur", "description": "A magnificent fusion of Rajasthani and Mughal architecture.", "image": "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800", "entry_fee": 700, "duration": "2 hours", "category": "heritage", "is_active": True, "created_at": datetime.utcnow()},
        {"name": "Jantar Mantar", "city_id": str(city_ids[0]), "city_name": "Jaipur", "description": "UNESCO World Heritage astronomical instruments.", "image": "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800", "entry_fee": 200, "duration": "1 hour", "category": "heritage", "is_active": True, "created_at": datetime.utcnow()},
        # Udaipur
        {"name": "Lake Pichola", "city_id": str(city_ids[1]), "city_name": "Udaipur", "description": "A serene artificial lake with royal palaces on its banks.", "image": "https://images.unsplash.com/photo-1602217013927-45af8f95b5a3?w=800", "entry_fee": 300, "duration": "2 hours", "category": "nature", "is_active": True, "created_at": datetime.utcnow()},
        {"name": "City Palace Udaipur", "city_id": str(city_ids[1]), "city_name": "Udaipur", "description": "A sprawling complex of palaces overlooking Lake Pichola.", "image": "https://images.unsplash.com/photo-1602217013927-45af8f95b5a3?w=800", "entry_fee": 400, "duration": "3 hours", "category": "heritage", "is_active": True, "created_at": datetime.utcnow()},
        # Jodhpur
        {"name": "Mehrangarh Fort", "city_id": str(city_ids[2]), "city_name": "Jodhpur", "description": "One of India's largest forts perched on a 125m cliff.", "image": "https://images.unsplash.com/photo-1558431382-27e303142255?w=800", "entry_fee": 600, "duration": "3 hours", "category": "heritage", "is_active": True, "created_at": datetime.utcnow()},
        {"name": "Umaid Bhawan Palace", "city_id": str(city_ids[2]), "city_name": "Jodhpur", "description": "An extravagant palace-turned-hotel and museum.", "image": "https://images.unsplash.com/photo-1558431382-27e303142255?w=800", "entry_fee": 100, "duration": "1-2 hours", "category": "heritage", "is_active": True, "created_at": datetime.utcnow()},
        # North Goa
        {"name": "Baga Beach", "city_id": str(city_ids[4]), "city_name": "North Goa", "description": "Famous beach with water sports and nightlife.", "image": "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800", "entry_fee": 0, "duration": "Half day", "category": "beach", "is_active": True, "created_at": datetime.utcnow()},
        {"name": "Fort Aguada", "city_id": str(city_ids[4]), "city_name": "North Goa", "description": "A well-preserved 17th-century Portuguese fort.", "image": "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800", "entry_fee": 0, "duration": "1 hour", "category": "heritage", "is_active": True, "created_at": datetime.utcnow()},
        # Munnar
        {"name": "Tea Gardens", "city_id": str(city_ids[6]), "city_name": "Munnar", "description": "Endless rolling hills of tea plantations.", "image": "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800", "entry_fee": 100, "duration": "2-3 hours", "category": "nature", "is_active": True, "created_at": datetime.utcnow()},
        {"name": "Eravikulam National Park", "city_id": str(city_ids[6]), "city_name": "Munnar", "description": "Home to the endangered Nilgiri tahr.", "image": "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800", "entry_fee": 125, "duration": "3 hours", "category": "nature", "is_active": True, "created_at": datetime.utcnow()},
        # Manali
        {"name": "Rohtang Pass", "city_id": str(city_ids[9]), "city_name": "Manali", "description": "A high mountain pass with breathtaking snow views.", "image": "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800", "entry_fee": 500, "duration": "Full day", "category": "adventure", "is_active": True, "created_at": datetime.utcnow()},
        {"name": "Solang Valley", "city_id": str(city_ids[9]), "city_name": "Manali", "description": "Adventure sports paradise — paragliding, skiing, zorbing.", "image": "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800", "entry_fee": 0, "duration": "Half day", "category": "adventure", "is_active": True, "created_at": datetime.utcnow()},
        {"name": "Hadimba Temple", "city_id": str(city_ids[9]), "city_name": "Manali", "description": "An ancient cave temple surrounded by tall deodar trees.", "image": "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800", "entry_fee": 0, "duration": "1 hour", "category": "spiritual", "is_active": True, "created_at": datetime.utcnow()},
    ]
    attraction_ids = db.attractions.insert_many(attractions_data).inserted_ids
    print(f"  ✅ {len(attractions_data)} attractions created")

    # --- HOTELS ---
    hotels_data = [
        # Jaipur
        {"name": "The Oberoi Rajvilas", "city_id": str(city_ids[0]), "city_name": "Jaipur", "description": "Luxury resort set amidst 32 acres of beautifully landscaped gardens.", "image": "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800", "address": "Goner Road, Jaipur", "rating": 5, "price_per_night": 25000, "amenities": ["Pool", "Spa", "Restaurant", "WiFi", "Gym"], "is_active": True, "created_at": datetime.utcnow()},
        {"name": "Hotel Pearl Palace", "city_id": str(city_ids[0]), "city_name": "Jaipur", "description": "Award-winning budget hotel with rooftop restaurant.", "image": "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800", "address": "Hathroi Fort, Jaipur", "rating": 4, "price_per_night": 3500, "amenities": ["WiFi", "Restaurant", "AC"], "is_active": True, "created_at": datetime.utcnow()},
        {"name": "ITC Rajputana", "city_id": str(city_ids[0]), "city_name": "Jaipur", "description": "Premium heritage hotel in the heart of Jaipur.", "image": "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800", "address": "Palace Road, Jaipur", "rating": 5, "price_per_night": 12000, "amenities": ["Pool", "Spa", "Restaurant", "WiFi", "Gym", "Bar"], "is_active": True, "created_at": datetime.utcnow()},
        # Udaipur
        {"name": "Taj Lake Palace", "city_id": str(city_ids[1]), "city_name": "Udaipur", "description": "A floating marble palace on Lake Pichola.", "image": "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800", "address": "Lake Pichola, Udaipur", "rating": 5, "price_per_night": 35000, "amenities": ["Pool", "Spa", "Restaurant", "WiFi", "Boat"], "is_active": True, "created_at": datetime.utcnow()},
        {"name": "Hotel Lakend", "city_id": str(city_ids[1]), "city_name": "Udaipur", "description": "Lakeside hotel with beautiful views.", "image": "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800", "address": "Fateh Sagar, Udaipur", "rating": 4, "price_per_night": 5500, "amenities": ["Pool", "Restaurant", "WiFi", "Lake View"], "is_active": True, "created_at": datetime.utcnow()},
        # North Goa
        {"name": "Taj Fort Aguada", "city_id": str(city_ids[4]), "city_name": "North Goa", "description": "Luxury beachfront resort at Fort Aguada.", "image": "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800", "address": "Sinquerim, Goa", "rating": 5, "price_per_night": 18000, "amenities": ["Pool", "Spa", "Beach", "Restaurant", "WiFi"], "is_active": True, "created_at": datetime.utcnow()},
        {"name": "Goa Beach Resort", "city_id": str(city_ids[4]), "city_name": "North Goa", "description": "Comfortable beachside stay.", "image": "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800", "address": "Calangute, Goa", "rating": 3, "price_per_night": 4000, "amenities": ["Beach", "Restaurant", "WiFi"], "is_active": True, "created_at": datetime.utcnow()},
        # Munnar
        {"name": "Tea County Resort", "city_id": str(city_ids[6]), "city_name": "Munnar", "description": "Resort surrounded by tea plantations.", "image": "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800", "address": "Munnar, Kerala", "rating": 4, "price_per_night": 6000, "amenities": ["Restaurant", "WiFi", "Garden", "Tea Tours"], "is_active": True, "created_at": datetime.utcnow()},
        # Manali
        {"name": "The Himalayan", "city_id": str(city_ids[9]), "city_name": "Manali", "description": "Premium mountain resort with valley views.", "image": "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800", "address": "Log Huts Area, Manali", "rating": 5, "price_per_night": 15000, "amenities": ["Spa", "Restaurant", "WiFi", "Mountain View", "Fireplace"], "is_active": True, "created_at": datetime.utcnow()},
        {"name": "Johnson Lodge", "city_id": str(city_ids[9]), "city_name": "Manali", "description": "Cozy lodge with mountain charm.", "image": "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800", "address": "Mall Road, Manali", "rating": 3, "price_per_night": 3000, "amenities": ["WiFi", "Restaurant", "Bonfire"], "is_active": True, "created_at": datetime.utcnow()},
    ]
    hotel_ids = db.hotels.insert_many(hotels_data).inserted_ids
    print(f"  ✅ {len(hotels_data)} hotels created")

    # --- SAMPLE TRIPS ---
    now = datetime.utcnow()
    trips_data = [
        {
            "customer_id": user_ids[1],
            "title": "Royal Rajasthan Adventure",
            "state": "Rajasthan",
            "cities": [{"id": str(city_ids[0]), "name": "Jaipur"}, {"id": str(city_ids[1]), "name": "Udaipur"}],
            "attractions": [{"id": str(attraction_ids[0]), "name": "Amber Fort"}, {"id": str(attraction_ids[1]), "name": "Hawa Mahal"}, {"id": str(attraction_ids[4]), "name": "Lake Pichola"}],
            "travel_mode": "flight",
            "hotel_ids": [str(hotel_ids[1]), str(hotel_ids[4])],
            "travelers": [{"name": "Vikas Suthar", "age": 25, "id_type": "Aadhar", "id_number": "XXXX-XXXX-1234"}],
            "start_date": (now + timedelta(days=15)).strftime('%Y-%m-%d'),
            "end_date": (now + timedelta(days=20)).strftime('%Y-%m-%d'),
            "itinerary": [
                {"day": 1, "date": (now + timedelta(days=15)).strftime('%Y-%m-%d'), "activities": [{"type": "travel", "name": "Arrival in Jaipur", "time": "10:00 AM"}, {"type": "attraction", "name": "Hawa Mahal", "time": "02:00 PM", "duration": "2 hours"}]},
                {"day": 2, "date": (now + timedelta(days=16)).strftime('%Y-%m-%d'), "activities": [{"type": "attraction", "name": "Amber Fort", "time": "09:00 AM", "duration": "3 hours"}, {"type": "attraction", "name": "City Palace", "time": "02:00 PM", "duration": "2 hours"}]},
                {"day": 3, "date": (now + timedelta(days=17)).strftime('%Y-%m-%d'), "activities": [{"type": "travel", "name": "Drive to Udaipur", "time": "08:00 AM"}, {"type": "attraction", "name": "Lake Pichola", "time": "04:00 PM", "duration": "2 hours"}]},
            ],
            "status": "confirmed",
            "guide_id": str(user_ids[3]),
            "total_cost": 45000,
            "notes": "Looking forward to this trip!",
            "created_at": now - timedelta(days=5),
            "updated_at": now - timedelta(days=2)
        },
        {
            "customer_id": user_ids[1],
            "title": "Goa Beach Vacation",
            "state": "Goa",
            "cities": [{"id": str(city_ids[4]), "name": "North Goa"}],
            "attractions": [{"id": str(attraction_ids[8]), "name": "Baga Beach"}, {"id": str(attraction_ids[9]), "name": "Fort Aguada"}],
            "travel_mode": "flight",
            "hotel_ids": [str(hotel_ids[6])],
            "travelers": [{"name": "Vikas Suthar", "age": 25}],
            "start_date": (now - timedelta(days=10)).strftime('%Y-%m-%d'),
            "end_date": (now - timedelta(days=6)).strftime('%Y-%m-%d'),
            "itinerary": [],
            "status": "completed",
            "guide_id": str(user_ids[4]),
            "total_cost": 28000,
            "notes": "",
            "created_at": now - timedelta(days=30),
            "updated_at": now - timedelta(days=6)
        },
        {
            "customer_id": user_ids[2],
            "title": "Kerala Backwaters Exploration",
            "state": "Kerala",
            "cities": [{"id": str(city_ids[6]), "name": "Munnar"}, {"id": str(city_ids[7]), "name": "Alleppey"}],
            "attractions": [{"id": str(attraction_ids[10]), "name": "Tea Gardens"}, {"id": str(attraction_ids[11]), "name": "Eravikulam National Park"}],
            "travel_mode": "train",
            "hotel_ids": [str(hotel_ids[7])],
            "travelers": [{"name": "Priya Sharma", "age": 28}],
            "start_date": (now + timedelta(days=5)).strftime('%Y-%m-%d'),
            "end_date": (now + timedelta(days=10)).strftime('%Y-%m-%d'),
            "itinerary": [],
            "status": "planning",
            "guide_id": None,
            "total_cost": 32000,
            "notes": "First time in Kerala!",
            "created_at": now - timedelta(days=3),
            "updated_at": now - timedelta(days=1)
        },
    ]
    trip_ids = db.trips.insert_many(trips_data).inserted_ids
    print(f"  ✅ {len(trips_data)} trips created")

    # --- BOOKINGS ---
    bookings_data = [
        {
            "trip_id": trip_ids[0],
            "customer_id": user_ids[1],
            "customer_name": "Vikas Suthar",
            "customer_email": "vikas@example.com",
            "status": "confirmed",
            "total_amount": 45000,
            "payment_status": "completed",
            "travelers": trips_data[0]['travelers'],
            "special_requests": "Need early check-in",
            "created_at": now - timedelta(days=5),
            "updated_at": now - timedelta(days=2)
        },
        {
            "trip_id": trip_ids[1],
            "customer_id": user_ids[1],
            "customer_name": "Vikas Suthar",
            "customer_email": "vikas@example.com",
            "status": "completed",
            "total_amount": 28000,
            "payment_status": "completed",
            "travelers": trips_data[1]['travelers'],
            "special_requests": "",
            "created_at": now - timedelta(days=30),
            "updated_at": now - timedelta(days=6)
        },
    ]
    booking_ids = db.bookings.insert_many(bookings_data).inserted_ids
    print(f"  ✅ {len(bookings_data)} bookings created")

    # --- PAYMENTS ---
    payments_data = [
        {
            "booking_id": booking_ids[0],
            "customer_id": user_ids[1],
            "amount": 45000,
            "payment_method": "card",
            "status": "completed",
            "type": "payment",
            "transaction_id": "TXN-20260220143000-ABC123",
            "created_at": now - timedelta(days=5)
        },
        {
            "booking_id": booking_ids[1],
            "customer_id": user_ids[1],
            "amount": 28000,
            "payment_method": "upi",
            "status": "completed",
            "type": "payment",
            "transaction_id": "TXN-20260125100000-DEF456",
            "created_at": now - timedelta(days=30)
        },
    ]
    db.payments.insert_many(payments_data)
    print(f"  ✅ {len(payments_data)} payments created")

    # --- REVIEWS ---
    reviews_data = [
        {
            "trip_id": trip_ids[1],
            "customer_id": user_ids[1],
            "rating": 5,
            "comment": "Amazing Goa trip! The guide was very helpful and the beaches were beautiful.",
            "created_at": now - timedelta(days=5)
        }
    ]
    db.reviews.insert_many(reviews_data)
    print(f"  ✅ {len(reviews_data)} reviews created")

    # --- NOTIFICATIONS ---
    notifications_data = [
        {"user_id": str(user_ids[1]), "type": "booking_confirmed", "message": "Your Royal Rajasthan Adventure booking is confirmed!", "read": False, "created_at": now - timedelta(days=2)},
        {"user_id": str(user_ids[3]), "type": "trip_assignment", "message": "You have been assigned to Royal Rajasthan Adventure", "trip_id": str(trip_ids[0]), "read": False, "created_at": now - timedelta(days=2)},
    ]
    db.notifications.insert_many(notifications_data)
    print(f"  ✅ {len(notifications_data)} notifications created")

    print("\n🎉 Database seeded successfully!")
    print("\n📧 Login credentials:")
    print("  Admin:    admin@planmyjourney.com / Admin@123")
    print("  Customer: vikas@example.com / Customer@123")
    print("  Customer: priya@example.com / Customer@123")
    print("  Guide:    rajesh@guide.com / Guide@1234")
    print("  Guide:    amit@guide.com / Guide@1234")


if __name__ == '__main__':
    seed()
