import { axiosInstance } from './authService';

const adminService = {
    // Reset Enquiries (Super Admin only)
    resetEnquiries: async () => {
        const response = await axiosInstance.delete('/admin/reset/enquiries');
        return response.data;
    },

    // Reset Projects (Super Admin only)
    resetProjects: async () => {
        const response = await axiosInstance.delete('/admin/reset/projects');
        return response.data;
    },

    // Reset Customers (Super Admin only)
    resetCustomers: async () => {
        const response = await axiosInstance.delete('/admin/reset/customers');
        return response.data;
    },

    // Reset Payments (Super Admin only)
    resetPayments: async () => {
        const response = await axiosInstance.delete('/admin/reset/payments');
        return response.data;
    }
};

export default adminService;
