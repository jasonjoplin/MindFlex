import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Grid,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  CalendarToday as CalendarIcon,
  EventNote as EventIcon,
  LocationOn as LocationIcon,
  Person as DoctorIcon,
  Timer as TimerIcon,
  Notes as NotesIcon,
  Assignment as AssignmentIcon,
  Print as PrintIcon,
  Save as SaveIcon,
  DescriptionOutlined as SummaryIcon,
  NotificationsActive as ReminderIcon,
  Share as ShareIcon,
  Refresh as RefreshIcon,
  QuestionMark as QuestionIcon,
} from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker, TimePicker } from '@mui/x-date-pickers';
import { format, addDays, differenceInDays, parseISO, parse, isAfter, isBefore, isToday } from 'date-fns';
import { caregiverApi } from '../../services/apiService';

const StatusChip = styled(Chip)(({ theme, status }) => {
  const colors = {
    upcoming: theme.palette.info.main,
    completed: theme.palette.success.main,
    missed: theme.palette.error.main,
    cancelled: theme.palette.warning.main,
  };
  
  return {
    backgroundColor: colors[status] || theme.palette.grey[500],
    color: theme.palette.getContrastText(colors[status] || theme.palette.grey[500]),
    '& .MuiChip-icon': {
      color: 'inherit',
    },
  };
});

const AppointmentManager = ({ patientId, appointments = [] }) => {
  const [appointmentList, setAppointmentList] = useState(appointments.length > 0 ? appointments : []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openSummaryDialog, setOpenSummaryDialog] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [appointmentSummary, setAppointmentSummary] = useState('');
  const [aiPreparationOpen, setAiPreparationOpen] = useState(false);
  const [aiPreparation, setAiPreparation] = useState(null);
  const [generatingPreparation, setGeneratingPreparation] = useState(false);
  
  const [newAppointment, setNewAppointment] = useState({
    title: '',
    doctor: '',
    specialty: '',
    location: '',
    date: new Date(),
    time: new Date(),
    notes: '',
    status: 'upcoming',
    reminder: true,
  });

  useEffect(() => {
    if (appointments.length === 0) {
      fetchAppointments();
    }
  }, [patientId]);

  const fetchAppointments = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // In a production app, you would use the real API:
      // const response = await caregiverApi.getPatientAppointments(patientId);
      // setAppointmentList(response.appointments);
      
      // Mock appointment data
      const mockAppointments = [
        {
          id: 'apt-1',
          title: 'Neurology Follow-up',
          doctor: 'Dr. Sarah Wilson',
          specialty: 'Neurology',
          location: 'Memorial Medical Center',
          date: '2024-03-25',
          time: '10:30',
          notes: 'Discuss recent medication changes and cognitive test results',
          status: 'upcoming',
          reminder: true,
          summary: '',
        },
        {
          id: 'apt-2',
          title: 'Memory Clinic Assessment',
          doctor: 'Dr. Robert Chen',
          specialty: 'Geriatric Psychiatry',
          location: 'Brookside Memory Center',
          date: '2024-03-18',
          time: '14:00',
          notes: 'Annual cognitive assessment',
          status: 'upcoming',
          reminder: true,
          summary: '',
        },
        {
          id: 'apt-3',
          title: 'General Wellness Check',
          doctor: 'Dr. Amy Peterson',
          specialty: 'Primary Care',
          location: 'Community Health Partners',
          date: '2024-03-02',
          time: '09:15',
          notes: 'Routine physical examination',
          status: 'completed',
          reminder: true,
          summary: 'Patient\'s blood pressure was within normal range. Doctor recommended continuing current medication regimen and increasing daily physical activities.',
        }
      ];
      
      setAppointmentList(mockAppointments);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setError('Failed to load appointment data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAppointment = () => {
    setOpenAddDialog(true);
  };

  const handleEditAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    setOpenEditDialog(true);
  };

  const handleSaveAppointment = async () => {
    setLoading(true);
    
    try {
      // In a production app, you would use the real API:
      // await caregiverApi.addPatientAppointment(patientId, newAppointment);
      
      // Mock adding appointment
      const formattedDate = format(new Date(newAppointment.date), 'yyyy-MM-dd');
      const formattedTime = format(new Date(newAppointment.time), 'HH:mm');
      
      const newApt = {
        ...newAppointment,
        id: `apt-${Date.now()}`,
        date: formattedDate,
        time: formattedTime,
        summary: '',
      };
      
      setAppointmentList([...appointmentList, newApt]);
      setOpenAddDialog(false);
      setNewAppointment({
        title: '',
        doctor: '',
        specialty: '',
        location: '',
        date: new Date(),
        time: new Date(),
        notes: '',
        status: 'upcoming',
        reminder: true,
      });
    } catch (error) {
      console.error('Error adding appointment:', error);
      setError('Failed to add appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAppointment = async () => {
    setLoading(true);
    
    try {
      // In a production app, you would use the real API:
      // await caregiverApi.updatePatientAppointment(patientId, selectedAppointment.id, selectedAppointment);
      
      // Mock updating appointment
      const formattedDate = format(new Date(selectedAppointment.date), 'yyyy-MM-dd');
      const formattedTime = selectedAppointment.time instanceof Date 
        ? format(new Date(selectedAppointment.time), 'HH:mm')
        : selectedAppointment.time;
      
      const updatedApt = {
        ...selectedAppointment,
        date: formattedDate,
        time: formattedTime,
      };
      
      const updatedList = appointmentList.map(apt => 
        apt.id === selectedAppointment.id ? updatedApt : apt
      );
      
      setAppointmentList(updatedList);
      setOpenEditDialog(false);
      setSelectedAppointment(null);
    } catch (error) {
      console.error('Error updating appointment:', error);
      setError('Failed to update appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAppointment = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to delete this appointment?')) {
      return;
    }
    
    setLoading(true);
    
    try {
      // In a production app, you would use the real API:
      // await caregiverApi.deletePatientAppointment(patientId, appointmentId);
      
      // Mock deleting appointment
      const updatedList = appointmentList.filter(apt => apt.id !== appointmentId);
      setAppointmentList(updatedList);
    } catch (error) {
      console.error('Error deleting appointment:', error);
      setError('Failed to delete appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangeStatus = async (appointmentId, newStatus) => {
    try {
      // In a production app, you would use the real API:
      // await caregiverApi.updateAppointmentStatus(patientId, appointmentId, newStatus);
      
      // Mock updating status
      const updatedList = appointmentList.map(apt => {
        if (apt.id === appointmentId) {
          return { ...apt, status: newStatus };
        }
        return apt;
      });
      
      setAppointmentList(updatedList);
    } catch (error) {
      console.error('Error updating appointment status:', error);
      setError('Failed to update appointment status. Please try again.');
    }
  };

  const handleOpenSummary = (appointment) => {
    setSelectedAppointment(appointment);
    setAppointmentSummary(appointment.summary || '');
    setOpenSummaryDialog(true);
  };

  const handleSaveSummary = async () => {
    try {
      // In a production app, you would use the real API:
      // await caregiverApi.updateAppointmentSummary(patientId, selectedAppointment.id, appointmentSummary);
      
      // Mock updating summary
      const updatedList = appointmentList.map(apt => {
        if (apt.id === selectedAppointment.id) {
          return { ...apt, summary: appointmentSummary };
        }
        return apt;
      });
      
      setAppointmentList(updatedList);
      setOpenSummaryDialog(false);
    } catch (error) {
      console.error('Error saving appointment summary:', error);
      setError('Failed to save appointment summary. Please try again.');
    }
  };

  const generateAIPreparation = async (appointment) => {
    setSelectedAppointment(appointment);
    setGeneratingPreparation(true);
    setAiPreparationOpen(true);
    
    try {
      // In a production app, you would use the real API:
      // const response = await caregiverApi.generateAppointmentPreparation(patientId, appointment.id);
      // setAiPreparation(response);
      
      // Mock AI-generated preparation
      const mockPreparation = {
        key_topics: [
          "Recent changes in memory retention",
          "Side effects from Donepezil (nausea, loss of appetite)",
          "Effectiveness of cognitive exercises",
          "Sleep pattern disruptions",
          "Anxiety levels in social situations"
        ],
        questions_to_ask: [
          "Could the medication dosage be adjusted to reduce side effects?",
          "What new cognitive exercises would be beneficial at this stage?",
          "Is the current balance of activities appropriate?",
          "Should we be concerned about the recent increase in confusion in the evenings?",
          "Are there any new treatments or trials that might be suitable?"
        ],
        information_to_bring: [
          "Medication adherence records for the past month",
          "Recent mood tracking data, particularly noting any patterns",
          "Log of cognitive exercise performance",
          "Notes on any new behaviors or symptoms",
          "List of current medications and supplements"
        ],
        preparation_tasks: [
          "Schedule blood work 3 days before appointment",
          "Print out medication list and mark any that need refills",
          "Compile a list of specific memory incidents from the past month",
          "Prepare a summary of daily routine and note any difficulties",
          "Gather results from recent cognitive assessments in the app"
        ]
      };
      
      // Simulate API delay
      setTimeout(() => {
        setAiPreparation(mockPreparation);
        setGeneratingPreparation(false);
      }, 1500);
      
    } catch (error) {
      console.error('Error generating appointment preparation:', error);
      setError('Failed to generate appointment preparation. Please try again.');
      setGeneratingPreparation(false);
    }
  };

  const getDaysUntilAppointment = (dateString) => {
    const appointmentDate = parseISO(dateString);
    const today = new Date();
    return differenceInDays(appointmentDate, today);
  };

  const getAppointmentStatusText = (appointment) => {
    if (appointment.status !== 'upcoming') {
      return appointment.status;
    }
    
    const daysUntil = getDaysUntilAppointment(appointment.date);
    if (daysUntil === 0) {
      return 'Today';
    } else if (daysUntil === 1) {
      return 'Tomorrow';
    } else {
      return `In ${daysUntil} days`;
    }
  };

  const renderAppointmentsTable = () => (
    <TableContainer component={Paper} sx={{ mt: 2, borderRadius: 2 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Appointment</TableCell>
            <TableCell>Provider</TableCell>
            <TableCell>Date & Time</TableCell>
            <TableCell>Location</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {appointmentList.map((apt) => (
            <TableRow key={apt.id} sx={{ 
              backgroundColor: apt.status === 'completed' ? 'rgba(76, 175, 80, 0.1)' : 
                              apt.status === 'cancelled' ? 'rgba(255, 152, 0, 0.1)' : 
                              apt.status === 'missed' ? 'rgba(244, 67, 54, 0.1)' : 
                              isToday(parseISO(apt.date)) ? 'rgba(33, 150, 243, 0.1)' : 'transparent'
            }}>
              <TableCell>
                <Typography variant="subtitle2">{apt.title}</Typography>
                <Typography variant="body2" color="textSecondary">{apt.specialty}</Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">{apt.doctor}</Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {format(new Date(apt.date), 'MMM d, yyyy')}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {apt.time}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">{apt.location}</Typography>
              </TableCell>
              <TableCell>
                <StatusChip 
                  label={getAppointmentStatusText(apt)} 
                  status={apt.status} 
                  size="small"
                />
              </TableCell>
              <TableCell>
                <Box>
                  {apt.status === 'upcoming' && (
                    <Tooltip title="Generate Preparation Guide">
                      <IconButton size="small" onClick={() => generateAIPreparation(apt)} sx={{ mr: 0.5 }}>
                        <AssignmentIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                  {apt.status === 'completed' && (
                    <Tooltip title="View/Add Summary">
                      <IconButton size="small" onClick={() => handleOpenSummary(apt)} sx={{ mr: 0.5 }}>
                        <SummaryIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                  <Tooltip title="Edit">
                    <IconButton size="small" onClick={() => handleEditAppointment(apt)} sx={{ mr: 0.5 }}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton size="small" onClick={() => handleDeleteAppointment(apt.id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderAddEditDialog = (isEdit) => {
    const dialogData = isEdit ? selectedAppointment : newAppointment;
    const setDialogData = isEdit 
      ? (data) => setSelectedAppointment({ ...selectedAppointment, ...data }) 
      : (data) => setNewAppointment({ ...newAppointment, ...data });
    
    return (
      <Dialog
        open={isEdit ? openEditDialog : openAddDialog}
        onClose={() => isEdit ? setOpenEditDialog(false) : setOpenAddDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {isEdit ? 'Edit Appointment' : 'Add New Appointment'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Appointment Title"
                value={dialogData.title}
                onChange={(e) => setDialogData({ title: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Doctor/Provider"
                value={dialogData.doctor}
                onChange={(e) => setDialogData({ doctor: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Specialty"
                value={dialogData.specialty}
                onChange={(e) => setDialogData({ specialty: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Location"
                value={dialogData.location}
                onChange={(e) => setDialogData({ location: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Date"
                  value={typeof dialogData.date === 'string' ? new Date(dialogData.date) : dialogData.date}
                  onChange={(newDate) => setDialogData({ date: newDate })}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <TimePicker
                  label="Time"
                  value={
                    typeof dialogData.time === 'string' 
                      ? parse(dialogData.time, 'HH:mm', new Date()) 
                      : dialogData.time
                  }
                  onChange={(newTime) => setDialogData({ time: newTime })}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                value={dialogData.notes}
                onChange={(e) => setDialogData({ notes: e.target.value })}
                multiline
                rows={3}
              />
            </Grid>
            {isEdit && (
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={dialogData.status}
                    label="Status"
                    onChange={(e) => setDialogData({ status: e.target.value })}
                  >
                    <MenuItem value="upcoming">Upcoming</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                    <MenuItem value="missed">Missed</MenuItem>
                    <MenuItem value="cancelled">Cancelled</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => isEdit ? setOpenEditDialog(false) : setOpenAddDialog(false)}
          >
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={isEdit ? handleUpdateAppointment : handleSaveAppointment}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  const renderSummaryDialog = () => (
    <Dialog
      open={openSummaryDialog}
      onClose={() => setOpenSummaryDialog(false)}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        Appointment Summary
      </DialogTitle>
      <DialogContent>
        <Typography variant="subtitle2" gutterBottom>
          {selectedAppointment?.title} with {selectedAppointment?.doctor}
        </Typography>
        <Typography variant="body2" color="textSecondary" gutterBottom>
          {selectedAppointment?.date && format(new Date(selectedAppointment.date), 'MMMM d, yyyy')} at {selectedAppointment?.time}
        </Typography>
        <Divider sx={{ my: 2 }} />
        <TextField
          fullWidth
          label="Appointment Summary"
          value={appointmentSummary}
          onChange={(e) => setAppointmentSummary(e.target.value)}
          multiline
          rows={6}
          placeholder="Enter notes, outcomes, and next steps from this appointment"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpenSummaryDialog(false)}>
          Cancel
        </Button>
        <Button 
          variant="contained" 
          onClick={handleSaveSummary}
        >
          Save Summary
        </Button>
      </DialogActions>
    </Dialog>
  );

  const renderAIPreparationDialog = () => (
    <Dialog
      open={aiPreparationOpen}
      onClose={() => setAiPreparationOpen(false)}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        Appointment Preparation Guide
      </DialogTitle>
      <DialogContent>
        {generatingPreparation ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 4 }}>
            <CircularProgress sx={{ mb: 2 }} />
            <Typography variant="body1">
              Generating personalized preparation guide...
            </Typography>
          </Box>
        ) : (
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              {selectedAppointment?.title} with {selectedAppointment?.doctor}
            </Typography>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              {selectedAppointment?.date && format(new Date(selectedAppointment.date), 'MMMM d, yyyy')} at {selectedAppointment?.time}
            </Typography>
            <Divider sx={{ my: 2 }} />
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                      <AssignmentIcon sx={{ mr: 1 }} />
                      Key Topics to Discuss
                    </Typography>
                    <List dense>
                      {aiPreparation?.key_topics.map((topic, idx) => (
                        <ListItem key={idx}>
                          <ListItemIcon>
                            <Chip size="small" label={idx + 1} />
                          </ListItemIcon>
                          <ListItemText primary={topic} />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                      <QuestionIcon sx={{ mr: 1 }} />
                      Questions to Ask
                    </Typography>
                    <List dense>
                      {aiPreparation?.questions_to_ask.map((question, idx) => (
                        <ListItem key={idx}>
                          <ListItemIcon>
                            <Chip size="small" label={idx + 1} />
                          </ListItemIcon>
                          <ListItemText primary={question} />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                      <NotesIcon sx={{ mr: 1 }} />
                      Information to Bring
                    </Typography>
                    <List dense>
                      {aiPreparation?.information_to_bring.map((info, idx) => (
                        <ListItem key={idx}>
                          <ListItemIcon>
                            <Chip size="small" label={idx + 1} />
                          </ListItemIcon>
                          <ListItemText primary={info} />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                      <EventIcon sx={{ mr: 1 }} />
                      Preparation Tasks
                    </Typography>
                    <List dense>
                      {aiPreparation?.preparation_tasks.map((task, idx) => (
                        <ListItem key={idx}>
                          <ListItemIcon>
                            <Chip size="small" label={idx + 1} />
                          </ListItemIcon>
                          <ListItemText primary={task} />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setAiPreparationOpen(false)}>
          Close
        </Button>
        {!generatingPreparation && (
          <Button 
            variant="outlined" 
            startIcon={<PrintIcon />}
            onClick={() => window.print()}
          >
            Print
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h2" sx={{ display: 'flex', alignItems: 'center' }}>
          <CalendarIcon sx={{ mr: 1 }} />
          Healthcare Appointment Management
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />} 
          onClick={handleAddAppointment}
        >
          Add Appointment
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, borderRadius: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Upcoming Appointments
            </Typography>
            <List dense>
              {appointmentList
                .filter(apt => apt.status === 'upcoming')
                .sort((a, b) => new Date(a.date) - new Date(b.date))
                .slice(0, 3)
                .map((apt) => (
                  <ListItem key={apt.id} disableGutters>
                    <ListItemIcon>
                      <EventIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary={apt.title} 
                      secondary={`${format(new Date(apt.date), 'MMM d')} at ${apt.time} • ${apt.doctor}`} 
                    />
                    <Chip 
                      label={getAppointmentStatusText(apt)} 
                      size="small" 
                      color={
                        getDaysUntilAppointment(apt.date) <= 2 
                          ? 'primary' 
                          : 'default'
                      }
                    />
                  </ListItem>
              ))}
              {appointmentList.filter(apt => apt.status === 'upcoming').length === 0 && (
                <ListItem>
                  <ListItemText 
                    primary="No upcoming appointments" 
                    secondary="Click 'Add Appointment' to schedule one" 
                  />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, borderRadius: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Recent Appointment Summaries
            </Typography>
            <List dense>
              {appointmentList
                .filter(apt => apt.status === 'completed' && apt.summary)
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .slice(0, 2)
                .map((apt) => (
                  <ListItem key={apt.id} alignItems="flex-start" disableGutters>
                    <ListItemIcon>
                      <SummaryIcon color="success" />
                    </ListItemIcon>
                    <ListItemText 
                      primary={`${apt.title} with ${apt.doctor}`}
                      secondary={
                        <>
                          <Typography component="span" variant="body2" color="textSecondary">
                            {format(new Date(apt.date), 'MMMM d, yyyy')}
                          </Typography>
                          <Typography component="p" variant="body2" sx={{ mt: 0.5 }}>
                            {apt.summary.length > 150 ? `${apt.summary.substring(0, 150)}...` : apt.summary}
                          </Typography>
                        </>
                      } 
                    />
                    <Button size="small" onClick={() => handleOpenSummary(apt)}>
                      View
                    </Button>
                  </ListItem>
              ))}
              {appointmentList.filter(apt => apt.status === 'completed' && apt.summary).length === 0 && (
                <ListItem>
                  <ListItemText 
                    primary="No appointment summaries" 
                    secondary="Add summaries to completed appointments to keep track of results and recommendations" 
                  />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>
      </Grid>

      {loading && !appointmentList.length ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        appointmentList.length > 0 ? (
          renderAppointmentsTable()
        ) : (
          <Paper sx={{ p: 3, textAlign: 'center', borderRadius: 2 }}>
            <Typography variant="body1" gutterBottom>
              No appointments added yet.
            </Typography>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />} 
              onClick={handleAddAppointment}
              sx={{ mt: 1 }}
            >
              Add Appointment
            </Button>
          </Paper>
        )
      )}

      {/* Add/Edit Appointment Dialog */}
      {renderAddEditDialog(false)}
      {selectedAppointment && renderAddEditDialog(true)}
      
      {/* Summary Dialog */}
      {selectedAppointment && renderSummaryDialog()}
      
      {/* AI Preparation Dialog */}
      {selectedAppointment && renderAIPreparationDialog()}
    </Box>
  );
};

export default AppointmentManager; 