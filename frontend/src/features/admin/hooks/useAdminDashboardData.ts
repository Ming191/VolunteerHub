import { useQuery } from '@tanstack/react-query';
import { adminService } from '../api/adminService';

export const useAdminDashboardData = () => {
    return useQuery({
        queryKey: ['admin-dashboard'],
        queryFn: adminService.getDashboardStats,
    });
};
