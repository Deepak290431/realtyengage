import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MessageSquare,
    Filter,
    Search,
    Calendar,
    User,
    CheckCircle,
    Clock,
    AlertTriangle,
    ChevronRight,
    MoreVertical,
    Send,
    Plus,
    ArrowRight,
    Building2,
    Mail,
    Phone,
    Tag,
    X,
    CreditCard
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import enquiryService from '../services/enquiryService';
import projectService from '../services/projectService';
import { setEnquiries, setLoading, setError, updateEnquiry } from '../store/slices/enquirySlice';

const EnquiriesPage = ({ isAdmin = false }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { enquiries, isLoading } = useSelector((state) => state.enquiries);
    const { user } = useSelector((state) => state.auth);

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedEnquiry, setSelectedEnquiry] = useState(null);
    const [noteText, setNoteText] = useState('');
    const [showNoteModal, setShowNoteModal] = useState(false);

    // New Enquiry State
    const [showAddModal, setShowAddModal] = useState(false);
    const [projects, setProjects] = useState([]);
    const [newEnquiry, setNewEnquiry] = useState({
        projectId: '',
        enquiryType: 'general',
        priority: 'high',
        preferredContactMethod: 'email',
        preferredContactTime: 'Anytime',
        details: ''
    });

    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const projectParam = queryParams.get('project');
    const typeParam = queryParams.get('type');

    useEffect(() => {
        fetchEnquiries();
        if (!isAdmin) {
            fetchProjects();
        }
    }, [isAdmin]);

    useEffect(() => {
        if ((projectParam || typeParam) && !isAdmin) {
            setShowAddModal(true);
            setNewEnquiry(prev => ({
                ...prev,
                projectId: projectParam || prev.projectId,
                enquiryType: typeParam || prev.enquiryType
            }));
        }
    }, [projectParam, typeParam, isAdmin]);

    const fetchProjects = async () => {
        try {
            const response = await projectService.getProjects();
            setProjects(response.data?.data || response.data || response);
        } catch (error) {
            console.error('Failed to fetch projects');
        }
    };

    const fetchEnquiries = async () => {
        try {
            dispatch(setLoading(true));
            const response = isAdmin
                ? await enquiryService.getEnquiries()
                : await enquiryService.getMyEnquiries();
            dispatch(setEnquiries(response.data?.data || response.data || response || []));
        } catch (error) {
            dispatch(setError(error.message));
            toast.error('Failed to fetch enquiries');
        } finally {
            dispatch(setLoading(false));
        }
    };

    const handleUpdateStatus = async (id, newStatus) => {
        try {
            const response = await enquiryService.updateEnquiry(id, { status: newStatus });
            dispatch(updateEnquiry(response.data?.data || response.data || response));
            toast.success(`Status updated to ${newStatus}`);
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const handleToggleOk = async (id, currentVal) => {
        try {
            const response = await enquiryService.updateEnquiry(id, { isOk: !currentVal });
            dispatch(updateEnquiry(response.data));
            toast.success(currentVal ? 'OK Tag removed' : 'Marked as OK - Payment enabled');
        } catch (error) {
            toast.error('Failed to update OK tag');
        }
    };

    const handleCreateEnquiry = async (e) => {
        e.preventDefault();
        if (!newEnquiry.projectId || !newEnquiry.details.trim()) {
            toast.error('Please fill in all required fields');
            return;
        }

        try {
            await enquiryService.createEnquiry(newEnquiry);
            toast.success('Enquiry submitted successfully!');
            setShowAddModal(false);
            fetchEnquiries();
            setNewEnquiry({
                projectId: '',
                enquiryType: 'general',
                priority: 'high',
                preferredContactMethod: 'email',
                preferredContactTime: 'Anytime',
                details: ''
            });
        } catch (error) {
            toast.error('Failed to submit enquiry');
        }
    };

    const handleAddNote = async (e) => {
        e.preventDefault();
        if (!noteText.trim()) return;

        try {
            const response = await enquiryService.addNote(selectedEnquiry._id, {
                text: noteText,
                isInternal: isAdmin
            });
            dispatch(updateEnquiry(response.data));
            setNoteText('');
            setShowNoteModal(false);
            toast.success('Note added successfully');
        } catch (error) {
            toast.error('Failed to add note');
        }
    };

    const filteredEnquiries = enquiries.filter(enquiry => {
        const matchesSearch =
            enquiry.details?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            enquiry.projectId?.name?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' || enquiry.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'new': return 'text-blue-600 bg-blue-50 border-blue-200';
            case 'in_progress': return 'text-primary bg-blue-50 border-blue-200';
            case 'follow_up': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            case 'converted': return 'text-green-600 bg-green-50 border-green-200';
            case 'closed': return 'text-gray-600 bg-gray-50 border-gray-200';
            case 'rejected': return 'text-red-600 bg-red-50 border-red-200';
            default: return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    const getPriorityColor = (priority) => {
        const p = String(priority).toLowerCase();
        switch (p) {
            case 'high': return 'text-red-700 bg-red-50 border-red-200';
            case 'medium': return 'text-orange-700 bg-orange-50 border-orange-200';
            case 'low': return 'text-blue-700 bg-blue-50 border-blue-200';
            default: return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    const cardVariants = [
        { bar: 'bg-blue-600', bg: 'bg-blue-50/15', darkBg: 'dark:bg-blue-900/5', ring: 'ring-blue-100', darkRing: 'dark:ring-blue-900/20' },
        { bar: 'bg-emerald-600', bg: 'bg-emerald-50/15', darkBg: 'dark:bg-emerald-900/5', ring: 'ring-emerald-100', darkRing: 'dark:ring-emerald-900/20' },
        { bar: 'bg-[#0B1F33]', bg: 'bg-blue-50/20', darkBg: 'dark:bg-blue-900/10', ring: 'ring-blue-200', darkRing: 'dark:ring-blue-900/30' },
        { bar: 'bg-amber-600', bg: 'bg-amber-50/15', darkBg: 'dark:bg-amber-900/5', ring: 'ring-amber-100', darkRing: 'dark:ring-amber-900/20' },
        { bar: 'bg-rose-600', bg: 'bg-rose-50/15', darkBg: 'dark:bg-rose-900/5', ring: 'ring-rose-100', darkRing: 'dark:ring-rose-900/20' },
        { bar: 'bg-blue-600', bg: 'bg-blue-50/15', darkBg: 'dark:bg-blue-900/5', ring: 'ring-blue-100', darkRing: 'dark:ring-blue-900/20' },
        { bar: 'bg-cyan-600', bg: 'bg-cyan-50/15', darkBg: 'dark:bg-cyan-900/5', ring: 'ring-cyan-100', darkRing: 'dark:ring-cyan-900/20' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-12">
            {/* Header Section */}
            {isAdmin ? (
                <div className="w-full px-6 md:px-10 lg:px-16 py-8">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-primary">
                            Enquiry Management
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">
                            Track and respond to potential customer enquiries
                        </p>
                    </div>
                </div>
            ) : (
                <div className="hero-gradient text-white py-12">
                    <div className="max-w-[1440px] mx-auto px-6 md:px-10 lg:px-16">
                        <div className="max-w-4xl mx-auto text-center">
                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-4xl md:text-5xl font-bold mb-4"
                            >
                                My Enquiries
                            </motion.h1>
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="text-xl text-white/90 mb-6"
                            >
                                View and track the status of your project enquiries
                            </motion.p>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.2 }}
                            >
                                <Button
                                    size="lg"
                                    className="bg-white text-primary hover:bg-white/90 font-bold"
                                    onClick={() => setShowAddModal(true)}
                                >
                                    <Plus className="h-5 w-5 mr-2" />
                                    New Enquiry
                                </Button>
                            </motion.div>
                        </div>
                    </div>
                </div>
            )}

            <div className={`${isAdmin ? 'w-full px-4 md:px-6' : 'max-w-[1440px] mx-auto px-6 md:px-10 lg:px-12'} ${isAdmin ? '' : 'mt-8'}`}>
                <Card className="p-6 shadow-xl border-none bg-white dark:bg-gray-800/80 mb-8 ring-1 ring-gray-200 dark:ring-gray-700">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="relative flex-1 w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                            <Input
                                placeholder="Search by project or details..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 h-12 bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                            />
                        </div>
                        <div className="flex gap-2 w-full md:w-auto">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="h-12 px-4 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                                <option value="all">All Status</option>
                                <option value="new">New</option>
                                <option value="in_progress">In Progress</option>
                                <option value="follow_up">Follow Up</option>
                                <option value="converted">Converted</option>
                                <option value="closed">Closed</option>
                            </select>
                        </div>
                    </div>
                </Card>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                        <p className="mt-4 text-gray-500">Loading enquiries...</p>
                    </div>
                ) : filteredEnquiries.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="bg-gray-100 dark:bg-gray-800 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                            <MessageSquare className="h-10 w-10 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">No enquiries found</h3>
                        <p className="text-gray-500 dark:text-gray-400">Try adjusting your filters or search terms</p>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {filteredEnquiries.map((enquiry, index) => {
                            const variant = cardVariants[index % cardVariants.length];
                            return (
                                <motion.div
                                    key={enquiry._id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    <Card className={`overflow-hidden hover:shadow-xl transition-all border-none shadow-md ${variant.bg} ${variant.darkBg} ring-1 ${variant.ring} ${variant.darkRing}`}>
                                        <div className="flex flex-col md:flex-row">
                                            <div className={`w-2 md:w-3.5 ${variant.bar} shadow-[2px_0_8px_rgba(0,0,0,0.05)]`}></div>
                                            <div className="flex-1 p-6">
                                                <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                                                    <div>
                                                        <div className="flex items-center gap-3 mb-1">
                                                            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                                                {enquiry.projectId?.name || 'Project Enquiry'}
                                                            </h3>
                                                            <Badge className={`${getStatusColor(enquiry.status)} border px-2 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider`}>
                                                                {enquiry.status?.replace('_', ' ')}
                                                            </Badge>
                                                            <Badge variant="outline" className={`${getPriorityColor(enquiry.priority)} px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm`}>
                                                                {enquiry.priority}
                                                            </Badge>
                                                            {enquiry.isOk && (
                                                                <Badge className="bg-green-100 text-green-700 border-green-200 px-2 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1">
                                                                    <CheckCircle className="h-3 w-3" /> OK TAG
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                                                            <span className="flex items-center gap-1">
                                                                <Calendar className="h-4 w-4" />
                                                                {new Date(enquiry.createdAt).toLocaleDateString()}
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <Tag className="h-4 w-4" />
                                                                {enquiry.enquiryType}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    {isAdmin ? (
                                                        <div className="flex items-center gap-2">
                                                            <select
                                                                onChange={(e) => handleUpdateStatus(enquiry._id, e.target.value)}
                                                                value={enquiry.status}
                                                                disabled={enquiry.status === 'rejected' || enquiry.isOk}
                                                                className={`text-xs border rounded px-2 py-1 bg-white dark:bg-gray-700 ${enquiry.status === 'rejected' || enquiry.isOk ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                            >
                                                                <option value="new">Set New</option>
                                                                <option value="in_progress">Set In Progress</option>
                                                                <option value="follow_up">Set Follow Up</option>
                                                                <option value="converted">Set Converted</option>
                                                                <option value="closed">Set Closed</option>
                                                                <option value="rejected">Rejected</option>
                                                            </select>
                                                            <Button
                                                                size="sm"
                                                                variant={enquiry.isOk ? "default" : "outline"}
                                                                className={enquiry.isOk ? "bg-green-600 hover:bg-green-700 h-8" : "h-8"}
                                                                onClick={() => handleToggleOk(enquiry._id, enquiry.isOk)}
                                                                disabled={enquiry.status === 'rejected' || enquiry.isOk}
                                                            >
                                                                {enquiry.isOk ? 'OK Given' : 'Give OK'}
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="destructive"
                                                                className={`h-8 text-white ${enquiry.status === 'rejected' || enquiry.isOk ? 'opacity-50' : 'bg-red-600 hover:bg-red-700'}`}
                                                                onClick={() => handleUpdateStatus(enquiry._id, 'rejected')}
                                                                disabled={enquiry.status === 'rejected' || enquiry.isOk}
                                                            >
                                                                {enquiry.status === 'rejected' ? 'Rejected' : 'Reject'}
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => {
                                                                    setSelectedEnquiry(enquiry);
                                                                    setShowNoteModal(true);
                                                                }}
                                                            >
                                                                <Plus className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-2">
                                                            {enquiry.isOk && enquiry.status !== 'rejected' && (
                                                                <Button
                                                                    size="sm"
                                                                    className="bg-green-600 hover:bg-green-700 text-white font-bold h-9 px-4"
                                                                    onClick={() => navigate('/dashboard/payments')}
                                                                >
                                                                    <CreditCard className="h-4 w-4 mr-2" />
                                                                    Pay Now
                                                                </Button>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 mb-4">
                                                    <p className="text-gray-700 dark:text-gray-300 italic whitespace-pre-wrap">
                                                        "{enquiry.details}"
                                                    </p>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                    <div className="space-y-2">
                                                        <h4 className="text-xs font-bold uppercase text-gray-400 tracking-wider">Contact Info</h4>
                                                        <div className="text-sm space-y-1">
                                                            {isAdmin && (
                                                                <p className="flex items-center gap-2 text-gray-700 dark:text-gray-300 font-medium">
                                                                    <User className="h-4 w-4 text-gray-400" />
                                                                    {enquiry.customerId?.name}
                                                                </p>
                                                            )}
                                                            <p className="flex items-center gap-2 text-gray-700 dark:text-gray-300 font-medium">
                                                                <Mail className="h-4 w-4 text-primary" />
                                                                <span className="bg-blue-50 dark:bg-primary/20 text-primary dark:text-blue-300 px-2 py-0.5 rounded-md border border-blue-100 dark:border-primary/30">
                                                                    {enquiry.customerId?.email || 'N/A'}
                                                                </span>
                                                            </p>
                                                            <p className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                                                <Phone className="h-4 w-4 text-gray-400" />
                                                                {enquiry.customerId?.phone || 'N/A'}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <h4 className="text-xs font-bold uppercase text-gray-400 tracking-wider">Preferences</h4>
                                                        <div className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
                                                            <p>Method: <span className="text-gray-900 dark:text-gray-100 font-medium uppercase">{enquiry.preferredContactMethod}</span></p>
                                                            <p>Time: <span className="text-gray-900 dark:text-gray-100 font-medium">{enquiry.preferredContactTime || 'Anytime'}</span></p>
                                                        </div>
                                                    </div>

                                                    {enquiry.notes && enquiry.notes.length > 0 && (
                                                        <div className="space-y-2">
                                                            <h4 className="text-xs font-bold uppercase text-gray-400 tracking-wider">Latest Note</h4>
                                                            <div className="bg-blue-50 dark:bg-blue-900/20 rounded p-2 text-xs border border-blue-100 dark:border-blue-900/30">
                                                                <p className="text-blue-800 dark:text-blue-300 line-clamp-2">
                                                                    {enquiry.notes[enquiry.notes.length - 1].text}
                                                                </p>
                                                                <p className="text-[10px] text-blue-500 mt-1">
                                                                    {new Date(enquiry.notes[enquiry.notes.length - 1].addedAt).toLocaleDateString()}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                </motion.div>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* Note Modal */}
            <AnimatePresence>
                {showNoteModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowNoteModal(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden"
                        >
                            <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Add Note</h3>
                                <p className="text-sm text-gray-500">Adding a note to enquiry for {selectedEnquiry?.projectId?.name}</p>
                            </div>
                            <form onSubmit={handleAddNote} className="p-6">
                                <textarea
                                    autoFocus
                                    className="w-full h-32 p-4 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary resize-none mb-4"
                                    placeholder="Type your note here..."
                                    value={noteText}
                                    onChange={(e) => setNoteText(e.target.value)}
                                />
                                <div className="flex justify-end gap-3">
                                    <Button variant="outline" type="button" onClick={() => setShowNoteModal(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={!noteText.trim()}>
                                        <Send className="h-4 w-4 mr-2" />
                                        Save Note
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            {/* New Enquiry Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowAddModal(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl my-8"
                        >
                            <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-700">
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Post an Enquiry</h3>
                                    <p className="text-sm text-gray-500">Ask about projects or schedule site visits</p>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => setShowAddModal(false)}>
                                    <X className="h-6 w-6" />
                                </Button>
                            </div>

                            <form onSubmit={handleCreateEnquiry} className="p-6 space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold mb-2">Select Project *</label>
                                        <select
                                            className="w-full h-11 px-4 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
                                            value={newEnquiry.projectId}
                                            onChange={(e) => setNewEnquiry({ ...newEnquiry, projectId: e.target.value })}
                                            required
                                        >
                                            <option value="">Choose a property...</option>
                                            {projects.map(p => (
                                                <option key={p._id || p.id} value={p._id || p.id}>{p.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold mb-2">Enquiry Type</label>
                                        <select
                                            className="w-full h-11 px-4 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
                                            value={newEnquiry.enquiryType}
                                            onChange={(e) => setNewEnquiry({ ...newEnquiry, enquiryType: e.target.value })}
                                        >
                                            <option value="general">General Information</option>
                                            <option value="pricing">Pricing Details</option>
                                            <option value="site_visit">Schedule Site Visit</option>
                                            <option value="documentation">Documentation</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-3 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold mb-2">Priority</label>
                                        <select
                                            className="w-full h-11 px-4 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
                                            value={newEnquiry.priority}
                                            onChange={(e) => setNewEnquiry({ ...newEnquiry, priority: e.target.value })}
                                        >
                                            <option value="low">Low</option>
                                            <option value="medium">Medium</option>
                                            <option value="high">High</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold mb-2">Contact Method</label>
                                        <select
                                            className="w-full h-11 px-4 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
                                            value={newEnquiry.preferredContactMethod}
                                            onChange={(e) => setNewEnquiry({ ...newEnquiry, preferredContactMethod: e.target.value })}
                                        >
                                            <option value="email">Email</option>
                                            <option value="phone">Phone Call</option>
                                            <option value="whatsapp">WhatsApp</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold mb-2">Best Time</label>
                                        <select
                                            className="w-full h-11 px-4 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
                                            value={newEnquiry.preferredContactTime}
                                            onChange={(e) => setNewEnquiry({ ...newEnquiry, preferredContactTime: e.target.value })}
                                        >
                                            <option value="Anytime">Anytime</option>
                                            <option value="Morning">Morning</option>
                                            <option value="Afternoon">Afternoon</option>
                                            <option value="Evening">Evening</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold mb-2">Detailed Requirements *</label>
                                    <textarea
                                        className="w-full h-32 p-4 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                                        placeholder="Tell us what you are looking for..."
                                        value={newEnquiry.details}
                                        onChange={(e) => setNewEnquiry({ ...newEnquiry, details: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                                    <Button variant="outline" type="button" onClick={() => setShowAddModal(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" className="px-8">
                                        <Send className="h-4 w-4 mr-2" />
                                        Submit Enquiry
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default EnquiriesPage;
