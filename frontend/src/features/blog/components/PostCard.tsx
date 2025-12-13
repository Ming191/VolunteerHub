import React, { useState } from 'react';
import { blogService } from '@/features/blog/api/blogService.ts';
import { Card, CardContent, CardHeader } from '@/components/ui/card.tsx';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar.tsx';
import { Button } from '@/components/ui/button.tsx';
import { Separator } from '@/components/ui/separator.tsx';
import { Textarea } from '@/components/ui/textarea.tsx';
import { Dialog, DialogContent } from '@/components/ui/dialog.tsx'; // Import Dialog
import { Heart, MessageCircle, Share2, MoreHorizontal, Send, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils.ts';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { CommentResponse, PostResponse } from "@/api-client";
import { userService } from '@/features/users/api/userService';

interface PostCardProps {
  post: PostResponse;
}

const CommentItem = ({ comment }: { comment: CommentResponse }) => {
  const { data: author } = useQuery({
    queryKey: ['user', comment.author.id],
    queryFn: () => userService.getUserById(comment.author.id),
    staleTime: 1000 * 60 * 5,
  });

  return (
    <div className="flex gap-3">
      <Avatar className="h-8 w-8">
        <AvatarImage src={author?.profilePictureUrl} />
        <AvatarFallback>{comment.author.name[0]}</AvatarFallback>
      </Avatar>
      <div className="flex-1 bg-muted p-2 rounded-lg rounded-tl-none text-sm">
        <span className="font-semibold block text-xs mb-1">{comment.author.name}</span>
        <p>{comment.content}</p>
      </div>
    </div>
  );
};

export const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');

  // State quản lý xem ảnh
  const [previewImageIndex, setPreviewImageIndex] = useState<number | null>(null);

  // Local state for optimistic updates
  const [likesCount, setLikesCount] = useState(post.totalLikes);
  const [isLiked, setIsLiked] = useState(post.isLikedByCurrentUser);
  const [comments, setComments] = useState<CommentResponse[]>([]);

  const { data: author } = useQuery({
    queryKey: ['user', post.author.id],
    queryFn: () => userService.getUserById(post.author.id),
    staleTime: 1000 * 60 * 5,
  });

  // ... (Giữ nguyên các logic likeMutation, commentMutation như cũ)
  const likeMutation = useMutation({
    mutationFn: () => blogService.toggleLike(post.id),
    onMutate: async () => {
      const previousLiked = isLiked;
      setIsLiked(!previousLiked);
      setLikesCount(prev => previousLiked ? prev - 1 : prev + 1);
      return { previousLiked };
    },
    onError: (err, newTodo, context) => {
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

  const handleLike = () => likeMutation.mutate();
  const handleAddComment = () => {
    if (!newComment.trim()) return;
    commentMutation.mutate(newComment);
  };

  // --- LOGIC XỬ LÝ ẢNH ---
  const images = post.imageUrls || [];

  const openImagePreview = (index: number) => {
    setPreviewImageIndex(index);
  };

  const nextImage = () => {
    if (previewImageIndex !== null && previewImageIndex < images.length - 1) {
      setPreviewImageIndex(previewImageIndex + 1);
    }
  };

  const prevImage = () => {
    if (previewImageIndex !== null && previewImageIndex > 0) {
      setPreviewImageIndex(previewImageIndex - 1);
    }
  };

  return (
    <>
      <Card className="w-full mb-4 animate-in fade-in zoom-in-95 duration-300">
        <CardHeader className="flex flex-row items-center gap-4 p-4">
          <Avatar>
            <AvatarImage src={author?.profilePictureUrl} alt={post.author.name} />
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

          {/* --- HIỂN THỊ GRID ẢNH --- */}
          {images.length > 0 && (
            <div className={cn(
              "grid gap-1 rounded-md overflow-hidden mb-3",
              images.length === 1 ? "grid-cols-1" : "grid-cols-2"
            )}>
              {/* Ảnh đầu tiên luôn hiện */}
              <div
                className="relative cursor-pointer hover:opacity-95 transition-opacity"
                onClick={() => openImagePreview(0)}
              >
                <img
                  src={images[0]}
                  alt="Post content 1"
                  className="w-full h-64 object-cover"
                />
              </div>

              {/* Logic hiển thị ảnh thứ 2 hoặc phần còn lại */}
              {images.length > 1 && (
                <div
                  className="relative cursor-pointer hover:opacity-95 transition-opacity"
                  onClick={() => openImagePreview(1)}
                >
                  <img
                    src={images[1]}
                    alt="Post content 2"
                    className="w-full h-64 object-cover"
                  />
                  {/* Overlay nếu có nhiều hơn 2 ảnh */}
                  {images.length > 2 && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                            <span className="text-white text-2xl font-bold">
                                                +{images.length - 1}
                                            </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>

        <Separator />

        {/* Footer Buttons (Like, Comment, Share) - Giữ nguyên */}
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
          <Button variant="ghost" size="sm" className="flex items-center gap-2" title="Feature is in developing">
            <Share2 className="h-4 w-4" />
            <span>Share</span>
          </Button>
        </div>

        {/* Comment Section - Giữ nguyên */}
        {showComments && (
          <div className="bg-muted/30 p-4 pt-0 rounded-b-lg">
            <Separator className="mb-4" />
            <div className="space-y-4 mb-4">
              {comments.map((comment) => (
                <CommentItem key={comment.id} comment={comment} />
              ))}
            </div>
            <div className="flex gap-2 items-center">
              <Avatar className="h-8 w-8">
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

      {/* --- DIALOG XEM ẢNH FULL (SLIDER) --- */}
      <Dialog
        open={previewImageIndex !== null}
        onOpenChange={(open) => !open && setPreviewImageIndex(null)}
      >
        <DialogContent className="max-w-4xl p-0 bg-black/90 border-none text-white overflow-hidden h-[80vh] flex flex-col items-center justify-center">
          {/* Nút tắt Dialog custom (nếu muốn) */}
          <div className="absolute top-4 right-4 z-50">
            <Button
              variant="ghost" size="icon"
              className="text-white hover:bg-white/20 rounded-full"
              onClick={() => setPreviewImageIndex(null)}
            >
              <X className="h-6 w-6" />
            </Button>
          </div>

          {previewImageIndex !== null && images.length > 0 && (
            <div className="relative w-full h-full flex items-center justify-center">
              {/* Nút Prev */}
              {previewImageIndex > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 z-10 text-white hover:bg-white/20 rounded-full h-12 w-12"
                  onClick={(e) => { e.stopPropagation(); prevImage(); }}
                >
                  <ChevronLeft className="h-8 w-8" />
                </Button>
              )}

              {/* Ảnh Chính */}
              <img
                src={images[previewImageIndex]}
                alt={`View ${previewImageIndex}`}
                className="max-h-full max-w-full object-contain"
              />

              {/* Nút Next */}
              {previewImageIndex < images.length - 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 z-10 text-white hover:bg-white/20 rounded-full h-12 w-12"
                  onClick={(e) => { e.stopPropagation(); nextImage(); }}
                >
                  <ChevronRight className="h-8 w-8" />
                </Button>
              )}

              {/* Indicator số trang */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 px-3 py-1 rounded-full text-sm">
                {previewImageIndex + 1} / {images.length}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
