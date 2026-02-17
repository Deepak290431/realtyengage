import React, { useEffect, Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Box, CircularProgress, Button } from '@mui/material';

// Layout Components
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Public Pages (Lazy Loaded)
const HomePage = lazy(() => import('./pages/HomePage'));
const ProjectsPage = lazy(() => import('./pages/ProjectsPage'));
const ProjectDetailPage = lazy(() => import('./pages/ProjectDetailPage'));
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const { PrivacyPage, TermsPage, RefundPolicyPage, CookiePolicyPage, DisclaimerPage } = {
  PrivacyPage: lazy(() => import('./pages/LegalPages').then(m => ({ default: m.PrivacyPage }))),
  TermsPage: lazy(() => import('./pages/LegalPages').then(m => ({ default: m.TermsPage }))),
  RefundPolicyPage: lazy(() => import('./pages/LegalPages').then(m => ({ default: m.RefundPolicyPage }))),
  CookiePolicyPage: lazy(() => import('./pages/LegalPages').then(m => ({ default: m.CookiePolicyPage }))),
  DisclaimerPage: lazy(() => import('./pages/LegalPages').then(m => ({ default: m.DisclaimerPage })))
};
const TestimonialsPage = lazy(() => import('./pages/TestimonialsPage'));
const CareersPage = lazy(() => import('./pages/CareersPage'));
const ServicePage = lazy(() => import('./pages/ServicePage'));

// Protected Pages (Lazy Loaded)
const CustomerDashboard = lazy(() => import('./pages/dashboard/CustomerDashboard'));
const AdminDashboard = lazy(() => import('./pages/dashboard/AdminDashboard'));
const EnquiriesPage = lazy(() => import('./pages/EnquiriesPage'));
const PaymentsPage = lazy(() => import('./pages/PaymentsPage'));
const SupportPage = lazy(() => import('./pages/SupportPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const EditProjectPage = lazy(() => import('./pages/EditProjectPage'));
const AddProjectPage = lazy(() => import('./pages/AddProjectPage'));
const UserManagementPage = lazy(() => import('./pages/dashboard/UserManagementPage'));
const CustomersPage = lazy(() => import('./pages/dashboard/CustomersPage'));
const SettingsPage = lazy(() => import('./pages/dashboard/SettingsPage'));
const CustomerSettingsPage = lazy(() => import('./pages/dashboard/CustomerSettingsPage'));
const EMICalculatorPage = lazy(() => import('./pages/EMICalculatorPage'));

// Components
import PrivateRoute from './components/auth/PrivateRoute';
const NotFound = lazy(() => import('./pages/NotFound'));

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
    <Suspense fallback={
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    }>
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
                <Navigate to={['admin', 'super_admin'].includes(user?.role) ? '/admin' : '/dashboard'} replace />
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
              isAuthenticated ? <Navigate to={['admin', 'super_admin'].includes(user?.role) ? '/admin' : '/dashboard'} replace /> : <RegisterPage />
            } />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          </Route>
        </Route>

        {/* Dashboard Routes - No standard header/footer */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute allowedRoles={['customer', 'user']}>
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

        <Route path="/unauthorized" element={
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center p-8 bg-white rounded-2xl shadow-xl max-w-md">
              <h1 className="text-4xl font-bold text-red-600 mb-4">Unauthorized</h1>
              <p className="text-gray-600 mb-6">You don't have permission to access this page.</p>
              <Button onClick={() => window.location.href = '/'}>Go Home</Button>
            </div>
          </div>
        } />

        {/* 404 Catch-all */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

export default App;
