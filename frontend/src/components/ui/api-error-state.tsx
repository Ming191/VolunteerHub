import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface ApiErrorStateProps {
  error?: Error | null | unknown;
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
  showDetails?: boolean;
}

export function ApiErrorState({
  error,
  title = 'Something went wrong',
  description = 'There was an error loading the data. Please try again.',
  onRetry,
  className,
  showDetails = true,
}: ApiErrorStateProps) {
  const errorMessage =
    error instanceof Error ? error.message : 'Unknown error occurred';

  return (
    <Alert variant="destructive" className={className}>
      <AlertTriangle className="h-4 w-4" />

      <div className="grid gap-1">
        <AlertTitle className="mb-0">
          {title}
        </AlertTitle>

        <AlertDescription className="text-sm [&_p]:leading-relaxed">
          <p>{description}</p>

          {showDetails && (
            <p className="mt-2 text-xs font-mono opacity-80 bg-destructive/10 px-3 py-2 rounded">
              {errorMessage}
            </p>
          )}

          {onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="mt-2 w-fit border-destructive/30 bg-background hover:bg-accent"
            >
              <RefreshCw className="mr-2 h-3 w-3" />
              Retry
            </Button>
          )}
        </AlertDescription>
      </div>
    </Alert>
  );
}
