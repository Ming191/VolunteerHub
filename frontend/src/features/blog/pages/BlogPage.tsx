import { useSearch } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { BlogFeed } from '@/features/blog/components/BlogFeed.tsx';
import { eventService } from '@/features/events/api/eventService.ts';
import { Skeleton } from '@/components/ui/skeleton.tsx';
import { useEventPermissions } from '@/features/events/hooks/useEventPermissions.ts';

const BlogPage = () => {
    const { eventId } = useSearch({ from: '/_auth/blog' });

    const { data: event, isLoading } = useQuery({
        queryKey: ['event', eventId],
        queryFn: () => eventService.getEventById(Number(eventId)),
        enabled: !!eventId,
    });

    const { canPost } = useEventPermissions(event || null);

    return (
        <div className="container py-6 relative mx-auto max-w-7xl">
            <div className="mb-6 flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        {event ? `Community: ${event.title}` : 'Community Wall'}
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        {event
                            ? `Connect with volunteers processing ${event.title}`
                            : 'Connect with other volunteers, share your experiences, and stay updated.'}
                    </p>
                </div>
            </div>

            {isLoading && eventId ? (
                <div className="space-y-4 max-w-2xl mx-auto">
                    <Skeleton className="h-[200px] w-full rounded-xl" />
                    <Skeleton className="h-[200px] w-full rounded-xl" />
                </div>
            ) : (
                <BlogFeed
                    eventId={eventId ? Number(eventId) : undefined}
                    canPost={canPost}
                />
            )}
        </div>
    );
};

export default BlogPage;
