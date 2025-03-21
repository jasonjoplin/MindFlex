from flask import Blueprint, request, jsonify
from app.services.therapy_service import (
    get_sound_categories,
    get_sounds_by_category,
    get_sound_by_id,
    get_recommended_sounds,
    log_sound_session
)

bp = Blueprint('therapy', __name__, url_prefix='/api/therapy')

@bp.route('/categories', methods=['GET'])
def categories():
    """Get all sound therapy categories."""
    categories = get_sound_categories()
    return jsonify({"status": "success", "categories": categories})

@bp.route('/sounds/<category_id>', methods=['GET'])
def sounds_by_category(category_id):
    """Get sounds by category."""
    sounds = get_sounds_by_category(category_id)
    return jsonify({"status": "success", "sounds": sounds})

@bp.route('/sound/<sound_id>', methods=['GET'])
def sound_detail(sound_id):
    """Get details for a specific sound."""
    sound = get_sound_by_id(sound_id)
    if sound:
        return jsonify({"status": "success", "sound": sound})
    return jsonify({"status": "error", "message": "Sound not found"}), 404

@bp.route('/recommendations', methods=['GET'])
def recommendations():
    """Get AI-recommended sounds based on user profile or mood."""
    user_id = request.args.get('user_id')
    mood = request.args.get('mood')  # Optional mood parameter
    
    sounds = get_recommended_sounds(user_id, mood)
    return jsonify({"status": "success", "recommendations": sounds})

@bp.route('/log-session', methods=['POST'])
def log_session():
    """Log a completed sound therapy session."""
    data = request.json
    try:
        result = log_sound_session(
            user_id=data.get('user_id'),
            sound_id=data.get('sound_id'),
            duration=data.get('duration'),
            mood_before=data.get('mood_before'),
            mood_after=data.get('mood_after'),
            notes=data.get('notes', '')
        )
        return jsonify({"status": "success", "result": result})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 400 