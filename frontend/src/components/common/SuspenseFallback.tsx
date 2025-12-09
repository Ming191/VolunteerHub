import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2 } from 'lucide-react';

interface SuspenseFallbackProps {
  message?: string;
  variant?: 'default' | 'minimal' | 'skeleton';
}

export const SuspenseFallback: React.FC<SuspenseFallbackProps> = ({
  message = 'Loading...',
  variant = 'default',
}) => {
  if (variant === 'minimal') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (variant === 'skeleton') {
    return (
      <div className="space-y-6 p-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
      <div className="relative">
        <div className="absolute inset-0 blur-xl opacity-50">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
        <Loader2 className="h-12 w-12 animate-spin text-primary relative" />
      </div>
      <p className="text-muted-foreground text-sm font-medium">{message}</p>
    </div>
  );
};

export default SuspenseFallback;
