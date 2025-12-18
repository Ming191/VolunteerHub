import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, MapPin, Clock, Users, Ticket } from 'lucide-react';
import type { EventResponse } from '@/api-client';
import { format } from 'date-fns';
import { Separator } from '@/components/ui/separator';

interface EventInfoSidebarProps {
    event: EventResponse;
    onRegister: () => void;
    isOrganizer?: boolean;
}

export const EventInfoSidebar = ({ event, onRegister, isOrganizer }: EventInfoSidebarProps) => {
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

                {!isOrganizer && (
                    <>
                        <Separator />

                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="font-medium">Registration</span>
                                {event.isFull ? (
                                    <span className="text-destructive text-sm font-medium">Full</span>
                                ) : (
                                    <span className="text-green-600 text-sm font-medium">Open</span>
                                )}
                            </div>

                            <Button className="w-full" size="lg" onClick={onRegister} disabled={event.isFull}>
                                <Ticket className="mr-2 h-4 w-4" />
                                {event.isFull ? 'Join Waitlist' : 'Register Now'}
                            </Button>
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
