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
  UserCircle,
  Calculator
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { logout } from '../../store/slices/authSlice';
import AIChatbot from '../chatbot/AIChatbot';
import VoiceSearch from '../voice/VoiceSearch';

const Header = ({ onToggleChatbot, isChatbotOpen: isChatbotOpenProp }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { theme } = useSelector((state) => state.theme);

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isChatbotOpenLocal, setIsChatbotOpenLocal] = useState(false);
  const [isVoiceSearchOpen, setIsVoiceSearchOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications] = useState(3); // Example notification count

  const isChatbotOpen = isChatbotOpenProp !== undefined ? isChatbotOpenProp : isChatbotOpenLocal;

  const handleToggleChatbot = () => {
    if (onToggleChatbot) {
      onToggleChatbot();
    } else {
      setIsChatbotOpenLocal(!isChatbotOpenLocal);
    }
  };

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      navigate('/projects', { state: { searchQuery } });
      setIsSearchExpanded(false);
      setSearchQuery('');
    }
  };

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
    ...(isAuthenticated && user?.role === 'admin' ? [] : [
      { label: 'Home', path: '/', icon: Home },
      { label: 'Projects', path: '/projects', icon: Building }
    ]),
    ...(isAuthenticated && user?.role === 'admin' ? [
      { label: 'Admin Dashboard', path: '/admin', icon: LayoutDashboard },
      { label: 'Properties', path: '/admin/projects', icon: Building },
      { label: 'Enquiries', path: '/admin/enquiries', icon: FileQuestion },
      { label: 'Transactions', path: '/admin/payments', icon: CreditCard },
      { label: 'Customers', path: '/admin/customers', icon: Users },
      { label: 'EMI Calculator', path: '/admin/emi', icon: Calculator },
      { label: 'Settings', path: '/admin/settings', icon: Settings },
    ] : isAuthenticated && user?.role !== 'admin' ? [
      { label: 'My Enquiries', path: '/dashboard/enquiries', icon: FileQuestion },
      { label: 'My Payments', path: '/dashboard/payments', icon: CreditCard },
      { label: 'EMI Calculator', path: '/dashboard/emi', icon: Calculator },
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
        <div className="w-full px-6 md:px-10">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center"
              >
                <Building className="h-8 w-8 text-[#0B1F33]" />
                <span className="ml-2 text-2xl font-black text-[#0B1F33] dark:text-white brand-font tracking-tight">
                  RealtyAdmin
                </span>
              </motion.div>
            </Link>

            {/* Desktop Navigation - Centered */}
            <nav className="hidden lg:flex items-center space-x-2">
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

            {/* Actions Section - Right Aligned */}
            <div className="flex items-center space-x-1 md:space-x-3">
              {/* Desktop Actions (lg and up) */}
              <div className="hidden lg:flex items-center space-x-3">
                <div className="flex items-center">
                  {/* Expandable Search */}
                  <motion.div
                    initial={false}
                    animate={{ width: isSearchExpanded ? 240 : 40 }}
                    className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden"
                  >
                    {isSearchExpanded ? (
                      <form onSubmit={handleSearch} className="flex items-center w-full px-3">
                        <input
                          autoFocus
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search projects..."
                          className="bg-transparent border-none outline-none text-sm w-full py-1.5 dark:text-white"
                        />
                        <Button
                          type="submit"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-full"
                        >
                          <Search className="h-4 w-4" />
                        </Button>
                      </form>
                    ) : (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full hover:bg-white dark:hover:bg-gray-700 h-9 w-9"
                        onClick={() => setIsSearchExpanded(true)}
                      >
                        <Search className="h-4 w-4" />
                      </Button>
                    )}
                  </motion.div>

                  {/* Voice Search Icon */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 h-9 w-9 ml-1"
                    onClick={() => setIsVoiceSearchOpen(true)}
                  >
                    <Mic className="h-4 w-4 text-purple-600" />
                  </Button>
                </div>

                {/* AI Assistant - Desktop Customer Only */}
                {isAuthenticated && user?.role !== 'admin' && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleToggleChatbot}
                    className="relative rounded-full h-10 w-10 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <MessageSquare className="h-5 w-5 text-green-600" />
                    <span className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900 animate-pulse" />
                  </Button>
                )}

                {/* Notifications - Desktop Customer Only */}
                {isAuthenticated && user?.role !== 'admin' && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative rounded-full transition-all hover:bg-gray-100 dark:hover:bg-gray-800"
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  >
                    <Bell className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                    {notifications > 0 && (
                      <Badge
                        variant="destructive"
                        className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center border-2 border-white dark:border-gray-900"
                      >
                        {notifications}
                      </Badge>
                    )}
                  </Button>
                )}

                {isAuthenticated ? (
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                      className={`relative rounded-full h-10 w-10 transition-all ${isProfileMenuOpen ? 'bg-primary/10' : ''}`}
                    >
                      <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white font-semibold shadow-sm">
                        {user?.firstName?.charAt(0) || user?.name?.charAt(0) || 'U'}
                      </div>
                      {(user?.role === 'admin' && notifications > 0) && (
                        <Badge
                          variant="destructive"
                          className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center border-2 border-white dark:border-gray-900"
                        >
                          {notifications}
                        </Badge>
                      )}
                    </Button>

                    <AnimatePresence>
                      {isProfileMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute right-0 mt-3 w-72 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 z-[110] overflow-hidden"
                        >
                          <div className="p-4 bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
                            <p className="font-bold text-gray-900 dark:text-white truncate">{user?.name}</p>
                            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                            <Badge variant="outline" className="mt-2 text-[10px] bg-primary/5 text-primary border-primary/20">
                              {user?.role?.toUpperCase()}
                            </Badge>
                          </div>

                          <div className="p-2 space-y-1">
                            <button
                              onClick={() => { handleToggleChatbot(); setIsProfileMenuOpen(false); }}
                              className="w-full flex items-center space-x-3 px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-all group"
                            >
                              <div className="h-8 w-8 rounded-lg bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                                <MessageSquare className="h-4 w-4 text-green-600" />
                              </div>
                              <span className="text-sm font-semibold flex-1 text-left">AI Assistant</span>
                              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                            </button>

                            <button
                              onClick={() => { setIsNotificationOpen(!isNotificationOpen); setIsProfileMenuOpen(false); }}
                              className="w-full flex items-center space-x-3 px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-all group"
                            >
                              <div className="h-8 w-8 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                                <Bell className="h-4 w-4 text-red-600" />
                              </div>
                              <span className="text-sm font-semibold flex-1 text-left">Notifications</span>
                              {notifications > 0 && (
                                <Badge variant="destructive" className="h-5 min-w-[20px] px-1">{notifications}</Badge>
                              )}
                            </button>

                            <div className="h-px bg-gray-100 dark:bg-gray-700 my-1 mx-2" />

                            <Link
                              to={user?.role === 'admin' ? '/admin' : '/dashboard'}
                              className="flex items-center space-x-3 px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-all"
                              onClick={() => setIsProfileMenuOpen(false)}
                            >
                              <div className="h-8 w-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                                <LayoutDashboard className="h-4 w-4 text-blue-600" />
                              </div>
                              <span className="text-sm font-semibold">Dashboard</span>
                            </Link>

                            <Link
                              to={user?.role === 'admin' ? '/admin/profile' : '/dashboard/profile'}
                              className="flex items-center space-x-3 px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-all"
                              onClick={() => setIsProfileMenuOpen(false)}
                            >
                              <div className="h-8 w-8 rounded-lg bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center">
                                <User className="h-4 w-4 text-orange-600" />
                              </div>
                              <span className="text-sm font-semibold">My Profile</span>
                            </Link>

                            <div className="h-px bg-gray-100 dark:bg-gray-700 my-1 mx-2" />

                            <button
                              onClick={handleLogout}
                              className="w-full flex items-center space-x-3 px-3 py-2.5 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all text-red-600"
                            >
                              <div className="h-8 w-8 rounded-lg bg-red-50 dark:bg-red-900/10 flex items-center justify-center">
                                <LogOut className="h-4 w-4" />
                              </div>
                              <span className="text-sm font-bold">Logout</span>
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <div className="flex items-center space-x-3">
                    <Button
                      variant="ghost"
                      onClick={() => navigate('/login')}
                      className="text-sm px-4 h-9 text-gray-700 dark:text-gray-200 hover:text-primary hover:bg-primary/10 transition-colors"
                    >
                      Login
                    </Button>
                    <Button
                      onClick={() => navigate('/register')}
                      className="bg-[#0B1F33] hover:bg-[#06121f] text-white text-sm px-5 h-9 shadow-md"
                    >
                      Get Started
                    </Button>
                  </div>
                )}
              </div>

              {/* Mobile Menu Toggle (Three Dots) - Always show on mobile, hide on lg */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full h-10 w-10"
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
                    <div className="h-10 w-10 rounded-full bg-[#0B1F33] flex items-center justify-center text-white text-lg font-bold shadow-lg">
                      {user?.name?.charAt(0) || 'U'}
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user?.name}</p>
                      <p className="text-[11px] text-gray-700 dark:text-gray-300 font-semibold truncate">{user?.email}</p>
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

                {/* Quick Tools */}
                <div className="px-3 py-1 mt-3 text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                  Quick Tools
                </div>

                <div className="space-y-1">
                  <button
                    onClick={() => { setIsSearchExpanded(true); setIsMobileMenuOpen(false); }}
                    className="flex items-center w-full space-x-2.5 px-3 py-2 rounded-lg text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 font-semibold transition-all"
                  >
                    <Search className="h-4 w-4 text-primary" />
                    <span className="text-xs md:text-sm">Search Projects</span>
                  </button>

                  <button
                    onClick={() => { setIsVoiceSearchOpen(true); setIsMobileMenuOpen(false); }}
                    className="flex items-center w-full space-x-2.5 px-3 py-2 rounded-lg text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 font-semibold transition-all"
                  >
                    <Mic className="h-4 w-4 text-purple-600" />
                    <span className="text-xs md:text-sm">Voice Search</span>
                  </button>

                  <button
                    onClick={() => { handleToggleChatbot(); setIsMobileMenuOpen(false); }}
                    className="flex items-center w-full space-x-2.5 px-3 py-2 rounded-lg text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 font-semibold transition-all"
                  >
                    <MessageSquare className="h-4 w-4 text-green-600" />
                    <span className="text-xs md:text-sm">AI Assistant</span>
                  </button>

                  <button
                    onClick={() => { setIsNotificationOpen(true); setIsMobileMenuOpen(false); }}
                    className="flex items-center w-full space-x-2.5 px-3 py-2 rounded-lg text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 font-semibold transition-all"
                  >
                    <div className="relative">
                      <Bell className="h-4 w-4 text-red-600" />
                      {notifications > 0 && (
                        <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full border border-white dark:border-gray-800" />
                      )}
                    </div>
                    <span className="text-xs md:text-sm">Notifications</span>
                    {notifications > 0 && (
                      <Badge variant="destructive" className="ml-auto h-4 min-w-[16px] px-1 text-[9px]">{notifications}</Badge>
                    )}
                  </button>
                </div>

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
                    <Button className="h-9 text-xs font-bold bg-[#0B1F33] hover:bg-[#06121f] shadow-lg shadow-blue-500/20" onClick={() => { navigate('/login'); setIsMobileMenuOpen(false); }}>
                      Get Started
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Chatbot */}
      {isChatbotOpen && !onToggleChatbot && (
        <AIChatbot isOpen={isChatbotOpen} onClose={handleToggleChatbot} />
      )}

      {/* Voice Search */}
      <VoiceSearch
        isOpen={isVoiceSearchOpen}
        onClose={() => setIsVoiceSearchOpen(false)}
        onSearch={(query, results) => {
          navigate('/projects', { state: { searchQuery: query, results } });
          setIsVoiceSearchOpen(false);
        }}
      />
    </>
  );
};

export default Header;
