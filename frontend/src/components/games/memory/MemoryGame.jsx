import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Paper,
  CircularProgress,
  Dialog,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { gameService } from '../../../services/gameService';
import ScoreSubmission from '../ScoreSubmission';
import MemoryCard from './MemoryCard';
import { useAuth } from '../../../contexts/AuthContext';

// Card symbols using emoji for now (we can replace with custom images later)
const symbols = ['🌟', '🎮', '🎯', '🎲', '🎪', '🎨', '🎭', '🎪'];

const MemoryGame = () => {
  const { gameId } = useParams();
  const { user } = useAuth();
  const [game, setGame] = useState(null);
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [difficulty, setDifficulty] = useState('easy');
  const [showScoreDialog, setShowScoreDialog] = useState(false);
  const [loading, setLoading] = useState(true);

  // Initialize game
  useEffect(() => {
    const fetchGame = async () => {
      try {
        const { data, error } = await gameService.getGameById(gameId);
        
        if (error) {
          console.error('Error fetching game:', error);
          return;
        }
        
        console.log('Loaded memory game data:', data); // Debug log
        
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
    if (gameStarted && !gameOver) {
      interval = setInterval(() => {
        setCurrentTime(Date.now() - startTime);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameStarted, gameOver, startTime]);

  // Initialize cards based on difficulty
  const initializeGame = (selectedDifficulty) => {
    setDifficulty(selectedDifficulty);
    const pairs = selectedDifficulty === 'easy' ? 6 : selectedDifficulty === 'medium' ? 8 : 12;
    const gameSymbols = symbols.slice(0, pairs);
    const shuffledCards = [...gameSymbols, ...gameSymbols]
      .sort(() => Math.random() - 0.5)
      .map((symbol, index) => ({
        id: index,
        symbol,
        isFlipped: false,
        isMatched: false,
      }));
    setCards(shuffledCards);
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setStartTime(Date.now());
    setGameStarted(true);
    setGameOver(false);
  };

  // Handle card click
  const handleCardClick = useCallback((cardId) => {
    if (flipped.length === 2 || flipped.includes(cardId) || matched.includes(cardId)) return;

    const newFlipped = [...flipped, cardId];
    setFlipped(newFlipped);
    setMoves(moves + 1);

    if (newFlipped.length === 2) {
      const [first, second] = newFlipped;
      if (cards[first].symbol === cards[second].symbol) {
        setMatched([...matched, first, second]);
        setFlipped([]);
        
        // Check if game is over
        if (matched.length + 2 === cards.length) {
          setGameOver(true);
          setShowScoreDialog(true);
        }
      } else {
        setTimeout(() => setFlipped([]), 1000);
      }
    }
  }, [flipped, matched, cards, moves]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  const getScore = () => {
    const timeBonus = Math.max(0, 1000 - Math.floor(currentTime / 1000));
    const movesPenalty = moves * 10;
    return Math.max(0, 1000 + timeBonus - movesPenalty);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom align="center" sx={{ mb: 4 }}>
          Memory Match Challenge
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
          <>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                mb: 4,
                px: 2,
              }}
            >
              <Typography variant="h6">
                Moves: {moves}
              </Typography>
              <Typography variant="h6">
                Time: {Math.floor(currentTime / 1000)}s
              </Typography>
            </Box>

            <Grid
              container
              spacing={2}
              sx={{
                maxWidth: 800,
                margin: '0 auto',
              }}
            >
              <AnimatePresence>
                {cards.map((card) => (
                  <Grid item xs={3} sm={2} key={card.id}>
                    <MemoryCard
                      card={card}
                      isFlipped={flipped.includes(card.id)}
                      isMatched={matched.includes(card.id)}
                      onClick={() => handleCardClick(card.id)}
                    />
                  </Grid>
                ))}
              </AnimatePresence>
            </Grid>

            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Button
                variant="outlined"
                onClick={() => initializeGame(difficulty)}
                sx={{ mr: 2 }}
              >
                Restart Game
              </Button>
            </Box>
          </>
        )}

        <ScoreSubmission
          open={showScoreDialog}
          onClose={() => setShowScoreDialog(false)}
          gameData={game}
          scoreData={{
            score: getScore(),
            duration: Math.floor(currentTime / 1000),
            difficulty,
            errors: moves,
          }}
          onSubmitSuccess={() => {
            console.log('Memory game score submitted successfully');
            setShowScoreDialog(false);
            setGameStarted(false);
          }}
        />
      </Box>
    </Container>
  );
};

export default MemoryGame; 