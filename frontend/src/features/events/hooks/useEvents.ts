import { useQuery } from '@tanstack/react-query';
import { eventService, type SearchEventsParams } from '@/features/events/api/eventService';

export const EVENTS_QUERY_KEY = 'events';

/**
 * A custom hook to fetch a paginated list of events.
 * It uses React Query for caching, refetching, and state management.
 *
 * @param params - The search and pagination parameters.
 */
export const useGetEvents = (params: SearchEventsParams) => {
    return useQuery({
        queryKey: [EVENTS_QUERY_KEY, params],

        queryFn: () => eventService.searchEvents(params),

        placeholderData: (previousData) => previousData,
        // select: (data) => ({
        //     ...data,
        //     content: data.content.map(mapToUiEvent),
        // }),
    });
};
