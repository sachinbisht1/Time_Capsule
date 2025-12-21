from flask import Flask, request
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_jwt_extended import JWTManager
import os
from dotenv import load_dotenv
import logging

load_dotenv()

db = SQLAlchemy()
jwt = JWTManager()

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def create_app():
    app = Flask(__name__)
    
    # Configuration
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///timecapsule.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key')
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'jwt-secret-key')
    app.config['UPLOAD_FOLDER'] = os.getenv('UPLOAD_FOLDER', 'uploads')
    app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
    
    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)
    CORS(app)
    
    # JWT error handlers
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_data):
        logger.error("❌ JWT TOKEN EXPIRED")
        return {'error': 'JWT token has expired'}, 401
    
    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        logger.error(f"❌ INVALID JWT TOKEN: {error}")
        return {'error': f'Invalid JWT token: {error}'}, 401
    
    @jwt.unauthorized_loader
    def missing_token_callback(error):
        logger.error(f"❌ MISSING JWT TOKEN: {error}")
        logger.error("   This means Authorization header with 'Bearer <token>' was not sent")
        return {'error': f'Missing JWT token: {error}'}, 401
    
    # Create upload folder if it doesn't exist
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    
    # Log all incoming requests
    @app.before_request
    def log_request():
        logger.info(f"📨 INCOMING REQUEST: {request.method} {request.path}")
        logger.info(f"   Headers: {dict(request.headers)}")
        if request.method in ['POST', 'PUT', 'PATCH']:
            logger.info(f"   Content-Type: {request.content_type}")
            if request.is_json:
                logger.info(f"   JSON: {request.get_json()}")
            elif request.form:
                logger.info(f"   Form: {dict(request.form)}")
    
    # Register blueprints
    from app.routes import auth_bp, capsule_bp
    app.register_blueprint(auth_bp)
    app.register_blueprint(capsule_bp)
    
    # Serve uploaded files
    @app.route('/uploads/<filename>')
    def serve_upload(filename):
        """Serve uploaded image files"""
        from flask import send_from_directory
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        
        # Security: Only serve files from uploads folder
        if not os.path.exists(filepath):
            logger.warning(f"❌ File not found: {filepath}")
            return {'error': 'File not found'}, 404
        
        logger.info(f"📁 Serving file: {filename}")
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)
    
    # Create tables
    with app.app_context():
        db.create_all()
    
    # Error handlers
    @app.errorhandler(422)
    def handle_unprocessable(e):
        logger.error(f"❌ 422 ERROR: {e}")
        logger.error(f"   Description: {e.description}")
        return {'error': str(e.description)}, 422
    
    @app.errorhandler(401)
    def handle_unauthorized(e):
        logger.error(f"❌ 401 UNAUTHORIZED: {e}")
        logger.error("   This means JWT token is missing or invalid")
        return {'error': 'Unauthorized - JWT token required or invalid'}, 401
    
    @app.errorhandler(500)
    def handle_server_error(e):
        logger.error(f"❌ 500 SERVER ERROR: {e}")
        import traceback
        logger.error(traceback.format_exc())
        return {'error': 'Internal server error'}, 500
    
    return app
