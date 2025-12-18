import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { blogService } from '@/features/blog/api/blogService.ts';
import { useAuth } from '@/features/auth/hooks/useAuth';
import type { CommentResponse } from "@/api-client";
import { QUERY_KEY_PREFIX } from './constants';

export const useCommentMutations = (postId: number) => {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    const createOptimisticComment = (content: string): CommentResponse => ({
        id: Date.now(),
        content,
        author: {
            id: user?.userId || 0,
            name: user?.name || 'You',
            profilePictureUrl: user?.profilePictureUrl || '',
        },
        createdAt: new Date().toISOString(),
        replyCount: 0,
        replies: [],
    });

    const addCommentMutation = useMutation({
        mutationFn: (content: string) => blogService.addComment(postId, content),
        onMutate: async (content) => {
            await queryClient.cancelQueries({ queryKey: [QUERY_KEY_PREFIX, postId] });
            const previousComments = queryClient.getQueryData<CommentResponse[]>([QUERY_KEY_PREFIX, postId]);
            const optimisticComment = createOptimisticComment(content);

            queryClient.setQueryData<CommentResponse[]>(
                [QUERY_KEY_PREFIX, postId],
                (old = []) => [...old, optimisticComment]
            );

            return { previousComments };
        },
        onSuccess: () => {
            toast.success("Comment posted successfully");
        },
        onError: (_error, _variables, context) => {
            if (context?.previousComments) {
                queryClient.setQueryData([QUERY_KEY_PREFIX, postId], context.previousComments);
            }
            toast.error("Failed to post comment");
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEY_PREFIX, postId] });
        }
    });

    const insertReplyRecursively = (
        comments: CommentResponse[],
        parentId: number,
        newReply: CommentResponse
    ): CommentResponse[] => {
        return comments.map(comment => {
            if (comment.id === parentId) {
                return {
                    ...comment,
                    replies: [...(comment.replies || []), newReply],
                    replyCount: (comment.replyCount || 0) + 1
                };
            }
            if (comment.replies && comment.replies.length > 0) {
                return {
                    ...comment,
                    replies: insertReplyRecursively(comment.replies, parentId, newReply)
                };
            }
            return comment;
        });
    };

    const addReplyMutation = useMutation({
        mutationFn: ({ content, parentId }: { content: string; parentId: number }) =>
            blogService.addComment(postId, content, parentId),
        onMutate: async ({ content, parentId }) => {
            await queryClient.cancelQueries({ queryKey: [QUERY_KEY_PREFIX, postId] });
            const previousComments = queryClient.getQueryData<CommentResponse[]>([QUERY_KEY_PREFIX, postId]);
            const optimisticReply = createOptimisticComment(content);

            queryClient.setQueryData<CommentResponse[]>(
                [QUERY_KEY_PREFIX, postId],
                (old = []) => insertReplyRecursively(old, parentId, optimisticReply)
            );

            return { previousComments, optimisticReply };
        },
        onSuccess: () => {
            toast.success("Reply posted successfully");
        },
        onError: (_error, _variables, context) => {
            if (context?.previousComments) {
                queryClient.setQueryData([QUERY_KEY_PREFIX, postId], context.previousComments);
            }
            toast.error("Failed to post reply");
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEY_PREFIX, postId] });
        }
    });

    return {
        addCommentMutation,
        addReplyMutation,
    };
};

