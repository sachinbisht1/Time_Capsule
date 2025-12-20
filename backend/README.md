# TimeCapsule Backend

A Flask-based REST API backend for storing and discovering location-based memories.

## Setup

1. Create a virtual environment:
```bash
python -m venv venv
venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Configure environment:
```bash
copy .env.example .env
# Edit .env with your settings
```

4. Run the application:
```bash
python run.py
```

The API will be available at `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get current user profile

### Capsules
- `POST /api/capsules/create` - Create new memory capsule
- `POST /api/capsules/nearby` - Get capsules within 1km radius
- `POST /api/capsules/<id>/view` - View capsule (within 2m radius)
- `GET /api/capsules/my-capsules` - Get user's capsules
- `GET /api/capsules/<id>` - Get capsule details
- `GET /api/capsules/<id>/stats` - Get capsule statistics
