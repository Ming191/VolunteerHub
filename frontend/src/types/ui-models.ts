export interface UiEvent {
    id: number;
    title: string;
    description: string;
    location: string;
    eventDateTime: string;
    endDateTime: string;
    imageUrls: string[];
    tags: string[];
    availableSpotsText: string;
    isFull: boolean;
    maxParticipants?: number;
    availableSpots?: number;
    creatorName: string;
    isInProgress: boolean;
}
