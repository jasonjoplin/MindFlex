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
- **Local Development Environment**: Docker, Docker Compose

## Local Development Setup (Recommended)

This project supports a Dockerized local Supabase instance, which is the recommended way to set up your development environment for consistency and ease of use.

### Prerequisites for Local Supabase Setup
- **Docker**: Ensure Docker Desktop or Docker Engine is installed and running. ([Install Docker](https://docs.docker.com/get-docker/))
- **Git**: For cloning the repository.

### 1. Setting up and Running Local Supabase
The local Supabase environment is managed via Docker Compose using the configuration in the `supabase_docker/` directory.

1.  **Navigate to the Supabase Docker directory:**
    ```bash
    cd supabase_docker
    ```

2.  **Create your environment file:**
    Copy the example environment file to a new `.env` file:
    ```bash
    cp .env.example .env
    ```

3.  **Review and Update `.env` (Optional for Basic Setup):**
    The provided `supabase_docker/.env.example` (copied to `.env`) contains default values suitable for local development (e.g., `POSTGRES_PASSWORD`, `JWT_SECRET`, dummy API keys). For basic local setup, you usually don't need to change these initial values. **Do not use these default secrets in a production environment.**
    The `SITE_URL` and `SUPABASE_PUBLIC_URL` are pre-configured to `http://localhost:8000`.

4.  **Start Supabase Services:**
    Run the following command to build and start all Supabase services (database, auth, storage, Kong gateway, Studio, etc.) in detached mode:
    ```bash
    docker-compose up -d
    ```
    This might take a few minutes the first time as Docker images are downloaded.

5.  **Accessing Supabase Studio:**
    Once the services are running, you can access the local Supabase Studio (a GUI for managing your database and services) at:
    [http://localhost:3000](http://localhost:3000) (or the `STUDIO_PORT` defined in `supabase_docker/.env`).
    Log in with the default Studio credentials (if unchanged in `.env`):
    - **Organization**: `Default Organization`
    - **Project**: `Default Project`
    - **Username**: `supabase`
    - **Password**: `this_password_is_insecure_and_should_be_updated` (as per `DASHBOARD_PASSWORD` in `.env`)

    The database schema (including tables from `supabase_docker/volumes/db/app_schema/`) will be automatically applied when the database container starts for the first time.

    **Note on Database Schema:** The local Supabase setup now initializes with a comprehensive database schema, including tables for all major application features (user profiles, roles, caregiver/patient interactions, games, therapy content, chat, etc.) and detailed Role-Level Security (RLS) policies. Developers can inspect the SQL scripts in the `supabase_docker/volumes/db/app_schema/` directory to understand the table structures and RLS rules.

### 2. Configuring Your Application to Use Local Supabase

#### Frontend Configuration:
1.  Navigate to the `frontend/` directory.
2.  Create a `.env` file if it doesn't exist.
3.  Add the following environment variables, pointing to your local Supabase instance:
    ```env
    REACT_APP_SUPABASE_URL=http://localhost:8000
    REACT_APP_SUPABASE_ANON_KEY=your-local-supabase-anon-key-from-supabase_docker/.env
    REACT_APP_API_URL=http://localhost:5000 # URL for your local backend
    ```
    - Replace `your-local-supabase-anon-key-from-supabase_docker/.env` with the actual `ANON_KEY` value from your `supabase_docker/.env` file.

#### Backend Configuration:
1.  Navigate to the `backend/` directory.
2.  Create a `.env` file by copying the template:
    ```bash
    cp .env.template .env
    ```
3.  Update your `backend/.env` file. The relevant lines for local Supabase (already configured in `.env.template`) are:
    ```env
    SUPABASE_URL=http://localhost:8000
    SUPABASE_KEY=your-local-supabase-service-role-key-from-supabase_docker/.env
    ```
    - Replace `your-local-supabase-service-role-key-from-supabase_docker/.env` with the actual `SERVICE_ROLE_KEY` value from your `supabase_docker/.env` file.
    - The `backend/.env.template` file provides more detailed comments on configuring for local vs. deployed Supabase instances.
    - **Note on `backend/.env.example`**: This file also exists but might be less current or provide different example values. For local Supabase setup, `backend/.env.template` is the recommended starting point for your `backend/.env` file.

### 3. Running the Full Application Stack

1.  **Ensure Local Supabase is Running:**
    (If you haven't already, from `supabase_docker/` directory: `docker-compose up -d`)

2.  **Start the Backend Server:**
    - Navigate to the `backend/` directory.
    - Create/activate a Python virtual environment:
      ```bash
      python -m venv venv
      # On Windows: venv\Scripts\activate
      # On macOS/Linux: source venv/bin/activate
      ```
    - Install dependencies:
      ```bash
      pip install -r requirements.txt
      ```
    - Start the Flask development server (ensure your `backend/.env` is configured):
      ```bash
      python app.py
      ```
    The backend usually runs on port 5000.

3.  **Start the Frontend Development Server:**
    - Navigate to the `frontend/` directory.
    - Install dependencies:
      ```bash
      npm install
      ```
    - Start the React development server (ensure your `frontend/.env` is configured):
      ```bash
      npm start
      ```
    The frontend usually runs on port 3000 and will open in your browser.

### Basic Testing for Local Supabase Integration
1.  **Frontend Registration/Login:** Try registering a new user through the frontend application. This should create a user in your local Supabase Auth service. You can verify this in Supabase Studio under "Authentication" -> "Users".
2.  **Data Interaction:** If parts of the application interact with the database (e.g., saving game scores, user profiles), test these features. Data should appear in the respective tables in your local Supabase database (viewable via Studio).
3.  **API Calls:** Ensure the frontend can communicate with the backend, and the backend can communicate with the local Supabase instance.

### Stopping Local Supabase
To stop the local Supabase services:
```bash
cd supabase_docker
docker-compose down
```
To stop and remove volumes (deletes all local Supabase data):
```bash
cd supabase_docker
docker-compose down -v
```

## Alternative: Manual Setup (Without Dockerized Supabase)

If you prefer to use a cloud-hosted Supabase instance or manage your Supabase services manually:

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Python 3.7+
- A Supabase project (e.g., from [app.supabase.com](https://app.supabase.com/))

### Frontend Setup
```bash
# Navigate to frontend directory
cd frontend
npm install
# Create .env file with your cloud Supabase URL and Anon Key
# REACT_APP_SUPABASE_URL=your_cloud_supabase_url
# REACT_APP_SUPABASE_ANON_KEY=your_cloud_supabase_anon_key
# REACT_APP_API_URL=http://localhost:5000 # Or your deployed backend URL
npm start
```

### Backend Setup
```bash
# Navigate to backend directory
cd backend
python -m venv venv
# Activate: venv\Scripts\activate (Windows) or source venv/bin/activate (macOS/Linux)
pip install -r requirements.txt
# Create .env file using .env.template as a guide,
# ensuring SUPABASE_URL and SUPABASE_KEY point to your cloud Supabase project's API URL and SERVICE ROLE KEY.
python app.py
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