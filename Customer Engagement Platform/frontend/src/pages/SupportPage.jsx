import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  Headphones,
  Mail,
  Phone,
  Plus,
  Search,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  Calendar,
  Paperclip,
  Send,
  Eye,
  MessageCircle,
  ChevronRight,
  HelpCircle,
  BookOpen,
  FileText,
  Shield,
  Percent,
  CreditCard
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import supportService from '../services/supportService';

const faqs = [
  {
    question: 'How can I book a property?',
    answer: 'You can book a property by browsing our projects, selecting your preferred unit, and making the booking amount payment.'
  },
  {
    question: 'What documents are required?',
    answer: 'Required documents include PAN card, Aadhaar card, income proof, bank statements, and passport-size photographs.'
  },
  {
    question: 'Is home loan assistance available?',
    answer: 'Yes, we have tie-ups with major banks and NBFCs. Our team will assist you throughout the loan process.'
  }
];

const SupportPage = ({ isAdmin = false }) => {
  const { user } = useSelector((state) => state.auth);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [replyMessage, setReplyMessage] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm();

  useEffect(() => {
    fetchTickets();
  }, [isAdmin, filterStatus]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const params = filterStatus !== 'all' ? { status: filterStatus } : {};
      const response = await (isAdmin ? supportService.getTickets(params) : supportService.getMyTickets(params));
      setTickets(response.data?.data || response.data || response || []);
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
      toast.error('Failed to load support tickets');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'text-blue-600 bg-blue-50';
      case 'in_review': return 'text-yellow-600 bg-yellow-50';
      case 'pending_customer': return 'text-orange-600 bg-orange-50';
      case 'resolved': return 'text-green-600 bg-green-50';
      case 'closed': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'open': return <AlertCircle className="h-4 w-4" />;
      case 'in_review': return <Clock className="h-4 w-4" />;
      case 'pending_customer': return <User className="h-4 w-4" />;
      case 'resolved': return <CheckCircle className="h-4 w-4" />;
      case 'closed': return <Plus className="h-4 w-4 opacity-50" />; // Or XCircle
      default: return <HelpCircle className="h-4 w-4" />;
    }
  };

  const onSubmitTicket = async (data) => {
    try {
      const response = await supportService.createTicket({
        type: data.type,
        category: data.category,
        subject: data.subject,
        priority: data.priority,
        description: data.description
      });

      setTickets([response.data || response, ...tickets]);
      toast.success('Support ticket created successfully!');
      setShowNewTicket(false);
      reset();
    } catch (error) {
      console.error('Failed to create ticket:', error);
      toast.error('Failed to create ticket.');
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    return filterStatus === 'all' || ticket.status === filterStatus;
  });

  const handleReply = async () => {
    if (!replyMessage.trim() || !selectedTicket) return;

    try {
      const response = await supportService.addComment(selectedTicket._id || selectedTicket.id, {
        text: replyMessage
      });

      // The backend returns { success: true, message: "...", data: updatedTicket }
      // Our service returns response.data, so response is the { success, message, data } object
      const updatedTicket = response.data || response;

      setTickets(tickets.map(t => (t._id === selectedTicket._id || t.id === selectedTicket.id) ? updatedTicket : t));
      setSelectedTicket(updatedTicket);
      setReplyMessage('');
      toast.success('Reply sent!');
    } catch (error) {
      console.error('Failed to send reply:', error);
      toast.error('Failed to send reply');
    }
  };

  const handleResolve = async () => {
    if (!selectedTicket) return;

    try {
      const ticketId = selectedTicket._id || selectedTicket.id;
      // If replyMessage is empty, use a default resolution text
      const resolutionText = replyMessage.trim() || 'Ticket marked as resolved by support staff.';

      const response = await supportService.resolveTicket(ticketId, resolutionText);

      const updatedTicket = response.data || response;

      setTickets(tickets.map(t => (t._id === ticketId || t.id === ticketId) ? updatedTicket : t));
      setSelectedTicket(updatedTicket);
      setReplyMessage('');
      toast.success('Ticket marked as resolved!');
    } catch (error) {
      console.error('Failed to resolve ticket:', error);
      toast.error('Failed to resolve ticket');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      {isAdmin ? (
        <div className="max-w-[1440px] mx-auto px-6 md:px-10 lg:px-12 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-primary">
              Support Management
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Manage customer support tickets and queries
            </p>
          </div>
        </div>
      ) : (
        <div className="hero-gradient text-white py-12">
          <div className="max-w-[1440px] mx-auto px-6 md:px-10 lg:px-12 text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-bold mb-4"
            >
              {isAdmin ? 'Support Management' : 'Help & Support'}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-white/90"
            >
              We're here to help you with any questions
            </motion.p>
          </div>
        </div>
      )}

      {/* Contact Cards */}
      <div className="max-w-[1440px] mx-auto px-6 md:px-10 lg:px-12 mt-8">
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card className="p-6 bg-white dark:bg-gray-800 shadow-lg">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <Phone className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Call Us</p>
                <p className="font-semibold">+91 98765 43210</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white dark:bg-gray-800 shadow-lg">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-100 rounded-full">
                <Mail className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Email Us</p>
                <p className="font-semibold">support@realtyengage.com</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white dark:bg-gray-800 shadow-lg">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <MessageSquare className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Live Chat</p>
                <p className="font-semibold">Chat with Agent</p>
              </div>
            </div>
          </Card>
        </div>
      </div>


      <div className="max-w-[1440px] mx-auto px-6 md:px-10 lg:px-12 py-8 space-y-12">
        {/* Tickets Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex justify-between items-center mb-6">
            <div className="flex space-x-2">
              {['all', 'open', 'in_review', 'resolved'].map(status => (
                <Button
                  key={status}
                  variant={filterStatus === status ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus(status)}
                >
                  {status}
                </Button>
              ))}
            </div>
            {!isAdmin && (
              <Button onClick={() => setShowNewTicket(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Ticket
              </Button>
            )}
          </div>

          {/* Tickets List */}
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {filteredTickets.map((ticket) => (
                <Card
                  key={ticket._id || ticket.id}
                  className="p-6 hover:shadow-lg cursor-pointer"
                  onClick={() => setSelectedTicket(ticket)}
                >
                  <div className="flex justify-between mb-3">
                    <h3 className="font-semibold text-lg">{ticket.subject}</h3>
                    <Badge className={getStatusColor(ticket.status)}>
                      {getStatusIcon(ticket.status)}
                      <span className="ml-1 capitalize">{ticket.status}</span>
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>#{ticket.ticketNumber || ticket.id} • {ticket.type || ticket.category}</p>
                    <p>
                      {ticket.comments && ticket.comments.length > 0
                        ? ticket.comments[0].text?.substring(0, 100)
                        : ticket.description?.substring(0, 100)}
                      ...
                    </p>
                  </div>
                  <div className="flex items-center mt-3 text-xs text-gray-500">
                    <Calendar className="h-3 w-3 mr-1" />
                    {new Date(ticket.createdAt || ticket.createdDate).toLocaleDateString()}
                    <MessageCircle className="h-3 w-3 ml-3 mr-1" />
                    {(ticket.comments?.length || 0)} messages
                  </div>
                </Card>
              ))}
            </div>

            {/* Selected Ticket */}
            {selectedTicket && (
              <Card className="p-6 lg:col-span-1 border-primary/20 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">{selectedTicket.subject}</h3>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedTicket(null)}>
                    <XCircle className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-3 max-h-96 overflow-y-auto mb-4 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg">
                  {/* Show initial description */}
                  <div className="p-3 rounded-lg bg-blue-600 text-white ml-4">
                    <div className="flex justify-between mb-1">
                      <span className="font-bold text-xs uppercase opacity-80">Initial Request</span>
                      <span className="text-[10px] opacity-70">
                        {new Date(selectedTicket.createdAt || selectedTicket.createdDate).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm">{selectedTicket.description}</p>
                  </div>

                  {selectedTicket.comments?.map((msg, idx) => {
                    const msgAuthorId = msg.author?._id?.toString() || msg.author?.toString();
                    const ticketCustomerId = selectedTicket.customerId?._id?.toString() || selectedTicket.customerId?.toString();

                    const isAuthorMsg = msgAuthorId === ticketCustomerId ||
                      ['customer', 'user'].includes(msg.author?.role) ||
                      msg.type === 'customer';

                    const authorName = msg.author && typeof msg.author === 'object' && msg.author.firstName
                      ? `${msg.author.firstName} ${msg.author.lastName || ''}`.trim()
                      : (isAuthorMsg && selectedTicket.customerId?.firstName
                        ? `${selectedTicket.customerId.firstName} ${selectedTicket.customerId.lastName || ''}`.trim()
                        : (isAuthorMsg ? 'Customer' : 'Staff'));

                    return (
                      <div
                        key={idx}
                        className={`p-3 rounded-lg ${isAuthorMsg
                          ? 'bg-blue-600 text-white ml-4'
                          : 'bg-white dark:bg-gray-800 mr-4 border'
                          }`}
                      >
                        <div className="flex justify-between mb-1">
                          <span className="font-bold text-xs uppercase opacity-80">
                            {authorName}
                          </span>
                          <span className="text-[10px] opacity-70">
                            {new Date(msg.createdAt || msg.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-sm">{msg.text || msg.message}</p>
                      </div>
                    );
                  })}
                </div>
                <div className="flex flex-col space-y-2">
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Type reply..."
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleReply()}
                      disabled={selectedTicket.status === 'closed'}
                    />
                    <Button
                      size="icon"
                      onClick={handleReply}
                      disabled={!replyMessage.trim() || selectedTicket.status === 'closed'}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                  {isAdmin && selectedTicket.status !== 'resolved' && selectedTicket.status !== 'closed' && (
                    <Button
                      variant="outline"
                      className="w-full text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700 transition-colors"
                      onClick={handleResolve}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Mark as Resolved
                    </Button>
                  )}
                </div>
              </Card>
            )}
          </div>
        </motion.div>

        {/* FAQ Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="max-w-4xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <Card key={index} className="p-6">
                <details className="group">
                  <summary className="flex justify-between cursor-pointer list-none">
                    <h3 className="font-semibold">{faq.question}</h3>
                    <ChevronRight className="h-5 w-5 transform group-open:rotate-90 transition-transform" />
                  </summary>
                  <p className="mt-4 text-gray-600">{faq.answer}</p>
                </details>
              </Card>
            ))}
          </div>
        </motion.div>
      </div>

      {/* New Ticket Modal */}
      <AnimatePresence>
        {showNewTicket && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowNewTicket(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold">Create Support Ticket</h2>
              </div>
              <form onSubmit={handleSubmit(onSubmitTicket)} className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Subject *</label>
                    <Input
                      {...register('subject', { required: 'Subject is required' })}
                      placeholder="Brief description"
                    />
                    {errors.subject && (
                      <p className="text-red-500 text-sm mt-1">{errors.subject.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Request Type *</label>
                      <select
                        {...register('type', { required: 'Type is required' })}
                        className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700"
                      >
                        <option value="technical">Technical Issue</option>
                        <option value="billing">Billing & Payment</option>
                        <option value="feedback">Feedback</option>
                        <option value="grievance">Grievance</option>
                        <option value="suggestion">Suggestion</option>
                      </select>
                      {errors.type && (
                        <p className="text-red-500 text-sm mt-1">{errors.type.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Priority</label>
                      <select
                        {...register('priority')}
                        className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Category (Optional)</label>
                    <select
                      {...register('category')}
                      className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700"
                    >
                      <option value="">Select Category</option>
                      <option value="Payment">Payment Related</option>
                      <option value="Property Info">Property Info</option>
                      <option value="Visit">Site Visit</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Description *</label>
                    <textarea
                      {...register('description', { required: 'Description is required' })}
                      placeholder="Describe your issue..."
                      rows={4}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                    {errors.description && (
                      <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
                    )}
                  </div>
                </div>

                <div className="flex space-x-3 mt-6">
                  <Button type="button" variant="outline" onClick={() => setShowNewTicket(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Creating...' : 'Create Ticket'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SupportPage;
