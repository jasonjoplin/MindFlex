import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  TextField,
  CircularProgress,
  Paper,
  Grid,
  LinearProgress,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { gameService } from '../../../services/gameService';
import ScoreSubmission from '../ScoreSubmission';
import { useAuth } from '../../../contexts/AuthContext';

const MathGame = () => {
  const { gameId } = useParams();
  const { user } = useAuth();
  const [game, setGame] = useState(null);
  const [currentProblem, setCurrentProblem] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [problemsCompleted, setProblemsCompleted] = useState(0);
  const [difficulty, setDifficulty] = useState('easy');
  const [gameStarted, setGameStarted] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [showScoreDialog, setShowScoreDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState(0);
  const [timePerProblem, setTimePerProblem] = useState(10);
  const [remainingTime, setRemainingTime] = useState(10);
  const [streak, setStreak] = useState(0);

  // Initialize game
  useEffect(() => {
    const fetchGame = async () => {
      try {
        const { data, error } = await gameService.getGameById(gameId);
        
        if (error) {
          console.error('Error fetching game:', error);
          return;
        }
        
        console.log('Loaded math game data:', data); // Debug log
        
        // Set the game data directly, not the wrapper object
        setGame(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching game:', error);
      }
    };
    fetchGame();
  }, [gameId]);

  // Timer effects
  useEffect(() => {
    let interval;
    if (gameStarted) {
      interval = setInterval(() => {
        setCurrentTime(Date.now() - startTime);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameStarted, startTime]);

  useEffect(() => {
    let timer;
    if (gameStarted && currentProblem) {
      timer = setInterval(() => {
        setRemainingTime((prev) => {
          if (prev <= 0) {
            handleTimeout();
            return timePerProblem;
          }
          return prev - 0.1;
        });
      }, 100);
    }
    return () => clearInterval(timer);
  }, [gameStarted, currentProblem]);

  const generateProblem = useCallback(() => {
    const operations = {
      easy: ['+', '-'],
      medium: ['+', '-', '*'],
      hard: ['+', '-', '*', '/'],
    };

    const operation = operations[difficulty][Math.floor(Math.random() * operations[difficulty].length)];
    let num1, num2, answer;

    switch (operation) {
      case '+':
        num1 = Math.floor(Math.random() * (difficulty === 'easy' ? 20 : difficulty === 'medium' ? 50 : 100));
        num2 = Math.floor(Math.random() * (difficulty === 'easy' ? 20 : difficulty === 'medium' ? 50 : 100));
        answer = num1 + num2;
        break;
      case '-':
        num1 = Math.floor(Math.random() * (difficulty === 'easy' ? 20 : difficulty === 'medium' ? 50 : 100));
        num2 = Math.floor(Math.random() * num1);
        answer = num1 - num2;
        break;
      case '*':
        num1 = Math.floor(Math.random() * (difficulty === 'medium' ? 12 : 15));
        num2 = Math.floor(Math.random() * (difficulty === 'medium' ? 12 : 15));
        answer = num1 * num2;
        break;
      case '/':
        num2 = Math.floor(Math.random() * 10) + 1;
        answer = Math.floor(Math.random() * 10) + 1;
        num1 = num2 * answer;
        break;
      default:
        num1 = 0;
        num2 = 0;
        answer = 0;
    }

    return {
      num1,
      num2,
      operation,
      answer: Math.round(answer * 100) / 100,
      expression: `${num1} ${operation} ${num2}`,
    };
  }, [difficulty]);

  const handleTimeout = () => {
    setErrors(errors + 1);
    setStreak(0);
    if (errors + 1 >= 3) {
      setGameStarted(false);
      setShowScoreDialog(true);
    } else {
      generateNewProblem();
    }
  };

  const generateNewProblem = () => {
    const problem = generateProblem();
    setCurrentProblem(problem);
    setUserAnswer('');
    setRemainingTime(timePerProblem);
  };

  const initializeGame = (selectedDifficulty) => {
    setDifficulty(selectedDifficulty);
    setScore(0);
    setProblemsCompleted(0);
    setErrors(0);
    setStreak(0);
    setStartTime(Date.now());
    setGameStarted(true);
    setTimePerProblem(selectedDifficulty === 'easy' ? 10 : selectedDifficulty === 'medium' ? 8 : 6);
    generateNewProblem();
  };

  const handleSubmit = () => {
    const userNum = parseFloat(userAnswer);
    if (isNaN(userNum)) return;

    if (Math.abs(userNum - currentProblem.answer) < 0.01) {
      // Correct answer
      const timeBonus = Math.round((remainingTime / timePerProblem) * 50);
      const difficultyMultiplier = {
        easy: 1,
        medium: 2,
        hard: 3,
      }[difficulty];
      
      const newStreak = streak + 1;
      const streakBonus = Math.floor(newStreak / 5) * 50;
      
      setScore(score + (100 * difficultyMultiplier) + timeBonus + streakBonus);
      setStreak(newStreak);
      setProblemsCompleted(problemsCompleted + 1);

      if (problemsCompleted + 1 >= 20) {
        setGameStarted(false);
        setShowScoreDialog(true);
      } else {
        generateNewProblem();
      }
    } else {
      setErrors(errors + 1);
      setStreak(0);
      if (errors + 1 >= 3) {
        setGameStarted(false);
        setShowScoreDialog(true);
      } else {
        generateNewProblem();
      }
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom align="center" sx={{ mb: 4 }}>
          Mental Math Challenge
        </Typography>

        {!gameStarted ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Typography variant="h6" gutterBottom>
              Select Difficulty
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              {['easy', 'medium', 'hard'].map((level) => (
                <Button
                  key={level}
                  variant="contained"
                  onClick={() => initializeGame(level)}
                  sx={{
                    minWidth: 120,
                    textTransform: 'capitalize',
                  }}
                >
                  {level}
                </Button>
              ))}
            </Box>
          </Box>
        ) : (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3,
            }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                width: '100%',
                maxWidth: 600,
                mb: 2,
              }}
            >
              <Typography variant="h6">
                Score: {score}
              </Typography>
              <Typography variant="h6">
                Problems: {problemsCompleted}/20
              </Typography>
              <Typography variant="h6">
                Time: {Math.floor(currentTime / 1000)}s
              </Typography>
            </Box>

            <Paper
              elevation={3}
              sx={{
                p: 4,
                width: '100%',
                maxWidth: 600,
                background: 'rgba(19, 47, 76, 0.4)',
                backdropFilter: 'blur(10px)',
                borderRadius: 2,
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 3,
                }}
              >
                <Box sx={{ width: '100%', mb: 2 }}>
                  <LinearProgress
                    variant="determinate"
                    value={(remainingTime / timePerProblem) * 100}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      '& .MuiLinearProgress-bar': {
                        background: 'linear-gradient(90deg, #00E676, #00E5FF)',
                        borderRadius: 4,
                      },
                    }}
                  />
                </Box>

                <motion.div
                  key={currentProblem?.expression}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <Typography variant="h3" gutterBottom align="center">
                    {currentProblem?.expression} = ?
                  </Typography>
                </motion.div>

                <Box sx={{ width: '100%', maxWidth: 300 }}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="Enter your answer"
                    type="number"
                    onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                    autoFocus
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      },
                    }}
                  />
                </Box>

                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={!userAnswer}
                  sx={{ mt: 2 }}
                >
                  Submit
                </Button>

                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <Typography
                    variant="body2"
                    color="error"
                    sx={{ visibility: errors > 0 ? 'visible' : 'hidden' }}
                  >
                    Lives: {3 - errors}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="secondary"
                  >
                    Streak: {streak}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Box>
        )}

        <ScoreSubmission
          open={showScoreDialog}
          onClose={() => setShowScoreDialog(false)}
          gameData={game}
          scoreData={{
            score: score,
            duration: Math.floor(currentTime / 1000),
            difficulty,
            errors,
          }}
          onSubmitSuccess={() => {
            console.log('Math game score submitted successfully');
            setShowScoreDialog(false);
            setGameStarted(false);
          }}
        />
      </Box>
    </Container>
  );
};

export default MathGame; 