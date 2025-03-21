import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  LinearProgress,
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import { motion } from 'framer-motion';

const PatientProgress = ({ patientId, patientData }) => {
  const [timeRange, setTimeRange] = useState('week');
  const [gameFilter, setGameFilter] = useState('all');
  const [progressData, setProgressData] = useState([]);
  const [gameStats, setGameStats] = useState([]);

  useEffect(() => {
    // TODO: Replace with actual API calls
    // const fetchProgressData = async () => {
    //   const data = await progressService.getPatientProgress(patientId, timeRange);
    //   setProgressData(data);
    // };

    // Mock data generation
    const generateMockData = () => {
      const ranges = {
        week: 7,
        month: 30,
        year: 12,
      };

      const days = ranges[timeRange];
      const data = [];

      for (let i = 0; i < days; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        data.unshift({
          date: date.toISOString().split('T')[0],
          memory: Math.floor(Math.random() * 400) + 600,
          pattern: Math.floor(Math.random() * 400) + 600,
          reaction: Math.floor(Math.random() * 400) + 600,
          word: Math.floor(Math.random() * 400) + 600,
          sequence: Math.floor(Math.random() * 400) + 600,
          average: 0,
        });
      }

      // Calculate averages
      data.forEach(day => {
        day.average = Math.round(
          (day.memory + day.pattern + day.reaction + day.word + day.sequence) / 5
        );
      });

      return data;
    };

    const generateGameStats = () => {
      return [
        {
          name: 'Memory Match',
          sessions: Math.floor(Math.random() * 20) + 10,
          avgScore: Math.floor(Math.random() * 200) + 800,
          improvement: Math.floor(Math.random() * 40) + 10,
        },
        {
          name: 'Pattern Memory',
          sessions: Math.floor(Math.random() * 20) + 10,
          avgScore: Math.floor(Math.random() * 200) + 800,
          improvement: Math.floor(Math.random() * 40) + 10,
        },
        {
          name: 'Reaction Speed',
          sessions: Math.floor(Math.random() * 20) + 10,
          avgScore: Math.floor(Math.random() * 200) + 800,
          improvement: Math.floor(Math.random() * 40) + 10,
        },
        {
          name: 'Word Scramble',
          sessions: Math.floor(Math.random() * 20) + 10,
          avgScore: Math.floor(Math.random() * 200) + 800,
          improvement: Math.floor(Math.random() * 40) + 10,
        },
        {
          name: 'Sequence Memory',
          sessions: Math.floor(Math.random() * 20) + 10,
          avgScore: Math.floor(Math.random() * 200) + 800,
          improvement: Math.floor(Math.random() * 40) + 10,
        },
      ];
    };

    setProgressData(generateMockData());
    setGameStats(generateGameStats());
  }, [patientId, timeRange]);

  const getFilteredData = () => {
    if (gameFilter === 'all') {
      return progressData.map(day => ({
        date: day.date,
        score: day.average,
      }));
    }
    return progressData.map(day => ({
      date: day.date,
      score: day[gameFilter],
    }));
  };

  return (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Paper
              sx={{
                p: 3,
                background: 'rgba(19, 47, 76, 0.4)',
                backdropFilter: 'blur(10px)',
                borderRadius: 2,
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Time Range</InputLabel>
                  <Select
                    value={timeRange}
                    label="Time Range"
                    onChange={(e) => setTimeRange(e.target.value)}
                    sx={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                  >
                    <MenuItem value="week">Week</MenuItem>
                    <MenuItem value="month">Month</MenuItem>
                    <MenuItem value="year">Year</MenuItem>
                  </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Game</InputLabel>
                  <Select
                    value={gameFilter}
                    label="Game"
                    onChange={(e) => setGameFilter(e.target.value)}
                    sx={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                  >
                    <MenuItem value="all">All Games</MenuItem>
                    <MenuItem value="memory">Memory Match</MenuItem>
                    <MenuItem value="pattern">Pattern Memory</MenuItem>
                    <MenuItem value="reaction">Reaction Speed</MenuItem>
                    <MenuItem value="word">Word Scramble</MenuItem>
                    <MenuItem value="sequence">Sequence Memory</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={getFilteredData()}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                    <XAxis
                      dataKey="date"
                      stroke="rgba(255, 255, 255, 0.5)"
                      tick={{ fill: 'rgba(255, 255, 255, 0.5)' }}
                    />
                    <YAxis
                      stroke="rgba(255, 255, 255, 0.5)"
                      tick={{ fill: 'rgba(255, 255, 255, 0.5)' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(19, 47, 76, 0.9)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '4px',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#00E5FF"
                      strokeWidth={2}
                      dot={{ fill: '#00E5FF' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </motion.div>
        </Grid>

        <Grid item xs={12} md={4}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Paper
              sx={{
                p: 3,
                background: 'rgba(19, 47, 76, 0.4)',
                backdropFilter: 'blur(10px)',
                borderRadius: 2,
                border: '1px solid rgba(255, 255, 255, 0.1)',
                height: '100%',
              }}
            >
              <Typography variant="h6" gutterBottom>
                Game Performance
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={gameStats}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                    <XAxis
                      type="number"
                      stroke="rgba(255, 255, 255, 0.5)"
                      tick={{ fill: 'rgba(255, 255, 255, 0.5)' }}
                    />
                    <YAxis
                      dataKey="name"
                      type="category"
                      stroke="rgba(255, 255, 255, 0.5)"
                      tick={{ fill: 'rgba(255, 255, 255, 0.5)' }}
                      width={100}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(19, 47, 76, 0.9)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '4px',
                      }}
                    />
                    <Bar dataKey="avgScore" fill="#7C4DFF" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </motion.div>
        </Grid>

        <Grid item xs={12}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Grid container spacing={2}>
              {gameStats.map((game, index) => (
                <Grid item xs={12} sm={6} md={4} key={game.name}>
                  <Card
                    sx={{
                      background: 'rgba(19, 47, 76, 0.4)',
                      backdropFilter: 'blur(10px)',
                      borderRadius: 2,
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                    }}
                  >
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {game.name}
                      </Typography>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Sessions Completed
                        </Typography>
                        <Typography variant="h4">
                          {game.sessions}
                        </Typography>
                      </Box>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Average Score
                        </Typography>
                        <Typography variant="h4">
                          {game.avgScore}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Improvement
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={game.improvement}
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
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          {game.improvement}% increase
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </motion.div>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PatientProgress; 