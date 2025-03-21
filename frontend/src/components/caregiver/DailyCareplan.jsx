import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Grid,
  TextField,
  Typography,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  Paper,
  Chip,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  WbSunny as MorningIcon,
  SelfImprovement as ExerciseIcon,
  DirectionsWalk as ActivityIcon,
  Restaurant as MealIcon,
  HealthAndSafety as TherapyIcon,
  People as SocialIcon,
  Nightlight as EveningIcon,
  AccessTime as BreakIcon,
  DateRange as CalendarIcon,
  Refresh as RefreshIcon,
  Print as PrintIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { caregiverApi } from '../../services/apiService';
import { format } from 'date-fns';

const PlanCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  borderRadius: theme.spacing(2),
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  fontWeight: 600,
  display: 'flex',
  alignItems: 'center',
  '& .MuiSvgIcon-root': {
    marginRight: theme.spacing(1),
  },
}));

const DailyCareplan = ({ patientId, patientData }) => {
  const [date, setDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [plan, setPlan] = useState(null);
  const [error, setError] = useState(null);
  const [caregiverConstraints, setCaregiverConstraints] = useState({
    available_time: 'full-day',
    support_network: 'moderate',
    considerations: ''
  });
  const [savedPlans, setSavedPlans] = useState([]);
  const [showConstraintsDialog, setShowConstraintsDialog] = useState(false);

  const fetchDailyPlan = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // In a production app, you would use the real API:
      // const response = await caregiverApi.generateDailyPlan(patientId, caregiverConstraints);
      // setPlan(response.plan);
      
      // Mock plan data
      const mockPlan = {
        morning_routine: [
          "7:00 AM - Wake up, gentle orientation to the day",
          "7:30 AM - Medication with light breakfast",
          "8:00 AM - Personal hygiene assistance as needed",
          "8:30 AM - Short stretching exercises",
          "9:00 AM - Memory card exercise (15 minutes)"
        ],
        cognitive_exercises: [
          "10:00 AM - Visual pattern recognition game (20 minutes)",
          "11:30 AM - Music memory activity: identify familiar songs (15 minutes)",
          "2:00 PM - Simple counting and sorting exercise with colored blocks (15 minutes)"
        ],
        physical_activities: [
          "9:30 AM - 15-minute gentle walk in the garden",
          "3:30 PM - Seated range-of-motion exercises",
          "5:00 PM - Short afternoon stroll if energy levels permit"
        ],
        meals: [
          "7:30 AM - Light breakfast: oatmeal with berries, toast with protein",
          "12:00 PM - Lunch: Mediterranean-style meal with fish/lean protein, vegetables",
          "3:00 PM - Afternoon snack: yogurt with fruit",
          "6:00 PM - Dinner: easy-to-eat protein with cooked vegetables"
        ],
        therapy_sessions: [
          "11:00 AM - 15-minute session with family photos to stimulate memories",
          "4:00 PM - 20-minute music therapy session with favorite songs from youth"
        ],
        social_engagement: [
          "1:00 PM - Video call with family member (keep under 15 minutes)",
          "7:00 PM - Relaxed conversation during a photo album review"
        ],
        evening_routine: [
          "7:30 PM - Begin winding down activities (dim lights, calmer environment)",
          "8:00 PM - Evening medication with light snack if needed",
          "8:30 PM - Personal hygiene assistance as needed",
          "9:00 PM - Relaxing music or audiobook",
          "9:30 PM - Bedtime"
        ],
        caregiver_breaks: [
          "10:30 AM - Short break while patient engages with memory card exercise",
          "1:30 PM - 30-minute break after lunch while patient rests",
          "7:00 PM - Break during relaxed evening activities"
        ]
      };
      
      setTimeout(() => {
        setPlan(mockPlan);
        setIsLoading(false);
      }, 1500);
      
    } catch (error) {
      console.error('Error generating daily care plan:', error);
      setError('Failed to generate care plan. Please try again.');
      setIsLoading(false);
    }
  };

  const handleRegenerate = () => {
    fetchDailyPlan();
  };

  const handleSavePlan = () => {
    if (!plan) return;
    
    const savedPlan = {
      id: Date.now(),
      date: format(date, 'yyyy-MM-dd'),
      plan: plan,
      patientId: patientId
    };
    
    setSavedPlans([...savedPlans, savedPlan]);
  };

  const handlePrintPlan = () => {
    window.print();
  };

  const handleConstraintsSubmit = () => {
    setShowConstraintsDialog(false);
    fetchDailyPlan();
  };
  
  useEffect(() => {
    if (patientId && patientData) {
      fetchDailyPlan();
    }
  }, [patientId]);

  if (!patientData) {
    return (
      <Alert severity="warning" sx={{ mb: 3 }}>
        No patient data available for generating a care plan.
      </Alert>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" component="h2" gutterBottom>
            Daily Care Plan
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            For {patientData.first_name} {patientData.last_name} on {format(date, 'PPPP')}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Plan Date"
              value={date}
              onChange={(newDate) => setDate(newDate)}
              renderInput={(params) => <TextField size="small" {...params} />}
            />
          </LocalizationProvider>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => setShowConstraintsDialog(true)}
          >
            Customize & Regenerate
          </Button>
        </Box>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {isLoading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8 }}>
          <CircularProgress size={40} sx={{ mb: 2 }} />
          <Typography variant="body1" color="text.secondary">
            Generating personalized daily care plan...
          </Typography>
        </Box>
      ) : plan ? (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mb: 2 }}>
            <Tooltip title="Save Plan">
              <IconButton onClick={handleSavePlan}>
                <SaveIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Print Plan">
              <IconButton onClick={handlePrintPlan}>
                <PrintIcon />
              </IconButton>
            </Tooltip>
          </Box>
          
          <Grid container spacing={3}>
            {/* Morning Routine */}
            <Grid item xs={12} md={6}>
              <PlanCard>
                <CardContent sx={{ p: 3 }}>
                  <SectionTitle variant="h6">
                    <MorningIcon color="primary" /> Morning Routine
                  </SectionTitle>
                  <List dense>
                    {plan.morning_routine.map((activity, index) => (
                      <ListItem key={index}>
                        <ListItemText primary={activity} />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </PlanCard>
            </Grid>
            
            {/* Evening Routine */}
            <Grid item xs={12} md={6}>
              <PlanCard>
                <CardContent sx={{ p: 3 }}>
                  <SectionTitle variant="h6">
                    <EveningIcon color="primary" /> Evening Routine
                  </SectionTitle>
                  <List dense>
                    {plan.evening_routine.map((activity, index) => (
                      <ListItem key={index}>
                        <ListItemText primary={activity} />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </PlanCard>
            </Grid>
            
            {/* Cognitive Exercises */}
            <Grid item xs={12} md={6}>
              <PlanCard>
                <CardContent sx={{ p: 3 }}>
                  <SectionTitle variant="h6">
                    <ExerciseIcon color="success" /> Cognitive Exercises
                  </SectionTitle>
                  <List dense>
                    {plan.cognitive_exercises.map((exercise, index) => (
                      <ListItem key={index}>
                        <ListItemText primary={exercise} />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </PlanCard>
            </Grid>
            
            {/* Physical Activities */}
            <Grid item xs={12} md={6}>
              <PlanCard>
                <CardContent sx={{ p: 3 }}>
                  <SectionTitle variant="h6">
                    <ActivityIcon color="success" /> Physical Activities
                  </SectionTitle>
                  <List dense>
                    {plan.physical_activities.map((activity, index) => (
                      <ListItem key={index}>
                        <ListItemText primary={activity} />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </PlanCard>
            </Grid>
            
            {/* Meals */}
            <Grid item xs={12} md={6}>
              <PlanCard>
                <CardContent sx={{ p: 3 }}>
                  <SectionTitle variant="h6">
                    <MealIcon color="primary" /> Meals & Nutrition
                  </SectionTitle>
                  <List dense>
                    {plan.meals.map((meal, index) => (
                      <ListItem key={index}>
                        <ListItemText primary={meal} />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </PlanCard>
            </Grid>
            
            {/* Therapy Sessions */}
            <Grid item xs={12} md={6}>
              <PlanCard>
                <CardContent sx={{ p: 3 }}>
                  <SectionTitle variant="h6">
                    <TherapyIcon color="secondary" /> Therapy Sessions
                  </SectionTitle>
                  <List dense>
                    {plan.therapy_sessions.map((session, index) => (
                      <ListItem key={index}>
                        <ListItemText primary={session} />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </PlanCard>
            </Grid>
            
            {/* Social Engagement */}
            <Grid item xs={12} md={6}>
              <PlanCard>
                <CardContent sx={{ p: 3 }}>
                  <SectionTitle variant="h6">
                    <SocialIcon color="info" /> Social Engagement
                  </SectionTitle>
                  <List dense>
                    {plan.social_engagement.map((activity, index) => (
                      <ListItem key={index}>
                        <ListItemText primary={activity} />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </PlanCard>
            </Grid>
            
            {/* Caregiver Breaks */}
            <Grid item xs={12} md={6}>
              <PlanCard>
                <CardContent sx={{ p: 3 }}>
                  <SectionTitle variant="h6">
                    <BreakIcon color="warning" /> Caregiver Self-Care
                  </SectionTitle>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    Remember: Taking care of yourself is essential to provide the best care for your patient.
                  </Alert>
                  <List dense>
                    {plan.caregiver_breaks.map((breakTime, index) => (
                      <ListItem key={index}>
                        <ListItemText primary={breakTime} />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </PlanCard>
            </Grid>
          </Grid>
        </Box>
      ) : (
        <Box sx={{ p: 4, textAlign: 'center', background: 'rgba(0,0,0,0.02)', borderRadius: 2 }}>
          <Typography variant="body1" color="text.secondary" paragraph>
            Generate a personalized daily care plan for {patientData.first_name}. 
            The AI will consider the patient's condition, preferences, and your availability.
          </Typography>
          <Button
            variant="contained"
            startIcon={<CalendarIcon />}
            onClick={() => setShowConstraintsDialog(true)}
          >
            Generate Care Plan
          </Button>
        </Box>
      )}
      
      {/* Caregiver Constraints Dialog */}
      <Dialog open={showConstraintsDialog} onClose={() => setShowConstraintsDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Customize Care Plan</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Customize the care plan generation by providing your availability and constraints.
              This helps the AI create a more realistic and manageable plan.
            </Typography>
          </Box>
          
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Your Availability Today</InputLabel>
                <Select
                  value={caregiverConstraints.available_time}
                  onChange={(e) => setCaregiverConstraints({
                    ...caregiverConstraints,
                    available_time: e.target.value
                  })}
                  label="Your Availability Today"
                >
                  <MenuItem value="full-day">Full Day (8+ hours)</MenuItem>
                  <MenuItem value="morning-only">Morning Only</MenuItem>
                  <MenuItem value="afternoon-only">Afternoon Only</MenuItem>
                  <MenuItem value="evening-only">Evening Only</MenuItem>
                  <MenuItem value="limited">Limited (2-4 hours)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Support Network Availability</InputLabel>
                <Select
                  value={caregiverConstraints.support_network}
                  onChange={(e) => setCaregiverConstraints({
                    ...caregiverConstraints,
                    support_network: e.target.value
                  })}
                  label="Support Network Availability"
                >
                  <MenuItem value="strong">Strong (Other caregivers available)</MenuItem>
                  <MenuItem value="moderate">Moderate (Some help available)</MenuItem>
                  <MenuItem value="limited">Limited (Minimal external support)</MenuItem>
                  <MenuItem value="none">None (I'm the only caregiver today)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Additional Considerations"
                placeholder="E.g., Patient had poor sleep last night, or we have a doctor's appointment at 2 PM..."
                value={caregiverConstraints.considerations}
                onChange={(e) => setCaregiverConstraints({
                  ...caregiverConstraints,
                  considerations: e.target.value
                })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowConstraintsDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleConstraintsSubmit}
            startIcon={<CalendarIcon />}
          >
            Generate Plan
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DailyCareplan; 