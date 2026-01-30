import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Button,
  ButtonGroup,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  AvatarGroup,
  IconButton,
  Tooltip,
  LinearProgress,
  CircularProgress,
  Divider,
  useTheme,
  alpha
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  ShowChart,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  Timeline,
  DateRange,
  FilterList,
  Download,
  Share,
  Fullscreen,
  CompareArrows,
  LocationOn,
  DeviceHub,
  Speed,
  AccessTime
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ScatterChart,
  Scatter,
  Treemap,
  Sankey,
  Cell,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart
} from 'recharts';
import { format, subDays, startOfWeek, endOfWeek } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <Paper sx={{ p: 1 }}>
        <Typography variant="caption">{label}</Typography>
        {payload.map((entry, index) => (
          <Typography key={index} variant="body2" sx={{ color: entry.color }}>
            {entry.name}: {entry.value.toLocaleString()}
          </Typography>
        ))}
      </Paper>
    );
  }
  return null;
};

// Metric Card with Chart
const MetricCard = ({ title, value, change, chart, icon, color }) => {
  const theme = useTheme();
  
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Box>
            <Typography variant="caption" color="text.secondary">
              {title}
            </Typography>
            <Typography variant="h5" fontWeight="bold">
              {value}
            </Typography>
            {change && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                {change > 0 ? (
                  <TrendingUp sx={{ fontSize: 14, color: 'success.main' }} />
                ) : (
                  <TrendingDown sx={{ fontSize: 14, color: 'error.main' }} />
                )}
                <Typography
                  variant="caption"
                  sx={{ color: change > 0 ? 'success.main' : 'error.main' }}
                >
                  {Math.abs(change)}%
                </Typography>
              </Box>
            )}
          </Box>
          <Avatar sx={{ bgcolor: alpha(theme.palette[color].main, 0.1), color: `${color}.main` }}>
            {icon}
          </Avatar>
        </Box>
        
        {chart && (
          <ResponsiveContainer width="100%" height={60}>
            {chart}
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

const Analytics = () => {
  const theme = useTheme();
  const [timeRange, setTimeRange] = useState('7d');
  const [compareMode, setCompareMode] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState('revenue');
  const [viewType, setViewType] = useState('line');

  // Sample analytics data
  const revenueAnalytics = [
    { date: 'Mon', current: 45000, previous: 38000 },
    { date: 'Tue', current: 52000, previous: 42000 },
    { date: 'Wed', current: 48000, previous: 45000 },
    { date: 'Thu', current: 61000, previous: 50000 },
    { date: 'Fri', current: 55000, previous: 48000 },
    { date: 'Sat', current: 67000, previous: 58000 },
    { date: 'Sun', current: 58000, previous: 52000 }
  ];

  const userBehavior = [
    { page: 'Projects', views: 3500, avgTime: '3:45' },
    { page: 'Home', views: 2800, avgTime: '2:30' },
    { page: 'Payments', views: 1200, avgTime: '5:20' },
    { page: 'Enquiries', views: 980, avgTime: '4:10' },
    { page: 'Support', views: 650, avgTime: '6:30' }
  ];

  const conversionMetrics = [
    { metric: 'Visitor to Lead', value: 35, benchmark: 30 },
    { metric: 'Lead to Opportunity', value: 45, benchmark: 40 },
    { metric: 'Opportunity to Customer', value: 25, benchmark: 20 },
    { metric: 'Customer Retention', value: 85, benchmark: 80 },
    { metric: 'Referral Rate', value: 15, benchmark: 10 }
  ];

  const geographicData = [
    { city: 'Bangalore', users: 450, revenue: 12500000 },
    { city: 'Mumbai', users: 380, revenue: 10200000 },
    { city: 'Delhi', users: 320, revenue: 8500000 },
    { city: 'Chennai', users: 280, revenue: 7300000 },
    { city: 'Hyderabad', users: 250, revenue: 6800000 }
  ];

  const deviceAnalytics = [
    { device: 'Desktop', users: 45, sessions: 12000 },
    { device: 'Mobile', users: 40, sessions: 10500 },
    { device: 'Tablet', users: 15, sessions: 3500 }
  ];

  const performanceData = {
    acquisition: [
      { source: 'Organic Search', value: 35 },
      { source: 'Direct', value: 25 },
      { source: 'Social Media', value: 20 },
      { source: 'Referral', value: 12 },
      { source: 'Email', value: 8 }
    ],
    engagement: [
      { metric: 'Avg Session Duration', value: 85 },
      { metric: 'Pages per Session', value: 72 },
      { metric: 'Bounce Rate', value: 25 },
      { metric: 'Return Visitor Rate', value: 60 }
    ]
  };

  const radarData = [
    { subject: 'Sales', A: 120, B: 110, fullMark: 150 },
    { subject: 'Marketing', A: 98, B: 130, fullMark: 150 },
    { subject: 'Development', A: 86, B: 90, fullMark: 150 },
    { subject: 'Customer Support', A: 99, B: 100, fullMark: 150 },
    { subject: 'Administration', A: 85, B: 85, fullMark: 150 },
    { subject: 'User Experience', A: 65, B: 85, fullMark: 150 }
  ];

  const heatmapData = [
    { hour: '00', Mon: 20, Tue: 15, Wed: 18, Thu: 22, Fri: 25, Sat: 30, Sun: 28 },
    { hour: '06', Mon: 45, Tue: 42, Wed: 40, Thu: 48, Fri: 50, Sat: 35, Sun: 32 },
    { hour: '12', Mon: 88, Tue: 85, Wed: 82, Thu: 90, Fri: 92, Sat: 78, Sun: 75 },
    { hour: '18', Mon: 72, Tue: 70, Wed: 68, Thu: 75, Fri: 78, Sat: 85, Sun: 82 },
    { hour: '23', Mon: 35, Tue: 32, Wed: 30, Thu: 38, Fri: 45, Sat: 55, Sun: 50 }
  ];

  const handleExport = (format) => {
    toast.success(`Exporting analytics in ${format} format...`);
  };

  const renderChart = () => {
    switch (viewType) {
      case 'bar':
        return (
          <BarChart data={revenueAnalytics}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <ChartTooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="current" fill={theme.palette.primary.main} name="Current Period" />
            {compareMode && (
              <Bar dataKey="previous" fill={alpha(theme.palette.primary.main, 0.4)} name="Previous Period" />
            )}
          </BarChart>
        );
      case 'area':
        return (
          <AreaChart data={revenueAnalytics}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <ChartTooltip content={<CustomTooltip />} />
            <Legend />
            <Area
              type="monotone"
              dataKey="current"
              stroke={theme.palette.primary.main}
              fill={alpha(theme.palette.primary.main, 0.3)}
              name="Current Period"
            />
            {compareMode && (
              <Area
                type="monotone"
                dataKey="previous"
                stroke={theme.palette.secondary.main}
                fill={alpha(theme.palette.secondary.main, 0.3)}
                name="Previous Period"
              />
            )}
          </AreaChart>
        );
      default:
        return (
          <LineChart data={revenueAnalytics}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <ChartTooltip content={<CustomTooltip />} />
            <Legend />
            <Line
              type="monotone"
              dataKey="current"
              stroke={theme.palette.primary.main}
              strokeWidth={2}
              name="Current Period"
            />
            {compareMode && (
              <Line
                type="monotone"
                dataKey="previous"
                stroke={theme.palette.secondary.main}
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Previous Period"
              />
            )}
          </LineChart>
        );
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Analytics Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Deep insights into your platform performance
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <Select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <MenuItem value="24h">Last 24 Hours</MenuItem>
              <MenuItem value="7d">Last 7 Days</MenuItem>
              <MenuItem value="30d">Last 30 Days</MenuItem>
              <MenuItem value="90d">Last 90 Days</MenuItem>
              <MenuItem value="1y">Last Year</MenuItem>
            </Select>
          </FormControl>
          
          <Button
            variant={compareMode ? 'contained' : 'outlined'}
            startIcon={<CompareArrows />}
            onClick={() => setCompareMode(!compareMode)}
          >
            Compare
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={() => handleExport('PDF')}
          >
            Export
          </Button>
        </Box>
      </Box>

      {/* Quick Metrics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Total Revenue"
            value="₹38.6M"
            change={12.5}
            icon={<ShowChart />}
            color="success"
            chart={
              <LineChart data={revenueAnalytics}>
                <Line
                  type="monotone"
                  dataKey="current"
                  stroke={theme.palette.success.main}
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            }
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Conversion Rate"
            value="24.8%"
            change={-3.2}
            icon={<TrendingUp />}
            color="primary"
            chart={
              <AreaChart data={revenueAnalytics}>
                <Area
                  type="monotone"
                  dataKey="current"
                  stroke={theme.palette.primary.main}
                  fill={alpha(theme.palette.primary.main, 0.3)}
                />
              </AreaChart>
            }
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Avg. Session Duration"
            value="4m 32s"
            change={8.7}
            icon={<AccessTime />}
            color="info"
            chart={
              <BarChart data={revenueAnalytics}>
                <Bar dataKey="current" fill={theme.palette.info.main} />
              </BarChart>
            }
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Bounce Rate"
            value="32.4%"
            change={-5.3}
            icon={<Speed />}
            color="warning"
            chart={
              <LineChart data={revenueAnalytics}>
                <Line
                  type="monotone"
                  dataKey="previous"
                  stroke={theme.palette.warning.main}
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            }
          />
        </Grid>
      </Grid>

      {/* Main Chart */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Revenue & Performance Trends</Typography>
          
          <ButtonGroup size="small">
            <Button
              variant={viewType === 'line' ? 'contained' : 'outlined'}
              onClick={() => setViewType('line')}
            >
              <Timeline />
            </Button>
            <Button
              variant={viewType === 'bar' ? 'contained' : 'outlined'}
              onClick={() => setViewType('bar')}
            >
              <BarChartIcon />
            </Button>
            <Button
              variant={viewType === 'area' ? 'contained' : 'outlined'}
              onClick={() => setViewType('area')}
            >
              <ShowChart />
            </Button>
          </ButtonGroup>
        </Box>
        
        <ResponsiveContainer width="100%" height={400}>
          {renderChart()}
        </ResponsiveContainer>
      </Paper>

      {/* Secondary Charts */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* User Behavior Table */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              User Behavior
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Page</TableCell>
                    <TableCell align="right">Views</TableCell>
                    <TableCell align="right">Avg. Time</TableCell>
                    <TableCell align="right">Trend</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {userBehavior.map((row) => (
                    <TableRow key={row.page}>
                      <TableCell>{row.page}</TableCell>
                      <TableCell align="right">{row.views.toLocaleString()}</TableCell>
                      <TableCell align="right">{row.avgTime}</TableCell>
                      <TableCell align="right">
                        <TrendingUp sx={{ fontSize: 16, color: 'success.main' }} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Geographic Distribution */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Geographic Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={geographicData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="city" type="category" />
                <ChartTooltip content={<CustomTooltip />} />
                <Bar dataKey="users" fill={theme.palette.primary.main} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Conversion Funnel & Device Analytics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Conversion Metrics vs Benchmark
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={conversionMetrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="metric" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <ChartTooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="value" fill={theme.palette.primary.main} name="Your Performance" />
                <Line
                  type="monotone"
                  dataKey="benchmark"
                  stroke={theme.palette.error.main}
                  strokeWidth={2}
                  name="Industry Benchmark"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Device Analytics
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={deviceAnalytics}
                  dataKey="users"
                  nameKey="device"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {deviceAnalytics.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={[
                        theme.palette.primary.main,
                        theme.palette.secondary.main,
                        theme.palette.warning.main
                      ][index]}
                    />
                  ))}
                </Pie>
                <ChartTooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Department Performance Radar */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Department Performance
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" />
                <PolarRadiusAxis angle={90} domain={[0, 150]} />
                <Radar
                  name="Current"
                  dataKey="A"
                  stroke={theme.palette.primary.main}
                  fill={theme.palette.primary.main}
                  fillOpacity={0.6}
                />
                <Radar
                  name="Previous"
                  dataKey="B"
                  stroke={theme.palette.secondary.main}
                  fill={theme.palette.secondary.main}
                  fillOpacity={0.6}
                />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Traffic Sources */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Traffic Sources
            </Typography>
            <Box sx={{ mt: 2 }}>
              {performanceData.acquisition.map((source) => (
                <Box key={source.source} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2">{source.source}</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {source.value}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={source.value}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 4,
                        bgcolor: theme.palette.primary.main
                      }
                    }}
                  />
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Activity Heatmap */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          User Activity Heatmap
        </Typography>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={heatmapData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="hour" />
            <YAxis />
            <ChartTooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="Mon" stackId="a" fill="#ffd700" />
            <Bar dataKey="Tue" stackId="a" fill="#ffa500" />
            <Bar dataKey="Wed" stackId="a" fill="#ff8c00" />
            <Bar dataKey="Thu" stackId="a" fill="#ff6347" />
            <Bar dataKey="Fri" stackId="a" fill="#ff4500" />
            <Bar dataKey="Sat" stackId="a" fill="#dc143c" />
            <Bar dataKey="Sun" stackId="a" fill="#b22222" />
          </BarChart>
        </ResponsiveContainer>
      </Paper>
    </Box>
  );
};

export default Analytics;
