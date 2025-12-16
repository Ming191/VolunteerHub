import type { Meta, StoryObj } from '@storybook/react-vite';
import { EventCardSkeleton } from './EventCardSkeleton';

const meta: Meta<typeof EventCardSkeleton> = {
    title: 'Features/Events/EventCardSkeleton',
    component: EventCardSkeleton,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    decorators: [
        (Story) => (
            <div style={{ width: '350px' }}>
                <Story />
            </div>
        ),
    ],
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default skeleton state shown while event card data is loading
 */
export const Default: Story = {};

/**
 * Multiple skeletons in a grid layout to simulate loading state
 */
export const Grid: Story = {
    decorators: [
        (Story) => (
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 350px)',
                gap: '1.5rem',
            }}>
                <Story />
                <Story />
                <Story />
            </div>
        ),
    ],
};

/**
 * Single skeleton in a narrower container (mobile-like view)
 */
export const Mobile: Story = {
    decorators: [
        (Story) => (
            <div style={{ width: '300px' }}>
                <Story />
            </div>
        ),
    ],
};
