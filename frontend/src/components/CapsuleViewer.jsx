import React, { useState, useEffect } from 'react';
import { capsuleAPI } from '../utils/api';
import './CapsuleViewer.css';

export default function CapsuleViewer({ capsule, userLocation, onClose, currentUserId }) {
  const [capsuleContent, setCapsuleContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);

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

  const handleDeleteCapsule = async () => {
    if (!window.confirm('Are you sure you want to delete this memory? This cannot be undone.')) {
      return;
    }

    setDeleting(true);
    try {
      await capsuleAPI.deleteCapsule(capsule.id);
      console.log('✅ Capsule deleted successfully');
      onClose(); // Close the viewer and refresh list
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message;
      console.error('❌ Error deleting capsule:', errorMsg);
      alert('Error deleting capsule: ' + errorMsg);
    } finally {
      setDeleting(false);
    }
  };

  // Check if current user is the creator
  const isCreator = currentUserId && capsuleContent && String(capsuleContent.owner_id) === String(currentUserId);

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
        <div className="title-with-icon">
          <span className="time-capsule-icon">⏰</span>
          <h2>{capsuleContent.title}</h2>
        </div>
        <div className="header-actions">
          {isCreator && (
            <button
              className="delete-btn"
              onClick={handleDeleteCapsule}
              disabled={deleting}
              title="Delete this memory"
            >
              {deleting ? '🗑️ Deleting...' : '🗑️ Delete'}
            </button>
          )}
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
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
