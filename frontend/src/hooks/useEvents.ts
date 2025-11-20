import {useQuery} from '@tanstack/react-query';
import { eventService, type SearchEventsParams } from '@/services/eventService';

// We define a constant for the query key to avoid magic strings
export const EVENTS_QUERY_KEY = 'events';

/**
 * A custom hook to fetch a paginated list of events.
 * It uses React Query for caching, refetching, and state management.
 *
 * @param params - The search and pagination parameters.
 */
export const useGetEvents = (params: SearchEventsParams) => {
    return useQuery({
        // The query key is an array. It uniquely identifies this query.
        // When params change, React Query will automatically refetch the data.
        queryKey: [EVENTS_QUERY_KEY, params],

        // The query function is the async function that fetches the data.
        queryFn: () => eventService.searchEvents(params),

        // Optional: Keep previous data visible while new data is loading.
        // This provides a smoother UX when paginating.
        placeholderData: (previousData) => previousData,
    });
};

