import axios from 'axios';

// Create axios instance with base configuration
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token refresh
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await authAPI.refreshToken({ refreshToken });

          const { token, refreshToken: newRefreshToken } = response.data;
          localStorage.setItem('token', token);
          localStorage.setItem('refreshToken', newRefreshToken);

          originalRequest.headers.Authorization = `Bearer ${token}`;
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, clear storage and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

const authService = {
  // Login
  login: async (email, password) => {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email,
      password,
    });
    return response;
  },

  // Register
  register: async (userData) => {
    const response = await axios.post(`${API_URL}/auth/register`, userData);
    return response;
  },

  // Logout
  logout: async () => {
    try {
      await axiosInstance.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    }
  },

  // Get profile
  getProfile: async () => {
    const response = await axiosInstance.get('/auth/profile');
    return response;
  },

  // Update profile
  updateProfile: async (profileData) => {
    const response = await axiosInstance.put('/auth/profile', profileData);
    return response;
  },

  // Change password
  changePassword: async (currentPassword, newPassword) => {
    const response = await axiosInstance.post('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    return response;
  },

  // Forgot password
  forgotPassword: async (identifier) => {
    // identifier can be { email } or { phone }
    const response = await axios.post(`${API_URL}/auth/forgot-password`, identifier);
    return response;
  },

  // Verify OTP
  verifyOTP: async (identifier, otp) => {
    // identifier can be { email } or { phone }
    const response = await axios.post(`${API_URL}/auth/verify-otp`, {
      ...identifier,
      otp,
    });
    return response;
  },

  // Reset password
  resetPassword: async (token, newPassword) => {
    const response = await axios.post(`${API_URL}/auth/reset-password`, {
      token,
      newPassword,
    });
    return response;
  },

  // Verify token
  verifyToken: async () => {
    const response = await axiosInstance.get('/auth/verify');
    return response;
  },

  // Get axios instance for other services
  getAxiosInstance: () => axiosInstance,
};

export default authService;
export { axiosInstance };
