import authService from '../../services/authService';
import axios from 'axios';
import toast from 'react-hot-toast';

// Mock axios
jest.mock('axios');
jest.mock('react-hot-toast');

describe('AuthService', () => {
  const API_URL = process.env.VITE_API_URL || 'http://localhost:5000';
  
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('login', () => {
    const credentials = {
      email: 'test@example.com',
      password: 'password123',
    };

    const mockResponse = {
      data: {
        success: true,
        token: 'mock-token',
        refreshToken: 'mock-refresh-token',
        user: {
          id: '1',
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          role: 'customer',
        },
      },
    };

    test('successful login stores tokens and returns user data', async () => {
      axios.post.mockResolvedValueOnce(mockResponse);

      const result = await authService.login(credentials);

      expect(axios.post).toHaveBeenCalledWith(
        `${API_URL}/api/auth/login`,
        credentials
      );
      expect(localStorage.getItem('token')).toBe('mock-token');
      expect(localStorage.getItem('refreshToken')).toBe('mock-refresh-token');
      expect(result).toEqual(mockResponse.data);
    });

    test('failed login throws error', async () => {
      const errorMessage = 'Invalid credentials';
      axios.post.mockRejectedValueOnce({
        response: { data: { message: errorMessage } },
      });

      await expect(authService.login(credentials)).rejects.toThrow(errorMessage);
      expect(localStorage.getItem('token')).toBeNull();
    });

    test('network error during login', async () => {
      axios.post.mockRejectedValueOnce(new Error('Network Error'));

      await expect(authService.login(credentials)).rejects.toThrow('Network Error');
    });
  });

  describe('register', () => {
    const userData = {
      email: 'newuser@example.com',
      password: 'password123',
      firstName: 'New',
      lastName: 'User',
    };

    test('successful registration', async () => {
      const mockResponse = {
        data: {
          success: true,
          message: 'Registration successful',
          user: { ...userData, id: '2' },
        },
      };

      axios.post.mockResolvedValueOnce(mockResponse);

      const result = await authService.register(userData);

      expect(axios.post).toHaveBeenCalledWith(
        `${API_URL}/api/auth/register`,
        userData
      );
      expect(result).toEqual(mockResponse.data);
    });

    test('registration with existing email', async () => {
      axios.post.mockRejectedValueOnce({
        response: { data: { message: 'Email already exists' } },
      });

      await expect(authService.register(userData)).rejects.toThrow(
        'Email already exists'
      );
    });
  });

  describe('logout', () => {
    test('clears tokens and user data on logout', async () => {
      localStorage.setItem('token', 'test-token');
      localStorage.setItem('refreshToken', 'test-refresh-token');
      localStorage.setItem('user', JSON.stringify({ id: '1' }));

      axios.post.mockResolvedValueOnce({ data: { success: true } });

      await authService.logout();

      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('refreshToken')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
    });

    test('logout works even if API call fails', async () => {
      localStorage.setItem('token', 'test-token');
      axios.post.mockRejectedValueOnce(new Error('Network Error'));

      await authService.logout();

      expect(localStorage.getItem('token')).toBeNull();
    });
  });

  describe('getCurrentUser', () => {
    test('returns user from localStorage', () => {
      const user = { id: '1', email: 'test@example.com' };
      localStorage.setItem('user', JSON.stringify(user));

      const result = authService.getCurrentUser();
      expect(result).toEqual(user);
    });

    test('returns null when no user in localStorage', () => {
      const result = authService.getCurrentUser();
      expect(result).toBeNull();
    });

    test('handles invalid JSON in localStorage', () => {
      localStorage.setItem('user', 'invalid-json');
      
      const result = authService.getCurrentUser();
      expect(result).toBeNull();
    });
  });

  describe('refreshToken', () => {
    test('successfully refreshes token', async () => {
      const mockResponse = {
        data: {
          token: 'new-token',
          refreshToken: 'new-refresh-token',
        },
      };

      localStorage.setItem('refreshToken', 'old-refresh-token');
      axios.post.mockResolvedValueOnce(mockResponse);

      const result = await authService.refreshToken();

      expect(axios.post).toHaveBeenCalledWith(`${API_URL}/api/auth/refresh`, {
        refreshToken: 'old-refresh-token',
      });
      expect(localStorage.getItem('token')).toBe('new-token');
      expect(result).toEqual(mockResponse.data);
    });

    test('refresh fails when no refresh token', async () => {
      await expect(authService.refreshToken()).rejects.toThrow();
    });
  });

  describe('resetPassword', () => {
    test('sends password reset request', async () => {
      const email = 'test@example.com';
      const mockResponse = {
        data: { success: true, message: 'Reset email sent' },
      };

      axios.post.mockResolvedValueOnce(mockResponse);

      const result = await authService.resetPassword(email);

      expect(axios.post).toHaveBeenCalledWith(
        `${API_URL}/api/auth/reset-password`,
        { email }
      );
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('verifyEmail', () => {
    test('verifies email with token', async () => {
      const token = 'verification-token';
      const mockResponse = {
        data: { success: true, message: 'Email verified' },
      };

      axios.get.mockResolvedValueOnce(mockResponse);

      const result = await authService.verifyEmail(token);

      expect(axios.get).toHaveBeenCalledWith(
        `${API_URL}/api/auth/verify-email/${token}`
      );
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('updateProfile', () => {
    test('updates user profile', async () => {
      const profileData = { firstName: 'Updated', lastName: 'Name' };
      const mockResponse = {
        data: {
          success: true,
          user: { id: '1', ...profileData },
        },
      };

      localStorage.setItem('token', 'test-token');
      axios.put.mockResolvedValueOnce(mockResponse);

      const result = await authService.updateProfile(profileData);

      expect(axios.put).toHaveBeenCalledWith(
        `${API_URL}/api/auth/profile`,
        profileData,
        {
          headers: { Authorization: 'Bearer test-token' },
        }
      );
      expect(result).toEqual(mockResponse.data);
    });

    test('fails when not authenticated', async () => {
      await expect(
        authService.updateProfile({ firstName: 'Test' })
      ).rejects.toThrow();
    });
  });
});
