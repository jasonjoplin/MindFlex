import os
from flask import Flask, jsonify, request, make_response
from flask_cors import CORS
from dotenv import load_dotenv
import json

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)

# Configure CORS with proper handling of OPTIONS requests
cors_origins = os.environ.get('CORS_ORIGINS', 'http://localhost:3000').split(',')
CORS(app, 
     resources={r"/api/*": {"origins": cors_origins}}, 
     supports_credentials=True,
     allow_headers=["Content-Type", "Authorization", "apikey", "x-client-info", "x-supabase-api-version", "accept-profile"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])

# Handle OPTIONS requests to prevent redirects that break CORS
@app.before_request
def handle_options_request():
    if request.method == 'OPTIONS':
        response = make_response()
        response.headers.add('Access-Control-Allow-Origin', request.headers.get('Origin', '*'))
        response.headers.add('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type, Authorization, apikey, x-client-info, x-supabase-api-version, accept-profile')
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response

# Import routes after app initialization to avoid circular imports
from app.routes import auth_routes, game_routes, therapy_routes, caregiver_routes, llm_routes

# Register blueprints
app.register_blueprint(auth_routes.bp)
app.register_blueprint(game_routes.bp)
app.register_blueprint(therapy_routes.bp)
app.register_blueprint(caregiver_routes.bp)
app.register_blueprint(llm_routes.bp)

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint to verify API is running."""
    return jsonify({
        "status": "healthy",
        "version": "1.0.0"
    })

@app.errorhandler(404)
def not_found(e):
    return jsonify({"error": "Resource not found"}), 404

@app.errorhandler(500)
def server_error(e):
    return jsonify({"error": "Internal server error"}), 500

if __name__ == '__main__':
    # Get port from environment variable or use 5000 as default
    port = int(os.environ.get('PORT', 5000))
    
    # Enable debug mode in development
    debug = os.environ.get('FLASK_ENV') == 'development'
    
    # Run the app on all network interfaces
    app.run(
        host='0.0.0.0',  # Listen on all available interfaces
        port=port,
        debug=debug,
        use_reloader=debug  # Only use reloader in debug mode
    ) 