import React, { useState, useCallback } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { AnimatePresence } from 'framer-motion';
import { formatDistanceToNowUTC } from '@/lib/dateUtils';
import type { CommentResponse } from "@/api-client";
import { CommentReplyForm } from './CommentReplyForm';
import { MAX_COMMENT_DEPTH } from './constants';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { MoreHorizontal, Edit2, Trash2, Flag } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { Textarea } from '@/components/ui/textarea';
import { ReportDialog } from '@/features/report/components/ReportDialog';

interface CommentItemProps {
    comment: CommentResponse;
    postId: number;
    depth?: number;
    maxDepth?: number;
    onReply: (commentId: number, content: string) => void;
    onUpdate: (commentId: number, content: string) => void;
    onDelete: (commentId: number) => void;
    isReplying?: boolean;
}

export const CommentItem = React.memo(({
    comment,
    postId,
    depth = 0,
    maxDepth = MAX_COMMENT_DEPTH,
    onReply,
    onUpdate,
    onDelete,
    isReplying = false
}: CommentItemProps) => {
    const { user } = useAuth();
    const [showReplyForm, setShowReplyForm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editedContent, setEditedContent] = useState(comment.content);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
    const canReply = depth < maxDepth;
    const hasReplies = comment.replies && comment.replies.length > 0;
    const isAuthor = user?.userId === comment.author.id;

    const handleReplySubmit = useCallback((content: string) => {
        onReply(comment.id, content);
        setShowReplyForm(false);
    }, [comment.id, onReply]);

    const handleEditSave = useCallback(() => {
        if (editedContent.trim() && editedContent !== comment.content) {
            onUpdate(comment.id, editedContent);
        }
        setIsEditing(false);
    }, [comment.id, comment.content, editedContent, onUpdate]);

    const handleEditCancel = useCallback(() => {
        setEditedContent(comment.content);
        setIsEditing(false);
    }, [comment.content]);

    const handleDelete = useCallback(() => {
        onDelete(comment.id);
        setIsDeleteDialogOpen(false);
    }, [comment.id, onDelete]);

    return (
        <div className={`flex flex-col gap-2 ${depth > 0 ? 'ml-6 mt-3' : ''}`}>
            <div className="flex gap-3">
                <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarImage src={comment.author.profilePictureUrl} alt={comment.author.name} />
                    <AvatarFallback>{comment.author.name?.[0]?.toUpperCase() || '?'}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                    <div className="bg-muted p-3 rounded-lg rounded-tl-none text-sm">
                        <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="font-semibold text-xs truncate">{comment.author.name}</span>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground whitespace-nowrap">
                                    {formatDistanceToNowUTC(comment.createdAt, { addSuffix: true })}
                                </span>
                                {user && !isEditing && (
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-6 w-6">
                                                <MoreHorizontal className="h-3 w-3" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            {isAuthor ? (
                                                <>
                                                    <DropdownMenuItem onClick={() => setIsEditing(true)}>
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
                                                    onClick={() => setIsReportDialogOpen(true)}
                                                    className="text-red-600 focus:text-red-600"
                                                >
                                                    <Flag className="mr-2 h-4 w-4" />
                                                    Report
                                                </DropdownMenuItem>
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                )}
                            </div>
                        </div>
                        {isEditing ? (
                            <div className="space-y-2">
                                <Textarea
                                    value={editedContent}
                                    onChange={(e) => setEditedContent(e.target.value)}
                                    className="min-h-[60px] resize-none"
                                    autoFocus
                                />
                                <div className="flex gap-2 justify-end">
                                    <Button size="sm" variant="ghost" onClick={handleEditCancel}>
                                        Cancel
                                    </Button>
                                    <Button size="sm" onClick={handleEditSave} disabled={!editedContent.trim()}>
                                        Save
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <p className="whitespace-pre-wrap break-words">{comment.content}</p>
                        )}
                    </div>

                    <div className="flex items-center gap-3 mt-1.5 ml-2">
                        {canReply && !isEditing && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground transition-colors"
                                onClick={() => setShowReplyForm(!showReplyForm)}
                                aria-label={`Reply to ${comment.author.name}`}
                            >
                                Reply
                            </Button>
                        )}
                        {!canReply && hasReplies && (
                            <span className="text-xs text-muted-foreground italic">Max thread depth reached</span>
                        )}
                    </div>

                    <AnimatePresence mode="wait">
                        {showReplyForm && (
                            <CommentReplyForm
                                onSubmit={handleReplySubmit}
                                onCancel={() => setShowReplyForm(false)}
                                isSubmitting={isReplying}
                                replyToName={comment.author.name}
                            />
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Nested Replies */}
            {hasReplies && (
                <AnimatePresence mode="popLayout">
                    <div className={`border-l-2 border-muted ${depth < maxDepth - 1 ? 'pl-0' : 'pl-2'}`}>
                        {comment.replies.map((reply) => (
                            <CommentItem
                                key={reply.id}
                                comment={reply}
                                postId={postId}
                                depth={depth + 1}
                                maxDepth={maxDepth}
                                onReply={onReply}
                                onUpdate={onUpdate}
                                onDelete={onDelete}
                            />
                        ))}
                    </div>
                </AnimatePresence>
            )}

            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogPopup>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Comment?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your comment.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                handleDelete();
                            }}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogPopup>
            </AlertDialog>

            <ReportDialog
                open={isReportDialogOpen}
                onClose={() => setIsReportDialogOpen(false)}
                targetId={comment.id}
                targetType="COMMENT"
            />
        </div>
    );
});

CommentItem.displayName = 'CommentItem';
