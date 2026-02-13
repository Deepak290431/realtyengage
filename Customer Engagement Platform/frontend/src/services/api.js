import axios from 'axios';
import toast from 'react-hot-toast';

// API Base URL from .env or dynamic based on app type
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Global error handling and auto-logout
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle token expiration / 401
    if (error.response?.status === 401) {
      // If token was invalidated (logout all) or role changed, don't retry refresh
      if (error.response?.data?.tokenInvalidated || error.response?.data?.roleChanged) {
        localStorage.clear();
        window.location.href = '/login?message=' + encodeURIComponent(error.response.data.message);
        return Promise.reject(error);
      }

      if (!originalRequest._retry) {
        originalRequest._retry = true;
        try {
          const refreshToken = localStorage.getItem('refreshToken');
          if (refreshToken) {
            // Attempting to refresh token
            const res = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
            const { token } = res.data;
            localStorage.setItem('token', token);
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          }
        } catch (refreshError) {
          // Refresh failed, logout
          localStorage.clear();
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }
    }

    // Global Error Toast (Only for non-401 or if refresh failed)
    if (error.response?.status !== 401) {
      const message = error.response?.data?.message || error.response?.data?.error || 'Something went wrong';
      toast.error(message);
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  logoutAll: () => api.post('/auth/logout-all'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, newPassword) => api.post('/auth/reset-password', { token, newPassword }),
  verifyEmail: (token) => api.get(`/auth/verify/${token}`),
  refreshToken: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
  checkAuth: () => api.get('/auth/profile'),
};

// User API
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (userData) => api.put('/users/profile', userData),
  changePassword: (passwords) => api.put('/users/change-password', passwords),
  uploadAvatar: (formData) => api.post('/users/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteAccount: () => api.delete('/users/profile'),
  getUsers: (params) => api.get('/users', { params }), // Admin only
  getUserById: (id) => api.get(`/users/${id}`), // Admin only
  createUser: (userData) => api.post('/users', userData), // Admin only
  updateUser: (id, userData) => api.put(`/users/${id}`, userData), // Admin only
  deleteUser: (id) => api.delete(`/users/${id}`), // Admin only
};

// Project API
export const projectAPI = {
  getProjects: (params) => api.get('/projects', { params }),
  getProjectById: (id) => api.get(`/projects/${id}`),
  createProject: (projectData) => api.post('/projects', projectData),
  updateProject: (id, projectData) => api.put(`/projects/${id}`, projectData),
  deleteProject: (id) => api.delete(`/projects/${id}`),
  uploadProjectImage: (id, formData) => api.post(`/projects/${id}/images`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteProjectImage: (projectId, imageId) => api.delete(`/projects/${projectId}/images/${imageId}`),
  getFeaturedProjects: () => api.get('/projects/featured'),
  searchProjects: (query) => api.get('/projects/search', { params: { q: query } }),
  getProjectStats: (id) => api.get(`/projects/${id}/stats`),
  toggleProjectStatus: (id) => api.patch(`/projects/${id}/toggle-status`),
};

// Enquiry API
export const enquiryAPI = {
  getEnquiries: (params) => api.get('/enquiries', { params }),
  getEnquiryById: (id) => api.get(`/enquiries/${id}`),
  createEnquiry: (enquiryData) => api.post('/enquiries', enquiryData),
  updateEnquiry: (id, enquiryData) => api.put(`/enquiries/${id}`, enquiryData),
  deleteEnquiry: (id) => api.delete(`/enquiries/${id}`),
  respondToEnquiry: (id, response) => api.post(`/enquiries/${id}/respond`, response),
  getMyEnquiries: () => api.get('/enquiries/my-enquiries'),
  updateEnquiryStatus: (id, status) => api.patch(`/enquiries/${id}/status`, { status }),
  assignEnquiry: (id, userId) => api.patch(`/enquiries/${id}/assign`, { assignedTo: userId }),
  addNote: (id, note) => api.post(`/enquiries/${id}/notes`, { note }),
};

// Payment API
export const paymentAPI = {
  getPayments: (params) => api.get('/payments', { params }),
  getPaymentById: (id) => api.get(`/payments/${id}`),
  createPayment: (paymentData) => api.post('/payments', paymentData),
  updatePayment: (id, paymentData) => api.put(`/payments/${id}`, paymentData),
  verifyPayment: (paymentData) => api.post('/payments/verify', paymentData),
  getMyPayments: () => api.get('/payments/my-payments'),
  downloadReceipt: (id) => api.get(`/payments/${id}/receipt`, { responseType: 'blob' }),
  createPaymentOrder: (amount) => api.post('/payments/create-order', { amount }),
  refundPayment: (id, reason) => api.post(`/payments/${id}/refund`, { reason }),
  getPaymentStats: () => api.get('/payments/stats'),
  calculateEMI: (data) => api.post('/payments/calculate-emi', data),
  getPaymentSchedule: (projectId) => api.get(`/payments/schedule/${projectId}`),
  getTransactionHistory: () => api.get('/payments/transactions/history'),
};

// Support API
export const supportAPI = {
  getTickets: (params) => api.get('/support/tickets', { params }),
  getTicketById: (id) => api.get(`/support/tickets/${id}`),
  createTicket: (ticketData) => api.post('/support/tickets', ticketData),
  updateTicket: (id, ticketData) => api.put(`/support/tickets/${id}`, ticketData),
  deleteTicket: (id) => api.delete(`/support/tickets/${id}`),
  replyToTicket: (id, message) => api.post(`/support/tickets/${id}/reply`, { message }),
  closeTicket: (id) => api.patch(`/support/tickets/${id}/close`),
  getMyTickets: () => api.get('/support/my-tickets'),
  assignTicket: (id, userId) => api.patch(`/support/tickets/${id}/assign`, { assignedTo: userId }),
  updateTicketPriority: (id, priority) => api.patch(`/support/tickets/${id}/priority`, { priority }),
  getFAQs: () => api.get('/support/faqs'),
  searchFAQs: (query) => api.get('/support/faqs/search', { params: { q: query } }),
};

// Dashboard API
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
  getAdminStats: () => api.get('/dashboard/admin/stats'),
  getRecentActivities: () => api.get('/dashboard/activities'),
  getChartData: (period) => api.get('/dashboard/charts', { params: { period } }),
  getNotifications: () => api.get('/dashboard/notifications'),
  markNotificationRead: (id) => api.patch(`/dashboard/notifications/${id}/read`),
  getUpcomingPayments: () => api.get('/dashboard/upcoming-payments'),
  getPropertyProgress: () => api.get('/dashboard/property-progress'),
};

// Customer API
export const customerAPI = {
  getCustomers: (params) => api.get('/customers', { params }),
  getCustomerById: (id) => api.get(`/customers/${id}`),
  updateCustomerStatus: (id, data) => api.put(`/customers/${id}/status`, data), // data: { status, type }
  addCustomerNote: (id, noteData) => api.post(`/customers/${id}/notes`, noteData), // noteData: { text, enquiryId }
};

// Settings API
export const settingsAPI = {
  getSettings: () => api.get('/settings'),
  updateSettings: (data) => api.put('/settings', data),
};

// Contact API
export const contactAPI = {
  submitForm: (data) => api.post('/contact', data),
};

// Admin Management API (Super Admin only)
export const adminAPI = {
  getAdmins: () => api.get('/admin/users'),
  createAdmin: (adminData) => api.post('/admin/create', adminData),
  updateAdmin: (id, adminData) => api.put(`/admin/${id}`, adminData),
  blockAdmin: (id, isActive) => api.put(`/admin/${id}/block`, { isActive }),
  deleteAdmin: (id) => api.delete(`/admin/${id}`),
  getAuditLogs: () => api.get('/admin/audit-logs'),
};

// Virtual Tour API
export const virtualTourAPI = {
  getVirtualTour: (projectId) => api.get(`/virtual-tour/${projectId}`),
  upload360Images: (projectId, images) => api.post(`/virtual-tour/${projectId}/360-images`, { images }),
  upload360Video: (projectId, videoData) => api.post(`/virtual-tour/${projectId}/360-video`, videoData),
  toggleVirtualTour: (projectId, enabled) => api.put(`/virtual-tour/${projectId}/toggle`, { enabled }),
  delete360Image: (projectId, imageId) => api.delete(`/virtual-tour/${projectId}/360-images/${imageId}`),
  delete360Video: (projectId) => api.delete(`/virtual-tour/${projectId}/360-video`),
  update360Image: (projectId, imageId, data) => api.put(`/virtual-tour/${projectId}/360-images/${imageId}`, data),
  update360Video: (projectId, data) => api.put(`/virtual-tour/${projectId}/360-video`, data),
};

// Chatbot API
export const chatbotAPI = {
  sendMessage: async (message) => {
    try {
      // For now, use a simple AI response simulator
      // In production, this would connect to your AI service (OpenAI, Dialogflow, etc.)
      const response = await api.post('/chatbot/message', { message });
      return response.data;
    } catch (error) {
      // Fallback to local response generation if API fails
      return generateLocalChatbotResponse(message);
    }
  },
  getConversationHistory: () => api.get('/chatbot/history'),
  clearConversation: () => api.delete('/chatbot/history'),
};

// Local chatbot response generator (fallback)
function generateLocalChatbotResponse(message) {
  const lowerMessage = message.toLowerCase();

  const responses = {
    greeting: [
      "Hello! Welcome to RealtyEngage. How can I assist you today?",
      "Hi there! I'm here to help you find your dream property. What are you looking for?",
    ],
    projects: [
      "We have several amazing projects available! You can browse our properties on the Projects page. Would you like to know about any specific location or budget range?",
      "Our current projects include apartments and villas in prime locations across Bangalore. What's your preferred area?",
    ],
    price: [
      "Our properties range from ₹45 Lakhs to ₹280 Lakhs. You can filter by price on our Projects page. What's your budget range?",
      "We offer various price points to suit different budgets. Our EMI calculator can help you plan your investment. Would you like to check it out?",
    ],
    emi: [
      "Our EMI calculator is available on each project page. You can calculate your monthly payments based on loan amount, interest rate, and tenure. Would you like me to guide you there?",
      "EMI planning is important! Visit any project details page and use our EMI calculator. We also offer assistance with bank loans.",
    ],
    location: [
      "We have properties in prime locations including Whitefield, Electronic City, Hebbal, Sarjapur Road, and Marathahalli. Which area interests you?",
      "Location is key! Our projects are strategically located near IT hubs, schools, and hospitals. Where do you work or prefer to live?",
    ],
    amenities: [
      "Our properties offer world-class amenities including swimming pools, gyms, clubhouses, gardens, and more. Each project has unique features. Would you like details about a specific project?",
      "We prioritize lifestyle amenities! From fitness centers to children's play areas, our projects have it all. What amenities are most important to you?",
    ],
    contact: [
      "You can reach us through the contact form on any project page, or call us directly. Our sales team is available 9 AM to 7 PM. Would you like to schedule a site visit?",
      "We're here to help! You can submit an enquiry on any project page, and our team will contact you within 24 hours.",
    ],
    visit: [
      "Site visits can be scheduled through the project details page. We offer guided tours on all days. When would you like to visit?",
      "Seeing is believing! Click 'Schedule Visit' on any project page to book your site tour. We also offer virtual tours.",
    ],
    default: [
      "I can help you with information about our projects, prices, EMI calculations, locations, and more. What specific information are you looking for?",
      "I'm here to assist! You can ask me about available properties, pricing, locations, amenities, or how to schedule a visit.",
    ]
  };

  // Determine response category
  let category = 'default';
  if (lowerMessage.match(/hi|hello|hey|good/)) category = 'greeting';
  else if (lowerMessage.match(/project|property|properties|apartment|villa|home/)) category = 'projects';
  else if (lowerMessage.match(/price|cost|budget|expensive|cheap|afford/)) category = 'price';
  else if (lowerMessage.match(/emi|loan|monthly|payment|installment/)) category = 'emi';
  else if (lowerMessage.match(/location|where|area|place|address/)) category = 'location';
  else if (lowerMessage.match(/amenity|amenities|facility|facilities|feature/)) category = 'amenities';
  else if (lowerMessage.match(/contact|call|phone|email|reach/)) category = 'contact';
  else if (lowerMessage.match(/visit|tour|see|view|schedule/)) category = 'visit';

  const categoryResponses = responses[category];
  const response = categoryResponses[Math.floor(Math.random() * categoryResponses.length)];

  return {
    message: response,
    timestamp: new Date().toISOString(),
    suggestions: getSuggestions(category)
  };
}

function getSuggestions(category) {
  const allSuggestions = {
    greeting: ["View Projects", "Check Prices", "Schedule Visit"],
    projects: ["Filter by Location", "Filter by Price", "View Amenities"],
    price: ["Use EMI Calculator", "View Payment Plans", "Check Offers"],
    emi: ["Calculate EMI", "View Payment Schedule", "Get Loan Assistance"],
    location: ["View on Map", "Check Connectivity", "Nearby Facilities"],
    amenities: ["View All Amenities", "Compare Projects", "Virtual Tour"],
    contact: ["Submit Enquiry", "Call Now", "Schedule Visit"],
    visit: ["Book Site Visit", "Virtual Tour", "Get Directions"],
    default: ["View Projects", "Contact Us", "FAQs"]
  };

  return allSuggestions[category] || allSuggestions.default;
}

export default api;
