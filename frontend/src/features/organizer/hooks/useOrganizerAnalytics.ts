import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DashboardApi, Configuration } from '@/api-client';
import axiosInstance from '@/utils/axiosInstance';

export const useOrganizerAnalytics = () => {
    const dashboardApi = useMemo(() => new DashboardApi(new Configuration(), '', axiosInstance), []);

    const { data: analyticsData, isLoading, isError, error, refetch } = useQuery({
        queryKey: ['organizer-analytics'],
        queryFn: async () => {
            const response = await dashboardApi.getOrganizerAnalytics();
            return response.data;
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
        refetchOnWindowFocus: false,
    });

    return {
        analyticsData,
        isLoading,
        isError,
        error,
        refetch
    };
};
