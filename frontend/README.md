# TimeCapsule Frontend

A React-based web application for discovering and storing location-based memories with Google Maps integration.

## Features

- **User Authentication**: Register and login securely
- **User Modes**: Switch between Visitor (discover memories) and Creator (store memories) modes
- **Google Maps Integration**: Real-time satellite view with geolocation
- **Memory Discovery**: Automatic discovery of nearby capsules (within 1km radius)
- **Memory Viewing**: Access memories when you're within 2 meters
- **Media Support**: Store text notes or images as memories
- **Real-time Location Tracking**: GPS tracking with automatic updates

## Setup

### Prerequisites
- Node.js 14+ and npm
- Google Maps API Key

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the project root:
```bash
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

3. Start the development server:
```bash
npm start
```

The app will open at `http://localhost:3000`

## How to Use

### As a Creator
1. Login to your account
2. Click the "Creator" button in the mode toggle
3. Click "+ Create Capsule" 
4. Fill in the memory details (title, description)
5. Choose to upload a photo or write a text note
6. Click "Create Capsule" to store it at your current location

### As a Visitor
1. Login to your account
2. Click the "Visitor" button in the mode toggle
3. The map automatically shows capsules within 1km radius
4. Navigate towards any capsule marker
5. Once you're within 2 meters, the capsule will unlock
6. Click to view the memory

## Environment Variables

- `REACT_APP_API_URL`: Backend API URL (default: http://localhost:5000/api)
- `REACT_APP_GOOGLE_MAPS_API_KEY`: Your Google Maps API Key

## Technologies

- React 18
- Google Maps API
- Axios for API calls
- CSS3 for styling
