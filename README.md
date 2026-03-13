# 🌿 Plan My Journey

A full-stack travel planning web application with role-based access for Customers, Admins, and Guides.

## Tech Stack
- **Frontend**: React 19 + Vite, Framer Motion, React Router v6, Axios
- **Backend**: Flask 3.0, Flask-JWT-Extended, PyMongo
- **Database**: MongoDB
- **Deployment**: Docker + Docker Compose

## Quick Start (Local Development)

### Prerequisites
- Python 3.11+
- Node.js 20+
- MongoDB running on `localhost:27017`

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
python -m app.seed          # Seed sample data
python run.py               # Starts on http://localhost:5000
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev                 # Starts on http://localhost:5173
```

### Docker Setup
```bash
docker-compose up --build -d    # Starts everything on http://localhost:5173
docker exec pmj-backend python -m app.seed   # Seed sample data
```

### Access from Phone
Make sure your phone is on the **same WiFi** as your PC, then open:
```
http://<YOUR_PC_IP>:5173
```
To find your PC's IP, run: `ipconfig | findstr "IPv4"`

## Deployment Commands

### Redeploy after code changes
```bash
docker-compose up --build -d
```

### Rebuild only frontend
```bash
docker-compose up --build -d frontend
```

### Rebuild only backend
```bash
docker-compose up --build -d backend
```

### Full clean rebuild
```bash
docker-compose down
docker-compose up --build -d
```

### Re-seed database (fresh data)
```bash
docker exec pmj-backend python -m app.seed
```

### Check running containers
```bash
docker-compose ps
```

### View logs
```bash
docker-compose logs frontend
docker-compose logs backend
```

### Allow phone access (run as Admin in PowerShell)
```powershell
New-NetFirewallRule -DisplayName "Allow Docker 5173" -Direction Inbound -LocalPort 5173 -Protocol TCP -Action Allow
```

## Demo Accounts

| Role     | Email                        | Password      |
|----------|------------------------------|---------------|
| Admin    | admin@planmyjourney.com      | Admin@123     |
| Customer | vikas@example.com            | Customer@123  |
| Customer | priya@example.com            | Customer@123  |
| Guide    | rajesh@guide.com             | Guide@1234    |
| Guide    | anita@guide.com              | Guide@1234    |

## Features

### Customer
- Journey Builder (state → city → attractions → travel → hotel → dates → payment)
- Day-wise itinerary generation
- Trip tracking with status updates
- Review system

### Admin
- Dashboard with revenue & booking stats
- Manage customers, guides, bookings, trips
- CRUD for destinations, cities, attractions, hotels
- Assign guides to trips
- Cancel bookings & process refunds
- Audit logging

### Guide
- View assigned trips & today's schedule
- Update trip status (ongoing → completed)
- Report issues
- Notifications

## API Endpoints

All endpoints prefixed with `/api`

| Module       | Endpoints |
|-------------|-----------|
| Auth        | POST `/auth/login`, `/auth/signup`, `/auth/refresh`, GET `/auth/me`, PUT `/auth/profile`, `/auth/change-password` |
| Customer    | GET `/customer/dashboard`, `/customer/trips`, `/customer/trips/:id`, POST `/customer/trips`, PUT `/customer/trips/:id`, POST `/customer/trips/:id/review` |
| Admin       | GET `/admin/dashboard`, `/admin/customers`, `/admin/guides`, `/admin/bookings`, `/admin/trips`, all CRUD for destinations/cities/attractions/hotels |
| Guide       | GET `/guide/dashboard`, `/guide/trips/:id`, `/guide/notifications`, PUT `/guide/trips/:id/status`, POST `/guide/trips/:id/report-issue` |
| Destinations| GET `/destinations/states`, `/destinations/states/:id/cities`, `/destinations/cities/:id/attractions`, `/destinations/cities/:id/hotels`, `/destinations/search` |
| Bookings    | POST `/bookings/`, GET `/bookings/:id`, PUT `/bookings/:id/cancel` |
| Payments    | POST `/payments/process`, GET `/payments/history`, `/payments/:id` |

## Project Structure
```
├── backend/
│   ├── app/
│   │   ├── __init__.py          # Flask app factory
│   │   ├── config.py            # Configuration
│   │   ├── middleware/           # RBAC middleware
│   │   ├── routes/              # API blueprints
│   │   │   ├── auth.py
│   │   │   ├── customer.py
│   │   │   ├── admin.py
│   │   │   ├── guide.py
│   │   │   ├── destinations.py
│   │   │   ├── bookings.py
│   │   │   └── payments.py
│   │   ├── utils/               # Validators, helpers
│   │   └── seed.py              # Database seeder
│   ├── requirements.txt
│   ├── run.py
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/          # Navbar, Footer, FloatingElements
│   │   ├── context/             # AuthContext
│   │   ├── pages/               # All page components
│   │   │   ├── Landing.jsx
│   │   │   ├── auth/            # Login, Signup
│   │   │   ├── customer/        # Dashboard, JourneyBuilder, TripDetail, Profile
│   │   │   ├── admin/           # Dashboard, Bookings, Customers, Guides, Trips, Destinations
│   │   │   └── guide/           # Dashboard, TripDetail
│   │   ├── services/api.js      # Axios API client
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── Dockerfile
│   └── nginx.conf
└── docker-compose.yml
```
