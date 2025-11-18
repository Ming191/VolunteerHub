import {
    Configuration, EventsApi, type EventResponse, EnumsApi, type EventTagInfo, type PageEventResponse,
    type CreateEventRequest
} from '@/api-client';
import axiosInstance from '../utils/axiosInstance';

const config = new Configuration({ basePath: '' });
const eventsApi = new EventsApi(config, undefined, axiosInstance);
const enumsApi = new EnumsApi(config, undefined, axiosInstance);

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
        const response = await eventsApi.createEvent({
            request: eventData,
            files: files
        });
        return response.data;
    } catch (error) {
        console.error('Failed to create event:', error);
        throw error;
    }
};

export const eventService = {
    searchEvents,
    getEventById,
    getEventTags,
    createEvent
};