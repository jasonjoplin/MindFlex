import { supabase } from '../utils/supabaseClient';

// Achievement definitions with icons, descriptions, and criteria
const achievements = [
  {
    id: 'first_game',
    title: 'First Steps',
    description: 'Complete your first game',
    icon: '🎮',
    category: 'general',
    points: 10,
    criteria: { games_played: 1 },
  },
  {
    id: 'memory_master',
    title: 'Memory Master',
    description: 'Score 1000+ points in Memory Match game',
    icon: '🧠',
    category: 'memory',
    points: 50,
    criteria: { memory_score: 1000 },
  },
  {
    id: 'word_wizard',
    title: 'Word Wizard',
    description: 'Complete 10 Word Scramble games',
    icon: '📝',
    category: 'word',
    points: 30,
    criteria: { word_games: 10 },
  },
  {
    id: 'pattern_pro',
    title: 'Pattern Recognition Pro',
    description: 'Reach level 10 in Pattern Memory game',
    icon: '📊',
    category: 'pattern',
    points: 40,
    criteria: { pattern_level: 10 },
  },
  {
    id: 'math_magician',
    title: 'Math Magician',
    description: 'Solve 50 math problems correctly',
    icon: '🔢',
    category: 'math',
    points: 35,
    criteria: { math_problems: 50 },
  },
  {
    id: 'quick_reflexes',
    title: 'Lightning Fast',
    description: 'Average reaction time under 300ms',
    icon: '⚡',
    category: 'reflex',
    points: 45,
    criteria: { avg_reaction_time: 300, comparison: 'less' },
  },
  {
    id: 'consistent_player',
    title: 'Consistent Player',
    description: 'Play games on 5 consecutive days',
    icon: '📅',
    category: 'general',
    points: 60,
    criteria: { consecutive_days: 5 },
  },
  {
    id: 'all_rounder',
    title: 'All-Rounder',
    description: 'Play all 5 game types at least once',
    icon: '🌟',
    category: 'general',
    points: 75,
    criteria: { game_types: 5 },
  },
  {
    id: 'perfect_score',
    title: 'Perfect Score',
    description: 'Get a perfect score in any game',
    icon: '💯',
    category: 'general',
    points: 100,
    criteria: { perfect_score: true },
  },
  {
    id: 'early_bird',
    title: 'Early Bird',
    description: 'Play a game before 8 AM',
    icon: '🐦',
    category: 'general',
    points: 15,
    criteria: { early_play: true },
  },
];

// Get all achievement definitions
export const getAchievements = () => {
  return achievements;
};

// Get user's earned achievements
export const getUserAchievements = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('user_achievements')
      .select('*')
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error fetching user achievements:', error);
      throw error;
    }
    
    return { data };
  } catch (error) {
    console.error('Error in getUserAchievements:', error);
    throw error;
  }
};

// Get user progress towards achievements
export const getUserProgress = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching user stats:', error);
      throw error;
    }
    
    return { data };
  } catch (error) {
    console.error('Error in getUserProgress:', error);
    throw error;
  }
};

// Award an achievement to a user
export const awardAchievement = async (userId, achievementId) => {
  try {
    const { data, error } = await supabase
      .from('user_achievements')
      .insert([
        {
          user_id: userId,
          achievement_id: achievementId,
          earned_at: new Date().toISOString(),
        },
      ]);
    
    if (error) {
      console.error('Error awarding achievement:', error);
      throw error;
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Error in awardAchievement:', error);
    throw error;
  }
};

// Check if user has earned any new achievements
export const checkAchievements = async (userId, stats) => {
  try {
    const { data: userAchievements } = await getUserAchievements(userId);
    const earnedAchievementIds = userAchievements.map(a => a.achievement_id);
    
    const newAchievements = [];
    
    achievements.forEach(achievement => {
      // Skip if already earned
      if (earnedAchievementIds.includes(achievement.id)) {
        return;
      }
      
      // Check if criteria are met
      let criteriaMatch = true;
      
      Object.entries(achievement.criteria).forEach(([key, requiredValue]) => {
        if (!stats[key]) {
          criteriaMatch = false;
          return;
        }
        
        if (achievement.criteria.comparison === 'less') {
          if (stats[key] > requiredValue) {
            criteriaMatch = false;
          }
        } else {
          if (stats[key] < requiredValue) {
            criteriaMatch = false;
          }
        }
      });
      
      if (criteriaMatch) {
        newAchievements.push(achievement);
        // Award the achievement
        awardAchievement(userId, achievement.id);
      }
    });
    
    return newAchievements;
  } catch (error) {
    console.error('Error in checkAchievements:', error);
    return [];
  }
};

export default {
  getAchievements,
  getUserAchievements,
  getUserProgress,
  awardAchievement,
  checkAchievements,
}; 