# TimeCapsule Debugging Guide

## 🔧 Recent Logging Implementations

### 1. **Frontend Geolocation Logging** ✅
**File:** `frontend/src/App.jsx`

The app now logs your current GPS coordinates when the browser detects your location:

**Console Output Example:**
```
📍 GEOLOCATION UPDATE:
   Latitude: 40.7128
   Longitude: -74.0060
   Accuracy: ±10.45 meters
   Timestamp: 10:23:45 AM
```

**Where to see it:**
1. Open your browser
2. Press `F12` to open Developer Tools
3. Go to the **Console** tab
4. The location info will appear when the map loads

**What to check:**
- Are the latitude/longitude values reasonable?
- Does the accuracy look good (should be <20 meters with enableHighAccuracy)?
- Does the timestamp update when you move?

---

### 2. **Map Component Geolocation Logging** ✅
**File:** `frontend/src/components/LeafletMapContainer.jsx`

When the map receives your location, it logs:

**Console Output Example:**
```
🎯 USER LOCATION DETECTED:
   Latitude: 40.7128
   Longitude: -74.0060
   Accuracy: undefined meters
   Full location object: {lat: 40.7128, lng: -74.0060, accuracy: 10.45}
```

**What to check:**
- Does this location match the App.jsx geolocation logs?
- Is the latitude/longitude the same both places?
- If not, there's a data flow issue

---

### 3. **Backend Capsule Creation Logging** ✅
**File:** `backend/app/routes/capsule.py`

Comprehensive logging has been added to track capsule creation:

**Console Output Example (Flask Terminal):**
```
================================================================================
🔹 POST /api/capsules/create
✅ JWT VALID - user_id=1
📋 Form keys: ['latitude', 'longitude', 'title', 'description', 'media_type', 'media_data']
📋 Files keys: ['file']
📋 Form data: {'latitude': '40.7128', 'longitude': '-74.0060', 'title': 'My Memory', 'media_type': 'text'}
📍 Location: lat=40.7128, lng=-74.0060
📝 Title: My Memory, Type: text
📄 Text saved: 245 chars
✅ Capsule created successfully - ID=1
================================================================================
```

**What to check:**
- Is "✅ JWT VALID" showing? If not, authentication is failing
- Are all form keys present?
- Are latitude/longitude values correct?
- Is the capsule being created with the correct ID?

---

### 4. **Backend Nearby Capsules Logging** ✅
**File:** `backend/app/routes/capsule.py`

Tracks nearby capsule discovery requests:

**Console Output Example (Flask Terminal):**
```
================================================================================
🔹 POST /api/capsules/nearby
📋 Request data: {'latitude': 40.7128, 'longitude': -74.0060}
📍 User location - lat:40.7128, lng:-74.0060, radius:1km
✅ Found 3 capsules nearby
================================================================================
```

---

### 5. **Authentication Logging** ✅
**File:** `backend/app/routes/auth.py`

Tracks registration and login requests:

**Console Output Example (Flask Terminal):**
```
📝 REGISTER REQUEST: {'username': 'john_doe', 'email': 'john@example.com'}
✅ REGISTER SUCCESS - user_id=1, token generated

📝 LOGIN REQUEST: username=john_doe
✅ LOGIN SUCCESS: user_id=1, token generated
```

---

## 🐛 Debugging Workflow for 422 Errors

### **Step 1: Clear Browser Cache**
```
Press Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)
```
This ensures the old api.js code is not being used.

### **Step 2: Open Developer Tools**
1. Press `F12` on your browser
2. Go to the **Network** tab
3. Go to the **Console** tab (keep both open)

### **Step 3: Try Creating a Capsule**
1. Switch to "Creator Mode" in the app
2. Fill in the form:
   - Title: "Test Capsule"
   - Description: "This is a test"
   - Select "Text" for media type
   - Enter some text content
3. Click "Create Capsule"

### **Step 4: Check for Errors**

#### In **Network Tab:**
- Look for the **POST** request to `/api/capsules/create`
- Click on it and check the **Response** section
- If it's 422, you'll see error details

#### In **Flask Terminal:**
- Look for the logging output showing:
  - `✅ JWT VALID` - means authentication passed
  - `📋 Form keys` - shows what data was received
  - `❌` messages indicate where it failed

#### In **Browser Console:**
- Look for geolocation logging:
  ```
  📍 GEOLOCATION UPDATE:
  ```
- Check if coordinates are reasonable

---

## 📊 What Each Log Level Means

| Symbol | Meaning | Action |
|--------|---------|--------|
| ✅ | Success | Everything is working |
| 📍 | Location data | Check if coordinates are correct |
| 📋 | Data information | Verify what the app received |
| 🔹 | API endpoint | Tracks which endpoint is being called |
| ❌ | Error | Something failed, check the message |

---

## 🔍 Common Issues & Solutions

### **Issue: Wrong location shown on map**

**Check:**
1. In Browser Console, look for `📍 GEOLOCATION UPDATE`
2. In Map logs, look for `🎯 USER LOCATION DETECTED`
3. Compare the latitude/longitude values
4. Open Google Maps and verify those coordinates are accurate

**Solution:**
- Try a different location or move to an area with better GPS signal
- Ensure location permission is granted to the browser
- Check if you're using a VPN (can affect location)

---

### **Issue: 422 Error on Capsule Creation**

**Check:**
1. In Flask Terminal, look for `✅ JWT VALID`
   - If missing, JWT authentication failed
2. Check `📋 Form keys` 
   - Verify all required fields are present
3. Check `📍 Location` line
   - Verify latitude/longitude parsed correctly
4. Check for `❌` error messages

**Solution:**
- Try clearing browser cache (Ctrl+Shift+R)
- Check browser console for JS errors
- Verify you're logged in (check for access token in localStorage)

---

### **Issue: Images not saving**

**Check:**
1. In Flask Terminal, look for `🖼️  Image saved: filename.jpg`
2. In Browser Console, check for file upload errors
3. Verify file is <5MB and is an image format

**Solution:**
- Use JPEG, PNG, or GIF files
- Keep file size under 5MB
- Check file permission on server

---

## 📝 Image Base64 Encoding (Future Feature)

Currently, images are saved as files. To store as base64 in the database:

1. Convert image to base64: `base64.b64encode(file.read()).decode('utf-8')`
2. Store in `media_data` field: `data:image/jpeg;base64,{base64_string}`
3. Display in frontend: Use as `<img src={media_data} />`

Benefits:
- No file management needed
- Easier database backup
- Better for cloud deployment
- Can be encrypted

---

## 📞 Quick Reference

| Task | Where to Look | What to Check |
|------|----------------|---------------|
| Check location accuracy | Browser Console | `📍 GEOLOCATION UPDATE:` line |
| Check API request details | Flask Terminal | `📋 Form keys:` and `📍 Location:` |
| Check authentication | Flask Terminal | `✅ JWT VALID` message |
| Check if capsule created | Flask Terminal | `✅ Capsule created successfully` |
| Check for errors | Flask Terminal or Browser Console | `❌` symbols |
| Monitor network requests | Browser Network tab | Look for 422, 400, 500 status codes |

---

## 🚀 Next Steps After Testing

Once 422 errors are resolved:

1. **Implement Image Base64 Encoding**
   - Convert images to base64 format
   - Store in database instead of filesystem
   
2. **Test Full Workflow**
   - Create multiple capsules (text and image)
   - Switch to Visitor mode
   - Discover nearby capsules
   - View capsule content

3. **Performance Optimization**
   - Batch database queries
   - Optimize geolocation accuracy
   - Cache nearby capsules

---

**Last Updated:** December 20, 2025
**Status:** All logging fully implemented ✅
