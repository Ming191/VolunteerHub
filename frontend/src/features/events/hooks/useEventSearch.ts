import { useState } from 'react';
import { useGetEvents } from './useEvents';
import type { SearchEventsParams } from '../api/eventService';

export const EVENTS_PER_PAGE = 8;
export type FilterState = Omit<SearchEventsParams, 'page' | 'size'>;

export const useEventSearch = () => {
    const [page, setPage] = useState(1);
    const [filters, setFilters] = useState<FilterState>({
        q: '',
        location: '',
        tags: [],
        upcoming: false,
        matchAllTags: false,
    });

    const { data: events, isLoading, isError, error, refetch } = useGetEvents({
        ...filters,
        page: page - 1, // Convert to 0-based index for the API
        size: EVENTS_PER_PAGE,
    });

    const handlePageChange = (newPage: number) => {
        if (newPage > 0 && newPage <= (events?.totalPages || 1)) {
            setPage(newPage);
        }
    };

    const handleFilterChange = (newFilters: FilterState) => {
        setFilters(newFilters);
        setPage(1); // Reset to first page when filters change
    };

    const handleClearFilters = () => {
        setFilters({
            q: '',
            location: '',
            tags: [],
            upcoming: false,
            matchAllTags: false
        });
        setPage(1);
    };

    return {
        events,
        isLoading,
        isError,
        error,
        refetch,
        page,
        filters,
        handlePageChange,
        handleFilterChange,
        handleClearFilters
    };
};
