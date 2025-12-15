/**
 * @deprecated Use SuspenseFallback for code-splitting and page-specific 
 * skeletons (SettingsPageSkeleton, ProfilePageSkeleton, etc.) for data loading.
 * 
 * This minimal fallback is kept for backward compatibility only.
 */
const Loading = () => {
    return (
        <div
            className="min-h-[200px] w-full"
            aria-busy="true"
            aria-label="Loading"
        />
    );
};

export default Loading;