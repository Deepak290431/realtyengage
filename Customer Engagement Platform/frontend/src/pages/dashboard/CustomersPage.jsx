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
            case 'new': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'in_progress':
            case 'contacted': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'interested': return 'bg-green-100 text-green-700 border-green-200';
            case 'converted': return 'bg-purple-100 text-purple-700 border-purple-200';
            case 'closed':
            case 'lost': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-12 relative overflow-hidden">
            {/* Header */}
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-3">
                            <Users className="h-8 w-8 text-indigo-600" />
                            Customers & Leads
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">
                            Manage your leads, track status, and convert enquiries.
                        </p>
                    </div>
                    <Button onClick={fetchCustomers} variant="outline" className="shadow-sm">
                        Refresh List
                    </Button>
                </div>

                {/* Filters */}
                <Card className="p-6 mb-8 border-none shadow-xl bg-white/90 backdrop-blur-md dark:bg-gray-800/90">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                            <Input
                                placeholder="Search by name, email, or phone..."
                                className="pl-10 h-12"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <select
                            className="h-12 px-4 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="All">All Statuses</option>
                            <option value="new">New</option>
                            <option value="in_progress">In Progress</option>
                            <option value="follow_up">Follow Up</option>
                            <option value="converted">Converted</option>
                            <option value="closed">Closed / Lost</option>
                        </select>
                    </div>
                </Card>

                {/* List View */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                                    <th className="p-5 font-semibold text-gray-600 dark:text-gray-300">Customer</th>
                                    <th className="p-5 font-semibold text-gray-600 dark:text-gray-300">Contact</th>
                                    <th className="p-5 font-semibold text-gray-600 dark:text-gray-300">Interested Property</th>
                                    <th className="p-5 font-semibold text-gray-600 dark:text-gray-300">Status</th>
                                    <th className="p-5 font-semibold text-gray-600 dark:text-gray-300">Last Contacted</th>
                                    <th className="p-5 font-semibold text-gray-600 dark:text-gray-300">Assigned To</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    [...Array(5)].map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td className="p-5"><div className="h-4 w-32 bg-gray-200 rounded"></div></td>
                                            <td className="p-5"><div className="h-4 w-40 bg-gray-200 rounded"></div></td>
                                            <td className="p-5"><div className="h-4 w-24 bg-gray-200 rounded"></div></td>
                                            <td className="p-5"><div className="h-6 w-20 bg-gray-200 rounded-full"></div></td>
                                            <td className="p-5"><div className="h-4 w-24 bg-gray-200 rounded"></div></td>
                                            <td className="p-5"><div className="h-4 w-24 bg-gray-200 rounded"></div></td>
                                        </tr>
                                    ))
                                ) : customers.length > 0 ? (
                                    customers.map((customer) => (
                                        <motion.tr
                                            key={customer._id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            whileHover={{ backgroundColor: "rgba(0,0,0,0.02)" }}
                                            onClick={() => handleCustomerClick(customer)}
                                            className="cursor-pointer border-b border-gray-50 dark:border-gray-800 last:border-none transition-colors"
                                        >
                                            <td className="p-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                                                        {customer.fullName?.charAt(0)}
                                                    </div>
                                                    <span className="font-medium text-gray-900 dark:text-white">
                                                        {customer.fullName}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-5">
                                                <div className="flex flex-col gap-1 text-sm text-gray-500">
                                                    <div className="flex items-center gap-2">
                                                        <Mail className="w-3 h-3" /> {customer.email}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Phone className="w-3 h-3" /> {customer.phone}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-5">
                                                <span className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    <Building className="w-4 h-4 text-indigo-500" />
                                                    {customer.interestedProperty}
                                                </span>
                                            </td>
                                            <td className="p-5">
                                                <Badge className={`${getStatusColor(customer.enquiryStatus)} uppercase text-xs font-bold tracking-wider`}>
                                                    {customer.enquiryStatus}
                                                </Badge>
                                            </td>
                                            <td className="p-5 text-sm text-gray-500">
                                                {new Date(customer.lastContactedDate).toLocaleDateString()}
                                            </td>
                                            <td className="p-5 text-sm text-gray-600">
                                                {customer.assignedAdmin}
                                            </td>
                                        </motion.tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="p-10 text-center text-gray-500">
                                            No customers found matching your criteria.
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
                            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
                        />

                        {/* Sidebar */}
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'tween', duration: 0.3, ease: 'easeOut' }}
                            className="fixed inset-y-0 right-0 w-full md:w-[600px] bg-white dark:bg-gray-900 shadow-2xl z-50 overflow-y-auto"
                        >
                            {customerDetails ? (
                                <div className="p-0 min-h-full flex flex-col">
                                    {/* Header */}
                                    <div className="p-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg sticky top-0 z-10">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-4">
                                                <div className="h-14 w-14 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold backdrop-blur-md">
                                                    {selectedCustomer.fullName?.charAt(0)}
                                                </div>
                                                <div>
                                                    <h2 className="text-2xl font-bold">{selectedCustomer.fullName}</h2>
                                                    <p className="text-white/80 text-sm flex items-center gap-2">
                                                        From {selectedCustomer.interestedProperty}
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setIsDetailOpen(false)}
                                                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                                            >
                                                <X className="h-6 w-6" />
                                            </button>
                                        </div>

                                        <div className="flex gap-3 mt-4">
                                            <Button
                                                size="sm"
                                                className="bg-white/10 hover:bg-white/20 text-white border-none flex-1"
                                                onClick={() => window.location.href = `tel:${selectedCustomer.phone}`}
                                            >
                                                <Phone className="h-4 w-4 mr-2" /> Call
                                            </Button>
                                            <Button
                                                size="sm"
                                                className="bg-white/10 hover:bg-white/20 text-white border-none flex-1"
                                                onClick={() => {
                                                    const phone = selectedCustomer.phone?.replace(/[^0-9]/g, '');
                                                    window.open(`https://wa.me/${phone}`, '_blank');
                                                }}
                                            >
                                                <MessageSquare className="h-4 w-4 mr-2" /> WhatsApp
                                            </Button>
                                            <Button
                                                size="sm"
                                                className="bg-white/10 hover:bg-white/20 text-white border-none flex-1"
                                                onClick={() => {
                                                    if (selectedCustomer?.email) {
                                                        const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${selectedCustomer.email}`;
                                                        window.open(gmailUrl, '_blank');
                                                    } else {
                                                        toast.error('No email available');
                                                    }
                                                }}
                                            >
                                                <Mail className="h-4 w-4 mr-2" /> Email
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Body */}
                                    <div className="p-6 flex-1 space-y-6 bg-gray-50 dark:bg-gray-900 overflow-y-auto">

                                        {/* Status Bar */}
                                        <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
                                            <span className="text-sm font-medium text-gray-500">Current Status</span>
                                            <div className="flex items-center gap-2">
                                                <Badge className={`${getStatusColor(selectedCustomer.enquiryStatus)} text-sm px-3 py-1`}>
                                                    {selectedCustomer.enquiryStatus}
                                                </Badge>
                                                <select
                                                    className="text-sm border-gray-200 rounded p-1"
                                                    onChange={(e) => handleStatusUpdate(e.target.value)}
                                                    defaultValue={selectedCustomer.enquiryStatus}
                                                >
                                                    <option value="new">New</option>
                                                    <option value="in_progress">In Progress</option>
                                                    <option value="follow_up">Follow Up</option>
                                                    <option value="converted">Converted</option>
                                                    <option value="closed">Closed</option>
                                                </select>
                                            </div>
                                        </div>

                                        {/* Tabs */}
                                        <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
                                            {['details', 'history', 'notes'].map(tab => (
                                                <button
                                                    key={tab}
                                                    onClick={() => setActiveTab(tab)}
                                                    className={`flex-1 pb-3 text-sm font-medium capitalize transition-colors relative ${activeTab === tab ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-700'
                                                        }`}
                                                >
                                                    {tab}
                                                    {activeTab === tab && (
                                                        <motion.div
                                                            layoutId="activeTab"
                                                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"
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
                                                    <Card className="p-4 space-y-3">
                                                        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                                            <User className="h-4 w-4 text-indigo-500" /> Personal Info
                                                        </h3>
                                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                                            <div>
                                                                <span className="block text-gray-500 text-xs">Email</span>
                                                                <span className="text-gray-900 dark:text-gray-200">{selectedCustomer.email}</span>
                                                            </div>
                                                            <div>
                                                                <span className="block text-gray-500 text-xs">Phone</span>
                                                                <span className="text-gray-900 dark:text-gray-200">{selectedCustomer.phone}</span>
                                                            </div>
                                                            <div>
                                                                <span className="block text-gray-500 text-xs">Address</span>
                                                                <span className="text-gray-900 dark:text-gray-200">
                                                                    {customerDetails.personalDetails?.address?.street || 'N/A'}, {customerDetails.personalDetails?.address?.city || ''}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </Card>

                                                    <div className="space-y-4">
                                                        <h3 className="font-semibold text-gray-900 dark:text-white px-2">Enquiries</h3>
                                                        {customerDetails.enquiries?.map((enq, idx) => (
                                                            <Card key={idx} className="p-4 border-l-4 border-l-indigo-500">
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
                                                                    <span className="text-xs text-indigo-600 font-medium">{note.addedBy?.firstName || 'Admin'}</span>
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
                                                            <div className="absolute -left-[21px] top-0 h-4 w-4 rounded-full bg-indigo-600 ring-4 ring-white dark:ring-gray-900" />
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
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
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
