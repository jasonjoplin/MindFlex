from flask import Blueprint, request, jsonify, Response
import os
import requests

bp = Blueprint('supabase_proxy', __name__, url_prefix='/api/rest')

@bp.route('/v1/<path:subpath>', methods=['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'])
def supabase_rest_proxy(subpath):
    """Proxy for Supabase REST API requests."""
    if request.method == 'OPTIONS':
        return '', 200
    
    print(f"[DEBUG] REST proxy: {request.method} {subpath}")
    print(f"[DEBUG] Query string: {request.query_string}")
    
    # Get Supabase credentials from env
    supabase_url = os.environ.get('SUPABASE_URL')
    supabase_key = os.environ.get('SUPABASE_KEY')
    
    print(f"[DEBUG] SUPABASE_URL configured: {bool(supabase_url)}")
    print(f"[DEBUG] SUPABASE_KEY configured: {bool(supabase_key)}")
    
    if not supabase_url or not supabase_key:
        return jsonify({
            "error": "Supabase credentials not configured on server",
            "details": "Please set SUPABASE_URL and SUPABASE_KEY environment variables"
        }), 500
    
    # Forward the request to Supabase
    if request.query_string:
        supabase_endpoint = f"{supabase_url}/rest/v1/{subpath}?{request.query_string.decode('utf-8')}"
    else:
        supabase_endpoint = f"{supabase_url}/rest/v1/{subpath}"
    
    print(f"[DEBUG] Forwarding to: {supabase_endpoint}")
    
    # Forward all headers and the body
    headers = {
        'apikey': supabase_key,
        'Authorization': f'Bearer {supabase_key}',
        'Content-Type': 'application/json'
    }
    
    # Copy relevant headers from original request
    for header in ['x-client-info', 'x-supabase-api-version', 'accept-profile']:
        if header in request.headers:
            headers[header] = request.headers[header]
            print(f"[DEBUG] Forwarding header: {header}")
    
    # If the user is authenticated, pass their token instead of the anon key
    auth_header = request.headers.get('Authorization')
    if auth_header and auth_header.startswith('Bearer '):
        headers['Authorization'] = auth_header
        print(f"[DEBUG] Using user's Authorization token")
    
    try:
        # Use the appropriate HTTP method
        if request.method == 'GET':
            print(f"[DEBUG] Sending GET request")
            response = requests.get(
                supabase_endpoint,
                headers=headers
            )
        elif request.method == 'POST':
            print(f"[DEBUG] Sending POST request with data: {request.get_json(silent=True)}")
            response = requests.post(
                supabase_endpoint,
                headers=headers,
                json=request.get_json(silent=True)
            )
        elif request.method == 'PUT':
            print(f"[DEBUG] Sending PUT request")
            response = requests.put(
                supabase_endpoint,
                headers=headers,
                json=request.get_json(silent=True)
            )
        elif request.method == 'PATCH':
            print(f"[DEBUG] Sending PATCH request")
            response = requests.patch(
                supabase_endpoint,
                headers=headers,
                json=request.get_json(silent=True)
            )
        elif request.method == 'DELETE':
            print(f"[DEBUG] Sending DELETE request")
            response = requests.delete(
                supabase_endpoint,
                headers=headers
            )
        else:
            return jsonify({"error": f"Unsupported method: {request.method}"}), 405
        
        print(f"[DEBUG] Supabase response status: {response.status_code}")
        print(f"[DEBUG] Supabase response: {response.text[:200]}...")
        
        # Return the response from Supabase
        return Response(
            response.content,
            status=response.status_code,
            content_type=response.headers.get('Content-Type', 'application/json')
        )
    except Exception as e:
        print(f"[ERROR] Proxy request failed: {str(e)}")
        return jsonify({"error": f"Failed to proxy request: {str(e)}"}), 500 