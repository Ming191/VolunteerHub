import { PostCard } from './PostCard.tsx';
import { CreatePost } from './CreatePost.tsx';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { blogService } from '@/features/blog/api/blogService.ts';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton.tsx';
import { useAuth } from '@/features/auth/hooks/useAuth';

interface BlogFeedProps {
    eventId?: number;
}

export const BlogFeed = ({ eventId }: BlogFeedProps) => {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    const { data: pageData, isLoading, isError } = useQuery({
        queryKey: ['posts', eventId ? `event-${eventId}` : 'feed'],
        queryFn: () => eventId
            ? blogService.getPostsForEvent(eventId)
            : blogService.getRecentPostsFeed(),
    });

    const createPostMutation = useMutation({
        mutationFn: ({ content, files }: { content: string; files: File[] | null }) => {
            if (!eventId) throw new Error("Cannot create post without event (Feed posting not supported yet)");
            return blogService.createPost(eventId, content, files || undefined);
        },
        onMutate: async ({ content, files }) => {
            await queryClient.cancelQueries({ queryKey: ['posts'] });

            const previousPosts = queryClient.getQueryData(['posts', eventId ? `event-${eventId}` : 'feed']);

            // Create optimistic post
            const optimisticPost = {
                id: Date.now(), // Temporary ID
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
                isOptimistic: true, // Flag to identify optimistic posts
            };

            queryClient.setQueryData(['posts', eventId ? `event-${eventId}` : 'feed'], (old: any) => {
                if (!old) return { content: [optimisticPost] };
                return {
                    ...old,
                    content: [optimisticPost, ...old.content],
                };
            });

            return { previousPosts };
        },
        onSuccess: (savedPost, variables, context) => {
            // Update the optimistic post with the real one
            queryClient.setQueryData(['posts', eventId ? `event-${eventId}` : 'feed'], (old: any) => {
                if (!old) return old;
                return {
                    ...old,
                    content: old.content.map((post: any) => {
                        // Match by content and author if ID doesn't match (since optimistic ID is fake)
                        // OR just assume the first one is the one we just added if we prepend.
                        // Better: match by the temp ID we generated? We can't easily pass it back from mutationFn.
                        // Simple approach: Replace the one that isOptimistic
                        if (post.isOptimistic) {
                            // If server hasn't processed images yet, keep local previews
                            const mergedImages = (savedPost.imageUrls && savedPost.imageUrls.length > 0)
                                ? savedPost.imageUrls
                                : post.imageUrls;

                            return { ...savedPost, imageUrls: mergedImages };
                        }
                        return post;
                    }),
                };
            });
            toast.success("Post created!");
        },
        onError: (err,  newPost, context: any) => {
            if (context?.previousPosts) {
                queryClient.setQueryData(['posts', eventId ? `event-${eventId}` : 'feed'], context.previousPosts);
            }
            toast.error("Failed to create post");
        },
        onSettled: () => {
            // Re-fetch eventually to get real image URLs
            // Debounce this or just let it be. Immediate invalidation might clear the local blobs too soon if server is slow.
            // Let's invalidate after a delay or just let the onSuccess handling keep the view consistent.
            // We'll invalidate to be safe but maybe after a short delay?
            // Actually, standard practice is invalidate. But here we have the "slow backend" issue.
            // If we invalidate immediately, we might get the "no images" version from server again.
            // So we relying on the manual update in onSuccess to keep it looking good.
            // We can skip invalidation here or delay it. Let's skip immediate invalidation to preserve the optimistic/patched state.
            // But we should invalidate eventually.
            setTimeout(() => {
                queryClient.invalidateQueries({ queryKey: ['posts'] });
            }, 5000); // Check 5 seconds later
        }
    });

    const handleNewPost = (content: string, files: File[] | null) => {
        createPostMutation.mutate({ content, files });
    };

    if (isLoading) {
        return (
            <div className="max-w-2xl mx-auto w-full space-y-4">
                <Skeleton className="h-[120px] w-full rounded-xl" />
                <Skeleton className="h-[200px] w-full rounded-xl" />
                <Skeleton className="h-[200px] w-full rounded-xl" />
            </div>
        );
    }

    if (isError) {
        return <div className="text-center text-red-500 py-10">Failed to load posts.</div>;
    }

    const posts = pageData?.content || [];

    return (
        <div className="max-w-2xl mx-auto w-full pb-10">
            {eventId && (
                <CreatePost onPost={handleNewPost} disabled={createPostMutation.isPending} />
            )}

            <div className="space-y-4">
                {posts.length === 0 ? (
                    <div className="text-center text-muted-foreground py-10">
                        No posts yet. Be the first to share!
                    </div>
                ) : (
                    posts.map((post) => (
                        <PostCard key={post.id} post={post} />
                    ))
                )}
            </div>
        </div>
    );
};
