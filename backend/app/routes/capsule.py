from flask import request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from app import db
from app.models import Capsule, User, Visit
from . import capsule_bp
import os
from datetime import datetime
import traceback
import io
import base64
import json
from PIL import Image

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
            # Support multiple files (max 3). Use request.files.getlist('file')
            files = request.files.getlist('file')
            if not files:
                return jsonify({'error': 'No image provided'}), 400

            if len(files) > 3:
                return jsonify({'error': 'Maximum 3 images allowed'}), 400

            images_payload = []

            for file in files:
                if file.filename == '':
                    return jsonify({'error': 'One of the files has no filename'}), 400

                if not allowed_file(file.filename):
                    return jsonify({'error': f'Invalid file type: {file.filename}'}), 400

                # Read image and compress/resize until size <= 1MB
                try:
                    img = Image.open(file.stream)
                except Exception as e:
                    return jsonify({'error': f'Invalid image file {file.filename}: {str(e)}'}), 400

                # Normalize mode
                if img.mode in ("RGBA", "P"):
                    img = img.convert("RGB")

                # Target max bytes
                MAX_BYTES = 1 * 1024 * 1024  # 1 MB

                # Try saving with decreasing quality and optional resizing
                quality = 85
                width, height = img.size
                buf = io.BytesIO()
                img.save(buf, format='JPEG', quality=quality)
                data = buf.getvalue()

                # Reduce quality and size until under the limit
                while len(data) > MAX_BYTES and quality > 20:
                    quality -= 5
                    buf = io.BytesIO()
                    img.save(buf, format='JPEG', quality=quality)
                    data = buf.getvalue()

                # If still too large, downscale dimensions iteratively
                while len(data) > MAX_BYTES and (width > 200 or height > 200):
                    width = int(width * 0.9)
                    height = int(height * 0.9)
                    resized = img.resize((width, height), Image.LANCZOS)
                    buf = io.BytesIO()
                    resized.save(buf, format='JPEG', quality=max(quality, 30))
                    data = buf.getvalue()

                if len(data) > MAX_BYTES:
                    return jsonify({'error': f'Could not compress image {file.filename} under 1MB'}), 400

                # Store image bytes as base64 inside media_data JSON along with mimetype
                b64 = base64.b64encode(data).decode('ascii')
                mime = 'image/jpeg'
                images_payload.append({'mimetype': mime, 'b64': b64})

            # Store list of images as JSON
            capsule.media_data = json.dumps(images_payload)
            capsule.media_url = None
            
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
    """View capsule content if user is within 50 meters"""
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
        
        # Check distance (within 50 meters)
        distance = capsule.calculate_distance(user_lat, user_lon)
        if distance > 50:
            return jsonify({
                'error': f'You must be within 50 meters of the capsule. Current distance: {round(distance, 2)}m'
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


@capsule_bp.route('/<int:capsule_id>', methods=['DELETE'])
@jwt_required()
def delete_capsule(capsule_id):
    """Delete a capsule (only creator can delete)"""
    user_id = int(get_jwt_identity())
    print(f"DEBUG: Delete capsule request - capsule_id={capsule_id}, user_id={user_id}")
    
    try:
        capsule = Capsule.query.get(capsule_id)
        if not capsule:
            print(f"DEBUG: Capsule {capsule_id} not found")
            return jsonify({'error': 'Capsule not found'}), 404
        
        # Check ownership (CRITICAL: string comparison)
        if str(capsule.owner_id) != str(user_id):
            print(f"DEBUG: User {user_id} tried to delete capsule owned by {capsule.owner_id}")
            return jsonify({'error': 'Cannot delete capsules created by other users'}), 403
        
        # Clear stored image data in DB (if any)
        try:
            capsule.media_data = None
            capsule.media_url = None
            db.session.commit()
            print(f"DEBUG: Cleared image data for capsule {capsule_id}")
        except Exception:
            db.session.rollback()
        
        # Delete all visits for this capsule
        Visit.query.filter_by(capsule_id=capsule_id).delete()
        print(f"DEBUG: Deleted all visits for capsule {capsule_id}")
        
        # Delete capsule itself
        db.session.delete(capsule)
        db.session.commit()
        
        print(f"DEBUG: Capsule {capsule_id} deleted successfully by user {user_id}")
        return jsonify({'message': 'Capsule deleted successfully'}), 200
        
    except Exception as e:
        print(f"DEBUG: Exception in delete_capsule - {e}")
        db.session.rollback()
        return jsonify({'error': str(e)}), 500



@capsule_bp.route('/<int:capsule_id>/image', methods=['GET'])
@capsule_bp.route('/<int:capsule_id>/image/<int:index>', methods=['GET'])
@jwt_required()
def get_capsule_image(capsule_id, index: int = 0):
    """Return the raw image bytes for a capsule stored in the DB."""
    try:
        capsule = Capsule.query.get(capsule_id)
        if not capsule:
            return jsonify({'error': 'Capsule not found'}), 404

        if capsule.media_type != 'image' or not capsule.media_data:
            return jsonify({'error': 'No image stored for this capsule'}), 404

        # media_data stored as JSON with mimetype and base64
        try:
            payload = json.loads(capsule.media_data)
            # payload may be a list (multiple images) or single dict
            if isinstance(payload, list):
                if index < 0 or index >= len(payload):
                    return jsonify({'error': 'Image index out of range'}), 404
                item = payload[index]
            elif isinstance(payload, dict):
                item = payload
            else:
                return jsonify({'error': 'Invalid image data stored'}), 500

            b64 = item.get('b64')
            mimetype = item.get('mimetype', 'image/jpeg')
            img_bytes = base64.b64decode(b64)
        except Exception as e:
            return jsonify({'error': f'Invalid image data: {str(e)}'}), 500

        from flask import Response
        return Response(img_bytes, mimetype=mimetype)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
