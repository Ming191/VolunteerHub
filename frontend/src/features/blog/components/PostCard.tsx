import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card.tsx';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar.tsx';
import { Button } from '@/components/ui/button.tsx';
import { Separator } from '@/components/ui/separator.tsx';
import { Heart, MessageCircle, Share2, MoreHorizontal } from 'lucide-react';
import { formatDistanceToNowUTC } from '@/lib/dateUtils';
import { cn } from '@/lib/utils.ts';
import type { PostResponse } from "@/api-client";
import { PostImages } from './PostImages';
import { PostComments } from './PostComments';
import { AnimatePresence, motion } from 'framer-motion';
import { useLikeMutation } from '@/features/blog/hooks/useLikeMutation';

interface PostCardProps {
  post: PostResponse;
}

export const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const [showComments, setShowComments] = useState(false);
  const [commentsCount, setCommentsCount] = useState(post.totalComments);

  const { likesCount, isLiked, toggleLike } = useLikeMutation(
    post.id,
    post.isLikedByCurrentUser,
    post.totalLikes
  );

  const handleExpandComments = () => setShowComments(prev => !prev);

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
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
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
    </Card>
  );
};
