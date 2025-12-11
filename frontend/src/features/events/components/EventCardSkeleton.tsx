import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const EventCardSkeleton = () => {
    return (
        <Card className="flex flex-col h-full">
            <CardHeader className="p-0">
                <Skeleton className="w-full h-48 rounded-t-lg" />
                <div className="p-4">
                    <Skeleton className="h-7 w-3/4" />
                </div>
            </CardHeader>
            <CardContent className="flex-grow p-4 pt-0">
                <div className="space-y-3 text-sm">
                    <div className="flex items-center">
                        <Skeleton className="mr-2 h-4 w-4" />
                        <Skeleton className="h-4 w-1/2" />
                    </div>
                    <div className="flex items-center">
                        <Skeleton className="mr-2 h-4 w-4" />
                        <Skeleton className="h-4 w-2/3" />
                    </div>
                    <div className="flex items-center">
                        <Skeleton className="mr-2 h-4 w-4" />
                        <Skeleton className="h-4 w-1/3" />
                    </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                    <Skeleton className="h-5 w-16 rounded-md shadow-none" />
                    <Skeleton className="h-5 w-20 rounded-md shadow-none" />
                    <Skeleton className="h-5 w-14 rounded-md shadow-none" />
                </div>
            </CardContent>
            <CardFooter className="p-4 pt-0">
                <Skeleton className="h-9 w-full" />
            </CardFooter>
        </Card>
    );
}