import logging
from flask import request
from functools import wraps

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger('TimeCapsule')


def log_request(f):
    """Decorator to log all request details"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        logger.info(f"🔹 {request.method} {request.path}")
        logger.info(f"   Headers: Authorization={request.headers.get('Authorization', 'MISSING')[:50]}...")
        logger.info(f"   Content-Type: {request.content_type}")
        
        if request.method == 'POST':
            if request.content_type and 'json' in request.content_type:
                logger.info(f"   Body: {request.get_json()}")
            elif request.content_type and 'form' in request.content_type:
                logger.info(f"   Form fields: {list(request.form.keys())}")
                logger.info(f"   Files: {list(request.files.keys())}")
        
        return f(*args, **kwargs)
    return decorated_function
