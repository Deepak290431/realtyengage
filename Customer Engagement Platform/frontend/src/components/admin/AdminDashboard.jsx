import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  IconButton,
  Button,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  LinearProgress,
  Tooltip,
  Alert,
  useTheme,
  alpha
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  People,
  Home,
  Payment,
  Support,
  Assignment,
  MoreVert,
  Refresh,
  Download,
  CalendarMonth,
  AttachMoney,
  Analytics,
  Speed,
  Warning,
  CheckCircle,
  Schedule,
  ArrowUpward,
  ArrowDownward
} from '@mui/icons-material';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  Legend,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  ComposedChart
} from 'recharts';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import dashboardService from '../../services/dashboardService';

// KPI Card Component
const KPICard = ({ title, value, change, icon, color = 'primary', prefix = '', suffix = '', loading = false }) => {
  const theme = useTheme();
  const isPositive = change >= 0;

  return (
    <Card sx={{ height: '100%', position: 'relative', overflow: 'visible' }}>
      <CardContent>
        {loading && <LinearProgress sx={{ position: 'absolute', top: 0, left: 0, right: 0 }} />}
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography color="text.secondary" variant="caption" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
              {prefix}{value?.toLocaleString()}{suffix}
            </Typography>
            {change !== undefined && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {isPositive ? (
                  <TrendingUp sx={{ fontSize: 16, color: 'success.main' }} />
                ) : (
                  <TrendingDown sx={{ fontSize: 16, color: 'error.main' }} />
                )}
                <Typography
                  variant="body2"
                  sx={{ color: isPositive ? 'success.main' : 'error.main' }}
                >
                  {isPositive ? '+' : ''}{change}%
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  vs last month
                </Typography>
              </Box>
            )}
          </Box>
          
          <Avatar
            sx={{
              bgcolor: alpha(theme.palette[color].main, 0.1),
              color: `${color}.main`,
              width: 48,
              height: 48
            }}
          >
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );
};

// Mini Chart Component
const MiniChart = ({ title, data, dataKey, color = '#8884d8', type = 'line' }) => {
  return (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Typography variant="subtitle2" gutterBottom>
        {title}
      </Typography>
      <ResponsiveContainer width="100%" height={80}>
        {type === 'line' ? (
          <LineChart data={data}>
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        ) : (
          <AreaChart data={data}>
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              fill={alpha(color, 0.3)}
            />
          </AreaChart>
        )}
      </ResponsiveContainer>
    </Paper>
  );
};

// Activity Timeline Component
const ActivityTimeline = ({ activities }) => {
  const getActivityIcon = (type) => {
    switch (type) {
      case 'payment':
        return <Payment fontSize="small" />;
      case 'enquiry':
        return <Assignment fontSize="small" />;
      case 'support':
        return <Support fontSize="small" />;
      case 'project':
        return <Home fontSize="small" />;
      default:
        return <Schedule fontSize="small" />;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'payment':
        return 'success';
      case 'enquiry':
        return 'info';
      case 'support':
        return 'warning';
      case 'project':
        return 'primary';
      default:
        return 'default';
    }
  };

  return (
    <Paper sx={{ p: 2, height: '100%', maxHeight: 400, overflow: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Recent Activity</Typography>
        <IconButton size="small">
          <MoreVert />
        </IconButton>
      </Box>
      
      <List dense>
        {activities.map((activity, index) => (
          <ListItem key={index} sx={{ px: 0 }}>
            <ListItemAvatar sx={{ minWidth: 40 }}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: `${getActivityColor(activity.type)}.light` }}>
                {getActivityIcon(activity.type)}
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={activity.message}
              secondary={format(new Date(activity.timestamp), 'MMM dd, HH:mm')}
              primaryTypographyProps={{ variant: 'body2' }}
            />
            {activity.amount && (
              <ListItemSecondaryAction>
                <Typography variant="body2" fontWeight="bold" color="success.main">
                  ₹{activity.amount.toLocaleString()}
                </Typography>
              </ListItemSecondaryAction>
            )}
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

// Performance Metrics Component
const PerformanceMetrics = ({ metrics }) => {
  const theme = useTheme();
  
  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        System Performance
      </Typography>
      
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">Server Response Time</Typography>
              <Typography variant="body2" fontWeight="bold">
                {metrics.responseTime}ms
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={(200 - metrics.responseTime) / 2}
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                '& .MuiLinearProgress-bar': {
                  borderRadius: 4,
                  bgcolor: metrics.responseTime < 100 ? 'success.main' : 
                          metrics.responseTime < 150 ? 'warning.main' : 'error.main'
                }
              }}
            />
          </Box>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">Database Health</Typography>
              <Typography variant="body2" fontWeight="bold">
                {metrics.dbHealth}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={metrics.dbHealth}
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: alpha(theme.palette.success.main, 0.1),
                '& .MuiLinearProgress-bar': {
                  borderRadius: 4,
                  bgcolor: 'success.main'
                }
              }}
            />
          </Box>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">Active Users</Typography>
              <Typography variant="body2" fontWeight="bold">
                {metrics.activeUsers}
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={(metrics.activeUsers / 100) * 100}
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: alpha(theme.palette.info.main, 0.1),
                '& .MuiLinearProgress-bar': {
                  borderRadius: 4,
                  bgcolor: 'info.main'
                }
              }}
            />
          </Box>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">API Success Rate</Typography>
              <Typography variant="body2" fontWeight="bold">
                {metrics.apiSuccess}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={metrics.apiSuccess}
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: alpha(theme.palette.warning.main, 0.1),
                '& .MuiLinearProgress-bar': {
                  borderRadius: 4,
                  bgcolor: metrics.apiSuccess > 95 ? 'success.main' : 'warning.main'
                }
              }}
            />
          </Box>
        </Grid>
      </Grid>
      
      <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
        <Chip
          icon={<CheckCircle />}
          label="All Systems Operational"
          color="success"
          size="small"
        />
        <Chip
          icon={<Speed />}
          label="Optimal Performance"
          color="info"
          size="small"
        />
      </Box>
    </Paper>
  );
};

const AdminDashboard = () => {
  const theme = useTheme();
  const [dateRange, setDateRange] = useState('week');
  const [refreshing, setRefreshing] = useState(false);

  // Fetch dashboard data
  const { data: stats, refetch, isLoading } = useQuery({
    queryKey: ['admin-dashboard-stats'],
    queryFn: dashboardService.getQuickStats,
    refetchInterval: 30000 // Auto refresh every 30 seconds
  });

  // Sample data for charts
  const revenueData = [
    { date: 'Mon', revenue: 45000 },
    { date: 'Tue', revenue: 52000 },
    { date: 'Wed', revenue: 48000 },
    { date: 'Thu', revenue: 61000 },
    { date: 'Fri', revenue: 55000 },
    { date: 'Sat', revenue: 67000 },
    { date: 'Sun', revenue: 58000 }
  ];

  const projectStatusData = [
    { name: 'Upcoming', value: 5, color: '#FFC107' },
    { name: 'In Progress', value: 8, color: '#2196F3' },
    { name: 'Completed', value: 12, color: '#4CAF50' }
  ];

  const enquiryTrendData = [
    { month: 'Jan', enquiries: 65 },
    { month: 'Feb', enquiries: 78 },
    { month: 'Mar', enquiries: 90 },
    { month: 'Apr', enquiries: 81 },
    { month: 'May', enquiries: 96 },
    { month: 'Jun', enquiries: 112 }
  ];

  const conversionData = [
    { stage: 'Visitors', value: 100, color: '#8884d8' },
    { stage: 'Enquiries', value: 60, color: '#82ca9d' },
    { stage: 'Site Visits', value: 35, color: '#ffc658' },
    { stage: 'Bookings', value: 20, color: '#ff7c7c' },
    { stage: 'Sales', value: 12, color: '#8dd1e1' }
  ];

  const recentActivities = [
    { type: 'payment', message: 'Payment received from John Doe', amount: 250000, timestamp: new Date() },
    { type: 'enquiry', message: 'New enquiry for Skyline Apartments', timestamp: subDays(new Date(), 0.5) },
    { type: 'support', message: 'Support ticket #102 resolved', timestamp: subDays(new Date(), 1) },
    { type: 'project', message: 'Green Valley project updated', timestamp: subDays(new Date(), 1.5) },
    { type: 'payment', message: 'EMI payment from Sarah Smith', amount: 45000, timestamp: subDays(new Date(), 2) }
  ];

  const performanceMetrics = {
    responseTime: 85,
    dbHealth: 98,
    activeUsers: 42,
    apiSuccess: 99.5
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
    toast.success('Dashboard refreshed');
  };

  const handleExport = () => {
    toast.success('Exporting dashboard report...');
    // Implement export logic
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Admin Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Welcome back! Here's what's happening with your platform today.
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={handleRefresh}
            disabled={refreshing}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<Download />}
            onClick={handleExport}
          >
            Export Report
          </Button>
        </Box>
      </Box>

      {/* Date Range Selector */}
      <Box sx={{ mb: 3 }}>
        <Chip
          label="Today"
          onClick={() => setDateRange('today')}
          color={dateRange === 'today' ? 'primary' : 'default'}
          sx={{ mr: 1 }}
        />
        <Chip
          label="This Week"
          onClick={() => setDateRange('week')}
          color={dateRange === 'week' ? 'primary' : 'default'}
          sx={{ mr: 1 }}
        />
        <Chip
          label="This Month"
          onClick={() => setDateRange('month')}
          color={dateRange === 'month' ? 'primary' : 'default'}
          sx={{ mr: 1 }}
        />
        <Chip
          label="This Year"
          onClick={() => setDateRange('year')}
          color={dateRange === 'year' ? 'primary' : 'default'}
        />
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="Total Revenue"
            value={stats?.revenue?.total || 0}
            change={12.5}
            icon={<AttachMoney />}
            color="success"
            prefix="₹"
            loading={isLoading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="Active Projects"
            value={stats?.projects?.active || 0}
            change={8.2}
            icon={<Home />}
            color="primary"
            loading={isLoading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="Total Customers"
            value={stats?.users?.customers || 0}
            change={15.3}
            icon={<People />}
            color="info"
            loading={isLoading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="Open Enquiries"
            value={stats?.enquiries?.new || 0}
            change={-5.1}
            icon={<Assignment />}
            color="warning"
            loading={isLoading}
          />
        </Grid>
      </Grid>

      {/* Charts Row 1 */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Revenue Trend</Typography>
              <IconButton size="small">
                <MoreVert />
              </IconButton>
            </Box>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.3)} />
                <XAxis dataKey="date" />
                <YAxis />
                <ChartTooltip />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  fill={alpha(theme.palette.primary.main, 0.2)}
                  stroke={theme.palette.primary.main}
                />
                <Bar dataKey="revenue" fill={theme.palette.primary.main} />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke={theme.palette.secondary.main}
                  strokeWidth={2}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Project Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={projectStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {projectStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip />
              </PieChart>
            </ResponsiveContainer>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2 }}>
              {projectStatusData.map((status) => (
                <Box key={status.name} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Box sx={{ width: 12, height: 12, bgcolor: status.color, borderRadius: '50%' }} />
                  <Typography variant="caption">{status.name}</Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Charts Row 2 */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Enquiry Trend
            </Typography>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={enquiryTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.3)} />
                <XAxis dataKey="month" />
                <YAxis />
                <ChartTooltip />
                <Area
                  type="monotone"
                  dataKey="enquiries"
                  stroke={theme.palette.info.main}
                  fill={alpha(theme.palette.info.main, 0.3)}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Conversion Funnel
            </Typography>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={conversionData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.3)} />
                <XAxis type="number" />
                <YAxis dataKey="stage" type="category" />
                <ChartTooltip />
                <Bar dataKey="value">
                  {conversionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Mini Charts */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <MiniChart
            title="Daily Visitors"
            data={[
              { value: 30 },
              { value: 42 },
              { value: 38 },
              { value: 51 },
              { value: 46 },
              { value: 58 },
              { value: 62 }
            ]}
            dataKey="value"
            color={theme.palette.primary.main}
            type="area"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MiniChart
            title="Support Tickets"
            data={[
              { value: 12 },
              { value: 8 },
              { value: 15 },
              { value: 6 },
              { value: 10 },
              { value: 7 },
              { value: 5 }
            ]}
            dataKey="value"
            color={theme.palette.warning.main}
            type="line"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MiniChart
            title="Payment Success Rate"
            data={[
              { value: 95 },
              { value: 98 },
              { value: 92 },
              { value: 99 },
              { value: 97 },
              { value: 96 },
              { value: 100 }
            ]}
            dataKey="value"
            color={theme.palette.success.main}
            type="area"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MiniChart
            title="New Registrations"
            data={[
              { value: 5 },
              { value: 8 },
              { value: 12 },
              { value: 7 },
              { value: 15 },
              { value: 11 },
              { value: 18 }
            ]}
            dataKey="value"
            color={theme.palette.info.main}
            type="line"
          />
        </Grid>
      </Grid>

      {/* Bottom Section */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <ActivityTimeline activities={recentActivities} />
        </Grid>
        
        <Grid item xs={12} md={8}>
          <PerformanceMetrics metrics={performanceMetrics} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;
