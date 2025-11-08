import type {Variants} from 'framer-motion';

// Page transition variants
export const pageVariants: Variants = {
    initial: {
        opacity: 0,
        y: 10,
    },
    in: {
        opacity: 1,
        y: 0,
    },
    out: {
        opacity: 0,
        y: -10,
    },
};

// Fade in from left
export const fadeInLeft: Variants = {
    initial: {
        opacity: 0,
        x: -50,
    },
    in: {
        opacity: 1,
        x: 0,
    },
    out: {
        opacity: 0,
        x: 50,
    },
};

// Fade in from right
export const fadeInRight: Variants = {
    initial: {
        opacity: 0,
        x: 50,
    },
    in: {
        opacity: 1,
        x: 0,
    },
    out: {
        opacity: 0,
        x: -50,
    },
};

// Scale fade
export const scaleFade: Variants = {
    initial: {
        opacity: 0,
        scale: 0.9,
    },
    in: {
        opacity: 1,
        scale: 1,
    },
    out: {
        opacity: 0,
        scale: 0.9,
    },
};

// Stagger children animation
export const staggerContainer: Variants = {
    initial: {},
    in: {
        transition: {
            staggerChildren: 0.1,
        },
    },
    out: {},
};

export const staggerItem: Variants = {
    initial: {
        opacity: 0,
        y: 20,
    },
    in: {
        opacity: 1,
        y: 0,
    },
    out: {
        opacity: 0,
        y: 20,
    },
};

// Common transitions
export const pageTransition = {
    type: 'tween' as const,
    ease: 'easeInOut' as const,
    duration: 0.25,
};

export const smoothTransition = {
    type: 'spring' as const,
    stiffness: 260,
    damping: 20,
};

export const fastTransition = {
    type: 'tween' as const,
    ease: 'easeOut' as const,
    duration: 0.2,
};

