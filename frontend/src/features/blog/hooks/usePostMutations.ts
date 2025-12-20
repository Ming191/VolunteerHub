import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { blogService } from '@/features/blog/api/blogService.ts';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { EVENTS_QUERY_KEY } from '@/features/events/hooks/useEvents';

interface CreatePostParams {
    content: string;
    files: File[] | null;
    eventId?: number;
}

export const usePostMutations = (eventId?: number) => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const queryKey = ['posts', eventId ? `event-${eventId}` : 'feed'];

    const createOptimisticPost = (content: string, files: File[] | null) => ({
        id: Date.now(),
        optimisticId: `optimistic-${Date.now()}`,
        content,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        author: {
            id: user?.userId || 0,
            name: user?.name || 'You',
        },
        totalLikes: 0,
        totalComments: 0,
        isLikedByCurrentUser: false,
        imageUrls: files ? files.map(f => URL.createObjectURL(f)) : [],
        isOptimistic: true,
    });

    const createPostMutation = useMutation({
        mutationFn: ({ content, files, eventId: postEventId }: CreatePostParams) => {
            const targetEventId = postEventId || eventId;
            if (!targetEventId) {
                throw new Error("Cannot create post without event (Feed posting not supported yet)");
            }
            return blogService.createPost(targetEventId, content, files || undefined);
        },
        onMutate: async ({ content, files, eventId: mutationEventId }) => {
            const targetEventId = mutationEventId || eventId;
            const targetQueryKey = ['posts', targetEventId ? `event-${targetEventId}` : 'feed'];

            await queryClient.cancelQueries({ queryKey: targetQueryKey });

            const previousPosts = queryClient.getQueryData(targetQueryKey);
            const optimisticPost = createOptimisticPost(content, files);

            queryClient.setQueryData(targetQueryKey, (old: any) => {
                if (!old) {
                    return {
                        pages: [{ content: [optimisticPost], pageNumber: 0, last: true, totalElements: 1 }],
                        pageParams: [0]
                    };
                }

                const newPages = [...old.pages];
                if (newPages.length > 0) {
                    newPages[0] = {
                        ...newPages[0],
                        content: [optimisticPost, ...newPages[0].content]
                    };
                }

                return { ...old, pages: newPages };
            });

            return { previousPosts, optimisticPost, targetQueryKey };
        },
        onSuccess: (savedPost, variables, context: any) => {
            const key = context?.targetQueryKey || queryKey;
            queryClient.setQueryData(key, (old: any) => {
                if (!old) return old;

                const newPages = old.pages.map((page: any) => ({
                    ...page,
                    content: page.content.map((post: any) => {
                        if (post.isOptimistic && post.id === context.optimisticPost.id) {
                            return {
                                ...post,
                                ...savedPost,
                                optimisticId: post.optimisticId, // Preserve the optimistic ID for stable key
                                imageUrls: savedPost.imageUrls || post.imageUrls || [],
                                isOptimistic: false,
                            };
                        }
                        return post;
                    })
                }));

                return { ...old, pages: newPages };
            });

            // Invalidate an event query to refresh gallery images
            const targetEventId = variables?.eventId ?? eventId;
            if (targetEventId && savedPost.imageUrls && savedPost.imageUrls.length > 0) {
                queryClient.invalidateQueries({ queryKey: [EVENTS_QUERY_KEY, targetEventId] });
            }

            toast.success("Post created!");
        },
        onError: (_err, _variables, context: any) => {
            if (context?.previousPosts) {
                queryClient.setQueryData(context.targetQueryKey || queryKey, context.previousPosts);
            }
            toast.error("Failed to create post");
        },
        onSettled: (_data, _error, _variables, context: any) => {
            if (context?.optimisticPost?.imageUrls) {
                context.optimisticPost.imageUrls.forEach((url: string) => {
                    URL.revokeObjectURL(url);
                });
            }

            setTimeout(() => {
                queryClient.invalidateQueries({ queryKey: context?.targetQueryKey || queryKey });
            }, 5000);
        }
    });

    return {
        createPostMutation,
    };
};

