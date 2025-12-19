import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card.tsx';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar.tsx';
import { Button } from '@/components/ui/button.tsx';
import { Separator } from '@/components/ui/separator.tsx';
import { Heart, MessageCircle, Share2, MoreHorizontal, Flag, Trash2, Edit2, Loader2 } from 'lucide-react';
import { formatDistanceToNowUTC } from '@/lib/dateUtils';
import { cn } from '@/lib/utils.ts';
import type { PostResponse } from "@/api-client";
import { PostImages } from './PostImages';
import { PostComments } from './PostComments';
import { AnimatePresence, motion } from 'framer-motion';
import { useLikeMutation } from '@/features/blog/hooks/useLikeMutation';
import { useAuth } from '@/features/auth/hooks/useAuth';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ReportDialog } from '@/features/report/components/ReportDialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogPopup,
    AlertDialogTitle,
} from '@/components/animate-ui/components/base/alert-dialog';
import { blogService } from '@/features/blog/api/blogService';
import { toast } from 'sonner';

interface PostCardProps {
    post: PostResponse;
    onPostDeleted?: (postId: number) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, onPostDeleted }) => {
    const [showComments, setShowComments] = useState(false);
    const [commentsCount, setCommentsCount] = useState(post.totalComments);
    const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const { user } = useAuth();

    const { likesCount, isLiked, toggleLike } = useLikeMutation(
        post.id,
        post.isLikedByCurrentUser,
        post.totalLikes
    );

    const handleExpandComments = () => setShowComments(prev => !prev);

    /* 
     * TODO: Robustly check if current user is author. 
     * Currently PostResponse's author only has name/avatar, no unique ID exposed in this interface. 
     * For now, we allow reporting on all posts (including own, though UI might look weird).
     */
    const isAuthor = user?.userId === post.author.id;

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await blogService.deletePost(post.id);
            toast.success("Post deleted successfully");
            setIsDeleteDialogOpen(false);
            onPostDeleted?.(post.id);
        } catch (error) {
            console.error("Failed to delete post:", error);
            toast.error("Failed to delete post");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleEdit = () => {
        toast.info("Edit feature coming soon!");
    }

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
                        {formatDistanceToNowUTC(post.createdAt, { addSuffix: true })}
                    </span>
                </div>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {isAuthor ? (
                            <>
                                <DropdownMenuItem onClick={handleEdit}>
                                    <Edit2 className="mr-2 h-4 w-4" />
                                    Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    className="text-red-600 focus:text-red-600"
                                    onClick={() => setIsDeleteDialogOpen(true)}
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                </DropdownMenuItem>
                            </>
                        ) : (
                            <DropdownMenuItem
                                className="text-red-600 focus:text-red-600"
                                onClick={() => setIsReportDialogOpen(true)}
                            >
                                <Flag className="mr-2 h-4 w-4" />
                                Report
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardHeader>

            <CardContent className="p-4 pt-0">
                <p className="text-sm mb-3 whitespace-pre-wrap break-words">{post.content}</p>

                <PostImages images={post.imageUrls || []} />
            </CardContent>

            <Separator />

            <div className="flex items-center justify-between px-4 py-2">
                <Button
                    variant="ghost"
                    size="sm"
                    className={cn("flex items-center gap-2", isLiked && "text-red-500 hover:text-red-600")}
                    onClick={toggleLike}
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
                    <span>{commentsCount} Comments</span>
                </Button>
                <Button variant="ghost" size="sm" className="flex items-center gap-2" title="Feature is in developing">
                    <Share2 className="h-4 w-4" />
                    <span>Share</span>
                </Button>
            </div>

            <AnimatePresence>
                {showComments && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                        className="overflow-hidden"
                    >
                        <PostComments
                            postId={post.id}
                            onCommentAdded={() => setCommentsCount(prev => prev + 1)}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            <ReportDialog
                open={isReportDialogOpen}
                onClose={() => setIsReportDialogOpen(false)}
                targetId={post.id}
                targetType="POST"
            />

            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogPopup>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Post?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your post.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                handleDelete();
                            }}
                            disabled={isDeleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogPopup>
            </AlertDialog>
        </Card>
    );
};

