import { useQuery } from '@tanstack/react-query';
import { UserProfileApi, Configuration, type CompletedEventResponse } from '@/api-client';
import axiosInstance from '@/utils/axiosInstance';

const config = new Configuration({ basePath: '' });
const userProfileApi = new UserProfileApi(config, undefined, axiosInstance);

export const useCompletedEvents = (enabled: boolean = true) => {
    return useQuery<CompletedEventResponse[]>({
        queryKey: ['completed-events'],
        queryFn: async () => {
            const response = await userProfileApi.getMyCompletedEvents();
            return response.data;
        },
        enabled,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};
