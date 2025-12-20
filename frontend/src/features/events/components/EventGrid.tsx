import { Search, Award } from 'lucide-react';
import { EventCard } from './EventCard';
import { EventCardSkeleton } from './EventCardSkeleton';
import { SkeletonTransition } from '@/components/common/SkeletonTransition';
import type { EventResponse } from '@/api-client';

interface EventGridProps {
    isLoading: boolean;
    isError: boolean;
    error: Error | null;
    events: EventResponse[];
    onViewDetails: (event: EventResponse) => void;
    skeletonsCount?: number;
    emptyStateTitle?: string;
    emptyStateDescription?: string;
    updatingEventId?: number | null;
    processingImageEventIds?: Set<number>;
}

export const EventGrid = ({
    isLoading,
    isError,
    error,
    events,
    onViewDetails,
    skeletonsCount = 8,
    emptyStateTitle = "No events found",
    emptyStateDescription = "Try adjusting your filters or search terms.",
    updatingEventId = null,
    processingImageEventIds = new Set()
}: EventGridProps) => {

    const skeleton = (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {Array.from({ length: skeletonsCount }).map((_, index) => (
                <EventCardSkeleton key={index} />
            ))}
        </div>
    );

    return (
        <SkeletonTransition
            isLoading={isLoading}
            skeleton={skeleton}
        >
            {isError ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="rounded-full bg-red-100 p-4 mb-4">
                        <Search className="h-8 w-8 text-red-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-red-900 mb-2">Failed to Load Events</h3>
                    <p className="text-red-600 max-w-md">{String(error?.message || "Unknown error")}</p>
                </div>
            ) : !events || events.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="rounded-full bg-muted p-4 mb-4">
                        <Award className="h-8 w-8 text-muted-foreground opacity-50" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{emptyStateTitle}</h3>
                    <p className="text-muted-foreground max-w-md">{emptyStateDescription}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                    {events.map((event) => (
                        <EventCard
                            key={event.id}
                            event={event}
                            onViewDetails={onViewDetails}
                            isUpdating={updatingEventId === event.id}
                            isProcessingImages={processingImageEventIds.has(event.id)}
                        />
                    ))}
                </div>
            )}
        </SkeletonTransition>
    );
};
