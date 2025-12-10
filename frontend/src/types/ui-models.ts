import type { EventResponseTagsEnum } from '@/api-client';

// This is the clean version your Components will use
export interface UiEvent {
    id: number;
    title: string;
    description: string;
    location: string;
    eventDateTime: string;
    endDateTime: string;
    imageUrls: string[];
    // The key fix: We enforce this as a string array, not a Set
    tags: string[];
    availableSpotsText: string;
    isFull: boolean;
    maxParticipants?: number;
    availableSpots?: number;
    creatorName: string;
    // Keep other useful fields
    isInProgress: boolean;
}
