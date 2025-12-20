# Installation & Setup Guide for TimeCapsule

## 📋 Prerequisites

### Windows Setup
- Python 3.8 or higher
- Node.js 14+ and npm
- Git (optional)
- Google Maps API Key

### Verify Prerequisites

```powershell
python --version
node --version
npm --version
```

## 🔧 Backend Setup (Python/Flask)

### 1. Navigate to Backend Directory
```powershell
cd backend
```

### 2. Create Virtual Environment
```powershell
python -m venv venv
```

### 3. Activate Virtual Environment
```powershell
# Windows PowerShell
.\venv\Scripts\Activate

# Windows Command Prompt
venv\Scripts\activate.bat
```

### 4. Install Dependencies
```powershell
pip install -r requirements.txt
```

### 5. Setup Environment Variables
```powershell
# Copy example file
copy .env.example .env

# Edit .env file with your settings
notepad .env
```

**Important .env settings:**
```
SECRET_KEY=your_secret_key_change_this
JWT_SECRET_KEY=your_jwt_secret_key_change_this
FLASK_DEBUG=True
```

### 6. Initialize Database
```powershell
python
>>> from app import create_app, db
>>> app = create_app()
>>> with app.app_context():
...     db.create_all()
>>> exit()
```

### 7. Run Backend Server
```powershell
python run.py
```

✅ Backend will run at: **http://localhost:5000**

## 💻 Frontend Setup (React)

### 1. Navigate to Frontend Directory
```powershell
cd ../frontend
```

### 2. Install Dependencies
```powershell
npm install
```

### 3. Setup Environment Variables
```powershell
# Copy example file
copy .env.example .env

# Edit .env file
notepad .env
```

**Important .env settings:**
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

### 4. Get Google Maps API Key

1. Go to https://console.cloud.google.com/
2. Create a new project
3. Enable Maps JavaScript API
4. Create API key (Credentials → Create API key)
5. Copy the API key to `.env` file

### 5. Run Frontend Development Server
```powershell
npm start
```

✅ Frontend will open at: **http://localhost:3000**

## ✅ Verify Installation

### Backend Verification
```powershell
# Test in another terminal
curl http://localhost:5000/api/auth/profile
# Should return error (needs token), but confirms API is running
```

### Frontend Verification
- Open http://localhost:3000 in your browser
- You should see the TimeCapsule login page
- Map should load without errors

## 🐛 Common Issues & Solutions

### Issue: "ModuleNotFoundError: No module named 'flask'"
**Solution:** Make sure virtual environment is activated
```powershell
.\venv\Scripts\Activate
pip install -r requirements.txt
```

### Issue: "Port 5000 already in use"
**Solution:** Change port in run.py or kill existing process
```powershell
# Kill process on port 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### Issue: "npm not found"
**Solution:** Install Node.js from https://nodejs.org/

### Issue: "Google Maps not loading"
**Solution:** Check API key in .env and ensure Maps API is enabled

### Issue: "CORS error when accessing backend"
**Solution:** Backend and frontend URLs must match in .env

## 📚 Directory Structure

```
TimeCapsule/
├── backend/
│   ├── app/
│   ├── uploads/
│   ├── requirements.txt
│   ├── run.py
│   └── .env
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── .env
└── ARCHITECTURE.md
```

## 🎯 First Time Use

### Create Your First Account
1. Go to http://localhost:3000
2. Click "Don't have an account? Register"
3. Fill in username, email, and password
4. Click Register

### Create a Memory
1. Click "Creator" button in top navigation
2. Click "+ Create Capsule"
3. Fill in title and description
4. Choose to upload a photo or write text
5. Click "Create Capsule"

### Discover Memories
1. Click "Visitor" button to switch modes
2. Map shows all capsules within 1km
3. Navigate closer to see capsule details
4. Get within 2 meters to unlock and view

## 📞 Troubleshooting

For more detailed help, check:
- Backend documentation: `backend/README.md`
- Frontend documentation: `frontend/README.md`
- Architecture guide: `ARCHITECTURE.md`

## 🚀 Production Deployment

### Backend
```powershell
# Use Gunicorn for production
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 run:app
```

### Frontend
```powershell
npm run build
# Deploy contents of 'build' folder to static hosting
```

**Note:** Update .env URLs for your production domain!
