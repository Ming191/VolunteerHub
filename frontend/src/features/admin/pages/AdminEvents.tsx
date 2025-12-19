import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, Download, Calendar, MapPin, Users } from 'lucide-react';
import { SmartPagination } from '@/components/common/SmartPagination';
import { EmptyState } from '@/components/ui/empty-state';
import { ApiErrorState } from '@/components/ui/api-error-state';
import { useAdminEvents } from '../hooks/useAdminEvents';
import { Skeleton } from '@/components/ui/skeleton';

export const AdminEvents = () => {
    const {
        events,
        isLoading,
        isFetching,
        isError,
        error,
        refetch,
        searchQuery,
        setSearchQuery,
        handleExportEvents,
        page,
        setPage,
        totalPages
    } = useAdminEvents();

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'PUBLISHED':
            case 'APPROVED':
                return 'default';
            case 'DRAFT':
            case 'PENDING':
                return 'secondary';
            case 'CANCELLED':
            case 'REJECTED':
                return 'destructive';
            default:
                return 'outline';
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Event Management</CardTitle>
                    <CardDescription>View and manage events.</CardDescription>
                    <div className="flex items-center gap-4 mt-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search events..."
                                className="pl-9"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Button variant="outline" onClick={handleExportEvents} aria-label="Export events to CSV">
                            <Download className="mr-2 h-4 w-4" />
                            Export CSV
                        </Button>
                    </div>
                </CardHeader>

                <CardContent>
                    {isError ? (
                        <ApiErrorState error={error} onRetry={refetch} />
                    ) : isLoading ? (
                        <div className="space-y-4">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="flex items-center space-x-4">
                                    <Skeleton className="h-12 w-12 rounded-full" />
                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-[250px]" />
                                        <Skeleton className="h-4 w-[200px]" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className={`space-y-4 transition-opacity duration-200 ${isFetching ? 'opacity-50 pointer-events-none' : ''}`}>
                            {(events).map((event) => (
                                <Card key={event.id} className="p-4 hover:bg-muted/50 transition-colors">
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <h4 className="font-semibold text-lg">{event.title}</h4>
                                                <Badge variant={getStatusVariant(event.status || 'UNKNOWN')}>
                                                    {event.status?.replace('_', ' ') || 'UNKNOWN'}
                                                </Badge>
                                            </div>
                                        </div>

                                        <div className="text-sm text-muted-foreground flex gap-4">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                <span>{formatDate(event.eventDateTime)}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <MapPin className="h-3 w-3" />
                                                <span>{event.location}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Users className="h-3 w-3" />
                                                <span>{event.approvedCount}/{event.maxParticipants || 'User Limit'}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 mt-2 pt-2 border-t">
                                            <p className="text-xs text-muted-foreground">Organizer:</p>
                                            <div className="flex items-center gap-2">
                                                <Avatar className="h-5 w-5">
                                                    {/* Assuming organizer data is available in event object correctly, adjusting if needed */}
                                                    <AvatarImage src={event.creatorName?.profilePictureUrl} />
                                                    <AvatarFallback>{event.organizer?.name?.substring(0, 2).toUpperCase() || 'OR'}</AvatarFallback>
                                                </Avatar>
                                                <span className="text-sm font-medium">{event.creatorName || 'Unknown Organizer'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            ))}

                            {events.length === 0 && (
                                <EmptyState
                                    title="No events found"
                                    description="Try adjusting your search terms."
                                    className="py-12 border-none bg-transparent"
                                />
                            )}

                            {events.length > 0 && (
                                <SmartPagination
                                    currentPage={page + 1}
                                    totalPages={totalPages || 0}
                                    onPageChange={(p) => setPage(p - 1)}
                                    className="mt-4 border-t pt-4"
                                />
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};
