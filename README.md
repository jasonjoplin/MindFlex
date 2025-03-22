# MindFlex: Cognitive Training Platform

MindFlex is a comprehensive cognitive training platform designed to provide engaging brain exercises, personalized therapy, and caregiver support for those experiencing cognitive decline.

## Features

- **Brain Training Games**: Multiple cognitive games targeting different brain functions
  - Memory Match
  - Pattern Memory
  - Math Challenge
  - Reaction Speed
  - Word Scramble

- **Sound Therapy**: Customized sound therapies for relaxation and cognitive stimulation

- **Personalized Dashboard**: Track progress and achievements through a personalized user dashboard

- **Caregiver Support Tools**:
  - AI Care Assistant for personalized care advice
  - Reminder system for medication and activities
  - Progress tracking

- **Cognitive Assessment**: Evaluate and track cognitive abilities over time

## Technology Stack

- **Frontend**: React, Material-UI
- **Backend**: Flask, Python
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Python 3.7+
- Supabase account and project

### Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

### Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start development server
python app.py
```

### Environment Configuration
Create a `.env` file in the frontend directory with:
```
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
REACT_APP_API_URL=http://localhost:5000
```

## Usage

1. Register a new account or sign in with existing credentials
2. Navigate to the games section to start cognitive training
3. View progress in the personalized dashboard
4. Caregivers can access the dedicated caregiver tools for patient management

## License

[MIT License](LICENSE)

## Contact

Project created by Jason Joplin 