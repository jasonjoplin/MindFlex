import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../utils/supabaseClient';

// Create the auth context
export const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

// Provider component to wrap around the app
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to sign up a new user
  const signUp = async (email, password, userData = {}) => {
    try {
      setError(null);
      console.log('Starting signup process with:', { email, userData });
      
      // Create the auth user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData, // Additional user data like name, etc.
        },
      });

      if (error) {
        console.error('Supabase auth signup error:', error);
        return { data: null, error };
      }
      
      // Ensure data is not undefined before returning
      return { 
        data: data || { user: null },
        error: null 
      };
    } catch (error) {
      console.error('Signup process error:', error);
      setError(error.message);
      return { data: null, error };
    }
  };

  // Function to sign in a user
  const signIn = async (email, password) => {
    try {
      setError(null);
      
      // Log detailed information for debugging
      console.log('AuthContext: Starting login process for', email);
      
      // Validate input
      if (!email || !password) {
        const errorMessage = `Missing ${!email ? 'email' : 'password'} for sign in`;
        console.error('AuthContext: Input validation error -', errorMessage);
        setError(errorMessage);
        return { 
          data: null, 
          error: { message: errorMessage } 
        };
      }
      
      // Sign in with Supabase
      console.log('AuthContext: Calling Supabase auth.signInWithPassword');
      const response = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      console.log('AuthContext: Received response from Supabase auth:', response);
      
      // Extract data and error from response
      const { data, error } = response;
      
      // Handle authentication errors
      if (error) {
        console.error('AuthContext: Supabase auth returned error:', error);
        setError(error.message || 'Authentication failed');
        return { data: null, error };
      }
      
      // Check for missing user data
      if (!data || !data.user) {
        const errorMessage = 'No user data returned from authentication';
        console.error('AuthContext:', errorMessage);
        setError(errorMessage);
        return { 
          data: null, 
          error: { message: errorMessage } 
        };
      }
      
      // Success case - user authenticated
      console.log('AuthContext: User authenticated successfully:', data.user.id);
      return { data, error: null };
    } catch (error) {
      // Handle unexpected errors
      const errorMessage = error?.message || 'An unexpected error occurred during sign in';
      console.error('AuthContext: Unexpected error:', error);
      setError(errorMessage);
      return { 
        data: null, 
        error: { message: errorMessage }
      };
    }
  };

  // Function to sign out
  const signOut = async () => {
    try {
      setError(null);
      
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error) {
      setError(error.message);
      return { error };
    }
  };

  // Function to reset password
  const resetPassword = async (email) => {
    try {
      setError(null);
      
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      setError(error.message);
      return { data: null, error };
    }
  };

  // Function to update user data
  const updateProfile = async (userData) => {
    try {
      setError(null);
      
      const { data, error } = await supabase.auth.updateUser({
        data: userData,
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      setError(error.message);
      return { data: null, error };
    }
  };

  // Effect to handle auth state changes
  useEffect(() => {
    // Initial session check
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user || null);
        if (error) {
          setError(error.message);
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Set up listener for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user || null);
        setLoading(false);
      }
    );

    // Clean up subscription on unmount
    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  // Value to be provided to consumers
  const value = {
    user,
    session,
    loading,
    error,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading ? children : (
        <div className="auth-loading">Loading authentication...</div>
      )}
    </AuthContext.Provider>
  );
};

export default AuthProvider; 