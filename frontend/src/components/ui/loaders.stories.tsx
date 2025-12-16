import type { Meta, StoryObj } from '@storybook/react-vite';
import { EventListSkeleton, EventCardSkeleton, DashboardStatSkeleton, TableRowSkeleton, UserListItemSkeleton } from './loaders';

const meta: Meta<typeof EventListSkeleton> = {
    title: 'Components/Loaders/EventListSkeleton',
    component: EventListSkeleton,
    parameters: {
        layout: 'padded',
    },
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default loading skeleton for event list (6 cards)
 */
export const Default: Story = {
    args: {
        count: 6,
    },
};

/**
 * Loading skeleton with 8 cards
 */
export const EightCards: Story = {
    args: {
        count: 8,
    },
};

/**
 * Loading skeleton with 4 cards
 */
export const FourCards: Story = {
    args: {
        count: 4,
    },
};

/**
 * Loading skeleton with 3 cards
 */
export const ThreeCards: Story = {
    args: {
        count: 3,
    },
};

// Also export stories for individual skeleton components

export const SingleEventCard: StoryObj<typeof EventCardSkeleton> = {
    render: () => (
        <div style={{ maxWidth: '350px' }}>
            <EventCardSkeleton />
        </div>
    ),
    parameters: {
        docs: {
            description: {
                story: 'Single event card skeleton for loading state',
            },
        },
    },
};

export const DashboardStats: StoryObj<typeof DashboardStatSkeleton> = {
    render: () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <DashboardStatSkeleton />
            <DashboardStatSkeleton />
            <DashboardStatSkeleton />
            <DashboardStatSkeleton />
        </div>
    ),
    parameters: {
        docs: {
            description: {
                story: 'Dashboard stat cards skeleton for loading state',
            },
        },
    },
};

export const TableRows: StoryObj<typeof TableRowSkeleton> = {
    render: () => (
        <div className="space-y-0">
            <TableRowSkeleton cells={5} />
            <TableRowSkeleton cells={5} />
            <TableRowSkeleton cells={5} />
            <TableRowSkeleton cells={5} />
        </div>
    ),
    parameters: {
        docs: {
            description: {
                story: 'Table row skeletons for loading state',
            },
        },
    },
};

export const UserListItems: StoryObj<typeof UserListItemSkeleton> = {
    render: () => (
        <div className="space-y-2">
            <UserListItemSkeleton />
            <UserListItemSkeleton />
            <UserListItemSkeleton />
        </div>
    ),
    parameters: {
        docs: {
            description: {
                story: 'User list item skeletons for loading state',
            },
        },
    },
};
