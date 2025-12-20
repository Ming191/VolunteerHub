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
    const result = useQuery({
        queryKey: [EVENTS_QUERY_KEY, params],
        queryFn: () => eventService.searchEvents(params),
        placeholderData: (previousData) => previousData,
    });

    // Enable polling if any event is processing images
    const hasProcessingImages = result.data?.content.some(event => event.imagesProcessing);
    
    return useQuery({
        queryKey: [EVENTS_QUERY_KEY, params],
        queryFn: () => eventService.searchEvents(params),
        placeholderData: (previousData) => previousData,
        refetchInterval: hasProcessingImages ? 3000 : false, // Poll every 3 seconds if images are processing
    });
};

export const useGetEvent = (id: number) => {
    const result = useQuery({
        queryKey: [EVENTS_QUERY_KEY, id],
        queryFn: () => eventService.getEventById(id),
        enabled: !!id,
    });

    // Poll more frequently if images are processing, otherwise every 30 seconds
    const isProcessing = result.data?.imagesProcessing;
    
    return useQuery({
        queryKey: [EVENTS_QUERY_KEY, id],
        queryFn: () => eventService.getEventById(id),
        enabled: !!id,
        refetchInterval: isProcessing ? 3000 : 30000, // 3s when processing, 30s otherwise
        refetchIntervalInBackground: false, // Only refetch when tab is active
    });
};

