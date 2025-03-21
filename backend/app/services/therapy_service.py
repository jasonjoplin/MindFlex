import os
import json
from datetime import datetime, timedelta
import random

# Mock sound therapy categories
MOCK_CATEGORIES = [
    {
        "id": "cat-1",
        "name": "Nature Sounds",
        "description": "Calming sounds from nature to reduce stress and anxiety",
        "thumbnail": "/assets/therapy/nature-category.jpg"
    },
    {
        "id": "cat-2",
        "name": "Binaural Beats",
        "description": "Specialized audio tracks that can help with focus and relaxation",
        "thumbnail": "/assets/therapy/binaural-category.jpg"
    },
    {
        "id": "cat-3",
        "name": "432Hz Music",
        "description": "Music tuned to 432Hz frequency, believed to be harmonically aligned with nature",
        "thumbnail": "/assets/therapy/432hz-category.jpg"
    }
]

# Mock sounds
MOCK_SOUNDS = [
    # Nature Sounds
    {
        "id": "sound-1",
        "category_id": "cat-1",
        "name": "Ocean Waves",
        "description": "Gentle ocean waves breaking on the shore",
        "duration": 600,  # 10 minutes
        "file_url": "/assets/therapy/sounds/ocean-waves.mp3",
        "thumbnail": "/assets/therapy/thumbnails/ocean-waves.jpg",
        "tags": ["relaxation", "sleep", "stress-relief"]
    },
    {
        "id": "sound-2",
        "category_id": "cat-1",
        "name": "Forest Ambience",
        "description": "Peaceful forest sounds with birds and gentle breeze",
        "duration": 900,  # 15 minutes
        "file_url": "/assets/therapy/sounds/forest-ambience.mp3",
        "thumbnail": "/assets/therapy/thumbnails/forest.jpg",
        "tags": ["relaxation", "focus", "nature"]
    },
    {
        "id": "sound-3",
        "category_id": "cat-1",
        "name": "Rainfall",
        "description": "Gentle rainfall with occasional soft thunder",
        "duration": 1200,  # 20 minutes
        "file_url": "/assets/therapy/sounds/rainfall.mp3",
        "thumbnail": "/assets/therapy/thumbnails/rain.jpg",
        "tags": ["sleep", "relaxation", "stress-relief"]
    },
    
    # Binaural Beats
    {
        "id": "sound-4",
        "category_id": "cat-2",
        "name": "Alpha Waves for Focus",
        "description": "8-12 Hz binaural beats to enhance focus and concentration",
        "duration": 1800,  # 30 minutes
        "file_url": "/assets/therapy/sounds/alpha-focus.mp3",
        "thumbnail": "/assets/therapy/thumbnails/alpha-waves.jpg",
        "tags": ["focus", "concentration", "productivity"]
    },
    {
        "id": "sound-5",
        "category_id": "cat-2",
        "name": "Delta Waves for Sleep",
        "description": "0.5-4 Hz binaural beats to promote deep sleep",
        "duration": 3600,  # 60 minutes
        "file_url": "/assets/therapy/sounds/delta-sleep.mp3",
        "thumbnail": "/assets/therapy/thumbnails/delta-waves.jpg",
        "tags": ["sleep", "deep-relaxation", "insomnia"]
    },
    
    # 432Hz Music
    {
        "id": "sound-6",
        "category_id": "cat-3",
        "name": "432Hz Meditation Music",
        "description": "Calming meditation music tuned to 432Hz",
        "duration": 1500,  # 25 minutes
        "file_url": "/assets/therapy/sounds/432hz-meditation.mp3",
        "thumbnail": "/assets/therapy/thumbnails/meditation.jpg",
        "tags": ["meditation", "relaxation", "harmony"]
    },
    {
        "id": "sound-7",
        "category_id": "cat-3",
        "name": "432Hz Healing Tones",
        "description": "Pure tones at 432Hz for relaxation and healing",
        "duration": 1200,  # 20 minutes
        "file_url": "/assets/therapy/sounds/432hz-healing.mp3",
        "thumbnail": "/assets/therapy/thumbnails/healing.jpg",
        "tags": ["healing", "relaxation", "balance"]
    }
]

# Mock sound sessions
MOCK_SESSIONS = []

def get_sound_categories():
    """Get all sound therapy categories."""
    return MOCK_CATEGORIES

def get_sounds_by_category(category_id):
    """Get sounds by category."""
    return [sound for sound in MOCK_SOUNDS if sound["category_id"] == category_id]

def get_sound_by_id(sound_id):
    """Get a specific sound by ID."""
    for sound in MOCK_SOUNDS:
        if sound["id"] == sound_id:
            return sound
    return None

def get_recommended_sounds(user_id, mood=None):
    """Get recommended sounds based on user preferences and mood."""
    # In a real app, this would use user history and preferences
    # For the mock, we'll return random sounds or mood-based sounds
    
    if mood:
        # Map moods to tags
        mood_tags = {
            "anxious": ["relaxation", "stress-relief"],
            "stressed": ["relaxation", "stress-relief", "meditation"],
            "tired": ["focus", "concentration", "productivity"],
            "sad": ["healing", "balance", "harmony"],
            "energetic": ["focus", "concentration"],
            "calm": ["meditation", "harmony", "balance"]
        }
        
        # Get tags for the mood
        tags = mood_tags.get(mood.lower(), [])
        
        # Find sounds with matching tags
        matching_sounds = []
        for sound in MOCK_SOUNDS:
            if any(tag in sound["tags"] for tag in tags):
                matching_sounds.append(sound)
        
        # Return matching sounds or random sounds if no matches
        if matching_sounds:
            # Return up to 3 matching sounds
            return random.sample(matching_sounds, min(3, len(matching_sounds)))
    
    # If no mood specified or no matches, return random sounds
    return random.sample(MOCK_SOUNDS, 3)

def log_sound_session(user_id, sound_id, duration, mood_before=None, mood_after=None, notes=""):
    """Log a sound therapy session."""
    sound = get_sound_by_id(sound_id)
    if not sound:
        raise ValueError(f"Sound with ID {sound_id} not found")
    
    session = {
        "id": f"session-{len(MOCK_SESSIONS) + 1}",
        "user_id": user_id,
        "sound_id": sound_id,
        "sound_name": sound["name"],
        "category_id": sound["category_id"],
        "duration": duration,
        "mood_before": mood_before,
        "mood_after": mood_after,
        "notes": notes,
        "created_at": datetime.now().isoformat()
    }
    
    MOCK_SESSIONS.append(session)
    return session

def get_user_therapy_history(user_id, limit=10):
    """Get therapy session history for a user."""
    sessions = [session for session in MOCK_SESSIONS if session["user_id"] == user_id]
    sessions.sort(key=lambda x: x["created_at"], reverse=True)
    return sessions[:limit]

def get_therapy_analytics(user_id):
    """Get analytics for a user's therapy sessions."""
    sessions = [session for session in MOCK_SESSIONS if session["user_id"] == user_id]
    
    if not sessions:
        return {
            "total_sessions": 0,
            "total_duration": 0,
            "favorite_category": None,
            "most_used_sound": None,
            "usage_by_category": {}
        }
    
    # Calculate total sessions and duration
    total_sessions = len(sessions)
    total_duration = sum(session["duration"] for session in sessions)
    
    # Find favorite category
    category_counts = {}
    for session in sessions:
        category_id = session["category_id"]
        if category_id not in category_counts:
            category_counts[category_id] = 0
        category_counts[category_id] += 1
    
    favorite_category_id = max(category_counts, key=category_counts.get)
    favorite_category = next((cat for cat in MOCK_CATEGORIES if cat["id"] == favorite_category_id), None)
    
    # Find most used sound
    sound_counts = {}
    for session in sessions:
        sound_id = session["sound_id"]
        if sound_id not in sound_counts:
            sound_counts[sound_id] = 0
        sound_counts[sound_id] += 1
    
    most_used_sound_id = max(sound_counts, key=sound_counts.get)
    most_used_sound = next((sound for sound in MOCK_SOUNDS if sound["id"] == most_used_sound_id), None)
    
    # Calculate usage by category
    usage_by_category = {}
    for cat in MOCK_CATEGORIES:
        cat_sessions = [session for session in sessions if session["category_id"] == cat["id"]]
        usage_by_category[cat["name"]] = len(cat_sessions)
    
    return {
        "total_sessions": total_sessions,
        "total_duration": total_duration,
        "favorite_category": favorite_category["name"] if favorite_category else None,
        "most_used_sound": most_used_sound["name"] if most_used_sound else None,
        "usage_by_category": usage_by_category
    } 