import React from 'react';
import { Button } from '@/components/ui/button.tsx';
import { Loader2, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { CommentResponse } from "@/api-client";
import { CommentItem } from './CommentItem';
import { containerVariants } from './constants';

interface CommentsListProps {
    comments: CommentResponse[];
    postId: number;
    isLoading: boolean;
    error: Error | null;
    onRetry: () => void;
    onReply: (commentId: number, content: string) => void;
}

export const CommentsList: React.FC<CommentsListProps> = ({
    comments,
    postId,
    isLoading,
    error,
    onRetry,
    onReply,
}) => {
    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">Loading comments...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-8">
                <p className="text-sm text-destructive mb-2">Failed to load comments</p>
                <Button variant="outline" size="sm" onClick={onRetry}>
                    Try Again
                </Button>
            </div>
        );
    }

    if (comments.length === 0) {
        return (
            <motion.div
                className="text-center py-8"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <MessageSquare className="h-10 w-10 mx-auto text-muted-foreground mb-3 opacity-50" />
                <p className="text-sm text-muted-foreground">
                    No comments yet. Be the first to share your thoughts!
                </p>
            </motion.div>
        );
    }

    return (
        <motion.div
            className="space-y-4"
            variants={containerVariants}
            initial="hidden"
            animate="show"
        >
            <AnimatePresence mode="popLayout">
                {comments.map((comment) => (
                    <CommentItem
                        key={comment.id}
                        comment={comment}
                        postId={postId}
                        onReply={onReply}
                    />
                ))}
            </AnimatePresence>
        </motion.div>
    );
};

