import React, { useState, useEffect } from 'react';
import { authAPI } from './utils/api';
import ModeToggle from './components/ModeToggle';
import LeafletMapContainer from './components/LeafletMapContainer';
import CapsuleForm from './components/CapsuleForm';
import CapsuleViewer from './components/CapsuleViewer';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [userMode, setUserMode] = useState('visitor');
  const [selectedCapsule, setSelectedCapsule] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      console.log('🌍 Geolocation API detected. Checking permissions...');
      
      let watchId = null;
      let retryCount = 0;
      const maxRetries = 10;
      
      // First, check if we have permission using the Permissions API
      if (navigator.permissions && navigator.permissions.query) {
        navigator.permissions.query({ name: 'geolocation' })
          .then((permission) => {
            console.log(`📍 Permission status: ${permission.state}`);
            // state can be: 'granted', 'denied', 'prompt'
            
            if (permission.state === 'denied') {
              console.error('❌ Location permission was DENIED. Please enable it in browser settings.');
              return;
            }
          })
          .catch((err) => {
            console.error('⚠️  Could not check permission status:', err);
            // Continue anyway, the request might still work
          });
      }
      
      const tryGetPosition = () => {
        console.log(`📍 Attempting to get position (attempt ${retryCount + 1}/${maxRetries})...`);
        
        // Try with low accuracy first (faster), then fall back to high accuracy
        const options = retryCount < 3 
          ? { enableHighAccuracy: false, timeout: 3000, maximumAge: 0 }
          : { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 };
        
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            const accuracy = position.coords.accuracy;
            
            console.log('✅ GEOLOCATION ACQUIRED!');
            console.log(`   Latitude: ${lat}`);
            console.log(`   Longitude: ${lng}`);
            console.log(`   Accuracy: ±${accuracy.toFixed(2)} meters`);
            console.log(`   Timestamp: ${new Date(position.timestamp).toLocaleTimeString()}`);
            
            setUserLocation({
              lat: lat,
              lng: lng,
              accuracy: accuracy,
            });
            
            // After first successful position, use watchPosition for continuous updates
            watchId = navigator.geolocation.watchPosition(
              (pos) => {
                const newLat = pos.coords.latitude;
                const newLng = pos.coords.longitude;
                const newAccuracy = pos.coords.accuracy;
                
                console.log('📍 GEOLOCATION UPDATE (continuous):');
                console.log(`   Latitude: ${newLat}`);
                console.log(`   Longitude: ${newLng}`);
                console.log(`   Accuracy: ±${newAccuracy.toFixed(2)} meters`);
                
                setUserLocation({
                  lat: newLat,
                  lng: newLng,
                  accuracy: newAccuracy,
                });
              },
              (err) => {
                console.error('⚠️  Watch position error:', err.code, err.message);
              },
              { enableHighAccuracy: true, maximumAge: 5000, timeout: 5000 }
            );
          },
          (error) => {
            const errorCodes = {
              1: 'PERMISSION_DENIED - User denied location permission',
              2: 'POSITION_UNAVAILABLE - Device location services are off or unavailable',
              3: 'TIMEOUT - Taking too long to get position'
            };
            const errorName = errorCodes[error.code] || 'UNKNOWN';
            console.error(`❌ Position error:`);
            console.error(`   Code: ${error.code}`);
            console.error(`   Message: ${errorName}`);
            console.error(`   Details: ${error.message}`);
            
            if (error.code === 1) {
              // PERMISSION_DENIED
              console.error('⚠️  PERMISSION ISSUE:');
              console.error('   This usually means:');
              console.error('   1. You clicked "Block" instead of "Allow"');
              console.error('   2. Browser location is disabled in settings');
              console.error('   3. Your device location services are OFF');
              console.error('   FIX: Check browser settings → Privacy → Location or device location settings');
            } else if (error.code === 2) {
              // POSITION_UNAVAILABLE
              console.error('⚠️  LOCATION SERVICES ISSUE:');
              console.error('   Your device location services might be OFF');
              console.error('   FIX: Enable GPS/location services on your device');
            } else if (error.code === 3) {
              // TIMEOUT
              if (retryCount < maxRetries) {
                retryCount++;
                const delay = retryCount < 5 ? 500 : 1000;
                console.log(`⏳ Retrying in ${delay}ms... (${retryCount}/${maxRetries})`);
                setTimeout(tryGetPosition, delay);
              } else {
                console.error('❌ Max retries reached. Location still unavailable.');
              }
            }
          },
          options
        );
      };
      
      // Start trying to get position immediately (don't wait)
      tryGetPosition();
      
      // Don't use a hard fallback timeout - keep retrying instead
      // This ensures we get real GPS data instead of fallback
      // If GPS fails permanently, user will see an error message
      
      // Cleanup
      return () => {
        if (watchId) {
          console.log('🧹 Cleaning up geolocation watch');
          navigator.geolocation.clearWatch(watchId);
        }
      };
    } else {
      console.error('❌ Geolocation not supported by this browser');
    }
  }, []);

  // Check if user is logged in
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      checkAuth();
    }
  }, []); // eslint-disable-next-line react-hooks/exhaustive-deps

  const checkAuth = async () => {
    try {
      const response = await authAPI.getProfile();
      setUser(response.data);
    } catch (error) {
      localStorage.removeItem('access_token');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await authAPI.login(formData.username, formData.password);
      localStorage.setItem('access_token', response.data.access_token);
      setUser(response.data.user);
      setFormData({ username: '', email: '', password: '' });
    } catch (error) {
      alert(error.response?.data?.error || 'Login failed');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await authAPI.register(
        formData.username,
        formData.email,
        formData.password
      );
      localStorage.setItem('access_token', response.data.access_token);
      setUser(response.data.user);
      setFormData({ username: '', email: '', password: '' });
    } catch (error) {
      alert(error.response?.data?.error || 'Registration failed');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    setUser(null);
    setFormData({ username: '', email: '', password: '' });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  if (!user) {
    return (
      <div className="auth-container">
        <div className="auth-box">
          <h1>⏰ TimeCapsule</h1>
          <p>Store and discover location-based memories</p>

          <form onSubmit={authMode === 'login' ? handleLogin : handleRegister}>
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleInputChange}
              required
            />

            {authMode === 'register' && (
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            )}

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleInputChange}
              required
            />

            <button type="submit">
              {authMode === 'login' ? 'Login' : 'Register'}
            </button>
          </form>

          <button
            className="auth-toggle"
            onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
          >
            {authMode === 'login'
              ? "Don't have an account? Register"
              : 'Already have an account? Login'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>⏰ TimeCapsule</h1>
        <ModeToggle userMode={userMode} onModeChange={setUserMode} />
        <div className="header-actions">
          {userMode === 'creator' && (
            <button className="create-btn" onClick={() => setShowForm(!showForm)}>
              {showForm ? '✕ Close' : '+ Create Capsule'}
            </button>
          )}
          <span className="user-info">Welcome, {user.username}</span>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <main className="app-main">
        <div className="map-section">
          <LeafletMapContainer
            userLocation={userLocation}
            userMode={userMode}
            onCapsuleDiscovered={(capsules) => {
              if (capsules.length > 0) {
                console.log(`Discovered ${capsules.length} memories nearby!`);
              }
            }}
            onCapsuleSelect={setSelectedCapsule}
          />
        </div>

        {showForm && userMode === 'creator' && (
          <div className="form-section">
            <CapsuleForm
              userLocation={userLocation}
              onCapsuleCreated={() => {
                setShowForm(false);
                alert('Capsule created! Others can now discover it.');
              }}
            />
          </div>
        )}

        {selectedCapsule && (
          <CapsuleViewer
            capsule={selectedCapsule}
            userLocation={userLocation}
            currentUserId={user?.id}
            onClose={() => setSelectedCapsule(null)}
          />
        )}
      </main>
    </div>
  );
}

export default App;
