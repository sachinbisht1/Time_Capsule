import React, { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { capsuleAPI } from '../utils/api';
import './MapContainer.css';

// Fix Leaflet marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Map type toggle control with location button
function MapTypeToggle({ onGoToLocation, userLocation }) {
  const map = useMap();
  const [mapType, setMapType] = useState('street');

  useEffect(() => {
    // Remove existing tile layers
    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    // Add appropriate tile layer
    if (mapType === 'street') {
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);
    } else {
      L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          attribution: '© Esri',
          maxZoom: 18,
        }
      ).addTo(map);
    }
  }, [mapType, map]);

  const handleGoToLocation = () => {
    console.log('📍 Location button clicked');
    console.log('   userLocation:', userLocation);
    
    if (userLocation && typeof userLocation.lat === 'number' && typeof userLocation.lng === 'number') {
      console.log(`✅ Moving map to: ${userLocation.lat}, ${userLocation.lng}`);
      map.setView([userLocation.lat, userLocation.lng], 15);
    } else {
      console.error('❌ Invalid location data:', userLocation);
      alert('Location not available yet. Please allow location access and wait a moment.');
    }
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        zIndex: 1000,
        backgroundColor: 'white',
        padding: '10px',
        borderRadius: '5px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      }}
    >
      <button
        onClick={() => setMapType('street')}
        style={{
          padding: '8px 12px',
          marginRight: '5px',
          backgroundColor: mapType === 'street' ? '#4CAF50' : '#ddd',
          color: mapType === 'street' ? 'white' : 'black',
          border: 'none',
          borderRadius: '3px',
          cursor: 'pointer',
          fontWeight: 'bold',
        }}
      >
        🛣️ Street
      </button>
      <button
        onClick={() => setMapType('satellite')}
        style={{
          padding: '8px 12px',
          marginRight: '5px',
          backgroundColor: mapType === 'satellite' ? '#4CAF50' : '#ddd',
          color: mapType === 'satellite' ? 'white' : 'black',
          border: 'none',
          borderRadius: '3px',
          cursor: 'pointer',
          fontWeight: 'bold',
        }}
      >
        🛰️ Satellite
      </button>
      <button
        onClick={handleGoToLocation}
        style={{
          padding: '8px 12px',
          backgroundColor: '#2196F3',
          color: 'white',
          border: 'none',
          borderRadius: '3px',
          cursor: 'pointer',
          fontWeight: 'bold',
        }}
      >
        📍 My Location
      </button>
    </div>
  );
}

// Component to handle user location and capsule markers
function MapContent({ userLocation, userMode, capsules, myCapsules, onCapsuleSelect, onCapsuleDiscovered }) {
  const map = useMap();

  const fetchNearbyCapsules = useCallback(async (lat, lng) => {
    try {
      const response = await capsuleAPI.getNearby(lat, lng);
      onCapsuleDiscovered?.(response.data.capsules || []);
    } catch (error) {
      console.error('Error fetching nearby capsules:', error);
    }
  }, [onCapsuleDiscovered]);

  const fetchUserCapsules = useCallback(async () => {
    try {
      const response = await capsuleAPI.getMyCapsules();
      onCapsuleDiscovered?.(response.data.capsules || []);
    } catch (error) {
      console.error('Error fetching user capsules:', error);
    }
  }, [onCapsuleDiscovered]);

  // Center map on user location
  useEffect(() => {
    if (userLocation) {
      console.log('🎯 USER LOCATION DETECTED:');
      console.log(`   Latitude: ${userLocation.lat}`);
      console.log(`   Longitude: ${userLocation.lng}`);
      console.log(`   Accuracy: ${userLocation.accuracy || 'unknown'} meters`);
      console.log(`   Full location object:`, userLocation);
      map.setView([userLocation.lat, userLocation.lng], 15);
    }
  }, [userLocation, map]);

  // Fetch nearby capsules when user location changes (visitor mode)
  useEffect(() => {
    if (userLocation && userMode === 'visitor') {
      fetchNearbyCapsules(userLocation.lat, userLocation.lng);
    }
  }, [userLocation, userMode, fetchNearbyCapsules]);

  // Fetch user's capsules (creator mode)
  useEffect(() => {
    if (userMode === 'creator') {
      fetchUserCapsules();
    }
  }, [userMode, fetchUserCapsules]);

  // Determine which capsules to show based on mode
  const displayCapsules = userMode === 'creator' ? myCapsules : capsules;

  return (
    <>
      {/* User location marker - Show in BOTH modes */}
      {userLocation && (
        <Marker
          position={[userLocation.lat, userLocation.lng]}
          icon={L.icon({
            iconUrl:
              'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
            shadowUrl:
              'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41],
          })}
          title="Your Current Location"
        >
          <Popup>
            📍 <strong>Your Location</strong>
          </Popup>
        </Marker>
      )}

      {/* Capsule markers */}
      {displayCapsules &&
        displayCapsules.map((capsule) => {
          // Use different color for own capsules (purple) vs discovered (red)
          const isOwnCapsule = userMode === 'creator';
          const markerUrl = isOwnCapsule
            ? 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png'
            : 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png';

          return (
            <Marker
              key={capsule.id}
              position={[capsule.latitude, capsule.longitude]}
              title={capsule.title}
              icon={L.icon({
                iconUrl: markerUrl,
                shadowUrl:
                  'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41],
              })}
              eventHandlers={{
                click: () => onCapsuleSelect(capsule),
              }}
            >
              <Popup>
                <div>
                  <h3>{capsule.title}</h3>
                  <p>{capsule.description?.substring(0, 50)}...</p>
                  <button
                    onClick={() => onCapsuleSelect(capsule)}
                    style={{
                      padding: '5px 10px',
                      backgroundColor: '#4CAF50',
                      color: 'white',
                      border: 'none',
                      borderRadius: '3px',
                      cursor: 'pointer',
                    }}
                  >
                    View
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
    </>
  );
}

export default function LeafletMapContainer({
  userLocation,
  userMode,
  onCapsuleDiscovered,
  onCapsuleSelect,
}) {
  const [capsules, setCapsules] = useState([]);
  const [myCapsules, setMyCapsules] = useState([]);

  const defaultCenter = [40.7128, -74.006]; // NYC

  const handleCapsuleDiscovered = (discoveredCapsules) => {
    if (userMode === 'creator') {
      setMyCapsules(discoveredCapsules);
    } else {
      setCapsules(discoveredCapsules);
    }
    onCapsuleDiscovered?.(discoveredCapsules);
  };

  const handleCapsuleSelect = (capsule) => {
    onCapsuleSelect?.(capsule);
  };

  return (
    <div className="map-container">
      <MapContainer
        center={userLocation ? [userLocation.lat, userLocation.lng] : defaultCenter}
        zoom={15}
        style={{ height: 'calc(100vh - 80px)', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='© OpenStreetMap contributors'
        />

        <MapTypeToggle userLocation={userLocation} />

        <MapContent
          userLocation={userLocation}
          userMode={userMode}
          capsules={capsules}
          myCapsules={myCapsules}
          onCapsuleDiscovered={handleCapsuleDiscovered}
          onCapsuleSelect={handleCapsuleSelect}
        />
      </MapContainer>
    </div>
  );
}
