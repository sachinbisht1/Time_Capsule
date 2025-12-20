import React, { useState, useCallback } from 'react';
import { useJsApiLoader, GoogleMap, MarkerF, InfoWindowF } from '@react-google-maps/api';
import { capsuleAPI } from '../utils/api';
import './MapContainer.css';

const containerStyle = {
  width: '100%',
  height: 'calc(100vh - 80px)',
};

const defaultCenter = {
  lat: 40.7128,
  lng: -74.0060,
};

const mapOptions = {
  mapTypeId: 'satellite',
  fullscreenControl: true,
  zoomControl: true,
};

export default function MapContainer({ userLocation, userMode, onCapsuleDiscovered }) {
  const [map, setMap] = useState(null);
  const [capsules, setCapsules] = useState([]);
  const [selectedCapsule, setSelectedCapsule] = useState(null);
  const [center, setCenter] = useState(defaultCenter);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
  });

  // Fetch nearby capsules when user location changes
  React.useEffect(() => {
    if (userLocation && userMode === 'visitor') {
      fetchNearbyCapsules(userLocation.lat, userLocation.lng);
    }
  }, [userLocation, userMode]);

  const fetchNearbyCapsules = useCallback(async (lat, lng) => {
    try {
      const response = await capsuleAPI.getNearby(lat, lng);
      setCapsules(response.data.capsules || []);
      onCapsuleDiscovered?.(response.data.capsules);
    } catch (error) {
      console.error('Error fetching nearby capsules:', error);
    }
  }, [onCapsuleDiscovered]);

  const onMapLoad = useCallback((map) => {
    setMap(map);
    if (userLocation) {
      setCenter({ lat: userLocation.lat, lng: userLocation.lng });
      map.panTo({ lat: userLocation.lat, lng: userLocation.lng });
    }
  }, [userLocation]);

  React.useEffect(() => {
    if (userLocation) {
      setCenter({ lat: userLocation.lat, lng: userLocation.lng });
    }
  }, [userLocation]);

  if (!isLoaded) return <div>Loading map...</div>;

  return (
    <div className="map-container">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={15}
        onLoad={onMapLoad}
        options={mapOptions}
      >
        {/* User marker */}
        {userLocation && (
          <MarkerF
            position={{ lat: userLocation.lat, lng: userLocation.lng }}
            title="Your Location"
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: '#4285F4',
              fillOpacity: 1,
              strokeColor: '#fff',
              strokeWeight: 2,
            }}
          />
        )}

        {/* Capsule markers - only visible if within 1km for visitors */}
        {capsules.map((capsule) => (
          <MarkerF
            key={capsule.id}
            position={{ lat: capsule.latitude, lng: capsule.longitude }}
            title={capsule.title}
            onClick={() => setSelectedCapsule(capsule)}
            icon={{
              path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
              scale: 10,
              fillColor: '#EA4335',
              fillOpacity: 1,
              strokeColor: '#fff',
              strokeWeight: 2,
            }}
          />
        ))}

        {/* Info window for selected capsule */}
        {selectedCapsule && (
          <InfoWindowF
            position={{
              lat: selectedCapsule.latitude,
              lng: selectedCapsule.longitude,
            }}
            onCloseClick={() => setSelectedCapsule(null)}
          >
            <div className="info-window">
              <h3>{selectedCapsule.title}</h3>
              <p>{selectedCapsule.description}</p>
              <p>Distance: {selectedCapsule.distance_km}km</p>
              <p>Views: {selectedCapsule.open_count}</p>
              {selectedCapsule.distance_km <= 0.002 && (
                <button onClick={() => {/* View capsule content */}}>
                  View Memory
                </button>
              )}
            </div>
          </InfoWindowF>
        )}
      </GoogleMap>
    </div>
  );
}
