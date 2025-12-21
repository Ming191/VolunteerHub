import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const ProfilePageSkeleton = () => {
    return (
        <div className="container mx-auto p-6 space-y-8 max-w-5xl">
            {/* Hero Section */}
            <Card className="border-0 shadow-lg">
                <CardContent className="p-8">
                    <div className="flex flex-col md:flex-row gap-6">
                        {/* Avatar */}
                        <div className="shrink-0">
                            <Skeleton className="h-32 w-32 rounded-full" />
                        </div>

                        {/* Profile Info */}
                        <div className="flex-1">
                            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <Skeleton className="h-9 w-48" />
                                        <Skeleton className="h-6 w-24 rounded-full" />
                                    </div>
                                    <Skeleton className="h-5 w-full max-w-2xl" />
                                    <Skeleton className="h-5 w-3/4 max-w-xl" />
                                    <div className="flex flex-wrap gap-4 pt-2">
                                        <Skeleton className="h-4 w-32" />
                                        <Skeleton className="h-4 w-28" />
                                    </div>
                                </div>

                                {/* Edit Button Area */}
                                <div className="flex flex-col gap-2">
                                    <Skeleton className="h-10 w-32" />
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Skills & Interests Section */}
            <div className="grid md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-24" />
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <Skeleton key={i} className="h-8 w-20 rounded-full" />
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-24" />
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <Skeleton key={i} className="h-8 w-24 rounded-full" />
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Posts Section */}
            <div>
                <div className="flex items-center gap-2 mb-4 px-1">
                    <Skeleton className="h-8 w-32" />
                    <Skeleton className="h-5 w-8 rounded-full" />
                </div>
                
                <div className="space-y-4">
                    {Array.from({ length: 2 }).map((_, i) => (
                        <Card key={i} className="overflow-hidden">
                            <CardContent className="p-6 space-y-4">
                                {/* Post Header */}
                                <div className="flex items-center gap-3">
                                    <Skeleton className="h-10 w-10 rounded-full" />
                                    <div className="flex-1">
                                        <Skeleton className="h-4 w-32 mb-2" />
                                        <Skeleton className="h-3 w-24" />
                                    </div>
                                </div>
                                
                                {/* Post Content */}
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-5/6" />
                                </div>
                                
                                {/* Post Actions */}
                                <div className="flex items-center gap-6 pt-2 border-t">
                                    <Skeleton className="h-4 w-16" />
                                    <Skeleton className="h-4 w-20" />
                                    <Skeleton className="h-4 w-16 ml-auto" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
};
