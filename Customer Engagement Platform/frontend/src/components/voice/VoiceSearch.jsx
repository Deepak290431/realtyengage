import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  IconButton,
  Dialog,
  DialogContent,
  Typography,
  Button,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  CircularProgress,
  Alert,
  Fade,
  Grow,
  useTheme,
  alpha
} from '@mui/material';
import {
  Mic,
  MicOff,
  Close,
  Search,
  Home,
  LocationOn,
  CurrencyRupee,
  Help,
  GraphicEq,
  VolumeUp,
  RecordVoiceOver
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import projectService from '../../services/projectService';

// Voice commands configuration
const VOICE_COMMANDS = {
  navigation: {
    'go to home': '/',
    'go home': '/',
    'show projects': '/projects',
    'view projects': '/projects',
    'my payments': '/payments',
    'show payments': '/payments',
    'my enquiries': '/enquiries',
    'show enquiries': '/enquiries',
    'support': '/support',
    'help': '/support',
    'dashboard': '/dashboard',
    'profile': '/profile'
  },
  search: {
    keywords: ['search', 'find', 'show', 'look for', 'filter'],
    priceKeywords: ['under', 'below', 'above', 'between', 'less than', 'more than'],
    locationKeywords: ['in', 'at', 'near', 'around'],
    typeKeywords: ['bhk', 'bedroom', 'villa', 'apartment', 'flat']
  },
  actions: {
    'make payment': 'payment',
    'pay now': 'payment',
    'create enquiry': 'enquiry',
    'contact support': 'support',
    'calculate emi': 'emi',
    'logout': 'logout',
    'sign out': 'logout'
  }
};

const VoiceSearch = ({ onSearch, isOpen, onClose }) => {
  const [isListening, setIsListening] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(isOpen || false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [visualizerActive, setVisualizerActive] = useState(false);

  const navigate = useNavigate();
  const theme = useTheme();
  const recognitionRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationRef = useRef(null);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
        setTranscript('');
        setInterimTranscript('');
        startVisualizer();
      };

      recognition.onresult = (event) => {
        let interimText = '';
        let finalText = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalText += transcript;
          } else {
            interimText += transcript;
          }
        }

        if (finalText) {
          setTranscript(prev => prev + ' ' + finalText);
          processVoiceCommand(finalText.toLowerCase().trim());
        }
        setInterimTranscript(interimText);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setError(`Recognition error: ${event.error}`);
        setIsListening(false);
        stopVisualizer();

        if (event.error === 'no-speech') {
          toast.info('No speech detected. Please try again.');
        } else if (event.error === 'audio-capture') {
          toast.error('No microphone found. Please check your settings.');
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        stopVisualizer();
      };

      recognitionRef.current = recognition;
    } else {
      setError('Speech recognition is not supported in your browser');
    }

    return () => {
      stopVisualizer();
    };
  }, []);

  // Sync internal state with prop
  useEffect(() => {
    if (isOpen !== undefined) {
      setDialogOpen(isOpen);
    }
  }, [isOpen]);

  // Start audio visualizer
  const startVisualizer = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      setVisualizerActive(true);
      animateVisualizer();
    } catch (error) {
      console.error('Error starting visualizer:', error);
    }
  };

  // Stop audio visualizer
  const stopVisualizer = () => {
    setVisualizerActive(false);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
  };

  // Animate visualizer
  const animateVisualizer = () => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);

    // Update UI based on audio levels
    const average = dataArray.reduce((a, b) => a + b) / dataArray.length;

    animationRef.current = requestAnimationFrame(animateVisualizer);
  };

  // Process voice command
  const processVoiceCommand = async (command) => {
    setProcessing(true);

    try {
      // Check for navigation commands
      for (const [phrase, route] of Object.entries(VOICE_COMMANDS.navigation)) {
        if (command.includes(phrase)) {
          navigate(route);
          toast.success(`Navigating to ${phrase}`);
          setDialogOpen(false);
          return;
        }
      }

      // Check for action commands
      for (const [phrase, action] of Object.entries(VOICE_COMMANDS.actions)) {
        if (command.includes(phrase)) {
          handleAction(action);
          return;
        }
      }

      // Check for search commands
      if (VOICE_COMMANDS.search.keywords.some(keyword => command.includes(keyword))) {
        await handleSearchCommand(command);
        return;
      }

      // If no specific command matched, treat as general search
      if (command.length > 3) {
        await performSearch(command);
      }

    } catch (error) {
      console.error('Error processing command:', error);
      setError('Failed to process command');
    } finally {
      setProcessing(false);
    }
  };

  // Handle action commands
  const handleAction = (action) => {
    switch (action) {
      case 'payment':
        navigate('/payments');
        toast.success('Opening payment page');
        break;
      case 'enquiry':
        navigate('/enquiries');
        toast.success('Opening enquiries');
        break;
      case 'support':
        navigate('/support');
        toast.success('Opening support');
        break;
      case 'emi':
        navigate('/payments?tab=emi');
        toast.success('Opening EMI calculator');
        break;
      case 'logout':
        // Trigger logout action
        toast.info('Logging out...');
        break;
      default:
        break;
    }
    setDialogOpen(false);
  };

  // Handle search commands
  const handleSearchCommand = async (command) => {
    const filters = {};

    // Extract price filters
    const priceMatch = command.match(/under (\d+)|below (\d+)|above (\d+)|less than (\d+)|more than (\d+)/);
    if (priceMatch) {
      const amount = parseInt(priceMatch[1] || priceMatch[2] || priceMatch[3] || priceMatch[4] || priceMatch[5]);
      if (command.includes('under') || command.includes('below') || command.includes('less than')) {
        filters.maxPrice = amount * 10000000; // Convert to actual amount
      } else {
        filters.minPrice = amount * 10000000;
      }
    }

    // Extract location
    const locationMatch = command.match(/in (\w+)|at (\w+)|near (\w+)|around (\w+)/);
    if (locationMatch) {
      filters.area = locationMatch[1] || locationMatch[2] || locationMatch[3] || locationMatch[4];
    }

    // Extract property type
    const typeMatch = command.match(/(\d+)\s*bhk|(\d+)\s*bedroom|villa|apartment|flat/);
    if (typeMatch) {
      if (typeMatch[1] || typeMatch[2]) {
        filters.propertyType = `${typeMatch[1] || typeMatch[2]}bhk`;
      } else if (command.includes('villa')) {
        filters.propertyType = 'villa';
      }
    }

    // Extract status
    if (command.includes('upcoming')) filters.status = 'upcoming';
    if (command.includes('completed') || command.includes('ready')) filters.status = 'completed';
    if (command.includes('ongoing') || command.includes('progress')) filters.status = 'in_progress';

    await performSearch(command, filters);
  };

  // Perform search
  const performSearch = async (query, filters = {}) => {
    try {
      const response = await projectService.searchProjects(query, filters);
      setSuggestions(response.data);

      if (response.data.length > 0) {
        toast.success(`Found ${response.data.length} results`);

        // If callback provided, send results
        if (onSearch) {
          onSearch(query, response.data);
        } else {
          // Navigate to projects page with filters
          navigate('/projects', { state: { searchQuery: query, filters } });
        }
      } else {
        toast.info('No results found. Try different keywords.');
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Search failed. Please try again.');
    }
  };

  // Toggle listening
  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast.error('Speech recognition not supported');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
      setDialogOpen(true);
    }
  };

  // Handle dialog close
  const handleClose = () => {
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setDialogOpen(false);
    setTranscript('');
    setInterimTranscript('');
    setSuggestions([]);
    setError(null);
    if (onClose) onClose();
  };

  return (
    <>
      {/* Voice dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            minHeight: 400
          }
        }}
      >
        <DialogContent>
          <Box sx={{ textAlign: 'center', py: 2 }}>
            {/* Close button */}
            <IconButton
              onClick={handleClose}
              sx={{ position: 'absolute', right: 8, top: 8 }}
            >
              <Close />
            </IconButton>

            {/* Microphone animation */}
            <Box sx={{ mb: 3 }}>
              {isListening ? (
                <Box sx={{ position: 'relative', display: 'inline-block' }}>
                  <CircularProgress
                    size={120}
                    thickness={2}
                    sx={{ color: 'error.main' }}
                  />
                  <Mic
                    sx={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      fontSize: 60,
                      color: 'error.main'
                    }}
                  />
                </Box>
              ) : (
                <Mic sx={{ fontSize: 80, color: 'text.secondary' }} />
              )}
            </Box>

            {/* Status text */}
            <Typography variant="h5" gutterBottom>
              {isListening ? 'Listening...' : 'Tap to speak'}
            </Typography>

            {/* Transcript display */}
            {(transcript || interimTranscript) && (
              <Paper sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
                <Typography variant="body1" color="text.primary">
                  {transcript}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                  {interimTranscript}
                </Typography>
              </Paper>
            )}

            {/* Processing indicator */}
            {processing && (
              <Box sx={{ my: 2 }}>
                <CircularProgress size={24} />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Processing your request...
                </Typography>
              </Box>
            )}

            {/* Error display */}
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {/* Suggestions */}
            {suggestions.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Search Results:
                </Typography>
                <List>
                  {suggestions.slice(0, 3).map((project) => (
                    <ListItem
                      key={project._id}
                      button
                      onClick={() => {
                        navigate(`/projects/${project._id}`);
                        handleClose();
                      }}
                    >
                      <ListItemIcon>
                        <Home />
                      </ListItemIcon>
                      <ListItemText
                        primary={project.name}
                        secondary={`${project.area} - ₹${(project.pricing?.basePrice / 10000000).toFixed(2)} Cr`}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}

            {/* Voice commands help */}
            {!isListening && !transcript && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Try saying:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
                  <Chip label="Show projects under 2 crore" size="small" />
                  <Chip label="Find villas in Whitefield" size="small" />
                  <Chip label="Go to payments" size="small" />
                  <Chip label="Calculate EMI" size="small" />
                </Box>
              </Box>
            )}

            {/* Action button */}
            {!isListening && (
              <Button
                variant="contained"
                size="large"
                startIcon={<Mic />}
                onClick={toggleListening}
                sx={{ mt: 3 }}
              >
                Start Listening
              </Button>
            )}
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default VoiceSearch;
