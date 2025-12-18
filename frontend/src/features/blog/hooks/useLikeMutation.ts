import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { blogService } from '@/features/blog/api/blogService.ts';

export const useLikeMutation = (postId: number, initialLiked: boolean, initialCount: number) => {
    const [likesCount, setLikesCount] = useState(initialCount);
    const [isLiked, setIsLiked] = useState(initialLiked);

    const likeMutation = useMutation({
        mutationFn: () => blogService.toggleLike(postId),
        onMutate: async () => {
            const previousLiked = isLiked;
            const previousLikesCount = likesCount;
            setIsLiked(!previousLiked);
            setLikesCount(prev => previousLiked ? prev - 1 : prev + 1);
            return { previousLiked, previousLikesCount };
        },
        onError: (_err, _variables, context) => {
            if (context) {
                setIsLiked(context.previousLiked);
                setLikesCount(context.previousLikesCount);
            }
            toast.error("Failed to update like");
        },
    });

    return {
        likesCount,
        isLiked,
        toggleLike: () => likeMutation.mutate(),
        isLoading: likeMutation.isPending,
    };
};

