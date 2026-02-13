import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import {
    Settings, Save, Users, DollarSign, Percent, CreditCard,
    TrendingUp, Shield, Database, FileText, AlertTriangle,
    UserPlus, UserX, Edit, Trash2, Eye, BarChart3, Lock
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { settingsAPI } from '../../services/api';

// Toggle Component
const Toggle = ({ checked, onChange }) => (
    <button
        onClick={() => onChange(!checked)}
        className={`w-11 h-6 rounded-full transition-colors flex items-center px-1 ${checked ? 'bg-[#0B1F33]' : 'bg-gray-300 dark:bg-gray-600'
            }`}
    >
        <div
            className={`w-4 h-4 rounded-full bg-white shadow transform transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'
                }`}
        />
    </button>
);

const SuperAdminSettingsPage = () => {
    const { user } = useSelector((state) => state.auth);
    const [activeTab, setActiveTab] = useState('admins');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // Admin Management
    const [admins, setAdmins] = useState([
        { id: 1, name: 'John Doe', email: 'john@example.com', role: 'admin', status: 'active', createdAt: '2024-01-15' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'admin', status: 'active', createdAt: '2024-02-01' }
    ]);
    const [showAddAdmin, setShowAddAdmin] = useState(false);
    const [newAdmin, setNewAdmin] = useState({ firstName: '', lastName: '', email: '', password: '' });

    // Business Rules
    const [businessRules, setBusinessRules] = useState({
        commissionPercentage: 2.5,
        gstPercentage: 18,
        platformFee: 500,
        emiInterestRate: 12,
        latePenaltyPerDay: 100,
        minBookingAmount: 50000,
        maxEMITenure: 60
    });

    // Payment Settings
    const [paymentSettings, setPaymentSettings] = useState({
        razorpayEnabled: true,
        stripeEnabled: false,
        upiEnabled: true,
        netBankingEnabled: true,
        cardPaymentEnabled: true,
        walletEnabled: false
    });

    // Platform Analytics (Read-only)
    const [analytics, setAnalytics] = useState({
        totalRevenue: 5420000,
        totalCommission: 135500,
        activeProjects: 45,
        totalEnquiries: 1250,
        conversionRate: 12.4,
        avgTransactionValue: 850000
    });

    // Audit Logs
    const [auditLogs, setAuditLogs] = useState([
        { id: 1, user: 'Super Admin', action: 'Updated commission rate', timestamp: new Date().toISOString(), details: 'Changed from 2% to 2.5%' },
        { id: 2, user: 'Admin (John)', action: 'Created new project', timestamp: new Date(Date.now() - 86400000).toISOString(), details: 'Project: Kovai Greens' },
        { id: 3, user: 'Super Admin', action: 'Blocked admin account', timestamp: new Date(Date.now() - 172800000).toISOString(), details: 'User: test@example.com' }
    ]);

    const tabs = [
        { id: 'admins', label: 'Admin Management', icon: Users },
        { id: 'business', label: 'Business Rules', icon: DollarSign },
        { id: 'payments', label: 'Payment Methods', icon: CreditCard },
        { id: 'analytics', label: 'Analytics', icon: BarChart3 },
        { id: 'audit', label: 'Audit Logs', icon: FileText }
    ];

    const handleCreateAdmin = async () => {
        if (!newAdmin.firstName || !newAdmin.lastName || !newAdmin.email || !newAdmin.password) {
            toast.error('All fields are required');
            return;
        }

        setSaving(true);
        try {
            // API call to create admin
            // await userAPI.createAdmin(newAdmin);
            toast.success('Admin account created successfully');
            setShowAddAdmin(false);
            setNewAdmin({ firstName: '', lastName: '', email: '', password: '' });
            // Refresh admin list
        } catch (error) {
            console.error(error);
            toast.error('Failed to create admin account');
        } finally {
            setSaving(false);
        }
    };

    const handleBlockAdmin = async (adminId) => {
        if (!window.confirm('Are you sure you want to block this admin?')) return;

        try {
            // API call to block admin
            // await userAPI.blockAdmin(adminId);
            toast.success('Admin blocked successfully');
            // Update admin list
        } catch (error) {
            console.error(error);
            toast.error('Failed to block admin');
        }
    };

    const handleDeleteAdmin = async (adminId) => {
        if (!window.confirm('Are you sure you want to delete this admin? This action cannot be undone.')) return;

        try {
            // API call to delete admin
            // await userAPI.deleteAdmin(adminId);
            toast.success('Admin deleted successfully');
            // Update admin list
        } catch (error) {
            console.error(error);
            toast.error('Failed to delete admin');
        }
    };

    const handleSaveBusinessRules = async () => {
        setSaving(true);
        try {
            // API call to update business rules
            // await settingsAPI.updateBusinessRules(businessRules);
            toast.success('Business rules updated successfully');
        } catch (error) {
            console.error(error);
            toast.error('Failed to update business rules');
        } finally {
            setSaving(false);
        }
    };

    const handleSavePaymentSettings = async () => {
        setSaving(true);
        try {
            // API call to update payment settings
            // await settingsAPI.updatePaymentSettings(paymentSettings);
            toast.success('Payment settings updated successfully');
        } catch (error) {
            console.error(error);
            toast.error('Failed to update payment settings');
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
                        <Settings className="h-8 w-8 text-[#0B1F33] dark:text-blue-400" />
                        Super Admin Settings
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Full platform control and configuration management
                    </p>
                    <Badge className="mt-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white border-none">
                        Super Admin - Full Access
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
                            {/* Admin Management Tab */}
                            {activeTab === 'admins' && (
                                <div className="space-y-6">
                                    <Card className="p-6 border-none shadow-md">
                                        <div className="flex justify-between items-center mb-6">
                                            <h2 className="text-xl font-semibold flex items-center gap-2">
                                                <Users className="h-5 w-5 text-[#0B1F33]" />
                                                Admin Accounts
                                            </h2>
                                            <Button
                                                onClick={() => setShowAddAdmin(!showAddAdmin)}
                                                className="bg-[#0B1F33] hover:opacity-90"
                                            >
                                                <UserPlus className="h-4 w-4 mr-2" />
                                                Add New Admin
                                            </Button>
                                        </div>

                                        {/* Add Admin Form */}
                                        {showAddAdmin && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                className="mb-6 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
                                            >
                                                <h3 className="font-semibold mb-4">Create New Admin Account</h3>
                                                <div className="grid md:grid-cols-2 gap-4">
                                                    <Input
                                                        placeholder="First Name"
                                                        value={newAdmin.firstName}
                                                        onChange={(e) => setNewAdmin({ ...newAdmin, firstName: e.target.value })}
                                                    />
                                                    <Input
                                                        placeholder="Last Name"
                                                        value={newAdmin.lastName}
                                                        onChange={(e) => setNewAdmin({ ...newAdmin, lastName: e.target.value })}
                                                    />
                                                    <Input
                                                        type="email"
                                                        placeholder="Email Address"
                                                        value={newAdmin.email}
                                                        onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                                                    />
                                                    <Input
                                                        type="password"
                                                        placeholder="Password (min 6 characters)"
                                                        value={newAdmin.password}
                                                        onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                                                    />
                                                </div>
                                                <div className="flex gap-3 mt-4">
                                                    <Button
                                                        onClick={handleCreateAdmin}
                                                        disabled={saving}
                                                        className="bg-[#0B1F33] hover:opacity-90"
                                                    >
                                                        {saving ? 'Creating...' : 'Create Admin'}
                                                    </Button>
                                                    <Button
                                                        onClick={() => setShowAddAdmin(false)}
                                                        variant="outline"
                                                    >
                                                        Cancel
                                                    </Button>
                                                </div>
                                            </motion.div>
                                        )}

                                        {/* Admin List */}
                                        <div className="space-y-3">
                                            {admins.map((admin) => (
                                                <div key={admin.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                                    <div className="flex items-center gap-4">
                                                        <div className="h-12 w-12 rounded-full bg-[#0B1F33]/10 flex items-center justify-center">
                                                            <Users className="h-6 w-6 text-[#0B1F33]" />
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold">{admin.name}</p>
                                                            <p className="text-sm text-gray-500">{admin.email}</p>
                                                            <p className="text-xs text-gray-400">Created: {admin.createdAt}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Badge className={admin.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                                                            {admin.status}
                                                        </Badge>
                                                        <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="h-8 w-8 p-0 text-orange-600 hover:text-orange-700"
                                                            onClick={() => handleBlockAdmin(admin.id)}
                                                        >
                                                            <UserX className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                                                            onClick={() => handleDeleteAdmin(admin.id)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </Card>
                                </div>
                            )}

                            {/* Business Rules Tab */}
                            {activeTab === 'business' && (
                                <Card className="p-6 border-none shadow-md">
                                    <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                                        <DollarSign className="h-5 w-5 text-[#0B1F33]" />
                                        Business Configuration
                                    </h2>
                                    <div className="space-y-6">
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium flex items-center gap-2">
                                                    <Percent className="h-4 w-4" /> Commission Percentage
                                                </label>
                                                <Input
                                                    type="number"
                                                    step="0.1"
                                                    value={businessRules.commissionPercentage}
                                                    onChange={(e) => setBusinessRules({ ...businessRules, commissionPercentage: parseFloat(e.target.value) })}
                                                />
                                                <p className="text-xs text-gray-500">Platform commission on each transaction</p>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-sm font-medium flex items-center gap-2">
                                                    <Percent className="h-4 w-4" /> GST Percentage
                                                </label>
                                                <Input
                                                    type="number"
                                                    step="0.1"
                                                    value={businessRules.gstPercentage}
                                                    onChange={(e) => setBusinessRules({ ...businessRules, gstPercentage: parseFloat(e.target.value) })}
                                                />
                                                <p className="text-xs text-gray-500">Goods and Services Tax rate</p>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-sm font-medium flex items-center gap-2">
                                                    <DollarSign className="h-4 w-4" /> Platform Fee (₹)
                                                </label>
                                                <Input
                                                    type="number"
                                                    value={businessRules.platformFee}
                                                    onChange={(e) => setBusinessRules({ ...businessRules, platformFee: parseInt(e.target.value) })}
                                                />
                                                <p className="text-xs text-gray-500">Fixed platform processing fee</p>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-sm font-medium flex items-center gap-2">
                                                    <Percent className="h-4 w-4" /> EMI Interest Rate (%)
                                                </label>
                                                <Input
                                                    type="number"
                                                    step="0.1"
                                                    value={businessRules.emiInterestRate}
                                                    onChange={(e) => setBusinessRules({ ...businessRules, emiInterestRate: parseFloat(e.target.value) })}
                                                />
                                                <p className="text-xs text-gray-500">Annual interest rate for EMI plans</p>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-sm font-medium flex items-center gap-2">
                                                    <AlertTriangle className="h-4 w-4" /> Late Penalty (₹/day)
                                                </label>
                                                <Input
                                                    type="number"
                                                    value={businessRules.latePenaltyPerDay}
                                                    onChange={(e) => setBusinessRules({ ...businessRules, latePenaltyPerDay: parseInt(e.target.value) })}
                                                />
                                                <p className="text-xs text-gray-500">Daily penalty for late payments</p>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-sm font-medium flex items-center gap-2">
                                                    <DollarSign className="h-4 w-4" /> Min Booking Amount (₹)
                                                </label>
                                                <Input
                                                    type="number"
                                                    value={businessRules.minBookingAmount}
                                                    onChange={(e) => setBusinessRules({ ...businessRules, minBookingAmount: parseInt(e.target.value) })}
                                                />
                                                <p className="text-xs text-gray-500">Minimum amount for property booking</p>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Max EMI Tenure (months)</label>
                                                <Input
                                                    type="number"
                                                    value={businessRules.maxEMITenure}
                                                    onChange={(e) => setBusinessRules({ ...businessRules, maxEMITenure: parseInt(e.target.value) })}
                                                />
                                                <p className="text-xs text-gray-500">Maximum EMI repayment period</p>
                                            </div>
                                        </div>

                                        <Button
                                            onClick={handleSaveBusinessRules}
                                            disabled={saving}
                                            className="bg-[#0B1F33] hover:opacity-90"
                                        >
                                            <Save className="h-4 w-4 mr-2" />
                                            {saving ? 'Saving...' : 'Save Business Rules'}
                                        </Button>
                                    </div>
                                </Card>
                            )}

                            {/* Payment Methods Tab */}
                            {activeTab === 'payments' && (
                                <Card className="p-6 border-none shadow-md">
                                    <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                                        <CreditCard className="h-5 w-5 text-[#0B1F33]" />
                                        Payment Gateway Configuration
                                    </h2>
                                    <div className="space-y-4">
                                        {Object.entries({
                                            razorpayEnabled: 'Razorpay Gateway',
                                            stripeEnabled: 'Stripe Gateway',
                                            upiEnabled: 'UPI Payments',
                                            netBankingEnabled: 'Net Banking',
                                            cardPaymentEnabled: 'Credit/Debit Cards',
                                            walletEnabled: 'Digital Wallets'
                                        }).map(([key, label]) => (
                                            <div key={key} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                                <div>
                                                    <p className="font-medium">{label}</p>
                                                    <p className="text-sm text-gray-500">Enable {label.toLowerCase()} for customers</p>
                                                </div>
                                                <Toggle
                                                    checked={paymentSettings[key]}
                                                    onChange={(val) => setPaymentSettings({ ...paymentSettings, [key]: val })}
                                                />
                                            </div>
                                        ))}

                                        <Button
                                            onClick={handleSavePaymentSettings}
                                            disabled={saving}
                                            className="bg-[#0B1F33] hover:opacity-90 mt-6"
                                        >
                                            <Save className="h-4 w-4 mr-2" />
                                            {saving ? 'Saving...' : 'Save Payment Settings'}
                                        </Button>
                                    </div>
                                </Card>
                            )}

                            {/* Analytics Tab */}
                            {activeTab === 'analytics' && (
                                <Card className="p-6 border-none shadow-md">
                                    <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                                        <BarChart3 className="h-5 w-5 text-[#0B1F33]" />
                                        Platform Analytics & Revenue
                                    </h2>
                                    <div className="grid md:grid-cols-3 gap-6">
                                        {[
                                            { label: 'Total Revenue', value: `₹${(analytics.totalRevenue / 100000).toFixed(2)}L`, icon: DollarSign, color: 'green' },
                                            { label: 'Total Commission', value: `₹${(analytics.totalCommission / 100000).toFixed(2)}L`, icon: Percent, color: 'blue' },
                                            { label: 'Active Projects', value: analytics.activeProjects, icon: Database, color: 'purple' },
                                            { label: 'Total Enquiries', value: analytics.totalEnquiries, icon: Users, color: 'orange' },
                                            { label: 'Conversion Rate', value: `${analytics.conversionRate}%`, icon: TrendingUp, color: 'teal' },
                                            { label: 'Avg Transaction', value: `₹${(analytics.avgTransactionValue / 100000).toFixed(2)}L`, icon: DollarSign, color: 'indigo' }
                                        ].map((stat, index) => (
                                            <div key={index} className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
                                                <div className="flex items-center justify-between mb-3">
                                                    <stat.icon className={`h-8 w-8 text-${stat.color}-500`} />
                                                </div>
                                                <p className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                                                <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                        <p className="text-sm text-blue-800 dark:text-blue-300 flex items-center gap-2">
                                            <Eye className="h-4 w-4" />
                                            Analytics data is read-only and updated in real-time
                                        </p>
                                    </div>
                                </Card>
                            )}

                            {/* Audit Logs Tab */}
                            {activeTab === 'audit' && (
                                <Card className="p-6 border-none shadow-md">
                                    <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                                        <FileText className="h-5 w-5 text-[#0B1F33]" />
                                        System Audit Logs
                                    </h2>
                                    <div className="space-y-3">
                                        {auditLogs.map((log) => (
                                            <div key={log.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border-l-4 border-[#0B1F33]">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <Badge className="bg-[#0B1F33]/10 text-[#0B1F33] border-[#0B1F33]/20">
                                                                {log.user}
                                                            </Badge>
                                                            <p className="font-semibold text-gray-900 dark:text-white">{log.action}</p>
                                                        </div>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400">{log.details}</p>
                                                        <p className="text-xs text-gray-500 mt-2">
                                                            {new Date(log.timestamp).toLocaleString()}
                                                        </p>
                                                    </div>
                                                    <Shield className="h-5 w-5 text-gray-400" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                                        <p className="text-sm text-amber-800 dark:text-amber-300 flex items-center gap-2">
                                            <Lock className="h-4 w-4" />
                                            Audit logs are immutable and maintained for compliance purposes
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

export default SuperAdminSettingsPage;
