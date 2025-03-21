import { createClient } from '@supabase/supabase-js';

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://pwcrdvhkscairmkwtvmi.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3Y3Jkdmhrc2NhaXJta3d0dm1pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTUzMDcxNzUsImV4cCI6MjAzMDg4MzE3NX0.DRo4QMcj8Ld4cFZSTxK4nCPFFbH0fz7MFFRiSXBwblw';

// Log for debugging
console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Anon Key configured:', supabaseAnonKey ? 'Yes' : 'No');

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