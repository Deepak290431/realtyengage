import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import {
    User, Lock, Bell, Palette, Clock, Shield, Eye, EyeOff,
    Save, Mail, Phone, MapPin, Calendar
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';

// Simple Toggle Component
const Toggle = ({ checked, onChange, disabled }) => (
    <button
        onClick={() => !disabled && onChange(!checked)}
        disabled={disabled}
        className={`w-11 h-6 rounded-full transition-colors flex items-center px-1 ${disabled ? 'opacity-50 cursor-not-allowed' : ''
            } ${checked ? 'bg-[#0B1F33]' : 'bg-gray-300 dark:bg-gray-600'}`}
    >
        <div
            className={`w-4 h-4 rounded-full bg-white shadow transform transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'
                }`}
        />
    </button>
);

const AdminSettingsPage = () => {
    const { user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // Profile Settings
    const [profileData, setProfileData] = useState({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
        phone: user?.phone || '',
        address: {
            street: user?.address?.street || '',
            city: user?.address?.city || '',
            state: user?.address?.state || '',
            pincode: user?.address?.pincode || ''
        }
    });

    // Password Change
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });

    // Notification Preferences
    const [notifications, setNotifications] = useState({
        emailNotifications: true,
        newEnquiries: true,
        paymentUpdates: true,
        systemAlerts: true,
        weeklyReports: false
    });

    // Theme Preference
    const [theme, setTheme] = useState(user?.preferences?.theme || 'light');

    // Recent Activity (Read-only)
    const [recentActivity, setRecentActivity] = useState([
        { action: 'Logged in', timestamp: new Date().toISOString(), ip: '192.168.1.1' },
        { action: 'Updated project details', timestamp: new Date(Date.now() - 86400000).toISOString(), ip: '192.168.1.1' },
        { action: 'Viewed enquiries', timestamp: new Date(Date.now() - 172800000).toISOString(), ip: '192.168.1.1' }
    ]);

    const tabs = [
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'security', label: 'Security', icon: Lock },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'appearance', label: 'Appearance', icon: Palette },
        { id: 'activity', label: 'Activity Log', icon: Clock }
    ];

    const handleSaveProfile = async () => {
        setSaving(true);
        try {
            // API call to update profile
            // await authAPI.updateProfile(profileData);
            toast.success('Profile updated successfully');
        } catch (error) {
            console.error(error);
            toast.error('Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async () => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }
        if (passwordData.newPassword.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        setSaving(true);
        try {
            // API call to change password
            // await authAPI.changePassword(passwordData);
            toast.success('Password changed successfully');
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            console.error(error);
            toast.error('Failed to change password');
        } finally {
            setSaving(false);
        }
    };

    const handleSaveNotifications = async () => {
        setSaving(true);
        try {
            // API call to update notification preferences
            // await authAPI.updateNotifications(notifications);
            toast.success('Notification preferences updated');
        } catch (error) {
            console.error(error);
            toast.error('Failed to update preferences');
        } finally {
            setSaving(false);
        }
    };

    const handleSaveTheme = async () => {
        setSaving(true);
        try {
            // API call to update theme
            // await authAPI.updateTheme(theme);
            toast.success('Theme preference saved');
            // Apply theme immediately
            document.documentElement.classList.toggle('dark', theme === 'dark');
        } catch (error) {
            console.error(error);
            toast.error('Failed to save theme');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-12">
            <div className="w-full px-4 md:px-6 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <Shield className="h-8 w-8 text-[#0B1F33] dark:text-blue-400" />
                        Admin Settings
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Manage your personal preferences and account settings
                    </p>
                    <Badge className="mt-2 bg-blue-100 text-[#0B1F33] border-blue-200">
                        Admin Role - Limited Access
                    </Badge>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar Navigation */}
                    <Card className="lg:w-64 h-fit p-2 border-none shadow-lg">
                        <nav className="flex flex-col space-y-1">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id
                                            ? 'bg-[#0B1F33]/10 text-[#0B1F33] dark:bg-blue-900/20 dark:text-blue-300'
                                            : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800'
                                        }`}
                                >
                                    <tab.icon className={`h-5 w-5 ${activeTab === tab.id ? 'text-[#0B1F33]' : 'text-gray-400'}`} />
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </Card>

                    {/* Main Content */}
                    <div className="flex-1">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            {/* Profile Tab */}
                            {activeTab === 'profile' && (
                                <Card className="p-6 border-none shadow-md">
                                    <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                                        <User className="h-5 w-5 text-[#0B1F33]" />
                                        Profile Information
                                    </h2>
                                    <div className="space-y-6">
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">First Name</label>
                                                <Input
                                                    value={profileData.firstName}
                                                    onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Last Name</label>
                                                <Input
                                                    value={profileData.lastName}
                                                    onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium flex items-center gap-2">
                                                    <Mail className="h-4 w-4" /> Email
                                                </label>
                                                <Input
                                                    type="email"
                                                    value={profileData.email}
                                                    disabled
                                                    className="bg-gray-100 dark:bg-gray-800"
                                                />
                                                <p className="text-xs text-gray-500">Email cannot be changed</p>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium flex items-center gap-2">
                                                    <Phone className="h-4 w-4" /> Phone
                                                </label>
                                                <Input
                                                    value={profileData.phone}
                                                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                                    placeholder="+91 99999 99999"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium flex items-center gap-2">
                                                <MapPin className="h-4 w-4" /> Address
                                            </label>
                                            <Input
                                                value={profileData.address.street}
                                                onChange={(e) => setProfileData({
                                                    ...profileData,
                                                    address: { ...profileData.address, street: e.target.value }
                                                })}
                                                placeholder="Street Address"
                                                className="mb-3"
                                            />
                                            <div className="grid md:grid-cols-3 gap-3">
                                                <Input
                                                    value={profileData.address.city}
                                                    onChange={(e) => setProfileData({
                                                        ...profileData,
                                                        address: { ...profileData.address, city: e.target.value }
                                                    })}
                                                    placeholder="City"
                                                />
                                                <Input
                                                    value={profileData.address.state}
                                                    onChange={(e) => setProfileData({
                                                        ...profileData,
                                                        address: { ...profileData.address, state: e.target.value }
                                                    })}
                                                    placeholder="State"
                                                />
                                                <Input
                                                    value={profileData.address.pincode}
                                                    onChange={(e) => setProfileData({
                                                        ...profileData,
                                                        address: { ...profileData.address, pincode: e.target.value }
                                                    })}
                                                    placeholder="Pincode"
                                                />
                                            </div>
                                        </div>

                                        <Button
                                            onClick={handleSaveProfile}
                                            disabled={saving}
                                            className="bg-[#0B1F33] hover:opacity-90"
                                        >
                                            <Save className="h-4 w-4 mr-2" />
                                            {saving ? 'Saving...' : 'Save Changes'}
                                        </Button>
                                    </div>
                                </Card>
                            )}

                            {/* Security Tab */}
                            {activeTab === 'security' && (
                                <Card className="p-6 border-none shadow-md">
                                    <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                                        <Lock className="h-5 w-5 text-[#0B1F33]" />
                                        Change Password
                                    </h2>
                                    <div className="space-y-6 max-w-md">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Current Password</label>
                                            <div className="relative">
                                                <Input
                                                    type={showPasswords.current ? 'text' : 'password'}
                                                    value={passwordData.currentPassword}
                                                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2"
                                                >
                                                    {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">New Password</label>
                                            <div className="relative">
                                                <Input
                                                    type={showPasswords.new ? 'text' : 'password'}
                                                    value={passwordData.newPassword}
                                                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2"
                                                >
                                                    {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Confirm New Password</label>
                                            <div className="relative">
                                                <Input
                                                    type={showPasswords.confirm ? 'text' : 'password'}
                                                    value={passwordData.confirmPassword}
                                                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2"
                                                >
                                                    {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </button>
                                            </div>
                                        </div>

                                        <Button
                                            onClick={handleChangePassword}
                                            disabled={saving}
                                            className="bg-[#0B1F33] hover:opacity-90"
                                        >
                                            <Lock className="h-4 w-4 mr-2" />
                                            {saving ? 'Updating...' : 'Update Password'}
                                        </Button>
                                    </div>
                                </Card>
                            )}

                            {/* Notifications Tab */}
                            {activeTab === 'notifications' && (
                                <Card className="p-6 border-none shadow-md">
                                    <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                                        <Bell className="h-5 w-5 text-[#0B1F33]" />
                                        Notification Preferences
                                    </h2>
                                    <div className="space-y-4">
                                        {Object.entries({
                                            emailNotifications: 'Email Notifications',
                                            newEnquiries: 'New Enquiry Alerts',
                                            paymentUpdates: 'Payment Updates',
                                            systemAlerts: 'System Alerts',
                                            weeklyReports: 'Weekly Summary Reports'
                                        }).map(([key, label]) => (
                                            <div key={key} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                                <div>
                                                    <p className="font-medium">{label}</p>
                                                    <p className="text-sm text-gray-500">Receive notifications for {label.toLowerCase()}</p>
                                                </div>
                                                <Toggle
                                                    checked={notifications[key]}
                                                    onChange={(val) => setNotifications({ ...notifications, [key]: val })}
                                                />
                                            </div>
                                        ))}

                                        <Button
                                            onClick={handleSaveNotifications}
                                            disabled={saving}
                                            className="bg-[#0B1F33] hover:opacity-90 mt-6"
                                        >
                                            <Save className="h-4 w-4 mr-2" />
                                            {saving ? 'Saving...' : 'Save Preferences'}
                                        </Button>
                                    </div>
                                </Card>
                            )}

                            {/* Appearance Tab */}
                            {activeTab === 'appearance' && (
                                <Card className="p-6 border-none shadow-md">
                                    <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                                        <Palette className="h-5 w-5 text-[#0B1F33]" />
                                        Appearance Settings
                                    </h2>
                                    <div className="space-y-6">
                                        <div>
                                            <label className="text-sm font-medium mb-3 block">Theme Preference</label>
                                            <div className="grid grid-cols-2 gap-4 max-w-md">
                                                {['light', 'dark'].map((themeOption) => (
                                                    <div
                                                        key={themeOption}
                                                        onClick={() => setTheme(themeOption)}
                                                        className={`cursor-pointer p-6 border-2 rounded-xl transition-all ${theme === themeOption
                                                                ? 'border-[#0B1F33] bg-[#0B1F33]/5'
                                                                : 'border-gray-200 hover:border-gray-300'
                                                            }`}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${theme === themeOption ? 'border-[#0B1F33]' : 'border-gray-400'
                                                                }`}>
                                                                {theme === themeOption && <div className="h-2.5 w-2.5 rounded-full bg-[#0B1F33]" />}
                                                            </div>
                                                            <span className="capitalize font-medium">{themeOption}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <Button
                                            onClick={handleSaveTheme}
                                            disabled={saving}
                                            className="bg-[#0B1F33] hover:opacity-90"
                                        >
                                            <Save className="h-4 w-4 mr-2" />
                                            {saving ? 'Saving...' : 'Save Theme'}
                                        </Button>
                                    </div>
                                </Card>
                            )}

                            {/* Activity Log Tab */}
                            {activeTab === 'activity' && (
                                <Card className="p-6 border-none shadow-md">
                                    <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                                        <Clock className="h-5 w-5 text-[#0B1F33]" />
                                        Recent Activity
                                    </h2>
                                    <div className="space-y-3">
                                        {recentActivity.map((activity, index) => (
                                            <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                                <div className="h-10 w-10 rounded-full bg-[#0B1F33]/10 flex items-center justify-center flex-shrink-0">
                                                    <Calendar className="h-5 w-5 text-[#0B1F33]" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-medium">{activity.action}</p>
                                                    <p className="text-sm text-gray-500">
                                                        {new Date(activity.timestamp).toLocaleString()} • IP: {activity.ip}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                        <p className="text-sm text-blue-800 dark:text-blue-300 flex items-center gap-2">
                                            <Shield className="h-4 w-4" />
                                            Activity logs are read-only and maintained for security purposes
                                        </p>
                                    </div>
                                </Card>
                            )}
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminSettingsPage;
