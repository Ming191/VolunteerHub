import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';
// import type { EventResponse } from '@/api-client';

interface UpcomingEventsListProps {
    // events: EventResponse[];
    events: any[];
    onEventClick: () => void;
}

export const UpcomingEventsList = ({ events, onEventClick }: UpcomingEventsListProps) => {
    return (
        <Card className="lg:col-span-2">
            <CardHeader>
                <CardTitle className="text-base">My Upcoming Events</CardTitle>
                <CardDescription>{events.length} events scheduled</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-3 max-h-[300px] overflow-y-auto">
                    {events.map((event) => (
                        <div
                            key={event.id}
                            className="p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                            onClick={onEventClick}
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-medium text-sm">{event.title}</p>
                                    <p className="text-xs text-muted-foreground mt-1">{event.location}</p>
                                </div>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Clock className="h-3 w-3" />
                                    {format(new Date(event.eventDateTime), 'MMM dd, h:mm a')}
                                </div>
                            </div>
                        </div>
                    ))}
                    {events.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground text-sm">
                            <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p>No upcoming events</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};
