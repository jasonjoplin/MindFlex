import os
import sys
import importlib.util

# Get the absolute path to the app.py file
app_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'app.py')

# Load app.py as a module
spec = importlib.util.spec_from_file_location("app_module", app_path)
app_module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(app_module)

# Get the Flask application object
app = app_module.app

# For local testing
if __name__ == "__main__":
    app.run() 