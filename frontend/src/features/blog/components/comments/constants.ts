export const MAX_COMMENT_DEPTH = 3;
export const QUERY_KEY_PREFIX = 'post-comments';

export const itemVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            duration: 0.2,
            ease: "easeOut"
        }
    },
    exit: {
        opacity: 0,
        transition: {
            duration: 0.15,
            ease: "easeIn"
        }
    }
};

export const containerVariants = {
    hidden: { opacity: 1 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.02,
            delayChildren: 0
        }
    }
};

