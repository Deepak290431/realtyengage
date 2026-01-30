import { axiosInstance } from './authService';

const userService = {
  // Get all users (Admin only)
  getUsers: async (params = {}) => {
    const response = await axiosInstance.get('/users', { params });
    return response.data;
  },

  // Get single user
  getUser: async (id) => {
    const response = await axiosInstance.get(`/users/${id}`);
    return response.data;
  },

  // Update user (Admin only)
  updateUser: async (id, userData) => {
    const response = await axiosInstance.put(`/users/${id}`, userData);
    return response.data;
  },

  // Update user status (Admin only)
  updateUserStatus: async (id, statusType) => {
    const response = await axiosInstance.put(`/users/${id}/status`, { statusType });
    return response.data;
  },

  // Delete user (Admin only)
  deleteUser: async (id) => {
    const response = await axiosInstance.delete(`/users/${id}`);
    return response.data;
  },

  // Get user statistics (Admin only)
  getUserStats: async () => {
    const response = await axiosInstance.get('/users/stats');
    return response.data;
  },

  // Search users
  searchUsers: async (query) => {
    const response = await axiosInstance.get('/users/search', {
      params: { q: query }
    });
    return response.data;
  },

  // Get users by status
  getUsersByStatus: async (statusType) => {
    const response = await axiosInstance.get('/users', {
      params: { statusType }
    });
    return response.data;
  },

  // Get users by role
  getUsersByRole: async (role) => {
    const response = await axiosInstance.get('/users', {
      params: { role }
    });
    return response.data;
  },

  // Export users data (Admin only)
  exportUsers: async (format = 'csv') => {
    const response = await axiosInstance.get('/users/export', {
      params: { format },
      responseType: 'blob'
    });

    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `users_${Date.now()}.${format}`);
    document.body.appendChild(link);
    link.click();
    link.remove();

    return response.data;
  },

  // Get user activity log
  getUserActivity: async (id, params = {}) => {
    const response = await axiosInstance.get(`/users/${id}/activity`, { params });
    return response.data;
  },

  // Get user payment history
  getUserPaymentHistory: async (id, params = {}) => {
    const response = await axiosInstance.get(`/users/${id}/payments`, { params });
    return response.data;
  },

  // Get user enquiry history
  getUserEnquiryHistory: async (id, params = {}) => {
    const response = await axiosInstance.get(`/users/${id}/enquiries`, { params });
    return response.data;
  },

  // Get user status types
  getUserStatusTypes: () => {
    return [
      { value: 'just_enquired', label: 'Just Enquired', color: 'info' },
      { value: 'paid_initial', label: 'Paid Initial Amount', color: 'warning' },
      { value: 'full_payment_pending', label: 'Full Payment (Pending Move-in)', color: 'warning' },
      { value: 'full_payment_moved_in', label: 'Full Payment (Moved In)', color: 'success' },
      { value: 'emi_customer', label: 'EMI Customer', color: 'primary' }
    ];
  },

  // Get user roles
  getUserRoles: () => {
    return [
      { value: 'customer', label: 'Customer', color: 'primary' },
      { value: 'admin', label: 'Administrator', color: 'secondary' }
    ];
  }
};

export default userService;
