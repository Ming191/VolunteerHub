import { useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
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

    const handleNavigateToEvent = useCallback((eventId: number) => navigate(`/events/${eventId}`), [navigate]);
    const handleNavigateToMyEvents = useCallback(() => navigate('/my-events'), [navigate]);
    const handleNavigateToCreateEvent = useCallback(() => navigate('/my-events'), [navigate]); // Assuming create is on my-events or opens a modal there
    const handleNavigateToAnalytics = useCallback(() => navigate('/events'), [navigate]);

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
