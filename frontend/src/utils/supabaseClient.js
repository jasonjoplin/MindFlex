import { createClient } from '@supabase/supabase-js';

// Get Supabase credentials from environment variables with fallbacks for GitHub Pages
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://pwcrdvhkscairmkwtvmi.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3Y3Jkdmhrc2NhaXJta3d0dm1pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA5NDE5OTcsImV4cCI6MjA1NjUxNzk5N30.Tv0LkOuXA0Rk9eM_AnSFz5NBsaezzupg03W0Iw5TWz4';

// Backend API URL for proxy - Ensure consistent formatting without trailing slash
const backendUrlRaw = process.env.REACT_APP_API_URL || 'https://mindflex-backend.onrender.com';

// Normalize the URL: remove trailing slashes and /api suffix
let backendUrl = backendUrlRaw;
if (backendUrl.endsWith('/')) {
  backendUrl = backendUrl.slice(0, -1);
}
if (backendUrl.endsWith('/api')) {
  backendUrl = backendUrl.slice(0, -4);
}

// Check if credentials are available
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials. Make sure REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY are set in .env');
}

// Development flag - set to false to use real Supabase
const DEVELOPMENT_MODE = false;

// Log credentials status (for debugging)
console.log('Supabase URL configured:', !!supabaseUrl);
console.log('Supabase Key configured:', !!supabaseAnonKey);
console.log('Backend URL for proxy (original):', backendUrlRaw);
console.log('Backend URL for proxy (normalized):', backendUrl);

// Check if we're running in production (GitHub Pages or other non-localhost)
const isProduction = window.location.hostname !== 'localhost' && 
                      window.location.hostname !== '127.0.0.1';

// Custom fetch function to route Supabase requests through our proxy
const customFetch = async (url, options) => {
  try {
    // Determine if this is an auth request or a REST API request
    const isAuthRequest = url.includes('/auth/v1/');
    const isRestRequest = url.includes('/rest/v1/');
    
    if ((isAuthRequest || isRestRequest) && isProduction) {
      // Extract the path from the URL (everything after /auth/v1/ or /rest/v1/)
      const urlObj = new URL(url);
      const pathMatch = urlObj.pathname.match(/\/(auth|rest)\/v1\/(.*)/);
      
      if (!pathMatch) {
        console.error('Could not parse Supabase path from URL:', url);
        return fetch(url, options); // Fall back to direct request
      }
      
      const apiType = pathMatch[1]; // 'auth' or 'rest'
      const subPath = pathMatch[2] || ''; // Everything after /v1/
      
      // Build the proxy URL - Ensure consistent path structure
      let proxyUrl = `${backendUrl}/api/${apiType}/v1/${subPath}`;
      
      // Include query parameters
      if (urlObj.search) {
        proxyUrl += urlObj.search;
      }
      
      console.log(`Routing ${apiType} request through proxy:`, proxyUrl);
      
      // Keep all the original request options
      return fetch(proxyUrl, options);
    }
    
    // For non-production or non-auth/rest requests, use direct Supabase API
    return fetch(url, options);
  } catch (error) {
    console.error('Error in customFetch:', error);
    // Fall back to original fetch
    return fetch(url, options);
  }
};

// Create and export the Supabase client
export const supabase = createClient(
  supabaseUrl, 
  supabaseAnonKey, 
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    },
    global: {
      fetch: customFetch
    }
  }
);

// Test the connection (immediately executed)
(async function testConnection() {
  try {
    console.log('Testing Supabase connection...');
    
    // Skip direct API health check in production to avoid CORS issues
    if (!isProduction) {
      // Only run this in development environments
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
    } else {
      console.log('Using proxy for Supabase requests in production environment');
      
      // Test the health endpoint with consistent format
      try {
        const response = await fetch(`${backendUrl}/api/health`, {
          method: 'GET'
        });
        
        if (response.ok) {
          console.log('Backend API is accessible');
        } else {
          console.error('Backend API check failed with status:', response.status);
        }
      } catch (proxyError) {
        console.error('Backend API check failed:', proxyError);
      }
    }
    
    // Check auth status using the Supabase client (works in all environments)
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