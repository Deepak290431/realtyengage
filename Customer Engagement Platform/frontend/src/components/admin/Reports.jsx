import React, { useState, useRef } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  ButtonGroup,
  Card,
  CardContent,
  CardActions,
  TextField,
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
  TablePagination,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Checkbox,
  Switch,
  FormControlLabel,
  Stepper,
  Step,
  StepLabel,
  Alert,
  CircularProgress,
  LinearProgress,
  Tooltip,
  Divider,
  useTheme,
  alpha
} from '@mui/material';
import {
  Description,
  PictureAsPdf,
  TableChart,
  Download,
  Email,
  Schedule,
  Print,
  Share,
  FilterList,
  DateRange,
  Assessment,
  TrendingUp,
  AttachMoney,
  People,
  Home,
  Assignment,
  Support,
  Payment,
  Timeline,
  BarChart,
  DonutLarge,
  CloudDownload,
  Send,
  Save,
  Edit,
  Delete,
  Visibility,
  CheckCircle,
  Error,
  Warning,
  Info
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, subDays, startOfMonth, endOfMonth, startOfYear } from 'date-fns';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';
import toast from 'react-hot-toast';

// Report Template Card
const ReportCard = ({ report, onGenerate, onSchedule, onEdit }) => {
  const getIconByType = (type) => {
    switch (type) {
      case 'revenue':
        return <AttachMoney />;
      case 'projects':
        return <Home />;
      case 'customers':
        return <People />;
      case 'enquiries':
        return <Assignment />;
      case 'support':
        return <Support />;
      case 'payments':
        return <Payment />;
      default:
        return <Assessment />;
    }
  };

  const getColorByStatus = (status) => {
    switch (status) {
      case 'ready':
        return 'success';
      case 'scheduled':
        return 'info';
      case 'processing':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flex: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {getIconByType(report.type)}
            <Typography variant="h6">
              {report.name}
            </Typography>
          </Box>
          <Chip
            label={report.status}
            size="small"
            color={getColorByStatus(report.status)}
          />
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {report.description}
        </Typography>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          <Chip
            icon={<DateRange />}
            label={report.frequency}
            size="small"
            variant="outlined"
          />
          <Chip
            icon={<Description />}
            label={report.format}
            size="small"
            variant="outlined"
          />
          {report.lastGenerated && (
            <Chip
              icon={<Schedule />}
              label={`Last: ${format(new Date(report.lastGenerated), 'MMM dd')}`}
              size="small"
              variant="outlined"
            />
          )}
        </Box>

        {report.schedule && (
          <Alert severity="info" icon={<Schedule />} sx={{ py: 0.5 }}>
            Scheduled: {report.schedule}
          </Alert>
        )}
      </CardContent>

      <CardActions>
        <Button
          size="small"
          startIcon={<Download />}
          onClick={() => onGenerate(report)}
        >
          Generate
        </Button>
        <Button
          size="small"
          startIcon={<Schedule />}
          onClick={() => onSchedule(report)}
        >
          Schedule
        </Button>
        <IconButton size="small" onClick={() => onEdit(report)}>
          <Edit />
        </IconButton>
      </CardActions>
    </Card>
  );
};

// Report Builder Dialog
const ReportBuilder = ({ open, onClose, onSave, report = null }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [reportConfig, setReportConfig] = useState({
    name: report?.name || '',
    type: report?.type || 'revenue',
    description: report?.description || '',
    dateRange: report?.dateRange || 'last30days',
    customStartDate: null,
    customEndDate: null,
    format: report?.format || 'PDF',
    includeCharts: report?.includeCharts || true,
    includeSummary: report?.includeSummary || true,
    metrics: report?.metrics || [],
    filters: report?.filters || {},
    schedule: report?.schedule || 'none',
    recipients: report?.recipients || []
  });

  const steps = ['Basic Info', 'Data Selection', 'Formatting', 'Schedule & Share'];

  const availableMetrics = {
    revenue: ['Total Revenue', 'Average Transaction', 'Payment Success Rate', 'Revenue by Project'],
    projects: ['Total Projects', 'Active Projects', 'Completion Rate', 'Projects by Status'],
    customers: ['Total Customers', 'New Registrations', 'Active Users', 'Customer Demographics'],
    enquiries: ['Total Enquiries', 'Conversion Rate', 'Response Time', 'Enquiries by Status'],
    support: ['Open Tickets', 'Resolution Time', 'Customer Satisfaction', 'Tickets by Priority'],
    payments: ['Total Transactions', 'Payment Methods', 'Failed Payments', 'Revenue Trend']
  };

  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleSave = () => {
    onSave(reportConfig);
    onClose();
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <TextField
              fullWidth
              label="Report Name"
              value={reportConfig.name}
              onChange={(e) => setReportConfig({ ...reportConfig, name: e.target.value })}
              sx={{ mb: 2 }}
            />

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Report Type</InputLabel>
              <Select
                value={reportConfig.type}
                label="Report Type"
                onChange={(e) => setReportConfig({ ...reportConfig, type: e.target.value })}
              >
                <MenuItem value="revenue">Revenue Report</MenuItem>
                <MenuItem value="projects">Projects Report</MenuItem>
                <MenuItem value="customers">Customers Report</MenuItem>
                <MenuItem value="enquiries">Enquiries Report</MenuItem>
                <MenuItem value="support">Support Report</MenuItem>
                <MenuItem value="payments">Payments Report</MenuItem>
                <MenuItem value="custom">Custom Report</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Description"
              multiline
              rows={3}
              value={reportConfig.description}
              onChange={(e) => setReportConfig({ ...reportConfig, description: e.target.value })}
            />
          </Box>
        );

      case 1:
        return (
          <Box>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Date Range</InputLabel>
              <Select
                value={reportConfig.dateRange}
                label="Date Range"
                onChange={(e) => setReportConfig({ ...reportConfig, dateRange: e.target.value })}
              >
                <MenuItem value="today">Today</MenuItem>
                <MenuItem value="yesterday">Yesterday</MenuItem>
                <MenuItem value="last7days">Last 7 Days</MenuItem>
                <MenuItem value="last30days">Last 30 Days</MenuItem>
                <MenuItem value="thisMonth">This Month</MenuItem>
                <MenuItem value="lastMonth">Last Month</MenuItem>
                <MenuItem value="thisYear">This Year</MenuItem>
                <MenuItem value="custom">Custom Range</MenuItem>
              </Select>
            </FormControl>

            {reportConfig.dateRange === 'custom' && (
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <DatePicker
                    label="Start Date"
                    value={reportConfig.customStartDate}
                    onChange={(date) => setReportConfig({ ...reportConfig, customStartDate: date })}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                  <DatePicker
                    label="End Date"
                    value={reportConfig.customEndDate}
                    onChange={(date) => setReportConfig({ ...reportConfig, customEndDate: date })}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </Box>
              </LocalizationProvider>
            )}

            <Typography variant="subtitle2" gutterBottom>
              Select Metrics to Include:
            </Typography>
            <List dense>
              {availableMetrics[reportConfig.type]?.map((metric) => (
                <ListItem key={metric}>
                  <ListItemIcon>
                    <Checkbox
                      edge="start"
                      checked={reportConfig.metrics.includes(metric)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setReportConfig({
                            ...reportConfig,
                            metrics: [...reportConfig.metrics, metric]
                          });
                        } else {
                          setReportConfig({
                            ...reportConfig,
                            metrics: reportConfig.metrics.filter(m => m !== metric)
                          });
                        }
                      }}
                    />
                  </ListItemIcon>
                  <ListItemText primary={metric} />
                </ListItem>
              ))}
            </List>
          </Box>
        );

      case 2:
        return (
          <Box>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Export Format</InputLabel>
              <Select
                value={reportConfig.format}
                label="Export Format"
                onChange={(e) => setReportConfig({ ...reportConfig, format: e.target.value })}
              >
                <MenuItem value="PDF">PDF</MenuItem>
                <MenuItem value="Excel">Excel</MenuItem>
                <MenuItem value="CSV">CSV</MenuItem>
                <MenuItem value="JSON">JSON</MenuItem>
              </Select>
            </FormControl>

            <FormControlLabel
              control={
                <Switch
                  checked={reportConfig.includeCharts}
                  onChange={(e) => setReportConfig({ ...reportConfig, includeCharts: e.target.checked })}
                />
              }
              label="Include Charts & Visualizations"
              sx={{ mb: 2 }}
            />

            <FormControlLabel
              control={
                <Switch
                  checked={reportConfig.includeSummary}
                  onChange={(e) => setReportConfig({ ...reportConfig, includeSummary: e.target.checked })}
                />
              }
              label="Include Executive Summary"
              sx={{ mb: 2 }}
            />
          </Box>
        );

      case 3:
        return (
          <Box>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Schedule Frequency</InputLabel>
              <Select
                value={reportConfig.schedule}
                label="Schedule Frequency"
                onChange={(e) => setReportConfig({ ...reportConfig, schedule: e.target.value })}
              >
                <MenuItem value="none">No Schedule</MenuItem>
                <MenuItem value="daily">Daily</MenuItem>
                <MenuItem value="weekly">Weekly</MenuItem>
                <MenuItem value="monthly">Monthly</MenuItem>
                <MenuItem value="quarterly">Quarterly</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Email Recipients"
              placeholder="Enter email addresses separated by commas"
              value={reportConfig.recipients.join(', ')}
              onChange={(e) => setReportConfig({
                ...reportConfig,
                recipients: e.target.value.split(',').map(email => email.trim()).filter(Boolean)
              })}
              helperText="Reports will be automatically sent to these email addresses"
            />
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {report ? 'Edit Report' : 'Create New Report'}
      </DialogTitle>

      <DialogContent>
        <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {renderStepContent(activeStep)}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          disabled={activeStep === 0}
          onClick={handleBack}
        >
          Back
        </Button>
        {activeStep === steps.length - 1 ? (
          <Button variant="contained" onClick={handleSave}>
            Save Report
          </Button>
        ) : (
          <Button variant="contained" onClick={handleNext}>
            Next
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

const Reports = () => {
  const theme = useTheme();
  const [selectedTab, setSelectedTab] = useState('templates');
  const [builderOpen, setBuilderOpen] = useState(false);
  const [editingReport, setEditingReport] = useState(null);
  const [generatingReport, setGeneratingReport] = useState(null);
  const reportRef = useRef(null);

  // Sample report templates
  const reportTemplates = [
    {
      id: 1,
      name: 'Monthly Revenue Report',
      type: 'revenue',
      description: 'Comprehensive revenue analysis with trends and projections',
      frequency: 'Monthly',
      format: 'PDF',
      status: 'ready',
      lastGenerated: subDays(new Date(), 5),
      schedule: 'First Monday of each month'
    },
    {
      id: 2,
      name: 'Project Performance Dashboard',
      type: 'projects',
      description: 'Overview of all projects with completion rates and timelines',
      frequency: 'Weekly',
      format: 'Excel',
      status: 'scheduled',
      lastGenerated: subDays(new Date(), 2)
    },
    {
      id: 3,
      name: 'Customer Analytics Report',
      type: 'customers',
      description: 'Customer demographics, behavior, and engagement metrics',
      frequency: 'Monthly',
      format: 'PDF',
      status: 'ready',
      lastGenerated: subDays(new Date(), 10)
    },
    {
      id: 4,
      name: 'Enquiry Conversion Analysis',
      type: 'enquiries',
      description: 'Detailed analysis of enquiry sources and conversion rates',
      frequency: 'Bi-weekly',
      format: 'CSV',
      status: 'processing',
      lastGenerated: subDays(new Date(), 1)
    },
    {
      id: 5,
      name: 'Support Ticket Summary',
      type: 'support',
      description: 'Support performance metrics and customer satisfaction scores',
      frequency: 'Weekly',
      format: 'PDF',
      status: 'ready',
      lastGenerated: subDays(new Date(), 7)
    },
    {
      id: 6,
      name: 'Payment Transaction Log',
      type: 'payments',
      description: 'Complete payment history with success rates and methods',
      frequency: 'Daily',
      format: 'Excel',
      status: 'scheduled',
      lastGenerated: new Date(),
      schedule: 'Daily at 6:00 AM'
    }
  ];

  // Sample generated reports history
  const reportHistory = [
    {
      id: 1,
      name: 'Monthly Revenue Report - June 2024',
      generatedAt: subDays(new Date(), 1),
      generatedBy: 'Admin User',
      size: '2.4 MB',
      format: 'PDF',
      status: 'completed'
    },
    {
      id: 2,
      name: 'Customer Analytics - Q2 2024',
      generatedAt: subDays(new Date(), 3),
      generatedBy: 'System',
      size: '1.8 MB',
      format: 'Excel',
      status: 'completed'
    },
    {
      id: 3,
      name: 'Project Status Report - Week 25',
      generatedAt: subDays(new Date(), 5),
      generatedBy: 'Admin User',
      size: '856 KB',
      format: 'CSV',
      status: 'completed'
    }
  ];

  const generatePDF = async (report) => {
    setGeneratingReport(report.id);

    try {
      const pdf = new jsPDF();

      // Add title
      pdf.setFontSize(20);
      pdf.text(report.name, 20, 20);

      // Add metadata
      pdf.setFontSize(12);
      pdf.text(`Generated: ${format(new Date(), 'PPP')}`, 20, 35);
      pdf.text(`Period: Last 30 days`, 20, 45);

      // Add content based on report type
      pdf.setFontSize(14);
      pdf.text('Executive Summary', 20, 60);

      pdf.setFontSize(10);
      const summaryText = `This ${report.type} report provides comprehensive insights into platform performance.
      Key metrics show positive trends with overall growth of 15% compared to the previous period.`;

      const lines = pdf.splitTextToSize(summaryText, 170);
      pdf.text(lines, 20, 70);

      // Add table data
      if (report.type === 'revenue') {
        pdf.autoTable({
          startY: 100,
          head: [['Date', 'Revenue', 'Transactions', 'Avg. Value']],
          body: [
            ['2024-06-01', '₹2,50,000', '12', '₹20,833'],
            ['2024-06-02', '₹3,20,000', '15', '₹21,333'],
            ['2024-06-03', '₹1,80,000', '8', '₹22,500'],
            ['2024-06-04', '₹4,10,000', '18', '₹22,778'],
            ['2024-06-05', '₹2,90,000', '14', '₹20,714']
          ]
        });
      }

      // Save the PDF
      pdf.save(`${report.name.replace(/ /g, '_')}_${format(new Date(), 'yyyy-MM-dd')}.pdf`);

      toast.success('Report generated successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate report');
    } finally {
      setGeneratingReport(null);
    }
  };

  const generateExcel = async (report) => {
    setGeneratingReport(report.id);

    try {
      // Create workbook
      const wb = XLSX.utils.book_new();

      // Create worksheet data
      const wsData = [
        [report.name],
        [`Generated: ${format(new Date(), 'PPP')}`],
        [],
        ['Metric', 'Value', 'Change', 'Status']
      ];

      // Add sample data based on report type
      if (report.type === 'revenue') {
        wsData.push(
          ['Total Revenue', '₹38,60,000', '+12.5%', 'Good'],
          ['Transactions', '245', '+8.3%', 'Good'],
          ['Avg. Transaction', '₹15,755', '+3.8%', 'Good'],
          ['Payment Success Rate', '96.8%', '+1.2%', 'Excellent']
        );
      } else if (report.type === 'customers') {
        wsData.push(
          ['Total Customers', '1,234', '+15.2%', 'Excellent'],
          ['New Registrations', '89', '+22.5%', 'Excellent'],
          ['Active Users', '456', '+10.3%', 'Good'],
          ['Retention Rate', '78.5%', '-2.1%', 'Warning']
        );
      }

      // Create worksheet
      const ws = XLSX.utils.aoa_to_sheet(wsData);

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Report');

      // Save the file
      XLSX.writeFile(wb, `${report.name.replace(/ /g, '_')}_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);

      toast.success('Excel report generated successfully!');
    } catch (error) {
      console.error('Error generating Excel:', error);
      toast.error('Failed to generate Excel report');
    } finally {
      setGeneratingReport(null);
    }
  };

  const handleGenerateReport = (report) => {
    if (report.format === 'PDF') {
      generatePDF(report);
    } else if (report.format === 'Excel') {
      generateExcel(report);
    } else {
      toast(`Generating ${report.format} report...`);
    }
  };

  const handleScheduleReport = (report) => {
    toast.success(`Scheduling ${report.name}...`);
  };

  const handleEditReport = (report) => {
    setEditingReport(report);
    setBuilderOpen(true);
  };

  const handleSaveReport = (reportConfig) => {
    toast.success('Report configuration saved!');
    setEditingReport(null);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Reports & Export
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Generate, schedule, and export comprehensive reports
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<Assessment />}
            onClick={() => {
              setEditingReport(null);
              setBuilderOpen(true);
            }}
          >
            Create Report
          </Button>
        </Box>
      </Box>

      {/* Tab Navigation */}
      <Paper sx={{ mb: 3 }}>
        <ButtonGroup variant="text" fullWidth>
          <Button
            onClick={() => setSelectedTab('templates')}
            sx={{
              borderBottom: selectedTab === 'templates' ? `2px solid ${theme.palette.primary.main}` : 'none'
            }}
          >
            Report Templates
          </Button>
          <Button
            onClick={() => setSelectedTab('scheduled')}
            sx={{
              borderBottom: selectedTab === 'scheduled' ? `2px solid ${theme.palette.primary.main}` : 'none'
            }}
          >
            Scheduled Reports
          </Button>
          <Button
            onClick={() => setSelectedTab('history')}
            sx={{
              borderBottom: selectedTab === 'history' ? `2px solid ${theme.palette.primary.main}` : 'none'
            }}
          >
            Report History
          </Button>
        </ButtonGroup>
      </Paper>

      {/* Content based on selected tab */}
      {selectedTab === 'templates' && (
        <Grid container spacing={3}>
          {reportTemplates.map((report) => (
            <Grid item xs={12} sm={6} md={4} key={report.id}>
              <ReportCard
                report={report}
                onGenerate={handleGenerateReport}
                onSchedule={handleScheduleReport}
                onEdit={handleEditReport}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {selectedTab === 'scheduled' && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Report Name</TableCell>
                <TableCell>Schedule</TableCell>
                <TableCell>Next Run</TableCell>
                <TableCell>Recipients</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reportTemplates
                .filter(r => r.schedule)
                .map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Assessment />
                        {report.name}
                      </Box>
                    </TableCell>
                    <TableCell>{report.schedule}</TableCell>
                    <TableCell>
                      {format(new Date(Date.now() + 86400000), 'MMM dd, yyyy HH:mm')}
                    </TableCell>
                    <TableCell>
                      <AvatarGroup max={3}>
                        <Avatar sx={{ width: 24, height: 24 }}>A</Avatar>
                        <Avatar sx={{ width: 24, height: 24 }}>B</Avatar>
                        <Avatar sx={{ width: 24, height: 24 }}>+2</Avatar>
                      </AvatarGroup>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label="Active"
                        size="small"
                        color="success"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton size="small">
                        <Edit />
                      </IconButton>
                      <IconButton size="small">
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {selectedTab === 'history' && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Report Name</TableCell>
                <TableCell>Generated At</TableCell>
                <TableCell>Generated By</TableCell>
                <TableCell>Size</TableCell>
                <TableCell>Format</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reportHistory.map((report) => (
                <TableRow key={report.id}>
                  <TableCell>{report.name}</TableCell>
                  <TableCell>
                    {format(report.generatedAt, 'MMM dd, yyyy HH:mm')}
                  </TableCell>
                  <TableCell>{report.generatedBy}</TableCell>
                  <TableCell>{report.size}</TableCell>
                  <TableCell>
                    <Chip
                      label={report.format}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton size="small">
                      <Download />
                    </IconButton>
                    <IconButton size="small">
                      <Email />
                    </IconButton>
                    <IconButton size="small">
                      <Visibility />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Report Builder Dialog */}
      <ReportBuilder
        open={builderOpen}
        onClose={() => {
          setBuilderOpen(false);
          setEditingReport(null);
        }}
        onSave={handleSaveReport}
        report={editingReport}
      />
    </Box>
  );
};

export default Reports;
