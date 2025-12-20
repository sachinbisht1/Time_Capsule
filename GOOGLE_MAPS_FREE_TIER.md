# 🗺️ Google Maps API - Free Tier Explained

## ✅ YES, It's FREE! But With Limits

### 💰 Free Monthly Credit
Google gives you **$200 free credits** every month for Maps API usage.

### 📊 What's Covered by Free Credits?

| API | Free Requests/Month | Cost After Credit |
|-----|-------------------|-----------------|
| **Maps JavaScript API** | ~10,000-28,000 loads | $7 per 1,000 after credit |
| **Geocoding API** | ~40,000 requests | $5 per 1,000 after credit |
| **Distance Matrix API** | ~40,000 elements | $5 per 1,000 after credit |

### 🎯 For Your TimeCapsule App

Your app only uses **Maps JavaScript API** (displaying the map).

**Real world estimate:**
- 10 users per day
- Each loads map 5 times
- = 50 map loads/day
- = 1,500 loads/month
- **Cost: $0 (covered by $200 free credit)**

✅ **You'll NEVER hit the paid tier for a hobby/learning project!**

---

## 🚀 How to Get Your Free API Key

### Step 1: Go to Google Cloud Console
**URL:** https://console.cloud.google.com/

### Step 2: Create Google Account (if needed)
- Click **Sign in** (top right)
- Use existing Google account or create new one
- Takes 2 minutes

### Step 3: Create a New Project
1. Click **Project Dropdown** at top (says "Select a Project")
2. Click **NEW PROJECT**
3. Enter name: `TimeCapsule`
4. Click **CREATE**
5. Wait ~30 seconds for project to be created
6. Select your new project from dropdown

### Step 4: Enable Maps JavaScript API
1. Search bar at top → type `Maps JavaScript API`
2. Click the search result
3. Click blue **ENABLE** button
4. Wait a few seconds for it to enable

### Step 5: Create API Key
1. Go to **Credentials** (left sidebar)
2. Click **+ CREATE CREDENTIALS** (top button)
3. Select **API Key**
4. A popup shows your new key
5. **COPY THE ENTIRE KEY** (looks like: `AIzaSyDxxx...`)

---

## 🔒 Secure Your API Key (Recommended)

### Optional: Add API Key Restrictions

To prevent others from using your key:

1. Go to **Credentials** (left sidebar)
2. Find your API key in the list
3. Click on it to open details
4. Scroll to **Application restrictions**
5. Select **HTTP referrers (web sites)**
6. Click **Add an HTTP referrer**
7. Enter: `http://localhost:3000/*` (for local development)
8. For production later, add: `https://yourdomain.com/*`
9. Click **Save**

---

## 📝 Paste Your Key into Frontend .env

**File:** `frontend/.env`

```bash
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_GOOGLE_MAPS_API_KEY=AIzaSyDxxx_PASTE_YOUR_KEY_HERE_xxx
```

**Example (DO NOT USE):**
```bash
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_GOOGLE_MAPS_API_KEY=AIzaSyDQxxxxxx-1234567890abcdefghijk
```

---

## ⚠️ Important Notes

### ✅ DO THIS:
- ✅ Keep your key in `.env` (not in code)
- ✅ Add `.env` to `.gitignore` (never commit it)
- ✅ Regenerate key if you think it's compromised
- ✅ Use API key restrictions in production

### ❌ DON'T DO THIS:
- ❌ Share your API key publicly
- ❌ Commit `.env` to GitHub
- ❌ Post your key in forums/screenshots
- ❌ Use unrestricted keys in production

### 💡 You can always:
- Generate new keys anytime
- Delete old keys you don't use
- View your usage at any time
- Set up billing alerts

---

## 📊 Monitor Your Usage (Free!)

To see how much of your $200 credit you're using:

1. Go to **Billing** (left sidebar)
2. Click **Reports**
3. View your usage by API
4. Set up **Budget alerts** so you know if you go over

---

## 🆘 Troubleshooting

### "Maps not showing"
- Check API key is in `frontend/.env`
- Check Maps JavaScript API is **ENABLED** in your project
- Check browser console for errors (F12)
- Wait 5 minutes for API to fully activate

### "API key error / 403 Forbidden"
- Key might be restricted to different domain
- Try removing HTTP referrer restrictions temporarily
- Or add `http://localhost:3000/*` to restrictions

### "Quota exceeded"
- Extremely rare for hobby projects
- Even with $200/month free, you'd need 40,000+ map loads
- Would take months for a small app

---

## 🎓 What You're Actually Paying For

Google Maps charges for:
- **Map loads** (displaying the map)
- **API requests** (getting location data, calculating distance)

Your app uses:
- Maps JavaScript API for displaying the map
- Maybe some geocoding for address lookup

This easily fits in the **$200 free monthly credit**.

---

## 📈 Future: Moving to Production

When you deploy your app publicly:

1. Create a new API key for production
2. Add your production domain as HTTP referrer
3. Monitor usage monthly
4. Even at scale, Maps API is cheap (~$7-15/month for small apps)

---

## 💬 Need Help?

- [Google Maps Pricing](https://cloud.google.com/maps-platform/pricing)
- [API Documentation](https://developers.google.com/maps/documentation/javascript)
- [Billing FAQ](https://cloud.google.com/docs/billing/faqs)

