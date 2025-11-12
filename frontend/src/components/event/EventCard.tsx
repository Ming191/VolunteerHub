import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type {EventResponse} from '@/api-client';

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });
};

interface EventCardProps {
    event: EventResponse;
}

export default function EventCard({ event }: EventCardProps) {
    const availableSpotsText = event.maxParticipants
        ? `${event.availableSpots} spots available`
        : 'Unlimited spots';

    const eventImageUrl = event.imageUrls?.[0] || 'https://storage.googleapis.com/volunteerhub-bucket/images/dac462c4-81ff-492a-8ce6-0a28bca410de-z7168037184515_19fc3834199c66012062da48d276eae9.jpg';

    return (
        <Card className="flex flex-col h-full">
            <CardHeader className="p-0">
                <img
                    src={eventImageUrl}
                    alt={event.title}
                    className="w-full h-48 object-cover rounded-t-lg"
                />
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
                    {event.tags && Array.from(event.tags).slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary">
                            {tag.replace(/_/g, ' ')}
                        </Badge>
                    ))}
                    {event.tags && event.tags.size > 3 && (
                        <Badge variant="outline">+{event.tags.size - 3} more</Badge>
                    )}
                </div>
            </CardContent>
            <CardFooter className="p-4 pt-0">
                <Button asChild className="w-full">
                    <Link to={`/events/${event.id}`}>View Details</Link>
                </Button>
            </CardFooter>
        </Card>
    );
}