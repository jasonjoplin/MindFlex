import sys
import os

# Add the current directory to the Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Import the app from app.py, not from the app package
from app import app

if __name__ == "__main__":
    app.run() 