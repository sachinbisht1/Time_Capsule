from app import db
from datetime import datetime
import json

class Capsule(db.Model):
    __tablename__ = 'capsules'
    
    id = db.Column(db.Integer, primary_key=True)
    owner_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    media_type = db.Column(db.String(20))  # 'image' or 'text'
    media_url = db.Column(db.String(500))  # Path to image or base64 text
    media_data = db.Column(db.Text)  # For storing text content directly or JSON with image bytes (base64)
    is_open = db.Column(db.Boolean, default=False)
    open_count = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    visits = db.relationship('Visit', backref='capsule', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self, include_content=True):
        data = {
            'id': self.id,
            'owner_id': self.owner_id,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'title': self.title,
            'description': self.description,
            'media_type': self.media_type,
            'is_open': self.is_open,
            'open_count': self.open_count,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
        
        if include_content:
            if self.media_type == 'image':
                # For images we store the binary (base64) inside media_data as JSON.
                # Expose a URL that the frontend can call to fetch the raw image bytes.
                data['media_url'] = f'/api/capsules/{self.id}/image'
            elif self.media_type == 'text':
                data['media_data'] = self.media_data
        
        return data
    
    def calculate_distance(self, user_lat, user_lon):
        """Calculate distance in meters using Haversine formula"""
        from math import radians, sin, cos, sqrt, atan2
        
        R = 6371000  # Earth's radius in meters
        lat1, lon1 = radians(self.latitude), radians(self.longitude)
        lat2, lon2 = radians(user_lat), radians(user_lon)
        
        dlat = lat2 - lat1
        dlon = lon2 - lon1
        
        a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
        c = 2 * atan2(sqrt(a), sqrt(1-a))
        
        return R * c
