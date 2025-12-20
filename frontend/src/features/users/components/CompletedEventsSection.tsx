import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Trophy } from 'lucide-react';
import { type CompletedEventResponse } from '@/api-client';
import { format } from 'date-fns';

interface CompletedEventsSectionProps {
    events: CompletedEventResponse[];
    isOwnProfile: boolean;
}

export const CompletedEventsSection = ({ events, isOwnProfile }: CompletedEventsSectionProps) => {
    if (!events || events.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Trophy className="h-5 w-5" />
                        Completed Events
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground text-center py-8">
                        {isOwnProfile 
                            ? "You haven't completed any events yet. Register for events to start building your volunteer history!"
                            : "This user hasn't completed any events yet."}
                    </p>
                </CardContent>
            </Card>
        );
    }

    // Get unique tags from all completed events
    const allTags = new Set<string>();
    events.forEach(event => {
        event.tags.forEach(tag => allTags.add(tag));
    });

    return (
        <div className="space-y-6">
            {/* Statistics Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Trophy className="h-5 w-5" />
                        Volunteer Experience
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-primary/10 rounded-lg">
                            <div className="text-3xl font-bold text-primary">{events.length}</div>
                            <div className="text-sm text-muted-foreground mt-1">Events Completed</div>
                        </div>
                        <div className="text-center p-4 bg-green-500/10 rounded-lg">
                            <div className="text-3xl font-bold text-green-600">{allTags.size}</div>
                            <div className="text-sm text-muted-foreground mt-1">Categories</div>
                        </div>
                        <div className="col-span-2 md:col-span-1 text-center p-4 bg-blue-500/10 rounded-lg">
                            <div className="text-3xl font-bold text-blue-600">
                                {events.length > 0 ? format(new Date(events[0].eventDateTime), 'MMM yyyy') : '-'}
                            </div>
                            <div className="text-sm text-muted-foreground mt-1">Latest Event</div>
                        </div>
                    </div>

                    {/* Category Tags */}
                    {allTags.size > 0 && (
                        <div className="mt-6">
                            <h4 className="text-sm font-medium mb-3">Volunteered In</h4>
                            <div className="flex flex-wrap gap-2">
                                {Array.from(allTags).map(tag => (
                                    <Badge key={tag} variant="secondary" className="text-xs">
                                        {tag}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Recent Completed Events */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Completed Events</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {events.slice(0, 6).map((event) => (
                            <div
                                key={event.eventId}
                                className="flex gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                            >
                                {/* Event Image */}
                                {event.imageUrl ? (
                                    <div className="flex-shrink-0">
                                        <img
                                            src={event.imageUrl}
                                            alt={event.eventTitle}
                                            className="w-20 h-20 rounded-lg object-cover"
                                        />
                                    </div>
                                ) : (
                                    <div className="flex-shrink-0 w-20 h-20 rounded-lg bg-primary/10 flex items-center justify-center">
                                        <Trophy className="h-8 w-8 text-primary" />
                                    </div>
                                )}

                                {/* Event Details */}
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-sm mb-2 truncate">
                                        {event.eventTitle}
                                    </h4>
                                    <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            <span>{format(new Date(event.eventDateTime), 'MMM dd, yyyy')}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <MapPin className="h-3 w-3" />
                                            <span className="truncate">{event.location}</span>
                                        </div>
                                    </div>
                                    {/* Event Tags */}
                                    <div className="flex flex-wrap gap-1 mt-2">
                                        {event.tags.slice(0, 3).map(tag => (
                                            <Badge key={tag} variant="outline" className="text-xs">
                                                {tag}
                                            </Badge>
                                        ))}
                                        {event.tags.length > 3 && (
                                            <Badge variant="outline" className="text-xs">
                                                +{event.tags.length - 3}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {events.length > 6 && (
                        <p className="text-center text-sm text-muted-foreground mt-4">
                            Showing 6 of {events.length} completed events
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};
