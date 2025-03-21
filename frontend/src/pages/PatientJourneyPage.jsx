import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Tabs,
  Tab,
  Button,
  Grid,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Divider,
  useTheme,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  Psychology as PsychologyIcon,
  Equalizer as EqualizerIcon,
  EmojiEvents as ChallengesIcon,
  MenuBook as NotesIcon,
  PictureAsPdf as PdfIcon,
  Notifications as ReminderIcon,
  Dashboard as DashboardIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  Check as CheckIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';

// Import Patient Journey components
import CognitiveAssessment from '../components/assessment/CognitiveAssessment';
import PersonalizedTrainingPlan from '../components/training/PersonalizedTrainingPlan';
import DailyChallenges from '../components/challenges/DailyChallenges';
import PatientNotes from '../components/caregiver/PatientNotes';
import PatientReport from '../components/caregiver/PatientReport';
import ReminderSystem from '../components/caregiver/ReminderSystem';

const PatientJourneyPage = () => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  
  // State for tabs and drawer
  const [tabValue, setTabValue] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentJourneyStep, setCurrentJourneyStep] = useState(0);
  const [patientId, setPatientId] = useState(1); // Mock patient ID
  const [patientData, setPatientData] = useState(null);
  
  // Fetch patient data
  useEffect(() => {
    // Simulate API call to get patient data
    setTimeout(() => {
      setPatientData({
        id: patientId,
        name: 'John Doe',
        age: 72,
        diagnosis: 'Mild Cognitive Impairment',
        joinDate: '2023-05-15',
        lastActive: '2023-06-10',
        completedAssessment: true,
        hasTrainingPlan: true,
        lastChallengeDate: '2023-06-08',
        progressData: {
          memory: 68,
          attention: 75,
          processingSpeed: 62,
          reasoning: 70,
        },
      });
      setLoading(false);
    }, 1500);
  }, [patientId]);
  
  // Journey steps configuration
  const journeySteps = [
    {
      label: 'Cognitive Assessment',
      description: 'Establish baseline cognitive abilities through a comprehensive assessment',
      icon: <AssessmentIcon />,
      component: CognitiveAssessment,
      tabIndex: 0,
    },
    {
      label: 'Personalized Training Plan',
      description: 'Generate a tailored training plan based on assessment results',
      icon: <PsychologyIcon />,
      component: PersonalizedTrainingPlan,
      tabIndex: 1,
    },
    {
      label: 'Daily Challenges',
      description: 'Engage with daily cognitive challenges to maintain skills',
      icon: <ChallengesIcon />,
      component: DailyChallenges,
      tabIndex: 2,
    },
    {
      label: 'Caregiver Tools',
      description: 'Access tools for monitoring and supporting patient progress',
      icon: <EqualizerIcon />,
      subSteps: [
        {
          label: 'Patient Notes',
          icon: <NotesIcon />,
          component: PatientNotes,
          tabIndex: 3,
        },
        {
          label: 'Progress Reports',
          icon: <PdfIcon />,
          component: PatientReport,
          tabIndex: 4,
        },
        {
          label: 'Reminder System',
          icon: <ReminderIcon />,
          component: ReminderSystem,
          tabIndex: 5,
        },
      ],
    },
  ];
  
  // Tab configuration (flattened journey steps)
  const tabs = [
    { label: 'Assessment', icon: <AssessmentIcon />, component: CognitiveAssessment },
    { label: 'Training Plan', icon: <PsychologyIcon />, component: PersonalizedTrainingPlan },
    { label: 'Daily Challenges', icon: <ChallengesIcon />, component: DailyChallenges },
    { label: 'Patient Notes', icon: <NotesIcon />, component: PatientNotes },
    { label: 'Progress Reports', icon: <PdfIcon />, component: PatientReport },
    { label: 'Reminder System', icon: <ReminderIcon />, component: ReminderSystem },
  ];
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setDrawerOpen(false);
  };
  
  // Handle drawer toggle
  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };
  
  // Navigate to journey step
  const navigateToStep = (stepIndex, tabIndex) => {
    setCurrentJourneyStep(stepIndex);
    setTabValue(tabIndex);
    setDrawerOpen(false);
  };
  
  // Get current component based on tab value
  const CurrentComponent = tabs[tabValue].component;
  
  // Determine if this is a caregiver view (tabs 3-5)
  const isCaregiverView = tabValue >= 3;
  
  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        {/* Mobile drawer for navigation */}
        {isSmallScreen && (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h5">
                Patient Journey
              </Typography>
              <IconButton color="primary" onClick={handleDrawerToggle}>
                <MenuIcon />
              </IconButton>
            </Box>
            
            <Drawer
              anchor="right"
              open={drawerOpen}
              onClose={handleDrawerToggle}
            >
              <Box
                sx={{ width: 250 }}
                role="presentation"
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
                  <Typography variant="h6">Journey Steps</Typography>
                  <IconButton onClick={handleDrawerToggle}>
                    <CloseIcon />
                  </IconButton>
                </Box>
                <Divider />
                <List>
                  {journeySteps.map((step, index) => (
                    <React.Fragment key={`step-${index}`}>
                      {step.subSteps ? (
                        <>
                          <ListItem>
                            <ListItemIcon>
                              {step.icon}
                            </ListItemIcon>
                            <ListItemText primary={step.label} />
                          </ListItem>
                          <List component="div" disablePadding>
                            {step.subSteps.map((subStep, subIndex) => (
                              <ListItem 
                                key={`substep-${subIndex}`}
                                button 
                                onClick={() => navigateToStep(index, subStep.tabIndex)}
                                sx={{ 
                                  pl: 4,
                                  bgcolor: tabValue === subStep.tabIndex ? 'action.selected' : 'transparent',
                                }}
                              >
                                <ListItemIcon>
                                  {subStep.icon}
                                </ListItemIcon>
                                <ListItemText primary={subStep.label} />
                              </ListItem>
                            ))}
                          </List>
                        </>
                      ) : (
                        <ListItem 
                          button 
                          onClick={() => navigateToStep(index, step.tabIndex)}
                          sx={{ 
                            bgcolor: tabValue === step.tabIndex ? 'action.selected' : 'transparent',
                          }}
                        >
                          <ListItemIcon>
                            {step.icon}
                          </ListItemIcon>
                          <ListItemText primary={step.label} />
                        </ListItem>
                      )}
                    </React.Fragment>
                  ))}
                </List>
              </Box>
            </Drawer>
          </>
        )}
        
        <Grid container spacing={4}>
          {/* Left sidebar for desktop */}
          {!isSmallScreen && (
            <Grid item md={3} lg={2}>
              <Paper
                sx={{
                  p: 3,
                  background: theme => theme.palette.mode === 'dark'
                    ? 'rgba(19, 47, 76, 0.4)'
                    : 'rgba(255, 255, 255, 0.8)',
                  borderRadius: 2,
                  height: '100%',
                }}
              >
                <Typography variant="h6" gutterBottom>
                  Patient Journey
                </Typography>
                
                <Stepper orientation="vertical" activeStep={currentJourneyStep} sx={{ mt: 3 }}>
                  {journeySteps.map((step, index) => (
                    <Step key={step.label}>
                      <StepLabel StepIconComponent={() => (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {index < currentJourneyStep ? (
                            <CheckIcon color="success" />
                          ) : (
                            step.icon
                          )}
                        </Box>
                      )}>
                        <Typography variant="subtitle2">{step.label}</Typography>
                      </StepLabel>
                      <StepContent>
                        <Typography variant="body2" color="text.secondary" paragraph>
                          {step.description}
                        </Typography>
                        
                        {step.subSteps && (
                          <List dense sx={{ ml: 1, mt: 1 }}>
                            {step.subSteps.map((subStep, subIndex) => (
                              <ListItem 
                                key={subStep.label}
                                button
                                dense
                                onClick={() => navigateToStep(index, subStep.tabIndex)}
                                sx={{ 
                                  borderRadius: 1,
                                  bgcolor: tabValue === subStep.tabIndex ? 'action.selected' : 'transparent',
                                }}
                              >
                                <ListItemIcon sx={{ minWidth: 36 }}>
                                  {subStep.icon}
                                </ListItemIcon>
                                <ListItemText primary={subStep.label} />
                              </ListItem>
                            ))}
                          </List>
                        )}
                        
                        {!step.subSteps && (
                          <Button
                            variant={tabValue === step.tabIndex ? "contained" : "outlined"}
                            color="primary"
                            size="small"
                            onClick={() => navigateToStep(index, step.tabIndex)}
                            sx={{ mt: 1 }}
                          >
                            {tabValue === step.tabIndex ? 'Current Step' : 'Go to Step'}
                          </Button>
                        )}
                      </StepContent>
                    </Step>
                  ))}
                </Stepper>
              </Paper>
            </Grid>
          )}
          
          {/* Main content area */}
          <Grid item xs={12} md={9} lg={10}>
            {/* Tabs for navigation */}
            <Paper 
              elevation={0}
              sx={{ 
                bgcolor: 'background.default',
                display: 'flex',
                justifyContent: 'center',
                mb: 3,
                borderRadius: 2,
                overflow: 'auto',
              }}
            >
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                variant={isSmallScreen ? "scrollable" : "fullWidth"}
                scrollButtons="auto"
                textColor="primary"
                indicatorColor="primary"
                sx={{ width: '100%' }}
              >
                {tabs.map((tab, index) => (
                  <Tab 
                    key={index}
                    label={!isSmallScreen ? tab.label : null}
                    icon={tab.icon}
                    iconPosition="start"
                    sx={{ 
                      minHeight: 48,
                      justifyContent: 'flex-start',
                      minWidth: isSmallScreen ? 'auto' : 120,
                    }}
                  />
                ))}
              </Tabs>
            </Paper>
            
            {/* Patient info card (only if in caregiver view) */}
            {isCaregiverView && patientData && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Paper 
                  sx={{ 
                    p: 2, 
                    mb: 3,
                    background: theme => theme.palette.mode === 'dark'
                      ? 'rgba(19, 47, 76, 0.2)'
                      : 'rgba(255, 255, 255, 0.6)',
                    borderRadius: 2,
                  }}
                >
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ mr: 2 }}>
                          <Box
                            sx={{
                              width: 60,
                              height: 60,
                              borderRadius: '50%',
                              bgcolor: 'primary.main',
                              color: 'white',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: 24,
                            }}
                          >
                            {patientData.name.charAt(0)}
                          </Box>
                        </Box>
                        <Box>
                          <Typography variant="h6">{patientData.name}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {patientData.age} years • {patientData.diagnosis}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">
                            PATIENT SINCE
                          </Typography>
                          <Typography variant="body2">
                            {new Date(patientData.joinDate).toLocaleDateString()}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">
                            LAST ACTIVE
                          </Typography>
                          <Typography variant="body2">
                            {new Date(patientData.lastActive).toLocaleDateString()}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                </Paper>
              </motion.div>
            )}
            
            {/* Content area */}
            <Paper
              sx={{
                p: 3,
                background: theme => theme.palette.mode === 'dark'
                  ? 'rgba(19, 47, 76, 0.4)'
                  : 'rgba(255, 255, 255, 0.8)',
                borderRadius: 2,
                minHeight: '70vh',
              }}
            >
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                  <CircularProgress />
                </Box>
              ) : (
                <CurrentComponent patient={patientData} />
              )}
            </Paper>
            
            {/* Navigation buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
              <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                onClick={() => handleTabChange(null, Math.max(0, tabValue - 1))}
                disabled={tabValue === 0}
              >
                Previous Step
              </Button>
              
              <Button
                variant="contained"
                endIcon={<ArrowForwardIcon />}
                onClick={() => handleTabChange(null, Math.min(tabs.length - 1, tabValue + 1))}
                disabled={tabValue === tabs.length - 1}
              >
                Next Step
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default PatientJourneyPage; 