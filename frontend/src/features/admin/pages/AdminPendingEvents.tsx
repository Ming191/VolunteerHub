import { useEffect, useState } from 'react';
import { Calendar, MapPin, Users, CheckCircle, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogPopup,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/animate-ui/components/base/alert-dialog';
import { toast } from 'sonner';
import type { EventResponse } from '@/api-client';
import { AdminControllerApi, Configuration } from '@/api-client';
import { EventListSkeleton } from '@/components/ui/loaders';
import { EmptyState } from '@/components/ui/empty-state';
import axiosInstance from '@/utils/axiosInstance';
import AnimatedPage from '@/components/common/AnimatedPage';

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });
};

const config = new Configuration({ basePath: '' });
const adminApi = new AdminControllerApi(config, undefined, axiosInstance);

import { ApiErrorState } from '@/components/ui/api-error-state';

// ... imports

export default function AdminPendingEvents() {
    const [events, setEvents] = useState<EventResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null); // New error state
    const [selectedEvent, setSelectedEvent] = useState<EventResponse | null>(null);
    const [action, setAction] = useState<'approve' | 'reject' | null>(null);
    const [processingId, setProcessingId] = useState<number | null>(null);

    const fetchPendingEvents = async () => {
        try {
            setLoading(true);
            setError(null); // Reset error
            const response = await adminApi.getPendingEvents();
            setEvents(response.data);
        } catch (error) {
            console.error('Failed to fetch pending events:', error);
            setError(error instanceof Error ? error : new Error('Failed to fetch pending events'));
            toast.error('Failed to load pending events');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingEvents();
    }, []);

    const handleApprove = async () => {
        if (!selectedEvent) return;

        try {
            setProcessingId(selectedEvent.id);
            await adminApi.approveEvent({ id: selectedEvent.id });
            toast.success(`Event "${selectedEvent.title}" approved successfully`);
            setEvents(events.filter(e => e.id !== selectedEvent.id));
        } catch (error) {
            console.error('Failed to approve event:', error);
            toast.error('Failed to approve event');
        } finally {
            setProcessingId(null);
            setSelectedEvent(null);
            setAction(null);
        }
    };

    const handleReject = async () => {
        if (!selectedEvent) return;

        try {
            setProcessingId(selectedEvent.id);
            await adminApi.deleteEventAsAdmin({ id: selectedEvent.id });
            toast.success(`Event "${selectedEvent.title}" rejected`);
            setEvents(events.filter(e => e.id !== selectedEvent.id));
        } catch (error) {
            console.error('Failed to reject event:', error);
            toast.error('Failed to reject event');
        } finally {
            setProcessingId(null);
            setSelectedEvent(null);
            setAction(null);
        }
    };

    const openConfirmDialog = (event: EventResponse, actionType: 'approve' | 'reject') => {
        setSelectedEvent(event);
        setAction(actionType);
    };

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
                        {/* ... event cards ... */}
                        {events.map((event) => {
                            // ...
                            const hasImage = event.imageUrls && event.imageUrls.length > 0;

                            return (
                                // ... Card JSX ...
                                <Card key={event.id} className="flex flex-col h-full">
                                    {/* ... content ... */}
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
                                        {/* ... details ... */}
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

                <AlertDialog open={!!action} onOpenChange={() => setAction(null)}>
                    {/* ... dialog content ... */}
                    <AlertDialogPopup>
                        <AlertDialogHeader>
                            <AlertDialogTitle>{action === 'approve' ? 'Approve Event' : 'Reject Event'}</AlertDialogTitle>
                            <AlertDialogDescription>
                                {action === 'approve' ? (
                                    <>Are you sure you want to approve the event "<strong>{selectedEvent?.title}</strong>"? This will make it visible to all volunteers.</>
                                ) : (
                                    <>Are you sure you want to reject and delete the event "<strong>{selectedEvent?.title}</strong>"? This action cannot be undone.</>
                                )}
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={action === 'approve' ? handleApprove : handleReject}>
                                {action === 'approve' ? 'Approve' : 'Reject'}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogPopup>
                </AlertDialog>
            </div>
        </AnimatedPage>
    );
}
