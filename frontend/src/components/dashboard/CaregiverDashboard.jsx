import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Button,
  CircularProgress,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Badge,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Person as PersonIcon,
  Assessment as AssessmentIcon,
  Settings as SettingsIcon,
  Insights as InsightsIcon,
  CalendarToday as CalendarIcon,
  Note as NoteIcon,
  Medication as MedicationIcon,
  Psychology as PsychologyIcon,
  SupportAgent as SupportAgentIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { caregiverApi } from '../../services/apiService';
import PatientList from './PatientList';
import PatientProgress from './PatientProgress';
import PatientSettings from './PatientSettings';
import AddPatientDialog from './AddPatientDialog';
import PatientInsights from '../caregiver/PatientInsights';
import DailyCareplan from '../caregiver/DailyCareplan';
import PatientNotes from '../caregiver/PatientNotes';
import MoodTracking from '../caregiver/MoodTracking';
import MedicationManager from '../caregiver/MedicationManager';
import AppointmentManager from '../caregiver/AppointmentManager';
import AICareAssistant from '../caregiver/AICareAssistant';

const CaregiverDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showAddPatient, setShowAddPatient] = useState(false);
  const [patientDetails, setPatientDetails] = useState(null);
  const [aiRecommendations, setAiRecommendations] = useState(null);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [stats, setStats] = useState({
    totalPatients: 0,
    activePatients: 0,
    totalSessions: 0,
    averageScore: 0,
    patientProgress: 0,
    pendingMedications: 0,
    upcomingAppointments: 0,
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // In a production app, you would fetch real data from your API
        // const response = await caregiverApi.getPatients(user.id);
        // setPatients(response.patients);
        
        // Mock data for now
        const mockPatients = [
          {
            id: 'patient-1',
            name: 'John Doe',
            age: 72,
            gender: 'Male',
            condition: 'Mild Cognitive Impairment',
            lastActive: '2024-03-06',
            progress: 75,
            totalSessions: 42,
            averageScore: 850,
            additionalNotes: 'Responds well to memory exercises. Struggles with numerical reasoning.'
          },
          {
            id: 'patient-2',
            name: 'Emily Johnson',
            age: 68,
            gender: 'Female',
            condition: 'Early Stage Dementia',
            lastActive: '2024-03-07',
            progress: 60,
            totalSessions: 28,
            averageScore: 720,
            additionalNotes: 'Shows improvement in visual recognition tasks.'
          },
          {
            id: 'patient-3',
            name: 'Robert Smith',
            age: 76,
            gender: 'Male',
            condition: 'Memory Loss',
            lastActive: '2024-03-02',
            progress: 45,
            totalSessions: 15,
            averageScore: 680,
            additionalNotes: 'New patient, still adapting to the program.'
          },
        ];

        const mockStats = {
          totalPatients: mockPatients.length,
          activePatients: mockPatients.filter(p => new Date(p.lastActive) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length,
          totalSessions: mockPatients.reduce((acc, p) => acc + p.totalSessions, 0),
          averageScore: mockPatients.reduce((acc, p) => acc + p.averageScore, 0) / mockPatients.length,
          patientProgress: 68,
          pendingMedications: 5,
          upcomingAppointments: 3,
        };

        setPatients(mockPatients);
        setStats(mockStats);
        setLoading(false);
        
        // Set first patient as selected by default
        if (mockPatients.length > 0) {
          setSelectedPatient(mockPatients[0]);
          fetchPatientDetails(mockPatients[0].id);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  const fetchPatientDetails = async (patientId) => {
    try {
      setLoading(true);
      // In a production app, you would use:
      // const response = await caregiverApi.getPatientDetails(patientId);
      // setPatientDetails(response.patient);
      
      // Mock data for now
      const mockPatientDetails = {
        id: patientId,
        first_name: patientId === 'patient-1' ? 'John' : (patientId === 'patient-2' ? 'Emily' : 'Robert'),
        last_name: patientId === 'patient-1' ? 'Doe' : (patientId === 'patient-2' ? 'Johnson' : 'Smith'),
        age: patientId === 'patient-1' ? 72 : (patientId === 'patient-2' ? 68 : 76),
        condition: patientId === 'patient-1' ? 'Mild Cognitive Impairment' : (patientId === 'patient-2' ? 'Early Stage Dementia' : 'Memory Loss'),
        gender: patientId === 'patient-1' ? 'Male' : (patientId === 'patient-2' ? 'Female' : 'Male'),
        mobility: 'Good',
        strengths: ['Visual memory', 'Name recognition', 'Social interaction'],
        improvement_areas: ['Short-term memory', 'Numerical skills', 'Sequential tasks'],
        interests: ['Music', 'Gardening', 'Family photos'],
        medications: [
          {
            id: 'med-1',
            name: 'Donepezil',
            dosage: '5mg',
            frequency: 'Once daily',
            time: '08:00',
          },
          {
            id: 'med-2',
            name: 'Vitamin B Complex',
            dosage: '1 tablet',
            frequency: 'Once daily',
            time: '08:00',
          }
        ],
        appointments: [
          {
            id: 'appt-1',
            title: 'Neurologist Appointment',
            date: '2024-05-15',
            time: '10:00',
            location: 'Memorial Hospital',
          }
        ],
        game_history: [
          {
            game_name: 'Word Puzzle',
            score: 85,
            date: '2024-04-10',
          },
          {
            game_name: 'Pattern Recognition',
            score: 72,
            date: '2024-04-12',
          }
        ],
        reported_symptoms: [
          {
            mood: 'content',
            timestamp: '2024-04-10',
            symptoms: ['slight confusion in the morning'],
          },
          {
            mood: 'agitated',
            timestamp: '2024-04-11',
            symptoms: ['restlessness', 'irritability'],
          }
        ]
      };
      
      setPatientDetails(mockPatientDetails);
      fetchAiRecommendations(patientId);
    } catch (error) {
      console.error('Error fetching patient details:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAiRecommendations = async (patientId) => {
    try {
      setLoadingRecommendations(true);
      // In a production app, you would use:
      // const response = await caregiverApi.getRecommendations(patientId);
      // setAiRecommendations(response.recommendations);
      
      // Mock recommendations
      const mockRecommendations = `
Based on the patient's data, here are personalized care recommendations:

1. Care approaches:
   - Continue using memory exercises that involve visual recognition, as this is a strength area
   - Break tasks into smaller, manageable steps to accommodate difficulty with sequential tasks
   - Schedule cognitive activities during morning hours when alertness is typically higher
   - Maintain a consistent daily routine to reduce anxiety and confusion

2. Communication strategies:
   - Use simple, clear language and repeat important information as needed
   - Supplement verbal instructions with visual cues when possible
   - Maintain eye contact and a calm demeanor during conversations
   - Allow extra time for processing information and formulating responses

3. Cognitive exercises:
   - Visual memory games that build on existing strengths
   - Simple numerical exercises to gradually improve mathematical skills
   - Music-based memory activities, leveraging the patient's interest in music
   - Photo recognition exercises using family photos to stimulate recognition and recall

4. Lifestyle adjustments:
   - Encourage regular physical activity appropriate for their mobility level
   - Incorporate gardening activities as therapeutic engagement
   - Ensure adequate sleep and regular meal times
   - Reduce environmental distractions during cognitive tasks

5. Warning signs to watch for:
   - Increased frequency or severity of confusion episodes
   - Changes in sleep patterns or appetite
   - Withdrawal from previously enjoyed activities
   - Escalation in agitation, particularly in the afternoons
   - Any sudden changes in cognitive abilities or behavior
      `;
      
      setAiRecommendations(mockRecommendations);
    } catch (error) {
      console.error('Error fetching AI recommendations:', error);
    } finally {
      setLoadingRecommendations(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient);
    fetchPatientDetails(patient.id);
  };

  const handleAddPatient = async (patientData) => {
    try {
      // In a production app, you would use:
      // const response = await caregiverApi.addPatient({
      //   caregiver_id: user.id,
      //   patient_id: patientData.id,
      //   relationship: patientData.relationship
      // });
      
      // Mock implementation
      const newPatient = {
        id: `patient-${patients.length + 1}`,
        ...patientData,
        lastActive: new Date().toISOString().split('T')[0],
        progress: 0,
        totalSessions: 0,
        averageScore: 0,
      };

      setPatients([...patients, newPatient]);
      setShowAddPatient(false);
    } catch (error) {
      console.error('Error adding patient:', error);
    }
  };

  if (loading && !patientDetails) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" component="h1">
            Caregiver Dashboard
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setShowAddPatient(true)}
          >
            Add Patient
          </Button>
        </Box>

        {/* Dashboard Stats */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
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
                <Typography variant="h6" gutterBottom>Total Patients</Typography>
                <Typography variant="h3">{stats.totalPatients}</Typography>
              </Paper>
            </motion.div>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
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
                <Typography variant="h6" gutterBottom>Patient Progress</Typography>
                <Typography variant="h3">{stats.patientProgress}%</Typography>
              </Paper>
            </motion.div>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
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
                <Typography variant="h6" gutterBottom>Medications</Typography>
                <Typography variant="h3">
                  <Badge badgeContent={stats.pendingMedications} color="error">
                    {stats.pendingMedications}
                  </Badge>
                </Typography>
              </Paper>
            </motion.div>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
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
                <Typography variant="h6" gutterBottom>Appointments</Typography>
                <Typography variant="h3">
                  <Badge badgeContent={stats.upcomingAppointments} color="primary">
                    {stats.upcomingAppointments}
                  </Badge>
                </Typography>
              </Paper>
            </motion.div>
          </Grid>
        </Grid>

        {/* Main Content */}
        <Grid container spacing={3}>
          {/* Patient List */}
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 2, borderRadius: 2, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Patients
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <PatientList 
                patients={patients} 
                selectedPatient={selectedPatient}
                onSelectPatient={handlePatientSelect}
              />
            </Paper>
          </Grid>
          
          {/* Patient Detail Area */}
          <Grid item xs={12} md={9}>
            <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
              {selectedPatient ? (
                <>
                  <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs 
                      value={activeTab} 
                      onChange={handleTabChange} 
                      variant="scrollable"
                      scrollButtons="auto"
                      sx={{ px: 2 }}
                    >
                      <Tab icon={<InsightsIcon />} label="Insights" />
                      <Tab icon={<CalendarIcon />} label="Daily Plan" />
                      <Tab icon={<NoteIcon />} label="Notes" />
                      <Tab icon={<AssessmentIcon />} label="Progress" />
                      <Tab icon={<PsychologyIcon />} label="Mood Tracking" />
                      <Tab icon={<MedicationIcon />} label="Medications" />
                      <Tab icon={<CalendarIcon />} label="Appointments" />
                      <Tab icon={<SupportAgentIcon />} label="AI Assistant" />
                      <Tab icon={<SettingsIcon />} label="Settings" />
                    </Tabs>
                  </Box>
                  
                  {/* Tab Panels */}
                  <Box sx={{ p: 3 }}>
                    {/* Insights Panel */}
                    {activeTab === 0 && (
                      <PatientInsights 
                        patientId={selectedPatient.id} 
                        patientData={patientDetails}
                        recommendations={aiRecommendations}
                        loadingRecommendations={loadingRecommendations}
                      />
                    )}
                    
                    {/* Daily Plan Panel */}
                    {activeTab === 1 && (
                      <DailyCareplan 
                        patientId={selectedPatient.id}
                        patientData={patientDetails}
                      />
                    )}
                    
                    {/* Notes Panel */}
                    {activeTab === 2 && (
                      <PatientNotes 
                        patientId={selectedPatient.id}
                      />
                    )}
                    
                    {/* Progress Panel */}
                    {activeTab === 3 && (
                      <PatientProgress 
                        patientId={selectedPatient.id}
                        patientData={patientDetails}
                      />
                    )}
                    
                    {/* Mood Tracking Panel */}
                    {activeTab === 4 && (
                      <MoodTracking 
                        patientId={selectedPatient.id}
                      />
                    )}
                    
                    {/* Medications Panel */}
                    {activeTab === 5 && (
                      <MedicationManager 
                        patientId={selectedPatient.id}
                        medications={patientDetails?.medications || []}
                      />
                    )}
                    
                    {/* Appointments Panel */}
                    {activeTab === 6 && (
                      <AppointmentManager 
                        patientId={selectedPatient.id}
                        appointments={patientDetails?.appointments || []}
                      />
                    )}
                    
                    {/* AI Assistant Panel */}
                    {activeTab === 7 && (
                      <AICareAssistant 
                        patientId={selectedPatient.id}
                        patientData={patientDetails}
                      />
                    )}
                    
                    {/* Settings Panel */}
                    {activeTab === 8 && (
                      <PatientSettings 
                        patientId={selectedPatient.id}
                        patientData={patientDetails}
                      />
                    )}
                  </Box>
                </>
              ) : (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <Typography variant="h6" color="text.secondary">
                    Select a patient to view details
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>
      
      {/* Add Patient Dialog */}
      <AddPatientDialog 
        open={showAddPatient}
        onClose={() => setShowAddPatient(false)}
        onAdd={handleAddPatient}
      />
    </Container>
  );
};

export default CaregiverDashboard; 