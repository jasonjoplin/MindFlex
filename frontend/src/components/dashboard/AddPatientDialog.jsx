import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Box,
  Typography,
} from '@mui/material';
import { motion } from 'framer-motion';

const conditions = [
  'Mild Cognitive Impairment',
  'Early Stage Dementia',
  'Moderate Dementia',
  'Memory Loss',
  'Cognitive Decline',
  'Other',
];

const AddPatientDialog = ({ open, onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    condition: '',
    notes: '',
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.age) {
      newErrors.age = 'Age is required';
    } else if (formData.age < 0 || formData.age > 120) {
      newErrors.age = 'Please enter a valid age';
    }

    if (!formData.gender) {
      newErrors.gender = 'Gender is required';
    }

    if (!formData.condition) {
      newErrors.condition = 'Condition is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onAdd(formData);
      handleClose();
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      age: '',
      gender: '',
      condition: '',
      notes: '',
    });
    setErrors({});
    onClose();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        component: motion.div,
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        sx: {
          background: 'rgba(19, 47, 76, 0.9)',
          backdropFilter: 'blur(10px)',
          borderRadius: 2,
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },
      }}
    >
      <DialogTitle>
        <Typography variant="h5" component="div">
          Add New Patient
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={!!errors.name}
                helperText={errors.name}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  },
                }}
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
                error={!!errors.age}
                helperText={errors.age}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  },
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!errors.gender}>
                <InputLabel>Gender</InputLabel>
                <Select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  label="Gender"
                  sx={{
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  }}
                >
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="female">Female</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth error={!!errors.condition}>
                <InputLabel>Condition</InputLabel>
                <Select
                  name="condition"
                  value={formData.condition}
                  onChange={handleChange}
                  label="Condition"
                  sx={{
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  }}
                >
                  {conditions.map((condition) => (
                    <MenuItem key={condition} value={condition}>
                      {condition}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Additional Notes"
                name="notes"
                multiline
                rows={4}
                value={formData.notes}
                onChange={handleChange}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  },
                }}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={handleClose} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          sx={{
            background: 'linear-gradient(45deg, #7C4DFF 30%, #00E5FF 90%)',
          }}
        >
          Add Patient
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddPatientDialog; 