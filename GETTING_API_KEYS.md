# 🔑 Getting API Keys & Setting Up Environment Variables

This guide explains how to get the required keys and configure your `.env` files.

---

## 📋 What Keys Do You Need?

| Key | Where | What For | Required? |
|-----|-------|----------|-----------|
| `SECRET_KEY` | Backend | Flask session security | ✅ Yes |
| `JWT_SECRET_KEY` | Backend | JWT token signing | ✅ Yes |
| `REACT_APP_GOOGLE_MAPS_API_KEY` | Frontend | Google Maps display | ✅ Yes |
| `REACT_APP_API_URL` | Frontend | Backend API endpoint | ✅ Yes (already set) |

---

## ✅ Backend Keys

### 1️⃣ SECRET_KEY & JWT_SECRET_KEY (Easy - Generate Yourself)

You can generate random secure strings using Python. Open terminal and run:

```powershell
# In your backend venv
python -c "import secrets; print(secrets.token_hex(32))"
```

This will output something like:
```
a3f5c8e2d1b4f9e6c7a2b5d8e1f4a7c0b3e6f9a2d5c8e1b4f7a0d3e6c9b2e5
```

**Do this TWICE** - once for SECRET_KEY and once for JWT_SECRET_KEY.

### 2️⃣ Create `.env` file in backend folder

**File location:** `C:\Users\ksach\Desktop\BUDGET_template\TimeCapsule\backend\.env`

Copy this and replace with your generated keys:

```bash
FLASK_ENV=development
FLASK_APP=run.py
FLASK_DEBUG=True
SECRET_KEY=PASTE_YOUR_FIRST_GENERATED_KEY_HERE
JWT_SECRET_KEY=PASTE_YOUR_SECOND_GENERATED_KEY_HERE
DATABASE_URL=sqlite:///timecapsule.db
UPLOAD_FOLDER=uploads
MAX_CONTENT_LENGTH=16777216
```

**Example (DO NOT USE - GENERATE YOUR OWN):**
```bash
FLASK_ENV=development
FLASK_APP=run.py
FLASK_DEBUG=True
SECRET_KEY=a3f5c8e2d1b4f9e6c7a2b5d8e1f4a7c0b3e6f9a2d5c8e1b4f7a0d3e6c9b2e5
JWT_SECRET_KEY=f4a7c0b3e6f9a2d5c8e1b4f7a0d3e6c9b2e5a3f5c8e2d1b4f9e6c7a2b5d8
DATABASE_URL=sqlite:///timecapsule.db
UPLOAD_FOLDER=uploads
MAX_CONTENT_LENGTH=16777216
```

---

## 🗺️ Frontend: Google Maps API Key

### Step 1: Go to Google Cloud Console

1. Open: https://console.cloud.google.com/
2. **Sign in with your Google account** (create one if you don't have it)

### Step 2: Create a New Project

1. Click the **Project dropdown** at the top (says "Select a Project")
2. Click **NEW PROJECT**
3. Name it: `TimeCapsule` (or whatever you want)
4. Click **CREATE**
5. **Wait 30 seconds** for the project to be created
6. Select your new project from the dropdown

### Step 3: Enable Maps API

1. Search for **"Maps JavaScript API"** in the search bar at the top
2. Click the result
3. Click the blue **ENABLE** button
4. **Wait a few seconds** for it to enable

### Step 4: Create an API Key

1. Go to **Credentials** (left sidebar)
2. Click **+ CREATE CREDENTIALS** at the top
3. Select **API Key**
4. A popup will show your new API key - **COPY IT**
5. Click **Close** or the X

### Step 5: Restrict Your API Key (Optional but Recommended)

1. Go back to **Credentials**
2. Find your API key in the list
3. Click on it
4. Under **Application restrictions** select **HTTP referrers (web sites)**
5. Add: `http://localhost:3000/*` (for local development)
6. Click **Save**

### Step 6: Create `.env` file in frontend folder

**File location:** `C:\Users\ksach\Desktop\BUDGET_template\TimeCapsule\frontend\.env`

Create this file with:

```bash
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_GOOGLE_MAPS_API_KEY=PASTE_YOUR_GOOGLE_MAPS_KEY_HERE
```

**Example (DO NOT USE):**
```bash
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_GOOGLE_MAPS_API_KEY=AIzaSyDxxx_your_actual_key_xxxxx-Vy4Wvu8
```

---

## 📝 Summary of What You Need to Do

| Step | Action | Where |
|------|--------|-------|
| 1 | Generate 2 secret keys using Python | Terminal |
| 2 | Create `backend/.env` with those keys | `backend/.env` |
| 3 | Visit Google Cloud Console | https://console.cloud.google.com |
| 4 | Create project & enable Maps API | Google Cloud |
| 5 | Get API key from Credentials | Google Cloud |
| 6 | Create `frontend/.env` with API key | `frontend/.env` |

---

## ✨ Verification Checklist

After setting up your `.env` files:

```
✅ backend/.env exists with:
   - SECRET_KEY (looks like: a3f5c8e2d1b4f9e6c7a2b5d8e1f4a7c0b3e6f9a2d5c8e1b4f7a0d3e6c9b2e5)
   - JWT_SECRET_KEY (looks like: f4a7c0b3e6f9a2d5c8e1b4f7a0d3e6c9b2e5a3f5c8e2d1b4f9e6c7a2b5d8)
   - DATABASE_URL=sqlite:///timecapsule.db
   - UPLOAD_FOLDER=uploads
   - Other fields unchanged

✅ frontend/.env exists with:
   - REACT_APP_API_URL=http://localhost:5000/api
   - REACT_APP_GOOGLE_MAPS_API_KEY=AIzaSy... (your actual key)

✅ Neither .env file is committed to git (add to .gitignore)
```

---

## 🚀 Next Steps

Once you have both `.env` files set up:

1. **Keep backend terminal open (venv activated)**
2. **Run the backend:**
   ```powershell
   python run.py
   ```
   You should see: `Running on http://127.0.0.1:5000`

3. **Open new terminal for frontend**
4. **Navigate to frontend folder and run:**
   ```powershell
   npm start
   ```
   You should see the app open at `http://localhost:3000`

---

## ❓ Troubleshooting

### "Google Maps not showing"
- Check if `REACT_APP_GOOGLE_MAPS_API_KEY` is in `frontend/.env`
- Make sure Maps JavaScript API is enabled in Google Cloud Console
- Check if your API key has application restrictions set correctly

### "Cannot connect to backend"
- Check if `REACT_APP_API_URL=http://localhost:5000/api` in `frontend/.env`
- Make sure backend is running on port 5000
- Check for CORS errors in browser console

### "SECRET_KEY error when starting backend"
- Make sure `SECRET_KEY` is in `backend/.env`
- Make sure the .env file is in the backend root folder
- Try regenerating a new SECRET_KEY

---

## 🔒 Security Notes

- **Never commit `.env` files to git** - they contain secrets!
- **Never share your API keys** - anyone with them can use your quota
- **Rotate keys periodically** in production
- For production, use environment variables instead of `.env` files

---

## 📚 Additional Resources

- [Google Cloud Console Help](https://cloud.google.com/docs)
- [Maps JavaScript API Docs](https://developers.google.com/maps/documentation/javascript)
- [Flask Environment Variables](https://flask.palletsprojects.com/config/)

