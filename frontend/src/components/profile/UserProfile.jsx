import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Avatar,
  Button,
  TextField,
  Grid,
  Alert,
  CircularProgress,
  useTheme,
} from '@mui/material';
import { Edit as EditIcon, Save as SaveIcon } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const UserProfile = () => {
  const theme = useTheme();
  const { user, updateProfile } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editMode, setEditMode] = useState(false);
  
  const [profileData, setProfileData] = useState({
    firstName: user?.user_metadata?.first_name || '',
    lastName: user?.user_metadata?.last_name || '',
    bio: user?.user_metadata?.bio || '',
  });
  
  const handleEditToggle = () => {
    setEditMode(!editMode);
    setError('');
    setSuccess('');
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData({ ...profileData, [name]: value });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      const userData = {
        first_name: profileData.firstName,
        last_name: profileData.lastName,
        full_name: `${profileData.firstName} ${profileData.lastName}`.trim(),
        bio: profileData.bio,
      };
      
      const { error } = await updateProfile(userData);
      
      if (error) throw error;
      
      setSuccess('Profile updated successfully');
      setEditMode(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile: ' + error.message);
    } finally {
      setLoading(false);
    }
  };
  
  if (!user) {
    return (
      <Box sx={{ textAlign: 'center', mt: 8 }}>
        <Typography variant="h5">Please sign in to view your profile</Typography>
      </Box>
    );
  }
  
  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom align="center">
        User Profile
      </Typography>
      
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          mt: 4,
          background: theme.palette.mode === 'dark' 
            ? 'rgba(19, 47, 76, 0.4)' 
            : 'rgba(255, 255, 255, 0.8)',
        }}
      >
        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar 
              sx={{ width: 80, height: 80, mr: 2 }}
              src={user.user_metadata?.avatar_url}
              alt={user.email}
            >
              {user.email?.charAt(0).toUpperCase()}
            </Avatar>
            
            <Box>
              <Typography variant="h6">
                {user.user_metadata?.full_name || user.email}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user.email}
              </Typography>
            </Box>
          </Box>
          
          <Button 
            variant="outlined" 
            startIcon={editMode ? <SaveIcon /> : <EditIcon />}
            onClick={editMode ? handleSubmit : handleEditToggle}
            disabled={loading}
          >
            {editMode ? 'Save Profile' : 'Edit Profile'}
          </Button>
        </Box>
        
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                name="firstName"
                value={profileData.firstName}
                onChange={handleChange}
                disabled={!editMode || loading}
                variant={editMode ? "outlined" : "filled"}
                InputProps={{ readOnly: !editMode }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                name="lastName"
                value={profileData.lastName}
                onChange={handleChange}
                disabled={!editMode || loading}
                variant={editMode ? "outlined" : "filled"}
                InputProps={{ readOnly: !editMode }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                value={user.email}
                disabled={true}
                variant="filled"
                InputProps={{ readOnly: true }}
                helperText="Email cannot be changed"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Bio"
                name="bio"
                value={profileData.bio}
                onChange={handleChange}
                disabled={!editMode || loading}
                variant={editMode ? "outlined" : "filled"}
                InputProps={{ readOnly: !editMode }}
                multiline
                rows={4}
              />
            </Grid>
          </Grid>
          
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <CircularProgress />
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default UserProfile; 