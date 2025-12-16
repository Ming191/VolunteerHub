import type { Meta, StoryObj } from '@storybook/react';
import { OrganizerStats } from './OrganizerStats';
import { PendingRegistrationsList } from './PendingRegistrationsList';
import { EventsInReviewList } from './EventsInReviewList';
import { TopEventsList } from './TopEventsList';
import { OrganizerQuickActions } from './OrganizerQuickActions';

const meta: Meta = {
    title: 'Features/Organizer/Components',
    tags: ['autodocs'],
};

export default meta;

export const Stats: StoryObj<typeof OrganizerStats> = {
    render: () => (
        <OrganizerStats
            stats={{ pendingRegistrations: 12, eventsPendingAdminApproval: 3, totalEvents: 45 }}
        />
    )
};

export const PendingRegistrations: StoryObj<typeof PendingRegistrationsList> = {
    render: () => (
        <PendingRegistrationsList
            registrations={[
                { id: 1, primaryText: "John Doe", secondaryText: "Cleanup Event", timestamp: new Date().toISOString() },
                { id: 2, primaryText: "Jane Smith", secondaryText: "Food Drive", timestamp: new Date(Date.now() - 5000000).toISOString() }
            ]}
            onRegistrationClick={() => console.log('onRegistrationClick')}
        />
    )
};

export const EventsInReview: StoryObj<typeof EventsInReviewList> = {
    render: () => (
        <EventsInReviewList
            events={[
                { id: 1, title: "Grand Marathon", location: "Downtown" },
                { id: 2, title: "Music Festival", location: "City Park" }
            ] as any}
            onEventClick={() => console.log('onEventClick')}
        />
    )
};

export const TopEvents: StoryObj<typeof TopEventsList> = {
    render: () => (
        <TopEventsList
            events={[
                { id: 1, title: "Summer Camp", count: 120 },
                { id: 2, title: "Tech Talk", count: 85 },
                { id: 3, title: "Art Workshop", count: 45 }
            ]}
            onEventClick={() => console.log('onEventClick')}
        />
    )
};

export const QuickActions: StoryObj<typeof OrganizerQuickActions> = {
    render: () => (
        <OrganizerQuickActions
            onCreateEvent={() => console.log('onCreateEvent')}
            onManageEvents={() => console.log('onManageEvents')}
            onRegistrations={() => console.log('onRegistrations')}
            onAnalytics={() => console.log('onAnalytics')}
        />
    )
};
