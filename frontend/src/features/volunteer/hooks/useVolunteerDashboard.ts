import { useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
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

    const handleNavigateToEvent = useCallback((eventId: number) => navigate(`/events/${eventId}`), [navigate]);
    const handleNavigateToEvents = useCallback(() => navigate('/events'), [navigate]);
    const handleNavigateToNotifications = useCallback(() => navigate('/notifications'), [navigate]);
    const handleNavigateToProfile = useCallback(() => navigate('/profile'), [navigate]);

    return {
        dashboardData,
        isLoading,
        isError,
        error,
        refetch,
        handleNavigateToEvent,
        handleNavigateToEvents,
        handleNavigateToNotifications,
        handleNavigateToProfile
    };
};
