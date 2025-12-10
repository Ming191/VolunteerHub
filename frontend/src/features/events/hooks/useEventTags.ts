import { useQuery } from '@tanstack/react-query';
import { eventService } from '@/features/events/api/eventService';

export const EVENT_TAGS_QUERY_KEY = 'eventTags';

export const useGetEventTags = () => {
    return useQuery({
        queryKey: [EVENT_TAGS_QUERY_KEY],
        queryFn: () => eventService.getEventTags(),
        staleTime: 1000 * 60 * 60,
    });
};
