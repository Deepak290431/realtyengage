import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Settings, Save, Globe, Home, CreditCard, Bell, Shield,
    Palette, Smartphone, Mail as MailIcon, Layers, Server
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';

import { settingsAPI } from '../../services/api';

import { Badge } from '../../components/ui/badge';

// Simple Switch Component if not available
const Toggle = ({ checked, onChange }) => (
    <button
        onClick={() => onChange(!checked)}
        className={`w-11 h-6 rounded-full transition-colors flex items-center px-1 ${checked ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'
            }`}
    >
        <div
            className={`w-4 h-4 rounded-full bg-white shadow transform transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'
                }`}
        />
    </button>
);

const SettingsPage = () => {
    const [activeTab, setActiveTab] = useState('general');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState({
        general: { appName: '', contactEmail: '', supportPhone: '', brandColors: { primary: '#4f46e5' } },
        property: { defaultVisibility: 'public', enquiryExpiryDays: 30 },
        payment: { enabled: true, allowEMI: true, gateway: 'stripe' },
        notification: { emailEnabled: true, whatsappEnabled: false, adminAlerts: { newEnquiry: true } },
        roles: {}
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const response = await settingsAPI.getSettings();
            if (response.data.data) {
                setSettings(prev => {
                    // Deep merge for general.brandColors specifically to prevent overwriting with undefined
                    const incoming = response.data.data;
                    return {
                        ...prev,
                        ...incoming,
                        general: {
                            ...prev.general,
                            ...(incoming.general || {}),
                            brandColors: {
                                ...prev.general.brandColors,
                                ...(incoming.general?.brandColors || {})
                            }
                        },
                        // Ensure other sections are also merged safely if needed
                        property: { ...prev.property, ...(incoming.property || {}) },
                        payment: { ...prev.payment, ...(incoming.payment || {}) },
                        notification: { ...prev.notification, ...(incoming.notification || {}) }
                    };
                });
            }
        } catch (error) {
            console.error('Failed to load settings:', error);
            toast.error('Failed to load settings');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // Remove system fields before sending
            const { _id, createdAt, updatedAt, __v, ...cleanSettings } = settings;
            await settingsAPI.updateSettings(cleanSettings);
            toast.success('Settings saved successfully');

            // Proactively apply changes to theme if applicable
            if (cleanSettings.general?.brandColors?.primary) {
                // We can trigger a reload or event, but let's just let the user know
                // For now, reload window to force theme apply is a brute force way, but simple
                // Or we can assume ThemeApplicator runs on refresh which is what the user does
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    const updateSetting = (section, field, value) => {
        setSettings(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value
            }
        }));
    };

    const updateNestedSetting = (section, subsection, field, value) => {
        setSettings(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [subsection]: {
                    ...prev[section][subsection],
                    [field]: value
                }
            }
        }));
    };

    const tabs = [
        { id: 'general', label: 'General', icon: Globe },
        { id: 'property', label: 'Property', icon: Home },
        { id: 'payment', label: 'Payments', icon: CreditCard },
        { id: 'notification', label: 'Notifications', icon: Bell },
        { id: 'roles', label: 'Roles & Permissions', icon: Shield },
    ];

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-12">
            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent flex items-center gap-3">
                            <Settings className="h-8 w-8 text-gray-700 dark:text-gray-200" />
                            Settings
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">
                            Control platform-wide configurations and preferences.
                        </p>
                    </div>
                    <Button onClick={handleSave} disabled={saving} className="bg-indigo-600 hover:bg-indigo-700 shadow-lg px-8">
                        {saving ? 'Saving...' : (
                            <>
                                <Save className="h-4 w-4 mr-2" /> Save Changes
                            </>
                        )}
                    </Button>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar Navigation */}
                    <Card className="lg:w-64 h-fit p-2 border-none shadow-lg bg-white/80 backdrop-blur-md">
                        <nav className="flex flex-col space-y-1">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === tab.id
                                        ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300 shadow-sm'
                                        : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800'
                                        }`}
                                >
                                    <tab.icon className={`h-5 w-5 ${activeTab === tab.id ? 'text-indigo-600' : 'text-gray-400'}`} />
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </Card>

                    {/* Main Content Area */}
                    <div className="flex-1">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            {activeTab === 'general' && (
                                <div className="space-y-6">
                                    <Card className="p-6 border-none shadow-md">
                                        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                                            <Smartphone className="h-5 w-5 text-indigo-500" /> App Details
                                        </h2>
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">App Name</label>
                                                <Input
                                                    value={settings.general?.appName || ''}
                                                    onChange={(e) => updateSetting('general', 'appName', e.target.value)}
                                                    placeholder="e.g. RealtyEngage"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Support Phone</label>
                                                <Input
                                                    value={settings.general?.supportPhone || ''}
                                                    onChange={(e) => updateSetting('general', 'supportPhone', e.target.value)}
                                                    placeholder="+91 99999 99999"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Contact Email</label>
                                                <Input
                                                    value={settings.general?.contactEmail || ''}
                                                    onChange={(e) => updateSetting('general', 'contactEmail', e.target.value)}
                                                    placeholder="support@example.com"
                                                />
                                            </div>
                                        </div>
                                    </Card>

                                    <Card className="p-6 border-none shadow-md">
                                        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                                            <Palette className="h-5 w-5 text-purple-500" /> Branding
                                        </h2>
                                        <div className="flex items-center gap-6">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium block">Primary Color</label>
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className="h-10 w-10 rounded-full shadow-inner border border-gray-200"
                                                        style={{ backgroundColor: settings.general?.brandColors?.primary }}
                                                    ></div>
                                                    <Input
                                                        type="color"
                                                        className="w-20 h-10 p-1"
                                                        value={settings.general?.brandColors?.primary || '#4f46e5'}
                                                        onChange={(e) => updateNestedSetting('general', 'brandColors', 'primary', e.target.value)}
                                                    />
                                                    <span className="text-sm text-gray-500 uppercase">{settings.general?.brandColors?.primary}</span>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium block">Logo URL</label>
                                                <Input
                                                    value={settings.general?.logo || ''}
                                                    onChange={(e) => updateSetting('general', 'logo', e.target.value)}
                                                    placeholder="https://example.com/logo.png"
                                                    className="w-full md:w-80"
                                                />
                                            </div>
                                        </div>
                                    </Card>
                                </div>
                            )}

                            {activeTab === 'property' && (
                                <Card className="p-6 border-none shadow-md">
                                    <h2 className="text-xl font-semibold mb-6">Property Configuration</h2>
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                            <div>
                                                <p className="font-medium">Default Visibility</p>
                                                <p className="text-sm text-gray-500">New properties are public by default</p>
                                            </div>
                                            <select
                                                className="border rounded p-2 text-sm"
                                                value={settings.property?.defaultVisibility}
                                                onChange={(e) => updateSetting('property', 'defaultVisibility', e.target.value)}
                                            >
                                                <option value="public">Public</option>
                                                <option value="private">Private</option>
                                            </select>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Enquiry Expiry (Days)</label>
                                            <Input
                                                type="number"
                                                className="max-w-[150px]"
                                                value={settings.property?.enquiryExpiryDays}
                                                onChange={(e) => updateSetting('property', 'enquiryExpiryDays', parseInt(e.target.value))}
                                            />
                                            <p className="text-xs text-gray-500">Days before a new enquiry is marked as cold/expired.</p>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Property Categories</label>
                                            <div className="flex flex-wrap gap-2">
                                                {(settings.property?.categories || ['Residential', 'Commercial']).map((cat, i) => (
                                                    <div key={i} className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                                                        {cat}
                                                    </div>
                                                ))}
                                                <button className="px-3 py-1 border border-dashed border-gray-300 text-gray-500 rounded-full text-sm hover:bg-gray-50">
                                                    + Add Category
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            )}

                            {activeTab === 'payment' && (
                                <Card className="p-6 border-none shadow-md">
                                    <h2 className="text-xl font-semibold mb-6">Payment Gateway</h2>
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium">Enable Payments</p>
                                                <p className="text-sm text-gray-500">Allow customers to make payments online</p>
                                            </div>
                                            <Toggle
                                                checked={settings.payment?.enabled}
                                                onChange={(val) => updateSetting('payment', 'enabled', val)}
                                            />
                                        </div>

                                        {settings.payment?.enabled && (
                                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="space-y-6 pt-4 border-t">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="font-medium">Allow EMI Options</p>
                                                        <p className="text-sm text-gray-500">Enable monthly installment plans</p>
                                                    </div>
                                                    <Toggle
                                                        checked={settings.payment?.allowEMI}
                                                        onChange={(val) => updateSetting('payment', 'allowEMI', val)}
                                                    />
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="font-medium">Test Mode</p>
                                                        <p className="text-sm text-gray-500">Use sandbox credentials for testing</p>
                                                    </div>
                                                    <Toggle
                                                        checked={!settings.payment?.isLiveMode}
                                                        onChange={(val) => updateSetting('payment', 'isLiveMode', !val)}
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium">Selected Gateway</label>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        {['stripe', 'razorpay'].map(gw => (
                                                            <div
                                                                key={gw}
                                                                onClick={() => updateSetting('payment', 'gateway', gw)}
                                                                className={`cursor-pointer p-4 border rounded-xl flex items-center gap-3 transition-all ${settings.payment?.gateway === gw
                                                                    ? 'border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600'
                                                                    : 'border-gray-200 hover:border-indigo-300'
                                                                    }`}
                                                            >
                                                                <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${settings.payment?.gateway === gw ? 'border-indigo-600' : 'border-gray-400'
                                                                    }`}>
                                                                    {settings.payment?.gateway === gw && <div className="h-2 w-2 rounded-full bg-indigo-600" />}
                                                                </div>
                                                                <span className="capitalize font-medium">{gw}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </div>
                                </Card>
                            )}

                            {activeTab === 'notification' && (
                                <Card className="p-6 border-none shadow-md">
                                    <h2 className="text-xl font-semibold mb-6">Notification Channels</h2>
                                    <div className="space-y-6">
                                        {[
                                            { id: 'emailEnabled', label: 'Email Notifications', desc: 'Send updates via email' },
                                            { id: 'whatsappEnabled', label: 'WhatsApp Alerts', desc: 'Send critical alerts via WhatsApp' }
                                        ].map(item => (
                                            <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                                <div>
                                                    <p className="font-medium">{item.label}</p>
                                                    <p className="text-sm text-gray-500">{item.desc}</p>
                                                </div>
                                                <Toggle
                                                    checked={settings.notification?.[item.id]}
                                                    onChange={(val) => updateSetting('notification', item.id, val)}
                                                />
                                            </div>
                                        ))}

                                        <div className="pt-4 border-t">
                                            <h3 className="font-medium mb-4">Admin Alerts</h3>
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm font-medium">New Enquiry Alert</p>
                                                    <p className="text-xs text-gray-500">Notify admin when a new lead comes in</p>
                                                </div>
                                                <Toggle
                                                    checked={settings.notification?.adminAlerts?.newEnquiry}
                                                    onChange={(val) => updateNestedSetting('notification', 'adminAlerts', 'newEnquiry', val)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            )}

                            {activeTab === 'roles' && (
                                <Card className="p-6 border-none shadow-md text-center py-12">
                                    <div className="bg-purple-100 dark:bg-purple-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Shield className="h-8 w-8 text-purple-600" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">Advanced Role Management</h3>
                                    <p className="text-gray-500 max-w-md mx-auto mb-6">
                                        Granular permission controls for Staff, Sales, and Support roles will be available in the next update.
                                    </p>
                                    <Badge className="bg-purple-100 text-purple-700 border-purple-200 text-md px-4 py-1">
                                        Coming Soon
                                    </Badge>
                                </Card>
                            )}
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
