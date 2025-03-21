import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Divider,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  TextField,
  CircularProgress,
  useTheme,
  Card,
  CardContent,
  CardHeader,
} from '@mui/material';
import {
  Download as DownloadIcon,
  Print as PrintIcon,
  Email as EmailIcon,
  Article as ReportIcon,
  DateRange as DateRangeIcon,
  Assessment as AssessmentIcon,
  BrokenImage as NoDataIcon,
  BarChart as ChartIcon,
  TableChart as TableIcon,
  FormatListBulleted as ListIcon,
  PictureAsPdf as PDFIcon,
} from '@mui/icons-material';
import { 
  LineChart, 
  Line, 
  BarChart,
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';

// Mock data generator for patient reports
const generateReportData = (patientId, startDate, endDate) => {
  const days = Math.floor((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) + 1;
  const data = {
    patientInfo: {
      id: patientId,
      name: 'John Doe',
      age: 72,
      diagnosis: 'Mild Cognitive Impairment',
      caregiverName: 'Dr. Sarah Johnson',
    },
    period: {
      start: startDate,
      end: endDate,
    },
    overview: {
      totalSessions: Math.floor(days * 0.7), // Average 0.7 sessions per day
      totalTimeMinutes: Math.floor(days * 0.7 * 15), // Average 15 minutes per session
      averageScore: Math.floor(Math.random() * 200) + 700, // 700-900
      highestScore: Math.floor(Math.random() * 200) + 800, // 800-1000
      streakDays: Math.min(Math.floor(days * 0.5), 5), // Up to 5 days or half the period
    },
    gamePerformance: [
      {
        name: 'Memory Match',
        averageScore: Math.floor(Math.random() * 200) + 700,
        sessionsCompleted: Math.floor(days * 0.2),
        improvement: Math.floor(Math.random() * 30) + 10, // 10-40%
        lastPlayed: new Date(new Date(endDate).setDate(new Date(endDate).getDate() - Math.floor(Math.random() * 5))).toISOString(),
      },
      {
        name: 'Word Scramble',
        averageScore: Math.floor(Math.random() * 200) + 650,
        sessionsCompleted: Math.floor(days * 0.15),
        improvement: Math.floor(Math.random() * 20) + 5, // 5-25%
        lastPlayed: new Date(new Date(endDate).setDate(new Date(endDate).getDate() - Math.floor(Math.random() * 7))).toISOString(),
      },
      {
        name: 'Pattern Memory',
        averageScore: Math.floor(Math.random() * 200) + 750,
        sessionsCompleted: Math.floor(days * 0.1),
        improvement: Math.floor(Math.random() * 40) + 15, // 15-55%
        lastPlayed: new Date(new Date(endDate).setDate(new Date(endDate).getDate() - Math.floor(Math.random() * 10))).toISOString(),
      },
      {
        name: 'Math Challenge',
        averageScore: Math.floor(Math.random() * 200) + 600,
        sessionsCompleted: Math.floor(days * 0.1),
        improvement: Math.floor(Math.random() * 25) + 5, // 5-30%
        lastPlayed: new Date(new Date(endDate).setDate(new Date(endDate).getDate() - Math.floor(Math.random() * 12))).toISOString(),
      },
      {
        name: 'Reaction Speed',
        averageScore: Math.floor(Math.random() * 200) + 800,
        sessionsCompleted: Math.floor(days * 0.15),
        improvement: Math.floor(Math.random() * 35) + 10, // 10-45%
        lastPlayed: new Date(new Date(endDate).setDate(new Date(endDate).getDate() - Math.floor(Math.random() * 6))).toISOString(),
      },
    ],
    cognitiveAreas: [
      {
        name: 'Memory',
        score: Math.floor(Math.random() * 30) + 60, // 60-90
        change: Math.floor(Math.random() * 20) - 5, // -5 to +15
      },
      {
        name: 'Attention',
        score: Math.floor(Math.random() * 30) + 65, // 65-95
        change: Math.floor(Math.random() * 15) + 5, // +5 to +20
      },
      {
        name: 'Processing Speed',
        score: Math.floor(Math.random() * 30) + 55, // 55-85
        change: Math.floor(Math.random() * 25) - 5, // -5 to +20
      },
      {
        name: 'Reasoning',
        score: Math.floor(Math.random() * 30) + 60, // 60-90
        change: Math.floor(Math.random() * 15), // 0 to +15
      },
    ],
    progressChartData: [],
    sessionNotes: [],
  };
  
  // Generate daily progress data
  const startDateObj = new Date(startDate);
  for (let i = 0; i < days; i++) {
    const currentDate = new Date(startDateObj);
    currentDate.setDate(startDateObj.getDate() + i);
    
    // 70% chance of having data for a day
    if (Math.random() < 0.7) {
      data.progressChartData.push({
        date: currentDate.toISOString().split('T')[0],
        score: Math.floor(Math.random() * 200) + 600 + (i * 3), // Slight upward trend
        timeSpent: Math.floor(Math.random() * 15) + 10, // 10-25 minutes
      });
    }
  }
  
  // Generate session notes
  const noteTemplates = [
    'Patient showed improvement in {area} exercises.',
    'Patient struggled with {area} tasks but remained engaged.',
    'Patient completed all assigned {area} exercises with minimal assistance.',
    'Patient demonstrated good progress in {area} skills during the session.',
    'Patient needed reminders to stay focused on {area} activities.',
  ];
  
  const areas = ['memory', 'attention', 'problem-solving', 'visual processing', 'numerical reasoning'];
  
  for (let i = 0; i < Math.min(5, days); i++) {
    const noteDate = new Date(startDateObj);
    noteDate.setDate(startDateObj.getDate() + Math.floor(Math.random() * days));
    
    const noteTemplate = noteTemplates[Math.floor(Math.random() * noteTemplates.length)];
    const area = areas[Math.floor(Math.random() * areas.length)];
    
    data.sessionNotes.push({
      id: `note-${i}`,
      date: noteDate.toISOString(),
      content: noteTemplate.replace('{area}', area),
      author: 'Dr. Sarah Johnson',
    });
  }
  
  // Sort notes by date
  data.sessionNotes.sort((a, b) => new Date(a.date) - new Date(b.date));
  
  return data;
};

// Helper function to format dates
const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

// Component for date range selector
const DateRangeSelector = ({ startDate, endDate, onDateChange }) => {
  const handleStartDateChange = (e) => {
    onDateChange('startDate', e.target.value);
  };
  
  const handleEndDateChange = (e) => {
    onDateChange('endDate', e.target.value);
  };
  
  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Start Date"
          type="date"
          value={startDate}
          onChange={handleStartDateChange}
          InputLabelProps={{ shrink: true }}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="End Date"
          type="date"
          value={endDate}
          onChange={handleEndDateChange}
          InputLabelProps={{ shrink: true }}
          inputProps={{ min: startDate }}
        />
      </Grid>
    </Grid>
  );
};

// Component for report templates
const ReportTemplates = ({ selectedTemplate, onTemplateChange }) => {
  const templates = [
    { id: 'comprehensive', name: 'Comprehensive Report', icon: <ReportIcon /> },
    { id: 'summary', name: 'Executive Summary', icon: <ListIcon /> },
    { id: 'progress', name: 'Progress Report', icon: <ChartIcon /> },
    { id: 'clinical', name: 'Clinical Report', icon: <AssessmentIcon /> },
  ];
  
  return (
    <Grid container spacing={2}>
      {templates.map((template) => (
        <Grid item xs={6} sm={3} key={template.id}>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Paper
              sx={{
                p: 2,
                textAlign: 'center',
                cursor: 'pointer',
                bgcolor: selectedTemplate === template.id ? 'primary.main' : 'background.paper',
                color: selectedTemplate === template.id ? 'white' : 'text.primary',
                '&:hover': {
                  bgcolor: selectedTemplate === template.id 
                    ? 'primary.dark' 
                    : 'action.hover',
                },
              }}
              onClick={() => onTemplateChange(template.id)}
            >
              <Box sx={{ mb: 1 }}>
                {template.icon}
              </Box>
              <Typography variant="body2">{template.name}</Typography>
            </Paper>
          </motion.div>
        </Grid>
      ))}
    </Grid>
  );
};

// PDF Report Preview component
const ReportPreview = ({ reportData, template }) => {
  const theme = useTheme();
  
  if (!reportData) return null;
  
  const { patientInfo, period, overview, gamePerformance, cognitiveAreas, progressChartData, sessionNotes } = reportData;
  
  // COLORS for charts
  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe'];
  
  return (
    <Box sx={{ mt: 4 }}>
      <Paper
        sx={{
          p: 4,
          maxWidth: '800px',
          mx: 'auto',
          backgroundColor: 'white',
          color: 'black',
          boxShadow: 3,
        }}
      >
        {/* Report Header */}
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h4" sx={{ color: '#333', mb: 1 }}>
            Patient Progress Report
          </Typography>
          <Typography variant="subtitle1" sx={{ color: '#666' }}>
            {formatDate(period.start)} to {formatDate(period.end)}
          </Typography>
        </Box>
        
        {/* Patient Information */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ color: '#333', mb: 2, borderBottom: '1px solid #eee', pb: 1 }}>
            Patient Information
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="body1"><strong>Name:</strong> {patientInfo.name}</Typography>
              <Typography variant="body1"><strong>Age:</strong> {patientInfo.age}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body1"><strong>Diagnosis:</strong> {patientInfo.diagnosis}</Typography>
              <Typography variant="body1"><strong>Caregiver:</strong> {patientInfo.caregiverName}</Typography>
            </Grid>
          </Grid>
        </Box>
        
        {/* Overview */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ color: '#333', mb: 2, borderBottom: '1px solid #eee', pb: 1 }}>
            Training Overview
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={6} sm={4}>
              <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #eee', borderRadius: 1 }}>
                <Typography variant="h3" sx={{ color: theme.palette.primary.main, mb: 1 }}>
                  {overview.totalSessions}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Sessions
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={4}>
              <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #eee', borderRadius: 1 }}>
                <Typography variant="h3" sx={{ color: theme.palette.primary.main, mb: 1 }}>
                  {overview.totalTimeMinutes}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Minutes
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={4}>
              <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #eee', borderRadius: 1 }}>
                <Typography variant="h3" sx={{ color: theme.palette.primary.main, mb: 1 }}>
                  {overview.averageScore}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Average Score
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
        
        {/* Progress Chart */}
        {progressChartData.length > 0 && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" sx={{ color: '#333', mb: 2, borderBottom: '1px solid #eee', pb: 1 }}>
              Score Progression
            </Typography>
            <Box sx={{ height: 300, mb: 2 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={progressChartData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke={theme.palette.primary.main} 
                    activeDot={{ r: 8 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Box>
        )}
        
        {/* Cognitive Areas */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ color: '#333', mb: 2, borderBottom: '1px solid #eee', pb: 1 }}>
            Cognitive Function Assessment
          </Typography>
          <Box sx={{ height: 300, mb: 2 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={cognitiveAreas}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="score" fill={theme.palette.primary.main} />
                <Bar dataKey="change" fill={theme.palette.secondary.main} />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Box>
        
        {/* Game Performance */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ color: '#333', mb: 2, borderBottom: '1px solid #eee', pb: 1 }}>
            Game Performance
          </Typography>
          <Grid container spacing={2}>
            {gamePerformance.map((game, index) => (
              <Grid item xs={12} sm={6} key={game.name}>
                <Card variant="outlined">
                  <CardHeader 
                    title={game.name} 
                    subheader={`${game.sessionsCompleted} sessions`} 
                    titleTypographyProps={{ variant: 'h6' }}
                  />
                  <CardContent>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Average Score: <strong>{game.averageScore}</strong>
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Improvement: <strong>{game.improvement}%</strong>
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Last Played: {formatDate(game.lastPlayed)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
        
        {/* Session Notes */}
        {template !== 'summary' && sessionNotes.length > 0 && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" sx={{ color: '#333', mb: 2, borderBottom: '1px solid #eee', pb: 1 }}>
              Session Notes
            </Typography>
            {sessionNotes.map((note) => (
              <Box key={note.id} sx={{ mb: 2, p: 2, border: '1px solid #eee', borderRadius: 1 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {formatDate(note.date)} - {note.author}
                </Typography>
                <Typography variant="body1">
                  {note.content}
                </Typography>
              </Box>
            ))}
          </Box>
        )}
        
        {/* Recommendations */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ color: '#333', mb: 2, borderBottom: '1px solid #eee', pb: 1 }}>
            Recommendations
          </Typography>
          <Typography variant="body1" paragraph>
            Based on the patient's performance, we recommend focusing on the following areas:
          </Typography>
          <ul>
            {cognitiveAreas
              .sort((a, b) => a.score - b.score)
              .slice(0, 2)
              .map((area) => (
                <li key={area.name}>
                  <Typography variant="body1">
                    <strong>{area.name}:</strong> Continue regular exercises targeting this cognitive domain.
                  </Typography>
                </li>
              ))}
            <li>
              <Typography variant="body1">
                <strong>Consistency:</strong> Maintain a regular training schedule of {Math.ceil(overview.totalSessions / ((new Date(period.end) - new Date(period.start)) / (1000 * 60 * 60 * 24 * 7)))} sessions per week.
              </Typography>
            </li>
          </ul>
        </Box>
        
        {/* Footer */}
        <Box sx={{ textAlign: 'center', mt: 6, pt: 2, borderTop: '1px solid #eee' }}>
          <Typography variant="body2" color="text.secondary">
            Report generated on {new Date().toLocaleDateString()} by MindFlex Cognitive Training System
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This report is for informational purposes only and does not constitute medical advice.
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

// Main Patient Report component
const PatientReport = ({ patient }) => {
  const theme = useTheme();
  const { user } = useAuth();
  const reportRef = useRef(null);
  
  const [loading, setLoading] = useState(false);
  const [reportTemplate, setReportTemplate] = useState('comprehensive');
  const [reportData, setReportData] = useState(null);
  const [previewReady, setPreviewReady] = useState(false);
  
  // Set default date range to last 30 days
  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);
  
  const [dateRange, setDateRange] = useState({
    startDate: thirtyDaysAgo.toISOString().split('T')[0],
    endDate: today.toISOString().split('T')[0],
  });
  
  // Generate report data
  const generateReport = () => {
    setLoading(true);
    
    // In a real app, this would be an API call
    setTimeout(() => {
      const data = generateReportData(
        patient.id,
        dateRange.startDate,
        dateRange.endDate
      );
      
      setReportData(data);
      setPreviewReady(true);
      setLoading(false);
    }, 1500); // Simulate API delay
  };
  
  // Handle date range change
  const handleDateChange = (field, value) => {
    setDateRange({
      ...dateRange,
      [field]: value,
    });
    setPreviewReady(false);
  };
  
  // Handle template change
  const handleTemplateChange = (template) => {
    setReportTemplate(template);
    setPreviewReady(false);
  };
  
  // Handle downloading PDF
  const handleDownloadPDF = () => {
    // In a real app, this would generate a PDF using a library like jsPDF or call an API
    alert('In a production environment, this would download a PDF of the report');
  };
  
  // Handle printing
  const handlePrint = () => {
    window.print();
  };
  
  // Handle email
  const handleEmail = () => {
    // In a real app, this would open an email dialog or call an API
    alert('In a production environment, this would open an email dialog to send the report');
  };
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Patient Progress Report</Typography>
      </Box>
      
      <Paper
        sx={{
          p: 3,
          mb: 4,
          background: theme => theme.palette.mode === 'dark'
            ? 'rgba(19, 47, 76, 0.4)'
            : 'rgba(255, 255, 255, 0.8)',
          borderRadius: 2,
        }}
      >
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Report Date Range
            </Typography>
            <DateRangeSelector
              startDate={dateRange.startDate}
              endDate={dateRange.endDate}
              onDateChange={handleDateChange}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Report Template
            </Typography>
            <ReportTemplates
              selectedTemplate={reportTemplate}
              onTemplateChange={handleTemplateChange}
            />
          </Grid>
          
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                startIcon={<AssessmentIcon />}
                onClick={generateReport}
                disabled={loading}
              >
                {loading ? 'Generating...' : 'Generate Report'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}
      
      {previewReady && reportData && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2, gap: 1 }}>
            <Button 
              variant="outlined" 
              startIcon={<DownloadIcon />}
              onClick={handleDownloadPDF}
            >
              Download PDF
            </Button>
            <Button 
              variant="outlined" 
              startIcon={<PrintIcon />}
              onClick={handlePrint}
            >
              Print
            </Button>
            <Button 
              variant="outlined" 
              startIcon={<EmailIcon />}
              onClick={handleEmail}
            >
              Email Report
            </Button>
          </Box>
          
          <div ref={reportRef} className="report-container">
            <ReportPreview 
              reportData={reportData} 
              template={reportTemplate} 
            />
          </div>
        </Box>
      )}
    </Box>
  );
};

export default PatientReport; 