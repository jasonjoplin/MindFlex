import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress
} from '@mui/material';
import { gameService } from '../../services/gameService';

const ScoreSubmission = ({ 
  open, 
  onClose, 
  gameData, 
  scoreData, 
  onSubmitSuccess 
}) => {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmitScore = async () => {
    try {
      setSubmitting(true);
      setError(null);
      
      // Add debugging to see what data we're working with
      console.log('Submitting score with game data:', gameData);
      console.log('Score data:', scoreData);

      await gameService.submitScore({
        gameId: gameData.id,
        gameName: gameData.name,
        gameType: gameData.type,
        score: scoreData.score,
        duration: scoreData.duration,
        difficulty: scoreData.difficulty,
        errors: scoreData.errors,
        metadata: {
          ...(scoreData.metadata || {}),
          gameDetails: `${gameData.name} - ${scoreData.difficulty}`
        }
      });

      onSubmitSuccess?.();
      onClose();
    } catch (err) {
      console.error('Error submitting score:', err);
      setError('Failed to submit score. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Game Complete!</DialogTitle>
      <DialogContent>
        <Box sx={{ py: 2 }}>
          <Typography variant="h6" gutterBottom>
            {gameData?.name}
          </Typography>
          <Typography variant="body1" gutterBottom>
            Difficulty: {scoreData?.difficulty}
          </Typography>
          <Typography variant="h4" color="primary" gutterBottom>
            Score: {scoreData?.score}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Time: {Math.floor(scoreData?.duration / 60)}m {scoreData?.duration % 60}s
          </Typography>
          {scoreData?.errors > 0 && (
            <Typography variant="body2" color="error">
              Errors: {scoreData.errors}
            </Typography>
          )}
          {error && (
            <Typography color="error" sx={{ mt: 2 }}>
              {error}
            </Typography>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmitScore} 
          variant="contained" 
          color="primary"
          disabled={submitting}
        >
          {submitting ? <CircularProgress size={24} /> : 'Submit Score'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ScoreSubmission; 