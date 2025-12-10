import { Calendar, MapPin, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type { UiEvent } from '@/types/ui-models';
import type { EventResponse } from '@/api-client';

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });
};

interface EventCardProps<T extends UiEvent | EventResponse> {
    event: T;
    onViewDetails?: (event: T) => void;
}

export default function EventCard<T extends UiEvent | EventResponse>({ event, onViewDetails }: EventCardProps<T>) {
    // Helper to check if it's the new UI model (has availableSpotsText precaculated)
    const isUiEvent = (e: any): e is UiEvent => 'availableSpotsText' in e;

    const availableSpotsText = isUiEvent(event)
        ? event.availableSpotsText
        : (event.maxParticipants ? `${event.availableSpots} spots available` : 'Unlimited spots');

    const hasImage = event.imageUrls && event.imageUrls.length > 0;

    // safe tags access
    const tags = (Array.isArray(event.tags) ? event.tags : Array.from((event.tags as any) || [])) as string[];

    return (
        <Card className="flex flex-col h-full">
            <CardHeader className="p-0">
                {hasImage ? (
                    <img
                        src={event.imageUrls[0]}
                        alt={event.title}
                        className="w-full h-48 object-cover rounded-t-lg"
                    />
                ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-muted to-muted/50 rounded-t-lg flex items-center justify-center">
                        <Calendar className="h-16 w-16 text-muted-foreground/30" />
                    </div>
                )}
                <div className="p-4">
                    <CardTitle className="text-xl font-bold leading-tight truncate">
                        {event.title}
                    </CardTitle>
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
                        <span>{event.isFull ? 'Full' : availableSpotsText}</span>
                    </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                    {tags.slice(0, 3).map((tag: string) => (
                        <Badge key={tag} variant="secondary">
                            {tag.replace(/_/g, ' ')}
                        </Badge>
                    ))}
                    {tags.length > 3 && (
                        <Badge variant="outline">+{tags.length - 3} more</Badge>
                    )}
                </div>
            </CardContent>
            <CardFooter className="p-4 pt-0">
                <Button
                    className="w-full"
                    onClick={() => onViewDetails?.(event)}
                >
                    View Details
                </Button>
            </CardFooter>
        </Card>
    );
}