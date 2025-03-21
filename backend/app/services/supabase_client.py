import os
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Supabase configuration
SUPABASE_URL = os.environ.get('SUPABASE_URL')
SUPABASE_KEY = os.environ.get('SUPABASE_KEY')

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Supabase credentials not found. Make sure SUPABASE_URL and SUPABASE_KEY are set in .env")

class SupabaseClient:
    def __init__(self, url=SUPABASE_URL, key=SUPABASE_KEY):
        self.url = url
        self.key = key
        self.headers = {
            "apikey": key,
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json"
        }
    
    def _build_url(self, path):
        """Build a full URL for the Supabase REST API."""
        return f"{self.url}/rest/v1/{path}"
    
    def from_table(self, table):
        """Initialize a table query."""
        return SupabaseTable(self, table)
    
    def auth_admin_user_sign_in(self, email, password):
        """Admin sign in using the Supabase Auth API."""
        auth_url = f"{self.url}/auth/v1/token?grant_type=password"
        payload = {
            "email": email,
            "password": password
        }
        
        response = requests.post(auth_url, json=payload, headers=self.headers)
        return response.json()
    
    def verify_jwt(self, token):
        """Verify a JWT token using the Supabase Auth API."""
        auth_url = f"{self.url}/auth/v1/user"
        headers = {
            "apikey": self.key,
            "Authorization": f"Bearer {token}"
        }
        
        response = requests.get(auth_url, headers=headers)
        if response.status_code == 200:
            return response.json()
        return None

class SupabaseTable:
    def __init__(self, client, table):
        self.client = client
        self.table = table
        self.query_params = []
    
    def select(self, columns="*"):
        """Select columns from the table."""
        self.query_params.append(f"select={columns}")
        return self
    
    def eq(self, column, value):
        """Add an equals filter."""
        self.query_params.append(f"{column}=eq.{value}")
        return self
    
    def order(self, column, ascending=True):
        """Order results by a column."""
        direction = "asc" if ascending else "desc"
        self.query_params.append(f"order={column}.{direction}")
        return self
    
    def limit(self, count):
        """Limit the number of results."""
        self.query_params.append(f"limit={count}")
        return self
    
    def execute(self):
        """Execute the query and return results."""
        url = self.client._build_url(self.table)
        if self.query_params:
            url += "?" + "&".join(self.query_params)
        
        response = requests.get(url, headers=self.client.headers)
        if response.status_code == 200:
            return response.json()
        else:
            raise Exception(f"Query failed: {response.text}")
    
    def insert(self, data):
        """Insert data into the table."""
        url = self.client._build_url(self.table)
        response = requests.post(url, json=data, headers=self.client.headers)
        
        if response.status_code in [200, 201]:
            return response.json()
        else:
            raise Exception(f"Insert failed: {response.text}")
    
    def update(self, data):
        """Update data in the table (must be used with filters like eq)."""
        url = self.client._build_url(self.table)
        if self.query_params:
            url += "?" + "&".join(self.query_params)
        
        response = requests.patch(url, json=data, headers=self.client.headers)
        
        if response.status_code == 200:
            return response.json()
        else:
            raise Exception(f"Update failed: {response.text}")
    
    def delete(self):
        """Delete records (must be used with filters like eq)."""
        url = self.client._build_url(self.table)
        if self.query_params:
            url += "?" + "&".join(self.query_params)
        
        response = requests.delete(url, headers=self.client.headers)
        
        if response.status_code == 200:
            return response.json()
        else:
            raise Exception(f"Delete failed: {response.text}")

# Initialize the Supabase client
supabase = SupabaseClient() 