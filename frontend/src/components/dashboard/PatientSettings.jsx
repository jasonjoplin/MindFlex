import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Grid,
  Divider,
  Switch,
  FormControlLabel,
  Slider,
  Alert,
} from '@mui/material';
import { motion } from 'framer-motion';

const PatientSettings = ({ patient }) => {
  const [formData, setFormData] = useState({
    name: patient?.name || '',
    age: patient?.age || '',
    gender: patient?.gender || '',
    condition: patient?.condition || '',
    additionalNotes: patient?.additionalNotes || '',
    notifications: true,
    dailyGoal: 3,
    difficulty: 'Medium',
  });
  
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState(null);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  
  const handleSwitchChange = (e) => {
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      [name]: checked,
    });
  };
  
  const handleSliderChange = (name) => (e, value) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Implement actual API call to update patient settings
    // Mock success for now
    setSaveSuccess(true);
    setError(null);
    
    setTimeout(() => {
      setSaveSuccess(false);
    }, 3000);
  };

  return (
    <Box>
      {saveSuccess && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Patient settings saved successfully!
        </Alert>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Paper
          component="form"
          onSubmit={handleSubmit}
          sx={{
            p: 3,
            background: 'rgba(19, 47, 76, 0.4)',
            backdropFilter: 'blur(10px)',
            borderRadius: 2,
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <Typography variant="h6" gutterBottom>
            Patient Information
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                variant="outlined"
                sx={{ mb: 2 }}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Age"
                name="age"
                type="number"
                value={formData.age}
                onChange={handleChange}
                variant="outlined"
                sx={{ mb: 2 }}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Gender</InputLabel>
                <Select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  label="Gender"
                >
                  <MenuItem value="Male">Male</MenuItem>
                  <MenuItem value="Female">Female</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Condition</InputLabel>
                <Select
                  name="condition"
                  value={formData.condition}
                  onChange={handleChange}
                  label="Condition"
                >
                  <MenuItem value="Mild Cognitive Impairment">Mild Cognitive Impairment</MenuItem>
                  <MenuItem value="Early Stage Dementia">Early Stage Dementia</MenuItem>
                  <MenuItem value="Moderate Dementia">Moderate Dementia</MenuItem>
                  <MenuItem value="Memory Loss">Memory Loss</MenuItem>
                  <MenuItem value="Cognitive Decline">Cognitive Decline</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Additional Notes"
                name="additionalNotes"
                value={formData.additionalNotes}
                onChange={handleChange}
                variant="outlined"
                multiline
                rows={4}
                sx={{ mb: 2 }}
              />
            </Grid>
          </Grid>
          
          <Divider sx={{ my: 3 }} />
          
          <Typography variant="h6" gutterBottom>
            Game Settings
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.notifications}
                    onChange={handleSwitchChange}
                    name="notifications"
                    color="primary"
                  />
                }
                label="Enable Notifications"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Default Difficulty</InputLabel>
                <Select
                  name="difficulty"
                  value={formData.difficulty}
                  onChange={handleChange}
                  label="Default Difficulty"
                >
                  <MenuItem value="Easy">Easy</MenuItem>
                  <MenuItem value="Medium">Medium</MenuItem>
                  <MenuItem value="Hard">Hard</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <Typography gutterBottom>
                Daily Goal (Number of Sessions)
              </Typography>
              <Slider
                value={formData.dailyGoal}
                onChange={handleSliderChange('dailyGoal')}
                valueLabelDisplay="auto"
                step={1}
                marks
                min={1}
                max={10}
                sx={{ mb: 2, maxWidth: 500 }}
              />
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
            >
              Save Changes
            </Button>
          </Box>
        </Paper>
      </motion.div>
    </Box>
  );
};

export default PatientSettings; 