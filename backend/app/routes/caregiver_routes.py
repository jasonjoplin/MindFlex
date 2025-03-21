from flask import Blueprint, request, jsonify
from app.services.caregiver_service import (
    get_patients_by_caregiver,
    add_patient_to_caregiver,
    get_patient_details,
    add_medication,
    get_medications,
    update_medication,
    delete_medication,
    add_appointment,
    get_appointments,
    update_appointment,
    delete_appointment,
    get_activities,
    get_notes,
    add_note,
    get_patient_progress,
    get_mood_tracking,
    add_mood_entry,
    add_progress_entry
)
from app.services.agent_service import get_caregiver_agent

bp = Blueprint('caregiver', __name__, url_prefix='/api/caregiver')

@bp.route('/patients/<caregiver_id>', methods=['GET'])
def patients(caregiver_id):
    """Get all patients associated with a caregiver."""
    patients = get_patients_by_caregiver(caregiver_id)
    return jsonify({"status": "success", "patients": patients})

@bp.route('/add-patient', methods=['POST'])
def add_patient():
    """Associate a patient with a caregiver."""
    data = request.json
    try:
        result = add_patient_to_caregiver(
            caregiver_id=data.get('caregiver_id'),
            patient_id=data.get('patient_id'),
            relationship=data.get('relationship', 'caregiver')
        )
        return jsonify({"status": "success", "result": result})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 400

@bp.route('/patient/<patient_id>', methods=['GET'])
def patient_details(patient_id):
    """Get detailed information about a patient."""
    patient = get_patient_details(patient_id)
    if patient:
        return jsonify({"status": "success", "patient": patient})
    return jsonify({"status": "error", "message": "Patient not found"}), 404

# Medication management
@bp.route('/medications/<patient_id>', methods=['GET'])
def list_medications(patient_id):
    """Get all medications for a patient."""
    medications = get_medications(patient_id)
    return jsonify({"status": "success", "medications": medications})

@bp.route('/medication', methods=['POST'])
def create_medication():
    """Add a new medication for a patient."""
    data = request.json
    try:
        result = add_medication(
            patient_id=data.get('patient_id'),
            name=data.get('name'),
            dosage=data.get('dosage'),
            frequency=data.get('frequency'),
            time=data.get('time'),
            notes=data.get('notes', '')
        )
        return jsonify({"status": "success", "result": result})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 400

@bp.route('/medication/<medication_id>', methods=['PUT'])
def update_med(medication_id):
    """Update an existing medication."""
    data = request.json
    try:
        result = update_medication(medication_id, data)
        return jsonify({"status": "success", "result": result})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 400

@bp.route('/medication/<medication_id>', methods=['DELETE'])
def delete_med(medication_id):
    """Delete a medication."""
    try:
        result = delete_medication(medication_id)
        return jsonify({"status": "success", "result": result})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 400

# Appointment management
@bp.route('/appointments/<patient_id>', methods=['GET'])
def list_appointments(patient_id):
    """Get all appointments for a patient."""
    appointments = get_appointments(patient_id)
    return jsonify({"status": "success", "appointments": appointments})

@bp.route('/appointment', methods=['POST'])
def create_appointment():
    """Add a new appointment for a patient."""
    data = request.json
    try:
        result = add_appointment(
            patient_id=data.get('patient_id'),
            title=data.get('title'),
            date=data.get('date'),
            time=data.get('time'),
            location=data.get('location', ''),
            notes=data.get('notes', '')
        )
        return jsonify({"status": "success", "result": result})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 400

@bp.route('/appointment/<appointment_id>', methods=['PUT'])
def update_appt(appointment_id):
    """Update an existing appointment."""
    data = request.json
    try:
        result = update_appointment(appointment_id, data)
        return jsonify({"status": "success", "result": result})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 400

@bp.route('/appointment/<appointment_id>', methods=['DELETE'])
def delete_appt(appointment_id):
    """Delete an appointment."""
    try:
        result = delete_appointment(appointment_id)
        return jsonify({"status": "success", "result": result})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 400

# AI-Powered Patient Analysis
@bp.route('/analyze-patient/<patient_id>', methods=['GET'])
def analyze_patient(patient_id):
    """Use AI to analyze patient progress and provide insights."""
    try:
        # Get all patient data
        patient_data = get_patient_details(patient_id)
        if not patient_data:
            return jsonify({"status": "error", "message": "Patient not found"}), 404
        
        # Add additional data needed for analysis
        patient_data["game_history"] = get_patient_progress(patient_id)
        patient_data["reported_symptoms"] = get_mood_tracking(patient_id)
        patient_data["medications"] = get_medications(patient_id)
        
        # Get caregiver agent and analyze patient data
        agent = get_caregiver_agent()
        analysis = agent.analyze_patient_progress(patient_data)
        
        return jsonify({
            "status": "success", 
            "analysis": analysis
        })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

# AI-Generated Daily Care Plan
@bp.route('/daily-plan/<patient_id>', methods=['POST'])
def generate_daily_plan(patient_id):
    """Generate an AI-powered daily care plan for a patient."""
    data = request.json
    
    try:
        # Get patient details
        patient = get_patient_details(patient_id)
        if not patient:
            return jsonify({"status": "error", "message": "Patient not found"}), 404
        
        # Prepare patient profile
        patient_profile = {
            "age": patient.get("age"),
            "condition": patient.get("condition"),
            "mobility": patient.get("mobility", "unknown"),
            "strengths": patient.get("strengths", []),
            "improvement_areas": patient.get("improvement_areas", []),
            "interests": patient.get("interests", [])
        }
        
        # Get caregiver constraints from request
        caregiver_constraints = data.get("caregiver_constraints", {})
        
        # Get caregiver agent and generate daily plan
        agent = get_caregiver_agent()
        plan = agent.generate_daily_plan(patient_profile, caregiver_constraints)
        
        return jsonify({
            "status": "success", 
            "plan": plan
        })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

# Patient Notes with AI Insights
@bp.route('/notes/<patient_id>', methods=['GET'])
def list_notes(patient_id):
    """Get all notes for a patient."""
    notes = get_notes(patient_id)
    return jsonify({"status": "success", "notes": notes})

@bp.route('/note', methods=['POST'])
def create_note():
    """Add a new note for a patient with AI-generated insights."""
    data = request.json
    try:
        # Extract basic note information
        patient_id = data.get('patient_id')
        content = data.get('content')
        
        # Get caregiver agent to analyze the note
        agent = get_caregiver_agent()
        note_analysis = agent.ask(
            f"Analyze this caregiver note and provide insights or recommendations: {content}",
            "You are analyzing a caregiver's note about a patient. Provide concise, practical insights or recommendations based on the note content. Focus on actionable advice and potential concerns to watch for. Limit your response to 3-5 bullet points."
        )
        
        # Add the note with AI insights
        result = add_note(
            patient_id=patient_id,
            content=content,
            ai_insights=note_analysis,
            note_type=data.get('note_type', 'observation')
        )
        
        return jsonify({"status": "success", "result": result})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 400

# Mood Tracking
@bp.route('/mood-tracking/<patient_id>', methods=['GET'])
def get_patient_mood(patient_id):
    """Get mood tracking data for a patient."""
    mood_entries = get_mood_tracking(patient_id)
    return jsonify({"status": "success", "mood_entries": mood_entries})

@bp.route('/mood-entry', methods=['POST'])
def create_mood_entry():
    """Add a new mood entry for a patient."""
    data = request.json
    try:
        result = add_mood_entry(
            patient_id=data.get('patient_id'),
            mood=data.get('mood'),
            notes=data.get('notes', ''),
            symptoms=data.get('symptoms', []),
            factors=data.get('factors', [])
        )
        return jsonify({"status": "success", "result": result})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 400

# AI Recommendations
@bp.route('/recommendations/<patient_id>', methods=['GET'])
def get_recommendations(patient_id):
    """Get AI-powered recommendations for patient care."""
    try:
        # Get patient data
        patient = get_patient_details(patient_id)
        if not patient:
            return jsonify({"status": "error", "message": "Patient not found"}), 404
        
        # Extract relevant data for recommendations
        medications = get_medications(patient_id)
        mood_entries = get_mood_tracking(patient_id)
        
        # Prepare context for AI
        context = {
            "patient": patient,
            "medications": medications,
            "recent_moods": mood_entries[:5] if mood_entries else []
        }
        
        # Get caregiver agent and generate recommendations
        agent = get_caregiver_agent()
        
        # Format prompt for the agent
        prompt = f"""Based on the following patient data, provide personalized care recommendations:
        
Patient: {patient.get('first_name')} {patient.get('last_name')}
Age: {patient.get('age')}
Condition: {patient.get('condition')}

Medications: {', '.join([med.get('name') for med in medications])}

Recent moods: {', '.join([entry.get('mood') for entry in context['recent_moods']])}

Please provide recommendations in these categories:
1. Care approaches
2. Communication strategies
3. Cognitive exercises
4. Lifestyle adjustments
5. Warning signs to watch for
"""
        
        recommendations = agent.ask(prompt)
        
        return jsonify({
            "status": "success", 
            "recommendations": recommendations
        })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

# Progress Tracking
@bp.route('/progress/<patient_id>', methods=['GET'])
def get_progress(patient_id):
    """Get progress tracking data for a patient."""
    progress_entries = get_patient_progress(patient_id)
    return jsonify({"status": "success", "progress": progress_entries})

@bp.route('/progress', methods=['POST'])
def create_progress():
    """Add a new progress entry for a patient."""
    data = request.json
    try:
        result = add_progress_entry(
            patient_id=data.get('patient_id'),
            game_name=data.get('game_name'),
            score=data.get('score'),
            duration=data.get('duration'),
            difficulty=data.get('difficulty'),
            improvements=data.get('improvements', []),
            notes=data.get('notes', '')
        )
        return jsonify({"status": "success", "result": result})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 400 