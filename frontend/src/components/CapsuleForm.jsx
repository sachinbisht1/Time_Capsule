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
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!userLocation) {
        throw new Error('Location not available');
      }

      const form = new FormData();
      form.append('latitude', userLocation.lat);
      form.append('longitude', userLocation.lng);
      form.append('title', formData.title);
      form.append('description', formData.description);
      form.append('media_type', formData.media_type);

      if (formData.media_type === 'image' && file) {
        form.append('file', file);
      } else if (formData.media_type === 'text') {
        form.append('media_data', formData.media_data);
      }

      const response = await capsuleAPI.create(form);
      onCapsuleCreated?.(response.data.capsule);

      // Reset form
      setFormData({
        title: '',
        description: '',
        media_type: 'text',
        media_data: '',
      });
      setFile(null);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
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
              required
            />
            {file && <p className="file-name">{file.name}</p>}
          </div>
        )}

        <div className="location-info">
          {userLocation && (
            <p>
              Location: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
            </p>
          )}
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Creating Capsule...' : 'Create Capsule'}
        </button>
      </form>
    </div>
  );
}
