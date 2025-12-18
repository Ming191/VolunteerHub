export const MAX_COMMENT_DEPTH = 3;
export const QUERY_KEY_PREFIX = 'post-comments';

export const itemVariants = {
    hidden: { y: 10, opacity: 0 },
    show: {
        y: 0,
        opacity: 1,
        transition: {
            type: "spring" as const,
            stiffness: 300,
            damping: 24
        }
    },
    exit: {
        y: -10,
        opacity: 0,
        transition: { duration: 0.2 }
    }
};

export const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05
        }
    }
};

