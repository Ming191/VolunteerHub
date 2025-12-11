import { PostCard } from './PostCard.tsx';
import { CreatePost } from './CreatePost.tsx';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { blogService } from '@/features/blog/api/blogService.ts';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton.tsx';

interface BlogFeedProps {
    eventId?: number;
}

export const BlogFeed = ({ eventId }: BlogFeedProps) => {
    const queryClient = useQueryClient();

    const { data: pageData, isLoading, isError } = useQuery({
        queryKey: ['posts', eventId ? `event-${eventId}` : 'feed'],
        queryFn: () => eventId
            ? blogService.getPostsForEvent(eventId)
            : blogService.getRecentPostsFeed(),
    });

    const createPostMutation = useMutation({
        mutationFn: (content: string) => {
            if (!eventId) throw new Error("Cannot create post without event (Feed posting not supported yet)");
            return blogService.createPost(eventId, content);
        },
        onSuccess: () => {
            toast.success("Post created!");
            queryClient.invalidateQueries({ queryKey: ['posts'] });
        },
        onError: () => {
            toast.error("Failed to create post");
        }
    });

    const handleNewPost = (content: string) => {
        createPostMutation.mutate(content);
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
