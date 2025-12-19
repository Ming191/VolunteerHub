/**
 * @deprecated This file has been refactored into smaller components.
 * Please use: import { PostComments } from '@/features/blog/components/comments'
 *
 * The component is now split into:
 * - PostComments: Main container (comments/PostComments.tsx)
 * - CommentsList: Comments list with loading states (comments/CommentsList.tsx)
 * - CommentItem: Individual comment with replies (comments/CommentItem.tsx)
 * - CommentInput: Reusable input component (comments/CommentInput.tsx)
 * - CommentReplyForm: Reply form component (comments/CommentReplyForm.tsx)
 * - useCommentMutations: Custom hook for mutations (comments/useCommentMutations.ts) */

export { PostComments } from './comments';
