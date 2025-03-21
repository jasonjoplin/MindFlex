import os
import json
from datetime import datetime, timedelta
import jwt

# Comment out Supabase for now
# from supabase import create_client, Client
# from dotenv import load_dotenv

# load_dotenv()
# supabase_url = os.environ.get('SUPABASE_URL')
# supabase_key = os.environ.get('SUPABASE_KEY')
# supabase: Client = create_client(supabase_url, supabase_key)

# Mock user database for development
MOCK_USERS = {
    "test@example.com": {
        "id": "user-123",
        "email": "test@example.com",
        "password": "password123",  # In a real app, this would be hashed
        "name": "Test User",
        "created_at": "2023-01-01T00:00:00Z"
    }
}

JWT_SECRET = os.environ.get('JWT_SECRET', 'dev-secret-key')

def register_user(email, password, name):
    """Register a new user."""
    # Check if user already exists
    if email in MOCK_USERS:
        return {"error": "User already exists"}
    
    # Create new user
    user_id = f"user-{len(MOCK_USERS) + 1}"
    MOCK_USERS[email] = {
        "id": user_id,
        "email": email,
        "password": password,  # In a real app, this would be hashed
        "name": name,
        "created_at": datetime.now().isoformat()
    }
    
    # Generate JWT token
    token = generate_jwt(user_id, email)
    
    return {
        "user": {
            "id": user_id,
            "email": email,
            "name": name
        },
        "token": token
    }

def login_user(email, password):
    """Authenticate a user."""
    # Check if user exists
    if email not in MOCK_USERS:
        return {"error": "Invalid credentials"}
    
    # Check password
    user = MOCK_USERS[email]
    if user["password"] != password:  # In a real app, this would use proper password verification
        return {"error": "Invalid credentials"}
    
    # Generate JWT token
    token = generate_jwt(user["id"], email)
    
    return {
        "user": {
            "id": user["id"],
            "email": user["email"],
            "name": user["name"]
        },
        "token": token
    }

def get_user_profile(user_id):
    """Get user profile by ID."""
    # Find user by ID
    for email, user in MOCK_USERS.items():
        if user["id"] == user_id:
            return {
                "id": user["id"],
                "email": user["email"],
                "name": user["name"],
                "created_at": user["created_at"]
            }
    
    return {"error": "User not found"}

def generate_jwt(user_id, email):
    """Generate a JWT token for authentication."""
    payload = {
        "user_id": user_id,
        "email": email,
        "exp": datetime.utcnow() + timedelta(days=1)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256") 