import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { blogService } from '@/features/blog/api/blogService.ts';
import { EVENTS_QUERY_KEY } from '@/features/events/hooks/useEvents';

interface CreatePostParams {
    content: string;
    files: File[] | null;
    eventId?: number;
}

export const usePostMutations = (eventId?: number) => {
    const queryClient = useQueryClient();

    const createPostMutation = useMutation({
        mutationFn: async ({ content, files, eventId: postEventId }: CreatePostParams) => {
            const targetEventId = postEventId || eventId;
            if (!targetEventId) {
                throw new Error("Cannot create post without event (Feed posting not supported yet)");
            }

            const imageUrls: string[] = [];
            if (files && files.length > 0) {
                const uploadPromises = files.map(async (file) => {
                    const { signedUrl, publicUrl } = await blogService.getSignedUrl(targetEventId, file.type, file.name);

                    // Upload to GCS using the signed URL
                    // Note: fetch is used here to avoid attaching API auth headers which might confuse GCS
                    const response = await fetch(signedUrl, {
                        method: 'PUT',
                        body: file,
                        headers: {
                            'Content-Type': file.type,
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
        onSuccess: (savedPost, variables) => {
            const targetEventId = variables?.eventId ?? eventId;
            const targetQueryKey = ['posts', targetEventId ? `event-${targetEventId}` : 'feed'];

            // Invalidate posts query to refetch with new post
            queryClient.invalidateQueries({ queryKey: targetQueryKey });

            // Invalidate event query to refresh gallery images if images were uploaded
            if (targetEventId && savedPost.imageUrls && savedPost.imageUrls.length > 0) {
                queryClient.invalidateQueries({ queryKey: [EVENTS_QUERY_KEY, targetEventId] });
            }

            toast.success("Post created!");
        },
        onError: () => {
            toast.error("Failed to create post");
        },
    });

    return {
        createPostMutation,
    };
};

