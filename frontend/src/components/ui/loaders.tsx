import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

export function EventCardSkeleton() {
    return (
        <Card className="flex flex-col h-[400px] overflow-hidden">
            <div className="h-48 w-full bg-muted/40 relative">
                <Skeleton className="h-full w-full" />
                <div className="absolute top-4 right-4 bg-background/80 p-2 rounded-full">
                    <Skeleton className="h-4 w-12" />
                </div>
            </div>
            <CardHeader className="space-y-2 pb-2">
                <div className="flex justify-between items-start">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-6 w-3/4" />
            </CardHeader>
            <CardContent className="flex-grow space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <div className="space-y-2 mt-4">
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-3 w-1/2" />
                </div>
            </CardContent>
            <CardFooter className="pt-2 border-t bg-muted/10">
                <div className="flex justify-between items-center w-full">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-9 w-28 rounded-md" />
                </div>
            </CardFooter>
        </Card>
    );
}

export function DashboardStatSkeleton() {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4 rounded-full" />
            </CardHeader>
            <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-32" />
            </CardContent>
        </Card>
    );
}

export function TableRowSkeleton({ cells = 5 }: { cells?: number }) {
    return (
        <div className="flex items-center space-x-4 py-4 border-b">
            {Array.from({ length: cells }).map((_, i) => (
                <Skeleton key={i} className="h-4 flex-1" />
            ))}
        </div>
    );
}

export function EventListSkeleton({ count = 6 }: { count?: number }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: count }).map((_, i) => (
                <EventCardSkeleton key={i} />
            ))}
        </div>
    );
}
