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
      navigator.geolocation.watchPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => console.error('Geolocation error:', error),
        { enableHighAccuracy: true, maximumAge: 0 }
      );
    }
  }, []);

  // Check if user is logged in
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      checkAuth();
    }
  }, []);

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
            onClose={() => setSelectedCapsule(null)}
          />
        )}
      </main>
    </div>
  );
}

export default App;
