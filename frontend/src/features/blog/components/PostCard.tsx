import React, { useState } from 'react';
import type { PostResponse, CommentResponse } from '@/features/blog/api/blogService.ts';
import { blogService } from '@/features/blog/api/blogService.ts';
import { Card, CardContent, CardHeader } from '@/components/ui/card.tsx';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar.tsx';
import { Button } from '@/components/ui/button.tsx';
import { Separator } from '@/components/ui/separator.tsx';
import { Textarea } from '@/components/ui/textarea.tsx';
import { Heart, MessageCircle, Share2, MoreHorizontal, Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils.ts';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

interface PostCardProps {
    post: PostResponse;
}

export const PostCard: React.FC<PostCardProps> = ({ post }) => {
    const [showComments, setShowComments] = useState(false);
    const [newComment, setNewComment] = useState('');

    // Local state for optimistic updates
    const [likesCount, setLikesCount] = useState(post.totalLikes);
    const [isLiked, setIsLiked] = useState(post.isLikedByCurrentUser);
    const [comments, setComments] = useState<CommentResponse[]>([]);

    const likeMutation = useMutation({
        mutationFn: () => blogService.toggleLike(post.id),
        onMutate: async () => {
            // Optimistic update
            const previousLiked = isLiked;
            setIsLiked(!previousLiked);
            setLikesCount(prev => previousLiked ? prev - 1 : prev + 1);
            return { previousLiked };
        },
        onError: (err, newTodo, context) => {
            // Revert
            if (context) {
                setIsLiked(context.previousLiked);
                setLikesCount(post.totalLikes);
            }
            toast.error("Failed to update like");
        },
    });

    const commentMutation = useMutation({
        mutationFn: (content: string) => blogService.addComment(post.id, content),
        onSuccess: (newCommentData) => {
            setComments(prev => [...prev, newCommentData]);
            setNewComment('');
        },
        onError: () => {
            toast.error("Failed to post comment");
        }
    });

    // We can also have a separate query for comments if expanding
    const handleExpandComments = async () => {
        if (!showComments && comments.length === 0 && post.totalComments > 0) {
            try {
                const fetchedComments = await blogService.getComments(post.id);
                setComments(fetchedComments);
            } catch (e) {
                console.error(e);
            }
        }
        setShowComments(!showComments);
    };


    const handleLike = () => {
        likeMutation.mutate();
    };

    const handleAddComment = () => {
        if (!newComment.trim()) return;
        commentMutation.mutate(newComment);
    };

    return (
        <Card className="w-full mb-4 animate-in fade-in zoom-in-95 duration-300">
            <CardHeader className="flex flex-row items-center gap-4 p-4">
                <Avatar>
                    <AvatarImage src={post.author.profilePictureUrl} alt={post.author.name} />
                    <AvatarFallback>{post.author.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col flex-1">
                    <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">{post.author.name}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                    </span>
                </div>
                <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </CardHeader>
            <CardContent className="p-4 pt-0">
                <p className="text-sm mb-3 whitespace-pre-wrap">{post.content}</p>
                {post.imageUrls && post.imageUrls.length > 0 && (
                    <div className="rounded-md overflow-hidden mb-3">
                        <img src={post.imageUrls[0]} alt="Post content" className="w-full h-auto object-cover max-h-96" />
                    </div>
                )}
            </CardContent>
            <Separator />
            <div className="flex items-center justify-between px-4 py-2">
                <Button
                    variant="ghost"
                    size="sm"
                    className={cn("flex items-center gap-2", isLiked && "text-red-500 hover:text-red-600")}
                    onClick={handleLike}
                >
                    <Heart className={cn("h-4 w-4", isLiked && "fill-current")} />
                    <span>{likesCount}</span>
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-2"
                    onClick={handleExpandComments}
                >
                    <MessageCircle className="h-4 w-4" />
                    <span>{post.totalComments || comments.length} Comments</span>
                </Button>
                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                    <Share2 className="h-4 w-4" />
                    <span>Share</span>
                </Button>
            </div>

            {showComments && (
                <div className="bg-muted/30 p-4 pt-0 rounded-b-lg">
                    <Separator className="mb-4" />
                    <div className="space-y-4 mb-4">
                        {comments.map((comment) => (
                            <div key={comment.id} className="flex gap-3">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={comment.author.profilePictureUrl} />
                                    <AvatarFallback>{comment.author.name[0]}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 bg-muted p-2 rounded-lg rounded-tl-none text-sm">
                                    <span className="font-semibold block text-xs mb-1">{comment.author.name}</span>
                                    <p>{comment.content}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex gap-2 items-center">
                        <Avatar className="h-8 w-8">
                            {/* Ideally current user avatar */}
                            <AvatarFallback>You</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 relative">
                            <Textarea
                                placeholder="Write a comment..."
                                className="min-h-[40px] pr-10 py-2 resize-none"
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleAddComment();
                                    }
                                }}
                            />
                            <Button
                                size="icon"
                                variant="ghost"
                                className="absolute right-1 top-1 h-8 w-8 text-primary"
                                onClick={handleAddComment}
                                disabled={!newComment.trim() || commentMutation.isPending}
                            >
                                <Send className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </Card>
    );
};
