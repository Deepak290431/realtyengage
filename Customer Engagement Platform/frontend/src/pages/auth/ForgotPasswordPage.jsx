import React, { useState } from 'react';
import { Box, Typography, Button, Alert, CircularProgress } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { KeyRound, Mail, Lock, ShieldCheck, ArrowRight, ArrowLeft, Smartphone, Eye, EyeOff } from 'lucide-react';
import authService from '../../services/authService';
import toast from 'react-hot-toast';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Identifier, 2: OTP, 3: New Password
  const [method, setMethod] = useState('email'); // 'email' or 'phone'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    otp: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const getIdentifier = () => {
    return method === 'email' ? { email: formData.email } : { phone: formData.phone };
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authService.forgotPassword(getIdentifier());
      // Backend returns resetToken (OTP) for debug purposes in current state
      console.log('OTP (Debug):', response.data.resetToken);
      toast.success(response.data.message);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await authService.verifyOTP(getIdentifier(), formData.otp);
      toast.success('OTP verified!');
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    setError('');

    try {
      await authService.resetPassword(formData.otp, formData.newPassword);
      toast.success('Password reset successful! Please login.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex w-full min-h-screen overflow-hidden bg-white dark:bg-gray-900">
      {/* Left Side: Image (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <img
          src="https://images.unsplash.com/photo-1554469384-e58fac16e23a?q=80&w=2000"
          alt="Modern Architecture"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/80 via-transparent to-transparent flex flex-col justify-end p-12 text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-4xl font-bold mb-4">Secure Access</h2>
            <p className="text-xl text-white/80 max-w-md">
              Your security is our priority. Follow the steps to safely reset your password.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right Side: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md space-y-8"
        >
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl mb-4">
              {step === 1 && (method === 'email' ? <Mail className="w-8 h-8 text-primary" /> : <Smartphone className="w-8 h-8 text-primary" />)}
              {step === 2 && <ShieldCheck className="w-8 h-8 text-primary" />}
              {step === 3 && <KeyRound className="w-8 h-8 text-primary" />}
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {step === 1 && 'Forgot Password?'}
              {step === 2 && 'Verify OTP'}
              {step === 3 && 'New Password'}
            </h1>
            <p className="text-gray-500 mt-2">
              {step === 1 && `Select a method to receive a verification code`}
              {step === 2 && `We've sent a 6-digit code to your ${method === 'email' ? 'email' : 'phone'}`}
              {step === 3 && 'Create a strong password for your account'}
            </p>
          </div>

          {step === 1 && (
            <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-xl mb-6">
              <button
                onClick={() => setMethod('email')}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${method === 'email' ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Email
              </button>
              <button
                onClick={() => setMethod('phone')}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${method === 'phone' ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Phone
              </button>
            </div>
          )}

          {error && (
            <Alert severity="error" className="rounded-xl">
              {error}
            </Alert>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={`${step}-${method}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {step === 1 && (
                <form onSubmit={handleSendOTP} className="space-y-6">
                  <div className="relative">
                    {method === 'email' ? (
                      <>
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="email"
                          name="email"
                          placeholder="Email Address"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                        />
                      </>
                    ) : (
                      <>
                        <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="tel"
                          name="phone"
                          placeholder="10-digit Mobile Number"
                          value={formData.phone}
                          onChange={handleChange}
                          required
                          pattern="[0-9]{10}"
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                        />
                      </>
                    )}
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
                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Send OTP'}
                  </Button>
                </form>
              )}

              {step === 2 && (
                <form onSubmit={handleVerifyOTP} className="space-y-6">
                  <div className="flex justify-between gap-2">
                    <input
                      type="text"
                      name="otp"
                      placeholder="Enter OTP"
                      value={formData.otp}
                      onChange={handleChange}
                      required
                      maxLength={6}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-center tracking-[1em] font-bold text-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                  </div>
                  <div className="flex flex-col gap-3">
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
                      {loading ? <CircularProgress size={24} color="inherit" /> : 'Verify Code'}
                    </Button>
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="text-gray-500 hover:text-primary flex items-center justify-center text-sm font-semibold"
                    >
                      <ArrowLeft className="w-4 h-4 mr-1" /> Back to Method Selection
                    </button>
                  </div>
                </form>
              )}

              {step === 3 && (
                <form onSubmit={handleResetPassword} className="space-y-6">
                  <div className="space-y-4">
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type={showNewPassword ? "text" : "password"}
                        name="newPassword"
                        placeholder="New Password"
                        value={formData.newPassword}
                        onChange={handleChange}
                        required
                        className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                      >
                        {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        placeholder="Confirm Password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
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
                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Reset Password'}
                  </Button>
                </form>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="text-center">
            <RouterLink to="/login" className="text-primary font-bold hover:underline flex items-center justify-center">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Login
            </RouterLink>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
