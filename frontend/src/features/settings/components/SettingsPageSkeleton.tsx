import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const SettingsPageSkeleton = () => {
    return (
        <div className="w-full max-w-4xl mx-auto px-4 space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-9 w-32" />
                </div>
                <Skeleton className="h-10 w-32" />
            </div>

            {/* Notifications Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-start gap-2">
                        <Skeleton className="h-5 w-5" />
                        <Skeleton className="h-5 w-28" />
                    </CardTitle>
                    <CardDescription>
                        <Skeleton className="h-4 w-64" />
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex items-center justify-between py-2">
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-3 w-48" />
                            </div>
                            <Skeleton className="h-6 w-10 rounded-full" />
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* Appearance Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-start gap-2">
                        <Skeleton className="h-5 w-5" />
                        <Skeleton className="h-5 w-24" />
                    </CardTitle>
                    <CardDescription>
                        <Skeleton className="h-4 w-48" />
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between">
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-3 w-40" />
                        </div>
                        <Skeleton className="h-10 w-40" />
                    </div>
                </CardContent>
            </Card>

            {/* Privacy Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-start gap-2">
                        <Skeleton className="h-5 w-5" />
                        <Skeleton className="h-5 w-20" />
                    </CardTitle>
                    <CardDescription>
                        <Skeleton className="h-4 w-44" />
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between">
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-28" />
                            <Skeleton className="h-3 w-48" />
                        </div>
                        <Skeleton className="h-10 w-40" />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
