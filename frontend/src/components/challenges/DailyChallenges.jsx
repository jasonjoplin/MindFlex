import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Card,
  CardContent,
  CardActions,
  CardHeader,
  Chip,
  LinearProgress,
  Divider,
  IconButton,
  useTheme,
  Badge,
  Avatar,
} from '@mui/material';
import {
  EmojiEvents as TrophyIcon,
  Star as StarIcon,
  StarBorder as StarEmptyIcon,
  Today as TodayIcon,
  LocalFireDepartment as StreakIcon,
  CheckCircle as CompletedIcon,
  Lock as LockIcon,
  PlayArrow as PlayIcon,
  Timer as TimerIcon,
  AccessTime as ScheduleIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getGames } from '../../services/gameService';

// Main component
const DailyChallenges = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [todaysChallenges, setTodaysChallenges] = useState([]);
  const [streak, setStreak] = useState(0);
  const [lastCompletedDate, setLastCompletedDate] = useState(null);
  const [showCompletionAnimation, setShowCompletionAnimation] = useState(false);
  
  // Effect to load challenges and history
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get games data
        const { data: gamesData } = await getGames();
        
        // Load challenge history from localStorage
        const historyData = JSON.parse(localStorage.getItem('challengeHistory')) || {
          streak: 0,
          lastCompletedDate: null,
          completedChallenges: [],
        };
        
        // Set streak and last completed date
        setStreak(historyData.streak || 0);
        setLastCompletedDate(historyData.lastCompletedDate);
        
        // Check if challenges for today already exist in localStorage
        const today = new Date().toISOString().split('T')[0];
        const storedChallenges = JSON.parse(localStorage.getItem(`challenges_${today}`));
        
        if (storedChallenges) {
          setTodaysChallenges(storedChallenges);
        } else {
          // Generate new challenges for today
          const newChallenges = generateDailyChallenges(gamesData);
          setTodaysChallenges(newChallenges);
          
          // Store in localStorage
          localStorage.setItem(`challenges_${today}`, JSON.stringify(newChallenges));
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user]);
  
  // Generate random daily challenges from available games
  const generateDailyChallenges = (games) => {
    if (!games.length) return [];
    
    // Choose 3 random games for daily challenges
    const shuffledGames = [...games].sort(() => 0.5 - Math.random());
    const selectedGames = shuffledGames.slice(0, 3);
    
    // Create challenges with requirements
    return selectedGames.map((game, index) => {
      // Different challenge types
      const challengeTypes = [
        {
          type: 'score',
          description: `Score ${500 + index * 200} points in ${game.name}`,
          requirement: 500 + index * 200,
          requirementType: 'score',
          xp: 50 + index * 25,
        },
        {
          type: 'time',
          description: `Play ${game.name} for at least ${2 + index} minutes`,
          requirement: (2 + index) * 60, // seconds
          requirementType: 'time',
          xp: 30 + index * 20,
        },
        {
          type: 'streak',
          description: `Get a streak of ${5 + index * 3} correct answers in ${game.name}`,
          requirement: 5 + index * 3,
          requirementType: 'streak',
          xp: 40 + index * 30,
        },
      ];
      
      // Select a random challenge type
      const challengeType = challengeTypes[Math.floor(Math.random() * challengeTypes.length)];
      
      return {
        id: `challenge-${Date.now()}-${index}`,
        game: game,
        description: challengeType.description,
        requirement: challengeType.requirement,
        requirementType: challengeType.requirementType,
        xp: challengeType.xp,
        completed: false,
        progress: 0,
        reward: index === 0 ? 'coins' : index === 1 ? 'powerup' : 'badge',
      };
    });
  };
  
  // Handle refreshing challenges (costs virtual currency in a real app)
  const handleRefreshChallenges = () => {
    if (window.confirm('Are you sure you want to refresh your daily challenges? This would normally cost coins in the real app.')) {
      const fetchData = async () => {
        try {
          setLoading(true);
          
          // Get games
          const { data: gamesData } = await getGames();
          
          // Generate new challenges
          const newChallenges = generateDailyChallenges(gamesData);
          setTodaysChallenges(newChallenges);
          
          // Store in localStorage
          const today = new Date().toISOString().split('T')[0];
          localStorage.setItem(`challenges_${today}`, JSON.stringify(newChallenges));
        } catch (error) {
          console.error('Error refreshing challenges:', error);
        } finally {
          setLoading(false);
        }
      };
      
      fetchData();
    }
  };
  
  // Handle starting a challenge
  const handleStartChallenge = (challenge) => {
    // In a real app, you would set some state to track that the user is doing this challenge
    // and then redirect to the game with the challenge parameters
    navigate(`/games/${challenge.game.type}/${challenge.game.id}?challenge=${challenge.id}`);
  };
  
  // Handle completing a challenge
  const handleCompleteChallenge = (challengeId) => {
    // This would normally be triggered by the game's completion logic
    // For demo purposes, we'll simulate it with a button click
    
    setTodaysChallenges(prev => 
      prev.map(challenge => 
        challenge.id === challengeId 
          ? { ...challenge, completed: true, progress: 100 } 
          : challenge
      )
    );
    
    // Update localStorage
    const today = new Date().toISOString().split('T')[0];
    const updatedChallenges = todaysChallenges.map(challenge => 
      challenge.id === challengeId 
        ? { ...challenge, completed: true, progress: 100 } 
        : challenge
    );
    localStorage.setItem(`challenges_${today}`, JSON.stringify(updatedChallenges));
    
    // Update streak and history
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    const historyData = JSON.parse(localStorage.getItem('challengeHistory')) || {
      streak: 0,
      lastCompletedDate: null,
      completedChallenges: [],
    };
    
    // Check if this is a continued streak
    let newStreak = historyData.streak;
    if (historyData.lastCompletedDate === yesterdayStr) {
      newStreak += 1;
    } else if (historyData.lastCompletedDate !== today) {
      newStreak = 1;
    }
    
    // Update history
    const updatedHistory = {
      streak: newStreak,
      lastCompletedDate: today,
      completedChallenges: [
        ...historyData.completedChallenges,
        {
          challengeId,
          completedAt: new Date().toISOString(),
        }
      ],
    };
    
    localStorage.setItem('challengeHistory', JSON.stringify(updatedHistory));
    setStreak(newStreak);
    setLastCompletedDate(today);
    
    // Show animation for completion
    setShowCompletionAnimation(true);
    setTimeout(() => setShowCompletionAnimation(false), 3000);
  };
  
  // Calculate progress for today's challenges
  const getOverallProgress = () => {
    if (!todaysChallenges.length) return 0;
    
    const completedCount = todaysChallenges.filter(c => c.completed).length;
    return Math.round((completedCount / todaysChallenges.length) * 100);
  };
  
  // Check if all challenges are completed
  const allChallengesCompleted = todaysChallenges.length > 0 && todaysChallenges.every(c => c.completed);
  
  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Daily Challenges
          </Typography>
          
          <Button
            startIcon={<RefreshIcon />}
            variant="outlined"
            onClick={handleRefreshChallenges}
          >
            Refresh Challenges
          </Button>
        </Box>
        
        {/* Progress bar and streak */}
        <Paper
          sx={{
            p: 3,
            mb: 4,
            background: theme => theme.palette.mode === 'dark'
              ? 'rgba(19, 47, 76, 0.4)'
              : 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(10px)',
            borderRadius: 2,
            border: theme => `1px solid ${theme.palette.mode === 'dark' 
              ? 'rgba(255, 255, 255, 0.1)' 
              : 'rgba(0, 0, 0, 0.1)'
            }`,
          }}
        >
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={8}>
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="h6">Today's Progress</Typography>
                  <Typography variant="body2">
                    {todaysChallenges.filter(c => c.completed).length}/{todaysChallenges.length} Completed
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={getOverallProgress()} 
                  sx={{ 
                    height: 10, 
                    borderRadius: 5,
                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 5,
                      background: allChallengesCompleted 
                        ? 'linear-gradient(90deg, #00E676, #00E5FF)' 
                        : undefined,
                    }
                  }}
                />
              </Box>
              
              {allChallengesCompleted && (
                <Chip 
                  icon={<StarIcon />}
                  label="All challenges completed! Come back tomorrow for new challenges." 
                  color="success"
                  sx={{ mt: 1 }}
                />
              )}
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  justifyContent: { xs: 'center', md: 'flex-end' },
                }}
              >
                <StreakIcon 
                  sx={{ 
                    fontSize: 32, 
                    color: 'orange',
                    mr: 1,
                  }} 
                />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {streak} Day{streak !== 1 ? 's' : ''} Streak
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {lastCompletedDate
                      ? `Last completed: ${new Date(lastCompletedDate).toLocaleDateString()}`
                      : 'Start your streak today!'}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Paper>
        
        {/* Challenge cards */}
        <Grid container spacing={3}>
          {todaysChallenges.map((challenge, index) => (
            <Grid item xs={12} md={4} key={challenge.id}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card 
                  sx={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    overflow: 'hidden',
                    background: challenge.completed
                      ? 'linear-gradient(135deg, rgba(0, 230, 118, 0.1) 0%, rgba(0, 230, 118, 0.05) 100%)'
                      : undefined,
                    border: challenge.completed
                      ? '1px solid rgba(0, 230, 118, 0.3)'
                      : undefined,
                  }}
                >
                  {challenge.completed && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 16,
                        right: 16,
                        zIndex: 1,
                      }}
                    >
                      <CompletedIcon 
                        sx={{ 
                          color: 'success.main',
                          fontSize: 28,
                        }} 
                      />
                    </Box>
                  )}
                  
                  <CardHeader
                    avatar={
                      <Avatar
                        sx={{
                          bgcolor: index === 0 
                            ? 'primary.main' 
                            : index === 1 
                              ? 'secondary.main' 
                              : 'success.main',
                        }}
                      >
                        {getGameInitial(challenge.game.name)}
                      </Avatar>
                    }
                    title={challenge.game.name}
                    subheader={`+${challenge.xp} XP`}
                    action={
                      <Chip 
                        icon={getRewardIcon(challenge.reward)} 
                        label={getRewardLabel(challenge.reward)}
                        size="small"
                        color={getRewardColor(challenge.reward)}
                        sx={{ mt: 1 }}
                      />
                    }
                  />
                  
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="body1" paragraph>
                      {challenge.description}
                    </Typography>
                    
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2" color="text.secondary">
                          Progress
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {challenge.progress}%
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={challenge.progress} 
                        sx={{ 
                          height: 6, 
                          borderRadius: 3,
                        }}
                      />
                    </Box>
                    
                    <Divider sx={{ mb: 2 }} />
                    
                    {/* For demo purposes, add a button to simulate challenge completion */}
                    {!challenge.completed && (
                      <Button
                        size="small"
                        variant="outlined"
                        color="secondary"
                        fullWidth
                        onClick={() => handleCompleteChallenge(challenge.id)}
                        sx={{ mb: 1 }}
                      >
                        Simulate Completion
                      </Button>
                    )}
                  </CardContent>
                  
                  <CardActions>
                    <Button
                      fullWidth
                      variant="contained"
                      color="primary"
                      startIcon={challenge.completed ? <CompletedIcon /> : <PlayIcon />}
                      onClick={() => handleStartChallenge(challenge)}
                      disabled={challenge.completed}
                    >
                      {challenge.completed ? 'Completed' : 'Start Challenge'}
                    </Button>
                  </CardActions>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
        
        {/* Completion animation overlay */}
        <AnimatePresence>
          {showCompletionAnimation && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                zIndex: 1000,
              }}
            >
              <motion.div
                initial={{ scale: 0.5, y: 100 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              >
                <Paper
                  sx={{
                    p: 4,
                    textAlign: 'center',
                    maxWidth: 500,
                    background: 'rgba(19, 47, 76, 0.9)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: 4,
                  }}
                >
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                  >
                    <StarIcon sx={{ fontSize: 80, color: '#FFD700', mb: 2 }} />
                  </motion.div>
                  
                  <Typography variant="h4" sx={{ mb: 2, color: 'white' }}>
                    Challenge Completed!
                  </Typography>
                  
                  <Typography variant="body1" sx={{ mb: 3, color: 'rgba(255, 255, 255, 0.8)' }}>
                    Great job! You've earned XP and rewards. Keep up the good work!
                  </Typography>
                  
                  <Chip 
                    icon={<StreakIcon />} 
                    label={`${streak} Day Streak!`} 
                    color="primary"
                    sx={{ fontWeight: 'bold' }}
                  />
                </Paper>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </Box>
    </Container>
  );
};

// Helper function to get the first letter of a game name
const getGameInitial = (name) => {
  return name.charAt(0);
};

// Helper function to get icon for reward type
const getRewardIcon = (reward) => {
  switch (reward) {
    case 'coins':
      return <StarIcon fontSize="small" />;
    case 'powerup':
      return <StreakIcon fontSize="small" />;
    case 'badge':
      return <TrophyIcon fontSize="small" />;
    default:
      return <StarIcon fontSize="small" />;
  }
};

// Helper function to get label for reward type
const getRewardLabel = (reward) => {
  switch (reward) {
    case 'coins':
      return 'Coins';
    case 'powerup':
      return 'Power-up';
    case 'badge':
      return 'Badge';
    default:
      return 'Reward';
  }
};

// Helper function to get color for reward type
const getRewardColor = (reward) => {
  switch (reward) {
    case 'coins':
      return 'primary';
    case 'powerup':
      return 'secondary';
    case 'badge':
      return 'success';
    default:
      return 'default';
  }
};

export default DailyChallenges; 