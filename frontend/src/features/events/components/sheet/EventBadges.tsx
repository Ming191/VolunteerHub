import { Badge } from '@/components/ui/badge';
import { UserCheck, AlertCircle, UserX } from 'lucide-react';
import type { EventResponse } from '@/api-client';

interface EventBadgesProps {
    event: EventResponse;
}

export function EventBadges({ event }: EventBadgesProps) {
    const getStatusBadge = () => {
        if (event.status === 'REJECTED') {
            return (
                <Badge variant="destructive">
                    <UserX className="mr-1 h-3 w-3" />
                    Rejected
                </Badge>
            );
        }
        if (event.isApproved) {
            return (
                <Badge variant="default" className="bg-green-500">
                    <UserCheck className="mr-1 h-3 w-3" />
                    Approved
                </Badge>
            );
        }
        return (
            <Badge variant="secondary">
                <AlertCircle className="mr-1 h-3 w-3" />
                Pending Approval
            </Badge>
        );
    };

    return (
        <div className="flex flex-wrap gap-2">
            {getStatusBadge()}
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
