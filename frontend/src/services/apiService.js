import axios from 'axios';
import { supabase } from '../utils/supabaseClient';

// Create axios instance with base URL
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
});

// Add auth token to requests
api.interceptors.request.use(async (config) => {
  // Use Supabase authentication
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  
  return config;
});

// Game API functions
export const gameApi = {
  // Get all games
  getGames: async () => {
    try {
      // Use URL without trailing slash to avoid redirect issues with CORS
      const response = await api.get('/games');
      return response.data;
    } catch (error) {
      console.error('Error fetching games:', error);
      throw error;
    }
  },
  
  // Get game by ID
  getGameById: async (gameId) => {
    try {
      const response = await api.get(`/games/${gameId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching game ${gameId}:`, error);
      throw error;
    }
  },
  
  // Log game score
  logScore: async (scoreData) => {
    try {
      const response = await api.post('/games/log-score', scoreData);
      return response.data;
    } catch (error) {
      console.error('Error logging score:', error);
      throw error;
    }
  },
  
  // Get user game history
  getGameHistory: async (patientId) => {
    try {
      const response = await api.get(`/games/history/${patientId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching game history:', error);
      throw error;
    }
  },
  
  // Get game analytics
  getAnalytics: async (patientId, gameType, timePeriod) => {
    try {
      const response = await api.get(`/games/analytics/${patientId}`, {
        params: { game_type: gameType, time_period: timePeriod }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching analytics:', error);
      throw error;
    }
  },
};

// Sound therapy API functions
export const therapyApi = {
  // Get all sound categories
  getCategories: async () => {
    try {
      const response = await api.get('/therapy/categories');
      return response.data;
    } catch (error) {
      console.error('Error fetching therapy categories:', error);
      throw error;
    }
  },
  
  // Get sounds by category
  getSoundsByCategory: async (categoryId) => {
    try {
      const response = await api.get(`/therapy/sounds/${categoryId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching sounds for category ${categoryId}:`, error);
      throw error;
    }
  },
  
  // Get sound by ID
  getSoundById: async (soundId) => {
    try {
      const response = await api.get(`/therapy/sound/${soundId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching sound ${soundId}:`, error);
      throw error;
    }
  },
  
  // Get recommended sounds
  getRecommendations: async (userId, mood) => {
    try {
      const response = await api.get('/therapy/recommendations', {
        params: { user_id: userId, mood }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      throw error;
    }
  },
  
  // Log sound therapy session
  logSession: async (sessionData) => {
    try {
      const response = await api.post('/therapy/log-session', sessionData);
      return response.data;
    } catch (error) {
      console.error('Error logging therapy session:', error);
      throw error;
    }
  },
};

// Caregiver API functions
export const caregiverApi = {
  // Get patients by caregiver
  getPatients: async (caregiverId) => {
    try {
      const response = await api.get(`/caregiver/patients/${caregiverId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching patients:', error);
      throw error;
    }
  },
  
  // Add patient to caregiver
  addPatient: async (data) => {
    try {
      const response = await api.post('/caregiver/add-patient', data);
      return response.data;
    } catch (error) {
      console.error('Error adding patient:', error);
      throw error;
    }
  },
  
  // Get patient details
  getPatientDetails: async (patientId) => {
    try {
      const response = await api.get(`/caregiver/patient/${patientId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching patient ${patientId}:`, error);
      throw error;
    }
  },
  
  // Medication management
  getMedications: async (patientId) => {
    try {
      const response = await api.get(`/caregiver/medications/${patientId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching medications:', error);
      throw error;
    }
  },
  
  addMedication: async (medicationData) => {
    try {
      const response = await api.post('/caregiver/medication', medicationData);
      return response.data;
    } catch (error) {
      console.error('Error adding medication:', error);
      throw error;
    }
  },
  
  updateMedication: async (medicationId, medicationData) => {
    try {
      const response = await api.put(`/caregiver/medication/${medicationId}`, medicationData);
      return response.data;
    } catch (error) {
      console.error('Error updating medication:', error);
      throw error;
    }
  },
  
  deleteMedication: async (medicationId) => {
    try {
      const response = await api.delete(`/caregiver/medication/${medicationId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting medication:', error);
      throw error;
    }
  },
  
  // Appointment management
  getAppointments: async (patientId) => {
    try {
      const response = await api.get(`/caregiver/appointments/${patientId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching appointments:', error);
      throw error;
    }
  },
  
  addAppointment: async (appointmentData) => {
    try {
      const response = await api.post('/caregiver/appointment', appointmentData);
      return response.data;
    } catch (error) {
      console.error('Error adding appointment:', error);
      throw error;
    }
  },
  
  updateAppointment: async (appointmentId, appointmentData) => {
    try {
      const response = await api.put(`/caregiver/appointment/${appointmentId}`, appointmentData);
      return response.data;
    } catch (error) {
      console.error('Error updating appointment:', error);
      throw error;
    }
  },
  
  deleteAppointment: async (appointmentId) => {
    try {
      const response = await api.delete(`/caregiver/appointment/${appointmentId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting appointment:', error);
      throw error;
    }
  },
  
  // AI Patient Analysis
  analyzePatient: async (patientId) => {
    try {
      const response = await api.get(`/caregiver/analyze-patient/${patientId}`);
      return response.data;
    } catch (error) {
      console.error('Error analyzing patient:', error);
      throw error;
    }
  },
  
  // AI Daily Care Plan
  generateDailyPlan: async (patientId, caregiverConstraints) => {
    try {
      const response = await api.post(`/caregiver/daily-plan/${patientId}`, { caregiver_constraints: caregiverConstraints });
      return response.data;
    } catch (error) {
      console.error('Error generating daily plan:', error);
      throw error;
    }
  },
  
  // Notes management
  getNotes: async (patientId) => {
    try {
      const response = await api.get(`/caregiver/notes/${patientId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching notes:', error);
      throw error;
    }
  },
  
  addNote: async (noteData) => {
    try {
      const response = await api.post('/caregiver/note', noteData);
      return response.data;
    } catch (error) {
      console.error('Error adding note:', error);
      throw error;
    }
  },
  
  // Mood tracking
  getMoodTracking: async (patientId) => {
    try {
      const response = await api.get(`/caregiver/mood-tracking/${patientId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching mood tracking:', error);
      throw error;
    }
  },
  
  addMoodEntry: async (moodData) => {
    try {
      const response = await api.post('/caregiver/mood-entry', moodData);
      return response.data;
    } catch (error) {
      console.error('Error adding mood entry:', error);
      throw error;
    }
  },
  
  // AI Recommendations
  getRecommendations: async (patientId) => {
    try {
      const response = await api.get(`/caregiver/recommendations/${patientId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      throw error;
    }
  },
  
  // Progress tracking
  getPatientProgress: async (patientId) => {
    try {
      const response = await api.get(`/caregiver/progress/${patientId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching patient progress:', error);
      throw error;
    }
  },
  
  addProgressEntry: async (progressData) => {
    try {
      const response = await api.post('/caregiver/progress', progressData);
      return response.data;
    } catch (error) {
      console.error('Error adding progress entry:', error);
      throw error;
    }
  },
  
  // Save conversation to Supabase
  async saveConversation(conversation) {
    try {
      const { caregiver_id, patient_id, title, messages } = conversation;
      
      // First create the conversation entry
      const { data: conversationData, error: conversationError } = await supabase
        .from('caregiver_conversations')
        .insert({
          caregiver_id,
          patient_id,
          title,
          updated_at: new Date().toISOString()
        })
        .select('id')
        .single();
      
      if (conversationError) throw conversationError;
      
      // Then save all messages
      const messagesWithConversationId = messages.map(msg => ({
        conversation_id: conversationData.id,
        sender: msg.sender,
        message: msg.text,
        timestamp: msg.timestamp
      }));
      
      const { error: messagesError } = await supabase
        .from('conversation_messages')
        .insert(messagesWithConversationId);
      
      if (messagesError) throw messagesError;
      
      return { success: true, conversationId: conversationData.id };
    } catch (error) {
      console.error('Error saving conversation:', error);
      return { success: false, error };
    }
  },
  
  // Get conversation by ID
  async getConversation(conversationId) {
    try {
      // Get conversation details
      const { data: conversation, error: conversationError } = await supabase
        .from('caregiver_conversations')
        .select('*')
        .eq('id', conversationId)
        .single();
      
      if (conversationError) throw conversationError;
      
      // Get all messages for this conversation
      const { data: messages, error: messagesError } = await supabase
        .from('conversation_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('timestamp', { ascending: true });
      
      if (messagesError) throw messagesError;
      
      return {
        ...conversation,
        messages: messages.map(msg => ({
          id: msg.id,
          text: msg.message,
          sender: msg.sender,
          timestamp: msg.timestamp
        }))
      };
    } catch (error) {
      console.error('Error getting conversation:', error);
      return null;
    }
  },
  
  // Get all conversations for a caregiver
  async getCaregiverConversations(caregiverId, patientId = null) {
    try {
      let query = supabase
        .from('caregiver_conversations')
        .select('*')
        .eq('caregiver_id', caregiverId)
        .order('updated_at', { ascending: false });
      
      // Filter by patient if specified
      if (patientId) {
        query = query.eq('patient_id', patientId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error getting caregiver conversations:', error);
      return [];
    }
  },
  
  // Get patient context for AI assistance
  async getPatientContext(patientId) {
    try {
      const { data, error } = await supabase
        .from('patient_context')
        .select('*')
        .eq('patient_id', patientId);
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error getting patient context:', error);
      return [];
    }
  }
}; 