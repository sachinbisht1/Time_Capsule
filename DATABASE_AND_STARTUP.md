# 🗄️ Database Setup & Complete App Startup Guide

## 📊 Database Overview

Your TimeCapsule application uses **SQLite** as the default database. Here's what you're working with:

---

## 🗄️ What Database We're Using

### SQLite (Default)
```
Type:           Relational Database (SQL)
Format:         File-based (.db file)
Location:       backend/timecapsule.db
Size:           Auto-grows (starts ~50KB, grows with data)
Created:        Automatically on first run
No Setup:       ✅ Zero configuration needed!
```

### Why SQLite?
- ✅ No separate server needed
- ✅ Single file storage
- ✅ Perfect for development
- ✅ Can upgrade to PostgreSQL later

---

## 📋 Database Structure (3 Tables)

### 1️⃣ **users** Table
```sql
Columns:
├─ id              (Integer, PRIMARY KEY)
├─ username        (String 80, UNIQUE)
├─ email           (String 120, UNIQUE)
├─ password_hash   (String 255) - Hashed with Werkzeug
├─ created_at      (DateTime) - Auto-timestamp
└─ updated_at      (DateTime) - Auto-timestamp

Relationships:
├─ capsules        (One user has many capsules)
└─ visits          (One user has many visits as visitor)
```

### 2️⃣ **capsules** Table
```sql
Columns:
├─ id              (Integer, PRIMARY KEY)
├─ owner_id        (Integer, FOREIGN KEY → users.id)
├─ latitude        (Float) - GPS latitude
├─ longitude       (Float) - GPS longitude
├─ title           (String 255) - Memory title
├─ description     (Text) - Memory description
├─ media_type      (String 20) - "image" or "text"
├─ media_url       (String 500) - Path to image (if image)
├─ media_data      (LongText) - Text content (if text)
├─ is_open         (Boolean) - Capsule unlock status
├─ open_count      (Integer) - Times viewed
├─ created_at      (DateTime) - Auto-timestamp
└─ updated_at      (DateTime) - Auto-timestamp

Relationships:
├─ owner           (Many capsules belong to one user)
└─ visits          (One capsule has many visits)
```

### 3️⃣ **visits** Table
```sql
Columns:
├─ id                  (Integer, PRIMARY KEY)
├─ capsule_id          (Integer, FOREIGN KEY → capsules.id)
├─ visitor_id          (Integer, FOREIGN KEY → users.id)
├─ visited_at          (DateTime) - When visited
├─ visitor_latitude    (Float) - GPS location at visit
└─ visitor_longitude   (Float) - GPS location at visit

Relationships:
├─ capsule            (Many visits to one capsule)
└─ visitor            (Many visits by one user)
```

---

## 🔗 Database Relationships Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│    users (1)                                                 │
│    ┌─────────────────────────────────────────────────┐      │
│    │ id ────────────────────────┐                   │      │
│    │ username                   │ 1:N (owner)      │      │
│    │ email                      │                   │      │
│    │ password_hash              │                   ▼      │
│    │ created_at                 │            capsules      │
│    │ updated_at                 │            ┌──────────┐  │
│    └─────────────────────────────────────────│ owner_id │  │
│            ▲                                  │ title    │  │
│            │ (visitor)                        │ lat/long │  │
│            │ 1:N                              │ media    │  │
│            │                                  └──────────┘  │
│            │                                       │        │
│    ┌───────┴──────────────────────────────────────┘        │
│    │                                                        │
│    │ visits (many-to-many junction)                        │
│    │ ┌──────────────────┐                                  │
│    │ │ capsule_id ──────┼───> capsules                     │
│    │ │ visitor_id ──────┼───> users                        │
│    │ │ visited_at       │                                  │
│    │ └──────────────────┘                                  │
│    │                                                        │
└────┴────────────────────────────────────────────────────────┘
```

---

## 💾 Database Files Location

```
backend/
├─ timecapsule.db ..................... Main database file
├─ uploads/ ........................... Image storage
│   ├─ 1704067200_photo1.jpg
│   ├─ 1704067201_photo2.jpg
│   └─ ... (auto-created as images uploaded)
└─ .env .............................. Configuration
```

---

## 🚀 Complete App Startup Guide

### Phase 1: Installation (One Time)

#### Step 1a: Backend Installation

**Open PowerShell and navigate to backend:**
```powershell
cd c:\Users\ksach\Desktop\BUDGET_template\TimeCapsule\backend
```

**Create Python virtual environment:**
```powershell
python -m venv venv
```

**Activate virtual environment:**
```powershell
.\venv\Scripts\Activate
# You should see (venv) in your prompt
```

**Install Python dependencies:**
```powershell
pip install -r requirements.txt
```

**What gets installed:**
```
Flask 2.3.0                    (Web framework)
Flask-SQLAlchemy 3.0.5         (Database ORM)
Flask-JWT-Extended 4.4.4       (Authentication)
Flask-CORS 4.0.0               (Cross-origin requests)
python-dotenv 1.0.0            (Environment variables)
Werkzeug 2.3.0                 (Security)
Pillow 10.0.0                  (Image processing)
```

**Verify installation:**
```powershell
pip list | grep Flask
# Should show Flask, Flask-SQLAlchemy, etc.
```

---

#### Step 1b: Frontend Installation

**Open new PowerShell window:**
```powershell
cd c:\Users\ksach\Desktop\BUDGET_template\TimeCapsule\frontend
```

**Install Node.js dependencies:**
```powershell
npm install
```

**What gets installed:**
```
react 18.2.0
react-dom 18.2.0
react-router-dom 6.11.0
@react-google-maps/api 2.19.0
axios 1.4.0
react-scripts 5.0.1
```

**Verify installation:**
```powershell
npm list react
# Should show react@18.2.0
```

---

### Phase 2: Configuration (One Time)

#### Step 2a: Backend Configuration

**Create .env file from example:**
```powershell
cd backend
copy .env.example .env
```

**Edit `.env` file** (open with Notepad):
```powershell
notepad .env
```

**Set these values:**
```
FLASK_ENV=development
FLASK_APP=run.py
FLASK_DEBUG=True
SECRET_KEY=your_super_secret_key_change_this_12345
JWT_SECRET_KEY=your_jwt_secret_key_change_this_67890
DATABASE_URL=sqlite:///timecapsule.db
UPLOAD_FOLDER=uploads
MAX_CONTENT_LENGTH=16777216
```

**Save and close (Ctrl+S, Ctrl+Q)**

---

#### Step 2b: Frontend Configuration

**Create .env file from example:**
```powershell
cd frontend
copy .env.example .env
```

**Edit `.env` file:**
```powershell
notepad .env
```

**Set these values:**
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_MAPS_KEY_HERE
```

**Get Google Maps API Key:**
1. Go to https://console.cloud.google.com/
2. Create new project
3. Go to APIs & Services → Library
4. Search for "Maps JavaScript API"
5. Click Enable
6. Go to Credentials
7. Click "Create Credentials" → API Key
8. Copy key and paste in .env

**Save and close**

---

### Phase 3: Database Initialization (One Time)

**The database is automatically created when backend starts!**

But if you want to manually check/reset:

```powershell
cd backend
.\venv\Scripts\Activate

python
>>> from app import create_app, db
>>> app = create_app()
>>> with app.app_context():
...     db.create_all()
...     print("✅ Database tables created!")
...     users_count = db.session.query(db.func.count()).select_from(db.MetaData().tables['users']).scalar()
...     print(f"Total users in database: {users_count}")
>>> exit()
```

**This creates:**
- ✅ `timecapsule.db` file (if doesn't exist)
- ✅ `users` table
- ✅ `capsules` table
- ✅ `visits` table

---

### Phase 4: Running the Application (Every Time)

#### Start Backend

**Terminal 1 - Backend:**
```powershell
# Make sure you're in backend directory
cd c:\Users\ksach\Desktop\BUDGET_template\TimeCapsule\backend

# Activate virtual environment
.\venv\Scripts\Activate

# Run Flask server
python run.py
```

**Expected output:**
```
 * Serving Flask app 'run'
 * Debug mode: on
 * Running on http://127.0.0.1:5000
 * Press CTRL+C to quit
 * Restarting with reloader
 * Debugger is active!
```

**✅ Backend is now running on http://localhost:5000**

---

#### Start Frontend

**Terminal 2 - Frontend (NEW PowerShell window):**
```powershell
# Make sure you're in frontend directory
cd c:\Users\ksach\Desktop\BUDGET_template\TimeCapsule\frontend

# Start React development server
npm start
```

**Expected output:**
```
Local:        http://localhost:3000
On Your Network:  http://192.168.x.x:3000

Press w to show all commands
```

**✅ Frontend is now running on http://localhost:3000**

**Browser should automatically open - if not, visit http://localhost:3000**

---

## ✅ Verify Everything is Working

### Check 1: Backend Running?
```powershell
# In any terminal
curl http://localhost:5000/api/auth/profile
# Should show: {"error":"Missing Authorization Header"} (this means API is working!)
```

### Check 2: Frontend Loading?
- Open http://localhost:3000 in browser
- Should see login/register page
- No JavaScript errors in console (F12)

### Check 3: Database Created?
```powershell
# In backend folder
# Look for timecapsule.db file
ls timecapsule.db
# Should show the file
```

### Check 4: Can Register?
1. Go to http://localhost:3000
2. Click "Don't have an account? Register"
3. Enter: username, email, password
4. Click Register
5. Should see login screen with new account data

### Check 5: Can Login?
1. Enter credentials from step above
2. Click Login
3. Should see main app with map!

---

## 🛠️ Database Operations

### View Database Contents

**Using Python:**
```powershell
cd backend
.\venv\Scripts\Activate

python
>>> from app import create_app, db
>>> from app.models import User, Capsule, Visit
>>> app = create_app()
>>> with app.app_context():
...     users = User.query.all()
...     print(f"Users: {len(users)}")
...     for user in users:
...         print(f"  - {user.username} ({user.email})")
...     
...     capsules = Capsule.query.all()
...     print(f"\nCapsules: {len(capsules)}")
...     for capsule in capsules:
...         print(f"  - {capsule.title} by {capsule.owner.username}")
>>> exit()
```

**Using Browser:**
- Download SQLite Browser: https://sqlitebrowser.org/
- Open `backend/timecapsule.db`
- View tables directly in GUI

---

### Reset Database (Deletes ALL Data!)

```powershell
cd backend
.\venv\Scripts\Activate

python
>>> from app import create_app, db
>>> app = create_app()
>>> with app.app_context():
...     db.drop_all()  # WARNING: Deletes all tables!
...     db.create_all()  # Recreate empty tables
...     print("✅ Database reset!")
>>> exit()
```

---

## 🎯 Complete Startup Checklist

### First Time Setup
- [ ] Virtual environment created: `python -m venv venv`
- [ ] Virtual environment activated: `.\venv\Scripts\Activate`
- [ ] Python packages installed: `pip install -r requirements.txt`
- [ ] Node packages installed: `npm install`
- [ ] Backend `.env` configured with SECRET_KEY and JWT_SECRET_KEY
- [ ] Frontend `.env` configured with Google Maps API key
- [ ] Database file created: `backend/timecapsule.db` exists
- [ ] Tables created: User, Capsule, Visit tables in database

### Every Time Running
- [ ] Terminal 1: Navigate to `backend` → Activate venv → Run `python run.py`
- [ ] Terminal 2: Navigate to `frontend` → Run `npm start`
- [ ] Backend shows: "Running on http://127.0.0.1:5000"
- [ ] Frontend shows: "Compiled successfully!" in terminal and opens in browser
- [ ] No errors in console (F12 in browser)

---

## 📊 Database Schema in SQL

```sql
-- Users Table
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    username VARCHAR(80) UNIQUE NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Capsules Table
CREATE TABLE capsules (
    id INTEGER PRIMARY KEY,
    owner_id INTEGER NOT NULL,
    latitude FLOAT NOT NULL,
    longitude FLOAT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    media_type VARCHAR(20),
    media_url VARCHAR(500),
    media_data LONGTEXT,
    is_open BOOLEAN DEFAULT 0,
    open_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id)
);

-- Visits Table
CREATE TABLE visits (
    id INTEGER PRIMARY KEY,
    capsule_id INTEGER NOT NULL,
    visitor_id INTEGER NOT NULL,
    visited_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    visitor_latitude FLOAT,
    visitor_longitude FLOAT,
    FOREIGN KEY (capsule_id) REFERENCES capsules(id),
    FOREIGN KEY (visitor_id) REFERENCES users(id)
);
```

---

## 🚨 Common Issues & Solutions

### Issue: "No such file or directory: 'venv'"
**Solution:** Make sure you're in `backend` folder and run: `python -m venv venv`

### Issue: "Cannot find module 'flask'"
**Solution:** Activate venv first: `.\venv\Scripts\Activate` (should show `(venv)` in prompt)

### Issue: "Port 5000 already in use"
**Solution:** Kill existing process:
```powershell
netstat -ano | findstr :5000
taskkill /PID XXXX /F
```

### Issue: "Database is locked"
**Solution:** Close all terminals, delete `timecapsule.db`, restart backend (it recreates automatically)

### Issue: "Cannot read property 'user'"
**Solution:** Make sure backend is running on :5000 and frontend `.env` has correct API URL

### Issue: "Google Maps not showing"
**Solution:** Check Google Maps API key in frontend `.env` file and verify API is enabled in Google Cloud

---

## 📞 Quick Reference

**Backend Start Command:**
```powershell
cd backend; .\venv\Scripts\Activate; python run.py
```

**Frontend Start Command:**
```powershell
cd frontend; npm start
```

**Reset Database:**
```powershell
# In Python shell
from app import create_app, db
app = create_app()
with app.app_context():
    db.drop_all()
    db.create_all()
```

**Check Database:**
```powershell
# Open in SQLite Browser
backend/timecapsule.db
```

---

## ✅ You're Ready!

With this guide, you now understand:
- ✅ What database you're using (SQLite)
- ✅ How the 3 tables are structured
- ✅ How tables relate to each other
- ✅ Complete step-by-step startup process
- ✅ How to verify everything works
- ✅ How to inspect database contents
- ✅ How to reset database if needed

**Next: Follow the Phase 1-4 steps above to get your app running!**
