import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface ApiErrorStateProps {
    error?: Error | null | unknown;
    title?: string;
    description?: string;
    onRetry?: () => void;
    className?: string;
}

export function ApiErrorState({
    error,
    title = 'Something went wrong',
    description = 'There was an error loading the data. Please try again.',
    onRetry,
    className,
}: ApiErrorStateProps) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    return (
        <Alert variant="destructive" className={`my-4 ${className}`}>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>{title}</AlertTitle>
            <AlertDescription className="mt-2 flex flex-col gap-3">
                <p>{description}</p>
                {/* Optional: Show detailed error message if needed, or keeping it clean for users */}
                <p className="text-xs opacity-80 font-mono bg-destructive/10 p-2 rounded">
                    Error details: {errorMessage}
                </p>

                {onRetry && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onRetry}
                        className="w-fit bg-background text-foreground hover:bg-accent border-destructive/30 mt-1"
                    >
                        <RefreshCw className="mr-2 h-3 w-3" />
                        Retry
                    </Button>
                )}
            </AlertDescription>
        </Alert>
    );
}
