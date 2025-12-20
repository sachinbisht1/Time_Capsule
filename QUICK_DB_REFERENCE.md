# ⚡ Quick Reference - Database & Startup

## 🗄️ Database at a Glance

```
Database Type:      SQLite (File-based, zero config)
Location:           backend/timecapsule.db
Auto-Created:       YES ✅ (on first run)
Tables:             3 (users, capsules, visits)
File Storage:       backend/uploads/ (for images)
Size:               ~50KB starting, grows with data
Backup:             Just copy the .db file
```

---

## 📊 Database Tables Quick View

### users
```
id | username | email          | password_hash | created_at
1  | alice    | alice@test.com | hashed...     | 2024-01-15
2  | bob      | bob@test.com   | hashed...     | 2024-01-15
```

### capsules
```
id | owner_id | lat    | lng    | title    | media_type | open_count
1  | 1        | 40.71  | -74.0  | NYC Mem  | image      | 2
2  | 2        | 51.50  | -0.12  | London   | text       | 5
```

### visits
```
id | capsule_id | visitor_id | visited_at      | visitor_lat | visitor_lng
1  | 1          | 2          | 2024-01-15 14:30| 40.712      | -74.009
2  | 1          | 3          | 2024-01-15 15:45| 40.713      | -74.008
```

---

## 🚀 Startup in 3 Commands

### Terminal 1 (Backend):
```powershell
cd backend
.\venv\Scripts\Activate
python run.py
```
✅ Backend on: http://localhost:5000

### Terminal 2 (Frontend):
```powershell
cd frontend
npm start
```
✅ Frontend on: http://localhost:3000

**Done! App is running!**

---

## 🔧 One-Time Setup

### 1. Install Python packages:
```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate
pip install -r requirements.txt
```

### 2. Install Node packages:
```powershell
cd frontend
npm install
```

### 3. Setup backend config:
```powershell
cd backend
copy .env.example .env
notepad .env
# Change: SECRET_KEY, JWT_SECRET_KEY
```

### 4. Setup frontend config:
```powershell
cd frontend
copy .env.example .env
notepad .env
# Change: REACT_APP_GOOGLE_MAPS_API_KEY
```

---

## 🔍 Verify It Works

| Check | Command | Expected |
|-------|---------|----------|
| Backend running? | `curl http://localhost:5000/api/auth/profile` | Error about auth (OK!) |
| Frontend loading? | Visit http://localhost:3000 | Login page shows |
| Database created? | `ls backend/timecapsule.db` | File exists |
| Can register? | Register on http://localhost:3000 | Success message |
| Can login? | Login with account | Map appears |

---

## 📁 File Structure

```
backend/
├─ app/
│  ├─ __init__.py ............. Flask setup
│  ├─ models/
│  │  ├─ user.py .............. User table
│  │  ├─ capsule.py ........... Capsule table
│  │  └─ visit.py ............. Visit table
│  └─ routes/
│     ├─ auth.py .............. Login/Register
│     └─ capsule.py ........... Memory API
├─ uploads/ .................... Images storage
├─ timecapsule.db .............. DATABASE ⭐
├─ run.py ...................... Start here
├─ requirements.txt ............ Python packages
└─ .env ........................ Config (create from .env.example)

frontend/
├─ src/
│  ├─ App.jsx .................. Main component
│  ├─ components/ .............. UI components
│  └─ utils/api.js ............. API calls
├─ package.json ................ Node packages
└─ .env ........................ Config (create from .env.example)
```

---

## 💡 Database Operations

### View database (Python):
```python
python
>>> from app import create_app, db
>>> from app.models import User, Capsule
>>> app = create_app()
>>> with app.app_context():
...     print(f"Users: {User.query.count()}")
...     print(f"Capsules: {Capsule.query.count()}")
>>> exit()
```

### Reset database (WARNING: Deletes data!):
```python
python
>>> from app import create_app, db
>>> app = create_app()
>>> with app.app_context():
...     db.drop_all()
...     db.create_all()
...     print("✅ Reset!")
>>> exit()
```

### View database (GUI):
1. Download SQLite Browser: https://sqlitebrowser.org/
2. Open `backend/timecapsule.db`
3. Browse tables visually

---

## 🎯 What Each Tech Does

| Tech | Purpose | Why Used |
|------|---------|----------|
| **SQLite** | Database | No setup needed, file-based |
| **Flask** | Backend API | Simple, lightweight |
| **SQLAlchemy** | Database ORM | Easy model definitions |
| **JWT** | Authentication | Secure token-based auth |
| **React** | Frontend | Modern UI framework |
| **Google Maps** | Location display | Real-time map display |
| **Python** | Backend language | Easy to learn & maintain |
| **JavaScript** | Frontend language | Browser execution |

---

## ✅ Database Relationships

```
User (1) ──────→ (N) Capsules
  ↓
  └─→ (N) Visits (as visitor)

Capsule (1) ──────→ (N) Visits
  ↓
  └─→ (1) User (owner)

Visit
  ├─→ (1) Capsule
  └─→ (1) User (visitor)
```

**Meaning:**
- One user can create many capsules
- One capsule can have many visitors
- One visitor can visit many capsules
- All tracked in visits table!

---

## 🚨 If Something Goes Wrong

| Problem | Solution |
|---------|----------|
| venv not found | `python -m venv venv` in backend |
| pip not working | Activate venv: `.\venv\Scripts\Activate` |
| npm not found | Install Node.js from nodejs.org |
| Port 5000 taken | `taskkill /PID XXXX /F` (find PID with netstat) |
| Database locked | Delete `timecapsule.db`, restart backend |
| API not responding | Make sure backend running on :5000 |
| Maps not showing | Check Google Maps API key in frontend/.env |
| CORS error | Check frontend API URL in .env |

---

## 📞 Tech Stack Summary

```
┌─────────────────────────────────────────┐
│          TIMECAPSULE APP                │
├─────────────────────────────────────────┤
│                                         │
│  Frontend         Backend    Database   │
│  ────────         ──────     ────────   │
│  React 18    →    Flask    ←  SQLite   │
│  Google Maps      Python       Users   │
│  Axios API Call   API Call     Capsules│
│                                Visits   │
│                                         │
└─────────────────────────────────────────┘
```

---

## 🎮 Test it Works

1. **Register**: alice / alice@test.com / test123
2. **Create capsule**: "My Memory"
3. **Register**: bob / bob@test.com / test123
4. **Discover**: See alice's capsule on map
5. **View**: Get within 2m, click to view
6. **Success**: See alice's memory! ✅

---

## 📊 Data Flow

```
User Input
    ↓
Frontend (React)
    ↓
HTTP Request (JSON)
    ↓
Backend API (Flask)
    ↓
Database (SQLite)
    ↓
Returns Response (JSON)
    ↓
Frontend displays data
```

---

## ⚡ Essential Commands

```powershell
# Backend
cd backend
.\venv\Scripts\Activate
pip install -r requirements.txt
python run.py

# Frontend
cd frontend
npm install
npm start

# Database (Python)
from app import create_app, db
app = create_app()
with app.app_context():
    db.create_all()  # Create tables
    # or
    db.drop_all()    # Reset (WARNING!)

# Check API
curl http://localhost:5000/api/auth/profile
```

---

**That's it! Now you know the database, tech stack, and how to run everything!** 🚀
