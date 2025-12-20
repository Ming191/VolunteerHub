import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { CommentInput } from './CommentInput';
import { useAuth } from '@/features/auth/hooks/useAuth';

interface CommentReplyFormProps {
    onSubmit: (content: string) => void;
    onCancel: () => void;
    isSubmitting: boolean;
    replyToName: string;
}

export const CommentReplyForm: React.FC<CommentReplyFormProps> = ({
    onSubmit,
    onCancel,
    isSubmitting,
    replyToName,
}) => {
    const { user } = useAuth();
    const [replyContent, setReplyContent] = useState('');

    const handleSubmit = useCallback(() => {
        if (!replyContent.trim() || isSubmitting) return;
        onSubmit(replyContent);
        setReplyContent('');
    }, [replyContent, isSubmitting, onSubmit]);

    const handleCancel = useCallback(() => {
        setReplyContent('');
        onCancel();
    }, [onCancel]);

    return (
        <motion.div
            initial={{ height: 0, opacity: 0, scale: 0.95 }}
            animate={{ height: "auto", opacity: 1, scale: 1 }}
            exit={{ height: 0, opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
        >
            <div className="mt-2 pt-2 px-1">
                <CommentInput
                    value={replyContent}
                    onChange={setReplyContent}
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                    placeholder={`Reply to ${replyToName}...`}
                    userAvatar={user?.profilePictureUrl}
                    userName={user?.name}
                    isSubmitting={isSubmitting}
                    autoFocus
                    size="sm"
                />
            </div>
        </motion.div>
    );
};

