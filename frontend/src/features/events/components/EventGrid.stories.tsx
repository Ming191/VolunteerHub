import type { Meta, StoryObj } from '@storybook/react-vite';
import { EventGrid } from './EventGrid';
import type { EventResponse } from '@/api-client';

// Mock event data for stories
const mockEvents: EventResponse[] = [
    {
        id: 1,
        title: 'Beach Cleanup Drive',
        description: 'Join us for a community beach cleanup event.',
        location: '123 Beach Road, Coastal City',
        eventDateTime: new Date(Date.now() + 86400000).toISOString(),
        endDateTime: new Date(Date.now() + 90000000).toISOString(),
        maxParticipants: 50,
        approvedCount: 25,
        pendingCount: 5,
        waitlistCount: 0,
        isApproved: true,
        creatorId: 1,
        creatorName: 'Green Earth Foundation',
        imageUrls: [],
        waitlistEnabled: false,
        isFull: false,
        isInProgress: false,
        tags: new Set(),
    },
    {
        id: 2,
        title: 'Food Bank Volunteering',
        description: 'Help sort and distribute food to those in need.',
        location: '456 Charity Lane',
        eventDateTime: new Date(Date.now() + 172800000).toISOString(),
        endDateTime: new Date(Date.now() + 180000000).toISOString(),
        maxParticipants: 30,
        approvedCount: 15,
        pendingCount: 3,
        waitlistCount: 0,
        isApproved: true,
        creatorId: 2,
        creatorName: 'Community Helpers',
        imageUrls: [],
        waitlistEnabled: false,
        isFull: false,
        isInProgress: false,
        tags: new Set(),
    },
    {
        id: 3,
        title: 'Senior Center Visit',
        description: 'Spend time with seniors at the local care center.',
        location: '789 Care Street',
        eventDateTime: new Date(Date.now() + 259200000).toISOString(),
        endDateTime: new Date(Date.now() + 270000000).toISOString(),
        maxParticipants: 20,
        approvedCount: 20,
        pendingCount: 0,
        waitlistCount: 5,
        isApproved: true,
        creatorId: 3,
        creatorName: 'Heart to Heart',
        imageUrls: [],
        waitlistEnabled: true,
        isFull: true,
        isInProgress: false,
        tags: new Set(),
    },
];

const meta: Meta<typeof EventGrid> = {
    title: 'Features/Events/EventGrid',
    component: EventGrid,
    parameters: {
        layout: 'padded',
    },
    tags: ['autodocs'],
    args: {
        onViewDetails: (event) => console.log('View details:', event),
    },
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Loading state with skeleton cards
 */
export const Loading: Story = {
    args: {
        isLoading: true,
        isError: false,
        error: null,
        events: [],
        skeletonsCount: 8,
    },
};

/**
 * Grid with event cards
 */
export const WithEvents: Story = {
    args: {
        isLoading: false,
        isError: false,
        error: null,
        events: mockEvents,
    },
};

/**
 * Empty state when no events are found
 */
export const Empty: Story = {
    args: {
        isLoading: false,
        isError: false,
        error: null,
        events: [],
        emptyStateTitle: 'No events found',
        emptyStateDescription: 'Try adjusting your filters or search terms.',
    },
};

/**
 * Error state when event fetching fails
 */
export const ErrorState: Story = {
    args: {
        isLoading: false,
        isError: true,
        error: new globalThis.Error('Failed to fetch events. Please check your connection.'),
        events: [],
    },
};

/**
 * Loading state with fewer skeleton cards
 */
export const LoadingFewCards: Story = {
    args: {
        isLoading: true,
        isError: false,
        error: null,
        events: [],
        skeletonsCount: 4,
    },
};
