import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const EventCardSkeleton = () => {
    return (
        <Card className="flex flex-col h-full">
            <CardHeader className="p-0">
                <Skeleton className="w-full h-48 rounded-t-lg" />
                <div className="p-4 space-y-2">
                    <Skeleton className="h-6 w-3/4" />
                </div>
            </CardHeader>
            <CardContent className="flex-grow p-4 pt-0 space-y-3">
                <div className="flex items-center">
                    <Skeleton className="h-4 w-4 mr-2 rounded-full" />
                    <Skeleton className="h-4 w-1/2" />
                </div>
                <div className="flex items-center">
                    <Skeleton className="h-4 w-4 mr-2 rounded-full" />
                    <Skeleton className="h-4 w-2/3" />
                </div>
                <div className="flex items-center">
                    <Skeleton className="h-4 w-4 mr-2 rounded-full" />
                    <Skeleton className="h-4 w-1/3" />
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-24" />
                </div>
            </CardContent>
            <CardFooter className="p-4 pt-0">
                <Skeleton className="h-10 w-full" />
            </CardFooter>
        </Card>
    );
}