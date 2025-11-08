import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import type {ReactNode} from 'react';
import { fadeOnly, fadeTransition } from '@/lib/fadeAnimations';

interface AnimatedPageProps {
    children: ReactNode;
    className?: string;
    variants?: Variants;
}

export default function AnimatedPage({
    children,
    className = '',
    variants = fadeOnly
}: AnimatedPageProps) {
    return (
        <motion.div
            initial="initial"
            animate="in"
            exit="out"
            variants={variants}
            transition={fadeTransition}
            className={className}
            style={{
                width: '100%',
                minHeight: '100vh'
            }}
        >
            {children}
        </motion.div>
    );
}
