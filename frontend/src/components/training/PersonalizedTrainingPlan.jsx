import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardActions,
  CardMedia,
  Chip,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  useTheme,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  LinearProgress,
  Tooltip,
  TextField,
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Edit as EditIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  Share as ShareIcon,
  ArrowForward as ArrowForwardIcon,
  Star as StarIcon,
  Notifications as NotificationsIcon,
  Today as CalendarIcon,
  Settings as SettingsIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  AddCircleOutline as AddIcon,
  Delete as DeleteIcon,
  FitnessCenter as FitnessCenterIcon,
  Psychology as PsychologyIcon,
  Speed as SpeedIcon,
  Calculate as CalculateIcon,
  LocalFireDepartment as HotIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getGames } from '../../services/gameService';

// Helper function to format dates
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
};

// Generate a week of dates starting from today
const generateWeekDates = () => {
  const today = new Date();
  const weekDates = [];
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    weekDates.push(date);
  }
  
  return weekDates;
};

// Mock data generator for games based on category
const generateGamesForCategory = (category) => {
  const gamesMap = {
    memory: [
      { id: 'game-1', name: 'Memory Match', difficulty: 'Easy', duration: 10, description: 'Match pairs of cards to test your visual memory.' },
      { id: 'game-2', name: 'Sequence Memory', difficulty: 'Medium', duration: 15, description: 'Remember and repeat increasingly complex patterns.' },
      { id: 'game-3', name: 'Word Recall', difficulty: 'Hard', duration: 20, description: 'Memorize and recall lists of words under time pressure.' },
    ],
    attention: [
      { id: 'game-4', name: 'Focus Filter', difficulty: 'Medium', duration: 12, description: 'Filter out distractions and focus on specific targets.' },
      { id: 'game-5', name: 'Divided Attention', difficulty: 'Hard', duration: 18, description: 'Track multiple objects simultaneously.' },
      { id: 'game-6', name: 'Attention Span', difficulty: 'Easy', duration: 8, description: 'Maintain focus on a single task for increasing durations.' },
    ],
    processingSpeed: [
      { id: 'game-7', name: 'Quick React', difficulty: 'Easy', duration: 5, description: 'React as quickly as possible to visual and audio cues.' },
      { id: 'game-8', name: 'Speed Sort', difficulty: 'Medium', duration: 10, description: 'Sort items into categories at increasing speeds.' },
      { id: 'game-9', name: 'Pattern Speed', difficulty: 'Hard', duration: 15, description: 'Identify patterns as quickly as possible.' },
    ],
    reasoning: [
      { id: 'game-10', name: 'Logic Puzzles', difficulty: 'Medium', duration: 20, description: 'Solve logic-based puzzles of increasing complexity.' },
      { id: 'game-11', name: 'Pattern Completion', difficulty: 'Hard', duration: 25, description: 'Complete complex visual and numerical patterns.' },
      { id: 'game-12', name: 'Decision Making', difficulty: 'Easy', duration: 15, description: 'Make quick decisions based on multiple factors.' },
    ],
  };
  
  return gamesMap[category] || [];
};

// Get color and icon for cognitive domain
const getDomainInfo = (domain) => {
  const domainMap = {
    memory: { color: '#4caf50', icon: <PsychologyIcon /> },
    attention: { color: '#2196f3', icon: <FitnessCenterIcon /> },
    processingSpeed: { color: '#ff9800', icon: <SpeedIcon /> },
    reasoning: { color: '#9c27b0', icon: <CalculateIcon /> },
  };
  
  return domainMap[domain] || { color: '#757575', icon: <PsychologyIcon /> };
};

// Mock function to generate a training plan based on assessment scores
const generateTrainingPlan = (assessmentScores) => {
  // Sort domains by score (ascending, to focus more on weaker areas)
  const sortedDomains = Object.entries(assessmentScores)
    .sort(([, scoreA], [, scoreB]) => scoreA - scoreB)
    .map(([domain]) => domain);
  
  const weekDates = generateWeekDates();
  const trainingPlan = [];
  
  // Distribute focus across the week
  // More focus on weaker domains, less on stronger ones
  const focusDistribution = [
    [0, 1, 0, 3],  // Day 1: Focus on domains 0 and 3
    [0, 2, 0, 1],  // Day 2: Focus on domains 0 and 2
    [1, 2, 3, 0],  // Day 3: Focus on domains 1, 2, and 3
    [1, 0, 2, 3],  // Day 4: Focus on domains 0, 1, 2, and 3
    [2, 3, 0, 1],  // Day 5: Focus on domains 0, 1, 2, and 3
    [2, 0, 3, 1],  // Day 6: Focus on domains 0, 1, 2, and 3
    [3, 1, 2, 0],  // Day 7: Focus on domains 0, 1, 2, and 3
  ];
  
  // For each day of the week
  for (let i = 0; i < 7; i++) {
    const dailyExercises = [];
    
    // Get the day's focus distribution
    const dayFocus = focusDistribution[i];
    
    // For each domain in the focus distribution
    for (let j = 0; j < dayFocus.length; j++) {
      const domainIndex = dayFocus[j];
      const domain = sortedDomains[domainIndex];
      
      // Skip if this domain already has an exercise for this day
      if (dailyExercises.some(ex => ex.domain === domain)) continue;
      
      // Get games for this domain
      const domainGames = generateGamesForCategory(domain);
      
      // Select a random game
      if (domainGames.length > 0) {
        const randomGame = domainGames[Math.floor(Math.random() * domainGames.length)];
        
        // Add to daily exercises
        dailyExercises.push({
          domain,
          game: randomGame,
          completed: false,
          score: 0,
        });
      }
    }
    
    // Limit to 3 exercises per day maximum
    const limitedExercises = dailyExercises.slice(0, 3);
    
    // Add this day's plan
    trainingPlan.push({
      date: weekDates[i],
      exercises: limitedExercises,
    });
  }
  
  return trainingPlan;
};

// Generate a default training plan when no assessment scores are available
const generateDefaultTrainingPlan = () => {
  const defaultScores = {
    memory: 70,
    attention: 65,
    processingSpeed: 75,
    reasoning: 60,
  };
  
  return generateTrainingPlan(defaultScores);
};

// ExerciseCard component for displaying individual exercises
const ExerciseCard = ({ exercise, date, onComplete, onEdit, onDelete, isEditing }) => {
  const theme = useTheme();
  const { domain, game, completed, score } = exercise;
  const { color, icon } = getDomainInfo(domain);
  
  return (
    <Card
      variant="outlined"
      sx={{
        mb: 2,
        opacity: completed ? 0.7 : 1,
        boxShadow: 'none',
        border: `1px solid ${theme.palette.divider}`,
        position: 'relative',
        overflow: 'visible',
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: theme.shadows[3],
        },
      }}
    >
      {completed && (
        <Box
          sx={{
            position: 'absolute',
            top: -10,
            right: -10,
            zIndex: 1,
            bgcolor: 'success.main',
            borderRadius: '50%',
            width: 30,
            height: 30,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            border: `2px solid ${theme.palette.background.paper}`,
          }}
        >
          <CheckCircleIcon fontSize="small" />
        </Box>
      )}
      
      <CardHeader
        avatar={
          <Box
            sx={{
              bgcolor: color,
              color: 'white',
              width: 40,
              height: 40,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {icon}
          </Box>
        }
        title={
          <Typography variant="subtitle1" component="div">
            {game.name}
            <Chip
              size="small"
              label={game.difficulty}
              color={
                game.difficulty === 'Easy' ? 'success' :
                game.difficulty === 'Medium' ? 'primary' : 'error'
              }
              sx={{ ml: 1 }}
            />
          </Typography>
        }
        subheader={
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
            <Typography variant="caption" color="text.secondary" sx={{ mr: 2 }}>
              {domain.charAt(0).toUpperCase() + domain.slice(1)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {game.duration} min
            </Typography>
          </Box>
        }
        action={
          isEditing && (
            <IconButton size="small" color="error" onClick={onDelete}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          )
        }
      />
      
      <CardContent>
        <Typography variant="body2" color="text.secondary" paragraph>
          {game.description}
        </Typography>
        
        {completed ? (
          <Box sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Completed
            </Typography>
            {score > 0 && (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ mr: 1 }}>
                  Score: {score}
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={Math.min(score / 10, 100)} 
                  sx={{ 
                    flexGrow: 1,
                    borderRadius: 1,
                    height: 6,
                  }} 
                />
              </Box>
            )}
          </Box>
        ) : (
          <Button
            variant={isEditing ? "outlined" : "contained"}
            color="primary"
            size="small"
            fullWidth
            sx={{ mt: 1 }}
            onClick={() => !isEditing && onComplete(exercise)}
          >
            {isEditing ? "Move Exercise" : "Start Exercise"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

// Daily Plan component for displaying a single day's exercises
const DailyPlan = ({ plan, onCompleteExercise, onEditExercise, onDeleteExercise, isEditing, isToday }) => {
  const theme = useTheme();
  const { date, exercises } = plan;
  const formattedDate = formatDate(date);
  const hasExercises = exercises.length > 0;
  
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        mb: 3,
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
        borderLeft: isToday ? `4px solid ${theme.palette.primary.main}` : undefined,
        bgcolor: theme.palette.background.paper,
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <CalendarIcon color="action" sx={{ mr: 1 }} />
          <Typography variant="subtitle1">
            {formattedDate}
            {isToday && (
              <Chip size="small" label="TODAY" color="primary" sx={{ ml: 1 }} />
            )}
          </Typography>
        </Box>
        
        {isEditing && hasExercises && (
          <Button
            size="small"
            startIcon={<AddIcon />}
            onClick={() => onEditExercise(date)}
          >
            Add Exercise
          </Button>
        )}
      </Box>
      
      {hasExercises ? (
        <Box>
          {exercises.map((exercise, index) => (
            <ExerciseCard
              key={`${date}-${exercise.domain}-${index}`}
              exercise={exercise}
              date={date}
              onComplete={onCompleteExercise}
              onEdit={() => onEditExercise(date, exercise)}
              onDelete={() => onDeleteExercise(date, exercise)}
              isEditing={isEditing}
            />
          ))}
        </Box>
      ) : (
        <Box
          sx={{
            p: 2,
            textAlign: 'center',
            borderRadius: 1,
            bgcolor: theme.palette.action.hover,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            No exercises scheduled
          </Typography>
          
          {isEditing && (
            <Button
              size="small"
              startIcon={<AddIcon />}
              onClick={() => onEditExercise(date)}
              sx={{ mt: 1 }}
            >
              Add Exercise
            </Button>
          )}
        </Box>
      )}
    </Paper>
  );
};

// Add Exercise Dialog
const AddExerciseDialog = ({ open, onClose, onAdd, domains, date }) => {
  const [selectedDomain, setSelectedDomain] = useState('');
  const [selectedGame, setSelectedGame] = useState(null);
  const [games, setGames] = useState([]);
  
  useEffect(() => {
    if (selectedDomain) {
      setGames(generateGamesForCategory(selectedDomain));
      setSelectedGame(null);
    }
  }, [selectedDomain]);
  
  const handleDomainChange = (domain) => {
    setSelectedDomain(domain);
  };
  
  const handleGameSelect = (game) => {
    setSelectedGame(game);
  };
  
  const handleAdd = () => {
    if (selectedDomain && selectedGame) {
      onAdd(date, {
        domain: selectedDomain,
        game: selectedGame,
        completed: false,
        score: 0,
      });
      onClose();
    }
  };
  
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add Exercise to {formatDate(date)}</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3, mt: 1 }}>
          <Typography variant="subtitle2" gutterBottom>
            Select Cognitive Domain:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {domains.map((domain) => {
              const { color, icon } = getDomainInfo(domain);
              return (
                <Chip
                  key={domain}
                  label={domain.charAt(0).toUpperCase() + domain.slice(1)}
                  icon={React.cloneElement(icon, { fontSize: 'small' })}
                  onClick={() => handleDomainChange(domain)}
                  color={selectedDomain === domain ? 'primary' : 'default'}
                  variant={selectedDomain === domain ? 'filled' : 'outlined'}
                  sx={{ m: 0.5 }}
                />
              );
            })}
          </Box>
        </Box>
        
        {selectedDomain && (
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Select Exercise:
            </Typography>
            <List>
              {games.map((game) => (
                <ListItem
                  key={game.id}
                  button
                  selected={selectedGame?.id === game.id}
                  onClick={() => handleGameSelect(game)}
                  sx={{
                    borderRadius: 1,
                    mb: 1,
                    border: '1px solid',
                    borderColor: selectedGame?.id === game.id ? 'primary.main' : 'divider',
                  }}
                >
                  <ListItemIcon>
                    <Chip
                      size="small"
                      label={game.difficulty}
                      color={
                        game.difficulty === 'Easy' ? 'success' :
                        game.difficulty === 'Medium' ? 'primary' : 'error'
                      }
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={game.name}
                    secondary={`${game.duration} min • ${game.description}`}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={handleAdd} 
          color="primary" 
          disabled={!selectedGame}
          variant="contained"
        >
          Add Exercise
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Main PersonalizedTrainingPlan component
const PersonalizedTrainingPlan = ({ patient }) => {
  const theme = useTheme();
  
  const [loading, setLoading] = useState(true);
  const [trainingPlan, setTrainingPlan] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('success');
  
  // Get assessment scores from localStorage or use mock data
  useEffect(() => {
    setLoading(true);
    
    // Simulate API call to get training plan or generate one
    setTimeout(() => {
      // Try to get assessment results from localStorage
      const storedAssessment = localStorage.getItem('cognitiveDomainScores');
      
      let plan;
      if (storedAssessment) {
        const assessmentScores = JSON.parse(storedAssessment);
        plan = generateTrainingPlan(assessmentScores);
      } else {
        // Generate default plan if no assessment results
        plan = generateDefaultTrainingPlan();
      }
      
      setTrainingPlan(plan);
      setLoading(false);
    }, 1500);
  }, []);
  
  // Complete an exercise
  const handleCompleteExercise = (exercise) => {
    // In a real app, this would launch the game
    // For now, we'll just mark it as completed with a random score
    
    const updatedPlan = trainingPlan.map(day => {
      const updatedExercises = day.exercises.map(ex => {
        if (ex.domain === exercise.domain && ex.game.id === exercise.game.id) {
          return {
            ...ex,
            completed: true,
            score: Math.floor(Math.random() * 500) + 500, // Random score between 500-1000
          };
        }
        return ex;
      });
      
      return {
        ...day,
        exercises: updatedExercises,
      };
    });
    
    setTrainingPlan(updatedPlan);
    setShowAlert(true);
    setAlertMessage(`Exercise completed: ${exercise.game.name}`);
    setAlertSeverity('success');
  };
  
  // Toggle edit mode
  const handleToggleEdit = () => {
    setIsEditing(!isEditing);
    if (isEditing) {
      // Save changes
      setShowAlert(true);
      setAlertMessage('Training plan updated successfully');
      setAlertSeverity('success');
    }
  };
  
  // Open dialog to add or edit exercise
  const handleEditExercise = (date, exercise = null) => {
    setSelectedDate(date);
    setOpenDialog(true);
  };
  
  // Handle adding a new exercise
  const handleAddExercise = (date, newExercise) => {
    setTrainingPlan(prevPlan => {
      return prevPlan.map(day => {
        if (day.date.toDateString() === date.toDateString()) {
          // Limit to 3 exercises per day
          if (day.exercises.length >= 3) {
            setShowAlert(true);
            setAlertMessage('Maximum 3 exercises per day allowed');
            setAlertSeverity('warning');
            return day;
          }
          
          // Check for duplicate domain
          if (day.exercises.some(ex => ex.domain === newExercise.domain)) {
            setShowAlert(true);
            setAlertMessage(`Already have a ${newExercise.domain} exercise for this day`);
            setAlertSeverity('warning');
            return day;
          }
          
          return {
            ...day,
            exercises: [...day.exercises, newExercise],
          };
        }
        return day;
      });
    });
  };
  
  // Handle deleting an exercise
  const handleDeleteExercise = (date, exercise) => {
    setTrainingPlan(prevPlan => {
      return prevPlan.map(day => {
        if (day.date.toDateString() === date.toDateString()) {
          return {
            ...day,
            exercises: day.exercises.filter(ex => 
              !(ex.domain === exercise.domain && ex.game.id === exercise.game.id)
            ),
          };
        }
        return day;
      });
    });
  };
  
  // Close the add exercise dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };
  
  // Close the alert
  const handleCloseAlert = () => {
    setShowAlert(false);
  };
  
  // Handle printing the training plan
  const handlePrintPlan = () => {
    window.print();
  };
  
  // Get array of available cognitive domains
  const domains = ['memory', 'attention', 'processingSpeed', 'reasoning'];
  
  // Check if a date is today
  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };
  
  // Calculate overall progress
  const calculateProgress = () => {
    let totalExercises = 0;
    let completedExercises = 0;
    
    trainingPlan.forEach(day => {
      totalExercises += day.exercises.length;
      completedExercises += day.exercises.filter(ex => ex.completed).length;
    });
    
    return {
      total: totalExercises,
      completed: completedExercises,
      percentage: totalExercises > 0 ? Math.round((completedExercises / totalExercises) * 100) : 0,
    };
  };
  
  const progress = calculateProgress();
  
  return (
    <Box>
      {/* Header and controls */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Personalized Training Plan</Typography>
        <Box>
          <Button
            variant={isEditing ? "contained" : "outlined"}
            color={isEditing ? "primary" : "inherit"}
            startIcon={isEditing ? <EditIcon /> : <EditIcon />}
            onClick={handleToggleEdit}
            sx={{ mr: 1 }}
          >
            {isEditing ? "Save Changes" : "Edit Plan"}
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<PrintIcon />}
            onClick={handlePrintPlan}
          >
            Print
          </Button>
        </Box>
      </Box>
      
      {/* Progress summary */}
      <Paper
        sx={{
          p: 3,
          mb: 4,
          background: theme => theme.palette.mode === 'dark'
            ? 'rgba(19, 47, 76, 0.4)'
            : 'rgba(255, 255, 255, 0.8)',
          borderRadius: 2,
        }}
      >
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Weekly Progress
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <LinearProgress
                variant="determinate"
                value={progress.percentage}
                sx={{ flexGrow: 1, height: 10, borderRadius: 5, mr: 2 }}
              />
              <Typography variant="body1" fontWeight="bold">
                {progress.percentage}%
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              {progress.completed} of {progress.total} exercises completed
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Focus Areas
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {domains.map(domain => {
                const { color, icon } = getDomainInfo(domain);
                // Count exercises for this domain
                let count = 0;
                trainingPlan.forEach(day => {
                  count += day.exercises.filter(ex => ex.domain === domain).length;
                });
                
                return (
                  <Tooltip 
                    key={domain} 
                    title={`${count} ${domain} exercises this week`}
                    arrow
                  >
                    <Chip
                      icon={icon}
                      label={`${domain.charAt(0).toUpperCase() + domain.slice(1)} (${count})`}
                      sx={{ 
                        bgcolor: `${color}20`, 
                        color: color,
                        '& .MuiChip-icon': { color },
                      }}
                    />
                  </Tooltip>
                );
              })}
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Training plan */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box>
          <Typography variant="h6" gutterBottom>
            7-Day Training Schedule
          </Typography>
          
          {trainingPlan.map((dayPlan, index) => (
            <DailyPlan
              key={index}
              plan={dayPlan}
              onCompleteExercise={handleCompleteExercise}
              onEditExercise={handleEditExercise}
              onDeleteExercise={handleDeleteExercise}
              isEditing={isEditing}
              isToday={isToday(dayPlan.date)}
            />
          ))}
        </Box>
      )}
      
      {/* Add Exercise Dialog */}
      <AddExerciseDialog
        open={openDialog}
        onClose={handleCloseDialog}
        onAdd={handleAddExercise}
        domains={domains}
        date={selectedDate}
      />
      
      {/* Alert for notifications */}
      <Snackbar
        open={showAlert}
        autoHideDuration={6000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseAlert}
          severity={alertSeverity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {alertMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

// Snackbar component to provide compatibility with MUI Alert
const Snackbar = ({ open, autoHideDuration, onClose, anchorOrigin, children }) => {
  useEffect(() => {
    if (open && autoHideDuration) {
      const timer = setTimeout(onClose, autoHideDuration);
      return () => clearTimeout(timer);
    }
  }, [open, autoHideDuration, onClose]);
  
  if (!open) return null;
  
  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: anchorOrigin.vertical === 'bottom' ? 16 : 'auto',
        top: anchorOrigin.vertical === 'top' ? 16 : 'auto',
        left: anchorOrigin.horizontal === 'left' ? 16 : 'auto',
        right: anchorOrigin.horizontal === 'right' ? 16 : 'auto',
        zIndex: 2000,
      }}
    >
      {children}
    </Box>
  );
};

export default PersonalizedTrainingPlan; 