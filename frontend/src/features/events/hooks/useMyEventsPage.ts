import { useState, useCallback } from 'react';
import { useGetMyEvents } from './useMyEvents';
import type { EventResponse } from '@/api-client';

import { EVENTS_PER_PAGE } from './useEventSearch';

interface MyEventsFilters {
    sort?: string;
    direction?: 'ASC' | 'DESC';
}

import { useSearch } from '@tanstack/react-router';

// ...

export const useMyEventsPage = () => {
    const search = useSearch({ from: '/_auth/my-events' });
    // @ts-ignore - search param is validated in route but TS might complain if types aren't fully propagated yet
    const initialCreateOpen = search?.action === 'create';

    const [page, setPage] = useState(1);
    const [selectedEvent, setSelectedEvent] = useState<EventResponse | null>(null);
    const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(initialCreateOpen);
    const [filters, setFilters] = useState<MyEventsFilters>({
        sort: undefined,
        direction: 'DESC',
    });

    const { data: eventsData, isLoading, isError, error, refetch } = useGetMyEvents({
        page: page - 1,
        size: EVENTS_PER_PAGE,
        sort: filters.sort,
        direction: filters.direction,
    });

    const handlePageChange = useCallback((newPage: number) => {
        if (newPage > 0 && newPage <= (eventsData?.totalPages || 1)) {
            setPage(newPage);
        }
    }, [eventsData?.totalPages]);

    const handleViewDetails = useCallback((event: EventResponse) => {
        setSelectedEvent(event);
        setIsDetailSheetOpen(true);
    }, []);

    const handleCreateSuccess = useCallback(() => {
        refetch();
    }, [refetch]);

    const handleFilterChange = useCallback((newFilters: Partial<MyEventsFilters>) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
        setPage(1); // Reset to first page on filter change
    }, []);

    return {
        // State
        page,
        filters,
        selectedEvent,
        isDetailSheetOpen,
        isCreateModalOpen,

        // Data
        eventsData,
        isLoading,
        isError,
        error,

        // Setters / Handlers
        setPage,
        setIsDetailSheetOpen,
        setIsCreateModalOpen,
        handlePageChange,
        handleViewDetails,
        handleCreateSuccess,
        handleFilterChange,
    };
};
