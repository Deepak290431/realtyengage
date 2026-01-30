import { axiosInstance } from './authService';

const enquiryService = {
  // Create new enquiry
  createEnquiry: async (enquiryData) => {
    const response = await axiosInstance.post('/enquiries', enquiryData);
    return response.data;
  },

  // Get enquiries (filtered for customers, all for admins)
  getEnquiries: async (params = {}) => {
    const response = await axiosInstance.get('/enquiries', { params });
    return response.data;
  },

  // Get single enquiry
  getEnquiry: async (id) => {
    const response = await axiosInstance.get(`/enquiries/${id}`);
    return response.data;
  },

  // Update enquiry (Admin only)
  updateEnquiry: async (id, enquiryData) => {
    const response = await axiosInstance.put(`/enquiries/${id}`, enquiryData);
    return response.data;
  },

  // Add note to enquiry
  addNote: async (id, noteData) => {
    const response = await axiosInstance.post(`/enquiries/${id}/notes`, noteData);
    return response.data;
  },

  // Assign enquiry to admin
  assignEnquiry: async (id, adminId) => {
    const response = await axiosInstance.put(`/enquiries/${id}/assign`, { adminId });
    return response.data;
  },

  // Get enquiry statistics (Admin only)
  getEnquiryStats: async () => {
    const response = await axiosInstance.get('/enquiries/stats/overview');
    return response.data;
  },

  // Delete enquiry (Admin only)
  deleteEnquiry: async (id) => {
    const response = await axiosInstance.delete(`/enquiries/${id}`);
    return response.data;
  },

  // Get my enquiries (Customer)
  getMyEnquiries: async (params = {}) => {
    const response = await axiosInstance.get('/enquiries', {
      params: {
        ...params,
        sort: '-createdAt'
      }
    });
    return response.data;
  },

  // Mark enquiry as converted (Admin only)
  markAsConverted: async (id) => {
    const response = await axiosInstance.put(`/enquiries/${id}`, {
      status: 'converted'
    });
    return response.data;
  },

  // Schedule follow-up
  scheduleFollowUp: async (id, followUpDate) => {
    const response = await axiosInstance.put(`/enquiries/${id}`, {
      status: 'follow_up',
      followUpDate
    });
    return response.data;
  }
};

export default enquiryService;
