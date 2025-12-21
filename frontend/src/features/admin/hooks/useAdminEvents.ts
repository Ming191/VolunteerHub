import { useState, useEffect } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { toast } from 'sonner';
import axiosInstance from '@/utils/axiosInstance';
import { useDebounce } from '@/hooks/useDebounce';
import { type EventResponse } from '@/api-client';
import {useNavigate} from "@tanstack/react-router";

interface PageEventResponse {
    content: EventResponse[];
    totalElements: number;
    totalPages: number;
}

export const useAdminEvents = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    const debouncedSearchQuery = useDebounce(searchQuery, 500);

    const [page, setPage] = useState(0);
    const pageSize = 20;

    // Reset page to 0 when search query changes
    useEffect(() => {
        setPage(0);
    }, [debouncedSearchQuery]);

    // Fetch events
    const {
        data: eventsPage,
        isLoading,
        isFetching,
        isError,
        error,
        refetch
    } = useQuery<PageEventResponse, Error>({
        queryKey: ['adminEvents', debouncedSearchQuery, page],
        queryFn: async () => {
            const endpoint = debouncedSearchQuery ? '/api/events/search' : '/api/admin/events';
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

    const events = eventsPage?.content || [];
    const totalPages = eventsPage?.totalPages || 0;
    const totalElements = eventsPage?.totalElements || 0;

    const handleNavigateToEventDetails = (eventId: number) => {
        navigate({to: `/events/${eventId}`});
    }

    const handleExportEvents = async () => {
        try {
            const response = await axiosInstance.get('/api/admin/export/events.csv', {
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data], { type: 'text/csv' }));
            const link = document.createElement('a');
            link.href = url;
            const contentDisposition = response.headers['content-disposition'];
            let fileName = 'events.csv';
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
                toast.success('Events exported successfully');
            } finally {
                link.parentNode?.removeChild(link);
                window.URL.revokeObjectURL(url); // Cleanup
            }
        } catch (error) {
            console.error('Failed to export events:', error);
            toast.error('Failed to export events');
        }
    };

    return {
        events,
        isLoading,
        isFetching,
        isError,
        error,
        refetch,
        searchQuery,
        setSearchQuery,
        handleExportEvents,
        handleNavigateToEventDetails,
        page,
        setPage,
        totalPages,
        totalElements
    };
};
