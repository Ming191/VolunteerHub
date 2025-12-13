import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
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
    const [page, setPage] = useState(0);
    const pageSize = 20;

    // Reset page to 0 when search query changes
    useEffect(() => {
        setPage(0);
    }, [debouncedSearchQuery]);

    // Fetch users
    const {
        data: usersPage,
        isLoading,
        isFetching,
        isError,
        error,
        refetch
    } = useQuery<PageUserResponse, Error>({
        queryKey: ['adminUsers', debouncedSearchQuery, page],
        queryFn: async () => {
            const endpoint = debouncedSearchQuery ? '/api/admin/users/search' : '/api/admin/users';
            const response = await axiosInstance.get(endpoint, {
                params: {
                    q: debouncedSearchQuery || undefined,
                    page: page,
                    size: pageSize
                }
            });
            return response.data;
        },
        placeholderData: keepPreviousData,
    });

    const users = usersPage?.content || [];
    const totalPages = usersPage?.totalPages || 0;
    const totalElements = usersPage?.totalElements || 0;

    // Mutation for locking/unlocking users
    const toggleLockMutation = useMutation<void, Error, { userId: number; isLocked: boolean }>({
        mutationFn: async ({ userId, isLocked }) => {
            const endpoint = isLocked ? `/api/admin/users/${userId}/unlock` : `/api/admin/users/${userId}/lock`;
            await axiosInstance.patch(endpoint);
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

    const handleExportUsers = async () => {
        try {
            const response = await axiosInstance.get('/api/admin/export/users.csv', {
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data], { type: 'text/csv' }));
            const link = document.createElement('a');
            link.href = url;
            const contentDisposition = response.headers['content-disposition'];
            let fileName = 'users.csv';
            if (contentDisposition) {
                const fileNameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
                if (fileNameMatch && fileNameMatch[1]) {
                    fileName = fileNameMatch[1];
                    if (fileNameMatch[2]) {
                        fileName = fileName.slice(1, -1);
                    }
                }
            }

            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            try {
                link.click();
                toast.success('Users exported successfully');
            } finally {
                link.parentNode?.removeChild(link);
                window.URL.revokeObjectURL(url); // Cleanup
            }
        } catch (error) {
            console.error('Failed to export users:', error);
            toast.error('Failed to export users');
        }
    };

    return {
        users,
        isLoading,
        isFetching,
        isError,
        error,
        refetch,
        searchQuery,
        setSearchQuery,
        handleToggleLock,
        handleExportUsers,
        page,
        setPage,
        totalPages,
        totalElements
    };
};
