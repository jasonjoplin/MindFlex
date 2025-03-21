import logging
from typing import Dict, List, Any, Optional, Union
from .llm_service import get_llm_service

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class Agent:
    """Base class for all agents in the system"""
    
    def __init__(self, provider_name: str = None):
        """Initialize the agent with a specific LLM provider"""
        self.llm_service = get_llm_service()
        self.provider_name = provider_name
        self.provider = self.llm_service.get_provider(provider_name)
        self.history = []
    
    def _add_to_history(self, role: str, content: str):
        """Add a message to the conversation history"""
        self.history.append({"role": role, "content": content})
        # Keep history to a reasonable size
        if len(self.history) > 20:
            # Remove oldest messages but keep the system message if it exists
            if self.history[0]["role"] == "system":
                self.history = [self.history[0]] + self.history[-19:]
            else:
                self.history = self.history[-20:]
    
    def ask(self, query: str, system_prompt: str = None, options: Dict[str, Any] = None) -> str:
        """Ask the agent a question and get a response"""
        messages = []
        
        # Add system prompt if provided
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        
        # Add history if available
        if self.history:
            messages.extend(self.history)
        
        # Add the new query
        messages.append({"role": "user", "content": query})
        
        # Get response from LLM
        response = self.provider.generate_chat(messages, options)
        
        # Add to history
        self._add_to_history("user", query)
        self._add_to_history("assistant", response)
        
        return response
    
    def reset_history(self):
        """Clear the conversation history"""
        self.history = []

class GameAgent(Agent):
    """Agent specialized for cognitive games and exercises"""
    
    def __init__(self, provider_name: str = None):
        super().__init__(provider_name)
        
        # Set default system prompt
        self.system_prompt = """You are a specialized AI assistant for cognitive games and exercises. 
Your goal is to help users with word games, puzzles, and cognitive exercises that can improve memory,
attention, and language skills. Be encouraging, adaptive to different difficulty levels, and provide
hints without giving away answers completely."""
    
    def generate_exercise(self, game_type: str, difficulty: str, user_profile: Dict[str, Any] = None) -> Dict[str, Any]:
        """Generate a new cognitive exercise based on game type and difficulty"""
        prompt = f"""Generate a new {game_type} cognitive exercise at {difficulty} difficulty level."""
        
        if user_profile:
            prompt += f"""\nThis is for a user with the following profile:
Age: {user_profile.get('age', 'unknown')}
Cognitive strengths: {user_profile.get('strengths', 'unknown')}
Areas needing improvement: {user_profile.get('improvement_areas', 'unknown')}
Previous performance: {user_profile.get('previous_performance', 'unknown')}"""
        
        # Request a specific format for the response
        prompt += """\nPlease structure your response as a JSON object with the following fields:
1. title - The title of the exercise
2. instructions - Clear and concise instructions for the user
3. content - The actual exercise content (words, questions, etc.)
4. hints - A list of 3 progressive hints that can be revealed one by one
5. solution - The correct answer or approach
6. validation_criteria - How to validate if the user's answer is correct

Make sure the exercise is appropriate for the difficulty level and engaging for the user."""
        
        # Get response and parse as JSON
        try:
            response = self.ask(prompt, self.system_prompt)
            # Find JSON in the response (might be wrapped in ```json...``` or just plain text)
            import json
            import re
            
            # Try to find JSON in markdown code blocks
            json_match = re.search(r'```(?:json)?\s*([\s\S]+?)\s*```', response)
            if json_match:
                json_str = json_match.group(1)
            else:
                # Assume the entire response is JSON
                json_str = response
                
            exercise = json.loads(json_str)
            return exercise
        except Exception as e:
            logger.error(f"Error generating exercise: {str(e)}")
            return {
                "error": "Failed to generate exercise",
                "details": str(e)
            }
    
    def evaluate_answer(self, exercise: Dict[str, Any], user_answer: str) -> Dict[str, Any]:
        """Evaluate a user's answer to a cognitive exercise"""
        prompt = f"""Evaluate the following user answer to a cognitive exercise:
        
Exercise: {exercise['title']}
Instructions: {exercise['instructions']}
Content: {exercise['content']}
Correct solution: {exercise['solution']}
Validation criteria: {exercise['validation_criteria']}

User's answer: {user_answer}

Please provide feedback on the user's answer. Include:
1. Whether the answer is correct or partially correct
2. A score from 0-100
3. Constructive feedback
4. A suggestion for improvement if needed
5. Encouragement for the user

Structure your response as a JSON object."""
        
        try:
            response = self.ask(prompt, self.system_prompt)
            # Find JSON in the response
            import json
            import re
            
            json_match = re.search(r'```(?:json)?\s*([\s\S]+?)\s*```', response)
            if json_match:
                json_str = json_match.group(1)
            else:
                json_str = response
                
            evaluation = json.loads(json_str)
            return evaluation
        except Exception as e:
            logger.error(f"Error evaluating answer: {str(e)}")
            return {
                "correct": False,
                "score": 0,
                "feedback": "Sorry, I couldn't evaluate your answer due to a technical issue.",
                "suggestion": "Please try again later.",
                "encouragement": "Keep practicing!"
            }

class TherapyAgent(Agent):
    """Agent specialized for sound therapy and relaxation"""
    
    def __init__(self, provider_name: str = None):
        super().__init__(provider_name)
        
        # Set default system prompt
        self.system_prompt = """You are a specialized AI assistant for sound therapy and relaxation.
Your role is to recommend appropriate sounds, music, and relaxation techniques based on a user's
mood, preferences, and therapeutic needs. Be calming, empathetic, and focus on emotional well-being
and stress reduction."""
    
    def recommend_sounds(self, user_mood: str, preferences: List[str] = None, therapy_goal: str = None) -> List[Dict[str, Any]]:
        """Recommend sounds based on user mood and preferences"""
        prompt = f"""Recommend sound therapy options for a user who is feeling {user_mood}."""
        
        if preferences:
            prompt += f"\nUser preferences: {', '.join(preferences)}"
        
        if therapy_goal:
            prompt += f"\nTherapy goal: {therapy_goal}"
        
        prompt += """\nPlease recommend 3-5 sound therapy options. Structure your response as a JSON array of objects, 
where each object has the following fields:
1. title - Name of the recommended sound or track
2. category - Category (nature, ambient, music, etc.)
3. duration - Recommended duration in minutes
4. description - Why this is recommended and its benefits
5. instructions - How to best experience this sound (environment, posture, etc.)"""
        
        try:
            response = self.ask(prompt, self.system_prompt)
            # Parse JSON response
            import json
            import re
            
            json_match = re.search(r'```(?:json)?\s*([\s\S]+?)\s*```', response)
            if json_match:
                json_str = json_match.group(1)
            else:
                json_str = response
                
            recommendations = json.loads(json_str)
            return recommendations
        except Exception as e:
            logger.error(f"Error generating sound recommendations: {str(e)}")
            return [{
                "title": "Calming Ocean Waves",
                "category": "nature",
                "duration": 15,
                "description": "Ocean sounds can help reduce anxiety and promote relaxation.",
                "instructions": "Find a comfortable position, close your eyes, and focus on the rhythm of the waves."
            }]
    
    def generate_guided_meditation(self, duration_minutes: int, focus_area: str, user_experience_level: str = "beginner") -> str:
        """Generate a guided meditation script based on user preferences"""
        prompt = f"""Create a guided meditation script for a {duration_minutes}-minute meditation 
focusing on {focus_area} for a {user_experience_level} level practitioner.

The script should include:
1. A gentle introduction
2. Breathing instructions
3. Guided visualization
4. Periodic reminders to refocus attention
5. A gentle conclusion

Make sure the pacing is appropriate for a {duration_minutes}-minute session and the language 
is calming and supportive."""
        
        response = self.ask(prompt, self.system_prompt)
        return response

class CaregiverAgent(Agent):
    """Agent specialized for caregiver support and patient management"""
    
    def __init__(self, provider_name: str = None):
        super().__init__(provider_name)
        
        # Set default system prompt
        self.system_prompt = """You are a specialized AI assistant for caregivers managing patients with cognitive concerns.
Your role is to provide practical advice, emotional support, and help with tracking patient progress.
Be compassionate, informative, and focus on evidence-based approaches. While you can offer general
guidance, always clarify that you're not replacing professional medical advice."""
    
    def analyze_patient_progress(self, patient_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze patient progress data and provide insights"""
        # Extract relevant data for the prompt
        game_history = patient_data.get("game_history", [])
        therapy_history = patient_data.get("therapy_history", [])
        medications = patient_data.get("medications", [])
        symptoms = patient_data.get("reported_symptoms", [])
        
        # Create a prompt for the LLM
        prompt = """Analyze the following patient data and provide insights on progress, areas for improvement, and recommendations:"""
        
        if game_history:
            prompt += "\n\nGame Performance History:"
            for game in game_history[:5]:  # Limit to most recent 5 for brevity
                prompt += f"\n- Game: {game.get('game_name')}, Score: {game.get('score')}, Date: {game.get('date')}"
        
        if therapy_history:
            prompt += "\n\nTherapy Session History:"
            for session in therapy_history[:5]:
                prompt += f"\n- Type: {session.get('therapy_type')}, Duration: {session.get('duration')} min, Mood Change: {session.get('mood_change', 'Not reported')}, Date: {session.get('date')}"
        
        if medications:
            prompt += "\n\nCurrent Medications:"
            for med in medications:
                prompt += f"\n- {med.get('name')}, Dosage: {med.get('dosage')}, Schedule: {med.get('schedule')}"
        
        if symptoms:
            prompt += "\n\nReported Symptoms:"
            for symptom in symptoms:
                prompt += f"\n- {symptom.get('description')}, Severity: {symptom.get('severity')}, Date: {symptom.get('date')}"
        
        prompt += """\n\nPlease structure your analysis as a JSON object with the following sections:
1. progress_summary - Overall assessment of patient progress
2. cognitive_strengths - Areas where the patient is showing good performance
3. improvement_areas - Areas that need attention or improvement
4. recommendations - Specific recommendations for games, exercises, or therapy
5. caregiver_tips - Practical tips for the caregiver
6. follow_up - Suggested follow-up actions or assessments"""
        
        try:
            response = self.ask(prompt, self.system_prompt)
            # Parse JSON response
            import json
            import re
            
            json_match = re.search(r'```(?:json)?\s*([\s\S]+?)\s*```', response)
            if json_match:
                json_str = json_match.group(1)
            else:
                json_str = response
                
            analysis = json.loads(json_str)
            return analysis
        except Exception as e:
            logger.error(f"Error analyzing patient progress: {str(e)}")
            return {
                "progress_summary": "Unable to generate progress summary due to a technical issue.",
                "cognitive_strengths": [],
                "improvement_areas": [],
                "recommendations": ["Please try again later or consult a healthcare professional for a proper assessment."],
                "caregiver_tips": ["Continue following the care plan prescribed by healthcare providers."],
                "follow_up": ["Consider scheduling a consultation with the patient's healthcare provider."]
            }
    
    def generate_daily_plan(self, patient_profile: Dict[str, Any], caregiver_constraints: Dict[str, Any] = None) -> Dict[str, Any]:
        """Generate a daily care and activity plan for a patient"""
        prompt = """Generate a daily care and activity plan for a patient with the following profile:"""
        
        prompt += f"\nAge: {patient_profile.get('age', 'unknown')}"
        prompt += f"\nCognitive condition: {patient_profile.get('condition', 'unknown')}"
        prompt += f"\nMobility level: {patient_profile.get('mobility', 'unknown')}"
        prompt += f"\nCognitive strengths: {patient_profile.get('strengths', 'unknown')}"
        prompt += f"\nAreas needing improvement: {patient_profile.get('improvement_areas', 'unknown')}"
        prompt += f"\nInterests/hobbies: {patient_profile.get('interests', 'unknown')}"
        
        if caregiver_constraints:
            prompt += "\n\nCaregiver constraints:"
            prompt += f"\nAvailable time: {caregiver_constraints.get('available_time', 'unknown')}"
            prompt += f"\nSupport network: {caregiver_constraints.get('support_network', 'unknown')}"
            prompt += f"\nOther considerations: {caregiver_constraints.get('considerations', 'unknown')}"
        
        prompt += """\n\nPlease structure your daily plan as a JSON object with the following sections:
1. morning_routine - Activities and care for the morning
2. cognitive_exercises - Recommended cognitive games or exercises (2-3)
3. physical_activities - Recommended physical activities suitable for patient's mobility
4. meals - Meal suggestions considering nutritional needs
5. therapy_sessions - Any recommended therapy sessions
6. social_engagement - Ideas for social interaction
7. evening_routine - Activities and care for the evening
8. caregiver_breaks - Suggested times for caregiver rest and self-care"""
        
        try:
            response = self.ask(prompt, self.system_prompt)
            # Parse JSON response
            import json
            import re
            
            json_match = re.search(r'```(?:json)?\s*([\s\S]+?)\s*```', response)
            if json_match:
                json_str = json_match.group(1)
            else:
                json_str = response
                
            daily_plan = json.loads(json_str)
            return daily_plan
        except Exception as e:
            logger.error(f"Error generating daily plan: {str(e)}")
            return {
                "morning_routine": ["Gentle wake-up", "Medication", "Breakfast", "Light stretching"],
                "cognitive_exercises": ["Memory card matching", "Simple word puzzles"],
                "physical_activities": ["Short walk if mobility allows", "Seated exercises"],
                "meals": ["Focus on balanced nutrition", "Stay hydrated throughout the day"],
                "therapy_sessions": ["Consider scheduled therapy appointments"],
                "social_engagement": ["Family video call", "Looking at photo albums"],
                "evening_routine": ["Calm activities before bed", "Medication", "Regular sleep schedule"],
                "caregiver_breaks": ["Short breaks when patient is engaged in an activity", "Self-care is important"]
            }


# Singleton instances
_game_agent = None
_therapy_agent = None
_caregiver_agent = None

def get_game_agent(provider_name: str = None) -> GameAgent:
    """Get the singleton game agent instance"""
    global _game_agent
    if _game_agent is None:
        _game_agent = GameAgent(provider_name)
    return _game_agent

def get_therapy_agent(provider_name: str = None) -> TherapyAgent:
    """Get the singleton therapy agent instance"""
    global _therapy_agent
    if _therapy_agent is None:
        _therapy_agent = TherapyAgent(provider_name)
    return _therapy_agent

def get_caregiver_agent(provider_name: str = None) -> CaregiverAgent:
    """Get the singleton caregiver agent instance"""
    global _caregiver_agent
    if _caregiver_agent is None:
        _caregiver_agent = CaregiverAgent(provider_name)
    return _caregiver_agent 