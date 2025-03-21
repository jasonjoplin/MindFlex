import os
import json
from datetime import datetime, timedelta
import random
from app.services.supabase_client import supabase

# Import LLM services for enhanced analytics
try:
    from app.services.agent_service import get_game_agent
except ImportError:
    # If agent_service is not available, create a placeholder
    get_game_agent = None

# Mock game database
MOCK_GAMES = [
    {
        "id": "11111111-1111-1111-1111-111111111111",
        "name": "Memory Match",
        "description": "Test and improve your memory by matching pairs of cards",
        "type": "memory",
        "difficulty_levels": ["easy", "medium", "hard"],
        "time_limit": 120,
        "instructions": "Flip cards to find matching pairs. Remember the positions of cards you've seen to make matches more efficiently.",
        "thumbnail": "/assets/games/memory-match.jpg"
    },
    {
        "id": "22222222-2222-2222-2222-222222222222",
        "name": "Stroop Test",
        "description": "Challenge your brain's processing speed and cognitive flexibility",
        "type": "attention",
        "difficulty_levels": ["easy", "medium", "hard"],
        "time_limit": 60,
        "instructions": "Name the COLOR of the word, not the word itself. For example, if you see the word 'RED' printed in blue, the correct answer is 'blue'.",
        "thumbnail": "/assets/games/stroop-test.jpg"
    },
    {
        "id": "33333333-3333-3333-3333-333333333333",
        "name": "Number Sequence",
        "description": "Test your working memory by remembering sequences of numbers",
        "type": "memory",
        "difficulty_levels": ["easy", "medium", "hard"],
        "time_limit": 90,
        "instructions": "Watch the sequence of numbers and then repeat it back in the correct order. The sequence will get longer as you progress.",
        "thumbnail": "/assets/games/number-sequence.jpg"
    }
]

# Mock game scores
MOCK_SCORES = []

def get_games():
    """Get all available games from Supabase."""
    try:
        games = supabase.from_table('games').select('*').execute()
        return games
    except Exception as e:
        print(f"Error fetching games from Supabase: {e}")
        # Fallback to mock data if Supabase fails
        return MOCK_GAMES

def get_game_by_id(game_id):
    """Get a specific game by ID from Supabase."""
    try:
        game = supabase.from_table('games').select('*').eq('id', game_id).execute()
        if game and len(game) > 0:
            return game[0]
        return None
    except Exception as e:
        print(f"Error fetching game {game_id} from Supabase: {e}")
        # Fallback to mock data if Supabase fails
        for game in MOCK_GAMES:
            if game["id"] == game_id:
                return game
        return None

def log_game_score(patient_id, game_id, score, duration, difficulty, errors=0, metadata=None):
    """Log a score for a completed game to Supabase."""
    game = get_game_by_id(game_id)
    if not game:
        raise ValueError(f"Game with ID {game_id} not found")
    
    game_score = {
        "patient_id": patient_id,
        "game_id": game_id,
        "game_name": game["name"],
        "game_type": game["type"],
        "score": score,
        "duration": duration,
        "difficulty": difficulty,
        "errors": errors,
        "metadata": metadata or {},
        "created_at": datetime.now().isoformat()
    }
    
    try:
        result = supabase.from_table('game_scores').insert(game_score).execute()
        if result and len(result) > 0:
            return result[0]
        return game_score
    except Exception as e:
        print(f"Error logging game score to Supabase: {e}")
        # Fallback to mock data if Supabase fails
        # Generate a mock UUID for the score
        mock_id = f"{random.randint(10000000, 99999999)}-{random.randint(1000, 9999)}-{random.randint(1000, 9999)}-{random.randint(1000, 9999)}-{random.randint(100000000000, 999999999999)}"
        game_score["id"] = mock_id
        MOCK_SCORES.append(game_score)
        return game_score

def get_user_game_history(patient_id, limit=10):
    """Get game history for a specific patient from Supabase."""
    try:
        history = supabase.from_table('game_scores').select('*').eq('patient_id', patient_id).order('created_at', ascending=False).limit(limit).execute()
        return history
    except Exception as e:
        print(f"Error fetching game history from Supabase: {e}")
        # Fallback to mock data if Supabase fails
        history = [score for score in MOCK_SCORES if score["patient_id"] == patient_id]
        history.sort(key=lambda x: x["created_at"], reverse=True)
        return history[:limit]

def get_game_analytics(patient_id, game_type=None, time_period=None, use_llm=True):
    """Get analytics for a patient's game performance from Supabase.
    
    Args:
        patient_id: The ID of the patient to analyze
        game_type: Optional filter by game type
        time_period: Optional time period filter (e.g., "30d" for 30 days)
        use_llm: Whether to use LLM for enhanced analysis (default: True)
    """
    try:
        query = supabase.from_table('game_scores').select('*').eq('patient_id', patient_id)
        
        # Filter by game type if specified
        if game_type:
            query = query.eq('game_type', game_type)
            
        scores = query.execute()
        
        # Filter by time period if specified (done in Python since Supabase doesn't support this operation directly)
        if time_period and scores:
            # Parse time period (e.g., "30d" for 30 days)
            days = int(time_period.rstrip('d'))
            cutoff_date = (datetime.now() - timedelta(days=days)).isoformat()
            scores = [score for score in scores if score["created_at"] >= cutoff_date]
    except Exception as e:
        print(f"Error fetching game analytics from Supabase: {e}")
        # Fallback to mock data if Supabase fails
        scores = [score for score in MOCK_SCORES if score["patient_id"] == patient_id]
        
        # Filter by game type if specified
        if game_type:
            scores = [score for score in scores if score["game_type"] == game_type]
        
        # Filter by time period if specified
        if time_period:
            # Parse time period (e.g., "30d" for 30 days)
            days = int(time_period.rstrip('d'))
            cutoff_date = (datetime.now() - timedelta(days=days)).isoformat()
            scores = [score for score in scores if score["created_at"] >= cutoff_date]
    
    if not scores:
        return {
            "total_games": 0,
            "average_score": 0,
            "average_duration": 0,
            "improvement_rate": 0,
            "strengths": [],
            "areas_for_improvement": [],
            "recommendations": []
        }
    
    # Basic statistical analytics
    total_games = len(scores)
    average_score = sum(s["score"] for s in scores) / total_games if total_games > 0 else 0
    average_duration = sum(s["duration"] for s in scores) / total_games if total_games > 0 else 0
    
    # Calculate improvement rate (comparing first half to second half if enough data)
    improvement_rate = 0
    if total_games >= 4:
        sorted_scores = sorted(scores, key=lambda s: s["created_at"])
        midpoint = total_games // 2
        first_half = sorted_scores[:midpoint]
        second_half = sorted_scores[midpoint:]
        
        first_half_avg = sum(s["score"] for s in first_half) / len(first_half)
        second_half_avg = sum(s["score"] for s in second_half) / len(second_half)
        
        # Calculate percentage improvement
        if first_half_avg > 0:
            improvement_rate = ((second_half_avg - first_half_avg) / first_half_avg) * 100
    
    # Enhanced analytics using LLM if available and requested
    strengths = []
    areas_for_improvement = []
    recommendations = []
    llm_insights = {}
    
    if use_llm and get_game_agent and total_games > 0:
        try:
            # Get the game agent for analysis
            game_agent = get_game_agent()
            
            # Prepare data for LLM analysis
            analysis_data = {
                "patient_id": patient_id,
                "game_scores": scores,
                "total_games": total_games,
                "average_score": average_score,
                "average_duration": average_duration,
                "improvement_rate": improvement_rate
            }
            
            # Create prompt for the LLM
            prompt = f"""Based on the following game performance data, provide an analysis of the patient's 
cognitive performance strengths and areas for improvement. Also suggest personalized recommendations 
for exercises or games that might help improve cognitive skills.

Patient ID: {patient_id}
Total Games Played: {total_games}
Average Score: {average_score:.2f}
Average Duration: {average_duration:.2f} seconds
Improvement Rate: {improvement_rate:.2f}%

Game History:
"""
            
            # Add up to 10 most recent games for context
            for i, game in enumerate(sorted(scores, key=lambda s: s["created_at"], reverse=True)[:10]):
                prompt += f"""Game {i+1}: 
- Type: {game.get('game_type', 'unknown')}
- Score: {game.get('score', 0)}
- Duration: {game.get('duration', 0)} seconds
- Difficulty: {game.get('difficulty', 'medium')}
- Errors: {game.get('errors', 0)}
- Date: {game.get('created_at', 'unknown')}
"""

            prompt += """
Please respond with a JSON object containing:
1. "strengths": Array of the patient's cognitive strengths based on game performance
2. "areas_for_improvement": Array of areas where the patient could improve
3. "recommendations": Array of specific games, difficulties, or cognitive exercises recommended
4. "cognitive_pattern": Brief description of any patterns in performance
5. "progress_projection": Brief projection of expected improvement if the patient continues current engagement

Your analysis should be specifically tailored to the types of games played and the pattern of scores.
"""
            
            # Get LLM response and parse it
            import json
            import re
            
            response = game_agent.ask(prompt)
            
            # Try to find JSON in the response
            json_match = re.search(r'```(?:json)?\s*([\s\S]+?)\s*```', response)
            if json_match:
                json_str = json_match.group(1)
            else:
                json_str = response
                
            try:
                llm_insights = json.loads(json_str)
                # Extract insights from LLM response
                strengths = llm_insights.get("strengths", [])
                areas_for_improvement = llm_insights.get("areas_for_improvement", [])
                recommendations = llm_insights.get("recommendations", [])
            except json.JSONDecodeError:
                # If JSON parsing fails, extract insights using heuristics
                print("Failed to parse LLM response as JSON, using fallback extraction")
                
                # Simple heuristic extraction
                if "strengths:" in response.lower():
                    strengths_section = response.lower().split("strengths:")[1].split("\n\n")[0]
                    strengths = [s.strip("- ").strip() for s in strengths_section.split("\n") if s.strip()]
                
                if "areas for improvement:" in response.lower():
                    improve_section = response.lower().split("areas for improvement:")[1].split("\n\n")[0]
                    areas_for_improvement = [s.strip("- ").strip() for s in improve_section.split("\n") if s.strip()]
                
                if "recommendations:" in response.lower():
                    rec_section = response.lower().split("recommendations:")[1].split("\n\n")[0]
                    recommendations = [s.strip("- ").strip() for s in rec_section.split("\n") if s.strip()]
        
        except Exception as e:
            print(f"Error in LLM-enhanced analytics: {str(e)}")
            # Fallback to basic analytics
    
    # Combine basic and enhanced analytics
    analytics = {
        "total_games": total_games,
        "average_score": round(average_score, 2),
        "average_duration": round(average_duration, 2),
        "improvement_rate": round(improvement_rate, 2),
        "strengths": strengths or ["Consistent participation"],
        "areas_for_improvement": areas_for_improvement or ["More regular practice"],
        "recommendations": recommendations or ["Try increasing difficulty levels as scores improve"]
    }
    
    # Add additional LLM insights if available
    if llm_insights:
        if "cognitive_pattern" in llm_insights:
            analytics["cognitive_pattern"] = llm_insights["cognitive_pattern"]
        if "progress_projection" in llm_insights:
            analytics["progress_projection"] = llm_insights["progress_projection"]
    
    return analytics 