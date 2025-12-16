import { motion, AnimatePresence } from 'framer-motion';
import type { ReactNode } from 'react';

interface FadeInProps {
    children: ReactNode;
    className?: string;
    duration?: number;
}

/**
 * Wrapper component that adds a smooth fade-in animation.
 * Use this to wrap content that replaces a skeleton loader.
 */
export const FadeIn = ({
    children,
    className = '',
    duration = 0.3
}: FadeInProps) => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration, ease: 'easeOut' }}
            className={className}
        >
            {children}
        </motion.div>
    );
};

interface SkeletonTransitionProps {
    isLoading: boolean;
    skeleton: ReactNode;
    children: ReactNode;
    className?: string;
}

/**
 * Component that handles smooth transitions between skeleton and real content.
 * 
 * Usage:
 * ```tsx
 * <SkeletonTransition
 *   isLoading={isLoading}
 *   skeleton={<SettingsPageSkeleton />}
 * >
 *   <ActualContent />
 * </SkeletonTransition>
 * ```
 */
export const SkeletonTransition = ({
    isLoading,
    skeleton,
    children,
    className = ''
}: SkeletonTransitionProps) => {
    return (
        <AnimatePresence mode="wait">
            {isLoading ? (
                <motion.div
                    key="skeleton"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className={className}
                >
                    {skeleton}
                </motion.div>
            ) : (
                <motion.div
                    key="content"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className={className}
                >
                    {children}
                </motion.div>
            )}
        </AnimatePresence>
    );
};
