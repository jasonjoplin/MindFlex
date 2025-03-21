import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  CircularProgress,
  Paper,
  Grid,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { gameService } from '../../../services/gameService';
import ScoreSubmission from '../ScoreSubmission';
import PatternTile from './PatternTile';
import { useAuth } from '../../../contexts/AuthContext';

// Define colors for each tile
const tileColors = {
  0: { main: '#7C4DFF', light: '#B47CFF' }, // Purple
  1: { main: '#00E5FF', light: '#6EFFFF' }, // Cyan
  2: { main: '#00E676', light: '#69F0AE' }, // Green
  3: { main: '#FF1744', light: '#FF5252' }, // Red
};

const PatternGame = () => {
  const { gameId } = useParams();
  const { user } = useAuth();
  const [game, setGame] = useState(null);
  const [pattern, setPattern] = useState([]);
  const [playerPattern, setPlayerPattern] = useState([]);
  const [isShowingPattern, setIsShowingPattern] = useState(false);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [gameStarted, setGameStarted] = useState(false);
  const [difficulty, setDifficulty] = useState('easy');
  const [startTime, setStartTime] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [showScoreDialog, setShowScoreDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTile, setActiveTile] = useState(null);
  const [canPlayerClick, setCanPlayerClick] = useState(false);
  const [errors, setErrors] = useState(0);

  // Initialize game
  useEffect(() => {
    const fetchGame = async () => {
      try {
        const { data, error } = await gameService.getGameById(gameId);
        
        if (error) {
          console.error('Error fetching game:', error);
          return;
        }
        
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

  const getPatternSpeed = useCallback(() => {
    switch (difficulty) {
      case 'easy':
        return 1000;
      case 'medium':
        return 800;
      case 'hard':
        return 600;
      default:
        return 1000;
    }
  }, [difficulty]);

  const generateNextPattern = useCallback(() => {
    const newPattern = [...pattern];
    newPattern.push(Math.floor(Math.random() * 4));
    return newPattern;
  }, [pattern]);

  const showPattern = useCallback(async (patternToShow) => {
    setIsShowingPattern(true);
    setCanPlayerClick(false);
    
    const speed = getPatternSpeed();
    
    for (let i = 0; i < patternToShow.length; i++) {
      setActiveTile(patternToShow[i]);
      await new Promise(resolve => setTimeout(resolve, speed / 2));
      setActiveTile(null);
      await new Promise(resolve => setTimeout(resolve, speed / 2));
    }
    
    setIsShowingPattern(false);
    setCanPlayerClick(true);
  }, [getPatternSpeed]);

  const startNewLevel = useCallback(async () => {
    const newPattern = generateNextPattern();
    setPattern(newPattern);
    setPlayerPattern([]);
    await showPattern(newPattern);
  }, [generateNextPattern, showPattern]);

  const initializeGame = async (selectedDifficulty) => {
    setDifficulty(selectedDifficulty);
    setPattern([]);
    setPlayerPattern([]);
    setScore(0);
    setLevel(1);
    setErrors(0);
    setStartTime(Date.now());
    setGameStarted(true);
    await startNewLevel();
  };

  const handleTileClick = async (tileIndex) => {
    if (!canPlayerClick || isShowingPattern) return;

    const newPlayerPattern = [...playerPattern, tileIndex];
    setPlayerPattern(newPlayerPattern);
    setActiveTile(tileIndex);

    // Show tile animation
    await new Promise(resolve => setTimeout(resolve, 200));
    setActiveTile(null);

    // Check if the player's pattern matches the game pattern
    if (pattern[newPlayerPattern.length - 1] !== tileIndex) {
      // Pattern mismatch - game over
      setErrors(errors + 1);
      if (errors + 1 >= 3) {
        setGameStarted(false);
        setShowScoreDialog(true);
      } else {
        // Replay the pattern
        await new Promise(resolve => setTimeout(resolve, 500));
        setPlayerPattern([]);
        await showPattern(pattern);
      }
      return;
    }

    // Check if the player completed the pattern
    if (newPlayerPattern.length === pattern.length) {
      // Calculate score based on level and difficulty
      const levelScore = {
        easy: 100,
        medium: 200,
        hard: 300,
      }[difficulty] * level;

      setScore(score + levelScore);
      setLevel(level + 1);

      // Start next level after a short delay
      await new Promise(resolve => setTimeout(resolve, 500));
      await startNewLevel();
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
          Pattern Memory Challenge
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
                Level: {level}
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
                <Typography variant="h6" gutterBottom>
                  {isShowingPattern ? 'Watch the pattern...' : 'Repeat the pattern!'}
                </Typography>

                <Grid container spacing={2} maxWidth={400}>
                  {[0, 1, 2, 3].map((index) => (
                    <Grid item xs={6} key={index}>
                      <PatternTile
                        index={index}
                        isActive={activeTile === index}
                        onClick={() => handleTileClick(index)}
                        disabled={!canPlayerClick || isShowingPattern}
                        colors={tileColors[index]}
                      />
                    </Grid>
                  ))}
                </Grid>

                <Typography
                  variant="body2"
                  color="error"
                  sx={{ visibility: errors > 0 ? 'visible' : 'hidden' }}
                >
                  Mistakes: {errors}/3
                </Typography>
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
            console.log('Score submitted successfully');
            setShowScoreDialog(false);
            setGameStarted(false);
          }}
        />
      </Box>
    </Container>
  );
};

export default PatternGame; 