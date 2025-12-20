# 🎯 Visual Guide - What DB + How to Run

## 🗄️ Database Overview (Visual)

```
┌─────────────────────────────────────┐
│   TimeCapsule App                   │
├─────────────────────────────────────┤
│                                     │
│  SQLite Database                    │
│  ├─ timecapsule.db (file)           │
│  │                                  │
│  ├─ TABLE: users                    │
│  │  ├─ id, username, email          │
│  │  ├─ password_hash                │
│  │  └─ created_at                   │
│  │                                  │
│  ├─ TABLE: capsules                 │
│  │  ├─ id, owner_id, title          │
│  │  ├─ latitude, longitude          │
│  │  ├─ media_type, media_url/data   │
│  │  ├─ is_open, open_count          │
│  │  └─ created_at                   │
│  │                                  │
│  └─ TABLE: visits                   │
│     ├─ id, capsule_id, visitor_id   │
│     ├─ visited_at                   │
│     └─ visitor_latitude/longitude   │
│                                     │
└─────────────────────────────────────┘
```

## 🔗 Database Relationships (Visual)

```
               users (Create User Account)
                    │
                    │ 1:N
                    ▼
    ┌─────────────────────────────┐
    │ alice creates capsule       │
    │ bob creates capsule         │
    │ charlie creates capsule     │
    └─────────────────────────────┘
               capsules
                    │
                    │ 1:N (Each capsule gets visited)
                    ▼
         ┌───────────────────┐
         │ alice visits bob's │
         │ bob visits alice's │
         │ charlie visits all │
         └───────────────────┘
                visits
         (Records who went where & when)
```

## 🚀 Startup Process (Step-by-Step Visual)

```
START HERE
    │
    ├─ PHASE 1: INSTALL (One time)
    │  ├─ Backend: python -m venv venv
    │  │           pip install -r requirements.txt
    │  │
    │  └─ Frontend: npm install
    │
    ├─ PHASE 2: CONFIGURE (One time)
    │  ├─ Backend: Create .env with SECRET_KEY
    │  │
    │  └─ Frontend: Create .env with GOOGLE_MAPS_KEY
    │
    ├─ PHASE 3: START (Every time)
    │  ├─ Terminal 1: python run.py (Backend :5000)
    │  │              ├─ Creates database if needed
    │  │              ├─ Creates tables if needed
    │  │              └─ Waits for API requests
    │  │
    │  └─ Terminal 2: npm start (Frontend :3000)
    │                 ├─ Starts React
    │                 ├─ Opens browser
    │                 └─ Loads Google Maps
    │
    └─ PHASE 4: USE
       ├─ Register account
       ├─ Create memory
       ├─ Discover memory
       ├─ View memory
       └─ Check database grew!
```

## 📊 Data Flow (From User to Database)

```
┌──────────────────┐
│   User in        │
│   Browser        │
└────────┬─────────┘
         │
         │ Types username, email, password
         │ Clicks Register
         ▼
┌──────────────────────────────┐
│   React Component            │
│   (CapsuleForm.jsx)          │
└────────┬─────────────────────┘
         │
         │ Calls api.js
         │ Sends: POST /api/auth/register
         │ With: JSON data
         ▼
┌──────────────────────────────┐
│   Frontend (http://3000)     │
│   Axios sends HTTP request   │
└────────┬─────────────────────┘
         │
         │ HTTP POST Request
         │ Headers + JSON Body
         ▼
┌──────────────────────────────┐
│   Backend (http://5000)      │
│   Flask receives request     │
│   Validates data             │
│   Hashes password            │
└────────┬─────────────────────┘
         │
         │ SQLAlchemy ORM
         │ Creates User object
         ▼
┌──────────────────────────────┐
│   SQLite Database            │
│   INSERT INTO users          │
│   (username, email, hash)    │
└────────┬─────────────────────┘
         │
         │ Row added!
         │ Returns user data
         ▼
┌──────────────────────────────┐
│   Backend sends response     │
│   JSON: {user, access_token} │
└────────┬─────────────────────┘
         │
         │ HTTP 201 Created
         ▼
┌──────────────────────────────┐
│   Frontend receives JSON     │
│   Stores token in localStorage
│   Shows success message      │
└──────────────────────────────┘
```

## 🎮 User Journey (Visitor Discovering Memory)

```
Alice (Creator)
    │
    ├─ Register: alice / alice@test.com
    │
    ├─ Create Capsule
    │  ├─ Title: "NYC Memory"
    │  ├─ Photo: sunset.jpg
    │  ├─ Location: 40.7128, -74.0060 (Times Square)
    │  └─ SAVED TO DATABASE ✓
    │
    └─ Capsule appears in database:
       └─ INSERT INTO capsules
          (owner_id=1, lat=40.7128, lng=-74.0060, ...)

                    ╔════════════════════╗
                    ║   DATABASE NOW:    ║
                    ║   1 User, 1 Cap.   ║
                    ╚════════════════════╝

Bob (Visitor)
    │
    ├─ Register: bob / bob@test.com
    │
    ├─ Switch to Visitor mode
    │
    ├─ Walk around NYC
    │  └─ GPS: 40.713, -74.008 (near Times Square)
    │
    ├─ App checks: Get nearby capsules
    │  ├─ SELECT * FROM capsules
    │  ├─ Calculate distance from user to each
    │  ├─ If distance < 1km: SHOW on map
    │  └─ Result: SHOW Alice's capsule marker!
    │
    ├─ Bob walks closer
    │  └─ GPS now: 40.7128, -74.0060 (at capsule)
    │  └─ Distance: < 2 meters!
    │
    ├─ App unlocks capsule
    │  ├─ User clicked "View Memory"
    │  ├─ Backend verifies: distance < 2m? YES
    │  ├─ INSERT INTO visits (capsule_id=1, visitor_id=2)
    │  ├─ UPDATE capsules SET open_count = open_count + 1
    │  └─ Return capsule content
    │
    └─ Bob sees Alice's photo!
       └─ SUCCESS ✓

                    ╔════════════════════╗
                    ║   DATABASE NOW:    ║
                    ║   2 Users, 1 Cap.  ║
                    ║   1 Visit record   ║
                    ╚════════════════════╝

Alice checks stats:
    │
    ├─ GET /capsules/1/stats
    │  ├─ SELECT COUNT(*) FROM visits WHERE capsule_id=1
    │  ├─ Result: 1 view, 1 visitor
    │  └─ Shows: "Bob visited on [timestamp]"
    │
    └─ Alice sees Bob discovered her memory!
```

## 💾 Database File Growth Over Time

```
Start:                         Created:
backend/timecapsule.db        When backend starts
Size: ~50KB                    (automatically)
                               │
                               ▼
After 1 user:                 INSERT INTO users
Size: ~60KB                    1 row added
                               │
                               ▼
After 1 capsule + image:       INSERT INTO capsules
Size: ~500KB                   + Image file in uploads/
(because image stored)         │
                               ▼
After 5 visitors:              INSERT INTO visits (5 rows)
Size: ~510KB                   │
                               ▼
After many users/capsules:     Database grows
Size: Keeps growing            as you use it
```

## 🔄 Both Terminals Required

```
Terminal 1 (Backend):          Terminal 2 (Frontend):
─────────────────────         ──────────────────────
$ cd backend                   $ cd frontend
$ .\venv\Scripts\Activate      $ npm start
$ python run.py                │
│                              ├─ Starts React on :3000
├─ Flask starts :5000          ├─ Loads components
├─ Creates database if needed  ├─ Creates API client
├─ Listens for requests        ├─ Opens browser
├─ Log shows:                  └─ Ready to use!
│  "Running on :5000"
│
└─ API endpoints ready:
   POST /api/auth/register
   POST /api/auth/login
   POST /api/capsules/create
   POST /api/capsules/nearby
   POST /api/capsules/<id>/view
   etc.

BOTH MUST BE RUNNING FOR APP TO WORK!
```

## 🎯 Complete Startup Visual

```
Step 1: INSTALL          Step 2: CONFIGURE         Step 3: RUN
────────────────         ─────────────────         ──────────
                         
Backend:                 Backend .env:             Terminal 1:
- venv                   - SECRET_KEY              - Activate venv
- pip install            - JWT_SECRET_KEY          - python run.py
                         - DB_URL                  → http://5000
Frontend:                                          
- npm install            Frontend .env:            Terminal 2:
                         - API_URL                 - npm start
Takes ~5 min total       - MAPS_KEY                → http://3000

After this, EVERYTHING IS READY TO USE!
```

## 📋 Quick Check List

```
✅ Backend installed?
   └─ pip list shows Flask, SQLAlchemy, etc.

✅ Frontend installed?
   └─ npm list shows react, axios, etc.

✅ Backend running?
   └─ Terminal 1 shows "Running on http://127.0.0.1:5000"

✅ Frontend running?
   └─ Terminal 2 shows "Compiled successfully!" and opens browser

✅ Database created?
   └─ backend/timecapsule.db file exists

✅ Tables created?
   └─ Open database in SQLite Browser, see 3 tables

✅ Can register?
   └─ http://localhost:3000 → Register → Success

✅ Can login?
   └─ Use registered credentials → See app

✅ App working?
   └─ All of above = ✅ YOU'RE DONE!
```

## 🚀 Summary

```
Database:
  ✓ SQLite file: timecapsule.db
  ✓ 3 tables: users, capsules, visits
  ✓ Auto-created on startup
  ✓ Zero setup needed

How to Run:
  1. Install: pip & npm (first time)
  2. Configure: .env files (first time)
  3. Start Backend: python run.py
  4. Start Frontend: npm start
  5. Done! App on http://3000

Both terminals must stay open while using app!
```

That's it! 🎉
