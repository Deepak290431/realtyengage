import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, Search, Filter, Phone, Mail, MessageSquare,
    MapPin, Calendar, Tag, MoreVertical, X,
    Plus, Send, History, User, Building, Clock, ChevronRight
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { customerAPI } from '../../services/api';

const CustomersPage = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    // Detail view state
    const [activeTab, setActiveTab] = useState('details');
    const [noteText, setNoteText] = useState('');
    const [customerDetails, setCustomerDetails] = useState(null);
    const [detailsLoading, setDetailsLoading] = useState(false);

    useEffect(() => {
        fetchCustomers();
    }, [searchTerm, statusFilter]);

    const fetchCustomers = async () => {
        try {
            setLoading(true);
            const response = await customerAPI.getCustomers({
                search: searchTerm,
                status: statusFilter
            });
            setCustomers(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch customers:', error);
            toast.error('Failed to load customers');
        } finally {
            setLoading(false);
        }
    };

    const handleCustomerClick = async (customer) => {
        setSelectedCustomer(customer);
        setIsDetailOpen(true);
        setDetailsLoading(true);
        try {
            const response = await customerAPI.getCustomerById(customer._id);
            setCustomerDetails(response.data.data);
        } catch (error) {
            toast.error('Failed to load details');
        } finally {
            setDetailsLoading(false);
        }
    };

    const handleAddNote = async () => {
        if (!noteText.trim() || !selectedCustomer) return;
        try {
            await customerAPI.addCustomerNote(selectedCustomer._id, {
                text: noteText,
                // Optional: pass enquiryId if we want to link to specific enquiry from dropdown
            });
            toast.success('Note added');
            setNoteText('');
            // Refresh details
            const response = await customerAPI.getCustomerById(selectedCustomer._id);
            setCustomerDetails(response.data.data);
        } catch (error) {
            toast.error('Failed to add note');
        }
    };

    const handleStatusUpdate = async (newStatus) => {
        try {
            await customerAPI.updateCustomerStatus(selectedCustomer._id, {
                status: newStatus,
                type: 'enquiry' // Defaulting to updating the enquiry status
            });
            toast.success(`Status updated to ${newStatus}`);
            // Refresh list and details
            fetchCustomers();
            const response = await customerAPI.getCustomerById(selectedCustomer._id);
            setCustomerDetails(response.data.data);
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'new': return 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/20';
            case 'in_progress':
            case 'contacted': return 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-900/20';
            case 'interested':
            case 'follow_up': return 'bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-900/20';
            case 'converted': return 'bg-green-50 text-green-700 border-green-100 dark:bg-green-900/20';
            case 'closed':
            case 'lost': return 'bg-red-50 text-red-700 border-red-100 dark:bg-red-900/20';
            default: return 'bg-gray-50 text-gray-700 border-gray-100 dark:bg-gray-800';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-12 relative text-left">
            {/* Header */}
            <div className="w-full px-4 md:px-6 py-8">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-[#0B1F33] dark:text-white flex items-center gap-3">
                            <Users className="h-7 w-7 md:h-8 md:w-8 text-[#0B1F33] dark:text-blue-400" />
                            Customers & Leads
                        </h1>
                        <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 mt-1">
                            Manage your leads, track status, and convert enquiries.
                        </p>
                    </div>
                    <Button
                        onClick={fetchCustomers}
                        variant="outline"
                        className="w-full md:w-auto shadow-sm border-gray-200 text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2 h-10 md:h-11"
                    >
                        <Clock className="h-4 w-4" />
                        Refresh List
                    </Button>
                </div>

                {/* Filters */}
                <Card className="p-4 md:p-6 mb-8 border-none shadow-xl bg-white/90 backdrop-blur-md dark:bg-gray-800/90 rounded-2xl">
                    <div className="flex flex-col md:flex-row gap-3 md:gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4 md:h-5 md:w-5" />
                            <Input
                                placeholder="Search by name, email, or phone..."
                                className="pl-10 h-10 md:h-12 text-sm border-gray-100 focus:border-blue-400 transition-all bg-gray-50/50"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2">
                            <select
                                className="h-10 md:h-12 px-4 rounded-md border border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 flex-1 md:min-w-[180px] text-sm font-medium text-gray-700 dark:text-gray-200 cursor-pointer"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="All">All Statuses</option>
                                <option value="new">New Lead</option>
                                <option value="in_progress">In Progress</option>
                                <option value="follow_up">Follow Up</option>
                                <option value="converted">Converted</option>
                                <option value="closed">Closed / Lost</option>
                            </select>
                            <Button variant="outline" className="h-10 md:h-12 border-gray-100 md:hidden">
                                <Filter className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </Card>

                {/* List View */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
                    <div className="p-4 md:p-6 border-b border-gray-50 dark:border-gray-700 flex justify-between items-center">
                        <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <History className="h-4 w-4 text-blue-600" />
                            Customer List
                        </h2>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-2 py-1 rounded">
                            {customers.length} Entries
                        </span>
                    </div>
                    <div className="p-4 pb-0 md:hidden">
                        <div className="text-[10px] text-blue-600 font-bold mb-1 flex items-center gap-1.5 bg-blue-50 px-2 py-1 rounded-full w-fit">
                            <ChevronRight className="h-3 w-3 animate-pulse" /> Horizontal Scroll Available
                        </div>
                    </div>
                    <div className="scrollable-container">
                        <table className="text-left border-collapse w-full">
                            <thead>
                                <tr className="bg-gray-50/80 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                                    <th className="p-4 md:p-5 font-bold text-[10px] md:text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400">Customer</th>
                                    <th className="p-4 md:p-5 font-bold text-[10px] md:text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400">Contact Details</th>
                                    <th className="p-4 md:p-5 font-bold text-[10px] md:text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400">Property</th>
                                    <th className="p-4 md:p-5 font-bold text-[10px] md:text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400 text-center">Status</th>
                                    <th className="p-4 md:p-5 font-bold text-[10px] md:text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400">Activity</th>
                                    <th className="p-4 md:p-5 font-bold text-[10px] md:text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    [...Array(5)].map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td className="p-5"><div className="h-4 w-32 bg-gray-200 rounded"></div></td>
                                            <td className="p-5"><div className="h-4 w-40 bg-gray-200 rounded"></div></td>
                                            <td className="p-5"><div className="h-4 w-24 bg-gray-200 rounded"></div></td>
                                            <td className="p-5"><div className="h-6 w-20 bg-gray-200 rounded-full mx-auto"></div></td>
                                            <td className="p-5"><div className="h-4 w-24 bg-gray-200 rounded"></div></td>
                                            <td className="p-5 text-right"><div className="h-8 w-8 bg-gray-200 rounded-full ml-auto"></div></td>
                                        </tr>
                                    ))
                                ) : customers.length > 0 ? (
                                    customers.map((customer) => (
                                        <motion.tr
                                            key={customer._id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            whileHover={{ backgroundColor: "rgba(37, 99, 235, 0.02)" }}
                                            onClick={() => handleCustomerClick(customer)}
                                            className="cursor-pointer border-b border-gray-50 dark:border-gray-800 last:border-none transition-colors group"
                                        >
                                            <td className="p-4 md:p-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 md:h-11 md:w-11 rounded-xl bg-blue-50 text-[#0B1F33] border border-blue-100 flex items-center justify-center font-black shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-all">
                                                        {customer.fullName?.charAt(0)}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-bold text-sm md:text-base text-gray-900 dark:text-white truncate">
                                                            {customer.fullName}
                                                        </p>
                                                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded uppercase tracking-tighter">
                                                            ID: {customer._id.slice(-6).toUpperCase()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4 md:p-5">
                                                <div className="flex flex-col gap-1 text-[11px] md:text-xs text-gray-500 font-medium">
                                                    <div className="flex items-center gap-2 truncate max-w-[180px]">
                                                        <Mail className="w-3.5 h-3.5 text-blue-400 shrink-0" /> {customer.email}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Phone className="w-3.5 h-3.5 text-blue-400 shrink-0" /> {customer.phone}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4 md:p-5">
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="flex items-center gap-1.5 text-xs md:text-sm font-bold text-gray-800 dark:text-gray-200">
                                                        <Building className="w-3.5 h-3.5 text-blue-600" />
                                                        {customer.interestedProperty}
                                                    </span>
                                                    <span className="text-[10px] text-gray-400 font-medium line-clamp-1">Last contacted by {customer.assignedAdmin}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 md:p-5 text-center">
                                                <Badge className={`${getStatusColor(customer.enquiryStatus)} uppercase text-[9px] md:text-[10px] font-black tracking-widest px-2.5 py-1 rounded-full border shadow-sm inline-block`}>
                                                    {customer.enquiryStatus?.replace('_', ' ')}
                                                </Badge>
                                            </td>
                                            <td className="p-4 md:p-5">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                                                        <Calendar className="h-3.5 w-3.5 text-blue-600" />
                                                        {new Date(customer.lastContactedDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                                                    </span>
                                                    <span className="text-[10px] text-gray-400 font-mono mt-0.5">{new Date(customer.lastContactedDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 md:p-5 text-right">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 group-hover:text-blue-600 group-hover:bg-blue-50 transition-all rounded-full">
                                                    <ChevronRight className="h-5 w-5" />
                                                </Button>
                                            </td>
                                        </motion.tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="p-20 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center">
                                                    <Users className="h-8 w-8 text-gray-300" />
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="font-bold text-gray-900 dark:text-white">No customers found</p>
                                                    <p className="text-sm text-gray-500">Try adjusting your filters or search terms.</p>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Customer Detail Sheet (Right Sidebar) */}
            <AnimatePresence>
                {isDetailOpen && selectedCustomer && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsDetailOpen(false)}
                            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[140]"
                        />

                        {/* Sidebar */}
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'tween', duration: 0.3, ease: 'easeOut' }}
                            className="fixed inset-y-0 right-0 w-full md:w-[600px] lg:w-[700px] bg-white dark:bg-gray-900 shadow-2xl z-[150] overflow-hidden"
                        >
                            {customerDetails ? (
                                <div className="p-0 min-h-full flex flex-col">
                                    {/* Header */}
                                    <div className="p-4 md:p-6 bg-[#0B1F33] text-white shadow-xl sticky top-0 z-10 border-b border-white/10">
                                        <div className="flex justify-between items-center mb-4 md:mb-6">
                                            <div className="flex items-center gap-2 md:gap-4 overflow-hidden">
                                                <button
                                                    onClick={() => setIsDetailOpen(false)}
                                                    className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors md:mr-2"
                                                >
                                                    <ChevronRight className="h-6 w-6 rotate-180" />
                                                </button>
                                                <div className="h-10 w-10 md:h-16 md:w-16 rounded-xl bg-white/10 flex items-center justify-center text-lg md:text-2xl font-black backdrop-blur-md border border-white/20 shadow-inner shrink-0">
                                                    {selectedCustomer.fullName?.charAt(0)}
                                                </div>
                                                <div className="min-w-0">
                                                    <h2 className="text-lg md:text-2xl font-black tracking-tight truncate">{selectedCustomer.fullName}</h2>
                                                    <p className="text-blue-200 text-[10px] md:text-sm font-bold flex items-center gap-1.5 md:gap-2 mt-0.5 md:mt-1 truncate">
                                                        <Building className="h-3 w-3 md:h-3.5 md:w-3.5" /> {selectedCustomer.interestedProperty}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="hidden md:block">
                                                <button
                                                    onClick={() => setIsDetailOpen(false)}
                                                    className="p-2 hover:bg-white/10 rounded-full transition-colors group"
                                                >
                                                    <X className="h-6 w-6 text-white/50 group-hover:text-white" />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-3 gap-2 md:gap-3">
                                            <Button
                                                size="sm"
                                                className="bg-white/10 hover:bg-white/20 text-white border-white/10 flex items-center justify-center gap-2 h-9 md:h-10 font-bold text-[10px] md:text-xs"
                                                onClick={() => window.location.href = `tel:${selectedCustomer.phone}`}
                                            >
                                                <Phone className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Call</span>
                                            </Button>
                                            <Button
                                                size="sm"
                                                className="bg-green-500/20 hover:bg-green-500/30 text-green-400 border-green-500/20 flex items-center justify-center gap-2 h-9 md:h-10 font-bold text-[10px] md:text-xs"
                                                onClick={() => {
                                                    const phone = selectedCustomer.phone?.replace(/[^0-9]/g, '');
                                                    window.open(`https://wa.me/${phone}`, '_blank');
                                                }}
                                            >
                                                <MessageSquare className="h-3.5 w-3.5" /> <span className="hidden sm:inline">WhatsApp</span>
                                            </Button>
                                            <Button
                                                size="sm"
                                                className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border-blue-500/20 flex items-center justify-center gap-2 h-9 md:h-10 font-bold text-[10px] md:text-xs"
                                                onClick={() => {
                                                    if (selectedCustomer?.email) {
                                                        const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${selectedCustomer.email}`;
                                                        window.open(gmailUrl, '_blank');
                                                    } else {
                                                        toast.error('No email available');
                                                    }
                                                }}
                                            >
                                                <Mail className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Email</span>
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Body */}
                                    <div className="p-4 md:p-6 flex-1 space-y-4 md:space-y-6 bg-gray-50 dark:bg-gray-900 overflow-y-auto custom-scrollbar">

                                        {/* Status Bar */}
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 md:p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 gap-3 md:gap-4">
                                            <span className="text-xs md:text-sm font-bold text-gray-400 uppercase tracking-widest">Status Management</span>
                                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                                <Badge className={`${getStatusColor(selectedCustomer.enquiryStatus)} text-[10px] md:text-sm px-2.5 py-1 md:px-3 md:py-1 rounded-lg border-none shrink-0`}>
                                                    {selectedCustomer.enquiryStatus}
                                                </Badge>
                                                <select
                                                    className="text-xs md:text-sm border-gray-100 rounded-lg p-1.5 md:p-2 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none flex-1 sm:min-w-[120px] font-bold text-gray-700 dark:text-gray-200"
                                                    onChange={(e) => handleStatusUpdate(e.target.value)}
                                                    defaultValue={selectedCustomer.enquiryStatus}
                                                >
                                                    <option value="new">New Lead</option>
                                                    <option value="in_progress">In Progress</option>
                                                    <option value="follow_up">Follow Up</option>
                                                    <option value="converted">Converted</option>
                                                    <option value="closed">Closed / Lost</option>
                                                </select>
                                            </div>
                                        </div>

                                        {/* Tabs */}
                                        <div className="flex bg-white dark:bg-gray-800 p-1 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 sticky top-0 z-10 backdrop-blur-md bg-white/90">
                                            {['details', 'history', 'notes'].map(tab => (
                                                <button
                                                    key={tab}
                                                    onClick={() => setActiveTab(tab)}
                                                    className={`flex-1 py-2 md:py-2.5 text-[10px] md:text-xs font-black uppercase tracking-widest transition-all relative rounded-xl ${activeTab === tab
                                                        ? 'text-white'
                                                        : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
                                                        }`}
                                                >
                                                    <span className="relative z-10">{tab}</span>
                                                    {activeTab === tab && (
                                                        <motion.div
                                                            layoutId="activeTabDetails"
                                                            className="absolute inset-0 bg-[#0B1F33] rounded-xl shadow-md"
                                                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                                        />
                                                    )}
                                                </button>
                                            ))}
                                        </div>

                                        {/* Tab Content */}
                                        <AnimatePresence mode="wait">
                                            {activeTab === 'details' && (
                                                <motion.div
                                                    key="details"
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -10 }}
                                                    className="space-y-4"
                                                >
                                                    <Card className="p-4 md:p-5 border-none shadow-sm bg-white dark:bg-gray-800 rounded-2xl overflow-hidden relative">
                                                        <div className="absolute top-0 left-0 w-1.5 h-full bg-[#0B1F33]"></div>
                                                        <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                                                            <div className="p-1.5 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                                                                <User className="h-4 w-4 text-[#0B1F33] dark:text-blue-400" />
                                                            </div>
                                                            Personal Information
                                                        </h3>
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 text-sm">
                                                            <div className="space-y-1">
                                                                <span className="flex items-center gap-1.5 text-gray-400 text-[10px] font-bold uppercase tracking-wider">
                                                                    <Mail className="h-3 w-3" /> Email Address
                                                                </span>
                                                                <span className="text-gray-900 dark:text-gray-200 font-bold block truncate">{selectedCustomer.email}</span>
                                                            </div>
                                                            <div className="space-y-1">
                                                                <span className="flex items-center gap-1.5 text-gray-400 text-[10px] font-bold uppercase tracking-wider">
                                                                    <Phone className="h-3 w-3" /> Phone Number
                                                                </span>
                                                                <span className="text-gray-900 dark:text-gray-200 font-bold block">{selectedCustomer.phone}</span>
                                                            </div>
                                                            <div className="sm:col-span-2 space-y-1 pt-2 border-t border-gray-50 dark:border-gray-700">
                                                                <span className="flex items-center gap-1.5 text-gray-400 text-[10px] font-bold uppercase tracking-wider">
                                                                    <MapPin className="h-3 w-3" /> Location / Address
                                                                </span>
                                                                <span className="text-gray-900 dark:text-gray-200 font-bold block">
                                                                    {customerDetails.personalDetails?.address?.street || 'No street info available'}{customerDetails.personalDetails?.address?.city ? `, ${customerDetails.personalDetails?.address?.city}` : ''}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </Card>

                                                    <div className="space-y-4">
                                                        <h3 className="font-semibold text-gray-900 dark:text-white px-2">Enquiries</h3>
                                                        {customerDetails.enquiries?.map((enq, idx) => (
                                                            <Card key={idx} className="p-4 border-l-4 border-l-primary">
                                                                <h4 className="font-bold text-gray-800 dark:text-gray-200">{enq.projectId?.name || 'General Projects'}</h4>
                                                                <p className="text-sm text-gray-600 mt-1">{enq.details}</p>
                                                                <div className="mt-3 flex gap-2 text-xs text-gray-500">
                                                                    <Badge variant="outline">{enq.status}</Badge>
                                                                    <span>{new Date(enq.createdAt).toLocaleDateString()}</span>
                                                                </div>
                                                            </Card>
                                                        ))}
                                                    </div>
                                                </motion.div>
                                            )}

                                            {activeTab === 'notes' && (
                                                <motion.div
                                                    key="notes"
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -10 }}
                                                    className="space-y-4"
                                                >
                                                    <div className="flex gap-2">
                                                        <Input
                                                            placeholder="Add a new note..."
                                                            value={noteText}
                                                            onChange={(e) => setNoteText(e.target.value)}
                                                            className="flex-1"
                                                        />
                                                        <Button onClick={handleAddNote}>
                                                            <Send className="h-4 w-4" />
                                                        </Button>
                                                    </div>

                                                    <div className="space-y-4 mt-4">
                                                        {customerDetails.enquiries?.flatMap(enq => enq.notes || []).sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt)).map((note, idx) => (
                                                            <div key={idx} className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
                                                                <p className="text-sm text-gray-800 dark:text-gray-200">{note.text}</p>
                                                                <div className="flex justify-between items-center mt-2">
                                                                    <span className="text-xs text-blue-700 font-medium">{note.addedBy?.firstName || 'Admin'}</span>
                                                                    <span className="text-xs text-gray-400">{new Date(note.addedAt).toLocaleString()}</span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                        {(!customerDetails.enquiries || customerDetails.enquiries.every(e => !e.notes || e.notes.length === 0)) && (
                                                            <p className="text-center text-gray-400 py-4">No notes added yet.</p>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            )}

                                            {activeTab === 'history' && (
                                                <motion.div
                                                    key="history"
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -10 }}
                                                    className="space-y-6 pl-4 border-l-2 border-gray-200 dark:border-gray-700 ml-2"
                                                >
                                                    {/* Simulated timeline from enquiries for now */}
                                                    {customerDetails.enquiries?.map((enq, idx) => (
                                                        <div key={idx} className="relative">
                                                            <div className="absolute -left-[21px] top-0 h-4 w-4 rounded-full bg-blue-700 ring-4 ring-white dark:ring-gray-900" />
                                                            <p className="text-sm text-gray-500 mb-1">{new Date(enq.createdAt).toLocaleDateString()}</p>
                                                            <h4 className="text-md font-medium text-gray-900 dark:text-white">Enquired about {enq.projectId?.name || 'Property'}</h4>
                                                            <p className="text-sm text-gray-600 mt-1">Status: {enq.status}</p>
                                                        </div>
                                                    ))}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center h-full">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
                                </div>
                            )}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CustomersPage;
