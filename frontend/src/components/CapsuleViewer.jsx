import React, { useState, useEffect } from 'react';
import { capsuleAPI } from '../utils/api';
import './CapsuleViewer.css';

export default function CapsuleViewer({ capsule, userLocation, onClose }) {
  const [capsuleContent, setCapsuleContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    viewCapsule();
  }, [capsule.id]);

  const viewCapsule = async () => {
    try {
      if (!userLocation) {
        throw new Error('Location not available');
      }

      const response = await capsuleAPI.viewCapsule(
        capsule.id,
        userLocation.lat,
        userLocation.lng
      );
      setCapsuleContent(response.data.capsule);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="capsule-viewer">
        <div className="viewer-loading">Loading memory...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="capsule-viewer">
        <div className="viewer-error">
          <h3>Cannot Open Capsule</h3>
          <p>{error}</p>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    );
  }

  return (
    <div className="capsule-viewer">
      <div className="viewer-header">
        <h2>{capsuleContent.title}</h2>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>

      <div className="viewer-content">
        {capsuleContent.description && (
          <p className="description">{capsuleContent.description}</p>
        )}

        {capsuleContent.media_type === 'image' && capsuleContent.media_url && (
          <img
            src={capsuleContent.media_url}
            alt={capsuleContent.title}
            className="capsule-image"
          />
        )}

        {capsuleContent.media_type === 'text' && capsuleContent.media_data && (
          <div className="capsule-text">
            {capsuleContent.media_data}
          </div>
        )}

        <div className="capsule-stats">
          <p><strong>Created:</strong> {new Date(capsuleContent.created_at).toLocaleDateString()}</p>
          <p><strong>Total Views:</strong> {capsuleContent.open_count}</p>
        </div>
      </div>

      <button className="close-btn-bottom" onClick={onClose}>Close Memory</button>
    </div>
  );
}
