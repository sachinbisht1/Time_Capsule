from flask import Blueprint

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')
capsule_bp = Blueprint('capsule', __name__, url_prefix='/api/capsules')

from . import auth, capsule
