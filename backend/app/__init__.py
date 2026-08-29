from flask import Flask, request, current_app
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_mail import Mail, Message
import os
import requests
from dotenv import load_dotenv
import logging
from datetime import timedelta, datetime
import threading
import time

load_dotenv()

db = SQLAlchemy()
jwt = JWTManager()
mail = Mail()

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
    app.config['MAIL_SERVER'] = os.getenv('MAIL_SERVER', '')
    app.config['MAIL_PORT'] = int(os.getenv('MAIL_PORT', 587))
    app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME', '')
    app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD', '')
    app.config['MAIL_USE_TLS'] = os.getenv('MAIL_USE_TLS', 'true').lower() == 'true'
    app.config['MAIL_USE_SSL'] = os.getenv('MAIL_USE_SSL', 'false').lower() == 'true'
    app.config['MAIL_DEFAULT_SENDER'] = os.getenv('MAIL_DEFAULT_SENDER', 'noreply@timecapsule.local')
    app.config['RESEND_API_KEY'] = os.getenv('RESEND_API_KEY', '')
    app.config['RESEND_FROM_EMAIL'] = os.getenv('RESEND_FROM_EMAIL', app.config['MAIL_DEFAULT_SENDER'])
    app.config['FRONTEND_URL'] = os.getenv('FRONTEND_URL', 'http://localhost:3000')
    # JWT token expiration strategy
    # Access tokens are short-lived; refresh tokens are long-lived and used to obtain new access tokens.
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=int(os.getenv('JWT_ACCESS_EXPIRES_HOURS', 6)))
    app.config['JWT_REFRESH_TOKEN_EXPIRES'] = timedelta(days=int(os.getenv('JWT_REFRESH_EXPIRES_DAYS', 30)))
    app.config['UPLOAD_FOLDER'] = os.getenv('UPLOAD_FOLDER', 'uploads')
    app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
    # Data retention: delete capsules older than this (days)
    app.config['DATA_RETENTION_DAYS'] = int(os.getenv('DATA_RETENTION_DAYS', 1))
    # How often (in seconds) the cleanup task runs
    app.config['CLEANUP_INTERVAL_SECONDS'] = int(os.getenv('CLEANUP_INTERVAL_SECONDS', 3600))
    
    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)
    mail.init_app(app)
    CORS(app)

    def send_email(subject, recipients, body, html_body=None):
        if app.config.get('RESEND_API_KEY'):
            try:
                response = requests.post(
                    'https://api.resend.com/emails',
                    headers={
                        'Authorization': f"Bearer {app.config['RESEND_API_KEY']}",
                        'Content-Type': 'application/json',
                    },
                    json={
                        'from': app.config.get('RESEND_FROM_EMAIL', app.config.get('MAIL_DEFAULT_SENDER', 'noreply@timecapsule.local')),
                        'to': recipients,
                        'subject': subject,
                        'html': html_body or body.replace('\n', '<br>'),
                        'text': body,
                    },
                    timeout=20,
                )
                response.raise_for_status()
                logger.info('📧 Email sent via Resend for %s', recipients)
                return True
            except Exception as exc:
                logger.warning('⚠️ Resend email failed: %s', exc)

        if app.config.get('MAIL_SERVER') and app.config.get('MAIL_USERNAME'):
            try:
                with app.app_context():
                    message = Message(subject=subject, sender=app.config.get('MAIL_DEFAULT_SENDER'), recipients=recipients)
                    message.body = body
                    if html_body:
                        message.html = html_body
                    mail.send(message)
                logger.info('📧 Email sent via SMTP for %s', recipients)
                return True
            except Exception as exc:
                logger.warning('⚠️ SMTP email failed: %s', exc)

        logger.warning('📧 No mail service configured. Printing email content to console instead.')
        logger.info('Email subject: %s', subject)
        logger.info('Recipients: %s', recipients)
        logger.info('Email body:\n%s', body)
        return False

    app.send_email = send_email
    
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

    @app.route('/')
    def health_check():
        return {'status': 'ok', 'service': 'Time Capsule API'}
    
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

    def _cleanup_worker(app):
        """Background worker that deletes capsules older than the retention period."""
        # Import models inside worker to avoid circular imports at module import time
        from app.models import Capsule, Visit

        while True:
            try:
                with app.app_context():
                    retention_days = app.config.get('DATA_RETENTION_DAYS', 1)
                    cutoff = datetime.utcnow() - timedelta(days=retention_days)

                    # Find IDs of capsules to remove
                    old_capsules = Capsule.query.filter(Capsule.created_at < cutoff).all()
                    if old_capsules:
                        ids = [c.id for c in old_capsules]
                        # Delete associated visits first (bulk delete)
                        Visit.query.filter(Visit.capsule_id.in_(ids)).delete(synchronize_session=False)
                        # Delete capsules
                        Capsule.query.filter(Capsule.id.in_(ids)).delete(synchronize_session=False)
                        db.session.commit()
                        logger.info(f"🧹 CLEANUP: Deleted {len(ids)} capsules older than {retention_days} days")
            except Exception as e:
                logger.error(f"Cleanup worker error: {e}")
                try:
                    db.session.rollback()
                except Exception:
                    pass

            # Sleep until next run
            interval = app.config.get('CLEANUP_INTERVAL_SECONDS', 3600)
            time.sleep(interval)

    # Start cleanup background thread
    cleanup_thread = threading.Thread(target=_cleanup_worker, args=(app,), daemon=True)
    cleanup_thread.start()
    
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
