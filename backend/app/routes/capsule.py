from flask import request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from app import db
from app.models import Capsule, User, Visit
from . import capsule_bp
import os
from datetime import datetime
import traceback

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@capsule_bp.route('/create', methods=['POST'])
@jwt_required()
def create_capsule():
    user_id = get_jwt_identity()
    
    try:
        print(f"DEBUG: Received request from user {user_id}")
        print(f"DEBUG: Form data: {request.form}")
        print(f"DEBUG: Files: {request.files}")
        
        latitude = float(request.form.get('latitude'))
        longitude = float(request.form.get('longitude'))
        title = request.form.get('title')
        description = request.form.get('description', '')
        media_type = request.form.get('media_type')  # 'image' or 'text'
        
        print(f"DEBUG: Parsed values - lat:{latitude}, lng:{longitude}, title:{title}, type:{media_type}")
        
        if not all([latitude, longitude, title, media_type]):
            return jsonify({'error': 'Missing required fields'}), 400
        
        capsule = Capsule(
            owner_id=user_id,
            latitude=latitude,
            longitude=longitude,
            title=title,
            description=description,
            media_type=media_type
        )
        
        if media_type == 'image':
            if 'file' not in request.files:
                return jsonify({'error': 'No image provided'}), 400
            
            file = request.files['file']
            if file.filename == '':
                return jsonify({'error': 'No file selected'}), 400
            
            if not allowed_file(file.filename):
                return jsonify({'error': 'Invalid file type'}), 400
            
            filename = secure_filename(f"{datetime.utcnow().timestamp()}_{file.filename}")
            filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
            file.save(filepath)
            capsule.media_url = f'/uploads/{filename}'
            
        elif media_type == 'text':
            media_data = request.form.get('media_data')
            if not media_data:
                return jsonify({'error': 'No text content provided'}), 400
            capsule.media_data = media_data
        else:
            return jsonify({'error': 'Invalid media type'}), 400
        
        db.session.add(capsule)
        db.session.commit()
        
        print(f"DEBUG: Capsule created successfully with ID {capsule.id}")
        
        return jsonify({
            'message': 'Capsule created successfully',
            'capsule': capsule.to_dict()
        }), 201
        
    except ValueError as e:
        print(f"DEBUG: ValueError - {e}")
        return jsonify({'error': f'Invalid data: {str(e)}'}), 400
    except Exception as e:
        print(f"DEBUG: Exception - {e}")
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@capsule_bp.route('/nearby', methods=['POST'])
@jwt_required()
def get_nearby_capsules():
    """Get capsules within 1km radius"""
    data = request.get_json()
    
    try:
        print(f"DEBUG: Nearby request - data: {data}")
        
        user_lat = float(data.get('latitude'))
        user_lon = float(data.get('longitude'))
        radius_km = 1  # 1km radius
        
        print(f"DEBUG: User location - lat:{user_lat}, lng:{user_lon}")
        
        if not user_lat or not user_lon:
            return jsonify({'error': 'Missing latitude or longitude'}), 400
        
        # Get all capsules
        all_capsules = Capsule.query.all()
        nearby_capsules = []
        
        for capsule in all_capsules:
            distance = capsule.calculate_distance(user_lat, user_lon)
            distance_km = distance / 1000
            
            if distance_km <= radius_km:
                capsule_dict = capsule.to_dict(include_content=False)
                capsule_dict['distance_km'] = round(distance_km, 3)
                nearby_capsules.append(capsule_dict)
        
        # Sort by distance
        nearby_capsules.sort(key=lambda x: x['distance_km'])
        
        print(f"DEBUG: Found {len(nearby_capsules)} nearby capsules")
        
        return jsonify({
            'count': len(nearby_capsules),
            'capsules': nearby_capsules
        }), 200
        
    except ValueError as e:
        print(f"DEBUG: ValueError in nearby - {e}")
        return jsonify({'error': f'Invalid latitude or longitude: {str(e)}'}), 400
    except Exception as e:
        print(f"DEBUG: Exception in nearby - {e}")
        return jsonify({'error': str(e)}), 500

@capsule_bp.route('/<int:capsule_id>/view', methods=['POST'])
@jwt_required()
def view_capsule(capsule_id):
    """View capsule content if user is within 2 meters"""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    try:
        user_lat = float(data.get('latitude'))
        user_lon = float(data.get('longitude'))
        
        if not user_lat or not user_lon:
            return jsonify({'error': 'Missing latitude or longitude'}), 400
        
        capsule = Capsule.query.get(capsule_id)
        if not capsule:
            return jsonify({'error': 'Capsule not found'}), 404
        
        # Check distance (within 2 meters)
        distance = capsule.calculate_distance(user_lat, user_lon)
        if distance > 2:
            return jsonify({
                'error': f'You must be within 2 meters of the capsule. Current distance: {round(distance, 2)}m'
            }), 403
        
        # Record visit
        visit = Visit(
            capsule_id=capsule_id,
            visitor_id=user_id,
            visitor_latitude=user_lat,
            visitor_longitude=user_lon
        )
        capsule.is_open = True
        capsule.open_count += 1
        
        db.session.add(visit)
        db.session.commit()
        
        return jsonify({
            'message': 'Capsule opened successfully',
            'capsule': capsule.to_dict(include_content=True),
            'distance_m': round(distance, 2)
        }), 200
        
    except ValueError:
        return jsonify({'error': 'Invalid latitude or longitude'}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@capsule_bp.route('/my-capsules', methods=['GET'])
@jwt_required()
def get_my_capsules():
    """Get all capsules created by current user"""
    try:
        user_id = get_jwt_identity()
        print(f"DEBUG: Getting capsules for user {user_id}")
        
        capsules = Capsule.query.filter_by(owner_id=user_id).all()
        print(f"DEBUG: Found {len(capsules)} capsules for user")
        
        return jsonify({
            'count': len(capsules),
            'capsules': [c.to_dict() for c in capsules]
        }), 200
    except Exception as e:
        print(f"DEBUG: Exception in my-capsules - {e}")
        return jsonify({'error': str(e)}), 500

@capsule_bp.route('/<int:capsule_id>', methods=['GET'])
@jwt_required()
def get_capsule(capsule_id):
    """Get capsule details without full content"""
    capsule = Capsule.query.get(capsule_id)
    
    if not capsule:
        return jsonify({'error': 'Capsule not found'}), 404
    
    return jsonify(capsule.to_dict(include_content=False)), 200

@capsule_bp.route('/<int:capsule_id>/stats', methods=['GET'])
@jwt_required()
def get_capsule_stats(capsule_id):
    """Get capsule statistics and visitor info"""
    capsule = Capsule.query.get(capsule_id)
    
    if not capsule:
        return jsonify({'error': 'Capsule not found'}), 404
    
    visits = Visit.query.filter_by(capsule_id=capsule_id).all()
    
    return jsonify({
        'capsule_id': capsule_id,
        'total_views': capsule.open_count,
        'total_unique_visitors': len(set(v.visitor_id for v in visits)),
        'visits': [v.to_dict() for v in visits]
    }), 200
