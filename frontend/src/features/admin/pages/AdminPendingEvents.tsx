import { Calendar, MapPin, Users, CheckCircle, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { EventListSkeleton } from '@/components/ui/loaders';
import { EmptyState } from '@/components/ui/empty-state';
import AnimatedPage from '@/components/common/AnimatedPage';
import { ApiErrorState } from '@/components/ui/api-error-state';
import { useAdminPendingEvents } from '../hooks/useAdminPendingEvents';
import {ConfirmDialog} from "@/components/common/ConfirmDialog.tsx";

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });
};

export const AdminPendingEvents = () => {
    const {
        events,
        loading,
        error,
        selectedEvent,
        action,
        processingId,
        fetchPendingEvents,
        handleApprove,
        handleReject,
        openConfirmDialog,
        closeConfirmDialog
    } = useAdminPendingEvents();

    return (
        <AnimatedPage>
            <div className="container mx-auto p-6">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold">Pending Event Approvals</h1>
                    <p className="text-muted-foreground mt-2">
                        Review and approve or reject events submitted by organizers
                    </p>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <EventListSkeleton count={6} />
                    </div>
                ) : error ? (
                    <ApiErrorState error={error} onRetry={fetchPendingEvents} />
                ) : events.length === 0 ? (
                    <EmptyState
                        title="No pending events"
                        description="When organizers submit events, they will appear here for review."
                        icon={CheckCircle}
                    />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {events.map((event) => {
                            const hasImage = event.imageUrls && event.imageUrls.length > 0;

                            return (
                                <Card key={event.id} className="flex flex-col h-full">
                                    <CardHeader className="p-0">
                                        {hasImage ? (
                                            <img src={event.imageUrls[0]} alt={event.title} className="w-full h-48 object-cover rounded-t-lg" />
                                        ) : (
                                            <div className="w-full h-48 bg-gradient-to-br from-muted to-muted/50 rounded-t-lg flex items-center justify-center">
                                                <Calendar className="h-16 w-16 text-muted-foreground/30" />
                                            </div>
                                        )}
                                        <div className="p-4">
                                            <CardTitle className="text-xl font-bold leading-tight">{event.title}</CardTitle>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="flex-grow p-4 pt-0">
                                        <div className="space-y-3 text-sm text-muted-foreground">
                                            <div className="flex items-center">
                                                <Calendar className="mr-2 h-4 w-4" />
                                                <span>{formatDate(event.eventDateTime)}</span>
                                            </div>
                                            <div className="flex items-center">
                                                <MapPin className="mr-2 h-4 w-4" />
                                                <span className="truncate">{event.location}</span>
                                            </div>
                                            <div className="flex items-center">
                                                <Users className="mr-2 h-4 w-4" />
                                                <span>{event.maxParticipants ? `Max ${event.maxParticipants} participants` : 'Unlimited participants'}</span>
                                            </div>
                                        </div>
                                        <div className="mt-4"><p className="text-sm line-clamp-3">{event.description}</p></div>
                                        <div className="mt-4 flex flex-wrap gap-2">
                                            {event.tags && Array.from(event.tags).slice(0, 3).map(tag => <Badge key={tag} variant="secondary">{tag.replace(/_/g, ' ')}</Badge>)}
                                            {event.tags && event.tags.size > 3 && <Badge variant="outline">+{event.tags.size - 3} more</Badge>}
                                        </div>
                                    </CardContent>
                                    <CardFooter className="p-4 pt-0 flex gap-2">
                                        <Button variant="default" className="flex-1" onClick={() => openConfirmDialog(event, 'approve')} disabled={processingId === event.id}>
                                            <CheckCircle className="mr-2 h-4 w-4" /> Approve
                                        </Button>
                                        <Button variant="destructive" className="flex-1" onClick={() => openConfirmDialog(event, 'reject')} disabled={processingId === event.id}>
                                            <XCircle className="mr-2 h-4 w-4" /> Reject
                                        </Button>
                                    </CardFooter>
                                </Card>
                            );
                        })}
                    </div>
                )}

              <ConfirmDialog
                open={!!action}
                onOpenChange={(open) => {
                  if (!open) closeConfirmDialog();
                }}
                title={action === 'approve' ? 'Approve Event' : 'Reject Event'}
                description={
                  action === 'approve' ? (
                    <>
                      Are you sure you want to approve the event{" "}
                      <strong>{selectedEvent?.title}</strong>?
                      This will make it visible to all volunteers.
                    </>
                  ) : (
                    <>
                      Are you sure you want to reject and delete the event{" "}
                      <strong>{selectedEvent?.title}</strong>?
                      This action cannot be undone.
                    </>
                  )
                }
                confirmText={action === 'approve' ? 'Approve' : 'Reject'}
                confirmVariant={action === 'approve' ? 'default' : 'destructive'}
                isLoading={!!processingId}
                onConfirm={action === 'approve' ? handleApprove : handleReject}
              />

            </div>
        </AnimatedPage>
    );
}
