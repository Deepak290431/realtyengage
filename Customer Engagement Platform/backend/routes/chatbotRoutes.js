const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');

// In-memory conversation storage (use Redis or DB in production)
const conversations = new Map();

// AI Response Generator
const generateAIResponse = (message, userId) => {
  const lowerMessage = message.toLowerCase();
  
  // Get or create conversation history
  if (!conversations.has(userId)) {
    conversations.set(userId, []);
  }
  
  const history = conversations.get(userId);
  
  // Response templates based on intent
  const responses = {
    greeting: [
      "Hello! Welcome to RealtyEngage. I'm your AI assistant. How can I help you find your dream property today?",
      "Hi there! I'm here to assist you with all your real estate needs. Are you looking to buy a property or need information about our current projects?",
      "Welcome! I can help you explore properties, calculate EMIs, schedule visits, and answer any questions about our projects. What would you like to know?"
    ],
    
    projects: [
      "We have an excellent selection of properties across Bangalore:\n\n" +
      "🏢 **Apartments**: Starting from ₹45 Lakhs in Electronic City, Whitefield, and Marathahalli\n" +
      "🏡 **Villas**: Premium villas from ₹150 Lakhs in Sarjapur Road\n\n" +
      "Which location or budget range interests you?",
      
      "Our portfolio includes:\n" +
      "• Skyline Heights (Whitefield) - 2/3 BHK from ₹75 Lakhs\n" +
      "• Green Valley Villas (Sarjapur) - 3/4 BHK from ₹150 Lakhs\n" +
      "• Urban Square (Electronic City) - 1/2/3 BHK from ₹45 Lakhs\n" +
      "• Lakeside Residences (Hebbal) - 2/3/4 BHK from ₹95 Lakhs\n\n" +
      "Would you like detailed information about any specific project?"
    ],
    
    price: [
      "Our properties are available in various price ranges:\n\n" +
      "💰 **Budget-Friendly**: ₹45-85 Lakhs (1-2 BHK apartments)\n" +
      "💎 **Mid-Range**: ₹85-150 Lakhs (2-3 BHK premium apartments)\n" +
      "👑 **Luxury**: ₹150-280 Lakhs (Villas and 4 BHK apartments)\n\n" +
      "We also offer flexible payment plans and EMI options. What's your budget preference?",
      
      "I can help you find properties within your budget! Our current offerings:\n" +
      "• Under ₹75 Lakhs: Urban Square, Royal Gardens\n" +
      "• ₹75-125 Lakhs: Skyline Heights, Tech Park Residency\n" +
      "• ₹125-200 Lakhs: Lakeside Residences, Green Valley Villas\n\n" +
      "We also provide assistance with home loans and have tie-ups with major banks. Shall I help you calculate EMI?"
    ],
    
    emi: [
      "I can help you calculate EMI! For example:\n\n" +
      "For a ₹75 Lakh property with 20% down payment:\n" +
      "• Loan Amount: ₹60 Lakhs\n" +
      "• Interest Rate: 8.5% p.a.\n" +
      "• 20-year tenure\n" +
      "**EMI: Approximately ₹52,000/month**\n\n" +
      "Would you like me to calculate EMI for a specific property or amount?",
      
      "Our EMI calculator can help you plan your investment:\n\n" +
      "📊 Factors affecting EMI:\n" +
      "• Loan amount (after down payment)\n" +
      "• Interest rate (8-9% typically)\n" +
      "• Loan tenure (up to 30 years)\n\n" +
      "We also have partnerships with banks offering pre-approved loans. Which property are you considering?"
    ],
    
    location: [
      "Our projects are strategically located across Bangalore's prime areas:\n\n" +
      "📍 **IT Corridor**: Whitefield, Electronic City, Marathahalli\n" +
      "📍 **North Bangalore**: Hebbal (near airport)\n" +
      "📍 **East Bangalore**: Sarjapur Road, ITPL\n\n" +
      "Each location offers excellent connectivity, proximity to schools, hospitals, and shopping centers. Which area do you prefer?",
      
      "Location benefits of our projects:\n\n" +
      "✅ Close to major IT parks (Infosys, Wipro, TCS)\n" +
      "✅ Metro connectivity (existing or upcoming)\n" +
      "✅ Top schools within 5km radius\n" +
      "✅ Hospitals and malls nearby\n" +
      "✅ Easy access to ORR and major highways\n\n" +
      "Would you like to see properties near your workplace?"
    ],
    
    amenities: [
      "Our properties feature world-class amenities:\n\n" +
      "🏊 Swimming Pool & Kids Pool\n" +
      "🏋️ Fully-equipped Gymnasium\n" +
      "🎾 Sports Courts (Tennis, Badminton)\n" +
      "🌳 Landscaped Gardens & Jogging Tracks\n" +
      "🎮 Indoor Games & Kids Play Area\n" +
      "🏛️ Clubhouse & Party Hall\n" +
      "🚗 Covered Parking\n" +
      "🔒 24/7 Security with CCTV\n" +
      "⚡ 100% Power Backup\n\n" +
      "Different projects have unique features. Which amenities are most important to you?",
      
      "Premium lifestyle amenities in all our projects:\n\n" +
      "**Health & Fitness**: Gym, Yoga room, Swimming pool\n" +
      "**Recreation**: Clubhouse, Mini theatre, Games room\n" +
      "**Nature**: Gardens, Walking trails, Open spaces (60-70%)\n" +
      "**Convenience**: EV charging, Co-working spaces\n" +
      "**Safety**: Gated community, Video surveillance, Fire safety\n\n" +
      "Would you like a virtual tour to see these amenities?"
    ],
    
    visit: [
      "I'd be happy to help you schedule a site visit! 🏗️\n\n" +
      "**Visit Options**:\n" +
      "• Weekday visits: 10 AM - 6 PM\n" +
      "• Weekend visits: 10 AM - 7 PM\n" +
      "• Virtual tours available\n\n" +
      "Our team will:\n" +
      "✓ Pick you up from a convenient location\n" +
      "✓ Show you the property and amenities\n" +
      "✓ Explain payment plans and offers\n\n" +
      "Which property would you like to visit?",
      
      "Site visits are the best way to experience our projects!\n\n" +
      "During your visit, you'll see:\n" +
      "• Sample flats (fully furnished)\n" +
      "• Amenities and common areas\n" +
      "• Construction progress\n" +
      "• Neighborhood and connectivity\n\n" +
      "We can also arrange multiple property visits in one day. When would you prefer to visit?"
    ],
    
    offers: [
      "🎉 Current Special Offers:\n\n" +
      "**Festival Season Benefits**:\n" +
      "• No GST on select units\n" +
      "• Free modular kitchen worth ₹2 Lakhs\n" +
      "• Zero processing fee on home loans\n" +
      "• Free club membership for 5 years\n\n" +
      "**Early Bird Discount**: 5% off for bookings this month\n" +
      "**Referral Bonus**: ₹50,000 for successful referrals\n\n" +
      "These offers are time-limited! Would you like to know more?",
      
      "Special schemes available:\n\n" +
      "💸 **Payment Plans**:\n" +
      "• 20:80 scheme (20% now, 80% on possession)\n" +
      "• Flexi payment plans\n" +
      "• Subvention scheme (no EMI till possession)\n\n" +
      "🎁 **Additional Benefits**:\n" +
      "• Free registration\n" +
      "• Complimentary home insurance\n" +
      "• Interior design consultation\n\n" +
      "Which offer interests you the most?"
    ],
    
    documents: [
      "Required documents for property purchase:\n\n" +
      "**For Salaried Individuals**:\n" +
      "📄 PAN Card & Aadhaar Card\n" +
      "📄 Last 3 months salary slips\n" +
      "📄 Last 6 months bank statements\n" +
      "📄 Form 16 or ITR (last 2 years)\n" +
      "📄 Employment proof\n\n" +
      "**For Self-Employed**:\n" +
      "📄 Business proof & GST registration\n" +
      "📄 ITR with computation (last 3 years)\n" +
      "📄 Bank statements (last 12 months)\n\n" +
      "Our team will assist you throughout the documentation process!",
      
      "Legal documents and approvals for our projects:\n\n" +
      "✅ RERA Registration\n" +
      "✅ Sanctioned Building Plan\n" +
      "✅ Land Title Documents\n" +
      "✅ Environmental Clearance\n" +
      "✅ Fire NOC\n" +
      "✅ Occupancy Certificate (for ready projects)\n\n" +
      "All documents are available for verification. Would you like to review any specific document?"
    ],
    
    contact: [
      "Multiple ways to reach us:\n\n" +
      "📞 **Call**: +91-9876543210 (9 AM - 7 PM)\n" +
      "📧 **Email**: info@realtyengage.com\n" +
      "💬 **WhatsApp**: +91-9876543210\n" +
      "🏢 **Visit**: Our sales office in Whitefield\n\n" +
      "You can also:\n" +
      "• Submit an enquiry through our website\n" +
      "• Book a callback at your convenient time\n" +
      "• Chat with me anytime!\n\n" +
      "How would you prefer to connect?",
      
      "Our dedicated team is here to help!\n\n" +
      "**Immediate Assistance**:\n" +
      "• Live chat (you're using it now! 😊)\n" +
      "• Instant callback option\n\n" +
      "**Specialized Support**:\n" +
      "• Sales team for property queries\n" +
      "• Finance team for loan assistance\n" +
      "• Customer service for post-sales support\n\n" +
      "What kind of assistance do you need?"
    ]
  };

  // Intent detection
  let intent = 'general';
  let confidence = 0.5;
  
  if (lowerMessage.match(/^(hi|hello|hey|good morning|good afternoon|good evening)/)) {
    intent = 'greeting';
    confidence = 0.9;
  } else if (lowerMessage.match(/project|property|apartment|villa|flat|home|house|bhk/)) {
    intent = 'projects';
    confidence = 0.8;
  } else if (lowerMessage.match(/price|cost|budget|rate|amount|lakh|crore|expensive|cheap|afford/)) {
    intent = 'price';
    confidence = 0.8;
  } else if (lowerMessage.match(/emi|loan|monthly|installment|payment|finance|bank/)) {
    intent = 'emi';
    confidence = 0.85;
  } else if (lowerMessage.match(/location|where|area|place|address|map|direction|near/)) {
    intent = 'location';
    confidence = 0.8;
  } else if (lowerMessage.match(/amenity|amenities|facility|facilities|feature|pool|gym|parking/)) {
    intent = 'amenities';
    confidence = 0.85;
  } else if (lowerMessage.match(/visit|tour|see|view|schedule|book|appointment/)) {
    intent = 'visit';
    confidence = 0.85;
  } else if (lowerMessage.match(/offer|discount|scheme|deal|special|promotion/)) {
    intent = 'offers';
    confidence = 0.9;
  } else if (lowerMessage.match(/document|paper|registration|legal|rera|approval/)) {
    intent = 'documents';
    confidence = 0.85;
  } else if (lowerMessage.match(/contact|call|phone|email|reach|talk|speak/)) {
    intent = 'contact';
    confidence = 0.8;
  }
  
  // Get appropriate response
  let response;
  if (responses[intent]) {
    const options = responses[intent];
    response = options[Math.floor(Math.random() * options.length)];
  } else {
    // Default responses for unmatched intents
    const defaultResponses = [
      "I'm here to help you find your perfect property! You can ask me about:\n" +
      "• Available projects and prices\n" +
      "• EMI calculations\n" +
      "• Property locations and amenities\n" +
      "• Schedule site visits\n" +
      "• Current offers and payment plans\n\n" +
      "What would you like to know?",
      
      "I'd be happy to assist you! Here are some things I can help with:\n" +
      "🏠 Browse properties by location or budget\n" +
      "💰 Calculate EMI and payment plans\n" +
      "📍 Check project locations and connectivity\n" +
      "🎯 Schedule property visits\n" +
      "📞 Connect with our sales team\n\n" +
      "What interests you?",
      
      "Thank you for your interest in RealtyEngage! I can provide information about:\n" +
      "• Our residential projects across Bangalore\n" +
      "• Pricing and payment options\n" +
      "• Amenities and specifications\n" +
      "• Site visit scheduling\n" +
      "• Documentation and loan assistance\n\n" +
      "How can I help you today?"
    ];
    
    response = defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  }
  
  // Add quick actions based on intent
  const quickActions = {
    greeting: ["View Projects", "Check Prices", "Schedule Visit", "Current Offers"],
    projects: ["Filter by Budget", "Filter by Location", "Compare Projects", "Schedule Visit"],
    price: ["EMI Calculator", "View Payment Plans", "Check Offers", "Get Quote"],
    emi: ["Calculate EMI", "View Banks", "Check Interest Rates", "Payment Schedule"],
    location: ["View on Map", "Nearby Facilities", "Connectivity", "Site Visit"],
    amenities: ["View All Amenities", "Virtual Tour", "Compare Projects", "Download Brochure"],
    visit: ["Book Site Visit", "Virtual Tour", "Weekend Visit", "Call Sales Team"],
    offers: ["View All Offers", "Payment Plans", "Calculate Savings", "Book Now"],
    documents: ["Document Checklist", "Legal Verification", "Loan Documents", "Contact Team"],
    contact: ["Call Now", "Email Us", "WhatsApp", "Book Callback"],
    general: ["View Projects", "Calculate EMI", "Schedule Visit", "Contact Us"]
  };
  
  // Save to conversation history
  history.push({
    user: message,
    bot: response,
    timestamp: new Date(),
    intent,
    confidence
  });
  
  // Keep only last 20 messages in history
  if (history.length > 20) {
    history.shift();
  }
  
  conversations.set(userId, history);
  
  return {
    message: response,
    intent,
    confidence,
    quickActions: quickActions[intent] || quickActions.general,
    timestamp: new Date().toISOString()
  };
};

// @route   POST /api/chatbot/message
// @desc    Process chatbot message
// @access  Public (can be used without authentication)
router.post('/message', (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user?.id || req.ip || 'anonymous';
    
    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        error: 'Message is required'
      });
    }
    
    const response = generateAIResponse(message, userId);
    
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
