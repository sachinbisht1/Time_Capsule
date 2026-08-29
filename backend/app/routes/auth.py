import secrets

from flask import request, jsonify, current_app
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    jwt_required,
    get_jwt_identity
)
from app import db
from app.models import User
from . import auth_bp
import logging

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.DEBUG)


def _generate_token():
    return secrets.token_urlsafe(32)


def _send_verification_email(user):
    frontend_url = current_app.config.get('FRONTEND_URL', 'http://localhost:3000')
    link = f"{frontend_url}/verify-email/{user.email_verification_token}"
    body = (
        f"Hello {user.username},\n\n"
        f"Thanks for creating a Time Capsule account. Please verify your email by visiting:\n{link}\n\n"
        "If you did not create this account, you can safely ignore this email."
    )
    html = (
        f"<p>Hello {user.username},</p>"
        f"<p>Thanks for creating a Time Capsule account.</p>"
        f"<p><a href=\"{link}\">Verify your email</a></p>"
        "<p>If you did not create this account, you can safely ignore this email.</p>"
    )
    return current_app.send_email('Verify your Time Capsule email', [user.email], body, html)


def _send_password_reset_email(user):
    frontend_url = current_app.config.get('FRONTEND_URL', 'http://localhost:3000')
    link = f"{frontend_url}/reset-password/{user.password_reset_token}"
    body = (
        f"Hello {user.username},\n\n"
        f"We received a request to reset your Time Capsule password. Use the link below:\n{link}\n\n"
        "If you did not request this, you can ignore this email."
    )
    html = (
        f"<p>Hello {user.username},</p>"
        "<p>We received a request to reset your Time Capsule password.</p>"
        f"<p><a href=\"{link}\">Reset your password</a></p>"
        "<p>If you did not request this, you can ignore this email.</p>"
    )
    return current_app.send_email('Reset your Time Capsule password', [user.email], body, html)


@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    logger.info(f"REGISTER REQUEST: {data}")

    if not data or not data.get('username') or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Missing required fields'}), 400

    if User.query.filter_by(username=data['username']).first():
        return jsonify({'error': 'Username already exists'}), 409

    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already exists'}), 409

    user = User(
        username=data['username'],
        email=data['email'],
        is_verified=False,
        email_verification_token=_generate_token()
    )
    user.set_password(data['password'])

    db.session.add(user)
    db.session.commit()

    logger.info(f"USER REGISTERED: ID={user.id}, awaiting email verification")
    _send_verification_email(user)
    return jsonify({
        'message': 'User registered successfully. Please verify your email.',
        'user': user.to_dict(),
        'verification_token': user.email_verification_token,
    }), 201


@auth_bp.route('/verify-email/<token>', methods=['GET'])
def verify_email(token):
    user = User.query.filter_by(email_verification_token=token).first()

    if not user:
        return jsonify({'error': 'Invalid or expired verification token'}), 400

    user.is_verified = True
    user.email_verification_token = None
    db.session.commit()

    return jsonify({
        'message': 'Email verified successfully',
        'user': user.to_dict(),
    }), 200


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    logger.info(f"LOGIN REQUEST: username={data.get('username') if data else None}")

    if not data or not data.get('username') or not data.get('password'):
        return jsonify({'error': 'Missing username or password'}), 400

    user = User.query.filter_by(username=data['username']).first()

    if not user or not user.check_password(data['password']):
        logger.warning(f"LOGIN FAILED: Invalid credentials for {data.get('username')}")
        return jsonify({'error': 'Invalid username or password'}), 401

    if not user.is_verified:
        logger.warning(f"LOGIN BLOCKED: Unverified email for user_id={user.id}")
        return jsonify({
            'error': 'Email not verified. Please verify your email before logging in.',
            'verification_token': user.email_verification_token,
        }), 403

    access_token = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))
    logger.info(f"LOGIN SUCCESS: user_id={user.id}, token generated")
    return jsonify({
        'message': 'Login successful',
        'user': user.to_dict(),
        'access_token': access_token,
        'refresh_token': refresh_token
    }), 200


@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    data = request.get_json() or {}
    email = (data.get('email') or '').strip().lower()

    if not email:
        return jsonify({'error': 'Email is required'}), 400

    user = User.query.filter_by(email=email).first()
    if user:
        user.password_reset_token = _generate_token()
        db.session.commit()
        _send_password_reset_email(user)

    return jsonify({
        'message': 'If an account exists for that email, a password reset link has been sent.',
        'reset_token': user.password_reset_token if user else None,
    }), 200


@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    data = request.get_json() or {}
    token = data.get('token')
    password = data.get('password')

    if not token or not password:
        return jsonify({'error': 'Reset token and new password are required'}), 400

    user = User.query.filter_by(password_reset_token=token).first()
    if not user:
        return jsonify({'error': 'Invalid or expired reset token'}), 400

    user.set_password(password)
    user.password_reset_token = None
    db.session.commit()

    return jsonify({
        'message': 'Password reset successfully',
        'user': user.to_dict(),
    }), 200


@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    """Use a valid refresh token to get a new access token."""
    user_id = get_jwt_identity()
    new_access = create_access_token(identity=str(user_id))
    logging.info(f"REFRESH SUCCESS for user {user_id}")
    return jsonify({'access_token': new_access}), 200


@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user:
        return jsonify({'error': 'User not found'}), 404

    return jsonify(user.to_dict()), 200
