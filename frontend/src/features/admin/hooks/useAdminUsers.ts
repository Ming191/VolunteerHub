import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import axiosInstance from '@/utils/axiosInstance';
import { useDebounce } from '@/hooks/useDebounce';
import { type UserResponse } from '@/api-client';

interface PageUserResponse {
    content: UserResponse[];
    totalElements: number;
    totalPages: number;
}

export const useAdminUsers = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const debouncedSearchQuery = useDebounce(searchQuery, 500);
    const queryClient = useQueryClient();

    // Fetch users
    const {
        data: usersPage,
        isLoading,
        isError,
        error,
        refetch
    } = useQuery<PageUserResponse, Error>({
        queryKey: ['adminUsers', debouncedSearchQuery],
        queryFn: async () => {
            const response = await axiosInstance.get(`/admin/users?search=${debouncedSearchQuery}`);
            return response.data;
        },
    });

    const users = usersPage?.content || [];

    // Mutation for locking/unlocking users
    const toggleLockMutation = useMutation<void, Error, { userId: number; isLocked: boolean }>({
        mutationFn: async ({ userId, isLocked }) => {
            await axiosInstance.patch(`/admin/users/${userId}/lock`, { isLocked: !isLocked });
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
            toast.success(`User ${variables.isLocked ? 'unlocked' : 'locked'} successfully.`);
        },
        onError: (err) => {
            toast.error(`Failed to toggle lock status: ${err.message}`);
        },
    });

    const handleToggleLock = (userId: number, isLocked: boolean) => {
        toggleLockMutation.mutate({ userId, isLocked });
    };

    return {
        users,
        isLoading,
        isError,
        error,
        refetch,
        searchQuery,
        setSearchQuery,
        handleToggleLock
    };
};
