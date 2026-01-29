# 🔍 Debugging API Errors (422 and 401)

## What I Fixed

1. ✅ Removed unused `locationAttempts` variable
2. ✅ Fixed missing dependency warning in useEffect
3. ✅ Added detailed logging to API requests and responses
4. ✅ Added error interceptor to show exact error details

## What's Happening

You're getting **422** (Unprocessable Entity) and **401** (Unauthorized) errors:

- **422**: Missing or invalid data being sent
- **401**: JWT token is not being sent or is expired

## How to Debug

### Step 1: Open Browser Console
```
F12 (or Ctrl+Shift+I) → Console tab
```

### Step 2: Look for API Request Logs
You should see lines like:
```
📨 API REQUEST: GET http://localhost:5000/api/auth/profile
   Token available: true
   ✅ JWT token added to Authorization header
```

### Step 3: Check Token Status

**Good**: `Token available: true`
- Token was found in localStorage
- Being sent to backend

**Bad**: `Token available: false` or `⚠️  NO JWT TOKEN FOUND`
- Token was not saved after login
- Try logging in again

### Step 4: Check Error Response

If you see an error, look for:
```
❌ API ERROR: 422 http://localhost:5000/api/capsules/create
   Unprocessable Entity (422) - Invalid data or missing fields
   Response: {error: "..."}
```

OR

```
❌ API ERROR: 401 http://localhost:5000/api/capsules/nearby
   Unauthorized (401) - JWT token may be expired or invalid
   Response: {error: "..."}
```

## Common Scenarios

### Scenario 1: 401 Error - "Unauthorized"

**Cause**: Token not being sent

**Check**:
```
📨 API REQUEST: GET /auth/profile
   ⚠️  NO JWT TOKEN FOUND in localStorage!
```

**Fix**: 
1. Open DevTools → Application tab
2. Check if `access_token` exists in localStorage
3. If not, login again
4. After login, should see: `Token available: true`

---

### Scenario 2: 422 Error - "Unprocessable Entity"

**Cause**: Missing or invalid data

**Check console for**:
```
❌ API ERROR: 422 /capsules/create
   Response: {error: "Missing required fields: latitude, longitude, title, media_type"}
```

**Possible fixes**:
1. **Location not ready**: Wait for "✅ GEOLOCATION ACQUIRED!" in console
2. **Form incomplete**: Fill in all required fields
3. **Image too large**: Try a smaller image file

---

### Scenario 3: Both Errors - Mixed 422 and 401

**Most likely**: JWT token problem

**Debug steps**:
1. Open Console
2. Create a capsule
3. Look for logs starting with `📨 API REQUEST: POST /capsules/create`
4. Check: Is token being sent?
5. Check response: What error does backend give?

---

## Expected Console Output When Working

```
🌍 Geolocation API detected. Checking permissions...
📍 Permission status: granted
✅ GEOLOCATION ACQUIRED!
   Latitude: 28.6139
   Longitude: 77.2090

📨 API REQUEST: GET /auth/profile
   Token available: true
   ✅ JWT token added to Authorization header
✅ API RESPONSE: 200 /auth/profile

📨 API REQUEST: POST /capsules/create
   Token available: true
   ✅ JWT token added to Authorization header
   📤 Using FormData (no Content-Type override)
✅ API RESPONSE: 201 /capsules/create
```

---

## Troubleshooting Checklist

- [ ] Opened Console (F12)
- [ ] Checked if "Token available: true" appears
- [ ] If not, logged in again
- [ ] Checked geolocation says "✅ GEOLOCATION ACQUIRED!"
- [ ] Form is filled with all required fields
- [ ] When creating capsule, check response error message
- [ ] Tell me the exact error message from console

---

## What to Tell Me

When you see the error, send me:
1. The full error log from console
2. Whether token is available (true/false)
3. What endpoint is failing (create, nearby, profile, etc.)
4. The error message in the Response field

Example:
```
📨 API REQUEST: POST /capsules/create
   Token available: true
❌ API ERROR: 422 /capsules/create
   Response: {error: "Missing required fields: latitude"}
```

This will help me fix the exact issue!
