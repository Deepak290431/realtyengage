import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Alert, CircularProgress } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { LogIn, Mail, Lock, ArrowRight, Eye, EyeOff, LogOut } from 'lucide-react';
import authService from '../../services/authService';
import { setUser, logout } from '../../store/slices/authSlice';
import toast from 'react-hot-toast';
import { GoogleLogin } from '@react-oauth/google';

const LoginPage = ({ isAdmin = false }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  // Load remembered email on mount and check for transient messages (like logout all)
  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      setFormData(prev => ({ ...prev, email: savedEmail }));
      setRememberMe(true);
    }

    const params = new URLSearchParams(window.location.search);
    const message = params.get('message');
    if (message) {
      toast.success(message, { duration: 5000 });
      // Optionally also set as warning alert
      setError(message);
    }
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleCheckboxChange = (e) => {
    setRememberMe(e.target.checked);
  };

  const handleLogout = () => {
    dispatch(logout());
    toast.success('Logged out successfully');
  };

  // If user is already logged in but as a non-admin, show logout option on admin login page
  const isWrongRole = isAdmin && isAuthenticated && !['admin', 'super_admin'].includes(user?.role);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authService.login(formData.email, formData.password);
      const { user, token, refreshToken } = response.data;

      // Requirement: Admin login page logic
      if (isAdmin && !['admin', 'super_admin'].includes(user.role)) {
        throw new Error('This account does not have administrator privileges.');
      }

      // Handle Remember Me
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', formData.email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }

      dispatch(setUser({
        user: user,
        token: token,
        refreshToken: refreshToken
      }));

      toast.success('Login successful!');

      navigate(['admin', 'super_admin'].includes(user.role) ? '/admin' : '/dashboard');
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Login failed. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex w-full min-h-screen overflow-hidden bg-white dark:bg-gray-900">
      {/* Left Side: Image (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <img
          src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?q=80&w=2000"
          alt="Luxury Real Estate"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-[#0B1F33]/90 via-[#0B1F33]/40 to-transparent flex flex-col justify-end p-12 text-white">
          <div>
            <h2 className="text-4xl font-bold mb-4">Elevate Your Lifestyle</h2>
            <p className="text-xl text-white/80 max-w-md">
              Discover the most exclusive properties and investment opportunities with our premium platform.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center justify-center p-3 bg-gray-100 dark:bg-gray-800 rounded-2xl mb-4">
              <LogIn className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {isAdmin ? 'Admin Portal' : 'Welcome Back'}
            </h1>
            <p className="text-gray-500 mt-2">
              {isAdmin ? 'Sign in to your administrative account' : 'Please enter your details to sign in'}
            </p>
          </div>

          {error && (
            <Alert severity="error" className="rounded-xl">
              {error}
            </Alert>
          )}

          {isWrongRole && (
            <Alert
              severity="warning"
              className="rounded-xl border border-yellow-200"
              icon={<LogOut className="h-5 w-5" />}
              action={
                <Button color="inherit" size="small" onClick={handleLogout} className="font-bold underline">
                  Logout Now
                </Button>
              }
            >
              You are logged in as <strong>{user?.firstName}</strong> (User). To access the Admin Portal, please logout first.
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  autoComplete="new-password"
                  className="w-full pl-10 pr-12 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={handleCheckboxChange}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-gray-500">Remember me</span>
              </label>
              <RouterLink to="/forgot-password" size="small" className="text-primary font-semibold hover:underline">
                Forgot password?
              </RouterLink>
            </div>

            <Button
              type="submit"
              fullWidth
              disabled={loading}
              sx={{
                bgcolor: '#2563eb',
                '&:hover': { bgcolor: '#1d4ed8' },
                color: 'white',
                py: 1.5,
                borderRadius: '12px',
                fontWeight: 'bold',
                fontSize: '1.125rem',
                textTransform: 'none',
                boxShadow: 'none',
                '&:active': { boxShadow: 'none' },
                '&:focus': { boxShadow: 'none' }
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : (
                <span className="flex items-center">
                  Sign In <ArrowRight className="ml-2 h-5 w-5" />
                </span>
              )}
            </Button>
          </form>

          {!isAdmin && (
            <>
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white dark:bg-gray-900 text-gray-500">Or continue with</span>
                </div>
              </div>

              <div className="flex justify-center">
                <GoogleLogin
                  clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}
                  onSuccess={async (credentialResponse) => {
                    setLoading(true);
                    try {
                      const response = await authService.googleLogin(credentialResponse.credential);
                      const { user, token, refreshToken } = response.data;
                      dispatch(setUser({ user, token, refreshToken }));
                      toast.success('Google login successful!');

                      navigate(['admin', 'super_admin'].includes(user.role) ? '/admin' : '/dashboard');
                    } catch (err) {
                      const errorMessage = err.response?.data?.message || 'Google login failed';
                      setError(errorMessage);
                      toast.error(errorMessage);
                    } finally {
                      setLoading(false);
                    }
                  }}
                  onError={() => {
                    const msg = !import.meta.env.VITE_GOOGLE_CLIENT_ID
                      ? 'Google Client ID is missing. Please check your configuration.'
                      : 'Google Login Failed. Please check your internet connection or console.';
                    toast.error(msg);
                    console.error('Google Login Error: Client ID might be invalid or missing.');
                  }}
                  useOneTap
                  theme="outline"
                  shape="pill"
                />
              </div>
            </>
          )}

          <div className="text-center">
            <p className="text-gray-500">
              {isAdmin ? (
                <RouterLink to="/login" className="text-primary font-bold hover:underline">
                  Back to User Login
                </RouterLink>
              ) : (
                <>
                  Don't have an account?{' '}
                  <RouterLink to="/register" className="text-primary font-bold hover:underline">
                    Create Account
                  </RouterLink>
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
