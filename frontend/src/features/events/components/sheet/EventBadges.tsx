import { Badge } from '@/components/ui/badge';
import { UserCheck, AlertCircle, UserX } from 'lucide-react';
import type { EventResponse } from '@/api-client';

interface EventBadgesProps {
    event: EventResponse;
}

export function EventBadges({ event }: EventBadgesProps) {
    return (
        <div className="flex flex-wrap gap-2">
            {event.isApproved ? (
                <Badge variant="default" className="bg-green-500">
                    <UserCheck className="mr-1 h-3 w-3" />
                    Approved
                </Badge>
            ) : (
                <Badge variant="secondary">
                    <AlertCircle className="mr-1 h-3 w-3" />
                    Pending Approval
                </Badge>
            )}
            {event.isFull && (
                <Badge variant="destructive">
                    <UserX className="mr-1 h-3 w-3" />
                    Full
                </Badge>
            )}
            {event.isInProgress && (
                <Badge variant="default" className="bg-blue-500">
                    In Progress
                </Badge>
            )}
        </div>
    );
}
