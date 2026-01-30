import api from './api';
import projectService from './projectService';
import enquiryService from './enquiryService';
import paymentService from './paymentService';
import supportService from './supportService';

const dashboardService = {
    // Get customer dashboard data
    getCustomerDashboard: async () => {
        try {
            const [enquiries, payments, tickets] = await Promise.all([
                enquiryService.getMyEnquiries({ limit: 5 }),
                paymentService.getMyPayments({ limit: 5 }),
                supportService.getMyTickets({ limit: 5 })
            ]);

            return {
                stats: {
                    totalEnquiries: enquiries.pagination?.total || 0,
                    totalPayments: payments.pagination?.total || 0,
                    totalTickets: tickets.pagination?.total || 0,
                    activeProjects: enquiries.data?.filter(e => e.status === 'in_progress').length || 0
                },
                recentEnquiries: enquiries.data || [],
                recentPayments: payments.data || [],
                recentTickets: tickets.data || []
            };
        } catch (error) {
            console.error('Error fetching customer dashboard:', error);
            throw error;
        }
    },

    // Get admin dashboard data
    getAdminDashboard: async () => {
        try {
            const [projectStats, enquiryStats, paymentStats, supportStats, recentProjects, recentEnquiries] =
                await Promise.all([
                    projectService.getProjectStats(),
                    enquiryService.getEnquiryStats(),
                    paymentService.getPaymentStats(),
                    supportService.getSupportStats(),
                    projectService.getProjects({ limit: 5, sort: '-createdAt' }),
                    enquiryService.getEnquiries({ limit: 5, sort: '-createdAt' })
                ]);

            return {
                projectStats: projectStats.data,
                enquiryStats: enquiryStats.data,
                paymentStats: paymentStats.data,
                supportStats: supportStats.data,
                recentProjects: recentProjects.data || [],
                recentEnquiries: recentEnquiries.data || []
            };
        } catch (error) {
            console.error('Error fetching admin dashboard:', error);
            throw error;
        }
    },

    // Get revenue analytics
    getRevenueAnalytics: async (period = 'monthly') => {
        const response = await api.get('/dashboard/revenue-analytics', {
            params: { period }
        });
        return response.data;
    },

    // Get customer analytics
    getCustomerAnalytics: async () => {
        const response = await api.get('/dashboard/customer-analytics');
        return response.data;
    },

    // Get project performance
    getProjectPerformance: async () => {
        const response = await api.get('/dashboard/project-performance');
        return response.data;
    },

    // Get conversion funnel data
    getConversionFunnel: async () => {
        const response = await api.get('/dashboard/conversion-funnel');
        return response.data;
    },

    // Get activity feed
    getActivityFeed: async (limit = 20) => {
        const response = await api.get('/dashboard/activity-feed', {
            params: { limit }
        });
        return response.data;
    },

    // Get pending actions (for admin)
    getPendingActions: async () => {
        try {
            const [newEnquiries, pendingPayments, openTickets] = await Promise.all([
                enquiryService.getEnquiries({ status: 'new', limit: 10 }),
                paymentService.getPayments({ status: 'pending', limit: 10 }),
                supportService.getTickets({ status: 'open', limit: 10 })
            ]);

            return {
                newEnquiries: newEnquiries.data || [],
                pendingPayments: pendingPayments.data || [],
                openTickets: openTickets.data || [],
                totalPending:
                    (newEnquiries.pagination?.total || 0) +
                    (pendingPayments.pagination?.total || 0) +
                    (openTickets.pagination?.total || 0)
            };
        } catch (error) {
            console.error('Error fetching pending actions:', error);
            throw error;
        }
    },

    // Get quick stats
    getQuickStats: async () => {
        const response = await api.get('/dashboard/quick-stats');
        return response.data;
    }
};

export default dashboardService;
