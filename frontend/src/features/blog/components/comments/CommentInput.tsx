import React, { useCallback } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar.tsx';
import { Button } from '@/components/ui/button.tsx';
import { Textarea } from '@/components/ui/textarea.tsx';
import { Send, Loader2 } from 'lucide-react';

interface CommentInputProps {
    value: string;
    onChange: (value: string) => void;
    onSubmit: () => void;
    onCancel?: () => void;
    placeholder?: string;
    userAvatar?: string;
    userName?: string;
    isSubmitting?: boolean;
    autoFocus?: boolean;
    size?: 'sm' | 'md';
    disabled?: boolean;
}

export const CommentInput: React.FC<CommentInputProps> = ({
    value,
    onChange,
    onSubmit,
    onCancel,
    placeholder = "Write a comment...",
    userAvatar,
    userName,
    isSubmitting = false,
    autoFocus = false,
    size = 'md',
    disabled = false,
}) => {
    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onSubmit();
        }
        if (e.key === 'Escape' && onCancel) {
            onCancel();
        }
    }, [onSubmit, onCancel]);

    const avatarSize = size === 'sm' ? 'h-6 w-6' : 'h-8 w-8';
    const textareaHeight = size === 'sm' ? 'min-h-[44px]' : 'min-h-[60px]'; const buttonSize = size === 'sm' ? 'h-7 w-7' : 'h-8 w-8';
    const iconSize = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4';

    return (
        <div className="flex gap-2 items-start">
            <Avatar className={`${avatarSize} flex-shrink-0`}>
                <AvatarImage src={userAvatar} alt={userName} />
                <AvatarFallback>{userName?.charAt(0)?.toUpperCase() || 'U'}</AvatarFallback>
            </Avatar>
            <div className="flex-1 relative min-w-0">
                <Textarea
                    placeholder={placeholder}
                    className={`${textareaHeight} pr-10 py-2 text-sm resize-none border-input`}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    autoFocus={autoFocus}
                    disabled={isSubmitting || disabled}
                    aria-label={placeholder}
                />
                <div className="absolute right-1 top-1 flex gap-1">
                    {onCancel && (
                        <Button
                            size="icon"
                            variant="ghost"
                            className={buttonSize}
                            onClick={onCancel}
                            disabled={isSubmitting}
                            aria-label="Cancel"
                        >
                            ✕
                        </Button>
                    )}
                    <Button
                        size="icon"
                        variant="ghost"
                        className={`${buttonSize} text-primary disabled:opacity-50`}
                        onClick={onSubmit}
                        disabled={!value.trim() || isSubmitting || disabled}
                        aria-label="Submit"
                    >
                        {isSubmitting ? (
                            <Loader2 className={`${iconSize} animate-spin`} />
                        ) : (
                            <Send className={iconSize} />
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
};

