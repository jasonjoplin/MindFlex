import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  CircularProgress,
  Paper,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { gameService } from '../../../services/gameService';
import ScoreSubmission from '../ScoreSubmission';
import { useAuth } from '../../../contexts/AuthContext';

const ReactionGame = () => {
  const { gameId } = useParams();
  const { user } = useAuth();
  const [game, setGame] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [difficulty, setDifficulty] = useState('easy');
  const [score, setScore] = useState(0);
  const [roundsCompleted, setRoundsCompleted] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [showScoreDialog, setShowScoreDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [targetVisible, setTargetVisible] = useState(false);
  const [targetPosition, setTargetPosition] = useState({ x: 0, y: 0 });
  const [targetSize, setTargetSize] = useState(60);
  const [reactionTimes, setReactionTimes] = useState([]);
  const [waitingForClick, setWaitingForClick] = useState(false);
  const [earlyClicks, setEarlyClicks] = useState(0);
  const [bestTime, setBestTime] = useState(null);
  const [showCountdown, setShowCountdown] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const containerRef = useRef(null);
  const timeoutRef = useRef(null);
  const appearanceTimeRef = useRef(null);

  // Initialize game
  useEffect(() => {
    const fetchGame = async () => {
      try {
        const { data, error } = await gameService.getGameById(gameId);
        
        if (error) {
          console.error('Error fetching game:', error);
          return;
        }
        
        console.log('Loaded reaction game data:', data); // Debug log
        
        // Set the game data directly, not the wrapper object
        setGame(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching game:', error);
      }
    };
    fetchGame();
  }, [gameId]);

  // Timer effect
  useEffect(() => {
    let interval;
    if (gameStarted) {
      interval = setInterval(() => {
        setCurrentTime(Date.now() - startTime);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameStarted, startTime]);

  const getRandomDelay = useCallback(() => {
    const delays = {
      easy: [1500, 3000],
      medium: [1000, 2500],
      hard: [500, 2000],
    };
    const [min, max] = delays[difficulty];
    return Math.random() * (max - min) + min;
  }, [difficulty]);

  const getRandomPosition = useCallback(() => {
    if (!containerRef.current) return { x: 0, y: 0 };
    
    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    const padding = targetSize;
    
    return {
      x: Math.random() * (rect.width - 2 * padding) + padding,
      y: Math.random() * (rect.height - 2 * padding) + padding,
    };
  }, [targetSize]);

  const startNewRound = useCallback(() => {
    setTargetVisible(false);
    setWaitingForClick(true);
    
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set random delay before target appears
    timeoutRef.current = setTimeout(() => {
      setTargetPosition(getRandomPosition());
      setTargetVisible(true);
      appearanceTimeRef.current = Date.now();
    }, getRandomDelay());
  }, [getRandomDelay, getRandomPosition]);

  const handleContainerClick = () => {
    if (!gameStarted || !waitingForClick) return;

    if (!targetVisible) {
      // Clicked too early
      setEarlyClicks(prev => {
        if (prev + 1 >= 3) {
          setGameStarted(false);
          setShowScoreDialog(true);
          return prev;
        }
        return prev + 1;
      });
      startNewRound();
      return;
    }

    const reactionTime = Date.now() - appearanceTimeRef.current;
    setReactionTimes(prev => [...prev, reactionTime]);
    
    // Update best time
    if (bestTime === null || reactionTime < bestTime) {
      setBestTime(reactionTime);
    }

    // Calculate score based on reaction time and difficulty multiplier
    const baseScore = Math.max(0, 1000 - reactionTime);
    const difficultyMultiplier = {
      easy: 1,
      medium: 1.5,
      hard: 2,
    }[difficulty];
    
    setScore(prev => prev + Math.round(baseScore * difficultyMultiplier));
    setRoundsCompleted(prev => prev + 1);

    if (roundsCompleted + 1 >= 10) {
      setGameStarted(false);
      setShowScoreDialog(true);
    } else {
      startNewRound();
    }
  };

  const startCountdown = async () => {
    setShowCountdown(true);
    setCountdown(3);
    
    for (let i = 2; i >= 1; i--) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setCountdown(i);
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    setShowCountdown(false);
    initializeGame();
  };

  const initializeGame = () => {
    setScore(0);
    setRoundsCompleted(0);
    setReactionTimes([]);
    setEarlyClicks(0);
    setBestTime(null);
    setStartTime(Date.now());
    setGameStarted(true);
    setWaitingForClick(true);
    startNewRound();
  };

  const handleDifficultySelect = (selectedDifficulty) => {
    setDifficulty(selectedDifficulty);
    setTargetSize(selectedDifficulty === 'easy' ? 60 : selectedDifficulty === 'medium' ? 45 : 30);
    startCountdown();
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
          Reaction Speed Challenge
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
            {!showCountdown ? (
              <>
                <Typography variant="h6" gutterBottom>
                  Select Difficulty
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  {['easy', 'medium', 'hard'].map((level) => (
                    <Button
                      key={level}
                      variant="contained"
                      onClick={() => handleDifficultySelect(level)}
                      sx={{
                        minWidth: 120,
                        textTransform: 'capitalize',
                      }}
                    >
                      {level}
                    </Button>
                  ))}
                </Box>
              </>
            ) : (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Typography variant="h1" sx={{ fontSize: '6rem', fontWeight: 'bold' }}>
                  {countdown}
                </Typography>
              </motion.div>
            )}
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
                Rounds: {roundsCompleted}/10
              </Typography>
              <Typography variant="h6">
                Best: {bestTime ? `${bestTime}ms` : '-'}
              </Typography>
            </Box>

            <Paper
              ref={containerRef}
              onClick={handleContainerClick}
              sx={{
                position: 'relative',
                width: '100%',
                maxWidth: 600,
                height: 400,
                background: 'rgba(19, 47, 76, 0.4)',
                backdropFilter: 'blur(10px)',
                borderRadius: 2,
                border: '1px solid rgba(255, 255, 255, 0.1)',
                cursor: 'pointer',
                overflow: 'hidden',
              }}
            >
              <AnimatePresence>
                {targetVisible && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                    style={{
                      position: 'absolute',
                      left: targetPosition.x - targetSize / 2,
                      top: targetPosition.y - targetSize / 2,
                      width: targetSize,
                      height: targetSize,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #00E676 0%, #00E5FF 100%)',
                      boxShadow: '0 0 20px rgba(0, 230, 118, 0.5)',
                    }}
                  />
                )}
              </AnimatePresence>

              <Typography
                variant="h6"
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  opacity: targetVisible ? 0 : 0.7,
                  transition: 'opacity 0.3s ease',
                  textAlign: 'center',
                }}
              >
                {waitingForClick ? 'Wait for the target...' : 'Click to start'}
              </Typography>
            </Paper>

            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Typography
                variant="body2"
                color="error"
                sx={{ visibility: earlyClicks > 0 ? 'visible' : 'hidden' }}
              >
                Early clicks: {earlyClicks}/3
              </Typography>
              {reactionTimes.length > 0 && (
                <Typography variant="body2" color="secondary">
                  Last: {reactionTimes[reactionTimes.length - 1]}ms
                </Typography>
              )}
            </Box>
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
            bestTime,
          }}
          onSubmitSuccess={() => {
            console.log('Reaction game score submitted successfully');
            setShowScoreDialog(false);
            setGameStarted(false);
          }}
        />
      </Box>
    </Container>
  );
};

export default ReactionGame; 