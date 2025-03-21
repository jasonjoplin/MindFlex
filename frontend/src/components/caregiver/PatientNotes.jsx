import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  useTheme,
  Avatar,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  Save as SaveIcon,
  Print as PrintIcon,
  Share as ShareIcon,
  Alarm as ReminderIcon,
  Flag as FlagIcon,
  Search as SearchIcon,
  Sort as SortIcon,
  FilterList as FilterIcon,
  Today as DateIcon,
  AccessTime as TimeIcon,
  Person as UserIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';

// Define note categories with colors
const noteCategories = [
  { id: 'observation', name: 'Observation', color: 'primary.main' },
  { id: 'medication', name: 'Medication', color: 'secondary.main' },
  { id: 'behavior', name: 'Behavior', color: '#ff9800' },
  { id: 'activity', name: 'Activity', color: '#4caf50' },
  { id: 'mood', name: 'Mood', color: '#9c27b0' },
  { id: 'other', name: 'Other', color: '#607d8b' },
];

// Define mood options
const moodOptions = [
  { id: 'excellent', name: 'Excellent', emoji: '😄' },
  { id: 'good', name: 'Good', emoji: '🙂' },
  { id: 'neutral', name: 'Neutral', emoji: '😐' },
  { id: 'tired', name: 'Tired', emoji: '😴' },
  { id: 'anxious', name: 'Anxious', emoji: '😟' },
  { id: 'agitated', name: 'Agitated', emoji: '😠' },
  { id: 'confused', name: 'Confused', emoji: '😕' },
  { id: 'sad', name: 'Sad', emoji: '😢' },
];

// Generate mock notes for a patient
const generateMockNotes = (patientId) => {
  const now = new Date();
  const mockNotes = [];
  
  // Generate notes for the past 10 days
  for (let i = 0; i < 10; i++) {
    const date = new Date();
    date.setDate(now.getDate() - i);
    
    // Add 1-3 notes for each day
    const notesCount = Math.floor(Math.random() * 3) + 1;
    
    for (let j = 0; j < notesCount; j++) {
      const category = noteCategories[Math.floor(Math.random() * noteCategories.length)];
      const mood = moodOptions[Math.floor(Math.random() * moodOptions.length)];
      
      let content = '';
      switch (category.id) {
        case 'observation':
          content = `Patient ${Math.random() > 0.5 ? 'was very engaged' : 'showed good focus'} during the ${Math.random() > 0.5 ? 'memory' : 'attention'} training session.`;
          break;
        case 'medication':
          content = `Patient took all scheduled medications ${Math.random() > 0.5 ? 'without issues' : 'as prescribed'}.`;
          break;
        case 'behavior':
          content = `Patient was ${Math.random() > 0.5 ? 'cooperative' : 'responsive'} during the session.`;
          break;
        case 'activity':
          content = `Completed ${Math.floor(Math.random() * 3) + 1} cognitive training ${Math.random() > 0.5 ? 'exercises' : 'games'}.`;
          break;
        case 'mood':
          content = `Patient appeared ${mood.name.toLowerCase()} throughout the day.`;
          break;
        default:
          content = 'General note about the patient\'s progress.';
      }
      
      mockNotes.push({
        id: `note-${Date.now()}-${i}-${j}`,
        patientId,
        content,
        category: category.id,
        mood: mood.id,
        createdAt: new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate(),
          Math.floor(Math.random() * 12) + 8, // 8 AM to 8 PM
          Math.floor(Math.random() * 60)
        ).toISOString(),
        important: Math.random() > 0.8, // 20% chance of being important
        createdBy: 'Dr. Sarah Johnson',
      });
    }
  }
  
  // Sort by date (newest first)
  return mockNotes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

// Component to add or edit a note
const NoteForm = ({ note, onSubmit, onCancel, patientId }) => {
  const initialState = note || {
    patientId,
    content: '',
    category: 'observation',
    mood: 'neutral',
    important: false,
    createdAt: new Date().toISOString(),
    createdBy: 'Current User', // Would come from auth context in real app
  };
  
  const [formData, setFormData] = useState(initialState);
  
  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'important' ? checked : value,
    }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      id: formData.id || `note-${Date.now()}`,
      createdAt: formData.id ? formData.createdAt : new Date().toISOString(),
    });
  };
  
  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ p: 2 }}>
      <TextField
        fullWidth
        multiline
        rows={4}
        label="Note Content"
        name="content"
        value={formData.content}
        onChange={handleChange}
        required
        sx={{ mb: 2 }}
      />
      
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Category</InputLabel>
            <Select
              name="category"
              value={formData.category}
              onChange={handleChange}
              label="Category"
            >
              {noteCategories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        backgroundColor: category.color,
                        mr: 1,
                      }}
                    />
                    {category.name}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Mood</InputLabel>
            <Select
              name="mood"
              value={formData.mood}
              onChange={handleChange}
              label="Mood"
            >
              {moodOptions.map((mood) => (
                <MenuItem key={mood.id} value={mood.id}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography sx={{ mr: 1 }}>{mood.emoji}</Typography>
                    {mood.name}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>
      
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Chip
          icon={<FlagIcon />}
          label="Mark as Important"
          color={formData.important ? 'error' : 'default'}
          onClick={() => setFormData(prev => ({ ...prev, important: !prev.important }))}
          sx={{ mr: 2 }}
        />
      </Box>
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
        <Button variant="outlined" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          startIcon={<SaveIcon />}
        >
          {note ? 'Update Note' : 'Add Note'}
        </Button>
      </Box>
    </Box>
  );
};

// Component to display a single note
const NoteItem = ({ note, onEdit, onDelete }) => {
  const theme = useTheme();
  const category = noteCategories.find(c => c.id === note.category) || noteCategories[0];
  const mood = moodOptions.find(m => m.id === note.mood) || moodOptions[2]; // Default to neutral
  
  const date = new Date(note.createdAt);
  const formattedDate = date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  
  const formattedTime = date.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Paper
        sx={{
          p: 2,
          mb: 2,
          position: 'relative',
          borderLeft: `4px solid ${category.color}`,
          backgroundColor: theme => theme.palette.mode === 'dark'
            ? 'rgba(19, 47, 76, 0.4)'
            : 'rgba(255, 255, 255, 0.8)',
        }}
      >
        {note.important && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              right: 0,
              bgcolor: 'error.main',
              color: 'white',
              px: 1,
              py: 0.5,
              borderBottomLeftRadius: 8,
              fontSize: '0.75rem',
              fontWeight: 'bold',
            }}
          >
            Important
          </Box>
        )}
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Chip
            size="small"
            label={category.name}
            sx={{
              backgroundColor: category.color,
              color: 'white',
            }}
          />
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton
              size="small"
              onClick={() => onEdit(note)}
              title="Edit Note"
            >
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => onDelete(note.id)}
              title="Delete Note"
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
        
        <Typography variant="body1" sx={{ mb: 2 }}>
          {note.content}
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Chip
              size="small"
              label={mood.name}
              icon={<Typography sx={{ ml: 1 }}>{mood.emoji}</Typography>}
              variant="outlined"
            />
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
              <DateIcon fontSize="small" sx={{ mr: 0.5, opacity: 0.6 }} />
              <Typography variant="caption">{formattedDate}</Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
              <TimeIcon fontSize="small" sx={{ mr: 0.5, opacity: 0.6 }} />
              <Typography variant="caption">{formattedTime}</Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <UserIcon fontSize="small" sx={{ mr: 0.5, opacity: 0.6 }} />
              <Typography variant="caption">{note.createdBy}</Typography>
            </Box>
          </Box>
        </Box>
      </Paper>
    </motion.div>
  );
};

// Main PatientNotes component
const PatientNotes = ({ patientId }) => {
  const theme = useTheme();
  const { user } = useAuth();
  
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingNote, setEditingNote] = useState(null);
  const [showAddNote, setShowAddNote] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [importantOnly, setImportantOnly] = useState(false);
  
  // Load notes for the patient
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        setLoading(true);
        
        // In a real app, this would be an API call
        // const { data } = await api.getPatientNotes(patientId);
        
        // For demo, we'll use mock data
        const mockNotes = generateMockNotes(patientId);
        setNotes(mockNotes);
      } catch (error) {
        console.error('Error fetching notes:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (patientId) {
      fetchNotes();
    }
  }, [patientId]);
  
  // Handle adding a new note
  const handleAddNote = (newNote) => {
    setNotes([newNote, ...notes]);
    setShowAddNote(false);
  };
  
  // Handle editing a note
  const handleEditNote = (updatedNote) => {
    setNotes(notes.map(note => 
      note.id === updatedNote.id ? updatedNote : note
    ));
    setEditingNote(null);
  };
  
  // Handle deleting a note
  const handleDeleteNote = (noteId) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      setNotes(notes.filter(note => note.id !== noteId));
    }
  };
  
  // Filter notes based on search, category, and importance
  const filteredNotes = notes.filter(note => {
    const matchesSearch = searchQuery === '' || 
      note.content.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesCategory = filterCategory === 'all' || note.category === filterCategory;
    
    const matchesImportance = !importantOnly || note.important;
    
    return matchesSearch && matchesCategory && matchesImportance;
  });
  
  // Group notes by date
  const groupedNotes = filteredNotes.reduce((groups, note) => {
    const date = new Date(note.createdAt).toLocaleDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(note);
    return groups;
  }, {});
  
  // Generate PDF report
  const handleGeneratePDF = () => {
    // In a real app, this would generate a PDF
    alert('PDF generation would be implemented in a production environment');
  };
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Patient Notes</Typography>
        
        <Box>
          <Button
            variant="outlined"
            startIcon={<PrintIcon />}
            onClick={handleGeneratePDF}
            sx={{ mr: 1 }}
          >
            Export PDF
          </Button>
          
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => setShowAddNote(true)}
          >
            Add Note
          </Button>
        </Box>
      </Box>
      
      {/* Filters */}
      <Paper
        sx={{
          p: 2,
          mb: 3,
          background: theme.palette.mode === 'dark'
            ? 'rgba(19, 47, 76, 0.4)'
            : 'rgba(255, 255, 255, 0.8)',
          borderRadius: 2,
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, opacity: 0.6 }} />,
              }}
              size="small"
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Category</InputLabel>
              <Select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                label="Category"
              >
                <MenuItem value="all">All Categories</MenuItem>
                {noteCategories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          backgroundColor: category.color,
                          mr: 1,
                        }}
                      />
                      {category.name}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Sort By</InputLabel>
              <Select
                value="newest"
                label="Sort By"
                // In a real app, this would change the sorting
              >
                <MenuItem value="newest">Newest First</MenuItem>
                <MenuItem value="oldest">Oldest First</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Chip
                icon={<FlagIcon />}
                label="Important Only"
                color={importantOnly ? 'error' : 'default'}
                onClick={() => setImportantOnly(!importantOnly)}
                sx={{ width: '100%' }}
              />
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Notes List */}
      {Object.entries(groupedNotes).length > 0 ? (
        Object.entries(groupedNotes).map(([date, dayNotes]) => (
          <Box key={date} sx={{ mb: 3 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                mb: 1,
              }}
            >
              <Divider sx={{ flexGrow: 1, mr: 2 }} />
              <Chip 
                label={date} 
                color="primary" 
                variant="outlined"
                icon={<DateIcon />}
              />
              <Divider sx={{ flexGrow: 1, ml: 2 }} />
            </Box>
            
            {dayNotes.map(note => (
              <NoteItem
                key={note.id}
                note={note}
                onEdit={setEditingNote}
                onDelete={handleDeleteNote}
              />
            ))}
          </Box>
        ))
      ) : (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            No notes found. {searchQuery || filterCategory !== 'all' || importantOnly 
              ? 'Try adjusting your filters.' 
              : 'Add your first note by clicking the button above.'}
          </Typography>
        </Paper>
      )}
      
      {/* Add Note Dialog */}
      <Dialog
        open={showAddNote}
        onClose={() => setShowAddNote(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Add New Note</DialogTitle>
        <DialogContent>
          <NoteForm
            patientId={patientId}
            onSubmit={handleAddNote}
            onCancel={() => setShowAddNote(false)}
          />
        </DialogContent>
      </Dialog>
      
      {/* Edit Note Dialog */}
      <Dialog
        open={!!editingNote}
        onClose={() => setEditingNote(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Edit Note</DialogTitle>
        <DialogContent>
          {editingNote && (
            <NoteForm
              note={editingNote}
              patientId={patientId}
              onSubmit={handleEditNote}
              onCancel={() => setEditingNote(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default PatientNotes; 