import { useQuery } from '@tanstack/react-query';
import { adminService } from '../api/adminService';

export const useSystemMetrics = () => {
    return useQuery({
        queryKey: ['admin-metrics'],
        queryFn: adminService.getSystemMetrics,
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchInterval: 30000, // 30 seconds
    });
};
