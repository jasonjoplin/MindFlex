from flask import Blueprint, request, jsonify
from app.services.game_service import (
    get_games, 
    get_game_by_id, 
    log_game_score, 
    get_user_game_history,
    get_game_analytics
)

bp = Blueprint('games', __name__, url_prefix='/api/games')

# Add a route without trailing slash to prevent redirects that break CORS
@bp.route('', methods=['GET', 'OPTIONS'])
def list_games_no_slash():
    """Get all available cognitive games (no trailing slash)."""
    if request.method == 'OPTIONS':
        # Handle OPTIONS request for CORS preflight
        return '', 200
    
    games = get_games()
    return jsonify({"status": "success", "games": games})

@bp.route('/', methods=['GET', 'OPTIONS'])
def list_games():
    """Get all available cognitive games."""
    if request.method == 'OPTIONS':
        # Handle OPTIONS request for CORS preflight
        return '', 200
        
    games = get_games()
    return jsonify({"status": "success", "games": games})

@bp.route('/<game_id>', methods=['GET'])
def get_game(game_id):
    """Get a specific game by ID."""
    game = get_game_by_id(game_id)
    if game:
        return jsonify({"status": "success", "game": game})
    return jsonify({"status": "error", "message": "Game not found"}), 404

@bp.route('/log-score', methods=['POST'])
def log_score():
    """Log a score for a completed game."""
    data = request.json
    try:
        result = log_game_score(
            patient_id=data.get('patient_id'),
            game_id=data.get('game_id'),
            score=data.get('score'),
            duration=data.get('duration'),
            difficulty=data.get('difficulty'),
            errors=data.get('errors', 0),
            metadata=data.get('metadata', {})
        )
        return jsonify({"status": "success", "result": result})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 400

@bp.route('/history/<patient_id>', methods=['GET'])
def game_history(patient_id):
    """Get game history for a specific patient."""
    history = get_user_game_history(patient_id)
    return jsonify({"status": "success", "history": history})

@bp.route('/analytics/<patient_id>', methods=['GET'])
def analytics(patient_id):
    """Get AI-powered analytics for a patient's game performance."""
    game_type = request.args.get('game_type')
    time_period = request.args.get('time_period', '30d')  # Default to last 30 days
    
    analytics = get_game_analytics(patient_id, game_type, time_period)
    return jsonify({"status": "success", "analytics": analytics}) 