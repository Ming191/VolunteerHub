import type { Meta, StoryObj } from '@storybook/react';
import { VolunteerStats } from './VolunteerStats';
import { UpcomingEventsList } from './UpcomingEventsList';
import { PendingRegistrationsList } from './PendingRegistrationsList';
import { NewOpportunitiesList } from './NewOpportunitiesList';
import { VolunteerQuickActions } from './VolunteerQuickActions';

const meta: Meta = {
    title: 'Features/Volunteer/Components',
    tags: ['autodocs'],
};

export default meta;

export const Stats: StoryObj<typeof VolunteerStats> = {
    render: () => (
        <VolunteerStats
            stats={{ upcomingCount: 5, pendingCount: 2, newCount: 12 }}
        />
    )
};

const sampleEvents = [
    {
        id: 1,
        title: "Community Cleanup",
        eventDateTime: new Date().toISOString(),
        location: "Central Park"
    },
    {
        id: 2,
        title: "Food Drive",
        eventDateTime: new Date(Date.now() + 86400000).toISOString(),
        location: "Community Center"
    }
] as any; // Cast as any to avoid full compatible type mock

export const UpcomingEvents: StoryObj<typeof UpcomingEventsList> = {
    render: () => (
        <UpcomingEventsList
            events={sampleEvents}
            onEventClick={() => console.log('onEventClick')}
        />
    )
};

export const PendingRegistrations: StoryObj<typeof PendingRegistrationsList> = {
    render: () => (
        <PendingRegistrationsList
            registrations={[
                { eventId: 1, eventTitle: "Charity Run", registeredAt: new Date().toISOString() },
                { eventId: 2, eventTitle: "Beach Clean", registeredAt: new Date(Date.now() - 10000000).toISOString() }
            ]}
            onEventClick={() => console.log('onEventClick')}
        />
    )
};

export const QuickActions: StoryObj<typeof VolunteerQuickActions> = {
    render: () => (
        <VolunteerQuickActions
            onBrowse={() => console.log('onBrowse')}
            onRegistrations={() => console.log('onRegistrations')}
            onNotifications={() => console.log('onNotifications')}
            onProfile={() => console.log('onProfile')}
        />
    )
};
