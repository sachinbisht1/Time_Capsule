# 🔍 Visual Debug Flow

## What Happens When You Click "Create Capsule"

```
┌─────────────────────────────────────────────────────────────┐
│ FRONTEND: You Click "Create Capsule" Button                 │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
        ┌──────────────────────────────┐
        │ Frontend Console Shows:       │
        │ 📨 API REQUEST: POST         │
        │    /capsules/create          │
        │ Token available: true/false  │
        │ ✅ JWT token added header    │
        └──────────────┬───────────────┘
                       │
                       ▼ (HTTP Request sent)
     
┌─────────────────────────────────────────────────────────────┐
│ BACKEND: Request arrives at Flask                           │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
        ┌──────────────────────────────┐
        │ Backend Terminal Shows:       │
        │ 📨 INCOMING REQUEST:         │
        │    POST /api/capsules/create │
        │ Headers: {...}               │
        │ Form: {...}                  │
        └──────────────┬───────────────┘
                       │
                       ▼
        ┌──────────────────────────────┐
        │ JWT Validation Check         │
        └──────┬────────────┬──────────┘
               │            │
         ✅ Valid       ❌ Invalid/Missing
         Token          Token
          │              │
          ▼              ▼
    ┌────────────┐  ┌──────────────────┐
    │ ✅ Continue │  │ ❌ 401 Error     │
    │    to       │  │ Log shows:       │
    │ process     │  │ ❌ MISSING JWT   │
    │ request     │  │ OR               │
    └──────┬──────┘  │ ❌ INVALID JWT   │
           │         └──────────────────┘
           ▼
    ┌──────────────────────┐
    │ Check Form Data      │
    └──┬────────────────┬──┘
       │                │
    ✅ Valid         ❌ Missing/Invalid
    Data             Data
      │                │
      ▼                ▼
 ┌─────────┐    ┌──────────────────┐
 │ ✅ Save │    │ ❌ 400/422 Error │
 │Capsule  │    │ Log shows:       │
 │ to DB   │    │ ❌ Missing       │
 └────┬────┘    │ latitude or      │
      │         │ longitude        │
      ▼         └──────────────────┘
 ┌─────────────────────────────────┐
 │ Return 201 Created              │
 │ with capsule data               │
 └────┬────────────────────────────┘
      │
      ▼ (HTTP Response)

┌─────────────────────────────────────────────────────────────┐
│ FRONTEND: Get Response                                      │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
        ┌──────────────────────────────┐
        │ Frontend Console Shows:       │
        │                              │
        │ If Success (201):            │
        │ ✅ API RESPONSE: 201         │
        │                              │
        │ If Error (401/422):          │
        │ ❌ API ERROR: 401/422        │
        │    Response: {error: "..."} │
        └──────────────┬───────────────┘
                       │
                       ▼
        ┌──────────────────────────────┐
        │ Show result to user          │
        │ ✅ "Capsule created!"        │
        │ OR                           │
        │ ❌ "Error: ..."              │
        └──────────────────────────────┘
```

---

## Debug Checklist - Where to Look

### 1️⃣ Frontend (Browser Console)
```
F12 → Console tab
Look for: 📨 API REQUEST
           Token available: [true/false]
```

**If you see:**
- `Token available: false` → Login first
- `Token available: true` → Token is being sent ✅

---

### 2️⃣ Backend (Terminal)
```
python run.py
Look for: 📨 INCOMING REQUEST
          Headers: {...Authorization...}
```

**If you see:**
- `Authorization: Bearer eyJ...` → Token being received ✅
- NO `Authorization` header → Frontend not sending it ❌

---

### 3️⃣ JWT Check
```
Backend terminal look for:
✅ JWT VALID - user_id=1
OR
❌ MISSING JWT TOKEN
❌ INVALID JWT TOKEN
```

**If you see:**
- `✅ JWT VALID` → JWT is correct ✅
- `❌ MISSING` → Token not sent from frontend ❌
- `❌ INVALID` → Token is corrupted/expired ❌

---

### 4️⃣ Form Data Check
```
Backend terminal look for:
Form: {'title': '...', 'latitude': 28.6139, ...}
```

**If you see:**
- All fields present → OK ✅
- `latitude: None` → Geolocation not ready ❌
- Missing fields → Form incomplete ❌

---

### 5️⃣ Final Result
```
Backend terminal look for:
✅ Capsule created successfully - ID=1
OR
❌ 422 Error: ...
```

**If you see:**
- `✅ Capsule created` → SUCCESS! ✅
- `❌ 422 Error` → Something is wrong ❌

---

## Common Error Patterns

### Pattern 1: Token Never Sent (Most Common)
```
Frontend Console:
📨 API REQUEST: POST /capsules/create
   Token available: false ← PROBLEM!

Backend Terminal:
📨 INCOMING REQUEST: POST /api/capsules/create
Headers: {...} ← NO Authorization header!

❌ MISSING JWT TOKEN
```

**Fix**: Check localStorage has token, or login again

---

### Pattern 2: Invalid Token
```
Backend Terminal:
❌ INVALID JWT TOKEN: Signature verification failed

❌ 401 UNAUTHORIZED
```

**Fix**: Token corrupted. Clear localStorage and login:
```javascript
localStorage.clear()
// Then login again
```

---

### Pattern 3: Location Not Ready
```
Backend Terminal:
Form: {'title': '...', 'latitude': None, ...}

❌ Missing required fields: latitude, longitude
```

**Fix**: Wait for geolocation. Check frontend shows:
```
✅ GEOLOCATION ACQUIRED!
Location: 28.6139, 77.2090
```

---

### Pattern 4: Form Incomplete
```
Backend Terminal:
Form: {'title': '', 'latitude': 28.6139, ...}

❌ Missing required fields: title
```

**Fix**: Fill in all form fields before submitting

---

## Step-by-Step Debugging

### Step 1: Watch Frontend Logs
```
F12 → Console
Try to create capsule
Look at: Token available: [true/false]
```

### Step 2: Watch Backend Logs
```
python run.py
Try to create capsule from frontend
Look at: Authorization header present? Token valid?
```

### Step 3: Compare Logs
```
Frontend says: Token available: true
Backend says: NO Authorization header
PROBLEM: Something in transit is lost!
```

### Step 4: Report Issue
```
"When I try to create capsule:
Frontend shows: Token available: true
Backend shows: NO Authorization header
Error: ❌ MISSING JWT TOKEN"
```

---

## How Logs Help You Debug

### Without Logging (Before):
```
❌ 422 Error
(no idea why!)
```

### With Logging (Now):
```
❌ MISSING JWT TOKEN: Request does not contain an access token
(Exactly what's wrong!)
```

---

## Next Action

1. **Restart backend**: `python run.py`
2. **Open frontend**: `localhost:3000`
3. **Open console**: F12
4. **Create capsule**: Click button
5. **Watch both logs**:
   - Frontend console (F12)
   - Backend terminal (where python runs)
6. **Copy error** from backend
7. **Tell me** what you see

I'll fix the exact issue!
