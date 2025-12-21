import React, { useState, useCallback } from "react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar.tsx";
import { Button } from "@/components/ui/button.tsx";
import { AnimatePresence, motion } from "framer-motion";
import { formatDistanceToNowUTC } from "@/lib/dateUtils";
import type { CommentResponse } from "@/api-client";
import { CommentReplyForm } from "./CommentReplyForm";
import { MAX_COMMENT_DEPTH } from "./constants";
import { useAuth } from "@/features/auth/hooks/useAuth";
import {
  MoreHorizontal,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronUp,
  Flag,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogPopup,
  AlertDialogTitle,
} from "@/components/animate-ui/components/base/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { ReportDialog } from "@/features/report/components/ReportDialog";

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

export const CommentItem = React.memo(
  ({
    comment,
    postId,
    depth = 0,
    maxDepth = MAX_COMMENT_DEPTH,
    onReply,
    onUpdate,
    onDelete,
    isReplying = false,
  }: CommentItemProps) => {
    const { user } = useAuth();
    const [showReplyForm, setShowReplyForm] = useState(false);
    const [showReplies, setShowReplies] = useState(false); // Facebook-style: hide replies by default
    const [isEditing, setIsEditing] = useState(false);
    const [editedContent, setEditedContent] = useState(comment.content);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
    const canReply = depth < maxDepth;
    const hasReplies = comment.replies && comment.replies.length > 0;
    const replyCount = comment.replies?.length || 0;
    const isAuthor = user?.userId === comment.author.id;

    const handleReplySubmit = useCallback(
      (content: string) => {
        onReply(comment.id, content);
        setShowReplyForm(false);
      },
      [comment.id, onReply]
    );

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
      <div
        className={`flex flex-col ${
          depth > 0
            ? "ml-8 mt-2"
            : "p-4 border-2 border-gray-200 rounded-lg bg-white hover:shadow-md transition-shadow mb-3"
        }`}
      >
        <div className="flex gap-3">
          <Avatar className="h-9 w-9 flex-shrink-0">
            <AvatarImage
              src={comment.author.profilePictureUrl}
              alt={comment.author.name}
            />
            <AvatarFallback className="bg-green-600 text-white text-sm">
              {comment.author.name?.[0]?.toUpperCase() || "?"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="bg-gray-100 px-3 py-2 rounded-2xl inline-block max-w-full">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <span className="font-semibold text-sm block">
                    {comment.author.name}
                  </span>
                  {isEditing ? (
                    <div className="space-y-2 mt-2">
                      <Textarea
                        value={editedContent}
                        onChange={(e) => setEditedContent(e.target.value)}
                        className="min-h-[60px] resize-none bg-white"
                        autoFocus
                      />
                      <div className="flex gap-2 justify-end">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={handleEditCancel}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleEditSave}
                          disabled={!editedContent.trim()}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Save
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm whitespace-pre-wrap break-words mt-0.5">
                      {comment.content}
                    </p>
                  )}
                </div>
                {isAuthor && !isEditing && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 flex-shrink-0"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="z-[70]">
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
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
                {!isAuthor && user && !isEditing && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 flex-shrink-0"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="z-[70]">
                      <DropdownMenuItem
                        onClick={() => setIsReportDialogOpen(true)}
                        className="text-red-600 focus:text-red-600"
                      >
                        <Flag className="mr-2 h-4 w-4" />
                        Report
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>

            {/* Action buttons - Facebook style */}
            <div className="flex items-center gap-4 mt-1 ml-3">
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNowUTC(comment.createdAt, {
                  addSuffix: true,
                })}
              </span>
              {canReply && !isEditing && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-transparent transition-colors"
                  onClick={() => setShowReplyForm(!showReplyForm)}
                >
                  Reply
                </Button>
              )}
              {!canReply && hasReplies && (
                <span className="text-xs text-muted-foreground italic">
                  Max depth reached
                </span>
              )}
            </div>

            {/* Facebook-style "View replies" button */}
            {hasReplies && depth === 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowReplies(!showReplies)}
                className="h-auto p-0 mt-2 ml-3 text-sm font-semibold text-green-600 hover:text-green-700 hover:bg-transparent flex items-center gap-1"
              >
                {showReplies ? (
                  <>
                    <ChevronUp className="h-4 w-4" />
                    Hide {replyCount} {replyCount === 1 ? "reply" : "replies"}
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4" />
                    View {replyCount} {replyCount === 1 ? "reply" : "replies"}
                  </>
                )}
              </Button>
            )}

            {/* Reply Form */}
            <AnimatePresence mode="wait">
              {showReplyForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="mt-2"
                >
                  <CommentReplyForm
                    onSubmit={handleReplySubmit}
                    onCancel={() => setShowReplyForm(false)}
                    isSubmitting={isReplying}
                    replyToName={comment.author.name}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Nested Replies - Facebook style: collapsible */}
        {hasReplies && (
          <AnimatePresence mode="wait">
            {(showReplies || depth > 0) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className={`mt-2 ${
                  depth === 0 ? "border-l-2 border-gray-300 pl-2" : ""
                }`}
              >
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
              </motion.div>
            )}
          </AnimatePresence>
        )}

        <AlertDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
        >
          <AlertDialogPopup>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Comment?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your
                comment.
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
  }
);

CommentItem.displayName = "CommentItem";
