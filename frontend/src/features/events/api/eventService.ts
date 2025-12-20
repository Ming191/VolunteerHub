import {
    Configuration, EventsApi, type EventResponse, EnumsApi, type EventTagInfo, type PageEventResponse,
    type CreateEventRequest, EventManagerApi, type RegistrationResponse, type UpdateStatusRequestStatusEnum,
    type UpdateEventRequest
} from '@/api-client';
import axiosInstance from '@/utils/axiosInstance';

const config = new Configuration({ basePath: '' });
const eventsApi = new EventsApi(config, undefined, axiosInstance);
const enumsApi = new EnumsApi(config, undefined, axiosInstance);
const eventManagerApi = new EventManagerApi(config, undefined, axiosInstance);

export interface SearchEventsParams {
    q?: string;
    location?: string;
    tags?: string[];
    upcoming?: boolean;
    matchAllTags?: boolean;
    page?: number;
    size?: number;
}

/**
 * Searches for events with various filters and pagination.
 * This function is now updated to use the correct search endpoint.
 */
const searchEvents = async (params: SearchEventsParams): Promise<PageEventResponse> => {
    try {
        const response = await eventsApi.searchEvents({
            q: params.q,
            upcoming: params.upcoming,
            location: params.location,
            tags: params.tags,
            matchAllTags: params.matchAllTags,
            page: params.page,
            size: params.size,
        });
        return response.data;
    } catch (error) {
        console.error('Failed to fetch events:', error);
        throw error;
    }
};

/**
 * Fetches all available event tags.
 */
const getEventTags = async (): Promise<EventTagInfo[]> => {
    try {
        const response = await enumsApi.getEventTags();
        return response.data;
    } catch (error) {
        console.error('Failed to fetch event tags:', error);
        throw error;
    }
};

/**
 * Fetches a single event by its ID.
 */
const getEventById = async (id: number): Promise<EventResponse> => {
    try {
        const response = await eventsApi.getEventById({ id });
        return response.data;
    } catch (error) {
        console.error(`Failed to fetch event with id ${id}:`, error);
        throw error;
    }
};

const createEvent = async (eventData: CreateEventRequest, files?: File[]): Promise<EventResponse> => {
    try {
        const response = await eventsApi.createEventForm({
            title: eventData.title,
            description: eventData.description,
            location: eventData.location,
            eventDateTime: eventData.eventDateTime,
            endDateTime: eventData.endDateTime,
            registrationDeadline: eventData.registrationDeadline,
            maxParticipants: eventData.maxParticipants,
            waitlistEnabled: eventData.waitlistEnabled,
            tags: eventData.tags ? Array.from(eventData.tags).join(',') : undefined,
            files: files
        });
        return response.data;
    } catch (error) {
        console.error('Failed to create event:', error);
        throw error;
    }
};

export interface MyEventsParams {
    page?: number;
    size?: number;
    sort?: string;
    direction?: 'ASC' | 'DESC';
}

const getMyEvents = async (params: MyEventsParams = {}): Promise<PageEventResponse> => {
    try {
        const response = await eventsApi.getMyEvents({
            page: params.page,
            size: params.size,
            sort: params.sort,
            direction: params.direction
        });

        return response.data;
    } catch (error) {
        console.error("Failed to fetch my events:", error);
        throw error;
    }
};

const getEventRegistrations = async (eventId: number): Promise<RegistrationResponse[]> => {
    try {
        const response = await eventManagerApi.getRegistrationsForEvent({ eventId });
        return response.data;
    } catch (error) {
        console.error('Failed to fetch event Registrations:', error);
        throw error;
    }
}

const updateRegistrationStatus = async (
    registrationId: number,
    status: UpdateStatusRequestStatusEnum

) => {
    const response = await eventManagerApi.updateRegistrationStatus({
        registrationId,
        updateStatusRequest: { status: status },
    });

    return response.data;
};

const markRegistrationCompleted = async (registrationId: number) => {
  const response = await eventManagerApi.markRegistrationAsCompleted({registrationId});
  return response.data;
}

const updateEvent = async (eventId: number, data: UpdateEventRequest, files?: File[], remainingImages?: string[]): Promise<EventResponse> => {
    const formData = new FormData();

    const requestData = {
        ...data,
        existingImageUrls: remainingImages
    };

    // Add request JSON
    const jsonBlob = new Blob([JSON.stringify(requestData)], {
        type: 'application/json'
    });
    formData.append('request', jsonBlob);

    // Add files if present
    if (files) {
        files.forEach((file) => {
            formData.append('files', file);
        });
    }

    const response = await axiosInstance.put<EventResponse>(`/api/events/${eventId}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
}

const deleteEvent = async (id: number): Promise<void> => {
    const response = await eventsApi.deleteEvent({ id });
    return response.data;
}


export const eventService = {
    searchEvents,
    getEventById,
    getEventTags,
    createEvent,
    getMyEvents,
    getEventRegistrations,
    updateRegistrationStatus,
    markRegistrationCompleted,
    updateEvent,
    deleteEvent,
};
