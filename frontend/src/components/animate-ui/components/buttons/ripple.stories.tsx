import type { Meta, StoryObj } from '@storybook/react';
import { RippleButton, RippleButtonRipples } from './ripple';
import { Loader2, Send, Trash2 } from 'lucide-react';

const meta = {
    title: 'Animate UI/Buttons/RippleButton',
    component: RippleButton,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    argTypes: {
        variant: {
            control: 'select',
            options: [
                'default',
                'accent',
                'destructive',
                'outline',
                'secondary',
                'ghost',
                'link',
            ],
            description: 'The visual style of the button',
        },
        size: {
            control: 'select',
            options: ['default', 'sm', 'lg', 'icon', 'icon-sm', 'icon-lg'],
            description: 'The size of the button',
        },
        disabled: {
            control: 'boolean',
            description: 'Whether the button is disabled',
        },
        children: {
            control: 'text',
            description: 'Content of the button',
        },
    },
} satisfies Meta<typeof RippleButton>;

export default meta;
type Story = StoryObj<typeof meta>;

// RippleButton now includes ripples by default, so we don't need the helper or manual insertion

export const Default: Story = {
    args: {
        variant: 'default',
        size: 'default',
        children: 'Ripple Button',
    },
};

export const Accent: Story = {
    args: {
        variant: 'accent',
        children: 'Accent Button',
    },
};

export const Destructive: Story = {
    args: {
        variant: 'destructive',
        children: 'Delete Item',
    },
    render: (args) => (
        <RippleButton {...args}>
            <Trash2 className="mr-2 h-4 w-4" />
            {args.children}
        </RippleButton>
    ),
};

export const Outline: Story = {
    args: {
        variant: 'outline',
        children: 'Outline Button',
    },
};

export const Ghost: Story = {
    args: {
        variant: 'ghost',
        children: 'Ghost Button',
    },
};

export const WithIcon: Story = {
    args: {
        variant: 'default',
        children: 'Send Message',
    },
    render: (args) => (
        <RippleButton {...args}>
            <Send className="mr-2 h-4 w-4" />
            {args.children}
        </RippleButton>
    ),
};

export const Loading: Story = {
    args: {
        disabled: true,
        children: 'Please wait',
    },
    render: (args) => (
        <RippleButton {...args}>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {args.children}
        </RippleButton>
    ),
};

export const CustomRippleColor: Story = {
    args: {
        variant: 'outline',
        children: 'Custom Red Ripple',
    },
    render: (args) => (
        <RippleButton {...args}>
            {args.children}
            <RippleButtonRipples color="rgba(255, 0, 0, 0.5)" />
        </RippleButton>
    ),
};

export const AllVariants: Story = {
    render: () => (
        <div className="flex flex-col gap-4">
            <div className="flex gap-4 items-center flex-wrap">
                <RippleButton variant="default">
                    Default
                </RippleButton>
                <RippleButton variant="accent">
                    Accent
                </RippleButton>
                <RippleButton variant="destructive">
                    Destructive
                </RippleButton>
                <RippleButton variant="outline">
                    Outline
                </RippleButton>
                <RippleButton variant="secondary">
                    Secondary
                </RippleButton>
                <RippleButton variant="ghost">
                    Ghost
                </RippleButton>
                <RippleButton variant="link">
                    Link
                </RippleButton>
            </div>
        </div>
    ),
};
