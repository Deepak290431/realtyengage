import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  Building,
  FileQuestion,
  CreditCard,
  User,
  LogOut,
  ChevronDown,
  Moon,
  Sun,
  MessageSquare,
  Mic,
  Search,
  Bell,
  Settings,
  LayoutDashboard,
  MoreVertical,
  X,
  Users,
  UserCircle
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { logout } from '../../store/slices/authSlice';
import { toggleTheme } from '../../store/slices/themeSlice';
import AIChatbot from '../chatbot/AIChatbot';
import VoiceSearch from '../voice/VoiceSearch';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { theme } = useSelector((state) => state.theme);

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [isVoiceSearchOpen, setIsVoiceSearchOpen] = useState(false);
  const [notifications] = useState(3); // Example notification count

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Apply theme class to HTML element
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const navItems = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Projects', path: user?.role === 'admin' ? '/admin/projects' : '/projects', icon: Building },
    ...(isAuthenticated && user?.role === 'admin' ? [
      { label: 'Admin Dashboard', path: '/admin', icon: LayoutDashboard },
      { label: 'Enquiries', path: '/admin/enquiries', icon: FileQuestion },
      { label: 'Transactions', path: '/admin/payments', icon: CreditCard },
      { label: 'Customers', path: '/admin/customers', icon: Users },
      { label: 'Settings', path: '/admin/settings', icon: Settings },
    ] : isAuthenticated && user?.role !== 'admin' ? [
      { label: 'My Enquiries', path: '/dashboard/enquiries', icon: FileQuestion },
      { label: 'My Payments', path: '/dashboard/payments', icon: CreditCard },
      { label: 'Support', path: '/dashboard/support', icon: MessageSquare }
    ] : [
      { label: 'About', path: '/about', icon: Home },
      { label: 'Contact', path: '/contact', icon: Home }
    ]),
  ];

  const isActivePath = (path) => {
    if (path === '/' || path === '/admin') return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 w-full z-[100] transition-all duration-300 ${isScrolled
          ? 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-lg'
          : 'bg-white dark:bg-gray-900'
          }`}
      >
        <div className="w-full px-4 md:px-10 lg:px-12">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center"
              >
                <Building className="h-8 w-8 text-primary" />
                <span className="ml-2 text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  RealtyEngage
                </span>
              </motion.div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.label}
                    to={item.path}
                    className={`group relative px-4 py-2.5 rounded-lg transition-all duration-200 text-base ${isActivePath(item.path)
                      ? 'text-primary font-bold'
                      : 'text-gray-600 dark:text-gray-300 hover:text-primary font-medium'
                      }`}
                  >
                    <div className="flex items-center space-x-2">
                      <Icon className="h-4 w-4" />
                      <span className="font-medium">{item.label}</span>
                    </div>
                    {isActivePath(item.path) && (
                      <motion.div
                        layoutId="navbar-indicator"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                      />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-3">
              {/* Search */}
              <Button
                variant="ghost"
                size="icon"
                className="hidden lg:flex"
                onClick={() => setIsVoiceSearchOpen(!isVoiceSearchOpen)}
              >
                <Search className="h-5 w-5" />
              </Button>

              {/* Voice Search */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsVoiceSearchOpen(!isVoiceSearchOpen)}
                className="hidden lg:flex"
              >
                <Mic className="h-5 w-5" />
              </Button>

              {/* AI Chatbot */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsChatbotOpen(!isChatbotOpen)}
                className="relative hidden lg:flex"
              >
                <MessageSquare className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-2 w-2 bg-green-500 rounded-full animate-pulse" />
              </Button>

              {/* Theme Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => dispatch(toggleTheme())}
                className="hidden lg:flex"
              >
                {theme === 'dark' ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </Button>

              {isAuthenticated ? (
                <>
                  {/* Notifications */}
                  <Button variant="ghost" size="icon" className="relative hidden lg:flex">
                    <Bell className="h-5 w-5" />
                    {notifications > 0 && (
                      <Badge
                        variant="destructive"
                        className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center"
                      >
                        {notifications}
                      </Badge>
                    )}
                  </Button>

                  {/* Profile Menu */}
                  <div className="relative hidden lg:block">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                      className="flex items-center space-x-2"
                    >
                      <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                        {user?.name?.charAt(0) || 'U'}
                      </div>
                    </Button>

                    <AnimatePresence>
                      {isProfileMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700"
                        >
                          <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                            <p className="font-semibold truncate">{user?.name}</p>
                            <p className="text-sm text-gray-500 truncate">{user?.email}</p>
                            <Badge variant={user?.role === 'admin' ? 'destructive' : 'secondary'} className="mt-1">
                              {user?.role}
                            </Badge>
                          </div>
                          <div className="p-2">
                            <Link
                              to={user?.role === 'admin' ? '/admin' : '/dashboard'}
                              className="flex items-center space-x-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                              onClick={() => setIsProfileMenuOpen(false)}
                            >
                              <LayoutDashboard className="h-4 w-4" />
                              <span>Dashboard</span>
                            </Link>
                            <Link
                              to={user?.role === 'admin' ? '/admin/profile' : '/dashboard/profile'}
                              className="flex items-center space-x-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                              onClick={() => setIsProfileMenuOpen(false)}
                            >
                              <User className="h-4 w-4" />
                              <span>Profile</span>
                            </Link>
                            <Link
                              to={user?.role === 'admin' ? '/admin/settings' : '/dashboard/settings'}
                              className="flex items-center space-x-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                              onClick={() => setIsProfileMenuOpen(false)}
                            >
                              <Settings className="h-4 w-4" />
                              <span>Settings</span>
                            </Link>
                            <button
                              onClick={handleLogout}
                              className="flex items-center space-x-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors w-full text-left text-red-600"
                            >
                              <LogOut className="h-4 w-4" />
                              <span>Logout</span>
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              ) : (
                <div className="hidden lg:flex items-center space-x-3">
                  <Button
                    variant="ghost"
                    onClick={() => navigate('/login')}
                    className="text-base px-5 py-2.5 h-auto"
                  >
                    Login
                  </Button>
                  <Button
                    onClick={() => navigate('/register')}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-base px-6 py-3 h-auto shadow-md"
                  >
                    Get Started
                  </Button>
                </div>
              )}

              {/* Mobile Menu Toggle (Three Dots) */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <MoreVertical className="h-6 w-6" />
                )}
              </Button>
            </div>
          </div>
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                className="lg:hidden absolute top-20 right-0 w-[85vw] max-w-[320px] max-h-[calc(100vh-6rem)] bg-white dark:bg-gray-800 shadow-2xl border-l border-b border-gray-100 dark:border-gray-700 overflow-y-auto z-[200] rounded-bl-3xl scrollbar-hide"
              >
                {/* User Profile Info (if authenticated) */}
                {isAuthenticated && (
                  <div className="p-3 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900/80 dark:to-gray-800 border-b border-gray-100 dark:border-gray-700">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white text-lg font-bold shadow-lg">
                        {user?.name?.charAt(0) || 'U'}
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user?.name}</p>
                        <p className="text-[10px] text-gray-500 truncate">{user?.email}</p>
                        <Badge variant={user?.role === 'admin' ? 'destructive' : 'secondary'} className="mt-0.5 text-[9px] h-4 font-semibold px-1.5 uppercase tracking-tight">
                          {user?.role}
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}

                <div className="p-3 space-y-0.5">
                  {/* Main Navigation */}
                  <div className="px-4 py-2 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-[0.2em] mb-2">
                    Main Menu
                  </div>
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.label}
                        to={item.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center space-x-2.5 px-3 py-2 rounded-lg transition-all ${isActivePath(item.path)
                          ? 'bg-primary text-white shadow-sm font-bold'
                          : 'text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 font-semibold'
                          }`}
                      >
                        <Icon className={`h-4 w-4 ${isActivePath(item.path) ? 'text-white' : 'text-primary'}`} />
                        <span className="text-xs md:text-sm">{item.label}</span>
                      </Link>
                    );
                  })}

                  <div className="px-3 py-1 mt-3 text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                    Quick Tools
                  </div>

                  <button
                    onClick={() => { setIsVoiceSearchOpen(true); setIsMobileMenuOpen(false); }}
                    className="flex items-center w-full space-x-2.5 px-3 py-2 rounded-lg text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 font-semibold transition-all"
                  >
                    <Mic className="h-4 w-4 text-purple-600" />
                    <span className="text-xs md:text-sm">Voice Search</span>
                  </button>

                  <button
                    onClick={() => { setIsChatbotOpen(true); setIsMobileMenuOpen(false); }}
                    className="flex items-center w-full space-x-2.5 px-3 py-2 rounded-lg text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 font-semibold transition-all"
                  >
                    <MessageSquare className="h-4 w-4 text-green-600" />
                    <span className="text-xs md:text-sm">AI Assistant</span>
                  </button>

                  <button
                    onClick={() => dispatch(toggleTheme())}
                    className="flex items-center w-full space-x-2.5 px-3 py-2 rounded-lg text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 font-semibold transition-all"
                  >
                    {theme === 'dark' ? <Sun className="h-4 w-4 text-yellow-500" /> : <Moon className="h-4 w-4 text-indigo-600" />}
                    <span className="text-xs md:text-sm">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                  </button>

                  {isAuthenticated ? (
                    <>
                      <div className="border-t border-gray-100 dark:border-gray-700 my-2 pt-1" />
                      <Link
                        to={user?.role === 'admin' ? '/admin/profile' : '/dashboard/profile'}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center space-x-2.5 px-3 py-2 rounded-lg text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 font-semibold transition-all"
                      >
                        <User className="h-4 w-4 text-orange-600" />
                        <span className="text-xs md:text-sm">My Profile</span>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full space-x-2.5 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 font-bold transition-all"
                      >
                        <LogOut className="h-4 w-4" />
                        <span className="text-xs md:text-sm">Logout</span>
                      </button>
                    </>
                  ) : (
                    <div className="p-2 grid grid-cols-1 gap-2 border-t border-gray-100 dark:border-gray-700 mt-2">
                      <Button className="h-9 text-xs font-bold bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg shadow-blue-500/20" onClick={() => { navigate('/login'); setIsMobileMenuOpen(false); }}>
                        Get Started
                      </Button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.header>

      {/* Chatbot */}
      {isChatbotOpen && (
        <AIChatbot isOpen={isChatbotOpen} onClose={() => setIsChatbotOpen(false)} />
      )}

      {/* Voice Search */}
      {isVoiceSearchOpen && (
        <VoiceSearch onSearch={(query, results) => {
          navigate('/projects', { state: { searchQuery: query, results } });
          setIsVoiceSearchOpen(false);
        }} />
      )}
    </>
  );
};

export default Header;
