import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users,
    Search,
    Filter,
    UserPlus,
    Mail,
    Phone,
    Calendar,
    MoreVertical,
    Shield,
    UserCheck,
    UserX,
    Edit,
    Trash2,
    ChevronRight,
    Download,
    AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import toast from 'react-hot-toast';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { userAPI } from '../../services/api';

const UserManagementPage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user: currentUser } = useSelector((state) => state.auth);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [selectedUser, setSelectedUser] = useState(null);

    // Add Staff Modal State
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [addFormData, setAddFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        role: 'admin'
    });

    // Edit User Modal State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editFormData, setEditFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        role: ''
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await userAPI.getUsers();
            setUsers(response.data?.data || response.data || response || []);
        } catch (error) {
            console.error('Failed to fetch users:', error);
            toast.error('Failed to load customers');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setAddFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleEditInputChange = (e) => {
        const { name, value } = e.target;
        setEditFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAddStaff = async (e) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            const response = await userAPI.createUser(addFormData);
            toast.success(response.data.message || 'Staff member added successfully');
            setIsAddModalOpen(false);
            setAddFormData({
                firstName: '',
                lastName: '',
                email: '',
                phone: '',
                password: '',
                role: 'admin'
            });
            fetchUsers();
        } catch (error) {
            console.error('Failed to add staff:', error);
            const message = error.response?.data?.message || 'Failed to add staff member';
            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditClick = (user) => {
        setSelectedUser(user);
        setEditFormData({
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone || '',
            role: user.role
        });
        setIsEditModalOpen(true);
    };

    const handleUpdateUser = async (e) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            const response = await userAPI.updateUser(selectedUser._id, editFormData);

            // Check if role was changed
            if (response.data.roleChanged) {
                // If the updated user is the current user, force logout
                const targetUserId = selectedUser._id || selectedUser.id;
                const currentUserId = currentUser?._id || currentUser?.id;

                if (targetUserId === currentUserId) {
                    toast.success('Your role has been updated. Logging out for security...', {
                        duration: 3000
                    });

                    setIsEditModalOpen(false);

                    // Delay logout to let toast show
                    setTimeout(() => {
                        dispatch(logout());
                        // Requirement: Redirect to proper application will happen after next login
                        window.location.href = '/login';
                    }, 2000);
                    return;
                }

                toast.success('User role updated. Their session has been invalidated.');
            } else {
                toast.success('User updated successfully');
            }

            setIsEditModalOpen(false);
            fetchUsers();
        } catch (error) {
            console.error('Failed to update user:', error);
            toast.error(error.response?.data?.message || 'Failed to update user');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleToggleStatus = async (user) => {
        try {
            const newStatus = user.isActive === false;
            await userAPI.updateUser(user._id, { isActive: newStatus });
            toast.success(`${user.firstName}'s account ${newStatus ? 'activated' : 'suspended'}.`);
            fetchUsers();
        } catch (error) {
            console.error('Failed to update user status:', error);
            toast.error('Failed to update user status');
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch =
            `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.phone?.includes(searchTerm);

        const matchesRole = roleFilter === 'all' || user.role === roleFilter;

        // Requirement: Remove Super Admin from staff management page list
        const isNotSuperAdmin = user.role !== 'super_admin';

        return matchesSearch && matchesRole && isNotSuperAdmin;
    });

    const getRoleBadge = (role) => {
        switch (role) {
            case 'admin': return 'bg-[#C9A24D]/10 text-[#C9A24D] border-[#C9A24D]/20';
            case 'super_admin': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'customer': return 'bg-blue-50 text-[#0B1F33] border-blue-100';
            case 'user': return 'bg-blue-50 text-blue-700 border-blue-100';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-12 text-left">
            {/* Header */}
            <div className="w-full px-4 md:px-6 py-8">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-[#0B1F33] dark:text-white flex items-center gap-3">
                            <Users className="h-8 w-8 text-[#0B1F33] dark:text-blue-400" />
                            User Management
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">
                            Manage user roles, monitor activity, and handle account statuses.
                        </p>
                    </div>
                    {currentUser?.role === 'super_admin' && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                        >
                            <Button
                                className="bg-[#0B1F33] hover:bg-[#0B1F33]/90 text-white font-bold shadow-lg h-12 px-6"
                                onClick={() => setIsAddModalOpen(true)}
                            >
                                <UserPlus className="mr-2 h-5 w-5" />
                                Add New Staff
                            </Button>
                        </motion.div>
                    )}
                </div>
            </div>

            <div className="w-full px-4">
                <div className="w-full space-y-6">
                    {/* Filters Card */}
                    <Card className="p-6 shadow-xl border-none backdrop-blur-md bg-white/90 dark:bg-gray-800/90">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                                <Input
                                    placeholder="Search by name, email or phone..."
                                    className="pl-10 h-12"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-2">
                                <select
                                    className="h-12 px-4 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-700 min-w-[150px]"
                                    value={roleFilter}
                                    onChange={(e) => setRoleFilter(e.target.value)}
                                >
                                    <option value="all">All Roles</option>
                                    <option value="admin">Admins</option>
                                    <option value="customer">Customers</option>
                                </select>
                                <Button variant="outline" className="h-12 border-gray-200">
                                    <Download className="h-4 w-4 mr-2" />
                                    Export
                                </Button>
                            </div>
                        </div>
                    </Card>

                    {/* Users List */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {loading ? (
                            Array(6).fill(0).map((_, i) => (
                                <Card key={i} className="p-6 animate-pulse">
                                    <div className="flex items-center space-x-4 mb-4">
                                        <div className="h-12 w-12 rounded-full bg-gray-200" />
                                        <div className="flex-1 space-y-2">
                                            <div className="h-4 w-3/4 bg-gray-200 rounded" />
                                            <div className="h-3 w-1/2 bg-gray-200 rounded" />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="h-3 w-full bg-gray-100 rounded" />
                                        <div className="h-3 w-full bg-gray-100 rounded" />
                                    </div>
                                </Card>
                            ))
                        ) : filteredUsers.length > 0 ? (
                            filteredUsers.map((user) => (
                                <motion.div
                                    key={user._id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    <Card className="overflow-hidden hover:shadow-2xl transition-all duration-300 border-none group relative">
                                        <div className={`h-2 w-full ${user.role === 'admin' ? 'bg-[#C9A24D]' : 'bg-[#0B1F33]'}`} />
                                        <div className="p-6">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex items-center gap-4">
                                                    <div className={`h-12 w-12 rounded-full flex items-center justify-center text-white font-bold text-xl ${user.role === 'admin' ? 'bg-[#C9A24D]' : 'bg-[#0B1F33]'}`}>
                                                        {user.firstName?.[0]}{user.lastName?.[0]}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-lg group-hover:text-[#0B1F33] transition-colors uppercase">
                                                            {user.firstName} {user.lastName}
                                                        </h3>
                                                        <Badge className={`${getRoleBadge(user.role)} pointer-events-none`}>
                                                            {user.role}
                                                        </Badge>
                                                    </div>
                                                </div>
                                                <Button variant="ghost" size="sm" className="rounded-full h-8 w-8 p-0">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </div>

                                            <div className="space-y-3 text-sm text-gray-500 dark:text-gray-400 mb-6">
                                                <div className="flex items-center gap-2">
                                                    <Mail className="h-4 w-4 shrink-0 text-[#0B1F33]" />
                                                    <span className="truncate">{user.email}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Phone className="h-4 w-4 shrink-0 text-[#0B1F33]" />
                                                    <span>{user.phone || 'No phone'}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-4 w-4 shrink-0 text-[#0B1F33]" />
                                                    <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>

                                            {currentUser?.role === 'super_admin' && (
                                                <div className="flex gap-2 pt-2 border-t dark:border-gray-700">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="flex-1 text-[#0B1F33] hover:text-[#0B1F33]/80 hover:bg-[#0B1F33]/5"
                                                        onClick={() => handleEditClick(user)}
                                                    >
                                                        <Edit className="h-4 w-4 mr-2" />
                                                        Edit
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                        onClick={() => handleToggleStatus(user)}
                                                    >
                                                        {user.isActive === false ? (
                                                            <><UserCheck className="h-4 w-4 mr-2" /> Activate</>
                                                        ) : (
                                                            <><UserX className="h-4 w-4 mr-2" /> Suspend</>
                                                        )}
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                        {user.isActive === false && (
                                            <div className="absolute top-0 right-0 p-2">
                                                <Badge variant="destructive" className="text-[10px]">Suspended</Badge>
                                            </div>
                                        )}
                                    </Card>
                                </motion.div>
                            ))
                        ) : (
                            <div className="col-span-full py-20 text-center">
                                <div className="bg-gray-100 dark:bg-gray-800 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
                                    <AlertCircle className="h-8 w-8 text-gray-400" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">No users found</h3>
                                <p className="text-gray-500">Try adjusting your filters or search terms.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Add Staff Modal */}
            <AnimatePresence>
                {isAddModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden text-left"
                        >
                            <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center bg-[#0B1F33] text-white">
                                <h3 className="text-xl font-bold flex items-center gap-2">
                                    <UserPlus className="h-6 w-6" />
                                    Add New Staff Member
                                </h3>
                                <button
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="hover:bg-white/20 p-1 rounded-full transition-colors"
                                >
                                    <UserX className="h-6 w-6" />
                                </button>
                            </div>

                            <form onSubmit={handleAddStaff} className="p-6 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">First Name</label>
                                        <Input
                                            name="firstName"
                                            value={addFormData.firstName}
                                            onChange={handleInputChange}
                                            placeholder="John"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">Last Name</label>
                                        <Input
                                            name="lastName"
                                            value={addFormData.lastName}
                                            onChange={handleInputChange}
                                            placeholder="Doe"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">Email Address</label>
                                    <Input
                                        type="email"
                                        name="email"
                                        value={addFormData.email}
                                        onChange={handleInputChange}
                                        placeholder="john.doe@realtyengage.com"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">Phone Number</label>
                                        <Input
                                            name="phone"
                                            value={addFormData.phone}
                                            onChange={handleInputChange}
                                            placeholder="10-digit mobile"
                                            pattern="[0-9]{10}"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">Role</label>
                                        <select
                                            name="role"
                                            className="w-full h-10 px-3 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                                            value={addFormData.role}
                                            onChange={handleInputChange}
                                        >
                                            <option value="admin">Administrator</option>
                                            <option value="super_admin">Super Admin</option>
                                            <option value="customer">Customer</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">Initial Password</label>
                                    <Input
                                        type="password"
                                        name="password"
                                        value={addFormData.password}
                                        onChange={handleInputChange}
                                        placeholder="Min 6 characters"
                                        required
                                        minLength={6}
                                    />
                                    <p className="text-xs text-gray-400">Please share this password securely with the new staff member.</p>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="flex-1"
                                        onClick={() => setIsAddModalOpen(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="flex-1 bg-[#0B1F33] hover:bg-[#0B1F33]/90 text-white font-bold shadow-lg"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? 'Adding...' : 'Add Staff Member'}
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Edit User Modal */}
            <AnimatePresence>
                {isEditModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden text-left"
                        >
                            <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center bg-[#0B1F33] text-white">
                                <h3 className="text-xl font-bold flex items-center gap-2">
                                    <Edit className="h-6 w-6" />
                                    Edit User Details
                                </h3>
                                <button
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="hover:bg-white/20 p-1 rounded-full transition-colors"
                                >
                                    <UserX className="h-6 w-6" />
                                </button>
                            </div>

                            <form onSubmit={handleUpdateUser} className="p-6 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">First Name</label>
                                        <Input
                                            name="firstName"
                                            value={editFormData.firstName}
                                            onChange={handleEditInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">Last Name</label>
                                        <Input
                                            name="lastName"
                                            value={editFormData.lastName}
                                            onChange={handleEditInputChange}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">Email Address (Read Only)</label>
                                    <Input
                                        type="email"
                                        name="email"
                                        value={editFormData.email}
                                        disabled
                                        className="bg-gray-50 opacity-70"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">Phone Number</label>
                                        <Input
                                            name="phone"
                                            value={editFormData.phone}
                                            onChange={handleEditInputChange}
                                            placeholder="10-digit mobile"
                                            pattern="[0-9]{10}"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">Role</label>
                                        <select
                                            name="role"
                                            className="w-full h-10 px-3 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                                            value={editFormData.role}
                                            onChange={handleEditInputChange}
                                        >
                                            <option value="admin">Administrator</option>
                                            <option value="super_admin">Super Admin</option>
                                            <option value="customer">Customer</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="flex-1"
                                        onClick={() => setIsEditModalOpen(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="flex-1 bg-[#0B1F33] hover:bg-[#0B1F33]/90 text-white font-bold shadow-lg"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div >
    );
};

export default UserManagementPage;
