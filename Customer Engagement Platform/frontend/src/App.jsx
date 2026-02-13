import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Box, CircularProgress } from '@mui/material';

// Layout Components
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Public Pages
import HomePage from './pages/HomePage';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import { PrivacyPage, TermsPage, RefundPolicyPage, CookiePolicyPage, DisclaimerPage } from './pages/LegalPages';
import TestimonialsPage from './pages/TestimonialsPage';
import CareersPage from './pages/CareersPage';
import ServicePage from './pages/ServicePage';

// Protected Pages
import CustomerDashboard from './pages/dashboard/CustomerDashboard';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import EnquiriesPage from './pages/EnquiriesPage';
import PaymentsPage from './pages/PaymentsPage';
import SupportPage from './pages/SupportPage';
import ProfilePage from './pages/ProfilePage';
import EditProjectPage from './pages/EditProjectPage';
import AddProjectPage from './pages/AddProjectPage';
import UserManagementPage from './pages/dashboard/UserManagementPage';
import CustomersPage from './pages/dashboard/CustomersPage';
import SettingsPage from './pages/dashboard/SettingsPage';
import CustomerSettingsPage from './pages/dashboard/CustomerSettingsPage';
import EMICalculatorPage from './pages/EMICalculatorPage';

// Components
import PrivateRoute from './components/auth/PrivateRoute';
import NotFound from './pages/NotFound';

// Services & Actions
import { checkAuthStatus } from './store/slices/authSlice';
import ThemeApplicator from './components/ThemeApplicator';

function App() {
  const dispatch = useDispatch();
  const { isLoading, isAuthenticated, user } = useSelector((state) => state.auth);

  useEffect(() => {
    // Check if user is authenticated on app load
    dispatch(checkAuthStatus());
  }, [dispatch]);

  // Requirement: Port-Based Redirection for authenticated users
  useEffect(() => {
    if (isAuthenticated && user) {
      const adminAppURL = 'http://127.0.0.1:4000';
      const userAppURL = 'http://127.0.0.1:3000';
      const isAdmin = ['admin', 'super_admin'].includes(user.role);
      const isPort4000 = window.location.port === '4000';
      const isPort3000 = window.location.port === '3000';

      // Don't redirect if we are on login/register pages or the home page
      // This prevents loops and allows users with the "wrong" role to still reach the logout option on the login page
      const isBypassPage = ['/', '/login', '/admin/login', '/register'].includes(window.location.pathname);
      if (isBypassPage) return;

      /* Redirect logic disabled for stability in local environment
      if (isAdmin && !isPort4000) {
        window.location.href = `${adminAppURL}${window.location.pathname}${window.location.search}`;
      } else if (!isAdmin && !isPort3000) {
        window.location.href = `${userAppURL}${window.location.pathname}${window.location.search}`;
      } */
    }
  }, [isAuthenticated, user]);

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <ThemeApplicator />
      <Routes>
        {/* Public Pages with Header/Footer */}
        <Route element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="projects/:id" element={<ProjectDetailPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="testimonials" element={<TestimonialsPage />} />
          <Route path="careers" element={<CareersPage />} />
          <Route path="services/management" element={<ServicePage />} />
          <Route path="services/advisory" element={<ServicePage />} />
          <Route path="privacy" element={<PrivacyPage />} />
          <Route path="terms" element={<TermsPage />} />
          <Route path="refund-policy" element={<RefundPolicyPage />} />
          <Route path="cookies" element={<CookiePolicyPage />} />
          <Route path="disclaimer" element={<DisclaimerPage />} />

          {/* Auth Routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={
              isAuthenticated ? (
                <Navigate to={['admin', 'super_admin'].includes(user?.role) ? '/admin' : '/'} replace />
              ) : (
                <LoginPage />
              )
            } />
            <Route path="/admin/login" element={
              isAuthenticated && ['admin', 'super_admin'].includes(user?.role) ? (
                <Navigate to="/admin" replace />
              ) : (
                <LoginPage isAdmin={true} />
              )
            } />
            <Route path="/register" element={
              isAuthenticated ? <Navigate to={['admin', 'super_admin'].includes(user?.role) ? '/admin' : '/'} replace /> : <RegisterPage />
            } />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          </Route>

          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* Dashboard Routes - No standard header/footer */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute allowedRoles={['customer']}>
              <DashboardLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<CustomerDashboard />} />
          <Route path="enquiries" element={<EnquiriesPage />} />
          <Route path="payments" element={<PaymentsPage />} />
          <Route path="support" element={<SupportPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="settings" element={<CustomerSettingsPage />} />
          <Route path="emi" element={<EMICalculatorPage />} />
        </Route>

        {/* Admin Dashboard Routes - No standard header/footer */}
        <Route
          path="/admin"
          element={
            <PrivateRoute allowedRoles={['admin', 'super_admin']}>
              <DashboardLayout isAdmin={true} />
            </PrivateRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="projects" element={<ProjectsPage isAdmin={true} />} />
          <Route path="projects/new" element={<AddProjectPage />} />
          <Route path="projects/:id" element={<ProjectDetailPage isAdmin={true} />} />
          <Route path="projects/edit/:id" element={<EditProjectPage />} />
          <Route path="enquiries" element={<EnquiriesPage isAdmin={true} />} />
          <Route path="payments" element={<PaymentsPage isAdmin={true} />} />
          <Route path="support" element={<SupportPage isAdmin={true} />} />
          <Route path="users" element={<UserManagementPage />} />
          <Route path="customers" element={<CustomersPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="profile" element={<ProfilePage isAdmin={true} />} />
          <Route path="emi" element={<EMICalculatorPage isAdmin={true} />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
