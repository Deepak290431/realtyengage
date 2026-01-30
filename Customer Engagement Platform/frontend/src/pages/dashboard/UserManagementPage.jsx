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
import toast from 'react-hot-toast';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { userAPI } from '../../services/api';

const UserManagementPage = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [selectedUser, setSelectedUser] = useState(null);

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

    const handleToggleStatus = async (user) => {
        try {
            // In real implement: await userAPI.updateUser(user._id, { isActive: !user.isActive });
            toast.success(`${user.firstName}'s account status updated.`);
            fetchUsers();
        } catch (error) {
            toast.error('Failed to update user status');
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch =
            `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesRole = roleFilter === 'all' || user.role === roleFilter;

        return matchesSearch && matchesRole;
    });

    const getRoleBadge = (role) => {
        switch (role) {
            case 'admin': return 'bg-purple-100 text-purple-700 border-purple-200';
            case 'editor': return 'bg-blue-100 text-blue-700 border-blue-200';
            default: return 'bg-green-100 text-green-700 border-green-200';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-12">
            {/* Header */}
            {/* Header */}
            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent flex items-center gap-3">
                            <Users className="h-8 w-8 text-indigo-600" />
                            Customer Management
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">
                            Manage user roles, monitor activity, and handle account statuses.
                        </p>
                    </div>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <Button className="font-bold shadow-lg">
                            <UserPlus className="mr-2 h-5 w-5" />
                            Add New Staff
                        </Button>
                    </motion.div>
                </div>
            </div>

            <div className="container mx-auto px-4">
                <div className="max-w-6xl mx-auto space-y-6">
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
                                    className="h-12 px-4 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[150px]"
                                    value={roleFilter}
                                    onChange={(e) => setRoleFilter(e.target.value)}
                                >
                                    <option value="all">All Roles</option>
                                    <option value="admin">Admins</option>
                                    <option value="customer">Customers</option>
                                </select>
                                <Button variant="outline" className="h-12">
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
                                    <Card className="overflow-hidden hover:shadow-2xl transition-all duration-300 border-none group">
                                        <div className={`h-2 w-full ${user.role === 'admin' ? 'bg-purple-500' : 'bg-blue-500'}`} />
                                        <div className="p-6">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex items-center gap-4">
                                                    <div className={`h-12 w-12 rounded-full flex items-center justify-center text-white font-bold text-xl ${user.role === 'admin' ? 'bg-purple-600' : 'bg-blue-600'}`}>
                                                        {user.firstName?.[0]}{user.lastName?.[0]}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-lg group-hover:text-blue-600 transition-colors uppercase">
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
                                                    <Mail className="h-4 w-4 shrink-0" />
                                                    <span className="truncate">{user.email}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Phone className="h-4 w-4 shrink-0" />
                                                    <span>{user.phone || 'No phone'}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-4 w-4 shrink-0" />
                                                    <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>

                                            <div className="flex gap-2 pt-2 border-t dark:border-gray-700">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="flex-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                    onClick={() => navigate(`/admin/users/${user._id}`)}
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
                                        </div>
                                    </Card>
                                </motion.div>
                            ))
                        ) : (
                            <div className="col-span-full py-20 text-center">
                                <div className="bg-gray-100 dark:bg-gray-800 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
                                    <AlertCircle className="h-8 w-8 text-gray-400" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">No customers found</h3>
                                <p className="text-gray-500">Try adjusting your filters or search terms.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserManagementPage;
