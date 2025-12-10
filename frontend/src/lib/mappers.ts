import type { EventResponse } from '@/api-client';
import type { UiEvent } from '@/types/ui-models';

export function mapToUiEvent(apiEvent: EventResponse): UiEvent {
    // 1. Safe Tag Handling
    // We check if it exists, then cast to unknown/any to access .length just in case
    // or simply use Array.from if it's iterable.
    // Since we know the JSON comes as an array, we can treat it as such or safely convert.
    let safeTags: string[] = [];

    if (Array.isArray(apiEvent.tags)) {
        safeTags = apiEvent.tags as unknown as string[];
    } else if (apiEvent.tags && typeof (apiEvent.tags as any)[Symbol.iterator] === 'function') {
        // If it really is a Set (unlikely from JSON but possible in some clients), this converts it
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
