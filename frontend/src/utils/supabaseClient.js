import { createClient } from '@supabase/supabase-js';

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Check if credentials are available
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials. Make sure REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY are set in .env');
}

// Development flag - set to false to use real Supabase
const DEVELOPMENT_MODE = false;

// Create and export the Supabase client
export const supabase = createClient(
  supabaseUrl, 
  supabaseAnonKey, 
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
);

// Test the connection (immediately executed)
(async function testConnection() {
  try {
    console.log('Testing Supabase connection...');
    
    // Check authentication endpoint availability
    try {
      const response = await fetch(`${supabaseUrl}/auth/v1/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseAnonKey
        }
      });
      
      if (response.ok) {
        console.log('Supabase auth endpoint is accessible');
      } else {
        console.error('Supabase auth endpoint check failed with status:', response.status);
      }
    } catch (authError) {
      console.error('Supabase auth endpoint check failed:', authError);
    }
    
    // Check auth status manually
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Supabase get session failed:', error);
      } else {
        console.log('Supabase auth session check successful', data ? 'with session data' : 'but no active session');
      }
    } catch (sessionError) {
      console.error('Supabase session check error:', sessionError);
    }
    
    console.log('Supabase connection test completed');
  } catch (err) {
    console.error('Failed to test Supabase connection:', err);
  }
})();

// Helper function for development mode
export const isDevelopmentMode = () => DEVELOPMENT_MODE;

export default supabase; 