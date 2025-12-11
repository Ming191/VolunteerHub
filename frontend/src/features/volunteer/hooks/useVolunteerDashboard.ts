import { useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { DashboardApi, Configuration } from '@/api-client';
import axiosInstance from '@/utils/axiosInstance';

export const useVolunteerDashboard = () => {
    const navigate = useNavigate();

    const dashboardApi = useMemo(() => new DashboardApi(new Configuration(), '', axiosInstance), []);

    const { data: dashboardData, isLoading, isError, error, refetch } = useQuery({
        queryKey: ['volunteer-dashboard'],
        queryFn: async () => {
            const response = await dashboardApi.getVolunteerDashboard();
            return response.data;
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    const handleNavigateToEvent = useCallback(() => navigate({ to: '/events' }), [navigate]);
    const handleNavigateToEvents = useCallback(() => navigate({ to: '/events' }), [navigate]);
    const handleNavigateToRegisteredEvents = useCallback(() => navigate({ to: '/my-registrations' }), [navigate]);
    const handleNavigateToNotifications = useCallback(() => navigate({ to: '/notifications' }), [navigate]);
    const handleNavigateToProfile = useCallback(() => navigate({ to: '/profile' }), [navigate]);

    return {
        dashboardData,
        isLoading,
        isError,
        error,
        refetch,
        handleNavigateToEvent,
        handleNavigateToEvents,
        handleNavigateToRegisteredEvents,
        handleNavigateToNotifications,
        handleNavigateToProfile
    };
};
