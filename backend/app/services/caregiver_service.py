import os
import json
from datetime import datetime, timedelta
import random

# Mock patient data
MOCK_PATIENTS = [
    {
        "id": "patient-1",
        "name": "John Doe",
        "email": "john@example.com",
        "age": 72,
        "condition": "Mild Cognitive Impairment",
        "notes": "Responds well to memory exercises",
        "created_at": "2023-01-15T10:30:00Z"
    },
    {
        "id": "patient-2",
        "name": "Jane Smith",
        "email": "jane@example.com",
        "age": 68,
        "condition": "Early Alzheimer's",
        "notes": "Enjoys music therapy sessions",
        "created_at": "2023-02-20T14:45:00Z"
    }
]

# Mock medication data
MOCK_MEDICATIONS = [
    {
        "id": "med-1",
        "patient_id": "patient-1",
        "name": "Donepezil",
        "dosage": "5mg",
        "frequency": "Once daily",
        "time": "08:00",
        "notes": "Take with breakfast",
        "created_at": "2023-01-20T09:00:00Z"
    },
    {
        "id": "med-2",
        "patient_id": "patient-1",
        "name": "Vitamin B Complex",
        "dosage": "1 tablet",
        "frequency": "Once daily",
        "time": "08:00",
        "notes": "Take with breakfast",
        "created_at": "2023-01-20T09:05:00Z"
    },
    {
        "id": "med-3",
        "patient_id": "patient-2",
        "name": "Memantine",
        "dosage": "10mg",
        "frequency": "Twice daily",
        "time": "08:00,20:00",
        "notes": "Take with meals",
        "created_at": "2023-02-25T10:15:00Z"
    }
]

# Mock appointment data
MOCK_APPOINTMENTS = [
    {
        "id": "appt-1",
        "patient_id": "patient-1",
        "title": "Neurologist Appointment",
        "description": "Regular checkup with Dr. Johnson",
        "date": "2023-05-15",
        "time": "10:00",
        "location": "Memorial Hospital, Room 302",
        "notes": "Bring medication list",
        "created_at": "2023-04-01T11:30:00Z"
    },
    {
        "id": "appt-2",
        "patient_id": "patient-2",
        "title": "Memory Clinic",
        "description": "Cognitive assessment",
        "date": "2023-05-20",
        "time": "14:30",
        "location": "Community Health Center",
        "notes": "Arrive 15 minutes early to fill out forms",
        "created_at": "2023-04-05T09:45:00Z"
    }
]

# Mock caregiver-patient relationships
MOCK_RELATIONSHIPS = [
    {
        "caregiver_id": "caregiver-1",
        "patient_id": "patient-1",
        "relationship": "primary caregiver",
        "created_at": "2023-01-15T10:35:00Z"
    },
    {
        "caregiver_id": "caregiver-1",
        "patient_id": "patient-2",
        "relationship": "caregiver",
        "created_at": "2023-02-20T14:50:00Z"
    }
]

# Mock patient progress data (cognitive games, exercises, etc.)
MOCK_PROGRESS = [
    {
        "id": "progress-1",
        "patient_id": "patient-1",
        "game_name": "Word Puzzle",
        "score": 85,
        "duration": 15,
        "difficulty": "medium",
        "date": "2023-05-10T14:30:00Z",
        "improvements": ["memory", "vocabulary"],
        "notes": "Patient completed the task with minimal assistance"
    },
    {
        "id": "progress-2",
        "patient_id": "patient-1",
        "game_name": "Pattern Recognition",
        "score": 72,
        "duration": 12,
        "difficulty": "easy",
        "date": "2023-05-12T09:45:00Z",
        "improvements": ["visual processing", "attention"],
        "notes": "Patient showed improved focus compared to last session"
    },
    {
        "id": "progress-3",
        "patient_id": "patient-2",
        "game_name": "Memory Match",
        "score": 68,
        "duration": 10,
        "difficulty": "medium",
        "date": "2023-05-11T11:15:00Z",
        "improvements": ["short-term memory"],
        "notes": "Patient had difficulty remembering card positions"
    }
]

# Mock mood tracking data
MOCK_MOOD_ENTRIES = [
    {
        "id": "mood-1",
        "patient_id": "patient-1",
        "mood": "content",
        "timestamp": "2023-05-10T08:30:00Z",
        "notes": "Patient seemed relaxed after breakfast",
        "symptoms": ["slight confusion in the morning"],
        "factors": ["slept well", "took medication on time"]
    },
    {
        "id": "mood-2",
        "patient_id": "patient-1",
        "mood": "agitated",
        "timestamp": "2023-05-11T15:45:00Z",
        "notes": "Patient became upset during afternoon activities",
        "symptoms": ["restlessness", "irritability"],
        "factors": ["skipped afternoon nap", "loud environment"]
    },
    {
        "id": "mood-3",
        "patient_id": "patient-2",
        "mood": "calm",
        "timestamp": "2023-05-10T19:15:00Z",
        "notes": "Patient enjoyed the music therapy session",
        "symptoms": [],
        "factors": ["music therapy", "quiet evening routine"]
    }
]

# Mock notes
MOCK_NOTES = [
    {
        "id": "note-1",
        "patient_id": "patient-1",
        "content": "Patient showed improved recognition of family members today. Was able to recall names with minimal prompting.",
        "ai_insights": "• Progress in facial recognition indicates potential improvement in episodic memory\n• Continue using family photos as memory aids\n• Consider gradually reducing prompting to encourage independent recall",
        "note_type": "observation",
        "created_at": "2023-05-09T10:15:00Z",
        "updated_at": "2023-05-09T10:15:00Z"
    },
    {
        "id": "note-2",
        "patient_id": "patient-1",
        "content": "Patient refused morning medication. Became agitated when prompted and expressed concern about 'too many pills'.",
        "ai_insights": "• Medication resistance may indicate anxiety or confusion about treatment\n• Consider discussing medication consolidation with doctor\n• Try presenting medications one at a time rather than all at once",
        "note_type": "concern",
        "created_at": "2023-05-10T09:30:00Z", 
        "updated_at": "2023-05-10T09:30:00Z"
    },
    {
        "id": "note-3",
        "patient_id": "patient-2",
        "content": "Patient engaged well in the garden activity today. Identified several plants correctly and seemed to enjoy the sensory experience.",
        "ai_insights": "• Positive response to nature-based activities suggests potential for more outdoor therapy\n• Plant identification exercises good for cognitive stimulation\n• Consider incorporating more sensory elements into daily activities",
        "note_type": "observation",
        "created_at": "2023-05-08T16:45:00Z",
        "updated_at": "2023-05-08T16:45:00Z"
    }
]

# Mock activities (for daily routine tracking)
MOCK_ACTIVITIES = [
    {
        "id": "activity-1",
        "patient_id": "patient-1",
        "name": "Morning Walk",
        "type": "physical",
        "description": "15-minute walk around the garden",
        "scheduled_time": "08:30",
        "duration": 15,
        "frequency": "daily",
        "completed_dates": ["2023-05-08", "2023-05-09", "2023-05-10"]
    },
    {
        "id": "activity-2",
        "patient_id": "patient-1",
        "name": "Memory Card Game",
        "type": "cognitive",
        "description": "Match pairs of cards to exercise memory",
        "scheduled_time": "10:30",
        "duration": 20,
        "frequency": "weekdays",
        "completed_dates": ["2023-05-08", "2023-05-10"]
    },
    {
        "id": "activity-3",
        "patient_id": "patient-2",
        "name": "Music Therapy",
        "type": "therapeutic",
        "description": "Listen to favorite music from youth",
        "scheduled_time": "16:00",
        "duration": 30,
        "frequency": "daily",
        "completed_dates": ["2023-05-08", "2023-05-09", "2023-05-10"]
    }
]

def get_patients_by_caregiver(caregiver_id):
    """Get all patients associated with a caregiver."""
    # Get patient IDs for this caregiver
    patient_ids = [rel["patient_id"] for rel in MOCK_RELATIONSHIPS if rel["caregiver_id"] == caregiver_id]
    
    # Get patient details
    patients = []
    for patient_id in patient_ids:
        for patient in MOCK_PATIENTS:
            if patient["id"] == patient_id:
                # Add relationship info
                patient_copy = patient.copy()
                for rel in MOCK_RELATIONSHIPS:
                    if rel["caregiver_id"] == caregiver_id and rel["patient_id"] == patient_id:
                        patient_copy["relationship"] = rel["relationship"]
                        break
                patients.append(patient_copy)
                break
    
    return patients

def add_patient_to_caregiver(caregiver_id, patient_id, relationship='caregiver'):
    """Associate a patient with a caregiver."""
    # Check if relationship already exists
    for rel in MOCK_RELATIONSHIPS:
        if rel["caregiver_id"] == caregiver_id and rel["patient_id"] == patient_id:
            # Update existing relationship
            rel["relationship"] = relationship
            return rel
    
    # Create new relationship
    new_rel = {
        "caregiver_id": caregiver_id,
        "patient_id": patient_id,
        "relationship": relationship,
        "created_at": datetime.now().isoformat()
    }
    
    MOCK_RELATIONSHIPS.append(new_rel)
    return new_rel

def get_patient_details(patient_id):
    """Get detailed information about a patient."""
    # Find patient
    patient = None
    for p in MOCK_PATIENTS:
        if p["id"] == patient_id:
            patient = p.copy()
            break
    
    if not patient:
        return None
    
    # Add medications
    patient["medications"] = get_medications(patient_id)
    
    # Add upcoming appointments
    today = datetime.now().strftime("%Y-%m-%d")
    upcoming_appointments = [
        appt for appt in MOCK_APPOINTMENTS 
        if appt["patient_id"] == patient_id and appt["date"] >= today
    ]
    patient["appointments"] = upcoming_appointments
    
    # Add mock game scores
    patient["recent_games"] = [
        {
            "id": f"score-{i+1}",
            "game_id": "game-1" if i % 2 == 0 else "game-2",
            "game_name": "Memory Match" if i % 2 == 0 else "Stroop Test",
            "score": random.randint(70, 95),
            "duration": random.randint(60, 180),
            "difficulty": "medium",
            "created_at": (datetime.now() - timedelta(days=i)).isoformat()
        }
        for i in range(5)
    ]
    
    # Add mock therapy sessions
    patient["recent_therapy"] = [
        {
            "id": f"session-{i+1}",
            "sound_id": f"sound-{(i % 3) + 1}",
            "sound_name": ["Ocean Waves", "Forest Ambience", "Rainfall"][(i % 3)],
            "duration": random.randint(300, 900),
            "created_at": (datetime.now() - timedelta(days=i)).isoformat()
        }
        for i in range(5)
    ]
    
    return patient

def get_medications(patient_id):
    """Get all medications for a patient."""
    return [med for med in MOCK_MEDICATIONS if med["patient_id"] == patient_id]

def add_medication(patient_id, name, dosage, frequency, time, notes=''):
    """Add a new medication for a patient."""
    medication = {
        "id": f"med-{len(MOCK_MEDICATIONS) + 1}",
        "patient_id": patient_id,
        "name": name,
        "dosage": dosage,
        "frequency": frequency,
        "time": time,
        "notes": notes,
        "created_at": datetime.now().isoformat()
    }
    
    MOCK_MEDICATIONS.append(medication)
    return medication

def update_medication(medication_id, data):
    """Update medication information."""
    for i, med in enumerate(MOCK_MEDICATIONS):
        if med["id"] == medication_id:
            # Update fields
            for key, value in data.items():
                if key in med and key != "id" and key != "created_at":
                    med[key] = value
            return med
    
    return {"error": "Medication not found"}

def delete_medication(medication_id):
    """Delete a medication."""
    for i, med in enumerate(MOCK_MEDICATIONS):
        if med["id"] == medication_id:
            del MOCK_MEDICATIONS[i]
            return {"success": True, "id": medication_id}
    
    return {"error": "Medication not found"}

def get_appointments(patient_id, include_past=False):
    """Get all appointments for a patient."""
    appointments = [appt for appt in MOCK_APPOINTMENTS if appt["patient_id"] == patient_id]
    
    if not include_past:
        today = datetime.now().strftime("%Y-%m-%d")
        appointments = [appt for appt in appointments if appt["date"] >= today]
    
    # Sort by date
    appointments.sort(key=lambda x: (x["date"], x["time"]))
    
    return appointments

def add_appointment(patient_id, title, date, time, location='', notes=''):
    """Add a new appointment for a patient."""
    appointment = {
        "id": f"appt-{len(MOCK_APPOINTMENTS) + 1}",
        "patient_id": patient_id,
        "title": title,
        "description": "",  # Added to match the expected structure
        "date": date,
        "time": time,
        "location": location,
        "notes": notes,
        "created_at": datetime.now().isoformat()
    }
    
    MOCK_APPOINTMENTS.append(appointment)
    return appointment

def update_appointment(appointment_id, data):
    """Update appointment information."""
    for i, appt in enumerate(MOCK_APPOINTMENTS):
        if appt["id"] == appointment_id:
            # Update fields
            for key, value in data.items():
                if key in appt and key != "id" and key != "created_at":
                    appt[key] = value
            return appt
    
    return {"error": "Appointment not found"}

def delete_appointment(appointment_id):
    """Delete an appointment."""
    for i, appt in enumerate(MOCK_APPOINTMENTS):
        if appt["id"] == appointment_id:
            del MOCK_APPOINTMENTS[i]
            return {"success": True, "id": appointment_id}
    
    return {"error": "Appointment not found"}

def get_activities(patient_id):
    """Get all activities for a patient."""
    return [act for act in MOCK_ACTIVITIES if act["patient_id"] == patient_id]

def add_activity(patient_id, type, title, description, scheduled_date, scheduled_time):
    """Add a new activity for a patient."""
    activity = {
        "id": f"act-{len(MOCK_ACTIVITIES) + 1}",
        "patient_id": patient_id,
        "type": type,
        "title": title,
        "description": description,
        "scheduled_date": scheduled_date,
        "scheduled_time": scheduled_time,
        "completed": False,
        "completion_date": None,
        "completion_time": None,
        "notes": None,
        "created_at": datetime.now().isoformat()
    }
    
    MOCK_ACTIVITIES.append(activity)
    return activity

def complete_activity(activity_id, completion_date, completion_time, notes=None):
    """Mark an activity as completed."""
    for i, act in enumerate(MOCK_ACTIVITIES):
        if act["id"] == activity_id:
            act["completed"] = True
            act["completion_date"] = completion_date
            act["completion_time"] = completion_time
            act["notes"] = notes
            return act
    
    return {"error": "Activity not found"}

def delete_activity(activity_id):
    """Delete an activity."""
    for i, act in enumerate(MOCK_ACTIVITIES):
        if act["id"] == activity_id:
            del MOCK_ACTIVITIES[i]
            return {"success": True}
    
    return {"error": "Activity not found"}

def get_notes(patient_id):
    """Get all notes for a patient."""
    return [note for note in MOCK_NOTES if note["patient_id"] == patient_id]

def add_note(patient_id, content, ai_insights=None, note_type="observation"):
    """Add a new note for a patient."""
    now = datetime.now().isoformat()
    new_note = {
        "id": f"note-{len(MOCK_NOTES) + 1}",
        "patient_id": patient_id,
        "content": content,
        "ai_insights": ai_insights or "",
        "note_type": note_type,
        "created_at": now,
        "updated_at": now
    }
    
    MOCK_NOTES.append(new_note)
    return new_note

def update_note(note_id, updates):
    """Update a note."""
    for note in MOCK_NOTES:
        if note["id"] == note_id:
            for key, value in updates.items():
                if key in note and key != "id" and key != "patient_id" and key != "created_at":
                    note[key] = value
            
            note["updated_at"] = datetime.now().isoformat()
            return note
    
    return None

def get_patient_progress(patient_id):
    """Get progress data for a patient."""
    return [progress for progress in MOCK_PROGRESS if progress["patient_id"] == patient_id]

def add_progress_entry(patient_id, game_name, score, duration, difficulty, improvements=None, notes=None):
    """Add a new progress entry for a patient."""
    new_entry = {
        "id": f"progress-{len(MOCK_PROGRESS) + 1}",
        "patient_id": patient_id,
        "game_name": game_name,
        "score": score,
        "duration": duration,
        "difficulty": difficulty,
        "date": datetime.now().isoformat(),
        "improvements": improvements or [],
        "notes": notes or ""
    }
    
    MOCK_PROGRESS.append(new_entry)
    return new_entry

def get_mood_tracking(patient_id):
    """Get mood tracking data for a patient."""
    return [entry for entry in MOCK_MOOD_ENTRIES if entry["patient_id"] == patient_id]

def add_mood_entry(patient_id, mood, notes=None, symptoms=None, factors=None):
    """Add a new mood entry for a patient."""
    new_entry = {
        "id": f"mood-{len(MOCK_MOOD_ENTRIES) + 1}",
        "patient_id": patient_id,
        "mood": mood,
        "timestamp": datetime.now().isoformat(),
        "notes": notes or "",
        "symptoms": symptoms or [],
        "factors": factors or []
    }
    
    MOCK_MOOD_ENTRIES.append(new_entry)
    return new_entry

def get_patient_dashboard(patient_id):
    """Get dashboard data for a patient."""
    patient = get_patient_details(patient_id)
    if not patient:
        return {"error": "Patient not found"}
    
    # Get upcoming appointments
    upcoming_appointments = get_appointments(patient_id)
    
    # Get medications
    medications = get_medications(patient_id)
    
    # Get recent activities
    activities = get_activities(patient_id)
    activities.sort(key=lambda x: x["created_at"], reverse=True)
    
    # Get recent notes
    notes = get_notes(patient_id)
    notes.sort(key=lambda x: x["created_at"], reverse=True)
    
    return {
        "patient": patient,
        "upcoming_appointments": upcoming_appointments[:3],
        "medications": medications,
        "recent_activities": activities[:5],
        "recent_notes": notes[:3]
    } 