# TimeCapsule Project Structure

## 📁 Directory Layout

```
TimeCapsule/
├── backend/                    # Python Flask API
│   ├── app/
│   │   ├── __init__.py        # Flask app factory
│   │   ├── models/            # Database models
│   │   │   ├── __init__.py
│   │   │   ├── user.py        # User model
│   │   │   ├── capsule.py     # Capsule model
│   │   │   └── visit.py       # Visit tracking model
│   │   ├── routes/            # API endpoints
│   │   │   ├── __init__.py
│   │   │   ├── auth.py        # Authentication routes
│   │   │   └── capsule.py     # Capsule routes
│   │   └── utils/             # Utility functions
│   ├── uploads/               # Stored media files
│   ├── requirements.txt       # Python dependencies
│   ├── run.py                # Application entry point
│   ├── .env.example          # Environment template
│   └── README.md             # Backend documentation
│
└── frontend/                  # React web app
    ├── src/
    │   ├── components/        # React components
    │   │   ├── MapContainer.jsx      # Google Maps
    │   │   ├── CapsuleForm.jsx       # Memory creation
    │   │   ├── CapsuleViewer.jsx     # Memory display
    │   │   └── ModeToggle.jsx        # User/Visitor toggle
    │   ├── pages/             # Page components
    │   ├── utils/
    │   │   └── api.js         # API client
    │   ├── App.jsx            # Main app component
    │   ├── App.css            # Main styles
    │   └── index.jsx          # Entry point
    ├── public/
    │   └── index.html         # HTML template
    ├── package.json           # Dependencies
    ├── .env.example          # Environment template
    └── README.md             # Frontend documentation
```

## 🚀 Quick Start

### Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
cp .env.example .env
python run.py
```

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with your Google Maps API key
npm start
```

## 🔑 Key Features

### Backend (Python/Flask)
- ✅ User authentication with JWT tokens
- ✅ SQLAlchemy ORM for database models
- ✅ RESTful API for all operations
- ✅ Haversine distance calculation for geolocation
- ✅ File upload handling for images
- ✅ CORS enabled for frontend communication
- ✅ Database models: User, Capsule, Visit

### Frontend (React)
- ✅ Google Maps with satellite view
- ✅ Real-time geolocation tracking
- ✅ User/Visitor mode toggle
- ✅ Memory creation with image/text support
- ✅ JWT-based authentication
- ✅ Responsive design
- ✅ Capsule discovery and viewing

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile

### Capsules
- `POST /api/capsules/create` - Create new memory
- `POST /api/capsules/nearby` - Get nearby capsules (1km)
- `POST /api/capsules/<id>/view` - View capsule (within 2m)
- `GET /api/capsules/my-capsules` - User's capsules
- `GET /api/capsules/<id>` - Get capsule details
- `GET /api/capsules/<id>/stats` - View statistics

## 🎯 How It Works

### Creating a Memory (Creator Mode)
1. User logs in and switches to "Creator" mode
2. Clicks "+ Create Capsule" button
3. Fills in title, description, and media (photo or text)
4. Capsule is stored at current GPS location
5. Data persists in database for future visitors

### Discovering a Memory (Visitor Mode)
1. User logs in and switches to "Visitor" mode
2. Map displays all capsules within 1km radius
3. User can navigate towards capsule markers
4. Once within 2 meters, capsule unlocks automatically
5. Visitor can view the memory (photo or text)
6. View count increments, but data is not deleted

## 🗄️ Database Models

### User
- id, username, email, password_hash, created_at, updated_at
- Relationships: capsules, visits

### Capsule
- id, owner_id, latitude, longitude, title, description
- media_type (image/text), media_url/media_data
- is_open, open_count, created_at, updated_at
- Relationships: owner, visits

### Visit
- id, capsule_id, visitor_id, visited_at
- visitor_latitude, visitor_longitude
- Tracks who visited which capsule and when

## 🔐 Security Features

- ✅ Password hashing with Werkzeug
- ✅ JWT token-based authentication
- ✅ File type validation for uploads
- ✅ CORS protection
- ✅ Distance verification (2m radius)

## 🌍 Geolocation

- Haversine formula for accurate distance calculation
- Real-time GPS tracking via browser API
- 1km discovery radius for visitors
- 2m unlock radius for viewing

## 📱 Technologies Used

**Backend:**
- Python 3.x
- Flask & Flask-SQLAlchemy
- Flask-JWT-Extended
- Werkzeug
- Geopy

**Frontend:**
- React 18
- Google Maps API
- Axios
- CSS3

## ✨ Future Enhancements

- [ ] User profiles with stats
- [ ] Capsule ratings/comments
- [ ] Expiration dates for capsules
- [ ] Social sharing features
- [ ] Mobile app (React Native)
- [ ] Video support
- [ ] Search and filters
