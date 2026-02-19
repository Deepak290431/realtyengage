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
  HelpCircle,
  X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';

import { dashboardAPI, paymentAPI } from '../../services/api';
import enquiryService from '../../services/enquiryService';
import { normalizeImageUrl, handleImageError } from '../../utils/imageUtils';

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

  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Welcome Header */}
      <div className="hero-gradient text-white pt-8 pb-20">
        <div className="max-w-[1440px] mx-auto px-6 md:px-10 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
          >
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">
                Welcome back, {user?.firstName || 'Customer'}!
              </h1>
              <p className="text-white/90 text-sm md:text-base">
                Here's your property investment overview
              </p>
            </div>
            <div className="flex flex-wrap gap-2 items-center w-full md:w-auto">
              <Button variant="secondary" onClick={() => navigate('/')} className="flex-1 md:flex-none text-xs md:text-sm h-9">
                <Home className="h-4 w-4 mr-2" />
                Home
              </Button>
              <div className="relative flex-1 md:flex-none">
                <Button
                  variant="secondary"
                  onClick={() => setShowNotifications(!showNotifications)}
                  className={`w-full text-xs md:text-sm h-9 ${showNotifications ? 'bg-white/20' : ''}`}
                >
                  <Bell className="h-4 w-4 mr-2" />
                  Alerts
                </Button>

                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-4 z-[100] text-gray-900 dark:text-gray-100 border border-gray-100 dark:border-gray-700"
                  >
                    <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100 dark:border-gray-700">
                      <h3 className="font-bold">Recent Notifications</h3>
                      <button onClick={() => setShowNotifications(false)}>
                        <X className="h-4 w-4 text-gray-400" />
                      </button>
                    </div>
                    <div className="space-y-4 max-h-[300px] overflow-y-auto">
                      {recentActivities.length > 0 ? (
                        recentActivities.map((activity) => (
                          <div key={activity.id || activity._id} className="flex items-start space-x-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-colors">
                            <div className={`p-2 rounded-full mt-0.5 ${getActivityColor(activity.status)}`}>
                              {getActivityIcon(activity.type)}
                            </div>
                            <div>
                              <p className="text-sm font-semibold">{activity.description || activity.message}</p>
                              <p className="text-[10px] text-gray-400 mt-1">
                                {activity.date ? new Date(activity.date).toLocaleDateString() : new Date(activity.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <Bell className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                          <p className="text-sm text-gray-500">No new notifications</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-6 md:px-10 lg:px-12 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8 mb-8">
          {[
            { label: 'Total Invested', value: formatCurrency(stats.totalInvested), icon: IndianRupee, color: 'green' },
            { label: 'Pending Payments', value: formatCurrency(stats.pendingPayments), icon: Clock, color: 'yellow' },
            { label: 'Properties', value: stats.totalProperties, icon: Building2, color: 'blue' },
            { label: 'Active Enquiries', value: stats.activeEnquiries, icon: FileText, color: 'blue' }
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
                      <div key={enquiry._id} className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <img
                          src={normalizeImageUrl(project.images?.[0] || project.image)}
                          alt={project.name}
                          className="w-full sm:w-24 h-48 sm:h-24 rounded-lg object-cover shadow-sm"
                          onError={handleImageError}
                        />
                        <div className="flex-1 w-full">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-bold text-base md:text-lg">{project.name}</h3>
                            <Badge className={
                              enquiry.status === 'closed'
                                ? 'bg-green-50 text-green-600'
                                : 'bg-yellow-50 text-yellow-600'
                            }>
                              {enquiry.status === 'closed' ? 'Booked' : 'Processing'}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 text-[13px] md:text-sm">
                            <div className="flex items-center text-gray-600 dark:text-gray-400">
                              <MapPin className="h-3 w-3 mr-1" />
                              <span className="truncate">{project.area || project.location?.address}</span>
                            </div>
                            <div className="flex items-center text-gray-600 dark:text-gray-400">
                              <Clock className="h-3 w-3 mr-1" />
                              <span className="capitalize">{project.status?.replace('_', ' ')}</span>
                            </div>
                            <div className="flex items-center font-bold text-gray-900 dark:text-white">
                              <IndianRupee className="h-3 w-3 mr-1" />
                              ₹{(project.pricing?.basePrice / 100000).toFixed(1)}L
                            </div>
                            <div className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1 text-blue-600" />
                              <span className="text-blue-600 font-bold">
                                {enquiry.isOk
                                  ? (enquiry.installments?.find(i => i.status === 'pending')?.dueDate
                                    ? formatDate(enquiry.installments.find(i => i.status === 'pending').dueDate)
                                    : 'Due soon')
                                  : 'Awaiting OK'
                                }
                              </span>
                            </div>
                          </div>
                          <div className="mt-4">
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 md:h-2">
                              <div
                                className="bg-gradient-to-r from-blue-700 to-blue-900 h-1.5 md:h-2 rounded-full"
                                style={{ width: project.status === 'completed' ? '100%' : '65%' }}
                              />
                            </div>
                          </div>

                          <div className="flex flex-row gap-2 mt-4 sm:hidden">
                            <Button className="flex-1 h-9 text-xs" onClick={() => navigate(`/projects/${project._id}`)}>
                              <Eye className="h-4 w-4 mr-1" />
                              Details
                            </Button>
                            <Button className="flex-1 h-9 text-xs bg-green-600 hover:bg-green-700 text-white" onClick={() => navigate('/dashboard/payments')}>
                              <CreditCard className="h-4 w-4 mr-1" />
                              Pay Now
                            </Button>
                          </div>
                        </div>
                        <div className="hidden sm:flex flex-col gap-2 min-w-[120px]">
                          <Button size="sm" variant="outline" className="w-full" onClick={() => navigate(`/projects/${project._id}`)}>
                            <Eye className="h-4 w-4 mr-1" />
                            Details
                          </Button>
                          <Button size="sm" className="w-full bg-green-600 hover:bg-green-700 text-white" onClick={() => navigate('/dashboard/payments')}>
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
                      <div className="flex items-center justify-between md:justify-end gap-4 md:gap-8 bg-blue-50/50 dark:bg-blue-900/10 p-4 md:p-0 rounded-2xl md:bg-transparent md:dark:bg-transparent -mx-2 md:mx-0">
                        <div className="text-left md:text-right">
                          <p className="text-xl md:text-lg font-black text-blue-900 dark:text-blue-300">{formatCurrency(tx.amountPaid)}</p>
                          <p className="text-[10px] uppercase font-bold text-gray-400">{tx.paymentMethod}</p>
                        </div>
                        <Button variant="ghost" size="sm" className="h-10 w-10 md:h-8 md:w-8 bg-white md:bg-transparent shadow-sm md:shadow-none rounded-xl">
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
              <Button variant="outline" className="w-full mt-4" onClick={() => navigate('/dashboard/enquiries')}>
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
                <Button variant="outline" className="border-blue-200 hover:bg-blue-600 hover:text-white transition-colors group" onClick={() => navigate('/dashboard/enquiries?type=site_visit')}>
                  <Calendar className="h-4 w-4 mr-1 text-blue-600 group-hover:text-white transition-colors" />
                  Schedule Visit
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
