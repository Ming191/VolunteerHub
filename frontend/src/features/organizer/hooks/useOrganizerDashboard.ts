import { useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { DashboardApi, Configuration } from '@/api-client';
import axiosInstance from '@/utils/axiosInstance';

export const useOrganizerDashboard = () => {
    const navigate = useNavigate();

    const dashboardApi = useMemo(() => new DashboardApi(new Configuration(), '', axiosInstance), []);

    const { data: dashboardData, isLoading, isError, error, refetch } = useQuery({
        queryKey: ['organizer-dashboard'],
        queryFn: async () => {
            const response = await dashboardApi.getOrganizerDashboard();
            console.log('Dashboard Data:', response.data);
            return response.data;
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    const handleNavigateToEvent = useCallback((eventId: number) => {
        navigate({ to: '/events/$eventId', params: { eventId: String(eventId) } });
    }, [navigate]);
    const handleNavigateToMyEvents = useCallback(() => navigate({ to: '/my-events' }), [navigate]);
    const handleNavigateToCreateEvent = useCallback(() => navigate({ to: '/my-events', search: { action: 'create' } }), [navigate]);
    const handleNavigateToAnalytics = useCallback(() => navigate({ to: '/organizer/analytics' }), [navigate]);

    return {
        dashboardData,
        isLoading,
        isError,
        error,
        refetch,
        handleNavigateToEvent,
        handleNavigateToMyEvents,
        handleNavigateToCreateEvent,
        handleNavigateToAnalytics
    };
};
