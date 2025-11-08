import type { Variants } from 'framer-motion';

// Simple fade-only variant (no movement - prevents scrollbar issues)
export const fadeOnly: Variants = {
    initial: {
        opacity: 0,
    },
    in: {
        opacity: 1,
    },
    out: {
        opacity: 0,
    },
};

export const fadeTransition = {
    type: 'tween' as const,
    ease: 'easeInOut' as const,
    duration: 0.2,
};

