import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import AdminSettingsPage from './AdminSettingsPage';
import SuperAdminSettingsPage from './SuperAdminSettingsPage';
import CustomerSettingsPage from './CustomerSettingsPage';

/**
 * Settings Router Component
 * Automatically routes users to the appropriate settings page based on their role
 * - super_admin -> SuperAdminSettingsPage (full platform control)
 * - admin -> AdminSettingsPage (personal settings only)
 * - customer/user -> CustomerSettingsPage
 */
const SettingsRouter = () => {
    const { user } = useSelector((state) => state.auth);

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Route based on user role
    switch (user.role) {
        case 'super_admin':
            return <SuperAdminSettingsPage />;

        case 'admin':
            return <AdminSettingsPage />;

        case 'customer':
        case 'user':
        default:
            return <CustomerSettingsPage />;
    }
};

export default SettingsRouter;
