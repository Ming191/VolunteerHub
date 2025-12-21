import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { blogService } from "@/features/blog/api/blogService.ts";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { EVENTS_QUERY_KEY } from "@/features/events/hooks/useEvents";

interface CreatePostParams {
  content: string;
  files: File[] | null;
  eventId?: number;
}

export const usePostMutations = (eventId?: number) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const queryKey = ["posts", eventId ? `event-${eventId}` : "feed"];

  const createOptimisticPost = (content: string, files: File[] | null) => ({
    id: Date.now(),
    optimisticId: `optimistic-${Date.now()}`,
    content,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    author: {
      id: user?.userId || 0,
      name: user?.name || "You",
      profilePictureUrl: user?.profilePictureUrl || undefined,
    },
    totalLikes: 0,
    totalComments: 0,
    isLikedByCurrentUser: false,
    imageUrls: files ? files.map((f) => URL.createObjectURL(f)) : [],
    isOptimistic: true,
  });

  const createPostMutation = useMutation({
    mutationFn: async ({
      content,
      files,
      eventId: postEventId,
    }: CreatePostParams) => {
      const targetEventId = postEventId || eventId;
      if (!targetEventId) {
        throw new Error(
          "Cannot create post without event (Feed posting not supported yet)"
        );
      }

      // Upload images to GCS using signed URLs
      const imageUrls: string[] = [];
      if (files && files.length > 0) {
        const uploadPromises = files.map(async (file) => {
          const { signedUrl, publicUrl } = await blogService.getSignedUrl(
            targetEventId,
            file.type,
            file.name
          );

          // Upload to GCS using the signed URL
          // Note: fetch is used here to avoid attaching API auth headers which might confuse GCS
          const response = await fetch(signedUrl, {
            method: "PUT",
            body: file,
            headers: {
              "Content-Type": file.type,
            },
          });

          if (!response.ok) {
            throw new Error(`Failed to upload image: ${response.statusText}`);
          }

          return publicUrl;
        });

        const uploadedUrls = await Promise.all(uploadPromises);
        imageUrls.push(...uploadedUrls);
      }

      return blogService.createPost(targetEventId, content, imageUrls);
    },
    onMutate: async ({ content, files, eventId: mutationEventId }) => {
      const targetEventId = mutationEventId || eventId;
      const targetQueryKey = [
        "posts",
        targetEventId ? `event-${targetEventId}` : "feed",
      ];

      await queryClient.cancelQueries({ queryKey: targetQueryKey });

      const previousPosts = queryClient.getQueryData(targetQueryKey);
      const optimisticPost = createOptimisticPost(content, files);

      queryClient.setQueryData(targetQueryKey, (old: unknown) => {
        const data = old as
          | {
              pages: Array<{
                content: unknown[];
                pageNumber: number;
                last: boolean;
              }>;
            }
          | undefined;
        if (!data) {
          return {
            pages: [
              {
                content: [optimisticPost],
                pageNumber: 0,
                last: true,
                totalElements: 1,
              },
            ],
            pageParams: [0],
          };
        }

        const newPages = [...data.pages];
        if (newPages.length > 0) {
          newPages[0] = {
            ...newPages[0],
            content: [optimisticPost, ...newPages[0].content],
          };
        }

        return { ...data, pages: newPages };
      });

      return { previousPosts, optimisticPost, targetQueryKey };
    },
    onSuccess: (savedPost, variables, context: unknown) => {
      const ctx = context as
        | { targetQueryKey?: unknown[]; optimisticPost?: { id: number } }
        | undefined;
      const key = ctx?.targetQueryKey || queryKey;
      queryClient.setQueryData(key, (old: unknown) => {
        const data = old as
          | { pages: Array<{ content: unknown[] }> }
          | undefined;
        if (!data) return data;

        const newPages = data.pages.map((page: { content: unknown[] }) => ({
          ...page,
          content: page.content.map((post: Record<string, unknown>) => {
            if (post.isOptimistic && post.id === ctx?.optimisticPost?.id) {
              return {
                ...post,
                ...savedPost,
                optimisticId: post.optimisticId, // Preserve the optimistic ID for stable key
                imageUrls:
                  savedPost.imageUrls && savedPost.imageUrls.length > 0
                    ? savedPost.imageUrls
                    : post.imageUrls,
                isOptimistic: false,
              };
            }
            return post;
          }),
        }));

        return { ...data, pages: newPages };
      });

      // Invalidate an event query to refresh gallery images
      const targetEventId = variables?.eventId ?? eventId;
      if (
        targetEventId &&
        savedPost.imageUrls &&
        savedPost.imageUrls.length > 0
      ) {
        queryClient.invalidateQueries({
          queryKey: [EVENTS_QUERY_KEY, targetEventId],
        });
      }

      toast.success("Post created!");
    },
    onError: (_err, _variables, context: unknown) => {
      const ctx = context as
        | { previousPosts?: unknown; targetQueryKey?: unknown[] }
        | undefined;
      if (ctx?.previousPosts) {
        queryClient.setQueryData(
          ctx.targetQueryKey || queryKey,
          ctx.previousPosts
        );
      }
      toast.error("Failed to create post");
    },
    onSettled: (_data, _error, _variables, context: unknown) => {
      const ctx = context as
        | { optimisticPost?: { imageUrls?: string[] } }
        | undefined;
      if (ctx?.optimisticPost?.imageUrls) {
        ctx.optimisticPost.imageUrls.forEach((url: string) => {
          URL.revokeObjectURL(url);
        });
      }

      setTimeout(() => {
        queryClient.invalidateQueries({
          queryKey: context?.targetQueryKey || queryKey,
        });
      }, 5000);
    },
  });

  return {
    createPostMutation,
  };
};
