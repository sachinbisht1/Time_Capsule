# TimeCapsule System Architecture

## 🔗 System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    TIMECAPSULE APPLICATION                       │
└─────────────────────────────────────────────────────────────────┘

                          ┌──────────────┐
                          │   BROWSER    │
                          │   (React)    │
                          └──────┬───────┘
                                 │
                                 │ HTTP/HTTPS
                                 │ JSON
                                 │
          ┌──────────────────────┴──────────────────────┐
          │                                             │
          ▼                                             ▼
    ┌────────────────┐                         ┌──────────────────┐
    │  Google Maps   │                         │  Flask Backend   │
    │      API       │                         │   (Python)       │
    └────────────────┘                         └────────┬─────────┘
          ▲                                             │
          │                                             │
          └─────────────────────────────────────────────┘
                   SQLAlchemy ORM
                   
                        │
                        │ (Python)
                        │
                        ▼
                   ┌────────────────┐
                   │   SQLite DB    │
                   │  (timecapsule  │
                   │     .db)       │
                   └────────────────┘
```

---

## 🏗️ Component Architecture

### Frontend (React)

```
App.jsx (Main Component)
    │
    ├─ Header
    │   ├─ ModeToggle (Visitor/Creator)
    │   └─ Auth Controls (Logout)
    │
    ├─ MapContainer
    │   ├─ Google Maps API
    │   ├─ User Location Marker
    │   └─ Capsule Markers
    │
    ├─ CapsuleForm (Creator Mode)
    │   ├─ Title Input
    │   ├─ Description Input
    │   ├─ Media Type Selector
    │   ├─ File Upload (Image)
    │   ├─ Text Editor (Text)
    │   └─ Submit Button
    │
    ├─ CapsuleViewer (Modal)
    │   ├─ Capsule Title
    │   ├─ Description
    │   ├─ Image/Text Display
    │   ├─ Statistics
    │   └─ Close Button
    │
    └─ Auth Pages
        ├─ Login Form
        └─ Register Form
```

### Backend (Flask)

```
Flask App (run.py)
    │
    ├─ Routes: /api/auth
    │   ├─ POST /register
    │   ├─ POST /login
    │   └─ GET /profile
    │
    ├─ Routes: /api/capsules
    │   ├─ POST /create
    │   ├─ POST /nearby
    │   ├─ POST /<id>/view
    │   ├─ GET /my-capsules
    │   ├─ GET /<id>
    │   └─ GET /<id>/stats
    │
    ├─ Models
    │   ├─ User
    │   ├─ Capsule
    │   └─ Visit
    │
    └─ Storage
        ├─ SQLite Database
        └─ File Uploads (images/)
```

---

## 🔄 User Flow Diagram

### Registration & Login

```
User
  │
  ├─→ Navigate to App
  │
  ├─→ [No Token] → Show Auth Page
  │    │
  │    ├─→ Register Form
  │    │    │
  │    │    ▼
  │    │  Create Account
  │    │    │
  │    │    ├─→ Validate Input
  │    │    ├─→ Hash Password
  │    │    ├─→ Store in Database
  │    │    └─→ Return JWT Token
  │    │
  │    └─→ Login Form
  │         │
  │         ▼
  │      Verify Credentials
  │         │
  │         ├─→ Check Username
  │         ├─→ Compare Password
  │         └─→ Return JWT Token
  │
  ├─→ [Token Received] → Store in localStorage
  │
  └─→ Show Main App

```

### Creator Mode - Create Memory

```
Creator User
    │
    ├─→ Click "Creator" Mode
    │
    ├─→ Click "+ Create Capsule"
    │
    ├─→ Fill Form
    │    ├─ Title
    │    ├─ Description
    │    ├─ Media Type (Image/Text)
    │    └─ Content
    │
    ├─→ Click "Create Capsule"
    │
    └─→ Frontend
         │
         ├─→ Get current GPS location
         │
         ├─→ Send to Backend:
         │    ├─ latitude
         │    ├─ longitude
         │    ├─ title
         │    ├─ description
         │    ├─ media_type
         │    └─ media_data/file
         │
         └─→ Backend
              │
              ├─→ Validate JWT token
              │
              ├─→ Process media:
              │    ├─ Image: Save to /uploads
              │    └─ Text: Store in database
              │
              ├─→ Create Capsule record
              │
              ├─→ Store in database
              │
              └─→ Return success + capsule_id

```

### Visitor Mode - Discover Memory

```
Visitor User
    │
    ├─→ Click "Visitor" Mode
    │
    ├─→ Browser: Get GPS location
    │    │
    │    └─→ Continuous tracking (updates map)
    │
    ├─→ Frontend: Every location update
    │    │
    │    └─→ POST /nearby with lat/long
    │
    └─→ Backend: Get Nearby Capsules
         │
         ├─→ Query all capsules
         │
         ├─→ For each capsule:
         │    │
         │    └─→ Calculate distance (Haversine)
         │         │
         │         └─→ If distance ≤ 1km → Include
         │
         ├─→ Sort by distance
         │
         └─→ Return list to frontend

Map Display
    │
    ├─→ Add capsule markers
    │
    ├─→ Add user location marker
    │
    └─→ Show satellite view

Visitor Navigation
    │
    ├─→ User moves toward capsule
    │
    ├─→ Map updates continuously
    │
    ├─→ Distance decreases
    │
    └─→ [Within 2m?]
         │
         ├─ NO → Show distance, keep searching
         │
         └─ YES → Unlock! Show "View Memory" button

View Memory
    │
    ├─→ User clicks "View Memory"
    │
    ├─→ Frontend: POST /capsules/<id>/view
    │    │
    │    └─→ Include current location
    │
    └─→ Backend: Verify & Unlock
         │
         ├─→ Check distance < 2m
         │
         ├─→ If OK:
         │    ├─→ Increment view count
         │    ├─→ Record visit in database
         │    └─→ Return full capsule content
         │
         └─→ If NO: Return error "Too far"

Display Memory
    │
    ├─→ Show title & description
    │
    ├─→ Show image OR text
    │
    ├─→ Show statistics
    │    ├─ Creation date
    │    ├─ Total views
    │    └─ Visitor count
    │
    └─→ User closes → Memory persists ✅

```

---

## 📍 Geolocation System

### Distance Calculation (Haversine Formula)

```
Formula for distance between two points on Earth:

    a = sin²(Δlat/2) + cos(lat1) * cos(lat2) * sin²(Δlon/2)
    c = 2 * atan2(√a, √(1-a))
    distance = R * c

Where:
    R = 6,371,000 meters (Earth's radius)
    lat1, lon1 = Capsule location
    lat2, lon2 = User location
    Δlat = lat2 - lat1
    Δlon = lon2 - lon1

Result: Distance in meters

Example:
    Capsule at: 40.7128°N, 74.0060°W
    User at: 40.7129°N, 74.0055°W
    
    Distance ≈ 95 meters

Radius Checks:
    ├─ 1 km (1000m): Visitor can SEE capsule on map
    └─ 2 m: Visitor can VIEW capsule content
```

---

## 📊 Database Schema

### Users Table

```
id (PK)          | username      | email           | password_hash
─────────────────┼───────────────┼─────────────────┼──────────────
1                | alice         | alice@test.com  | hashed_pwd_1
2                | bob           | bob@test.com    | hashed_pwd_2
3                | charlie       | charlie@example | hashed_pwd_3
```

### Capsules Table

```
id | owner_id | lat     | lon     | title  | media_type | open_count | created_at
──┼──────────┼─────────┼─────────┼────────┼────────────┼────────────┼───────────
1  | 1        | 40.7128 | -74.006 | NYC    | image      | 5          | 2024-01-15
2  | 2        | 51.5074 | -0.1278 | London | text       | 2          | 2024-01-16
3  | 1        | 48.8566 | 2.3522  | Paris  | image      | 10         | 2024-01-17
```

### Visits Table

```
id | capsule_id | visitor_id | visited_at
──┼────────────┼────────────┼──────────────────────────
1  | 1          | 2          | 2024-01-15 14:30:00
2  | 1          | 3          | 2024-01-15 15:45:00
3  | 2          | 1          | 2024-01-16 10:20:00
```

---

## 🔐 Authentication Flow

### JWT Token System

```
User Login
    │
    └─→ POST /auth/login
         │
         ├─→ Verify username & password
         │
         ├─→ Generate JWT token:
         │
         │  Header: {
         │    "alg": "HS256",
         │    "typ": "JWT"
         │  }
         │
         │  Payload: {
         │    "user_id": 1,
         │    "exp": 1704067200
         │  }
         │
         │  Signature: HMAC256(header + payload, secret)
         │
         └─→ Return token to client

Token Storage
    │
    └─→ Frontend: localStorage.setItem('access_token', token)

API Requests
    │
    ├─→ Every request includes:
    │
    │  Headers: {
    │    "Authorization": "Bearer eyJhbGc..."
    │  }
    │
    └─→ Backend:
         │
         ├─→ Extract token from header
         ├─→ Verify signature
         ├─→ Check expiration
         └─→ If valid → Allow request, else → Reject
```

---

## 📈 Data Flow Example

### Complete User Journey

```
┌─────────────┐
│   Alice     │
│   (Creator) │
└──────┬──────┘
       │
       ├─→ Registers account
       │   └─→ DB: User(id=1, username="alice")
       │
       ├─→ Logs in
       │   └─→ Gets JWT token
       │
       ├─→ Creates capsule at Time Square
       │   └─→ DB: Capsule(id=1, owner_id=1, lat=40.758, lon=-73.985)
       │
       └─→ Stores photo
           └─→ File: uploads/1704067200_photo.jpg

                    ↓ [1 week later]

┌────────┐
│  Bob   │
│(Visitor)
└────┬───┘
     │
     ├─→ Registers account
     │   └─→ DB: User(id=2, username="bob")
     │
     ├─→ Logs in
     │   └─→ Gets JWT token
     │
     ├─→ Walks around Times Square
     │   └─→ GPS: 40.759, -73.985 (nearby)
     │
     ├─→ App fetches nearby capsules
     │   └─→ Distance: ~111 meters
     │   └─→ Result: Show capsule on map
     │
     ├─→ Walks closer (within 2m)
     │   └─→ GPS: 40.758, -73.985
     │   └─→ Capsule unlocks!
     │
     ├─→ Clicks "View Memory"
     │   └─→ Views Alice's photo
     │   └─→ DB: Visit(capsule_id=1, visitor_id=2)
     │   └─→ DB: Capsule(open_count=1)
     │
     └─→ Sees statistics:
         ├─ Created: Jan 15, 2024
         ├─ Total Views: 1
         └─ Unique Visitors: 1

                    ↓ [Alice checks stats]

Alice views stats:
    └─→ GET /capsules/1/stats
        └─→ total_views: 1
        └─→ unique_visitors: 1
        └─→ visits: [{ visitor_id: 2, visited_at: ... }]
```

---

## 🔄 Request/Response Examples

### Create Capsule Request

```
POST http://localhost:5000/api/capsules/create

Headers:
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  Content-Type: multipart/form-data

Body (Form Data):
  latitude: 40.7128
  longitude: -74.0060
  title: Beautiful NYC Sunset
  description: Captured from Times Square
  media_type: image
  file: [image.jpg]

Response (Success):
{
  "message": "Capsule created successfully",
  "capsule": {
    "id": 42,
    "owner_id": 1,
    "latitude": 40.7128,
    "longitude": -74.0060,
    "title": "Beautiful NYC Sunset",
    "description": "Captured from Times Square",
    "media_type": "image",
    "media_url": "/uploads/1704067200_image.jpg",
    "open_count": 0,
    "created_at": "2024-01-15T12:30:45.000Z"
  }
}
```

### Get Nearby Capsules Request

```
POST http://localhost:5000/api/capsules/nearby

Headers:
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  Content-Type: application/json

Body:
{
  "latitude": 40.7129,
  "longitude": -74.0059
}

Response (Success):
{
  "count": 2,
  "capsules": [
    {
      "id": 42,
      "owner_id": 1,
      "latitude": 40.7128,
      "longitude": -74.0060,
      "title": "Beautiful NYC Sunset",
      "media_type": "image",
      "open_count": 1,
      "distance_km": 0.012
    },
    {
      "id": 41,
      "owner_id": 3,
      "latitude": 40.7580,
      "longitude": -73.9855,
      "title": "Times Square Memory",
      "media_type": "text",
      "open_count": 5,
      "distance_km": 0.548
    }
  ]
}
```

---

## ✅ Summary

This architecture ensures:
- ✅ Memories are **permanently stored**
- ✅ **Discoverable** within 1km radius
- ✅ **Viewable** within 2 meters
- ✅ **Persistent** - data never deleted
- ✅ **Secure** - JWT authentication
- ✅ **Scalable** - RESTful API design
