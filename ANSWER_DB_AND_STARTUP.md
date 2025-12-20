# 📋 Your Answer: Database & How to Run the Whole App

## 🗄️ What Database Are We Using?

### **SQLite** ✅
```
✓ Type:        File-based SQL database
✓ File Name:   timecapsule.db
✓ Location:    backend/ folder
✓ Setup:       ZERO configuration needed!
✓ Auto-Create: YES - created automatically when backend starts
✓ Best For:    Development & production-ready apps
```

**Why SQLite?**
- No separate database server to install
- Single file (`timecapsule.db`) holds everything
- Perfect for learning and prototyping
- Can easily upgrade to PostgreSQL later if needed

---

## 📊 All the Database (3 Tables)

### Table 1: `users`
Stores all user accounts
```
Columns:
├─ id (Number) ..................... Unique ID
├─ username (Text) ................. Login name
├─ email (Text) .................... Email address
├─ password_hash (Text) ............ Encrypted password
├─ created_at (Date/Time) .......... When account created
└─ updated_at (Date/Time) .......... When account last updated
```

### Table 2: `capsules`
Stores all memory capsules
```
Columns:
├─ id (Number) ..................... Unique ID
├─ owner_id (Number) ............... Who created it
├─ latitude (Number) ............... GPS latitude
├─ longitude (Number) .............. GPS longitude
├─ title (Text) .................... Memory title
├─ description (Text) .............. Description
├─ media_type (Text) ............... "image" or "text"
├─ media_url (Text) ................ Image file path (if image)
├─ media_data (Text) ............... Text content (if text)
├─ is_open (Yes/No) ................ Is currently unlocked?
├─ open_count (Number) ............. How many times viewed
├─ created_at (Date/Time) .......... When created
└─ updated_at (Date/Time) .......... Last updated
```

### Table 3: `visits`
Tracks who visited which memories
```
Columns:
├─ id (Number) ..................... Unique ID
├─ capsule_id (Number) ............. Which capsule was visited
├─ visitor_id (Number) ............. Who visited it
├─ visited_at (Date/Time) .......... When they visited
├─ visitor_latitude (Number) ....... Where they were (GPS lat)
└─ visitor_longitude (Number) ...... Where they were (GPS lng)
```

---

## 🔗 How Tables Connect

```
CREATE ONE MEMORY:
    User (alice) → Creates → Capsule
    
VISIT THAT MEMORY:
    User (bob) → Visits → Capsule
    ↓
    This visit recorded in → visits table
    
CHECK STATS:
    Capsule → Check visits table → See all visitors!
```

**Real Example:**
```
Alice creates capsule at Times Square
├─ users.id = 1, username = "alice"
├─ capsules.id = 1, owner_id = 1
├─ capsules.latitude = 40.7128
└─ capsules.longitude = -74.0060

Bob visits that capsule
├─ users.id = 2, username = "bob"
├─ visits.capsule_id = 1
├─ visits.visitor_id = 2
└─ visits.visited_at = 2024-01-15 14:30:00

Alice checks stats:
├─ SELECT * FROM visits WHERE capsule_id = 1
└─ Result: Bob visited on 2024-01-15 14:30!
```

---

## 🚀 How to Get the Whole App Running (Complete Steps)

### **PHASE 1: INSTALL (ONE TIME ONLY)**

#### Step 1.1: Backend Installation

**Open PowerShell:**
```powershell
# Navigate to backend
cd c:\Users\ksach\Desktop\BUDGET_template\TimeCapsule\backend

# Create Python virtual environment
python -m venv venv

# Activate it
.\venv\Scripts\Activate
# You should now see (venv) before your prompt

# Install all Python packages
pip install -r requirements.txt
# This installs: Flask, SQLAlchemy, JWT, CORS, etc.

# Verify installation
pip list
# You should see Flask, Flask-SQLAlchemy, etc. listed
```

**Time: ~2 minutes** ⏱️

---

#### Step 1.2: Frontend Installation

**Open NEW PowerShell window:**
```powershell
# Navigate to frontend
cd c:\Users\ksach\Desktop\BUDGET_template\TimeCapsule\frontend

# Install Node.js packages
npm install
# This installs: React, Google Maps, Axios, etc.

# Verify installation
npm list react
# Should show react@18.2.0
```

**Time: ~3 minutes** ⏱️

---

### **PHASE 2: CONFIGURE (ONE TIME ONLY)**

#### Step 2.1: Backend Configuration

**Edit backend .env file:**
```powershell
cd backend
copy .env.example .env
notepad .env
```

**What to set (copy these values):**
```
FLASK_ENV=development
FLASK_APP=run.py
FLASK_DEBUG=True
SECRET_KEY=my_super_secret_key_12345_change_this
JWT_SECRET_KEY=my_jwt_secret_67890_change_this
DATABASE_URL=sqlite:///timecapsule.db
UPLOAD_FOLDER=uploads
MAX_CONTENT_LENGTH=16777216
```

**Save** (Ctrl+S) and **Close** (Ctrl+Q)

---

#### Step 2.2: Frontend Configuration

**Get Google Maps API Key:**
1. Go to: https://console.cloud.google.com/
2. Create new project
3. Search for "Maps JavaScript API"
4. Click "Enable"
5. Go to "Credentials"
6. Click "Create Credentials" → "API Key"
7. Copy the key

**Edit frontend .env file:**
```powershell
cd frontend
copy .env.example .env
notepad .env
```

**What to set:**
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_GOOGLE_MAPS_API_KEY=PASTE_YOUR_KEY_HERE
```

**Save and Close**

---

### **PHASE 3: START THE APP (EVERY TIME YOU USE IT)**

#### Step 3.1: Start Backend

**Terminal 1:**
```powershell
cd c:\Users\ksach\Desktop\BUDGET_template\TimeCapsule\backend

# Activate virtual environment
.\venv\Scripts\Activate
# Should show (venv) in prompt

# Start Flask server
python run.py
```

**You should see:**
```
 * Serving Flask app 'run'
 * Debug mode: on
 * Running on http://127.0.0.1:5000
 * Press CTRL+C to quit
```

✅ **Backend is now RUNNING on http://localhost:5000**

---

#### Step 3.2: Start Frontend

**Terminal 2 (NEW WINDOW):**
```powershell
cd c:\Users\ksach\Desktop\BUDGET_template\TimeCapsule\frontend

# Start React development server
npm start
```

**You should see:**
```
Compiled successfully!

Local:        http://localhost:3000
On Your Network:  http://192.168.1.x:3000

Press w to show all commands
```

✅ **Frontend is now RUNNING on http://localhost:3000**

**Browser should automatically open to http://localhost:3000**

---

### **PHASE 4: TEST IT WORKS**

#### Test 1: Can You See Login Page?
- Check: http://localhost:3000
- Should see: Login/Register form
- No errors in console (F12)

#### Test 2: Can You Register?
```
Username: testuser
Email: test@test.com
Password: test123
```
- Click Register
- Should see: Success message
- Should redirect to login

#### Test 3: Can You Login?
- Use credentials from Test 2
- Click Login
- Should see: Map page with "Creator" button

#### Test 4: Can Backend API Respond?
```powershell
# In any terminal:
curl http://localhost:5000/api/auth/profile
# Should return: {"error":"Missing Authorization Header"}
# (This is CORRECT - means API is working!)
```

#### Test 5: Check Database Created?
```powershell
cd backend
ls timecapsule.db
# Should show the file exists
```

**If all 5 tests pass: ✅ YOU'RE READY TO USE THE APP!**

---

## 📋 Complete Installation Checklist

### First-Time Setup (Do Once)
- [ ] Step 1.1: Backend installation complete
- [ ] Step 1.2: Frontend installation complete
- [ ] Step 2.1: Backend .env configured
- [ ] Step 2.2: Frontend .env configured (with Google Maps key)
- [ ] Database file exists: `backend/timecapsule.db`

### Every Time You Run
- [ ] Terminal 1: Backend running (`python run.py`)
- [ ] Terminal 2: Frontend running (`npm start`)
- [ ] No errors in either terminal
- [ ] Browser opens to http://localhost:3000
- [ ] Can see login page

---

## 🛠️ All the Packages We're Using

### Python (Backend)
```
Flask 2.3.0                 → Web framework
Flask-SQLAlchemy 3.0.5      → Database connection
Flask-JWT-Extended 4.4.4    → Login/authentication
Flask-CORS 4.0.0            → Allow cross-origin requests
python-dotenv 1.0.0         → Read .env file
Werkzeug 2.3.0              → Password hashing
Pillow 10.0.0               → Image handling
```

### JavaScript (Frontend)
```
React 18.2.0                → UI framework
React-DOM 18.2.0            → Render to browser
React-Router 6.11.0         → Navigation
@react-google-maps/api      → Google Maps
Axios 1.4.0                 → Make API calls
CSS3                        → Styling
```

---

## 🔍 View Database Contents

### Option 1: Using Python (In Terminal)
```powershell
cd backend
.\venv\Scripts\Activate

python
>>> from app import create_app, db
>>> from app.models import User, Capsule
>>> app = create_app()
>>> with app.app_context():
...     users = User.query.all()
...     for user in users:
...         print(f"User: {user.username} ({user.email})")
>>> exit()
```

### Option 2: Using GUI (Recommended)
1. Download SQLite Browser: https://sqlitebrowser.org/
2. Open `backend/timecapsule.db`
3. Click on each table to see data
4. Very easy visual interface!

---

## ⚡ Quick Command Reference

### Backend Commands
```powershell
# One-time setup
cd backend
python -m venv venv
.\venv\Scripts\Activate
pip install -r requirements.txt
copy .env.example .env

# Every time you run
cd backend
.\venv\Scripts\Activate
python run.py
```

### Frontend Commands
```powershell
# One-time setup
cd frontend
npm install
copy .env.example .env

# Every time you run
cd frontend
npm start
```

### Database Commands
```powershell
# View database
# Download and open: backend/timecapsule.db in SQLite Browser

# Reset database (WARNING - deletes all data!)
python
>>> from app import create_app, db
>>> app = create_app()
>>> with app.app_context():
...     db.drop_all()
...     db.create_all()
>>> exit()
```

---

## 🎯 What Happens When You Run Commands

```
When you run: python run.py
├─ Flask starts on port 5000
├─ Loads app configuration from .env
├─ Connects to SQLite database
├─ Creates tables if they don't exist
├─ Waits for API requests
└─ Shows debug messages in terminal

When you run: npm start
├─ React starts on port 3000
├─ Loads app configuration from .env
├─ Starts development server
├─ Opens browser to http://localhost:3000
├─ Watches for file changes and reloads
└─ Shows console messages in terminal

When you access: http://localhost:3000
├─ Frontend requests API endpoint
├─ Backend receives request
├─ Backend queries SQLite database
├─ Backend returns JSON response
├─ Frontend displays data in React
└─ You see the app!
```

---

## ✅ Final Summary

### The Database
- **SQLite** file-based database
- **3 tables**: users, capsules, visits
- **Automatic creation** on first backend run
- **File location**: `backend/timecapsule.db`
- **Zero configuration** needed!

### All We're Using
- **Backend**: Python + Flask + SQLAlchemy
- **Frontend**: React + Google Maps + Axios
- **Database**: SQLite
- **Authentication**: JWT tokens
- **Security**: Password hashing

### How to Run
1. **Install** (first time): `pip install` and `npm install`
2. **Configure** (first time): Set up .env files
3. **Start Backend**: `python run.py`
4. **Start Frontend**: `npm start`
5. **Use**: Open http://localhost:3000 and enjoy!

---

## 🚀 You're Ready!

You now have a complete understanding of:
- ✅ What database we're using (SQLite)
- ✅ How many tables (3: users, capsules, visits)
- ✅ What each table stores
- ✅ Complete step-by-step to run everything
- ✅ All packages we're using
- ✅ How to verify it works

**Next: Follow the PHASE 1-4 steps above and get your app running!**

**Time to complete: ~15 minutes total**

Happy coding! 🎉
