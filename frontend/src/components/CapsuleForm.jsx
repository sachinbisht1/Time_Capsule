import React, { useState, useEffect } from 'react';
import { capsuleAPI } from '../utils/api';
import './CapsuleForm.css';

export default function CapsuleForm({ userLocation, onCapsuleCreated }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    media_type: 'text',
    media_data: '',
  });
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Log location updates
  useEffect(() => {
    if (userLocation) {
      console.log('📍 CapsuleForm received location:', {
        lat: userLocation.lat,
        lng: userLocation.lng,
        accuracy: userLocation.accuracy,
      });
    } else {
      console.log('⏳ CapsuleForm: location not yet available');
    }
  }, [userLocation]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files || []);
    if (selected.length > 3) {
      setError('You can upload up to 3 images only');
      return;
    }
    setFiles(selected);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
  console.log('📝 CAPSULE FORM SUBMISSION:');
  console.log('   userLocation:', userLocation);
  console.log('   formData:', formData);
  console.log('   files:', files);

      if (!userLocation) {
        console.error('❌ Location not available!');
        console.log('   userLocation is:', userLocation);
        throw new Error('Location not available. Please allow location access and wait for the map to load.');
      }

      console.log('✅ Location available:', userLocation);

      const form = new FormData();
      form.append('latitude', userLocation.lat);
      form.append('longitude', userLocation.lng);
      form.append('title', formData.title);
      form.append('description', formData.description);
      form.append('media_type', formData.media_type);

      if (formData.media_type === 'image' && files && files.length > 0) {
        files.forEach((f) => {
          form.append('file', f);
          console.log('📸 Image file appended:', f.name);
        });
      } else if (formData.media_type === 'text') {
        form.append('media_data', formData.media_data);
        console.log('📝 Text content appended:', formData.media_data.length, 'chars');
      }

      console.log('📤 Sending capsule creation request...');
      const response = await capsuleAPI.create(form);
      console.log('✅ Capsule created successfully:', response.data.capsule);
      onCapsuleCreated?.(response.data.capsule);

      // Reset form
      setFormData({
        title: '',
        description: '',
        media_type: 'text',
        media_data: '',
      });
      setFiles([]);
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message;
      console.error('❌ Error creating capsule:', errorMsg);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="capsule-form">
      <h2>Create Memory Capsule</h2>
      
      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Capsule Title *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="Give your memory a title"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Add details about this memory"
            rows={3}
          />
        </div>

        <div className="form-group">
          <label htmlFor="media_type">Memory Type *</label>
          <select
            id="media_type"
            name="media_type"
            value={formData.media_type}
            onChange={handleInputChange}
          >
            <option value="text">Text Note</option>
            <option value="image">Photo</option>
          </select>
        </div>

        {formData.media_type === 'text' && (
          <div className="form-group">
            <label htmlFor="media_data">Memory Content *</label>
            <textarea
              id="media_data"
              name="media_data"
              value={formData.media_data}
              onChange={handleInputChange}
              placeholder="Write your memory..."
              rows={5}
              required
            />
          </div>
        )}

        {formData.media_type === 'image' && (
          <div className="form-group">
            <label htmlFor="file">Upload Photo *</label>
            <input
              type="file"
              id="file"
              accept="image/*"
              onChange={handleFileChange}
              multiple
              required
            />
            {files && files.length > 0 && (
              <div className="file-list">
                {files.map((f, idx) => (
                  <p key={idx} className="file-name">{f.name}</p>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="location-info">
          {userLocation ? (
            <>
              <p style={{fontWeight: 'bold', color: '#27ae60'}}>
                ✅ Your Current Location
              </p>
              <p style={{fontSize: '1em', margin: '5px 0'}}>
                {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
              </p>
              <p style={{fontSize: '0.9em', color: '#666', margin: '5px 0'}}>
                Accuracy: ±{userLocation.accuracy ? userLocation.accuracy.toFixed(2) : '?'} meters
              </p>
              {userLocation.isFallback && (
                <p style={{fontSize: '0.85em', color: '#e67e22', fontStyle: 'italic'}}>
                  ⚠️ Using fallback location (GPS unavailable)
                </p>
              )}
            </>
          ) : (
            <p style={{color: '#ff6b6b', fontWeight: 'bold'}}>
              ⏳ Acquiring location... Please wait
            </p>
          )}
        </div>

        <button type="submit" disabled={loading || !userLocation}>
          {loading ? 'Creating Capsule...' : !userLocation ? 'Waiting for Location...' : 'Create Capsule'}
        </button>
      </form>
    </div>
  );
}
