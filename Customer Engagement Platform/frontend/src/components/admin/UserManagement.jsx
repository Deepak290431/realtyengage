import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Avatar,
  Chip,
  IconButton,
  Button,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  Switch,
  FormControlLabel,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Tooltip,
  Badge,
  Alert,
  Divider,
  useTheme,
  alpha
} from '@mui/material';
import {
  Search,
  FilterList,
  MoreVert,
  Edit,
  Delete,
  Block,
  CheckCircle,
  PersonAdd,
  Download,
  Email,
  Phone,
  LocationOn,
  CalendarToday,
  Assignment,
  Payment,
  Support,
  Security,
  VpnKey,
  Visibility,
  VisibilityOff,
  AdminPanelSettings,
  Person,
  Groups,
  TrendingUp,
  Warning
} from '@mui/icons-material';
import { format, formatDistanceToNow } from 'date-fns';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import userService from '../../services/userService';

// User Status Badge
const UserStatusBadge = ({ status }) => {
  const getColor = () => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'default';
      case 'suspended':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getIcon = () => {
    switch (status) {
      case 'active':
        return <CheckCircle sx={{ fontSize: 12 }} />;
      case 'suspended':
        return <Block sx={{ fontSize: 12 }} />;
      case 'pending':
        return <Warning sx={{ fontSize: 12 }} />;
      default:
        return null;
    }
  };

  return (
    <Chip
      label={status}
      size="small"
      color={getColor()}
      icon={getIcon()}
    />
  );
};

// User Details Dialog
const UserDetailsDialog = ({ open, onClose, user, onUpdate }) => {
  const [editMode, setEditMode] = useState(false);
  const [userData, setUserData] = useState(user || {});
  const [showPassword, setShowPassword] = useState(false);

  const handleSave = () => {
    onUpdate(userData);
    setEditMode(false);
    toast.success('User updated successfully');
  };

  if (!user) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">User Details</Typography>
          <Box>
            {!editMode ? (
              <Button startIcon={<Edit />} onClick={() => setEditMode(true)}>
                Edit
              </Button>
            ) : (
              <>
                <Button onClick={() => setEditMode(false)}>Cancel</Button>
                <Button variant="contained" onClick={handleSave} sx={{ ml: 1 }}>
                  Save
                </Button>
              </>
            )}
          </Box>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Grid container spacing={3}>
          {/* Profile Section */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Avatar
                  sx={{
                    width: 100,
                    height: 100,
                    mx: 'auto',
                    mb: 2,
                    bgcolor: 'primary.main',
                    fontSize: '2rem'
                  }}
                >
                  {user.firstName?.[0]}{user.lastName?.[0]}
                </Avatar>
                
                <Typography variant="h6">
                  {user.firstName} {user.lastName}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {user.email}
                </Typography>
                
                <UserStatusBadge status={user.status} />
                
                <Divider sx={{ my: 2 }} />
                
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <AdminPanelSettings />
                    </ListItemIcon>
                    <ListItemText
                      primary="Role"
                      secondary={
                        editMode ? (
                          <Select
                            size="small"
                            value={userData.role}
                            onChange={(e) => setUserData({ ...userData, role: e.target.value })}
                            fullWidth
                          >
                            <MenuItem value="admin">Admin</MenuItem>
                            <MenuItem value="customer">Customer</MenuItem>
                            <MenuItem value="agent">Agent</MenuItem>
                          </Select>
                        ) : (
                          user.role
                        )
                      }
                    />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon>
                      <CalendarToday />
                    </ListItemIcon>
                    <ListItemText
                      primary="Joined"
                      secondary={format(new Date(user.createdAt), 'PPP')}
                    />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon>
                      <Security />
                    </ListItemIcon>
                    <ListItemText
                      primary="Last Login"
                      secondary={formatDistanceToNow(new Date(user.lastLogin), { addSuffix: true })}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Details Section */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Personal Information
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="First Name"
                      value={userData.firstName}
                      onChange={(e) => setUserData({ ...userData, firstName: e.target.value })}
                      disabled={!editMode}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Last Name"
                      value={userData.lastName}
                      onChange={(e) => setUserData({ ...userData, lastName: e.target.value })}
                      disabled={!editMode}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Email"
                      value={userData.email}
                      onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                      disabled={!editMode}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Phone"
                      value={userData.phone || ''}
                      onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
                      disabled={!editMode}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Location"
                      value={userData.location || ''}
                      onChange={(e) => setUserData({ ...userData, location: e.target.value })}
                      disabled={!editMode}
                      size="small"
                    />
                  </Grid>
                </Grid>

                <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                  Account Settings
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={userData.status}
                        label="Status"
                        onChange={(e) => setUserData({ ...userData, status: e.target.value })}
                        disabled={!editMode}
                      >
                        <MenuItem value="active">Active</MenuItem>
                        <MenuItem value="inactive">Inactive</MenuItem>
                        <MenuItem value="suspended">Suspended</MenuItem>
                        <MenuItem value="pending">Pending</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  {editMode && (
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="New Password"
                        type={showPassword ? 'text' : 'password'}
                        size="small"
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => setShowPassword(!showPassword)}
                                edge="end"
                              >
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          )
                        }}
                      />
                    </Grid>
                  )}
                  
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={userData.emailVerified}
                          onChange={(e) => setUserData({ ...userData, emailVerified: e.target.checked })}
                          disabled={!editMode}
                        />
                      }
                      label="Email Verified"
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={userData.twoFactorEnabled}
                          onChange={(e) => setUserData({ ...userData, twoFactorEnabled: e.target.checked })}
                          disabled={!editMode}
                        />
                      }
                      label="Two-Factor Authentication"
                    />
                  </Grid>
                </Grid>

                <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                  Activity Statistics
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={3}>
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'grey.50' }}>
                      <Assignment color="primary" />
                      <Typography variant="h6">12</Typography>
                      <Typography variant="caption">Enquiries</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'grey.50' }}>
                      <Payment color="success" />
                      <Typography variant="h6">5</Typography>
                      <Typography variant="caption">Payments</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'grey.50' }}>
                      <Support color="warning" />
                      <Typography variant="h6">3</Typography>
                      <Typography variant="caption">Tickets</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'grey.50' }}>
                      <TrendingUp color="info" />
                      <Typography variant="h6">89%</Typography>
                      <Typography variant="caption">Activity</Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

const UserManagement = () => {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [createUserOpen, setCreateUserOpen] = useState(false);

  // Sample user data
  const sampleUsers = [
    {
      _id: '1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      role: 'customer',
      status: 'active',
      phone: '+91 9876543210',
      location: 'Bangalore',
      createdAt: new Date('2024-01-15'),
      lastLogin: new Date('2024-06-20T10:30:00'),
      emailVerified: true,
      twoFactorEnabled: false
    },
    {
      _id: '2',
      firstName: 'Sarah',
      lastName: 'Smith',
      email: 'sarah.smith@example.com',
      role: 'admin',
      status: 'active',
      phone: '+91 9876543211',
      location: 'Mumbai',
      createdAt: new Date('2023-11-20'),
      lastLogin: new Date('2024-06-21T14:15:00'),
      emailVerified: true,
      twoFactorEnabled: true
    },
    {
      _id: '3',
      firstName: 'Mike',
      lastName: 'Johnson',
      email: 'mike.j@example.com',
      role: 'customer',
      status: 'suspended',
      phone: '+91 9876543212',
      location: 'Delhi',
      createdAt: new Date('2024-03-10'),
      lastLogin: new Date('2024-06-15T09:00:00'),
      emailVerified: false,
      twoFactorEnabled: false
    },
    {
      _id: '4',
      firstName: 'Emily',
      lastName: 'Brown',
      email: 'emily.brown@example.com',
      role: 'agent',
      status: 'active',
      phone: '+91 9876543213',
      location: 'Chennai',
      createdAt: new Date('2024-02-05'),
      lastLogin: new Date('2024-06-21T16:45:00'),
      emailVerified: true,
      twoFactorEnabled: false
    },
    {
      _id: '5',
      firstName: 'David',
      lastName: 'Wilson',
      email: 'david.w@example.com',
      role: 'customer',
      status: 'pending',
      phone: '+91 9876543214',
      location: 'Hyderabad',
      createdAt: new Date('2024-06-18'),
      lastLogin: new Date('2024-06-18T11:20:00'),
      emailVerified: false,
      twoFactorEnabled: false
    }
  ];

  // Filter users based on search and filters
  const filteredUsers = sampleUsers.filter((user) => {
    const matchesSearch = 
      user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleMenuOpen = (event, user) => {
    setAnchorEl(event.currentTarget);
    setSelectedUser(user);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedUser(null);
  };

  const handleViewDetails = () => {
    setDetailsOpen(true);
    handleMenuClose();
  };

  const handleUpdateUser = (updatedUser) => {
    // Update user logic
    toast.success('User updated successfully');
  };

  const handleDeleteUser = () => {
    toast.error('User deleted');
    handleMenuClose();
  };

  const handleSuspendUser = () => {
    toast.warning('User suspended');
    handleMenuClose();
  };

  const handleExportUsers = () => {
    toast.success('Exporting users to CSV...');
  };

  // Statistics
  const stats = {
    total: sampleUsers.length,
    active: sampleUsers.filter(u => u.status === 'active').length,
    suspended: sampleUsers.filter(u => u.status === 'suspended').length,
    newThisMonth: sampleUsers.filter(u => 
      u.createdAt >= startOfMonth(new Date())
    ).length
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            User Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage platform users, roles, and permissions
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={handleExportUsers}
          >
            Export
          </Button>
          <Button
            variant="contained"
            startIcon={<PersonAdd />}
            onClick={() => setCreateUserOpen(true)}
          >
            Add User
          </Button>
        </Box>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Total Users
                  </Typography>
                  <Typography variant="h4">
                    {stats.total}
                  </Typography>
                </Box>
                <Groups color="primary" sx={{ fontSize: 40, opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Active Users
                  </Typography>
                  <Typography variant="h4">
                    {stats.active}
                  </Typography>
                </Box>
                <CheckCircle color="success" sx={{ fontSize: 40, opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Suspended
                  </Typography>
                  <Typography variant="h4">
                    {stats.suspended}
                  </Typography>
                </Box>
                <Block color="error" sx={{ fontSize: 40, opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    New This Month
                  </Typography>
                  <Typography variant="h4">
                    {stats.newThisMonth}
                  </Typography>
                </Box>
                <TrendingUp color="info" sx={{ fontSize: 40, opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Role</InputLabel>
              <Select
                value={filterRole}
                label="Role"
                onChange={(e) => setFilterRole(e.target.value)}
              >
                <MenuItem value="all">All Roles</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="customer">Customer</MenuItem>
                <MenuItem value="agent">Agent</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={filterStatus}
                label="Status"
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
                <MenuItem value="suspended">Suspended</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<FilterList />}
              onClick={() => {
                setSearchQuery('');
                setFilterRole('all');
                setFilterStatus('all');
              }}
            >
              Clear
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Users Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Joined</TableCell>
              <TableCell>Last Active</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((user) => (
                <TableRow key={user._id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        {user.firstName[0]}{user.lastName[0]}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {user.firstName} {user.lastName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ID: {user._id}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Email sx={{ fontSize: 16, color: 'text.secondary' }} />
                      {user.email}
                      {user.emailVerified && (
                        <CheckCircle sx={{ fontSize: 14, color: 'success.main' }} />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.role}
                      size="small"
                      color={user.role === 'admin' ? 'primary' : 'default'}
                      variant={user.role === 'admin' ? 'filled' : 'outlined'}
                    />
                  </TableCell>
                  <TableCell>
                    <UserStatusBadge status={user.status} />
                  </TableCell>
                  <TableCell>
                    {format(user.createdAt, 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell>
                    {formatDistanceToNow(user.lastLogin, { addSuffix: true })}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, user)}
                    >
                      <MoreVert />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredUsers.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </TableContainer>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleViewDetails}>
          <ListItemIcon>
            <Visibility fontSize="small" />
          </ListItemIcon>
          View Details
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <Edit fontSize="small" />
          </ListItemIcon>
          Edit User
        </MenuItem>
        <MenuItem onClick={handleSuspendUser}>
          <ListItemIcon>
            <Block fontSize="small" />
          </ListItemIcon>
          Suspend User
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleDeleteUser} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <Delete fontSize="small" color="error" />
          </ListItemIcon>
          Delete User
        </MenuItem>
      </Menu>

      {/* User Details Dialog */}
      <UserDetailsDialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        user={selectedUser}
        onUpdate={handleUpdateUser}
      />
    </Box>
  );
};

export default UserManagement;
