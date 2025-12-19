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
            return response.data;
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    // Navigation to `/events/${eventId}` is disabled because no such route exists in the router configuration.
    const handleNavigateToEvent = useCallback((_eventId: number) => {
        // No-op: event details route is not defined. Implement modal or add route as needed.
    }, []);
    const handleNavigateToMyEvents = useCallback(() => navigate({ to: '/my-events' }), [navigate]);
    const handleNavigateToCreateEvent = useCallback(() => navigate({ to: '/my-events', search: { action: 'create' } }), [navigate]);
    const handleNavigateToAnalytics = useCallback(() => navigate({ to: '/events' }), [navigate]);

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
