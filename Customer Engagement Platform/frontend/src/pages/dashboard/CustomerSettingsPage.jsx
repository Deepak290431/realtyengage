import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User, Mail, Phone, Camera, ShieldCheck, Lock, Globe,
    Bell, CreditCard, Eye, EyeOff, FileText, Trash2,
    Star, History, MapPin, DollarSign, Smartphone,
    Check, X, ChevronRight, Download, LogOut,
    AlertTriangle, Shield, MessageSquare, ExternalLink,
    Zap, Clock, Heart, Headphones, Home, Search
} from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-hot-toast';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { updateProfile, logout, logoutAll } from '../../store/slices/authSlice';

// --- Sub-components ---

const Toggle = ({ checked, onChange, icon: Icon }) => (
    <button
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${checked ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'
            }`}
    >
        <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'
                }`}
        />
        {Icon && (
            <Icon className={`absolute ${checked ? 'left-1 text-white' : 'right-1 text-gray-400'} h-3 w-3`} />
        )}
    </button>
);

const SectionHeader = ({ icon: Icon, title, subtitle }) => (
    <div className="flex items-start gap-4 mb-6">
        <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-primary dark:text-blue-400">
            <Icon className="h-6 w-6" />
        </div>
        <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
        </div>
    </div>
);

const OTPModal = ({ isOpen, onClose, target, onVerify }) => {
    const [otp, setOtp] = useState(['', '', '', '']);
    const [timer, setTimer] = useState(30);

    useEffect(() => {
        let interval;
        if (isOpen && timer > 0) {
            interval = setInterval(() => setTimer(t => t - 1), 1000);
        }
        return () => clearInterval(interval);
    }, [isOpen, timer]);

    const handleInput = (index, value) => {
        if (!/^\d*$/.test(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value.slice(-1);
        setOtp(newOtp);
        if (value && index < 3) {
            document.getElementById(`otp-${index + 1}`).focus();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-sm w-full shadow-2xl"
            >
                <div className="text-center mb-6">
                    <div className="h-16 w-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                        <Lock className="h-8 w-8" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">Verify it's you</h3>
                    <p className="text-gray-500 dark:text-gray-400">We've sent a code to your {target}</p>
                </div>

                <div className="flex justify-center gap-3 mb-8">
                    {otp.map((digit, i) => (
                        <input
                            key={i}
                            id={`otp-${i}`}
                            type="text"
                            value={digit}
                            onChange={(e) => handleInput(i, e.target.value)}
                            className="w-14 h-14 text-center text-2xl font-bold border-2 border-gray-100 dark:border-gray-700 rounded-xl focus:border-primary focus:outline-none dark:bg-gray-700"
                            maxLength={1}
                        />
                    ))}
                </div>

                <Button
                    onClick={() => onVerify(otp.join(''))}
                    className="w-full h-12 text-lg font-semibold bg-blue-700 hover:bg-blue-800 mb-4"
                >
                    Confirm Code
                </Button>

                <div className="text-center">
                    {timer > 0 ? (
                        <p className="text-sm text-gray-500">Resend code in <span className="text-blue-700 font-medium">{timer}s</span></p>
                    ) : (
                        <button onClick={() => setTimer(30)} className="text-sm text-blue-700 font-bold hover:underline">
                            Resend Code
                        </button>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

// --- Main Page ---

const CustomerSettingsPage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const [activeTab, setActiveTab] = useState('profile');
    const [isSaving, setIsSaving] = useState(false);

    // Profile State
    const [profileData, setProfileData] = useState({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
        phone: user?.phone || '',
        aboutMe: 'Passionate property enthusiast looking for a dream villa in Coimbatore. I value transparency and timely updates.',
    });

    // Verification States
    const [showOtp, setShowOtp] = useState(false);
    const [otpTarget, setOtpTarget] = useState('');

    // Notification State
    const [notifs, setNotifs] = useState({
        newProperty: true,
        enquiryUpdate: true,
        paymentReminder: true,
        lateEMI: true,
        offers: false,
        channels: {
            email: true,
            whatsapp: true,
            inApp: true
        }
    });

    // Payment & Privacy States
    const [payPrefs, setPayPrefs] = useState({ autoReminder: true, daysBefore: 3 });
    const [privacy, setPrivacy] = useState({ showPhone: false, call: true, whatsapp: true, email: true });

    const handleProfileUpdate = () => {
        setIsSaving(true);
        setTimeout(() => {
            dispatch(updateProfile({ firstName: profileData.firstName, lastName: profileData.lastName }));
            toast.success('Settings synchronized successfully!');
            setIsSaving(false);
        }, 800);
    };

    const handleVerifyStart = (target) => {
        setOtpTarget(target);
        setShowOtp(true);
    };

    const handleLogoutAllDevices = async () => {
        if (!window.confirm('Are you sure you want to sign out from all devices? This will also log you out from your current session.')) {
            return;
        }

        setIsSaving(true);
        try {
            await dispatch(logoutAll()).unwrap();
            toast.success('Successfully logged out from all devices');
            navigate('/login');
        } catch (error) {
            toast.error(error || 'Failed to log out from other devices');
        } finally {
            setIsSaving(false);
        }
    };

    const tabs = [
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'security', label: 'Security', icon: ShieldCheck },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'payments', label: 'Payments', icon: CreditCard },
        { id: 'privacy', label: 'Privacy', icon: Lock },
        { id: 'saved', label: 'Saved', icon: Star },
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 pt-20">
            <OTPModal
                isOpen={showOtp}
                onClose={() => setShowOtp(false)}
                target={otpTarget}
                onVerify={(code) => {
                    toast.success(`${otpTarget} verified successfully!`);
                    setShowOtp(false);
                }}
            />

            <div className="max-w-[1440px] mx-auto px-6 md:px-10 lg:px-12">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar Nav */}
                    <aside className="lg:w-80">
                        <Card className="p-4 border-none shadow-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-md sticky top-24">
                            <div className="flex items-center gap-4 p-4 border-b border-gray-100 dark:border-gray-700 mb-4">
                                <div className="h-14 w-14 rounded-full bg-gradient-to-tr from-blue-600 to-blue-900 p-0.5">
                                    <div className="h-full w-full rounded-full bg-white dark:bg-gray-800 flex items-center justify-center overflow-hidden">
                                        <User className="h-8 w-8 text-blue-800" />
                                    </div>
                                </div>
                                <div className="grid overflow-hidden">
                                    <h3 className="font-bold text-lg truncate text-gray-900 dark:text-white">
                                        {user?.firstName} {user?.lastName}
                                    </h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                        <Shield className="h-3 w-3" /> Registered Customer
                                    </p>
                                </div>
                            </div>

                            <nav className="space-y-1">
                                {tabs.map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all group ${activeTab === tab.id
                                            ? 'bg-blue-900 text-white shadow-lg shadow-blue-200 dark:shadow-none translate-x-1'
                                            : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-blue-700'
                                            }`}
                                    >
                                        <tab.icon className={`h-5 w-5 ${activeTab === tab.id ? 'text-white' : 'group-hover:scale-110 transition-transform'}`} />
                                        {tab.label}
                                        {activeTab !== tab.id && <ChevronRight className="h-4 w-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />}
                                    </button>
                                ))}
                            </nav>

                            <div className="mt-8 pt-4 border-t border-gray-100 dark:border-gray-700">
                                <Button
                                    variant="ghost"
                                    className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 font-bold"
                                    onClick={() => {
                                        dispatch(logout());
                                        toast.success('Logged out successfully');
                                    }}
                                >
                                    <LogOut className="h-5 w-5 mr-3" /> Sign Out
                                </Button>
                            </div>
                        </Card>
                    </aside>

                    {/* Main Content */}
                    <main className="flex-1">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}
                            >
                                {activeTab === 'profile' && (
                                    <div className="space-y-6">
                                        <Card className="p-8 border-none shadow-lg">
                                            <SectionHeader
                                                icon={User}
                                                title="Profile Information"
                                                subtitle="Manage your personal details and how others see you."
                                            />

                                            <div className="flex flex-col md:flex-row items-center gap-8 mb-8 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                                                <div className="relative group">
                                                    <div className="h-32 w-32 rounded-3xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center overflow-hidden border-4 border-white dark:border-gray-700 shadow-md">
                                                        <User className="h-16 w-16 text-blue-800 dark:text-blue-400" />
                                                    </div>
                                                    <button className="absolute -bottom-2 -right-2 p-3 bg-white dark:bg-gray-700 rounded-2xl shadow-xl hover:scale-110 transition-transform text-blue-800">
                                                        <Camera className="h-5 w-5" />
                                                    </button>
                                                </div>
                                                <div className="flex-1 text-center md:text-left">
                                                    <h4 className="text-lg font-bold">Profile Photo</h4>
                                                    <p className="text-sm text-gray-500 mb-4">Recommended: 400x400px, PNG or JPG (Max 2MB)</p>
                                                    <div className="flex flex-wrap justify-center md:justify-start gap-3">
                                                        <Button variant="outline" size="sm">Upload New</Button>
                                                        <Button variant="ghost" size="sm" className="text-red-500">Remove</Button>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid md:grid-cols-2 gap-6 mb-8">
                                                <div className="space-y-2">
                                                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300">First Name</label>
                                                    <Input
                                                        value={profileData.firstName}
                                                        onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                                                        className="h-12 border-gray-100 dark:border-gray-700 dark:bg-gray-800"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Last Name</label>
                                                    <Input
                                                        value={profileData.lastName}
                                                        onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                                                        className="h-12 border-gray-100 dark:border-gray-700 dark:bg-gray-800"
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid md:grid-cols-2 gap-6 mb-8">
                                                <div className="space-y-2">
                                                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Email Address</label>
                                                    <div className="flex gap-2">
                                                        <Input value={profileData.email} readOnly className="h-12 bg-gray-50 dark:bg-gray-800/50 cursor-not-allowed opacity-70" />
                                                        <Button variant="secondary" onClick={() => handleVerifyStart('email')} className="h-12">Change</Button>
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Phone Number</label>
                                                    <div className="flex gap-2">
                                                        <Input value={profileData.phone} readOnly className="h-12 bg-gray-50 dark:bg-gray-800/50 cursor-not-allowed opacity-70" />
                                                        <Button variant="secondary" onClick={() => handleVerifyStart('phone')} className="h-12">Change</Button>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-2 mb-8">
                                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                                    “This is ME” Section <Badge variant="outline" className="text-[10px] uppercase font-bold text-blue-800">Public Note</Badge>
                                                </label>
                                                <textarea
                                                    className="w-full min-h-[120px] p-4 rounded-xl border border-gray-100 dark:border-gray-700 dark:bg-gray-800 focus:ring-2 focus:ring-blue-700 focus:outline-none transition-all"
                                                    value={profileData.aboutMe}
                                                    onChange={(e) => setProfileData({ ...profileData, aboutMe: e.target.value })}
                                                    placeholder="Tell properties agents about your preferences..."
                                                ></textarea>
                                            </div>

                                            <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-end">
                                                <Button onClick={handleProfileUpdate} disabled={isSaving} className="bg-blue-800 hover:bg-blue-900 px-8 h-12 rounded-xl text-lg shadow-lg shadow-blue-100 dark:shadow-none">
                                                    {isSaving ? 'Syncing...' : 'Save Profile Changes'}
                                                </Button>
                                            </div>
                                        </Card>
                                    </div>
                                )}

                                {activeTab === 'security' && (
                                    <div className="space-y-6">
                                        <Card className="p-8 border-none shadow-lg">
                                            <SectionHeader
                                                icon={ShieldCheck}
                                                title="Password & Security"
                                                subtitle="Monitor your sessions and maintain account safety."
                                            />

                                            <div className="grid md:grid-cols-2 gap-6 mb-8">
                                                <Card className="p-6 border-blue-100 bg-blue-50/30 dark:bg-blue-900/10 dark:border-blue-900/30">
                                                    <h4 className="font-bold flex items-center gap-2 mb-4">
                                                        <Lock className="h-4 w-4 text-blue-800" /> Update Password
                                                    </h4>
                                                    <p className="text-sm text-gray-500 mb-6">Change your password regularly to keep your account secure.</p>
                                                    <Button className="w-full bg-blue-800 hover:bg-blue-900 rounded-xl">Set New Password</Button>
                                                </Card>

                                                <Card className="p-6">
                                                    <h4 className="font-bold flex items-center gap-2 mb-4">
                                                        <Clock className="h-4 w-4 text-orange-600" /> Last Login
                                                    </h4>
                                                    <div className="flex items-center gap-4 text-gray-600 dark:text-gray-400">
                                                        <div className="h-10 w-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600">
                                                            <Zap className="h-5 w-5" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold">January 30, 2026</p>
                                                            <p className="text-xs">at 09:41 AM (Today)</p>
                                                        </div>
                                                    </div>
                                                </Card>
                                            </div>

                                            <div className="space-y-4 mb-8">
                                                <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                                                    <Smartphone className="h-5 w-5 text-gray-500" /> Active Sessions
                                                </h4>
                                                {user?.loginHistory?.length > 0 ? (
                                                    user.loginHistory.map((session, i) => (
                                                        <div key={i} className={`flex items-center justify-between p-4 ${i === 0 ? 'bg-green-50/30 dark:bg-green-900/10 border border-green-100 dark:border-green-900/30' : 'bg-gray-50 dark:bg-gray-800'} rounded-2xl`}>
                                                            <div className="flex items-center gap-4">
                                                                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${i === 0 ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-500'}`}>
                                                                    {session.device?.includes('Phone') ? <Smartphone className="h-5 w-5" /> : <Globe className="h-5 w-5" />}
                                                                </div>
                                                                <div>
                                                                    <p className="font-bold text-sm">{session.device} • {session.browser}</p>
                                                                    <p className="text-xs text-gray-500">{session.location || 'Unknown Location'} {i === 0 && '• Current'}</p>
                                                                </div>
                                                            </div>
                                                            {i === 0 ? (
                                                                <Badge className="bg-green-100 text-green-700 border-none">Active</Badge>
                                                            ) : (
                                                                <Button variant="ghost" size="sm" className="text-red-500">Log out</Button>
                                                            )}
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl">
                                                        <div className="flex items-center gap-4">
                                                            <div className="h-10 w-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                                                                <Globe className="h-5 w-5" />
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-sm">Current Session</p>
                                                                <p className="text-xs text-gray-500">Active Now</p>
                                                            </div>
                                                        </div>
                                                        <Badge className="bg-green-100 text-green-700 border-none">Active</Badge>
                                                    </div>
                                                )}
                                                <Button
                                                    variant="outline"
                                                    className="w-full text-red-500 border-red-100 hover:bg-red-50 rounded-xl mt-4"
                                                    onClick={handleLogoutAllDevices}
                                                    disabled={isSaving}
                                                >
                                                    {isSaving ? 'Processing...' : 'Logout from all devices'}
                                                </Button>
                                            </div>

                                            <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-gray-800 dark:to-gray-800 rounded-2xl border border-blue-100 dark:border-gray-700">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-12 w-12 rounded-full bg-white dark:bg-gray-700 flex items-center justify-center text-blue-600 shadow-sm">
                                                        <Clock className="h-6 w-6" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold">Automatic Session Timeout</p>
                                                        <p className="text-xs text-gray-500">Logout after 30 mins of inactivity</p>
                                                    </div>
                                                </div>
                                                <Toggle checked={true} onChange={() => { }} />
                                            </div>
                                        </Card>
                                    </div>
                                )}

                                {activeTab === 'notifications' && (
                                    <div className="space-y-6">
                                        <Card className="p-8 border-none shadow-lg">
                                            <SectionHeader
                                                icon={Bell}
                                                title="Notification Settings"
                                                subtitle="Take control of what alerts you receive and where."
                                            />

                                            <div className="grid lg:grid-cols-2 gap-8">
                                                <div className="space-y-4">
                                                    <h4 className="font-bold text-lg mb-4 text-blue-700">Content Preferences</h4>
                                                    {[
                                                        { id: 'newProperty', label: 'New Property Alerts', icon: Home },
                                                        { id: 'enquiryUpdate', label: 'Enquiry Status Updates', icon: MessageSquare },
                                                        { id: 'paymentReminder', label: 'Payment Reminders (EMI)', icon: CreditCard },
                                                        { id: 'lateEMI', label: 'Late EMI Warnings', icon: AlertTriangle },
                                                        { id: 'offers', label: 'Offers / Promotions', icon: Zap },
                                                    ].map(item => (
                                                        <div key={item.id} className="flex items-center justify-between p-5 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
                                                            <div className="flex items-center gap-4">
                                                                <item.icon className="h-5 w-5 text-gray-400" />
                                                                <span className="font-semibold text-gray-800 dark:text-gray-200">{item.label}</span>
                                                            </div>
                                                            <Toggle
                                                                checked={notifs[item.id]}
                                                                onChange={(val) => setNotifs({ ...notifs, [item.id]: val })}
                                                            />
                                                        </div>
                                                    ))}
                                                </div>

                                                <div className="space-y-4">
                                                    <h4 className="font-bold text-lg mb-4 text-blue-800">Delivery Channels</h4>
                                                    {[
                                                        { id: 'email', label: 'Email Notifications', icon: Mail },
                                                        { id: 'whatsapp', label: 'WhatsApp Messenger', icon: MessageSquare },
                                                        { id: 'inApp', label: 'In-app Notifications', icon: Bell },
                                                    ].map(item => (
                                                        <div key={item.id} className="flex items-center justify-between p-5 bg-blue-50/40 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                                                            <div className="flex items-center gap-4">
                                                                <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                                                                    <item.icon className="h-5 w-5 text-blue-700" />
                                                                </div>
                                                                <span className="font-bold text-gray-800 dark:text-gray-200">{item.label}</span>
                                                            </div>
                                                            <Toggle
                                                                checked={notifs.channels[item.id]}
                                                                onChange={(val) => setNotifs({ ...notifs, channels: { ...notifs.channels, [item.id]: val } })}
                                                            />
                                                        </div>
                                                    ))}

                                                    <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                                                        <div className="flex items-start gap-4">
                                                            <Smartphone className="h-6 w-6 text-blue-800 mt-1" />
                                                            <div>
                                                                <h5 className="font-bold text-blue-900 dark:text-blue-300">Push Notifications</h5>
                                                                <p className="text-sm text-blue-700 dark:text-blue-400 mb-4">Enable browser or mobile app push alerts for real-time updates.</p>
                                                                <Button size="sm" className="bg-blue-800 hover:bg-blue-900 rounded-lg">Enable Browser Notifications</Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </Card>
                                    </div>
                                )}

                                {activeTab === 'payments' && (
                                    <div className="space-y-6">
                                        <Card className="p-8 border-none shadow-lg">
                                            <SectionHeader
                                                icon={CreditCard}
                                                title="Payment Preferences"
                                                subtitle="Customize your billing and EMI experience."
                                            />

                                            <div className="space-y-6">
                                                <div className="flex items-center justify-between p-6 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-sm">
                                                    <div>
                                                        <h4 className="font-bold text-lg mb-1">EMI Auto-reminder</h4>
                                                        <p className="text-sm text-gray-500">Automatically remind you before the EMI due date.</p>
                                                    </div>
                                                    <Toggle
                                                        checked={payPrefs.autoReminder}
                                                        onChange={(v) => setPayPrefs({ ...payPrefs, autoReminder: v })}
                                                    />
                                                </div>

                                                <div className={`transition-all ${payPrefs.autoReminder ? 'opacity-100 scale-100' : 'opacity-50 scale-95 pointer-events-none'}`}>
                                                    <h4 className="font-bold mb-4 flex items-center gap-2">
                                                        <Clock className="h-5 w-5 text-gray-400" /> EMI Due Date Reminder
                                                    </h4>
                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                        {[1, 3, 5, 7].map(days => (
                                                            <button
                                                                key={days}
                                                                onClick={() => setPayPrefs({ ...payPrefs, daysBefore: days })}
                                                                className={`p-4 rounded-2xl border-2 transition-all text-center ${payPrefs.daysBefore === days
                                                                    ? 'border-blue-900 bg-blue-50 text-blue-900 dark:bg-blue-900/30'
                                                                    : 'border-gray-100 dark:border-gray-700 hover:border-blue-200'
                                                                    }`}
                                                            >
                                                                <span className="block text-2xl font-black mb-1">{days}</span>
                                                                <span className="text-xs font-bold uppercase tracking-wider">{days === 1 ? 'Day' : 'Days'} Before</span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="p-8 bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl text-white overflow-hidden relative">
                                                    <div className="relative z-10">
                                                        <h4 className="text-xl font-bold mb-2">Saved Payment Methods</h4>
                                                        <p className="text-gray-400 text-sm mb-6">Manage your primary cards for quick checkouts.</p>

                                                        <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10 mb-6">
                                                            <div className="h-10 w-16 bg-white rounded-md flex items-center justify-center">
                                                                <span className="text-blue-800 font-bold italic">VISA</span>
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className="font-bold">•••• •••• •••• 4242</p>
                                                                <p className="text-xs text-gray-400">Expires 12/28</p>
                                                            </div>
                                                            <Badge className="bg-green-500/20 text-green-400 border-none">Primary</Badge>
                                                        </div>

                                                        <Button variant="outline" className="text-white border-white/20 hover:bg-white/10 rounded-xl">
                                                            + Add New Card
                                                        </Button>
                                                    </div>
                                                    <CreditCard className="absolute -bottom-10 -right-10 h-64 w-64 text-white/5 rotate-12" />
                                                </div>
                                            </div>
                                        </Card>
                                    </div>
                                )}

                                {activeTab === 'privacy' && (
                                    <div className="space-y-6">
                                        <Card className="p-8 border-none shadow-lg">
                                            <SectionHeader
                                                icon={Lock}
                                                title="Privacy & Data Controls"
                                                subtitle="Your trust is everything. Control how your data is used."
                                            />

                                            <div className="space-y-8">
                                                <div className="flex items-center justify-between p-6 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                                                    <div>
                                                        <h4 className="font-bold text-lg mb-1 flex items-center gap-2">
                                                            Show Phone Number to Agents {privacy.showPhone ? <Eye className="h-4 w-4 text-green-600" /> : <EyeOff className="h-4 w-4 text-red-500" />}
                                                        </h4>
                                                        <p className="text-sm text-gray-500">Allow verified property agents to see your mobile number.</p>
                                                    </div>
                                                    <Toggle
                                                        checked={privacy.showPhone}
                                                        onChange={(v) => setPrivacy({ ...privacy, showPhone: v })}
                                                    />
                                                </div>

                                                <div className="space-y-4">
                                                    <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                                                        <MessageSquare className="h-5 w-5 text-blue-700" /> Allow Contact Via
                                                    </h4>
                                                    <div className="grid md:grid-cols-3 gap-4">
                                                        {[
                                                            { id: 'call', label: 'Voice Calls', icon: Phone },
                                                            { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare },
                                                            { id: 'email', label: 'Email', icon: Mail },
                                                        ].map(method => (
                                                            <button
                                                                key={method.id}
                                                                onClick={() => setPrivacy({ ...privacy, [method.id]: !privacy[method.id] })}
                                                                className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${privacy[method.id]
                                                                    ? 'border-blue-900 bg-blue-50 text-blue-900 dark:bg-blue-900/30'
                                                                    : 'border-gray-100 dark:border-gray-700 opacity-60'
                                                                    }`}
                                                            >
                                                                <method.icon className="h-6 w-6" />
                                                                <span className="text-sm font-bold uppercase tracking-widest">{method.label}</span>
                                                                {privacy[method.id] && <Check className="h-4 w-4" />}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="grid md:grid-cols-2 gap-6 pt-8 border-t border-gray-100 dark:border-gray-700">
                                                    <div>
                                                        <h4 className="font-bold mb-4 flex items-center gap-2 text-blue-600">
                                                            <FileText className="h-5 w-5" /> Data Portability
                                                        </h4>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Request a copy of all your activity and profile data on the platform.</p>
                                                        <div className="flex gap-2">
                                                            <Button variant="outline" size="sm" className="rounded-lg h-10 flex-1">
                                                                <Download className="h-4 w-4 mr-2" /> PDF
                                                            </Button>
                                                            <Button variant="outline" size="sm" className="rounded-lg h-10 flex-1">
                                                                <Download className="h-4 w-4 mr-2" /> CSV
                                                            </Button>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold mb-4 flex items-center gap-2 text-red-600">
                                                            <AlertTriangle className="h-5 w-5" /> Danger Zone
                                                        </h4>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Permanently delete your account and all associated data.</p>
                                                        <Button variant="destructive" className="w-full rounded-lg h-10 bg-red-600 hover:bg-red-700">
                                                            <Trash2 className="h-4 w-4 mr-2" /> Request Account Deletion
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </Card>
                                    </div>
                                )}

                                {activeTab === 'saved' && (
                                    <div className="space-y-6">
                                        <Card className="p-8 border-none shadow-lg">
                                            <SectionHeader
                                                icon={Star}
                                                title="Saved & Shortcuts"
                                                subtitle="Quick access to properties and locations you love."
                                            />

                                            <div className="grid md:grid-cols-2 gap-6 mb-12">
                                                <Card className="p-6 overflow-hidden group">
                                                    <div className="flex justify-between items-start mb-4">
                                                        <h4 className="font-bold text-lg flex items-center gap-2">
                                                            <Heart className="h-5 w-5 text-red-500 fill-red-500" /> Shortlisted
                                                        </h4>
                                                        <Button variant="ghost" size="sm" className="text-blue-700 font-bold p-0 h-auto">View All</Button>
                                                    </div>
                                                    <div className="space-y-3">
                                                        {[1, 2].map(i => (
                                                            <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                                                <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-lg flex-shrink-0"></div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-sm font-bold truncate">Premium Villa 0{i}</p>
                                                                    <p className="text-xs text-gray-500">₹ 85.5 L onwards</p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </Card>

                                                <Card className="p-6">
                                                    <div className="flex justify-between items-start mb-4">
                                                        <h4 className="font-bold text-lg flex items-center gap-2">
                                                            <History className="h-5 w-5 text-gray-400" /> Recently Viewed
                                                        </h4>
                                                    </div>
                                                    <div className="space-y-3">
                                                        {[1, 2].map(i => (
                                                            <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                                                                <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-lg flex-shrink-0"></div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-sm font-bold truncate">Urban Square Apt</p>
                                                                    <p className="text-xs text-gray-500">Viewed 2h ago</p>
                                                                </div>
                                                                <ExternalLink className="h-3 w-3 text-gray-300" />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </Card>
                                            </div>

                                            <div className="space-y-8">
                                                <h4 className="font-bold text-lg text-blue-800 flex items-center gap-2">
                                                    <Search className="h-5 w-5" /> Recommendation Preferences
                                                </h4>

                                                <div className="grid md:grid-cols-2 gap-8">
                                                    <div className="space-y-4">
                                                        <label className="text-sm font-bold flex items-center gap-2">
                                                            <MapPin className="h-4 w-4 text-blue-700" /> Preferred Locations
                                                        </label>
                                                        <div className="flex flex-wrap gap-2">
                                                            {['Saravanampatti', 'RSPuram', 'Avinashi Road'].map(loc => (
                                                                <Badge key={loc} className="bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 px-3 py-1.5 rounded-lg border-none">
                                                                    {loc} <X className="h-3 w-3 ml-2 cursor-pointer" />
                                                                </Badge>
                                                            ))}
                                                            <Button variant="outline" size="sm" className="rounded-lg h-9 border-dashed">+ Add Location</Button>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-4">
                                                        <label className="text-sm font-bold flex items-center gap-2">
                                                            <DollarSign className="h-4 w-4 text-green-600" /> Target Budget Range
                                                        </label>
                                                        <div className="flex items-center gap-4">
                                                            <div className="flex-1">
                                                                <p className="text-xs text-gray-500 mb-1">Min Budget (Lakhs)</p>
                                                                <Input type="number" defaultValue={50} className="rounded-xl border-gray-100 dark:bg-gray-800" />
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className="text-xs text-gray-500 mb-1">Max Budget (Lakhs)</p>
                                                                <Input type="number" defaultValue={150} className="rounded-xl border-gray-100 dark:bg-gray-800" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </Card>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </main>
                </div>
            </div>

            {/* Float Help Button */}
            <Button
                className="fixed bottom-8 right-8 h-14 w-14 rounded-full bg-blue-800 hover:bg-blue-900 text-white shadow-2xl flex items-center justify-center p-0 z-50 border-4 border-white dark:border-gray-800"
            >
                <Headphones className="h-6 w-6" />
            </Button>
        </div>
    );
};

export default CustomerSettingsPage;
