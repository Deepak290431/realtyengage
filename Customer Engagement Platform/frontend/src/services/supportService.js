import { axiosInstance } from './authService';

const supportService = {
  // Create support request
  createTicket: async (ticketData) => {
    const response = await axiosInstance.post('/support/requests', ticketData);
    return response.data;
  },

  // Get support tickets
  getTickets: async (params = {}) => {
    const response = await axiosInstance.get('/support/requests', { params });
    return response.data;
  },

  // Get single ticket
  getTicket: async (id) => {
    const response = await axiosInstance.get(`/support/requests/${id}`);
    return response.data;
  },

  // Update ticket
  updateTicket: async (id, ticketData) => {
    const response = await axiosInstance.put(`/support/requests/${id}`, ticketData);
    return response.data;
  },

  // Add comment to ticket
  addComment: async (id, commentData) => {
    const response = await axiosInstance.post(`/support/requests/${id}/comments`, commentData);
    return response.data;
  },

  // Resolve ticket (Admin only)
  resolveTicket: async (id, resolutionText) => {
    const response = await axiosInstance.put(`/support/requests/${id}/resolve`, {
      resolutionText
    });
    return response.data;
  },

  // Rate support response
  rateTicket: async (id, ratingData) => {
    const response = await axiosInstance.post(`/support/requests/${id}/rating`, ratingData);
    return response.data;
  },

  // Assign ticket to agent (Admin only)
  assignTicket: async (id, agentId) => {
    const response = await axiosInstance.put(`/support/requests/${id}/assign`, {
      agentId
    });
    return response.data;
  },

  // Get support statistics (Admin only)
  getSupportStats: async () => {
    const response = await axiosInstance.get('/support/requests/stats/overview');
    return response.data;
  },

  // Delete ticket (Admin only)
  deleteTicket: async (id) => {
    const response = await axiosInstance.delete(`/support/requests/${id}`);
    return response.data;
  },

  // Reopen ticket (Customer)
  reopenTicket: async (id) => {
    const response = await axiosInstance.put(`/support/requests/${id}`, {
      status: 'open'
    });
    return response.data;
  },

  // Get my tickets (Customer)
  getMyTickets: async (params = {}) => {
    const response = await axiosInstance.get('/support/requests', {
      params: {
        ...params,
        sort: '-createdAt'
      }
    });
    return response.data;
  },

  // Get ticket categories
  getCategories: () => {
    // This could be fetched from API in future
    return [
      { value: 'technical', label: 'Technical Issue' },
      { value: 'billing', label: 'Billing & Payments' },
      { value: 'documentation', label: 'Documentation' },
      { value: 'feature', label: 'Feature Request' },
      { value: 'general', label: 'General Inquiry' }
    ];
  },

  // Get ticket priorities
  getPriorities: () => {
    return [
      { value: 'low', label: 'Low', color: 'info' },
      { value: 'medium', label: 'Medium', color: 'warning' },
      { value: 'high', label: 'High', color: 'error' },
      { value: 'urgent', label: 'Urgent', color: 'error' }
    ];
  },

  // Get ticket statuses
  getStatuses: () => {
    return [
      { value: 'open', label: 'Open', color: 'info' },
      { value: 'in_review', label: 'In Review', color: 'warning' },
      { value: 'pending_customer', label: 'Pending Customer', color: 'warning' },
      { value: 'resolved', label: 'Resolved', color: 'success' },
      { value: 'closed', label: 'Closed', color: 'default' }
    ];
  }
};

export default supportService;
