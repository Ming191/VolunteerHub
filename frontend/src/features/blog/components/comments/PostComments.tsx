import React, { useState, useCallback } from 'react';
import { Separator } from '@/components/ui/separator.tsx';
import { useQuery } from '@tanstack/react-query';
import { blogService } from '@/features/blog/api/blogService.ts';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { CommentsList } from './CommentsList';
import { CommentInput } from './CommentInput';
import { useCommentMutations } from './useCommentMutations';
import { QUERY_KEY_PREFIX } from './constants';

interface PostCommentsProps {
    postId: number;
    onCommentAdded: () => void;
    commentsDisabled?: boolean;
}

export const PostComments: React.FC<PostCommentsProps> = ({ postId, onCommentAdded, commentsDisabled = false }) => {
    const { user } = useAuth();
    const [newComment, setNewComment] = useState('');
    const { addCommentMutation, addReplyMutation, updateCommentMutation, deleteCommentMutation } = useCommentMutations(postId);

    const { data: comments = [], isLoading, error, refetch } = useQuery({
        queryKey: [QUERY_KEY_PREFIX, postId],
        queryFn: () => blogService.getComments(postId),
        staleTime: 30000,
        gcTime: 300000,
        refetchOnWindowFocus: true,
    });

    const handleAddComment = useCallback(() => {
        if (!newComment.trim() || addCommentMutation.isPending) return;
        addCommentMutation.mutate(newComment, {
            onSuccess: () => {
                setNewComment('');
                onCommentAdded();
            }
        });
    }, [newComment, addCommentMutation, onCommentAdded]);

    const handleReply = useCallback((commentId: number, content: string) => {
        addReplyMutation.mutate({ content, parentId: commentId });
    }, [addReplyMutation]);

    const handleUpdateComment = useCallback((commentId: number, content: string) => {
        updateCommentMutation.mutate({ commentId, content });
    }, [updateCommentMutation]);

    const handleDeleteComment = useCallback((commentId: number) => {
        deleteCommentMutation.mutate(commentId);
    }, [deleteCommentMutation]);

    return (
        <div className="bg-muted/30 p-4 pt-0 rounded-b-lg">
            <Separator className="mb-4" />

            <div className="min-h-[200px] mb-4">
                <CommentsList
                    comments={comments}
                    postId={postId}
                    isLoading={isLoading}
                    error={error}
                    onRetry={refetch}
                    onReply={handleReply}
                    onUpdate={handleUpdateComment}
                    onDelete={handleDeleteComment}
                />
            </div>

            <div className="sticky bottom-0 p-3 -mx-2 rounded-lg">
                <CommentInput
                    value={newComment}
                    onChange={setNewComment}
                    onSubmit={handleAddComment}
                    placeholder={commentsDisabled ? "Comments are disabled" : "Write a comment..."}
                    userAvatar={user?.profilePictureUrl}
                    userName={user?.name}
                    isSubmitting={addCommentMutation.isPending}
                    disabled={commentsDisabled}
                />
            </div>
        </div>
    );
};

