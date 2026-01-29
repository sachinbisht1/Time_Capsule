import React, { useState, useEffect, useCallback } from 'react';
import api, { capsuleAPI, API_BASE_URL } from '../utils/api';
import './CapsuleViewer.css';

export default function CapsuleViewer({ capsule, userLocation, onClose, currentUserId }) {
  const [capsuleContent, setCapsuleContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const viewCapsule = useCallback(async () => {
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
  }, [capsule.id, userLocation]);

  useEffect(() => {
    // call viewCapsule when capsule id or userLocation changes
    viewCapsule();
  }, [viewCapsule]);

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
          Array.isArray(capsuleContent.media_url) ? (
            <div className="image-gallery" style={{ display: 'flex', overflowX: 'auto', gap: '8px', padding: '8px 0' }}>
              {capsuleContent.media_url.map((u, i) => (
                <div key={i} style={{ flex: '0 0 auto' }}>
                  <ImageFromProtectedUrl url={u} alt={`${capsuleContent.title} - ${i+1}`} className="capsule-image" />
                </div>
              ))}
            </div>
          ) : (
            <ImageFromProtectedUrl url={capsuleContent.media_url} alt={capsuleContent.title} className="capsule-image" />
          )
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


function ImageFromProtectedUrl({ url, alt, className }) {
  const [src, setSrc] = React.useState(null);

  useEffect(() => {
    let mounted = true;
    let objectUrl = null;
    const fetchImage = async () => {
      try {
        // url is like '/api/capsules/1/image' — build absolute URL to backend
        const base = API_BASE_URL.replace(/\/api\/?$/, '');
        const fullUrl = `${base}${url}`;
        const res = await api.get(fullUrl, { responseType: 'blob' });
        const blob = res.data;
        objectUrl = URL.createObjectURL(blob);
        if (mounted) setSrc(objectUrl);
      } catch (e) {
        console.error('Error loading image', e);
      }
    };
    fetchImage();
    return () => {
      mounted = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [url]);

  if (!src) return <div className="image-loading">Loading image...</div>;
  return <img src={src} alt={alt} className={className} />;
}
