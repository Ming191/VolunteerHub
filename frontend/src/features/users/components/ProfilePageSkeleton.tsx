import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const ProfilePageSkeleton = () => {
    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Hero Section */}
            <Card>
                <CardContent className="p-8">
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                        {/* Avatar */}
                        <Skeleton className="h-32 w-32 rounded-full" />

                        {/* Profile Info */}
                        <div className="flex-1 text-center md:text-left space-y-4">
                            <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
                                <Skeleton className="h-9 w-48" />
                                <Skeleton className="h-6 w-24 rounded-full" />
                            </div>
                            <Skeleton className="h-4 w-64" />
                            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-4 w-24" />
                            </div>
                            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                                <Skeleton className="h-6 w-16 rounded-full" />
                                <Skeleton className="h-6 w-20 rounded-full" />
                                <Skeleton className="h-6 w-14 rounded-full" />
                            </div>
                        </div>

                        {/* Edit Button */}
                        <div className="space-y-4">
                            <Skeleton className="h-10 w-32" />
                            <Skeleton className="h-10 w-40" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Posts Section */}
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-24" />
                </CardHeader>
                <CardContent className="space-y-6">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="rounded-lg border p-6 space-y-4">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                            <div className="flex items-center gap-6 pt-4 border-t">
                                <Skeleton className="h-4 w-16" />
                                <Skeleton className="h-4 w-20" />
                                <div className="ml-auto">
                                    <Skeleton className="h-4 w-12" />
                                </div>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
};
