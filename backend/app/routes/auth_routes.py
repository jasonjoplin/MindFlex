from flask import Blueprint, request, jsonify
from app.services.auth_service import register_user, login_user, get_user_profile

bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@bp.route('/register', methods=['POST'])
def register():
    """Register a new user (patient or caregiver)."""
    data = request.json
    try:
        user = register_user(
            email=data.get('email'),
            password=data.get('password'),
            name=data.get('name'),
            user_type=data.get('user_type', 'patient')  # 'patient' or 'caregiver'
        )
        return jsonify({"status": "success", "user": user}), 201
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 400

@bp.route('/login', methods=['POST'])
def login():
    """Login a user with email and password."""
    data = request.json
    try:
        user = login_user(
            email=data.get('email'),
            password=data.get('password')
        )
        return jsonify({"status": "success", "user": user})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 401

@bp.route('/profile', methods=['GET'])
def profile():
    """Get the profile of the authenticated user."""
    # Extract token from Authorization header
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({"status": "error", "message": "No valid token provided"}), 401
    
    token = auth_header.split(' ')[1]
    try:
        user = get_user_profile(token)
        return jsonify({"status": "success", "user": user})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 401 