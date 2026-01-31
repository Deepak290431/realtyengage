import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Home,
  MessageSquare,
  Edit,
  Save,
  X,
  Camera,
  Shield,
  Bell,
  Lock,
  CreditCard,
  FileText,
  LogOut,
  CheckCircle,
  Globe,
  Smartphone,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { logout, updateProfile, changePassword } from '../store/slices/authSlice';
import { userAPI } from '../services/api';

const ProfilePage = ({ isAdmin = false }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [profileImage, setProfileImage] = useState(user?.profilePicture || null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [changePasswordModal, setChangePasswordModal] = useState(false);
  const [showTwoFactorSetup, setShowTwoFactorSetup] = useState(false);
  const [isTwoFactorEnabled, setIsTwoFactorEnabled] = useState(false);
  const [twoFactorStep, setTwoFactorStep] = useState(1); // 1: QR, 2: Verify

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue
  } = useForm({
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address?.street || '',
      city: user?.address?.city || '',
      state: user?.address?.state || '',
      pincode: user?.address?.pincode || ''
    }
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPassword,
    watch
  } = useForm();

  const newPassword = watch('newPassword');

  // Load user profile data
  useEffect(() => {
    if (user) {
      setValue('firstName', user.firstName);
      setValue('lastName', user.lastName);
      setValue('email', user.email);
      setValue('phone', user.phone);
      setValue('address', user.address?.street || '');
      setValue('city', user.address?.city || '');
      setValue('state', user.address?.state || '');
      setValue('pincode', user.address?.pincode || '');
      setProfileImage(user.profilePicture);
    }
  }, [user, setValue]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      // Clean and validate data before sending
      const updateData = {
        firstName: data.firstName?.trim(),
        lastName: data.lastName?.trim(),
      };

      // Only include phone if it's provided and valid
      if (data.phone && data.phone.trim()) {
        const cleanPhone = data.phone.replace(/\D/g, ''); // Remove non-digits
        if (cleanPhone.length === 10) {
          updateData.phone = cleanPhone;
        } else if (cleanPhone.length > 0) {
          toast.error('Phone number must be exactly 10 digits');
          setIsLoading(false);
          return;
        }
      }

      // Only include address if any field is provided
      if (data.address || data.city || data.state || data.pincode) {
        updateData.address = {};

        if (data.address?.trim()) {
          updateData.address.street = data.address.trim();
        }
        if (data.city?.trim()) {
          updateData.address.city = data.city.trim();
        }
        if (data.state?.trim()) {
          updateData.address.state = data.state.trim();
        }
        if (data.pincode?.trim()) {
          const cleanPincode = data.pincode.replace(/\D/g, '');
          if (cleanPincode.length === 6) {
            updateData.address.pincode = cleanPincode;
          } else if (cleanPincode.length > 0) {
            toast.error('Pincode must be exactly 6 digits');
            setIsLoading(false);
            return;
          }
        }

        updateData.address.country = 'India';
      }

      await dispatch(updateProfile(updateData)).unwrap();
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error(error?.message || error || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async (data) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error('Passwords do not match!');
      return;
    }

    setIsLoading(true);
    try {
      await dispatch(changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      })).unwrap();

      toast.success('Password changed successfully!');
      setChangePasswordModal(false);
      resetPassword();
    } catch (error) {
      toast.error(error || 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      // Even if logout fails, clear local session
      navigate('/login');
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size and type
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }

      const formData = new FormData();
      formData.append('avatar', file);

      setIsLoading(true);
      try {
        const response = await userAPI.uploadAvatar(formData);
        setProfileImage(response.data.profilePicture);
        toast.success('Profile picture updated!');
      } catch (error) {
        toast.error('Failed to upload profile picture');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="hero-gradient text-white py-12">
        <div className="max-w-[1440px] mx-auto px-6 md:px-10 lg:px-16">
          <div className="flex items-center space-x-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center overflow-hidden">
                {profileImage ? (
                  <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="h-12 w-12" />
                )}
              </div>
              <label className="absolute bottom-0 right-0 p-2 bg-white rounded-full cursor-pointer hover:bg-gray-100 transition-colors">
                <Camera className="h-4 w-4 text-gray-700" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </label>
            </div>
            <div>
              <h1 className="text-3xl font-bold">{user?.firstName || 'John'} {user?.lastName || 'Doe'}</h1>
              <p className="text-white/90">{user?.email || 'john.doe@example.com'}</p>
              <Badge className="mt-2 bg-white/20 text-white">
                {isAdmin ? 'Administrator' : 'Customer'}
              </Badge>
            </div>
          </div>
        </div>
      </div>


      <div className="max-w-[1440px] mx-auto px-6 md:px-10 lg:px-12 py-8 space-y-12">
        {/* Profile Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl"
        >
          <Card className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Personal Information</h2>
              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              ) : (
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={() => {
                    setIsEditing(false);
                    reset();
                  }}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button onClick={handleSubmit(onSubmit)}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">First Name</label>
                  <Input
                    {...register('firstName', { required: 'First name is required' })}
                    disabled={!isEditing}
                  />
                  {errors.firstName && (
                    <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Last Name</label>
                  <Input
                    {...register('lastName', { required: 'Last name is required' })}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="email"
                    {...register('email', { required: 'Email is required' })}
                    disabled={!isEditing}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    {...register('phone', {
                      pattern: {
                        value: /^[0-9]{10}$/,
                        message: 'Phone number must be 10 digits'
                      }
                    })}
                    disabled={!isEditing}
                    className="pl-10"
                    placeholder="10-digit mobile number"
                    maxLength={10}
                  />
                </div>
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Address</label>
                <Input
                  {...register('address')}
                  disabled={!isEditing}
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">City</label>
                  <Input
                    {...register('city')}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">State</label>
                  <Input
                    {...register('state')}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Pincode</label>
                  <Input
                    {...register('pincode', {
                      pattern: {
                        value: /^[0-9]{6}$/,
                        message: 'Pincode must be 6 digits'
                      }
                    })}
                    disabled={!isEditing}
                    placeholder="6-digit pincode"
                    maxLength={6}
                  />
                  {errors.pincode && (
                    <p className="text-red-500 text-sm mt-1">{errors.pincode.message}</p>
                  )}
                </div>
              </div>
            </form>
          </Card>
        </motion.div>

        {/* Activity Summary (Admin Only) */}
        {isAdmin && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl"
          >
            <Card className="p-6 mb-8 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 border-none shadow-lg">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <FileText className="h-5 w-5 text-indigo-500" /> Activity Summary
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Properties Added', value: '12', icon: Home, color: 'text-blue-600', bg: 'bg-blue-100' },
                  { label: 'Enquiries Handled', value: '0', icon: MessageSquare, color: 'text-green-600', bg: 'bg-green-100' },
                  { label: 'Payments Approved', value: '₹ 0', icon: CreditCard, color: 'text-purple-600', bg: 'bg-purple-100' },
                  { label: 'Check-ins Done', value: '0', icon: CheckCircle, color: 'text-orange-600', bg: 'bg-orange-100' },
                ].map((stat, i) => (
                  <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className={`h-12 w-12 rounded-full ${stat.bg} flex items-center justify-center ${stat.color}`}>
                      <stat.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{stat.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Security Section & Active Sessions */}
        <div className="grid md:grid-cols-1 gap-6 max-w-4xl">
          {/* Security */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <Shield className="h-5 w-5 text-red-500" /> Security
              </h2>
              <div className="space-y-4">
                <Button
                  variant="outline"
                  className="w-full justify-between h-12"
                  onClick={() => setChangePasswordModal(true)}
                >
                  <span className="flex items-center gap-2"><Lock className="h-4 w-4" /> Change Password</span>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </Button>

                <div className="p-4 border border-blue-100 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800 rounded-lg flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-blue-800 dark:text-blue-300">Two-Factor Authentication</p>
                    <p className="text-xs text-blue-600 dark:text-blue-400">Secure your account with 2FA.</p>
                  </div>
                  <Button
                    size="sm"
                    className={`${isTwoFactorEnabled ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
                    onClick={() => !isTwoFactorEnabled && setShowTwoFactorSetup(true)}
                    disabled={isTwoFactorEnabled}
                  >
                    {isTwoFactorEnabled ? 'Enabled' : 'Enable'}
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Active Sessions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Globe className="h-5 w-5 text-green-500" /> Active Sessions
                </h2>
                <Button variant="ghost" className="text-red-500 hover:text-red-700 hover:bg-red-50 text-sm h-8">
                  Sign out all devices
                </Button>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                      <Globe className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">Windows PC - Chrome</p>
                      <p className="text-xs text-gray-500">Coimbatore, Tamil Nadu • Active Now</p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-700 border-none">Current</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-white border border-gray-100 dark:bg-gray-800/50 dark:border-gray-700 rounded-lg opacity-75">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
                      <Smartphone className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">iPhone 13 - App</p>
                      <p className="text-xs text-gray-500">Coimbatore, Tamil Nadu • 2 hours ago</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="text-gray-400">Log out</Button>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Notifications Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl"
        >
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6">Notification Preferences</h2>
            <div className="space-y-4">
              {[
                { label: 'Email Notifications', description: 'Receive updates via email' },
                { label: 'SMS Notifications', description: 'Receive updates via SMS' },
                { label: 'Payment Reminders', description: 'Get reminded about upcoming payments' },
                { label: 'Property Updates', description: 'Updates about your properties' },
                { label: 'Marketing Emails', description: 'Receive promotional offers' }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <p className="font-medium">{item.label}</p>
                    <p className="text-sm text-gray-500">{item.description}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked={index < 3} />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Password Change Modal */}
      {changePasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Change Password</h2>
              <button
                onClick={() => {
                  setChangePasswordModal(false);
                  resetPassword();
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handlePasswordSubmit(handlePasswordChange)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Current Password</label>
                <Input
                  type="password"
                  {...registerPassword('currentPassword', {
                    required: 'Current password is required'
                  })}
                  placeholder="Enter current password"
                />
                {passwordErrors.currentPassword && (
                  <p className="text-red-500 text-sm mt-1">{passwordErrors.currentPassword.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">New Password</label>
                <Input
                  type="password"
                  {...registerPassword('newPassword', {
                    required: 'New password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters'
                    }
                  })}
                  placeholder="Enter new password"
                />
                {passwordErrors.newPassword && (
                  <p className="text-red-500 text-sm mt-1">{passwordErrors.newPassword.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Confirm New Password</label>
                <Input
                  type="password"
                  {...registerPassword('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: value => value === newPassword || 'Passwords do not match'
                  })}
                  placeholder="Confirm new password"
                />
                {passwordErrors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">{passwordErrors.confirmPassword.message}</p>
                )}
              </div>

              <div className="flex space-x-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setChangePasswordModal(false);
                    resetPassword();
                  }}
                  className="flex-1"
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Update Password
                    </>
                  )}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* 2FA Setup Modal */}
      {showTwoFactorSetup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Shield className="h-5 w-5 text-indigo-600" />
                Setup 2FA
              </h2>
              <button
                onClick={() => setShowTwoFactorSetup(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {twoFactorStep === 1 ? (
              <div className="space-y-6 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
                </p>
                <div className="bg-white p-4 inline-block rounded-lg shadow-inner border border-gray-200">
                  {/* Using the generated artifact image for demonstration */}
                  <img
                    src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=otpauth://totp/RealtyEngage:admin@realtyengage.com?secret=JBSWY3DPEHPK3PXP&issuer=RealtyEngage"
                    alt="2FA QR Code"
                    className="w-48 h-48 mx-auto"
                  />
                </div>
                <p className="text-xs text-gray-400 font-mono">Secret: JBSWY3DPEHPK3PXP</p>
                <Button className="w-full" onClick={() => setTwoFactorStep(2)}>
                  I've Scanned It
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Enter the 6-digit code from your authenticator app to verify setup.
                </p>
                <div className="flex justify-center gap-2">
                  {[...Array(6)].map((_, i) => (
                    <Input
                      key={i}
                      className="w-12 h-12 text-center text-lg font-bold"
                      maxLength={1}
                      autoFocus={i === 0}
                      onChange={(e) => {
                        if (e.target.value && e.target.nextSibling) {
                          e.target.nextSibling.focus();
                        }
                      }}
                    />
                  ))}
                </div>
                <Button
                  className="w-full"
                  onClick={() => {
                    toast.success("2FA Enabled Successfully!");
                    setIsTwoFactorEnabled(true);
                    setShowTwoFactorSetup(false);
                  }}
                >
                  Verify & Enable
                </Button>
                <Button variant="ghost" className="w-full text-sm" onClick={() => setTwoFactorStep(1)}>
                  Back to QR Code
                </Button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
