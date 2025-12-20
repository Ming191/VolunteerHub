import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, MapPin, Clock, Users, Ticket } from 'lucide-react';
import type { EventResponse } from '@/api-client';
import { format } from 'date-fns';
import { Separator } from '@/components/ui/separator';
import { EventMap } from './EventMap';
import { useEventPermissions } from '../../hooks/useEventPermissions';
import { useAuth } from '@/features/auth/hooks/useAuth';

interface EventInfoSidebarProps {
    event: EventResponse;
    onRegister: () => void;
    isOrganizer?: boolean;
}

export const EventInfoSidebar = ({ event, onRegister, isOrganizer }: EventInfoSidebarProps) => {
    const { user } = useAuth();
    const { canRegister, isVolunteer, isRegistered, isEventEnded: eventEnded, isRegistrationClosed: registrationClosedByDeadline } = useEventPermissions(event);

    // Determine registration status
    const getRegistrationStatus = () => {
        if (isRegistered) {
            return { label: 'Registered', color: 'text-green-600' };
        }
        if (eventEnded) {
            return { label: 'Ended', color: 'text-muted-foreground' };
        }
        if (registrationClosedByDeadline) {
            return { label: 'Closed', color: 'text-destructive' };
        }
        if (event.isFull) {
            return { label: 'Full', color: 'text-destructive' };
        }
        return { label: 'Open', color: 'text-green-600' };
    };

    const getButtonConfig = (): { text: string; disabled: boolean; variant?: 'destructive' } => {
        if (isRegistered) {
            return { text: 'Unregister', disabled: false, variant: 'destructive' };
        }
        if (eventEnded) {
            return { text: 'Event Ended', disabled: true };
        }
        if (registrationClosedByDeadline) {
            return { text: 'Registration Closed', disabled: true };
        }
        if (event.isFull) {
            return { text: event.waitlistEnabled ? 'Join Waitlist' : 'Event Full', disabled: !event.waitlistEnabled };
        }
        return { text: 'Register Now', disabled: false };
    };

    const status = getRegistrationStatus();
    const buttonConfig = getButtonConfig();

    // Only show registration section to volunteers
    const showRegistrationSection = !isOrganizer && user && isVolunteer;

    return (
        <Card className="sticky top-6">
            <CardHeader>
                <CardTitle>Event Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-4">
                    <div className="flex items-start gap-3">
                        <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                            <p className="font-medium">Date</p>
                            <p className="text-sm text-muted-foreground">
                                {format(new Date(event.eventDateTime), 'EEEE, MMMM d, yyyy')}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                            <p className="font-medium">Time</p>
                            <p className="text-sm text-muted-foreground">
                                {format(new Date(event.eventDateTime), 'h:mm a')} - {format(new Date(event.endDateTime), 'h:mm a')}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                            <p className="font-medium">Location</p>
                            <p className="text-sm text-muted-foreground">{event.location}</p>
                        </div>
                    </div>

                    {(event.latitude != null && event.longitude != null) && (
                        <div className="rounded-md overflow-hidden border">
                            <EventMap
                                latitude={event.latitude}
                                longitude={event.longitude}
                            />
                        </div>
                    )}
                    <div className="flex items-start gap-3">
                        <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                            <p className="font-medium">Capacity</p>
                            <p className="text-sm text-muted-foreground">
                                {event.maxParticipants ? `${event.maxParticipants} Spots Total` : 'Unlimited Spots'}
                            </p>
                        </div>
                    </div>
                </div>

                {showRegistrationSection && (
                    <>
                        <Separator />

                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="font-medium">Registration</span>
                                <span className={`text-sm font-medium ${status.color}`}>
                                    {status.label}
                                </span>
                            </div>

                            {canRegister && (
                                <Button
                                    className={`w-full ${buttonConfig.variant === 'destructive' ? 'bg-red-600 hover:bg-red-700 text-white' : ''}`}
                                    size="lg"
                                    onClick={onRegister}
                                    disabled={buttonConfig.disabled}
                                >
                                    <Ticket className="mr-2 h-4 w-4" />
                                    {buttonConfig.text}
                                </Button>
                            )}
                        </div>
                    </>
                )}

                <Separator />

                <div className="pt-2">
                    <p className="text-sm font-medium mb-2">Organizer</p>
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                            {event.creatorName.charAt(0)}
                        </div>
                        <div>
                            <p className="text-sm font-medium">{event.creatorName}</p>
                            <p className="text-xs text-muted-foreground">Event Organizer</p>
                        </div>
                    </div>
                </div>

            </CardContent>
        </Card>
    );
};
