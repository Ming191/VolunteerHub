import React, { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { useInfiniteQuery } from '@tanstack/react-query';
import { PostCard } from './PostCard.tsx';
import { CreatePost } from './CreatePost.tsx';
import { blogService } from '@/features/blog/api/blogService.ts';
import { Skeleton } from '@/components/ui/skeleton.tsx';
import { usePostMutations } from '@/features/blog/hooks/usePostMutations';
import { Loader2 } from 'lucide-react';

interface BlogFeedProps {
  eventId?: number;
  canPost?: boolean;
}

export const BlogFeed = ({ eventId, canPost = false }: BlogFeedProps) => {
  const { ref, inView } = useInView();
  const { createPostMutation } = usePostMutations(eventId);
  const [hasImages, setHasImages] = React.useState(false);

  const fetchPosts = async ({ pageParam = 0 }) => {
    if (eventId) {
      return blogService.getPostsForEvent(eventId, pageParam, 20);
    }
    return blogService.getRecentPostsFeed(7, pageParam, 20);
  };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey: ['posts', eventId ? `event-${eventId}` : 'feed'],
    queryFn: fetchPosts,
    getNextPageParam: (lastPage: any) => {
      if (lastPage.last) return undefined;
      return lastPage.pageNumber + 1;
    },
    initialPageParam: 0,
  });

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  const handleNewPost = (content: string, files: File[] | null) => {
    setHasImages(!!files && files.length > 0);
    createPostMutation.mutate({ content, files, eventId });
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

  return (
    <div className="max-w-2xl mx-auto w-full pb-10 relative">
      {/* Image Upload Loading Indicator */}
      {createPostMutation.isPending && hasImages && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3 bg-card p-6 rounded-lg shadow-lg border">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <div className="text-center">
              <p className="text-sm font-medium">Uploading images...</p>
              <p className="text-xs text-muted-foreground mt-1">Please wait while we process your images</p>
            </div>
          </div>
        </div>
      )}
      
      {eventId && canPost && (
        <CreatePost onPost={handleNewPost} disabled={createPostMutation.isPending} />
      )}

      <div className="space-y-4">
        {data?.pages.map((page, i) => (
          <React.Fragment key={i}>
            {page.content.map((post: any) => (
              <PostCard key={post.optimisticId || post.id} post={post} />
            ))}
          </React.Fragment>
        ))}

        {data?.pages[0]?.content.length === 0 && (
          <div className="text-center text-muted-foreground py-10">
            No posts yet. Be the first to share!
          </div>
        )}

        <div ref={ref} className="py-4 text-center">
          {isFetchingNextPage && <Skeleton className="h-[100px] w-full rounded-xl" />}
          {!hasNextPage && data?.pages[0]?.content.length !== 0 && (
            <span className="text-muted-foreground text-sm">No more posts</span>
          )}
        </div>
      </div>
    </div>
  );
};
