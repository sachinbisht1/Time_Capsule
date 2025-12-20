# TimeCapsule Development Guide

## 🛠️ Development Environment Setup

### VSCode Extensions (Recommended)

For Backend (Python):
- Python (Microsoft)
- Pylance
- Flask
- SQLAlchemy

For Frontend (React):
- ES7+ React/Redux/React-Native snippets
- Prettier - Code formatter
- ESLint

Install all with:
```
code --install-extension ms-python.python
code --install-extension ms-python.vscode-pylance
code --install-extension formulahendry.flask-snippets
code --install-extension dsznajder.es7-react-js-snippets
code --install-extension esbenp.prettier-vscode
code --install-extension dbaeumer.vscode-eslint
```

---

## 🐍 Backend Development

### Running Backend in Debug Mode

```powershell
cd backend
.\venv\Scripts\Activate
$env:FLASK_ENV = "development"
$env:FLASK_DEBUG = "True"
python run.py
```

### Testing API Endpoints

Using PowerShell with curl:

**Register User:**
```powershell
$body = @{
    username = "testuser"
    email = "test@example.com"
    password = "password123"
} | ConvertTo-Json

curl -X POST http://localhost:5000/api/auth/register `
  -Headers @{"Content-Type"="application/json"} `
  -Body $body
```

**Login User:**
```powershell
$body = @{
    username = "testuser"
    password = "password123"
} | ConvertTo-Json

$response = curl -X POST http://localhost:5000/api/auth/login `
  -Headers @{"Content-Type"="application/json"} `
  -Body $body

$response
```

**Create Capsule (with image):**
```powershell
$form = @{
    latitude = "40.7128"
    longitude = "-74.0060"
    title = "NYC Memory"
    description = "Beautiful sunset at Times Square"
    media_type = "image"
    file = Get-Item "C:\path\to\image.jpg"
}

curl -X POST http://localhost:5000/api/capsules/create `
  -Headers @{"Authorization"="Bearer YOUR_TOKEN_HERE"} `
  -Form $form
```

### Database Inspection

```powershell
# Enter Python shell
python

# Interactive session
>>> from app import create_app, db
>>> from app.models import User, Capsule, Visit
>>> app = create_app()
>>> 
>>> with app.app_context():
...     users = User.query.all()
...     print(f"Total users: {len(users)}")
...     capsules = Capsule.query.all()
...     print(f"Total capsules: {len(capsules)}")
...
>>> exit()
```

### Resetting Database

```powershell
python

>>> from app import create_app, db
>>> app = create_app()
>>> 
>>> with app.app_context():
...     db.drop_all()
...     db.create_all()
...     print("Database reset!")
...
>>> exit()
```

### Common Backend Issues

**Issue: `werkzeug.routing.exceptions.BuildError`**
- Solution: Check route names in API calls match blueprint definitions

**Issue: `sqlalchemy.exc.OperationalError`**
- Solution: Reset database using steps above

**Issue: CORS errors**
- Solution: Verify backend runs on port 5000 and frontend .env is correct

---

## ⚛️ Frontend Development

### Running Frontend in Debug Mode

```powershell
cd frontend
npm start
```

The app auto-reloads when you save files.

### React DevTools Browser Extension

Install React DevTools browser extension to debug component state:
- Chrome: "React Developer Tools"
- Firefox: "React DevTools"

### Simulating Geolocation

In Chrome DevTools:
```
1. Press F12
2. Click ⋮ → More Tools → Sensors
3. Expand "Location"
4. Select location or enter custom coordinates
```

### Testing Different Radii

Modify `MapContainer.jsx` line 76 for testing:
```javascript
// Change radius for testing (1km = 1)
const radius_km = 1;  // Change to smaller value for testing
```

### Common Frontend Issues

**Issue: "Google Maps not loading"**
- Check API key in `.env`
- Verify Maps API is enabled in Google Cloud

**Issue: "Cannot GET /api/capsules/nearby"**
- Backend not running
- Wrong API URL in `.env`

**Issue: "Geolocation not working"**
- Must use HTTPS or localhost
- Allow browser geolocation permission

---

## 📊 API Testing with Postman

### Import Collection

Create a file `postman_collection.json`:

```json
{
  "info": {
    "name": "TimeCapsule API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Auth",
      "item": [
        {
          "name": "Register",
          "request": {
            "method": "POST",
            "url": "http://localhost:5000/api/auth/register",
            "body": {
              "mode": "raw",
              "raw": "{\"username\": \"test\", \"email\": \"test@test.com\", \"password\": \"123\"}"
            }
          }
        }
      ]
    }
  ]
}
```

Import into Postman and test endpoints.

---

## 🔍 Debugging Tips

### Backend Logging

Add to your Flask routes:
```python
import logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

@app.route('/debug-route')
def debug():
    logger.debug("This message appears in console")
    return "OK"
```

### Frontend Debugging

```javascript
// In React components
console.log('Component mounted', userLocation);
console.debug('API Response:', response);
console.error('Error occurred:', error);
```

### Network Tab

Check actual API calls:
```
1. Open DevTools (F12)
2. Network tab
3. Reload page
4. Click on requests to see headers/responses
```

---

## 📈 Performance Optimization

### Backend
```python
# Add database indexes
class Capsule(db.Model):
    latitude = db.Column(db.Float, index=True)
    longitude = db.Column(db.Float, index=True)
```

### Frontend
```javascript
// Use React.memo for expensive components
import React from 'react';

const MapContainer = React.memo(({ userLocation }) => {
  // Component only re-renders if props change
  return <div>Map</div>;
});
```

---

## 🧪 Unit Testing

### Backend with pytest

```powershell
pip install pytest

# Create tests/test_api.py
# Run tests
pytest tests/
```

### Frontend with Jest

```powershell
npm test

# Run in watch mode
npm test -- --watch
```

---

## 📝 Code Style

### Python (Backend)
Follow PEP 8:
```powershell
pip install flake8 black

# Format code
black app/

# Check style
flake8 app/
```

### JavaScript (Frontend)
Use Prettier:
```powershell
npm install --save-dev prettier

# Format code
npx prettier --write src/
```

---

## 🚀 Deployment Checklist

### Before Going Live

- [ ] Update `.env` SECRET_KEY with random string
- [ ] Set `FLASK_ENV=production`
- [ ] Update frontend API URL to production domain
- [ ] Add real Google Maps API restrictions
- [ ] Set up HTTPS/SSL certificate
- [ ] Enable database backups
- [ ] Test file uploads thoroughly
- [ ] Set up logging/monitoring
- [ ] Create database migrations
- [ ] Test on actual mobile device/GPS

### Backend Deployment

```powershell
# Using Gunicorn
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 run:app

# Using with Nginx (reverse proxy recommended)
```

### Frontend Deployment

```powershell
# Build production bundle
npm run build

# Deploy 'build' folder to:
# - Vercel
# - Netlify
# - AWS S3 + CloudFront
# - Any static hosting
```

---

## 🐛 Common Development Tasks

### Add New API Endpoint

1. Create new route in `backend/app/routes/`
2. Add model if needed in `backend/app/models/`
3. Test with curl/Postman
4. Create frontend component to use it
5. Test end-to-end

### Add New React Component

1. Create `.jsx` file in `frontend/src/components/`
2. Create `.css` file for styles
3. Import in parent component
4. Add props and state as needed
5. Test in browser

### Update Database Schema

```python
# Edit model in app/models/
class Capsule(db.Model):
    new_field = db.Column(db.String(100))  # Add new field

# Reset database (development only!)
python
>>> from app import create_app, db
>>> app = create_app()
>>> with app.app_context():
...     db.drop_all()
...     db.create_all()
```

---

## 📞 Getting Help

1. Check error messages carefully
2. Look at console/terminal output
3. Use browser DevTools
4. Check API response with Network tab
5. Read Flask/React documentation
6. Search error on Stack Overflow

---

## ✅ Verification Checklist

After setup, verify:

- [ ] Backend runs at http://localhost:5000
- [ ] Frontend loads at http://localhost:3000
- [ ] Can register new account
- [ ] Can login with account
- [ ] Geolocation works
- [ ] Map displays satellite view
- [ ] Can create memory capsule
- [ ] Can see capsule on map
- [ ] Can view memory within 2m
- [ ] Console has no errors

---

Good luck with development! 🚀
