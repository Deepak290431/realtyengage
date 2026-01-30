import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    LayoutDashboard,
    Building2,
    FileQuestion,
    CreditCard,
    Users,
    Settings,
    HelpCircle,
    ChevronRight,
    PlusCircle,
    MessageSquare,
    LogOut,
    UserCircle,
    Sparkles,
    Sun,
    Moon,
    Home
} from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { toggleTheme } from '../../store/slices/themeSlice';
import AIChatbot from '../chatbot/AIChatbot';

const AdminSidebar = ({ onToggleChatbot }) => {
    const menuItems = [
        // ... (items remain same, will use '...' to skip unchanged lines if tool allows, but I need to be precise)
        {
            title: 'Dashboard',
            path: '/admin',
            icon: LayoutDashboard
        },
        {
            title: 'Properties',
            path: '/admin/projects',
            icon: Building2,
            submenu: [
                { title: 'All Projects', path: '/admin/projects' },
                { title: 'Add Project', path: '/admin/projects/new' }
            ]
        },
        {
            title: 'Enquiries',
            path: '/admin/enquiries',
            icon: FileQuestion
        },
        {
            title: 'Transactions',
            path: '/admin/payments',
            icon: CreditCard
        },
        {
            title: 'Customers',
            path: '/admin/customers',
            icon: Users
        },
        {
            title: 'My Profile',
            path: '/admin/profile',
            icon: UserCircle
        },
        {
            title: 'Settings',
            path: '/admin/settings',
            icon: Settings
        },
        {
            title: 'Website Home',
            path: '/',
            icon: Home
        }
    ];

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    const { theme } = useSelector((state) => state.theme);
    // const [isChatbotOpen, setIsChatbotOpen] = React.useState(false); // Removed local state

    const handleLogout = () => {
        dispatch(logout());
        navigate('/');
    };

    return (
        <div className="hidden lg:flex flex-col w-72 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 sticky top-0 overflow-hidden shadow-sm">
            {/* Header ... */}
            <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-tr from-purple-600 to-indigo-600 rounded-xl shadow-lg shadow-purple-200 dark:shadow-none">
                        <Building2 className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                            RealtyAdmin
                        </h1>
                        <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">
                            Property Engagement
                        </p>
                    </div>
                </div>
            </div>

            <nav className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                <p className="px-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4">
                    Management
                </p>

                {menuItems.map((item) => (
                    <div key={item.title}>
                        {item.isAction ? (
                            <button
                                onClick={() => item.title === 'AI Assistant' && onToggleChatbot && onToggleChatbot()}
                                className="w-full group flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 text-gray-600 dark:text-gray-400 hover:bg-purple-50 dark:hover:bg-purple-900/10 hover:text-purple-600"
                            >
                                <div className="flex items-center space-x-3">
                                    <item.icon className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
                                    <span className="font-semibold">{item.title}</span>
                                </div>
                            </button>
                        ) : (
                            <NavLink
                                to={item.path}
                                end={item.path === '/admin'}
                                className={({ isActive }) =>
                                    `group flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-200 dark:shadow-none'
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-purple-50 dark:hover:bg-purple-900/10 hover:text-purple-600'
                                    }`
                                }
                            >
                                <div className="flex items-center space-x-3">
                                    <item.icon className={`h-5 w-5 transition-transform duration-200 group-hover:scale-110`} />
                                    <span className="font-semibold">{item.title}</span>
                                </div>
                                {item.submenu && (
                                    <ChevronRight className="h-4 w-4 opacity-50" />
                                )}
                            </NavLink>
                        )}
                    </div>
                ))}

                <div className="pt-8">
                    <p className="px-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4">
                        Quick Actions
                    </p>
                    <NavLink
                        to="/admin/projects/new"
                        className="flex items-center space-x-3 px-4 py-3 rounded-xl text-green-600 bg-green-50 dark:bg-green-900/10 border border-transparent hover:border-green-200 transition-all font-semibold"
                    >
                        <PlusCircle className="h-5 w-5" />
                        <span>Create New Project</span>
                    </NavLink>
                </div>
            </nav>

            <div className="p-4 border-t border-gray-100 dark:border-gray-800">
                <div className="flex flex-col space-y-2">
                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold">
                            {user?.firstName?.charAt(0) || 'A'}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-bold truncate dark:text-white">{user?.firstName} {user?.lastName}</p>
                            <p className="text-[10px] text-gray-500 truncate">{user?.email}</p>
                        </div>
                        <button
                            onClick={() => dispatch(toggleTheme())}
                            className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                            {theme === 'dark' ? <Sun className="h-4 w-4 text-yellow-500" /> : <Moon className="h-4 w-4 text-gray-500" />}
                        </button>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center space-x-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all font-semibold"
                    >
                        <LogOut className="h-5 w-5" />
                        <span>Logout</span>
                    </button>
                </div>
            </div>

            {/* Removed internal AIChatbot rendering */}
        </div>
    );
};

export default AdminSidebar;
