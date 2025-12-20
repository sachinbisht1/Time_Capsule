from app import db
from datetime import datetime

class Visit(db.Model):
    __tablename__ = 'visits'
    
    id = db.Column(db.Integer, primary_key=True)
    capsule_id = db.Column(db.Integer, db.ForeignKey('capsules.id'), nullable=False)
    visitor_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    visited_at = db.Column(db.DateTime, default=datetime.utcnow)
    visitor_latitude = db.Column(db.Float)
    visitor_longitude = db.Column(db.Float)
    
    def to_dict(self):
        return {
            'id': self.id,
            'capsule_id': self.capsule_id,
            'visitor_id': self.visitor_id,
            'visited_at': self.visited_at.isoformat(),
            'visitor_latitude': self.visitor_latitude,
            'visitor_longitude': self.visitor_longitude
        }
