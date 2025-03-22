from flask import Blueprint, request, jsonify, Response
from app.services.auth_service import register_user, login_user, get_user_profile
import os
import requests

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

# Add Supabase Auth Proxy routes
@bp.route('/v1/token', methods=['POST', 'OPTIONS'])
def supabase_token_proxy():
    """Proxy for Supabase authentication token requests."""
    if request.method == 'OPTIONS':
        return '', 200
    
    # Get Supabase credentials from env
    supabase_url = os.environ.get('SUPABASE_URL')
    supabase_key = os.environ.get('SUPABASE_KEY')
    
    if not supabase_url or not supabase_key:
        return jsonify({"error": "Supabase credentials not configured on server"}), 500
    
    # Forward the request to Supabase
    if request.query_string:
        supabase_endpoint = f"{supabase_url}/auth/v1/token?{request.query_string.decode('utf-8')}"
    else:
        supabase_endpoint = f"{supabase_url}/auth/v1/token"
    
    # Forward all headers and the body
    headers = {
        'apikey': supabase_key,
        'Content-Type': 'application/json'
    }
    
    # Copy relevant headers from original request
    for header in ['Authorization', 'x-client-info', 'x-supabase-api-version']:
        if header in request.headers:
            headers[header] = request.headers[header]
    
    try:
        response = requests.post(
            supabase_endpoint,
            headers=headers,
            json=request.json
        )
        
        # Return the response from Supabase
        return Response(
            response.content,
            status=response.status_code,
            content_type=response.headers.get('Content-Type', 'application/json')
        )
    except Exception as e:
        return jsonify({"error": f"Failed to proxy request: {str(e)}"}), 500

# Generic Supabase Auth Proxy to handle all auth endpoints
@bp.route('/v1/<path:subpath>', methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'])
def supabase_auth_proxy(subpath):
    """Generic proxy for all Supabase auth requests."""
    if request.method == 'OPTIONS':
        return '', 200
    
    # Get Supabase credentials from env
    supabase_url = os.environ.get('SUPABASE_URL')
    supabase_key = os.environ.get('SUPABASE_KEY')
    
    if not supabase_url or not supabase_key:
        return jsonify({"error": "Supabase credentials not configured on server"}), 500
    
    # Forward the request to Supabase
    if request.query_string:
        supabase_endpoint = f"{supabase_url}/auth/v1/{subpath}?{request.query_string.decode('utf-8')}"
    else:
        supabase_endpoint = f"{supabase_url}/auth/v1/{subpath}"
    
    # Forward all headers and the body
    headers = {
        'apikey': supabase_key,
        'Content-Type': 'application/json'
    }
    
    # Copy relevant headers from original request
    for header in ['Authorization', 'x-client-info', 'x-supabase-api-version', 'accept-profile']:
        if header in request.headers:
            headers[header] = request.headers[header]
    
    try:
        # Use the appropriate HTTP method
        if request.method == 'GET':
            response = requests.get(
                supabase_endpoint,
                headers=headers
            )
        elif request.method == 'POST':
            response = requests.post(
                supabase_endpoint,
                headers=headers,
                json=request.json if request.is_json else None
            )
        elif request.method == 'PUT':
            response = requests.put(
                supabase_endpoint,
                headers=headers,
                json=request.json if request.is_json else None
            )
        elif request.method == 'DELETE':
            response = requests.delete(
                supabase_endpoint,
                headers=headers
            )
        else:
            return jsonify({"error": f"Unsupported method: {request.method}"}), 405
        
        # Return the response from Supabase
        return Response(
            response.content,
            status=response.status_code,
            content_type=response.headers.get('Content-Type', 'application/json')
        )
    except Exception as e:
        return jsonify({"error": f"Failed to proxy request: {str(e)}"}), 500 