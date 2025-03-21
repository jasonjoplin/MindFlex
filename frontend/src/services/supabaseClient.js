import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials. Make sure REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY are set in .env');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper function to handle API errors
export const handleApiError = (error) => {
  console.error('API Error:', error);
  return {
    error: true,
    message: error.message || 'An unexpected error occurred',
  };
};

// Helper function to get authenticated user
export const getUser = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error) {
    return { user: null, error };
  }
  
  return { user: session?.user || null, error: null };
};

// Helper function to get user profile
export const getUserProfile = async (userId, userType = 'patient') => {
  const table = userType === 'patient' ? 'patients' : 'caregivers';
  
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) {
    return { profile: null, error };
  }
  
  return { profile: data, error: null };
};