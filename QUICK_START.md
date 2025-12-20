# ⚡ Quick Start & Troubleshooting

## 🚀 30-Second Setup (Windows PowerShell)

### Terminal 1: Backend

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate
pip install -r requirements.txt
copy .env.example .env
python run.py
```

✅ Backend running: http://localhost:5000

### Terminal 2: Frontend

```powershell
cd frontend
npm install
copy .env.example .env
npm start
```

✅ Frontend running: http://localhost:3000

---

## 🔧 Common Problems & Solutions

### ❌ Python not found
```
Error: 'python' is not recognized as an internal or external command
```
**Solution:** Add Python to PATH or download from python.org

---

### ❌ Virtual environment not activating
```
Error: "cannot be loaded because running scripts is disabled on this system"
```
**Solution (PowerShell):**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
.\venv\Scripts\Activate
```

**Or use Command Prompt:**
```cmd
venv\Scripts\activate.bat
```

---

### ❌ Port 5000 already in use
```
Error: Address already in use. Make sure to quit the server in the terminal that started it
```
**Solution:**
```powershell
# Find what's using port 5000
netstat -ano | findstr :5000

# Kill the process (replace XXXX with PID from above)
taskkill /PID XXXX /F

# Or change port in backend/run.py line 6:
# app.run(debug=True, host='0.0.0.0', port=5001)  # Change 5000 to 5001
```

---

### ❌ `pip install` failing
```
Error: Could not find a version that satisfies the requirement
```
**Solution:**
```powershell
# Upgrade pip
python -m pip install --upgrade pip

# Then try again
pip install -r requirements.txt
```

---

### ❌ `npm install` failing
```
Error: npm ERR! code ENOENT
```
**Solution:**
```powershell
# Verify Node.js is installed
node --version
npm --version

# Clear npm cache
npm cache clean --force

# Try again
npm install
```

---

### ❌ React not starting
```
Error: Something is wrong with your installation of create-react-app
```
**Solution:**
```powershell
# Delete node_modules and package-lock.json
rm -r node_modules
rm package-lock.json

# Reinstall
npm install
npm start
```

---

### ❌ Cannot read property 'latitude' of undefined
```
Error in MapContainer.jsx
```
**Solution:** Browser hasn't got location yet. Wait a moment or check:
```
1. Open DevTools (F12)
2. Check console for geolocation errors
3. Allow browser location permission
4. For testing, use Chrome DevTools > Sensors > Location
```

---

### ❌ Google Maps not showing
```
Error: "Google is not defined" or blank map area
```
**Solution:**
```
1. Check REACT_APP_GOOGLE_MAPS_API_KEY in frontend/.env
2. Verify API key is valid (Google Cloud Console)
3. Enable "Maps JavaScript API" in Google Cloud
4. Restart npm (Ctrl+C, then npm start)
```

---

### ❌ API calls returning 401 (Unauthorized)
```
Error: "Unauthorized" when creating capsule
```
**Solution:**
```
1. Check if logged in (token in localStorage)
2. Verify token in browser DevTools Console:
   localStorage.getItem('access_token')
3. If empty, log in again
4. Check backend .env has SECRET_KEY set
```

---

### ❌ CORS error
```
Error: "Access to XMLHttpRequest blocked by CORS policy"
```
**Solution:**
```
1. Backend must be running on http://localhost:5000
2. Frontend .env must have: REACT_APP_API_URL=http://localhost:5000/api
3. Restart both frontend and backend after changing .env
```

---

### ❌ Image upload failing
```
Error: "Invalid file type" or file not saving
```
**Solution:**
```
1. Only PNG, JPG, GIF, WebP allowed
2. Max file size: 16MB
3. Make sure uploads/ folder exists in backend/
4. Check file permissions on uploads/ folder
```

---

### ❌ Database error
```
Error: "database is locked" or sqlite3 errors
```
**Solution:**
```powershell
# Reset database (deletes all data!)
python
>>> from app import create_app, db
>>> app = create_app()
>>> with app.app_context():
...     db.drop_all()
...     db.create_all()
...     print("Database reset!")
>>> exit()

# Then restart backend
python run.py
```

---

### ❌ "Cannot find module 'flask'"
```
Error when running python run.py
```
**Solution:**
```powershell
# Make sure venv is activated (shows (venv) in prompt)
.\venv\Scripts\Activate

# If not, reinstall
pip install -r requirements.txt

# Verify installed
pip list | grep flask
```

---

### ❌ "Module not found: Can't resolve '@react-google-maps/api'"
```
Error in React development
```
**Solution:**
```powershell
# Install missing dependency
npm install @react-google-maps/api

# Or reinstall all dependencies
npm install
```

---

## ✅ Verification Steps

After setup, test each part:

### 1️⃣ Backend Running?
```powershell
curl http://localhost:5000/api/auth/profile
# Should show error about token (that's OK, means API is running)
```

### 2️⃣ Frontend Loading?
Open http://localhost:3000 in browser
- Should see login/register page
- No JavaScript errors in console

### 3️⃣ Authentication Working?
1. Register new account
2. Check browser DevTools → Application → localStorage
3. Should see `access_token` key

### 4️⃣ Location Working?
1. Open DevTools (F12)
2. Console tab
3. Type: `navigator.geolocation.getCurrentPosition(pos => console.log(pos.coords))`
4. Should show latitude/longitude

### 5️⃣ Database Working?
```powershell
# In backend directory
python
>>> from app import create_app, db
>>> from app.models import User, Capsule
>>> app = create_app()
>>> with app.app_context():
...     print(f"Users: {User.query.count()}")
...     print(f"Capsules: {Capsule.query.count()}")
>>> exit()
```

---

## 🔍 Debugging Checklist

- [ ] Python version 3.8+
- [ ] Node.js 14+
- [ ] Virtual environment activated (venv)
- [ ] All requirements installed
- [ ] .env files created and configured
- [ ] Backend running on :5000
- [ ] Frontend running on :3000
- [ ] Browser allows geolocation
- [ ] Google Maps API key valid
- [ ] No JavaScript errors in console
- [ ] Can register and login
- [ ] SQLite database created

---

## 📱 Testing the App

### Test Scenario 1: Create Memory

1. Go to http://localhost:3000
2. Register: `alice` / `alice@test.com` / `password123`
3. Click "Creator" button
4. Click "+ Create Capsule"
5. Fill form:
   - Title: "My First Memory"
   - Description: "This is awesome"
   - Choose Text option
   - Text: "Hello from the past!"
6. Click "Create Capsule"
7. Should see success message

### Test Scenario 2: Discover Memory

1. Register new account: `bob` / `bob@test.com` / `password123`
2. Click "Visitor" button
3. Check map - should see capsule marker (red)
4. (In DevTools Sensors) Set location near capsule
5. Red marker should stay on map
6. Click marker → info window shows
7. Move closer (within 2m in DevTools)
8. Click "View Memory"
9. Should see Alice's memory!

### Test Scenario 3: Statistics

1. Login as Alice (creator)
2. Switch to Creator mode
3. Go to browser DevTools
4. In Console:
   ```javascript
   fetch('http://localhost:5000/api/capsules/1/stats', {
     headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
   }).then(r => r.json()).then(console.log)
   ```
5. Should show: total_views: 1, unique_visitors: 1

---

## 🆘 Getting Help

### Check Logs

**Backend logs:**
- Terminal where `python run.py` is running
- Look for error messages with red text
- Copy-paste errors into Google

**Frontend logs:**
- Open DevTools (F12)
- Console tab shows all JavaScript errors
- Network tab shows API requests/responses

### Step-by-Step Debugging

1. **Is backend running?**
   ```powershell
   curl http://localhost:5000/api/auth/profile
   ```

2. **Is frontend running?**
   - Can you see the login page at http://localhost:3000?

3. **Is authentication working?**
   - Register account
   - Check localStorage in DevTools

4. **Is location working?**
   - Allow browser permission
   - Test in DevTools Sensors

5. **Is database working?**
   - Check backend folder for `timecapsule.db` file
   - Should be ~10KB or larger

6. **Is API responding?**
   - Network tab in DevTools
   - Should see API calls to http://localhost:5000/api/*

### Resources

- Python Issues: https://www.python.org/
- Node/npm Issues: https://nodejs.org/
- Flask: https://flask.palletsprojects.com/
- React: https://react.dev/
- Google Maps: https://developers.google.com/maps

---

## 💡 Pro Tips

### Tip 1: Live Reload
Frontend automatically reloads when you save files. Backend needs manual restart.

### Tip 2: Console Logging
```javascript
// In React components
console.log('User location:', userLocation);
console.log('Nearby capsules:', capsules);
```

### Tip 3: Fake GPS for Testing
DevTools → Sensors → Location → Override with custom coordinates

### Tip 4: View Database
```powershell
# Download SQLite Browser from https://sqlitebrowser.org/
# Open backend/timecapsule.db
# View tables directly
```

### Tip 5: Clear Browser Cache
```
DevTools → Application → Clear site data
Then reload page
```

### Tip 6: Environment Variables Trick
```powershell
# Frontend: Changes require restart
# Backend: Some changes require restart

# Always restart after editing .env files!
```

---

## 🎯 Next Steps After Setup

1. ✅ Get it running (follow 30-second setup above)
2. ✅ Create test account
3. ✅ Create test capsule
4. ✅ Discover capsule
5. ✅ View memory
6. ✅ Check statistics
7. 📖 Read DEVELOPMENT.md for more features
8. 🚀 Deploy to production

---

**Happy coding! 🚀**

Still stuck? Check:
- DEVELOPMENT.md - for advanced debugging
- ARCHITECTURE_DETAILED.md - for system understanding
- backend/README.md - for API details
- frontend/README.md - for React details
