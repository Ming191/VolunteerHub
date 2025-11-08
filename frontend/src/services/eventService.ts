import { Configuration, EventsApi, type EventResponse } from '@/api-client';
import axiosInstance from '../utils/axiosInstance';
import type {PageEventResponse} from '@/api-client';

// Use the same configuration pattern as authService
const config = new Configuration({ basePath: '' });
const eventsApi = new EventsApi(config, undefined, axiosInstance);

// Define a type for search parameters for better type safety
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
 * This will be the primary method for the event list.
 */
const searchEvents = async (params: SearchEventsParams): Promise<PageEventResponse> => {
    try {
        // Use searchEvents endpoint which now supports pagination
        const response = await eventsApi.searchEvents({
            q: params.q,
            upcoming: params.upcoming,
            location: params.location,
            tags: params.tags,
            matchAllTags: params.matchAllTags,
            page: params.page,
            size: params.size,
            sort: 'eventDateTime',
            direction: 'asc'
        });
        return response.data;
    } catch (error) {
        console.error('Failed to fetch events:', error);
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

export const eventService = {
    searchEvents,
    getEventById,
};