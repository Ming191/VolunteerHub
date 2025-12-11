import { Calendar, MapPin, Clock, AlertCircle } from 'lucide-react';
import { formatDate, formatTime } from '../../utils/dateUtils';
import type { EventResponse } from '@/api-client';

interface EventDateInfoProps {
    event: EventResponse;
}

export function EventDateInfo({ event }: EventDateInfoProps) {
    return (
        <div className="space-y-3">
            <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                    <p className="font-medium">Event Date</p>
                    <p className="text-sm text-muted-foreground">
                        {formatDate(event.eventDateTime)}
                    </p>
                </div>
            </div>

            <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                    <p className="font-medium">Time</p>
                    <p className="text-sm text-muted-foreground">
                        {formatTime(event.eventDateTime)} - {formatTime(event.endDateTime)}
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

            {event.registrationDeadline && (
                <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                        <p className="font-medium">Registration Deadline</p>
                        <p className="text-sm text-muted-foreground">
                            {formatDate(event.registrationDeadline)}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
