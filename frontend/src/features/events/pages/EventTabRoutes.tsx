import { useParams } from '@tanstack/react-router';
import { useGetEvent } from '../hooks/useEvents';
import { EventAbout, EventAttendees, EventCommunity, EventGallery } from '../components/page/EventContentTabs';
import { Loader2 } from 'lucide-react';

const useEventData = () => {
    const { eventId } = useParams({ strict: false });
    const id = parseInt(eventId ?? '0', 10);
    return useGetEvent(id);
};

const TabLoader = () => (
    <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
);

const TabError = () => (
    <div className="p-4 text-destructive">Failed to load event data.</div>
);

export const EventAboutRoute = () => {
    const { data: event, isLoading, isError } = useEventData();
    if (isLoading) return <TabLoader />;
    if (isError || !event) return <TabError />;
    return <EventAbout event={event} />;
};

export const EventCommunityRoute = () => {
    const { data: event, isLoading, isError } = useEventData();
    if (isLoading) return <TabLoader />;
    if (isError || !event) return <TabError />;
    return <EventCommunity event={event} />;
};

export const EventAttendeesRoute = () => {
    const { data: event, isLoading, isError } = useEventData();
    if (isLoading) return <TabLoader />;
    if (isError || !event) return <TabError />;
    return <EventAttendees event={event} />;
};

export const EventGalleryRoute = () => {
    const { data: event, isLoading, isError } = useEventData();
    if (isLoading) return <TabLoader />;
    if (isError || !event) return <TabError />;
    return <EventGallery event={event} />;
};
