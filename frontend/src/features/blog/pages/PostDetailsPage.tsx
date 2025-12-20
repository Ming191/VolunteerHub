import { useParams } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { blogService } from '../api/blogService';
import { PostCard } from '../components/PostCard';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';

export const PostDetailsPage = () => {
    const { eventId, postId } = useParams({ from: '/_auth/events/$eventId/posts/$postId' });
    const navigate = useNavigate();

    const { data: post, isLoading, error } = useQuery({
        queryKey: ['post', eventId, postId],
        queryFn: () => blogService.getPost(Number(eventId), Number(postId)),
    });

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error || !post) {
        return (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
                <p className="text-destructive font-medium">Failed to load post</p>
                <Button variant="outline" onClick={() => window.history.back()}>
                    Go Back
                </Button>
            </div>
        );
    }

    return (
        <div className="container max-w-2xl mx-auto py-6 px-4">
            <Button
                variant="ghost"
                className="mb-4 pl-0 hover:bg-transparent hover:text-primary"
                onClick={() => window.history.back()}
            >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
            </Button>

            <PostCard
                post={post}
                onPostDeleted={() => navigate({ to: '/events/$eventId', params: { eventId } })}
            />
        </div>
    );
};
