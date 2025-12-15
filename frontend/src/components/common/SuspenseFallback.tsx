import React from 'react';

/**
 * Minimal fallback for React.lazy() code-splitting.
 * 
 * This should be intentionally minimal because:
 * 1. Code chunk loading is typically very fast (< 100ms)
 * 2. Page components have their own data-loading skeletons
 * 3. A heavy skeleton here causes "double skeleton" when combined with page skeletons
 * 
 * Use page-specific skeletons (SettingsPageSkeleton, ProfilePageSkeleton, etc.)
 * for data loading states.
 */
export const SuspenseFallback: React.FC = () => {  // Minimal: just prevents layout shift, no visible loading indicator
  // The page component will show its own skeleton for actual data loading
  return (
    <div
      className="min-h-screen w-full"
      aria-busy="true"
      aria-label="Loading page"
    />
  );
};

export default SuspenseFallback;
