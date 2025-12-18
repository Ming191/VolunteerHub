import React, { useState, useCallback } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar.tsx';
import { Button } from '@/components/ui/button.tsx';
import { AnimatePresence } from 'framer-motion';
import { formatDistanceToNowUTC } from '@/lib/dateUtils';
import type { CommentResponse } from "@/api-client";
import { CommentReplyForm } from './CommentReplyForm';
import { MAX_COMMENT_DEPTH } from './constants';

interface CommentItemProps {
    comment: CommentResponse;
    postId: number;
    depth?: number;
    maxDepth?: number;
    onReply: (commentId: number, content: string) => void;
    isReplying?: boolean;
}

export const CommentItem = React.memo(({
    comment,
    postId,
    depth = 0,
    maxDepth = MAX_COMMENT_DEPTH,
    onReply,
    isReplying = false
}: CommentItemProps) => {
    const [showReplyForm, setShowReplyForm] = useState(false);
    const canReply = depth < maxDepth;
    const hasReplies = comment.replies && comment.replies.length > 0;

    const handleReplySubmit = useCallback((content: string) => {
        onReply(comment.id, content);
        setShowReplyForm(false);
    }, [comment.id, onReply]);

    return (
        <div className={`flex flex-col gap-2 ${depth > 0 ? 'ml-6 mt-3' : ''}`}>
            <div className="flex gap-3">
                <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarImage src={comment.author.profilePictureUrl} alt={comment.author.name} />
                    <AvatarFallback>{comment.author.name?.[0]?.toUpperCase() || '?'}</AvatarFallback>
                </Avatar>                <div className="flex-1 min-w-0">
                    <div className="bg-muted p-3 rounded-lg rounded-tl-none text-sm">
                        <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="font-semibold text-xs truncate">{comment.author.name}</span>
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                                {formatDistanceToNowUTC(comment.createdAt, { addSuffix: true })}
                            </span>
                        </div>
                        <p className="whitespace-pre-wrap break-words">{comment.content}</p>
                    </div>

                    <div className="flex items-center gap-3 mt-1.5 ml-2">
                        {canReply && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground transition-colors"
                                onClick={() => setShowReplyForm(!showReplyForm)}
                                aria-label={`Reply to ${comment.author.name}`}
                            >
                                Reply
                            </Button>
                        )}
                        {!canReply && hasReplies && (
                            <span className="text-xs text-muted-foreground italic">Max thread depth reached</span>
                        )}
                    </div>

                    <AnimatePresence mode="wait">
                        {showReplyForm && (
                            <CommentReplyForm
                                onSubmit={handleReplySubmit}
                                onCancel={() => setShowReplyForm(false)}
                                isSubmitting={isReplying}
                                replyToName={comment.author.name}
                            />
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Nested Replies */}
            {hasReplies && (
                <AnimatePresence mode="popLayout">
                    <div className={`border-l-2 border-muted ${depth < maxDepth - 1 ? 'pl-0' : 'pl-2'}`}>
                        {comment.replies.map((reply) => (
                            <CommentItem
                                key={reply.id}
                                comment={reply}
                                postId={postId}
                                depth={depth + 1}
                                maxDepth={maxDepth}
                                onReply={onReply}
                            />
                        ))}
                    </div>
                </AnimatePresence>
            )}
        </div>
    );
});

CommentItem.displayName = 'CommentItem';

