import { supabase } from '../utils/supabaseClient';

// Mock data for games
const mockGames = [
  {
    id: '1',
    name: 'Memory Match',
    type: 'memory',
    description: 'Test and improve your visual memory by matching pairs of cards.',
    thumbnail: '/assets/games/memory-match.jpg',
    difficulty_levels: ['Easy', 'Medium', 'Hard'],
    avg_duration_seconds: 180,
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Word Scramble',
    type: 'word',
    description: 'Unscramble letters to form words and improve your verbal cognitive abilities.',
    thumbnail: '/assets/games/word-scramble.jpg',
    difficulty_levels: ['Easy', 'Medium', 'Hard'],
    avg_duration_seconds: 240,
    created_at: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Pattern Memory',
    type: 'pattern',
    description: 'Remember and reproduce increasingly complex patterns to enhance visual-spatial memory.',
    thumbnail: '/assets/games/pattern-memory.jpg',
    difficulty_levels: ['Easy', 'Medium', 'Hard'],
    avg_duration_seconds: 210,
    created_at: new Date().toISOString(),
  },
  {
    id: '4',
    name: 'Math Challenge',
    type: 'math',
    description: 'Solve math problems quickly to improve processing speed and numerical reasoning.',
    thumbnail: '/assets/games/math-challenge.jpg',
    difficulty_levels: ['Easy', 'Medium', 'Hard'],
    avg_duration_seconds: 300,
    created_at: new Date().toISOString(),
  },
  {
    id: '5',
    name: 'Reaction Speed',
    type: 'reflex',
    description: 'Test and improve your reaction time with this fast-paced clicking game.',
    thumbnail: '/assets/games/reaction-speed.jpg',
    difficulty_levels: ['Easy', 'Medium', 'Hard'],
    avg_duration_seconds: 120,
    created_at: new Date().toISOString(),
  },
];

// Fetching games from the database
const getGames = async () => {
  try {
    const { data, error } = await supabase.from('games').select('*');
    
    if (error) {
      console.error('Error fetching games:', error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      console.warn('No games found in database');
      throw new Error('No games found');
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Error in getGames:', error);
    throw error;
  }
};

// Get a specific game by ID
const getGameById = async (id) => {
  try {
    const { data, error } = await supabase.from('games').select('*').eq('id', id).single();
    
    if (error) {
      console.error(`Error fetching game ${id}:`, error);
      throw error;
    }
    
    if (!data) {
      console.error(`Game with ID ${id} not found`);
      throw new Error(`Game not found: ${id}`);
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Error in getGameById:', error);
    throw error;
  }
};

// Submit a game score
const submitScore = async (scoreData) => {
  try {
    console.log('Score data received:', scoreData); // Debug
    
    // Extract and map fields with extra logging
    const { errors, gameId, gameName, gameType, id, ...rest } = scoreData;
    
    // Get the current user session
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;
    
    if (!userId) {
      throw new Error('User is not authenticated');
    }
    
    // Determine which field to use for game_id (some components might use id instead of gameId)
    const actualGameId = gameId || id;
    
    console.log('Using game ID:', actualGameId); // Debug
    
    if (!actualGameId) {
      console.error('No game ID found in score data:', scoreData);
      throw new Error('Game ID is required but was not provided');
    }
    
    // Create a properly formatted data object with snake_case keys for the DB
    const formattedScoreData = {
      user_id: userId,
      game_id: actualGameId,
      game_name: gameName || 'Unknown Game',
      game_type: gameType || 'unknown',
      ...rest,
      metadata: {
        ...(rest.metadata || {}),
        original_score_data: JSON.stringify(scoreData) // Store original for debugging
      }
    };
    
    console.log('Formatted score data for DB:', formattedScoreData); // Debug
    
    // Store the errors count in metadata if it exists
    if (errors !== undefined) {
      formattedScoreData.metadata = {
        ...formattedScoreData.metadata,
        errors
      };
    }
    
    const { data, error } = await supabase.from('scores').insert([formattedScoreData]);
    
    if (error) {
      console.error('Failed to submit score to Supabase:', error);
      throw error;
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Error in submitScore:', error);
    throw error;
  }
};

// Get user's game history
const getUserGameHistory = async (userId, limit = 10) => {
  try {
    const { data, error } = await supabase
      .from('scores')
      .select('*, games(*)')
      .eq('user_id', userId)
      .order('date_played', { ascending: false })
      .limit(limit);
      
    if (error) {
      console.error('Error fetching user game history:', error);
      throw error;
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Error in getUserGameHistory:', error);
    throw error;
  }
};

// Get leaderboard for a game type and difficulty
const getLeaderboard = async (gameType, difficulty, limit = 10) => {
  try {
    let query = supabase
      .from('scores')
      .select('*, users(username)')
      .eq('game_type', gameType)
      .order('score', { ascending: false })
      .limit(limit);
      
    if (difficulty) {
      query = query.eq('difficulty', difficulty);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching leaderboard:', error);
      throw error;
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Error in getLeaderboard:', error);
    throw error;
  }
};

// Export as both individual functions and as gameService object to maintain compatibility
export { getGames, getGameById, submitScore, getUserGameHistory, getLeaderboard };
export const gameService = {
  getGames,
  getGameById,
  submitScore,
  getUserGameHistory,
  getLeaderboard
};

export default gameService; 