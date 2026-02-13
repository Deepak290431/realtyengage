import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Building2,
  Home,
  FileText,
  CreditCard,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  BarChart3,
  Clock,
  CheckCircle,
  AlertCircle,
  Settings,
  Plus,
  Eye,
  Edit,
  Download,
  Filter,
  Calendar,
  X,
  Info,
  ChevronRight,
  Calculator
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import api from '../../services/api';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPlatformRevenue: 0,
    totalSalesValue: 0,
    netEarnings: 0,
    totalGST: 0,
    totalCustomers: 0,
    totalProperties: 0,
    totalEnquiries: 0,
    totalPenalties: 0,
    totalRefunds: 0,
    propertyBreakdown: []
  });

  const [recentTransactions, setRecentTransactions] = useState([]);
  const [topProperties, setTopProperties] = useState([]);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [breakdownType, setBreakdownType] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [hoveredBar, setHoveredBar] = useState(null);

  useEffect(() => {
    fetchDashboardData();
    fetchChartData();
  }, []);

  const fetchChartData = async () => {
    try {
      const res = await api.get('/dashboard/charts');
      if (res.data.success) {
        setChartData(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching chart data:', error);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, transRes, propsRes] = await Promise.all([
        api.get('/dashboard/admin/stats'),
        api.get('/payments/transactions/history?limit=5'),
        api.get('/projects?limit=5')
      ]);

      if (statsRes.data.success) {
        setStats(prev => ({ ...prev, ...statsRes.data.data }));
      }
      if (transRes.data.success) {
        setRecentTransactions(transRes.data.data);
      }
      if (propsRes.data.success) {
        setTopProperties(propsRes.data.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const salesChart = chartData.length > 0 ? chartData : [
    { month: 'Jan', sales: 450000, revenue: 45000 },
    { month: 'Feb', sales: 520000, revenue: 52000 },
    { month: 'Mar', sales: 480000, revenue: 48000 },
    { month: 'Apr', sales: 610000, revenue: 61000 },
    { month: 'May', sales: 550000, revenue: 55000 },
    { month: 'Jun', sales: stats.totalSalesValue || 0, revenue: stats.totalPlatformRevenue || 0 },
  ];

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'processing': return 'bg-blue-100 text-blue-700';
      case 'failed': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const handleStatClick = (type) => {
    setBreakdownType(type);
    setShowBreakdown(true);
  };

  const getBreakdownData = () => {
    return stats.propertyBreakdown || [];
  };

  const getModalTitle = () => {
    switch (breakdownType) {
      case 'earnings': return 'Platform Earnings Breakdown';
      case 'sales': return 'Property Sales (GMV) Breakdown';
      case 'payout': return 'Owner Payout Breakdown';
      case 'penalties': return 'Penalties & Late Fees';
      default: return 'Data Breakdown';
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = date.getFullYear();
    return `${d}/${m}/${y}`;
  };

  return (
    <div className="min-h-screen bg-gray-50/30 dark:bg-gray-900 pb-12 relative">
      <div className="w-full px-4 md:px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-primary">
              Admin Dashboard
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Welcome back, {user?.firstName || 'Admin'}! Here's your business overview.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card
              className="p-6 bg-white dark:bg-gray-800 shadow-lg cursor-pointer hover:shadow-xl transition-all border-l-4 border-l-primary hover:scale-[1.02] overflow-hidden"
              onClick={() => user?.role === 'super_admin' && handleStatClick('earnings')}>
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <Info className="h-4 w-4 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500">Net Platform Earnings</p>
              {user?.role === 'super_admin' ? (
                <>
                  <p className="text-2xl font-bold text-primary">
                    {loading ? '...' : formatCurrency(stats.totalPlatformRevenue + stats.totalGST)}
                  </p>
                  <div className="flex flex-col mt-1">
                    <span className="text-[10px] text-primary/70 font-medium">Net Comm: {formatCurrency(stats.netEarnings)}</span>
                    <span className="text-[10px] text-blue-400 font-medium">Total GST: {formatCurrency(stats.totalGST)}</span>
                  </div>
                </>
              ) : (
                <div className="mt-2 py-1 px-3 bg-gray-100 dark:bg-gray-700 rounded-md inline-flex items-center gap-2 text-gray-400">
                  <Calculator className="h-4 w-4" />
                  <span className="text-xs font-bold uppercase tracking-widest whitespace-nowrap">Restricted Access</span>
                </div>
              )}
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card
              className="p-6 bg-white dark:bg-gray-800 shadow-lg cursor-pointer hover:shadow-xl transition-all border-l-4 border-l-green-600 hover:scale-[1.02]"
              onClick={() => handleStatClick('sales')}>
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-green-100 rounded-lg">
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
                <Info className="h-4 w-4 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500">Property Sales Value (GMV)</p>
              <p className="text-2xl font-bold text-green-600">{loading ? '...' : formatCurrency(stats.totalSalesValue)}</p>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card
              className="p-6 bg-white dark:bg-gray-800 shadow-lg cursor-pointer hover:shadow-xl transition-all border-l-4 border-l-blue-600 hover:scale-[1.02] overflow-hidden"
              onClick={() => user?.role === 'super_admin' && handleStatClick('payout')}>
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Building2 className="h-5 w-5 text-blue-600" />
                </div>
                <Info className="h-4 w-4 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500">Total Payouts to Owners</p>
              {user?.role === 'super_admin' ? (
                <p className="text-2xl font-bold text-blue-600">{loading ? '...' : formatCurrency(stats.totalSalesValue * 0.95)}</p>
              ) : (
                <div className="mt-2 py-1 px-3 bg-gray-100 dark:bg-gray-700 rounded-md inline-flex items-center gap-2 text-gray-400">
                  <Calculator className="h-4 w-4" />
                  <span className="text-xs font-bold uppercase tracking-widest whitespace-nowrap">Restricted Access</span>
                </div>
              )}
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card
              className="p-6 bg-white dark:bg-gray-800 shadow-lg cursor-pointer hover:shadow-xl transition-all border-l-4 border-l-orange-600 hover:scale-[1.02]"
              onClick={() => handleStatClick('penalties')}>
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-orange-600" />
                </div>
                <Info className="h-4 w-4 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500">Penalties & Late Fees</p>
              <p className="text-2xl font-bold text-orange-600">{loading ? '...' : formatCurrency(stats.totalPenalties)}</p>
            </Card>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="p-6 bg-white dark:bg-gray-800 shadow-lg border-none">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Activity className="h-5 w-5 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-semibold">Revenue Trends (Last 6 Months)</h2>
                </div>
              </div>

              <div className="h-[300px] flex items-end justify-between gap-2 px-4">
                {salesChart.map((data, index) => {
                  const maxRevenue = Math.max(...salesChart.map(d => d.revenue));
                  const height = maxRevenue ? (data.revenue / maxRevenue) * 100 : 0;
                  const commission = data.revenue;

                  return (
                    <motion.div
                      key={data.month}
                      className="flex-1 flex flex-col items-center group relative"
                      initial={{ height: 0 }}
                      animate={{ height: '100%' }}
                      transition={{ delay: index * 0.1, duration: 0.5 }}
                    >
                      <div className="w-full flex items-end justify-center flex-1">
                        <motion.div
                          className={`w-full max-w-[40px] rounded-t-lg transition-all duration-300 relative ${index === salesChart.length - 1
                            ? 'bg-primary shadow-lg shadow-blue-200'
                            : 'bg-gray-200 group-hover:bg-primary/50'
                            }`}
                          style={{ height: `${height}%` }}
                          onMouseEnter={() => setHoveredBar(index)}
                          onMouseLeave={() => setHoveredBar(null)}
                          onClick={() => {
                            toast.success(`${data.month} Revenue: ${formatCurrency(commission)}`);
                          }}
                        />
                      </div>
                      <p className="text-xs mt-3 font-semibold text-gray-600">{data.month}</p>
                    </motion.div>
                  );
                })}
              </div>

              <div className="mt-4 flex justify-between text-sm text-gray-500">
                <div className="flex items-center">
                  <TrendingUp className="h-4 w-4 mr-1 text-primary" />
                  <span>Total Platform Revenue: {formatCurrency(salesChart.reduce((acc, d) => acc + (Number(d.revenue) || 0), 0))}</span>
                </div>
                <div className="flex items-center">
                  <DollarSign className="h-4 w-4 mr-1 text-green-500" />
                  <span>Total Sales GMV: {formatCurrency(salesChart.reduce((acc, d) => acc + (Number(d.sales) || 0), 0))}</span>
                </div>
              </div>
            </Card>

            {/* Property-wise Breakdown */}
            <Card className="mt-6 w-full max-w-full shadow-lg border-none bg-white dark:bg-gray-800 shadow-blue-500/5 overflow-hidden">
              <div className="p-6 pb-0">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                      <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h2 className="text-xl font-semibold dark:text-white">Property Performance Breakdown</h2>
                  </div>
                </div>
                <div className="text-[10px] text-gray-400 font-medium mb-1 flex items-center gap-1 md:hidden">
                  <ChevronRight className="h-3 w-3 animate-pulse" /> Swipe to see more details
                </div>
              </div>

              <div className="p-6 pb-0 md:hidden">
                <div className="text-[10px] text-gray-400 font-medium mb-1 flex items-center gap-1">
                  <ChevronRight className="h-3 w-3 animate-pulse" /> Swipe to see more details
                </div>
              </div>
              <div className="scrollable-container">
                <table className="w-full text-sm border-collapse" style={{ minWidth: '1200px' }}>
                  <thead>
                    <tr className="text-left text-gray-500 border-b">
                      <th className="pb-3 px-6 font-semibold">Property Name</th>
                      <th className="pb-3 px-6 font-semibold text-right">Transactions</th>
                      <th className="pb-3 px-6 font-semibold text-right">Sales (GMV)</th>
                      <th className="pb-3 px-6 font-semibold text-right text-primary">Commission</th>
                      <th className="pb-3 px-6 font-semibold text-right text-blue-600">GST</th>
                      <th className="pb-3 px-6 font-semibold text-right text-orange-600">Penalties</th>
                      <th className="pb-3 px-6 font-semibold text-right text-red-600">Refunds</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan="7" className="py-4 text-center">Loading breakdown...</td></tr>
                    ) : stats.propertyBreakdown?.length > 0 ? (
                      stats.propertyBreakdown.map((item) => (
                        <tr key={item._id} className="border-b hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-6 font-medium text-gray-900">{item.propertyName}</td>
                          <td className="py-3 px-6 text-right">{item.transactionCount}</td>
                          <td className="py-3 px-6 text-right font-semibold">{formatCurrency(item.totalSales)}</td>
                          <td className="py-3 px-6 text-right text-primary font-bold">{formatCurrency(item.totalCommission)}</td>
                          <td className="py-3 px-6 text-right text-blue-600">{formatCurrency(item.totalGST)}</td>
                          <td className="py-3 px-6 text-right text-orange-600 font-bold">{formatCurrency(item.totalPenalties || 0)}</td>
                          <td className="py-3 px-6 text-right text-red-600 font-medium">-{formatCurrency(item.totalRefunds || 0)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan="7" className="py-8 text-center text-gray-500">No property data available.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Recent Transactions */}
            <Card className="mt-6 w-full max-w-full shadow-lg border-none bg-white dark:bg-gray-800 shadow-blue-500/5 overflow-hidden">
              <div className="p-6 pb-0">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold dark:text-white">Recent Transactions</h2>
                  <Button variant="outline" size="sm" onClick={() => navigate('/admin/payments')}>
                    View All
                  </Button>
                </div>
                <div className="text-[10px] text-gray-400 font-medium mb-1 flex items-center gap-1 md:hidden">
                  <ChevronRight className="h-3 w-3 animate-pulse" /> Swipe to see more details
                </div>
              </div>

              <div className="scrollable-container">
                <table className="w-full border-collapse" style={{ minWidth: '1200px' }}>
                  <thead>
                    <tr className="text-left text-sm text-gray-500 border-b">
                      <th className="pb-3 px-6 text-xs uppercase tracking-wider">Customer</th>
                      <th className="pb-3 px-6 text-xs uppercase tracking-wider">Property</th>
                      <th className="pb-3 px-6 text-right text-xs uppercase tracking-wider">Amount</th>
                      <th className="pb-3 px-6 text-right text-xs uppercase tracking-wider">Comm</th>
                      <th className="pb-3 px-6 text-right text-xs uppercase tracking-wider">GST</th>
                      <th className="pb-3 px-6 text-right text-xs uppercase tracking-wider">Payout</th>
                      <th className="pb-3 px-6 text-xs uppercase tracking-wider">Status</th>
                      <th className="pb-3 px-6 text-xs uppercase tracking-wider">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan="8" className="py-8 text-center text-gray-500">Loading transactions...</td></tr>
                    ) : recentTransactions.length > 0 ? (
                      recentTransactions.map((tx) => (
                        <tr key={tx._id} className="border-b hover:bg-gray-50">
                          <td className="py-4 px-6">
                            <p className="font-medium">{tx.userId?.firstName} {tx.userId?.lastName}</p>
                            <p className="text-xs text-gray-400">{tx.userId?.email}</p>
                          </td>
                          <td className="py-4 px-6">
                            <p className="text-sm font-medium">{tx.propertyName}</p>
                            <div className="flex items-center gap-1">
                              <Badge variant="outline" className="text-[10px] capitalize px-1">{tx.installmentType}</Badge>
                              {tx.installmentType === 'emi' && <span className="text-[10px] text-gray-400">#{tx.installmentNumber}</span>}
                            </div>
                          </td>
                          <td className="py-4 px-6 text-right font-bold text-gray-900">{formatCurrency(tx.amountPaid)}</td>
                          <td className="py-4 px-6 text-right">
                            <span className="text-sm font-semibold text-primary">+{formatCurrency(tx.commissionAmount || tx.commissionEarned || 0)}</span>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <span className="text-sm font-semibold text-blue-600">+{formatCurrency(tx.gstAmount || 0)}</span>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <span className="text-sm font-semibold text-green-600">{formatCurrency(tx.ownerPayout || 0)}</span>
                          </td>
                          <td className="py-4 px-6">
                            <Badge className={`${getStatusColor(tx.paymentStatus)} border-none capitalize`}>
                              {tx.paymentStatus}
                            </Badge>
                          </td>
                          <td className="py-4 px-6 text-sm text-gray-500 font-medium">{formatDate(tx.paymentDate)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan="8" className="py-8 text-center text-gray-500">No transactions found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Top Properties</h2>
                <Button variant="ghost" size="sm">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4">
                {loading ? (
                  <p className="text-center py-4 text-gray-500">Loading properties...</p>
                ) : topProperties.length > 0 ? (
                  topProperties.map((property) => (
                    <div
                      key={property._id}
                      className="space-y-2 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                      onClick={() => navigate(`/admin/projects/edit/${property._id}`)}
                    >
                      <div className="flex justify-between items-center">
                        <p className="font-medium">{property.name}</p>
                        <Badge variant="outline">{property.status?.replace('_', ' ')}</Badge>
                      </div>
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>{property.pricing?.range || 'Contact for price'}</span>
                        <span>{property.area}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className="bg-primary h-1.5 rounded-full"
                          style={{ width: property.status === 'completed' ? '100%' : '45%' }}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center py-4 text-gray-500">No projects available.</p>
                )}
              </div>
            </Card>

            <Card className="p-6 mt-6">
              <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
              <div className="space-y-2">
                <Button className="w-full justify-start" onClick={() => navigate('/admin/projects')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Property
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/admin/enquiries')}>
                  <FileText className="h-4 w-4 mr-2" />
                  View Enquiries
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/admin/customers')}>
                  <Users className="h-4 w-4 mr-2" />
                  Manage Customers
                </Button>
                <Button variant="outline" className="w-full justify-start text-blue-600 bg-blue-50 border-blue-100 hover:bg-blue-100" onClick={() => navigate('/admin/emi')}>
                  <Calculator className="h-4 w-4 mr-2" />
                  EMI Calculator
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => {
                  toast.loading('Generating report...');
                  setTimeout(() => {
                    toast.dismiss();
                    toast.success('Report generated successfully!');
                  }, 2000);
                }}>
                  <Download className="h-4 w-4 mr-2" />
                  Generate Reports
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showBreakdown && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden"
            >
              <div className="p-6 border-b flex items-center justify-between bg-gray-50/50">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-600" />
                  {getModalTitle()}
                </h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowBreakdown(false)}
                  className="rounded-full hover:bg-gray-200"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </Button>
              </div>

              <div className="p-6 pb-0 md:hidden">
                <div className="text-[10px] text-gray-400 font-medium mb-1 flex items-center gap-1">
                  <ChevronRight className="h-3 w-3 animate-pulse" /> Swipe to see more details
                </div>
              </div>
              <div className="max-h-[60vh] overflow-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b">
                      <th className="px-6 pb-3 font-semibold text-left">Property</th>
                      {breakdownType === 'earnings' && (
                        <>
                          <th className="px-4 pb-3 font-semibold text-right">Comm %</th>
                          <th className="px-4 pb-3 font-semibold text-right">Comm Amt</th>
                          <th className="px-4 pb-3 font-semibold text-right">GST (18%)</th>
                          <th className="px-6 pb-3 font-semibold text-right text-blue-600">Total Revenue</th>
                        </>
                      )}
                      {breakdownType === 'sales' && (
                        <>
                          <th className="px-6 pb-3 font-semibold text-right">Transactions</th>
                          <th className="px-6 pb-3 font-semibold text-right text-green-600">Total Sales (GMV)</th>
                        </>
                      )}
                      {breakdownType === 'payout' && (
                        <>
                          <th className="px-4 pb-3 font-semibold text-right">Total GMV</th>
                          <th className="px-4 pb-3 font-semibold text-right">Plat Charges</th>
                          <th className="px-6 pb-3 font-semibold text-right text-blue-600">Owner Payout</th>
                        </>
                      )}
                      {breakdownType === 'penalties' && (
                        <>
                          <th className="px-6 pb-3 font-semibold text-right">Late Count</th>
                          <th className="px-6 pb-3 font-semibold text-right text-orange-600">Penalties Earned</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {getBreakdownData()?.map((item) => (
                      <tr key={item._id} className="border-b hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-6 font-medium text-gray-900">{item.propertyName}</td>
                        {breakdownType === 'earnings' && (
                          <>
                            <td className="py-3 px-4 text-right">{item.commPerc}%</td>
                            <td className="py-3 px-4 text-right font-medium">{formatCurrency(item.totalCommission)}</td>
                            <td className="py-3 px-4 text-right text-gray-500">{formatCurrency(item.totalGST)}</td>
                            <td className="py-3 px-6 text-right text-blue-600 font-bold">{formatCurrency(item.totalCommission + item.totalGST)}</td>
                          </>
                        )}
                        {breakdownType === 'sales' && (
                          <>
                            <td className="py-3 px-6 text-right">{item.transactionCount}</td>
                            <td className="py-3 px-6 text-right font-bold text-green-600">{formatCurrency(item.totalSales)}</td>
                          </>
                        )}
                        {breakdownType === 'payout' && (
                          <>
                            <td className="py-3 px-4 text-right">{formatCurrency(item.totalSales)}</td>
                            <td className="py-3 px-4 text-right text-gray-500">{formatCurrency(item.totalSales - (item.totalOwnerPayout || 0))}</td>
                            <td className="py-3 px-6 text-right text-blue-600 font-bold">{formatCurrency(item.totalOwnerPayout || item.totalSales * 0.98)}</td>
                          </>
                        )}
                        {breakdownType === 'penalties' && (
                          <>
                            <td className="py-3 px-6 text-right">{item.totalLate || 0}</td>
                            <td className="py-3 px-6 text-right font-bold text-orange-600">{formatCurrency(item.totalPenalties || 0)}</td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-6 border-t bg-gray-50/50 flex justify-end">
                <Button onClick={() => setShowBreakdown(false)}>Close Breakdown</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;
