const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const Project = require('../models/Project');
const aiService = require('../utils/aiService');

// In-memory conversation storage
const conversations = new Map();

// AI Response Generator (Refined for Real AI + Fallback)
const generateAIResponse = async (message, userId, userName = 'Customer') => {
  // Trim quotes and whitespace from the message
  const cleanMessage = message.replace(/^["']|["']$/g, '').trim();
  const lowerMessage = cleanMessage.toLowerCase();

  // 1. Fetch Context Data (RAG)
  let projects = [];
  try {
    projects = await Project.find({ isActive: true }).limit(5);
  } catch (err) {
    console.error('Context fetch error:', err);
  }

  // 2. Try Real AI (Gemini)
  if (!conversations.has(userId)) {
    conversations.set(userId, []);
  }
  const history = conversations.get(userId);
  history.userName = userName;

  let aiResponse = await aiService.generateResponse(cleanMessage, history, projects);
  let intent = 'general';
  let confidence = 0.5;

  if (aiResponse) {
    // Basic intent extraction (heuristic since we're using raw text from Gemini)
    if (lowerMessage.match(/project|property|flat/)) intent = 'projects';
    else if (lowerMessage.match(/price|cost|gst/)) intent = 'price';
    else if (lowerMessage.match(/emi|loan/)) intent = 'emi';
    else if (lowerMessage.match(/visit|book/)) intent = 'visit';

    confidence = 0.95;
  } else {
    // Dynamic names based on DB for fallback
    const projectNames = projects.length > 0
      ? projects.map(p => p.name).join(', ')
      : 'Skyline Heights and Green Valley Villas';

    // 3. Fallback to Template Logic
    const responses = {
      greeting: [
        `Hello ${userName}! Welcome to RealtyEngage. I'm your AI assistant. How can I help you find your dream property today?`,
        "Hi there! I'm here to assist you with all your real estate needs. Are you looking to buy a property or need information about our current projects?",
        "Welcome! I can help you explore properties, calculate EMIs, schedule visits, and answer any questions about our projects. What would you like to know?"
      ],

      projects: [
        `We have an excellent selection of properties including ${projectNames}. Which location or budget range interests you?`,
        `Our portfolio currently features ${projectNames}. Would you like detailed information about any specific project?`
      ],

      price: [
        "Our properties range from ₹45 Lakhs to ₹2.8 Crores. We also handle transparent GST calculation (18%) and offer flexible payment plans. What's your budget preference?",
        "I can help you find properties within your budget! Shall I help you calculate EMI for our current offerings?"
      ],

      emi: [
        "I can help you calculate EMI! Typically for a ₹75 Lakh property with 20% down, EMI comes to approx ₹52k/month at 8.5% interest. Would you like a precise calculation?",
        "Our EMI calculator can help you plan your investment. Which property are you considering?"
      ],

      visit: [
        "I'd be happy to help you schedule a site visit! We offer weekend tours and virtual 360° walkthroughs. Which property would you like to visit?",
        "Site visits are the best way to experience our projects! When would you prefer to visit?"
      ]
    };

    // Simple Template Router
    if (lowerMessage.match(/^(hi|hello|hey)/)) intent = 'greeting';
    else if (lowerMessage.match(/project|property|properties|villa|apartment|flat|home|house/)) intent = 'projects';
    else if (lowerMessage.match(/price|cost|budget|gst|crore|lakh/)) intent = 'price';
    else if (lowerMessage.match(/emi|loan|monthly/)) intent = 'emi';
    else if (lowerMessage.match(/visit|tour|schedule/)) intent = 'visit';

    const options = responses[intent] || [
      "I'm here to help you find your perfect property! You can ask me about projects, price, EMI, or schedule a visit. What's on your mind?"
    ];
    aiResponse = options[Math.floor(Math.random() * options.length)];
    confidence = 0.7;
  }

  // Add quick actions
  const quickActions = {
    greeting: ["View Projects", "Check Prices", "Schedule Visit"],
    projects: ["Filter by Budget", "Filter by Location", "Schedule Visit"],
    price: ["EMI Calculator", "Payment Plans", "Check Offers"],
    emi: ["Calculate EMI", "Bank Options", "Amortization"],
    visit: ["Book Site Visit", "Virtual Tour", "Weekend Visit"],
    general: ["View Projects", "Calculate EMI", "Contact Us"]
  };

  // Save to conversation history
  history.push({
    user: message,
    bot: aiResponse,
    timestamp: new Date(),
    intent,
    confidence
  });

  if (history.length > 20) history.shift();
  conversations.set(userId, history);

  return {
    message: aiResponse,
    intent,
    confidence,
    quickActions: quickActions[intent] || quickActions.general,
    timestamp: new Date().toISOString()
  };
};

// @route   POST /api/chatbot/message
// @desc    Process chatbot message
// @access  Public
router.post('/message', async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user?.id || req.ip || 'anonymous';
    const userName = req.user?.firstName || 'Customer';

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const response = await generateAIResponse(message, userId, userName);

    res.json({
      success: true,
      data: response
    });
  } catch (error) {
    console.error('Chatbot error:', error);
    res.status(500).json({
      error: 'Failed to process message',
      message: "I'm having trouble processing your request. Please try again or contact our support team."
    });
  }
});

// @route   GET /api/chatbot/history
// @desc    Get conversation history
// @access  Private
router.get('/history', authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;
    const history = conversations.get(userId) || [];

    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error('History fetch error:', error);
    res.status(500).json({
      error: 'Failed to fetch conversation history'
    });
  }
});

// @route   DELETE /api/chatbot/history
// @desc    Clear conversation history
// @access  Private
router.delete('/history', authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;
    conversations.delete(userId);

    res.json({
      success: true,
      message: 'Conversation history cleared'
    });
  } catch (error) {
    console.error('History clear error:', error);
    res.status(500).json({
      error: 'Failed to clear conversation history'
    });
  }
});

// @route   GET /api/chatbot/suggestions
// @desc    Get conversation suggestions
// @access  Public
router.get('/suggestions', (req, res) => {
  const suggestions = [
    "Show me 2 BHK apartments under 80 lakhs",
    "What are the available properties in Whitefield?",
    "Can you help me calculate EMI for 60 lakhs?",
    "What amenities are available in your projects?",
    "Schedule a site visit this weekend",
    "What are the current offers?",
    "Show me villas in Sarjapur Road",
    "What documents do I need for home loan?",
    "Tell me about payment plans",
    "How can I contact the sales team?"
  ];

  res.json({
    success: true,
    data: suggestions
  });
});

module.exports = router;
