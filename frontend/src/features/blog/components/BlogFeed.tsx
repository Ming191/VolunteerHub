import React, { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { PostCard } from './PostCard.tsx';
import { CreatePost } from './CreatePost.tsx';
import { blogService } from '@/features/blog/api/blogService.ts';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Skeleton } from '@/components/ui/skeleton.tsx';

interface BlogFeedProps {
  eventId?: number;
  canPost?: boolean;
}

export const BlogFeed = ({ eventId, canPost = false }: BlogFeedProps) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { ref, inView } = useInView();

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

  const createPostMutation = useMutation({
    mutationFn: ({ content, files }: { content: string; files: File[] | null }) => {
      if (!eventId) {
        throw new Error("Cannot create post without event (Feed posting not supported yet)");
      }
      return blogService.createPost(eventId, content, files || undefined);
    },
    onMutate: async ({ content, files }) => {
      await queryClient.cancelQueries({ queryKey: ['posts'] });

      const previousPosts = queryClient.getQueryData(['posts', eventId ? `event-${eventId}` : 'feed']);

      const optimisticPost = {
        id: Date.now(),
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
      };

      queryClient.setQueryData(['posts', eventId ? `event-${eventId}` : 'feed'], (old: any) => {
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

        return {
          ...old,
          pages: newPages
        };
      });

      return { previousPosts };
    },
    onSuccess: (savedPost) => {
      queryClient.setQueryData(['posts', eventId ? `event-${eventId}` : 'feed'], (old: any) => {
        if (!old) return old;

        const newPages = old.pages.map((page: any) => ({
          ...page,
          content: page.content.map((post: any) => {
            if (post.isOptimistic) {
              const mergedImages = (savedPost.imageUrls && savedPost.imageUrls.length > 0)
                ? savedPost.imageUrls
                : post.imageUrls;
              return { ...savedPost, imageUrls: mergedImages };
            }
            return post;
          })
        }));

        return { ...old, pages: newPages };
      });
      toast.success("Post created!");
    },
    onError: (err, newPost, context: any) => {
      if (context?.previousPosts) {
        queryClient.setQueryData(['posts', eventId ? `event-${eventId}` : 'feed'], context.previousPosts);
      }
      toast.error("Failed to create post");
    },
    onSettled: () => {
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['posts'] });
      }, 5000);
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

  return (
    <div className="max-w-2xl mx-auto w-full pb-10">
      {eventId && canPost && (
        <CreatePost onPost={handleNewPost} disabled={createPostMutation.isPending} />
      )}

      <div className="space-y-4">
        {data?.pages.map((page, i) => (
          <React.Fragment key={i}>
            {page.content.map((post: any) => (
              <PostCard key={post.id} post={post} />
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
