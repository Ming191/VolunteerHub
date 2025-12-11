import { Configuration, DashboardApi, AdminMetricsApi } from '@/api-client';
import axiosInstance from '@/utils/axiosInstance';

const config = new Configuration({ basePath: '' });
const dashboardApi = new DashboardApi(config, '', axiosInstance);
const metricsApi = new AdminMetricsApi(config, '', axiosInstance);

export const adminService = {
    getDashboardStats: async () => {
        const response = await dashboardApi.getAdminDashboard();
        return response.data;
    },

    getSystemMetrics: async () => {
        const response = await metricsApi.getSystemMetrics();
        return response.data;
    }
};
