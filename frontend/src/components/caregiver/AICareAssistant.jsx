import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  TextField,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Chip,
  IconButton,
  Button,
  CircularProgress,
  Divider,
  Alert,
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Snackbar,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Send as SendIcon,
  SmartToy as BotIcon,
  Person as PersonIcon,
  Refresh as RefreshIcon,
  Save as SaveIcon,
  ExpandMore as ExpandMoreIcon,
  Psychology as PsychologyIcon,
  BugReport as BugReportIcon,
  QuestionMark as QuestionIcon,
  MedicalServices as MedicalIcon,
  Lightbulb as TipIcon,
} from '@mui/icons-material';
import { caregiverApi } from '../../services/apiService';
import { useAuth } from '../../contexts/AuthContext';

const ChatContainer = styled(Paper)(({ theme }) => ({
  height: '500px',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: theme.spacing(2),
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
  overflow: 'hidden',
}));

const MessageList = styled(List)(({ theme }) => ({
  flex: 1,
  overflowY: 'auto',
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.default,
}));

const MessageItem = styled(ListItem)(({ theme, align }) => ({
  flexDirection: 'column',
  alignItems: align === 'right' ? 'flex-end' : 'flex-start',
  padding: theme.spacing(0.5, 1),
}));

const MessageBubble = styled(Paper)(({ theme, align }) => ({
  padding: theme.spacing(1.5, 2),
  borderRadius: theme.spacing(2),
  backgroundColor: align === 'right' ? theme.palette.primary.main : theme.palette.background.paper,
  color: align === 'right' ? theme.palette.primary.contrastText : theme.palette.text.primary,
  maxWidth: '70%',
}));

const InputArea = styled(Box)(({ theme }) => ({
  display: 'flex',
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  borderTop: `1px solid ${theme.palette.divider}`,
}));

const SuggestionButton = styled(Button)(({ theme }) => ({
  marginRight: theme.spacing(1),
  marginBottom: theme.spacing(1),
  borderRadius: theme.spacing(3),
}));

const QuickQuestionsCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  borderRadius: theme.spacing(2),
}));

const AICareAssistant = ({ patientId, patientData }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your AI Care Assistant. How can I help you today with caring for your patient?",
      sender: 'assistant',
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  
  // New state variables for conversation saving
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [conversationTitle, setConversationTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  
  // Predefined suggestion chips
  const suggestions = [
    {
      text: 'Behavior management tips',
      icon: <PsychologyIcon fontSize="small" />,
      category: 'behavior'
    },
    {
      text: 'How to handle agitation',
      icon: <BugReportIcon fontSize="small" />,
      category: 'behavior'
    },
    {
      text: 'Medication reminders',
      icon: <MedicalIcon fontSize="small" />,
      category: 'health'
    },
    {
      text: 'Meal planning ideas',
      icon: <TipIcon fontSize="small" />,
      category: 'daily'
    },
    {
      text: 'Communication strategies',
      icon: <TipIcon fontSize="small" />,
      category: 'daily'
    },
    {
      text: 'Sleep improvement ideas',
      icon: <TipIcon fontSize="small" />,
      category: 'health'
    },
  ];
  
  // Common questions by category
  const quickQuestions = {
    behavior: [
      "What should I do when my patient becomes confused about their location?",
      "How can I redirect attention when they get fixated on something?",
      "What are the best ways to handle repetitive questions?"
    ],
    daily: [
      "What activities are good for cognitive stimulation?",
      "How can I structure the day for better routine?",
      "What are appropriate exercises for someone with limited mobility?"
    ],
    health: [
      "What signs might indicate I should call the doctor?",
      "How can I help improve appetite?",
      "What strategies work for medication adherence?"
    ]
  };
  
  // Scroll to bottom whenever messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    // Add user message
    const userMessage = {
      id: messages.length + 1,
      text: input.trim(),
      sender: 'user',
      timestamp: new Date().toISOString(),
    };
    
    setMessages([...messages, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);
    
    try {
      // Get patient context if available
      let patientContext = [];
      if (patientId) {
        patientContext = await caregiverApi.getPatientContext(patientId);
      }
      
      // In a production app with a real AI backend, we would call:
      // const response = await caregiverApi.chatWithAssistant({
      //   message: input.trim(),
      //   patient_id: patientId,
      //   conversation_history: messages.map(m => ({ role: m.sender, content: m.text })),
      // });
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate a more sophisticated AI response based on input analysis
      let aiResponse = "";
      const userQuery = input.toLowerCase();
      const patientName = patientData?.first_name || "your patient";
      
      // Store conversation context for better responses
      const conversationContext = messages
        .filter(m => m.sender === 'user')
        .map(m => m.text.toLowerCase());
      
      // Extract entities from the user input (simple version)
      const entities = {
        hasMedicationQuestion: userQuery.includes('medication') || 
                               userQuery.includes('medicine') || 
                               userQuery.includes('pill') ||
                               userQuery.includes('prescription'),
        hasBehaviorQuestion: userQuery.includes('behavior') || 
                             userQuery.includes('agitat') || 
                             userQuery.includes('upset') || 
                             userQuery.includes('angry') ||
                             userQuery.includes('confus'),
        hasActivityQuestion: userQuery.includes('activity') || 
                             userQuery.includes('exercise') || 
                             userQuery.includes('game') ||
                             userQuery.includes('stimulation'),
        hasSleepQuestion: userQuery.includes('sleep') || 
                          userQuery.includes('rest') || 
                          userQuery.includes('bed') ||
                          userQuery.includes('night'),
        hasEatingQuestion: userQuery.includes('eat') || 
                           userQuery.includes('food') || 
                           userQuery.includes('meal') ||
                           userQuery.includes('nutrition') ||
                           userQuery.includes('appetite'),
        hasMemoryQuestion: userQuery.includes('memory') || 
                           userQuery.includes('forget') || 
                           userQuery.includes('remember'),
      };
      
      // Check for specific questions based on the topic and specificity
      if (entities.hasMedicationQuestion) {
        if (userQuery.includes('forget') || userQuery.includes('miss')) {
          aiResponse = `For managing missed medications with ${patientName}:\n\n1. Don't double up on doses without consulting the doctor first\n2. For critical medications (heart, blood pressure, etc.), call the healthcare provider immediately\n3. For less critical medications, resume the normal schedule\n4. Document any missed doses to discuss with the doctor at the next appointment\n5. Consider using a pill organizer with alarms\n6. If medication is consistently missed at the same time, evaluate the schedule and adjust to better fit ${patientName}'s routine`;
        } else if (userQuery.includes('side effect') || userQuery.includes('reaction')) {
          aiResponse = `If you're noticing potential medication side effects with ${patientName}:\n\n1. Document exactly what you're observing and when it started\n2. Check if it correlates with any medication changes\n3. For severe reactions (difficulty breathing, severe rash, significant changes in awareness), seek emergency care immediately\n4. For less severe symptoms, contact the prescribing doctor to report the observations\n5. Never stop prescribed medication suddenly without medical advice\n6. Keep a medication journal noting any patterns with side effects`;
        } else if (userQuery.includes('schedule') || userQuery.includes('time') || userQuery.includes('when')) {
          aiResponse = `For optimizing ${patientName}'s medication schedule:\n\n1. Group medications by when they should be taken (morning, midday, evening)\n2. Some medications work better when taken with food, others on an empty stomach - check instructions\n3. Establish consistent times that align with daily routines\n4. Use visual cues or reminders like placing morning medications by the coffee maker\n5. Digital reminders can help both you and ${patientName}\n6. If ${patientName} has trouble swallowing pills, ask the pharmacist about alternative forms`;
        } else {
          aiResponse = `For medication management with ${patientName}:\n\n1. Keep a comprehensive medication list including prescription, over-the-counter, and supplements\n2. Store medications in a designated, secure location, especially if cognitive impairment is a concern\n3. Use pill organizers to prevent dosing errors\n4. Set alarms for medication times\n5. Monitor and document any side effects\n6. Review medications regularly with healthcare providers to ensure they're still necessary\n7. Check for potential interactions if new medications are added`;
        }
      } 
      else if (entities.hasBehaviorQuestion) {
        if (userQuery.includes('agitat') || userQuery.includes('upset') || userQuery.includes('angry')) {
          aiResponse = `For managing agitation with ${patientName}:\n\n1. Stay calm and approach slowly using a soft, reassuring voice\n2. Identify and address potential triggers - pain, hunger, overstimulation, need for bathroom\n3. Redirect attention to something pleasant or familiar\n4. Simplify the environment by reducing noise, bright lights, or too many people\n5. Maintain a consistent routine to provide security\n6. Use validation rather than reality orientation when responding to confusion\n7. Consider if there might be an underlying medical issue causing discomfort`;
        } else if (userQuery.includes('confus') || userQuery.includes('disoriented')) {
          aiResponse = `To help when ${patientName} experiences confusion:\n\n1. Provide gentle orientation - "It's Tuesday morning and we're at home"\n2. Use visual cues and simple signs around the home\n3. Keep familiar objects visible and accessible\n4. Maintain consistent routines and environment\n5. Speak slowly and use short, simple sentences\n6. Reduce background noise and distractions during conversations\n7. Don't quiz or challenge - this can increase frustration\n8. If confusion suddenly worsens, seek medical attention as it could indicate infection or other medical issues`;
        } else if (userQuery.includes('repetit') || userQuery.includes('repeat')) {
          aiResponse = `For handling repetitive questions or behaviors with ${patientName}:\n\n1. Respond calmly each time, even if it's the same question\n2. Look for patterns - repetition often indicates anxiety or unmet needs\n3. Provide reassurance rather than pointing out the repetition\n4. Distract and redirect to meaningful activities when appropriate\n5. Written reminders or schedules can help with common questions\n6. Break activities into smaller steps if task repetition is an issue\n7. Consider the environment - repetitive behaviors may increase with stress or overstimulation`;
        } else {
          aiResponse = `For general behavior management with ${patientName}:\n\n1. Remember that behaviors are often a form of communication\n2. Try to identify patterns and triggers\n3. Maintain consistent routines to provide security and reduce anxiety\n4. Use positive reinforcement for desired behaviors\n5. Ensure basic needs are met - hunger, thirst, comfort, and toileting needs\n6. Create a calm environment with appropriate stimulation levels\n7. Take care of your own well-being - your stress can affect interactions\n8. Focus on the emotion behind the behavior rather than the behavior itself`;
        }
      }
      else if (entities.hasActivityQuestion) {
        if (userQuery.includes('cognitive') || userQuery.includes('brain')) {
          aiResponse = `Cognitive activities for ${patientName}:\n\n1. Simple word games or crossword puzzles adjusted to ability level\n2. Sorting activities (organizing coins, buttons, or photos)\n3. Music therapy - listening to familiar songs or playing simple instruments\n4. Reminiscence activities using old photos to stimulate long-term memory\n5. Simple cooking or baking with supervision\n6. Art activities like painting or coloring\n7. Reading or being read to from books, magazines, or newspapers\n8. Specialized apps designed for cognitive stimulation`;
        } else if (userQuery.includes('physical') || userQuery.includes('exercise')) {
          aiResponse = `Appropriate physical activities for ${patientName}:\n\n1. Seated exercises focusing on gentle stretching and flexibility\n2. Short, supervised walking routines in a safe environment\n3. Simple tai chi or chair yoga movements\n4. Water exercises if available (with appropriate supervision)\n5. Balloon volleyball or gentle ball tossing games\n6. Dancing to familiar music\n7. Simple gardening activities like potting plants\n8. Always start slowly and watch for signs of fatigue or pain`;
        } else if (userQuery.includes('routine') || userQuery.includes('schedule')) {
          aiResponse = `Creating an effective activity routine for ${patientName}:\n\n1. Schedule more demanding activities during their best time of day\n2. Alternate between physical, cognitive, creative, and rest periods\n3. Include social activities but be mindful of overstimulation\n4. Build in regular breaks and quiet times\n5. Maintain consistent mealtimes and sleep schedule\n6. Include meaningful tasks that provide a sense of purpose\n7. Be flexible - adjust based on energy levels and interest\n8. Include 20-30 minutes of appropriate physical activity daily if possible`;
        } else {
          aiResponse = `Activities that could benefit ${patientName}:\n\n1. Cognitive exercises: word games, simple puzzles, reminiscence activities\n2. Physical activities: gentle stretching, supervised walking, seated exercises\n3. Creative outlets: music, art, simple crafts\n4. Social engagement: visitors, video calls with family, group activities if appropriate\n5. Sensory stimulation: different textures, familiar scents, music, nature sounds\n6. Purposeful tasks: folding laundry, setting the table, arranging flowers\n7. Relaxation activities: guided imagery, gentle massage, listening to calming music\n8. Choose activities that match current abilities and interests to promote success`;
        }
      }
      else if (entities.hasSleepQuestion) {
        aiResponse = `To improve sleep quality for ${patientName}:\n\n1. Maintain a consistent sleep schedule - same bedtime and wake time\n2. Create a calming bedtime routine (gentle music, reading, warm bath)\n3. Ensure the bedroom is comfortable - right temperature, minimal noise, appropriate lighting\n4. Limit daytime napping, especially late in the day\n5. Reduce evening fluid intake to minimize nighttime bathroom trips\n6. Avoid caffeine, alcohol, and large meals before bedtime\n7. Increase daytime physical activity and natural light exposure\n8. Consider a medical review if sleep problems persist - certain medications or conditions may affect sleep`;
      }
      else if (entities.hasEatingQuestion) {
        aiResponse = `To improve eating and nutrition for ${patientName}:\n\n1. Serve smaller, more frequent meals if appetite is poor\n2. Make mealtimes social, calm, and unhurried\n3. Offer high-nutrient foods when appetite is best\n4. Use bright-colored plates that contrast with food to improve visual perception\n5. Provide finger foods if utensils are difficult to manage\n6. Ensure proper positioning and suitable adaptive equipment if needed\n7. Monitor for chewing or swallowing difficulties\n8. Consult with a dietitian for specific nutrition recommendations\n9. Remember that taste preferences may change with age or medication`;
      }
      else if (entities.hasMemoryQuestion) {
        aiResponse = `Supporting ${patientName} with memory challenges:\n\n1. Use visual cues and labels around the home\n2. Maintain consistent routines and environments\n3. Break instructions into simple, one-step directions\n4. Use memory aids like calendars, lists, and reminders\n5. When asking questions, offer choices rather than open-ended questions\n6. Focus on emotional connections rather than factual accuracy\n7. Reminiscence activities can help access long-term memories\n8. Reduce distractions during important conversations\n9. Be patient and allow extra time for processing information`;
      }
      else {
        // Generic but still personalized response
        aiResponse = `Based on what I know about caring for someone like ${patientName}, here are some key recommendations:\n\n1. Consistent daily routines can provide security and reduce anxiety\n\n2. Short but frequent cognitive exercises, especially during their most alert times of day\n\n3. Regular physical activity appropriate to their mobility level\n\n4. Social engagement through family photos, video calls, or visitors when appropriate\n\n5. Environmental modifications to reduce confusion and improve orientation\n\n6. Taking care of your own well-being as a caregiver is essential for providing good care\n\nCould you tell me more about specific challenges you're facing with ${patientName}? That would help me provide more targeted suggestions.`;
      }
      
      // Add assistant response
      const assistantMessage = {
        id: messages.length + 2,
        text: aiResponse,
        sender: 'assistant',
        timestamp: new Date().toISOString(),
      };
      
      setMessages(prevMessages => [...prevMessages, assistantMessage]);
      
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to get a response. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInput(suggestion);
  };

  const resetConversation = () => {
    setMessages([
      {
        id: 1,
        text: "Hello! I'm your AI Care Assistant. How can I help you today with caring for your patient?",
        sender: 'assistant',
        timestamp: new Date().toISOString(),
      },
    ]);
  };

  // New functions for conversation saving
  const handleOpenSaveDialog = () => {
    // Generate default title based on first user message or current time
    let defaultTitle = 'Conversation ';
    const userMessage = messages.find(msg => msg.sender === 'user');
    if (userMessage) {
      // Get first 5 words of first user message
      const firstWords = userMessage.text.split(' ').slice(0, 5).join(' ');
      defaultTitle += firstWords + '...';
    } else {
      defaultTitle += new Date().toLocaleString();
    }
    
    setConversationTitle(defaultTitle);
    setSaveDialogOpen(true);
  };
  
  const handleCloseSaveDialog = () => {
    setSaveDialogOpen(false);
  };
  
  const handleSaveConversation = async () => {
    setIsSaving(true);
    
    try {
      // Prepare conversation data
      const conversationData = {
        caregiver_id: user.id,
        patient_id: patientId,
        title: conversationTitle || `Conversation ${new Date().toLocaleString()}`,
        messages: messages
      };
      
      const result = await caregiverApi.saveConversation(conversationData);
      
      if (result.success) {
        setSaveSuccess(true);
        setSnackbarMessage('Conversation saved successfully!');
        setSnackbarOpen(true);
        setSaveDialogOpen(false);
      } else {
        setError('Failed to save conversation. Please try again.');
      }
    } catch (error) {
      console.error('Error saving conversation:', error);
      setError('Failed to save conversation. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h2">
          AI Care Assistant
        </Typography>
        <Box>
          <IconButton onClick={resetConversation} title="New conversation">
            <RefreshIcon />
          </IconButton>
          <IconButton onClick={handleOpenSaveDialog} title="Save conversation">
            <SaveIcon />
          </IconButton>
        </Box>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
        {/* Chat interface */}
        <Box sx={{ flex: 1 }}>
          <ChatContainer>
            <MessageList>
              {messages.map((message) => (
                <MessageItem 
                  key={message.id} 
                  align={message.sender === 'user' ? 'right' : 'left'}
                >
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: message.sender === 'user' ? 'row-reverse' : 'row',
                    alignItems: 'center', 
                    mb: 1,
                    width: '100%'
                  }}>
                    <Avatar sx={{ 
                      bgcolor: message.sender === 'user' ? 'primary.main' : 'secondary.main',
                      ml: message.sender === 'user' ? 1 : 0,
                      mr: message.sender === 'user' ? 0 : 1,
                    }}>
                      {message.sender === 'user' ? <PersonIcon /> : <BotIcon />}
                    </Avatar>
                    <Typography variant="body2" color="text.secondary">
                      {message.sender === 'user' ? 'You' : 'AI Assistant'}
                    </Typography>
                  </Box>
                  
                  <MessageBubble align={message.sender === 'user' ? 'right' : 'left'}>
                    <Typography 
                      variant="body1" 
                      component="div" 
                      sx={{ whiteSpace: 'pre-line' }}
                    >
                      {message.text}
                    </Typography>
                  </MessageBubble>
                </MessageItem>
              ))}
              
              {isLoading && (
                <MessageItem align="left">
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Avatar sx={{ bgcolor: 'secondary.main', mr: 1 }}>
                      <BotIcon />
                    </Avatar>
                    <Typography variant="body2" color="text.secondary">
                      AI Assistant
                    </Typography>
                  </Box>
                  <MessageBubble align="left" sx={{ display: 'flex', alignItems: 'center' }}>
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    <Typography variant="body2">Thinking...</Typography>
                  </MessageBubble>
                </MessageItem>
              )}
              
              <div ref={messagesEndRef} />
            </MessageList>
            
            <InputArea>
              <TextField
                fullWidth
                multiline
                maxRows={3}
                placeholder="Ask about care strategies, behavior management, activities..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                sx={{ mr: 1 }}
              />
              <IconButton 
                color="primary" 
                onClick={handleSendMessage}
                disabled={!input.trim() || isLoading}
              >
                <SendIcon />
              </IconButton>
            </InputArea>
          </ChatContainer>
          
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>Suggested questions:</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
              {suggestions.map((suggestion, index) => (
                <SuggestionButton
                  key={index}
                  variant="outlined"
                  size="small"
                  startIcon={suggestion.icon}
                  onClick={() => handleSuggestionClick(suggestion.text)}
                >
                  {suggestion.text}
                </SuggestionButton>
              ))}
            </Box>
          </Box>
        </Box>
        
        {/* Quick reference */}
        <Box sx={{ width: { xs: '100%', md: '300px' } }}>
          <Typography variant="subtitle1" gutterBottom>
            Common Questions
          </Typography>
          
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography sx={{ display: 'flex', alignItems: 'center' }}>
                <PsychologyIcon sx={{ mr: 1 }} /> Behavior Management
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <List dense disablePadding>
                {quickQuestions.behavior.map((question, index) => (
                  <ListItem 
                    key={index} 
                    onClick={() => handleSuggestionClick(question)}
                    sx={{ borderRadius: 1, '&:hover': { bgcolor: 'background.default' }, cursor: 'pointer' }}
                  >
                    <ListItemText primary={question} />
                  </ListItem>
                ))}
              </List>
            </AccordionDetails>
          </Accordion>
          
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography sx={{ display: 'flex', alignItems: 'center' }}>
                <TipIcon sx={{ mr: 1 }} /> Daily Care
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <List dense disablePadding>
                {quickQuestions.daily.map((question, index) => (
                  <ListItem 
                    key={index} 
                    onClick={() => handleSuggestionClick(question)}
                    sx={{ borderRadius: 1, '&:hover': { bgcolor: 'background.default' }, cursor: 'pointer' }}
                  >
                    <ListItemText primary={question} />
                  </ListItem>
                ))}
              </List>
            </AccordionDetails>
          </Accordion>
          
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography sx={{ display: 'flex', alignItems: 'center' }}>
                <MedicalIcon sx={{ mr: 1 }} /> Health Concerns
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <List dense disablePadding>
                {quickQuestions.health.map((question, index) => (
                  <ListItem 
                    key={index} 
                    onClick={() => handleSuggestionClick(question)}
                    sx={{ borderRadius: 1, '&:hover': { bgcolor: 'background.default' }, cursor: 'pointer' }}
                  >
                    <ListItemText primary={question} />
                  </ListItem>
                ))}
              </List>
            </AccordionDetails>
          </Accordion>
          
          {patientData && (
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                Your responses are personalized based on {patientData.first_name}'s condition, 
                preferences, and care history.
              </Typography>
            </Alert>
          )}
        </Box>
      </Box>
      
      {/* Save Conversation Dialog */}
      <Dialog open={saveDialogOpen} onClose={handleCloseSaveDialog}>
        <DialogTitle>Save Conversation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Enter a title for this conversation to save it for future reference.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="conversationTitle"
            label="Conversation Title"
            type="text"
            fullWidth
            variant="outlined"
            value={conversationTitle}
            onChange={(e) => setConversationTitle(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSaveDialog}>Cancel</Button>
          <Button 
            onClick={handleSaveConversation} 
            variant="contained" 
            disabled={isSaving}
            startIcon={isSaving ? <CircularProgress size={20} /> : null}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar for success/error messages */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message={snackbarMessage}
      />
    </Box>
  );
};

export default AICareAssistant; 