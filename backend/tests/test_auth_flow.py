import pytest

from app import create_app, db
from app.models import User


@pytest.fixture
def client():
    app = create_app()
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'

    with app.app_context():
        db.drop_all()
        db.create_all()

    with app.test_client() as client:
        yield client

    with app.app_context():
        db.drop_all()


def test_unverified_user_cannot_login_and_can_verify_email(client):
    register = client.post('/api/auth/register', json={
        'username': 'alice',
        'email': 'alice@example.com',
        'password': 'secret123'
    })
    assert register.status_code == 201
    data = register.get_json()
    assert data['message'] == 'User registered successfully. Please verify your email.'

    login_before_verify = client.post('/api/auth/login', json={
        'username': 'alice',
        'password': 'secret123'
    })
    assert login_before_verify.status_code == 403

    user = User.query.filter_by(email='alice@example.com').first()
    assert user.is_verified is False
    assert user.email_verification_token

    verify = client.get(f"/api/auth/verify-email/{user.email_verification_token}")
    assert verify.status_code == 200
    user = User.query.filter_by(email='alice@example.com').first()
    assert user.is_verified is True

    login_after_verify = client.post('/api/auth/login', json={
        'username': 'alice',
        'password': 'secret123'
    })
    assert login_after_verify.status_code == 200
    assert 'access_token' in login_after_verify.get_json()


def test_forgot_password_flow(client):
    client.post('/api/auth/register', json={
        'username': 'bob',
        'email': 'bob@example.com',
        'password': 'secret123'
    })

    user = User.query.filter_by(email='bob@example.com').first()
    assert user.is_verified is False
    verify = client.get(f"/api/auth/verify-email/{user.email_verification_token}")
    assert verify.status_code == 200

    forgot = client.post('/api/auth/forgot-password', json={'email': 'bob@example.com'})
    assert forgot.status_code == 200
    reset_token = User.query.filter_by(email='bob@example.com').first().password_reset_token
    assert reset_token

    reset = client.post('/api/auth/reset-password', json={
        'token': reset_token,
        'password': 'newsecret456'
    })
    assert reset.status_code == 200

    login = client.post('/api/auth/login', json={
        'username': 'bob',
        'password': 'newsecret456'
    })
    assert login.status_code == 200
