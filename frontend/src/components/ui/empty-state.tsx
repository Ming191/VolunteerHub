import { SearchX } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
    icon?: LucideIcon;
    title?: string;
    description?: string;
    actionLabel?: string;
    onAction?: () => void;
    className?: string;
}

export function EmptyState({
    icon: Icon = SearchX,
    title = 'No items found',
    description = "We couldn't find what you were looking for.",
    actionLabel,
    onAction,
    className,
}: EmptyStateProps) {
    return (
        <div className={cn("flex flex-col items-center justify-center p-8 text-center min-h-[300px] border-2 border-dashed rounded-lg bg-muted/20", className)}>
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                <Icon className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="mt-6 text-xl font-semibold text-foreground">
                {title}
            </h3>
            <p className="mt-2 text-center text-sm text-muted-foreground max-w-sm leading-relaxed">
                {description}
            </p>
            {actionLabel && onAction && (
                <Button onClick={onAction} className="mt-6" variant="outline">
                    {actionLabel}
                </Button>
            )}
        </div>
    );
}
