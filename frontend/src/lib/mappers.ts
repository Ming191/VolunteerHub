import type { EventResponse } from '@/api-client';
import type { UiEvent } from '@/types/ui-models';

export function mapToUiEvent(apiEvent: EventResponse): UiEvent {
    let safeTags: string[] = [];

    if (Array.isArray(apiEvent.tags)) {
        safeTags = apiEvent.tags as unknown as string[];
    } else if (apiEvent.tags && typeof (apiEvent.tags as any)[Symbol.iterator] === 'function') {
        safeTags = Array.from(apiEvent.tags as any);
    }

    const availableSpotsText = apiEvent.maxParticipants
        ? `${apiEvent.availableSpots} spots available`
        : 'Unlimited spots';

    return {
        id: apiEvent.id,
        title: apiEvent.title,
        description: apiEvent.description,
        location: apiEvent.location,
        eventDateTime: apiEvent.eventDateTime,
        endDateTime: apiEvent.endDateTime,
        imageUrls: apiEvent.imageUrls || [],
        tags: safeTags,
        availableSpotsText,
        isFull: apiEvent.isFull,
        maxParticipants: apiEvent.maxParticipants,
        availableSpots: apiEvent.availableSpots,
        creatorName: apiEvent.creatorName,
        isInProgress: apiEvent.isInProgress
    };
}
