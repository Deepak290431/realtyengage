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
  Info
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';

import { dashboardAPI, projectAPI, paymentAPI, enquiryAPI } from '../../services/api';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [timePeriod, setTimePeriod] = useState('last6months');
  const [hoveredBar, setHoveredBar] = useState(null);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [breakdownType, setBreakdownType] = useState(null); // 'earnings', 'sales', 'payout', 'penalties'
  const [stats, setStats] = useState({
    totalPlatformRevenue: 0,
    totalGST: 0,
    totalPenalties: 0,
    lateEMICount: 0,
    netEarnings: 0,
    totalSalesValue: 0,
    totalOwnerPayout: 0,
    revenueGrowth: 0,
    totalProperties: 0,
    activeProperties: 0,
    totalCustomers: 0,
    newCustomers: 0,
    totalEnquiries: 0,
    pendingEnquiries: 0,
    propertyBreakdown: []
  });
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [topProperties, setTopProperties] = useState([]);
  const [salesChart, setSalesChart] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, [timePeriod]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsResp, projectsResp, enquiriesResp, chartResp, transactionsResp] = await Promise.all([
        dashboardAPI.getAdminStats(),
        projectAPI.getProjects({ limit: 5, sort: '-salesCount' }),
        enquiryAPI.getEnquiries({ limit: 5 }),
        dashboardAPI.getChartData(timePeriod).catch(() => ({ data: [] })),
        paymentAPI.getTransactionHistory().catch(() => ({ data: [] }))
      ]);

      const statsData = statsResp.data?.data || statsResp.data || statsResp;
      setStats({
        totalPlatformRevenue: statsData.totalPlatformRevenue || 0,
        totalGST: statsData.totalGST || 0,
        totalPenalties: statsData.totalPenalties || 0,
        lateEMICount: statsData.lateEMICount || 0,
        netEarnings: statsData.netEarnings || 0,
        totalSalesValue: statsData.totalSalesValue || 0,
        totalOwnerPayout: statsData.totalOwnerPayout || 0,
        revenueGrowth: statsData.revenueGrowth || 0,
        totalProperties: statsData.totalProjects || 0,
        activeProperties: statsData.activeProjects || 0,
        totalCustomers: statsData.totalUsers || 0,
        newCustomers: statsData.newUsers || 0,
        totalEnquiries: statsData.totalEnquiries || 0,
        pendingEnquiries: statsData.pendingEnquiries || 0,
        propertyBreakdown: statsData.propertyBreakdown || []
      });

      const txDataRaw = transactionsResp.data || transactionsResp;
      const txData = txDataRaw.data || txDataRaw;
      setRecentTransactions(Array.isArray(txData) ? txData.slice(0, 10) : []);

      const projectsData = projectsResp.data?.data || projectsResp.data;
      setTopProperties(Array.isArray(projectsData) ? projectsData : []);
      const chartDataRaw = chartResp.data || chartResp;
      const chartData = chartDataRaw.data || chartDataRaw;
      setSalesChart(Array.isArray(chartData) ? chartData : [
        { month: 'Jan', sales: 0 },
        { month: 'Feb', sales: 0 },
        { month: 'Mar', sales: 0 },
        { month: 'Apr', sales: 0 },
        { month: 'May', sales: 0 },
        { month: 'Jun', sales: 0 }
      ]);
    } catch (error) {
      console.error('Failed to fetch admin dashboard data:', error);
      toast.error('Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  const handleStatClick = (type) => {
    setBreakdownType(type);
    setShowBreakdown(true);
  };

  const getBreakdownData = () => {
    if (!breakdownType) return [];
    return stats.propertyBreakdown.map(item => {
      // Calculate commission percentage for display
      const commPerc = item.totalSales > 0 ? ((item.totalCommission / item.totalSales) * 100).toFixed(1) : 0;
      return { ...item, commPerc };
    });
  };

  const getModalTitle = () => {
    switch (breakdownType) {
      case 'earnings': return 'Net Platform Earnings Breakdown';
      case 'sales': return 'Property Sales (GMV) Breakdown';
      case 'payout': return 'Owner/Builder Payout Breakdown';
      case 'penalties': return 'EMI Penalties Breakdown';
      default: return 'Stat Breakdown';
    }
  };

  const formatCurrency = (amount) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(1)}Cr`;
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    }
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
      case 'completed': return 'text-green-600 bg-green-50';
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      case 'failed': return 'text-red-600 bg-red-50';
      case 'refund': return 'text-orange-600 bg-orange-50';
      default: return 'text-gray-600 bg-gray-50';
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Admin Header */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Welcome back, {user?.firstName || 'Admin'}! Here's your business overview.
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card
              className="p-6 bg-white dark:bg-gray-800 shadow-lg cursor-pointer hover:shadow-xl transition-all border-l-4 border-l-purple-600 hover:scale-[1.02]"
              onClick={() => handleStatClick('earnings')}>
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                </div>
                <Info className="h-4 w-4 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500">Net Platform Earnings (Comm + GST)</p>
              <p className="text-2xl font-bold text-purple-600">
                {loading ? '...' : formatCurrency(stats.totalPlatformRevenue + stats.totalGST)}
              </p>
              <div className="flex flex-col mt-1">
                <span className="text-[10px] text-purple-400 font-medium">Net Comm: {formatCurrency(stats.netEarnings)}</span>
                <span className="text-[10px] text-indigo-400 font-medium">Total GST: {formatCurrency(stats.totalGST)}</span>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
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

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card
              className="p-6 bg-white dark:bg-gray-800 shadow-lg cursor-pointer hover:shadow-xl transition-all border-l-4 border-l-indigo-600 hover:scale-[1.02]"
              onClick={() => handleStatClick('payout')}>
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Building2 className="h-5 w-5 text-indigo-600" />
                </div>
                <Info className="h-4 w-4 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500">Owner/Builder Payout</p>
              <p className="text-2xl font-bold text-indigo-600">{loading ? '...' : formatCurrency(stats.totalOwnerPayout)}</p>
            </Card>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Card
              className="p-6 bg-white dark:bg-gray-800 shadow-lg border-l-4 border-l-orange-500 cursor-pointer hover:shadow-xl transition-all hover:scale-[1.02]"
              onClick={() => handleStatClick('penalties')}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-orange-600" />
                </div>
                <Badge className="bg-orange-50 text-orange-600">
                  {loading ? '...' : `${stats.lateEMICount} Late`}
                </Badge>
              </div>
              <p className="text-sm text-gray-500">EMI Penalties</p>
              <p className="text-2xl font-bold text-orange-600">{loading ? '...' : formatCurrency(stats.totalPenalties)}</p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card
              className="p-6 bg-white dark:bg-gray-800 shadow-lg cursor-pointer hover:shadow-xl transition-shadow border-l-4 border-l-blue-600"
              onClick={() => navigate('/admin/projects')}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Home className="h-5 w-5 text-blue-600" />
                </div>
                <Badge className="bg-blue-50 text-blue-600">
                  {loading ? '...' : `${stats.activeProperties}/${stats.totalProperties}`}
                </Badge>
              </div>
              <p className="text-sm text-gray-500">Total Properties</p>
              <p className="text-2xl font-bold text-blue-600">{loading ? '...' : stats.totalProperties}</p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card
              className="p-6 bg-white dark:bg-gray-800 shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
              onClick={() => navigate('/admin/customers')}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Users className="h-5 w-5 text-purple-600" />
                </div>
                <Badge className="bg-purple-50 text-purple-600">
                  {loading ? '...' : `+${stats.newCustomers}`}
                </Badge>
              </div>
              <p className="text-sm text-gray-500">Total Customers</p>
              <p className="text-2xl font-bold">{loading ? '...' : stats.totalCustomers}</p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card
              className="p-6 bg-white dark:bg-gray-800 shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
              onClick={() => navigate('/admin/enquiries')}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <FileText className="h-5 w-5 text-yellow-600" />
                </div>
                <Badge className="bg-yellow-50 text-yellow-600">
                  {loading ? '...' : `${stats.pendingEnquiries} pending`}
                </Badge>
              </div>
              <p className="text-sm text-gray-500">Total Enquiries</p>
              <p className="text-2xl font-bold">{loading ? '...' : stats.totalEnquiries}</p>
            </Card>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Sales Chart */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Sales Overview</h2>
                <select
                  className="px-3 py-1 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={timePeriod}
                  onChange={(e) => {
                    setTimePeriod(e.target.value);
                    toast.success('Updated time period');
                  }}
                >
                  <option value="last6months">Last 6 months</option>
                  <option value="lastyear">Last year</option>
                  <option value="alltime">All time</option>
                </select>
              </div>

              <div className="h-64 flex items-end justify-between space-x-2 relative">
                {salesChart.map((data, index) => {
                  const maxSales = Math.max(...salesChart.map(d => d.sales)) || 1;
                  const height = (data.sales / maxSales) * 100;
                  const gmv = data.sales;
                  const commission = data.revenue;

                  return (
                    <motion.div
                      key={index}
                      className="flex-1 flex flex-col items-center relative"
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      transition={{ delay: index * 0.1, duration: 0.5 }}
                    >
                      <div className="relative w-full">
                        {hoveredBar === index && (
                          <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-900 border border-gray-700 text-white px-3 py-2 rounded-lg text-xs shadow-2xl z-20 min-w-[150px]">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-gray-400">Sales Value:</span>
                              <span className="font-bold">{formatCurrency(gmv)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-purple-400 font-medium">Commission:</span>
                              <span className="font-bold text-purple-400">{formatCurrency(commission)}</span>
                            </div>
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-gray-900"></div>
                          </div>
                        )}
                        <div
                          className="w-full bg-gradient-to-t from-purple-600 to-indigo-600 rounded-t-lg transition-all hover:brightness-110 cursor-pointer origin-bottom shadow-lg"
                          style={{ height: `${Math.max(height, 5) * 1.5}px` }}
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
                  <TrendingUp className="h-4 w-4 mr-1 text-purple-500" />
                  <span>Total Platform Revenue: {formatCurrency(salesChart.reduce((acc, d) => acc + (Number(d.revenue) || 0), 0))}</span>
                </div>
                <div className="flex items-center">
                  <DollarSign className="h-4 w-4 mr-1 text-green-500" />
                  <span>Total Sales GMV: {formatCurrency(salesChart.reduce((acc, d) => acc + (Number(d.sales) || 0), 0))}</span>
                </div>
              </div>
            </Card>

            {/* Property-wise Breakdown */}
            <Card className="p-6 mt-6 overflow-hidden">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <BarChart3 className="h-5 w-5 text-indigo-600" />
                  </div>
                  <h2 className="text-xl font-semibold">Property Performance Breakdown</h2>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b">
                      <th className="pb-3 font-semibold">Property Name</th>
                      <th className="pb-3 font-semibold text-right">Transactions</th>
                      <th className="pb-3 font-semibold text-right">Sales (GMV)</th>
                      <th className="pb-3 font-semibold text-right text-purple-600">Commission</th>
                      <th className="pb-3 font-semibold text-right text-indigo-600">GST</th>
                      <th className="pb-3 font-semibold text-right text-orange-600">Penalties</th>
                      <th className="pb-3 font-semibold text-right text-red-600">Refunds</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan="6" className="py-4 text-center">Loading breakdown...</td></tr>
                    ) : stats.propertyBreakdown.length > 0 ? (
                      stats.propertyBreakdown.map((item) => (
                        <tr key={item._id} className="border-b hover:bg-gray-50 transition-colors">
                          <td className="py-3 font-medium text-gray-900">{item.propertyName}</td>
                          <td className="py-3 text-right">{item.transactionCount}</td>
                          <td className="py-3 text-right font-semibold">{formatCurrency(item.totalSales)}</td>
                          <td className="py-3 text-right text-purple-600 font-bold">{formatCurrency(item.totalCommission)}</td>
                          <td className="py-3 text-right text-indigo-600">{formatCurrency(item.totalGST)}</td>
                          <td className="py-3 text-right text-orange-600 font-bold">{formatCurrency(item.totalPenalties || 0)}</td>
                          <td className="py-3 text-right text-red-600 font-medium">-{formatCurrency(item.totalRefunds || 0)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan="6" className="py-8 text-center text-gray-500">No property data available.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Recent Transactions */}
            <Card className="p-6 mt-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Recent Transactions</h2>
                <Button variant="outline" size="sm" onClick={() => navigate('/admin/payments')}>
                  View All
                </Button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-sm text-gray-500 border-b">
                      <th className="pb-3 text-xs uppercase tracking-wider">Customer</th>
                      <th className="pb-3 text-xs uppercase tracking-wider">Property</th>
                      <th className="pb-3 text-right text-xs uppercase tracking-wider">Amount</th>
                      <th className="pb-3 text-right text-xs uppercase tracking-wider">Comm</th>
                      <th className="pb-3 text-right text-xs uppercase tracking-wider">GST</th>
                      <th className="pb-3 text-right text-xs uppercase tracking-wider">Payout</th>
                      <th className="pb-3 text-xs uppercase tracking-wider">Status</th>
                      <th className="pb-3 text-xs uppercase tracking-wider">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan="8" className="py-8 text-center text-gray-500">Loading transactions...</td></tr>
                    ) : recentTransactions.length > 0 ? (
                      recentTransactions.map((tx) => (
                        <tr key={tx._id} className="border-b hover:bg-gray-50">
                          <td className="py-4">
                            <p className="font-medium">{tx.userId?.firstName} {tx.userId?.lastName}</p>
                            <p className="text-xs text-gray-400">{tx.userId?.email}</p>
                          </td>
                          <td className="py-4">
                            <p className="text-sm font-medium">{tx.propertyName}</p>
                            <div className="flex items-center gap-1">
                              <Badge variant="outline" className="text-[10px] capitalize px-1">{tx.installmentType}</Badge>
                              {tx.installmentType === 'emi' && <span className="text-[10px] text-gray-400">#{tx.installmentNumber}</span>}
                            </div>
                          </td>
                          <td className="py-4 text-right font-bold text-gray-900">{formatCurrency(tx.amountPaid)}</td>
                          <td className="py-4 text-right">
                            <span className="text-sm font-semibold text-purple-600">+{formatCurrency(tx.commissionAmount || tx.commissionEarned || 0)}</span>
                          </td>
                          <td className="py-4 text-right">
                            <span className="text-sm font-semibold text-indigo-600">+{formatCurrency(tx.gstAmount || 0)}</span>
                          </td>
                          <td className="py-4 text-right">
                            <span className="text-sm font-semibold text-green-600">{formatCurrency(tx.ownerPayout || 0)}</span>
                          </td>
                          <td className="py-4">
                            <Badge className={`${getStatusColor(tx.paymentStatus)} border-none capitalize`}>
                              {tx.paymentStatus}
                            </Badge>
                          </td>
                          <td className="py-4 text-sm text-gray-500 font-medium">{formatDate(tx.paymentDate)}</td>
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

          {/* Side Panel */}
          <div className="lg:col-span-1">
            {/* Top Properties */}
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
                          className="bg-gradient-to-r from-blue-600 to-purple-600 h-1.5 rounded-full"
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

            {/* Quick Actions */}
            <Card className="p-6 mt-6">
              <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
              <div className="space-y-2">
                <Button className="w-full justify-start" onClick={() => {
                  navigate('/admin/projects');
                  toast.success('Opening property management...');
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Property
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => {
                  navigate('/admin/enquiries');
                  toast.success('Loading enquiries...');
                }}>
                  <FileText className="h-4 w-4 mr-2" />
                  View Enquiries
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => {
                  navigate('/admin/customers');
                  toast.success('Opening customer management...');
                }}>
                  <Users className="h-4 w-4 mr-2" />
                  Manage Customers
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => {
                  toast.loading('Generating report...');
                  setTimeout(() => {
                    toast.dismiss();
                    toast.success('Report generated successfully!');
                    // In production, this would download a real report
                    const reportData = {
                      date: new Date().toLocaleDateString(),
                      revenue: stats.totalRevenue,
                      customers: stats.totalCustomers,
                      properties: stats.totalProperties,
                      enquiries: stats.totalEnquiries
                    };
                    console.log('Report Data:', reportData);
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

      {/* Breakdown Modal */}
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
                  <Activity className="h-5 w-5 text-indigo-600" />
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

              <div className="p-6 overflow-x-auto max-h-[60vh]">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b">
                      <th className="pb-3 font-semibold">Property</th>
                      {breakdownType === 'earnings' && (
                        <>
                          <th className="pb-3 font-semibold text-right">Comm %</th>
                          <th className="pb-3 font-semibold text-right">Comm Amt</th>
                          <th className="pb-3 font-semibold text-right">GST (18%)</th>
                          <th className="pb-3 font-semibold text-right text-indigo-600">Total Revenue</th>
                        </>
                      )}
                      {breakdownType === 'sales' && (
                        <>
                          <th className="pb-3 font-semibold text-right">Transactions</th>
                          <th className="pb-3 font-semibold text-right text-green-600">Total Sales (GMV)</th>
                        </>
                      )}
                      {breakdownType === 'payout' && (
                        <>
                          <th className="pb-3 font-semibold text-right">Total GMV</th>
                          <th className="pb-3 font-semibold text-right">Plat Charges</th>
                          <th className="pb-3 font-semibold text-right text-indigo-600">Owner Payout</th>
                        </>
                      )}
                      {breakdownType === 'penalties' && (
                        <>
                          <th className="pb-3 font-semibold text-right">Late Count</th>
                          <th className="pb-3 font-semibold text-right text-orange-600">Penalties Earned</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {getBreakdownData().map((item) => (
                      <tr key={item._id} className="border-b hover:bg-gray-50 transition-colors">
                        <td className="py-4 font-medium text-gray-900">{item.propertyName}</td>
                        {breakdownType === 'earnings' && (
                          <>
                            <td className="py-4 text-right">{item.commPerc}%</td>
                            <td className="py-4 text-right font-medium">{formatCurrency(item.totalCommission)}</td>
                            <td className="py-4 text-right text-gray-500">{formatCurrency(item.totalGST)}</td>
                            <td className="py-4 text-right text-indigo-600 font-bold">{formatCurrency(item.totalCommission + item.totalGST)}</td>
                          </>
                        )}
                        {breakdownType === 'sales' && (
                          <>
                            <td className="py-4 text-right">{item.transactionCount}</td>
                            <td className="py-4 text-right font-bold text-green-600">{formatCurrency(item.totalSales)}</td>
                          </>
                        )}
                        {breakdownType === 'payout' && (
                          <>
                            <td className="py-4 text-right">{formatCurrency(item.totalSales)}</td>
                            <td className="py-4 text-right text-gray-500">{formatCurrency(item.totalSales - (item.totalOwnerPayout || 0))}</td>
                            <td className="py-4 text-right text-indigo-600 font-bold">{formatCurrency(item.totalOwnerPayout || item.totalSales * 0.98)}</td>
                          </>
                        )}
                        {breakdownType === 'penalties' && (
                          <>
                            <td className="py-4 text-right">{item.totalLate || 0}</td>
                            <td className="py-4 text-right font-bold text-orange-600">{formatCurrency(item.totalPenalties || 0)}</td>
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
