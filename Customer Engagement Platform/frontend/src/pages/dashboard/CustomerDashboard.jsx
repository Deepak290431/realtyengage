import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Home,
  TrendingUp,
  FileText,
  CreditCard,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  IndianRupee,
  Building2,
  MapPin,
  Eye,
  Download,
  Bell,
  Star,
  ChevronRight,
  User,
  Settings,
  HelpCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';

import { dashboardAPI, paymentAPI } from '../../services/api';
import enquiryService from '../../services/enquiryService';

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalInvested: 0,
    pendingPayments: 0,
    totalProperties: 0,
    activeEnquiries: 0
  });
  const [myProperties, setMyProperties] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsResp, enquiriesResp, activitiesResp, transactionsResp] = await Promise.all([
        dashboardAPI.getStats(),
        enquiryService.getMyEnquiries(),
        dashboardAPI.getRecentActivities().catch(() => ({ data: [] })),
        paymentAPI.getTransactionHistory().catch(() => ({ data: [] }))
      ]);

      const txDataRaw = transactionsResp.data || transactionsResp;
      const txData = txDataRaw.data || txDataRaw;
      setTransactions(Array.isArray(txData) ? txData : []);

      const totalPaid = Array.isArray(txData) ? txData.reduce((acc, tx) => acc + tx.amountPaid, 0) : 0;

      const statsData = statsResp.data?.data || statsResp.data || {};

      const enquiriesDataRaw = enquiriesResp.data || enquiriesResp || [];
      const enquiriesData = Array.isArray(enquiriesDataRaw) ? enquiriesDataRaw : (enquiriesDataRaw.data || []);
      const okProps = enquiriesData.filter(e => e.isOk);

      let pendingTotal = 0;
      okProps.forEach(e => {
        e.installments?.forEach(inst => {
          if (inst.status === 'pending') pendingTotal += inst.amount;
        });
      });

      setStats({
        totalInvested: totalPaid || statsData.totalInvested || 0,
        pendingPayments: pendingTotal || statsData.pendingPayments || 0,
        totalProperties: okProps.length,
        activeEnquiries: enquiriesData.length
      });

      setMyProperties(okProps);
      const activityDataRaw = activitiesResp.data || activitiesResp;
      setRecentActivities(activityDataRaw.data || activityDataRaw || []);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'payment': return <CreditCard className="h-4 w-4" />;
      case 'enquiry': return <FileText className="h-4 w-4" />;
      case 'document': return <Download className="h-4 w-4" />;
      case 'visit': return <Calendar className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getActivityColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50';
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      case 'upcoming': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = date.getFullYear();
    return `${d}/${m}/${y}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white pt-8 pb-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-between items-center"
          >
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Welcome back, {user?.firstName || 'Customer'}!
              </h1>
              <p className="text-white/90">
                Here's your property investment overview
              </p>
            </div>
            <div className="flex space-x-3">
              <Button variant="secondary" onClick={() => navigate('/')}>
                <Home className="h-4 w-4 mr-2" />
                Go to Home
              </Button>
              <Button variant="secondary">
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 -mt-12 mb-8">
          {[
            { label: 'Total Invested', value: formatCurrency(stats.totalInvested), icon: IndianRupee, color: 'green' },
            { label: 'Pending Payments', value: formatCurrency(stats.pendingPayments), icon: Clock, color: 'yellow' },
            { label: 'Properties', value: stats.totalProperties, icon: Building2, color: 'blue' },
            { label: 'Active Enquiries', value: stats.activeEnquiries, icon: FileText, color: 'purple' }
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * (i + 1) }}
            >
              <Card className="p-6 bg-white dark:bg-gray-800 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{item.label}</p>
                    <p className="text-2xl font-bold">{loading ? '...' : item.value}</p>
                  </div>
                  <div className={`p-3 bg-${item.color}-100 rounded-full`}>
                    <item.icon className={`h-6 w-6 text-${item.color}-600`} />
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* My Properties */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">My Properties</h2>
                <Button variant="outline" size="sm" onClick={() => navigate('/projects')}>
                  View All
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>

              <div className="space-y-4">
                {loading ? (
                  <p className="text-center py-8 text-gray-500">Loading your properties...</p>
                ) : myProperties.length > 0 ? (
                  myProperties.map((enquiry) => {
                    const project = enquiry.projectId;
                    if (!project) return null;
                    return (
                      <div key={enquiry._id} className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <img
                          src={project.images && project.images.length > 0 ? (project.images[0].url || project.images[0]) : "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400"}
                          alt={project.name}
                          className="w-24 h-24 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-lg">{project.name}</h3>
                            <Badge className={
                              enquiry.status === 'closed'
                                ? 'bg-green-50 text-green-600'
                                : 'bg-yellow-50 text-yellow-600'
                            }>
                              {enquiry.status === 'closed' ? 'Booked' : 'Processing'}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">Location:</span> {project.area || project.location?.address}
                            </div>
                            <div>
                              <span className="text-gray-500">Status:</span> <span className="capitalize">{project.status?.replace('_', ' ')}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Price:</span> ₹{(project.pricing?.basePrice / 100000).toFixed(1)}L
                            </div>
                            <div>
                              <span className="text-gray-500">Next Payment:</span> <span className="text-sm font-bold text-blue-600 ml-1">
                                {enquiry.isOk
                                  ? (enquiry.installments?.find(i => i.status === 'pending')?.dueDate
                                    ? formatDate(enquiry.installments.find(i => i.status === 'pending').dueDate)
                                    : 'Due soon')
                                  : 'Awaiting admin OK'
                                }
                              </span>
                            </div>
                          </div>
                          <div className="mt-3">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full"
                                style={{ width: project.status === 'completed' ? '100%' : '65%' }}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button size="sm" onClick={() => navigate(`/projects/${project._id}`)}>
                            <Eye className="h-4 w-4 mr-1" />
                            View Details
                          </Button>
                          <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => navigate('/dashboard/payments')}>
                            <CreditCard className="h-4 w-4 mr-1" />
                            Pay Now
                          </Button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8">
                    <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500">No properties booked yet.</p>
                    <Button variant="link" onClick={() => navigate('/projects')}>Explore available projects</Button>
                  </div>
                )}
              </div>
            </Card>

            {/* Transaction History Section */}
            <Card className="p-6 mt-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Transaction History</h2>
                <Button variant="outline" size="sm" onClick={() => navigate('/dashboard/payments')}>
                  Manage Payments
                </Button>
              </div>

              <div className="space-y-4">
                {loading ? (
                  <p className="text-center py-8 text-gray-500">Loading transactions...</p>
                ) : transactions.length > 0 ? (
                  transactions.map((tx) => (
                    <div key={tx._id} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:shadow-md transition-shadow gap-4">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-full ${tx.paymentStatus === 'success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                          <CheckCircle className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 dark:text-gray-100">{tx.propertyName}</p>
                          <p className="text-xs text-gray-500">
                            {tx.installmentType === 'emi' ? `EMI #${tx.installmentNumber}` : 'Full Payment'} • {new Date(tx.paymentDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between md:justify-end gap-6">
                        <div className="text-right">
                          <p className="font-bold">{formatCurrency(tx.amountPaid)}</p>
                          <p className="text-[10px] uppercase font-bold text-gray-400">{tx.paymentMethod}</p>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <CreditCard className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500">No transactions yet.</p>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Recent Activities */}
          <div className="lg:col-span-1">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6">Recent Activities</h2>
              <div className="space-y-4">
                {recentActivities.length > 0 ? (
                  recentActivities.map((activity) => (
                    <div key={activity.id || activity._id} className="flex items-start space-x-3">
                      <div className={`p-2 rounded-full ${getActivityColor(activity.status)}`}>
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.description || activity.message}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {activity.date ? new Date(activity.date).toLocaleDateString() : new Date(activity.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">No recent activities.</p>
                )}
              </div>
              <Button variant="outline" className="w-full mt-4" onClick={() => navigate('/activities')}>
                View All Activities
              </Button>
            </Card>

            {/* Quick Actions */}
            <Card className="p-6 mt-6">
              <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" onClick={() => navigate('/dashboard/payments')}>
                  <CreditCard className="h-4 w-4 mr-1" />
                  Payments
                </Button>
                <Button variant="outline" onClick={() => navigate('/dashboard/enquiries')}>
                  <FileText className="h-4 w-4 mr-1" />
                  Enquiries
                </Button>
                <Button variant="outline" onClick={() => navigate('/dashboard/support')}>
                  <HelpCircle className="h-4 w-4 mr-1" />
                  Support
                </Button>
                <Button variant="outline" onClick={() => navigate('/dashboard/profile')}>
                  <Settings className="h-4 w-4 mr-1" />
                  Settings
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
