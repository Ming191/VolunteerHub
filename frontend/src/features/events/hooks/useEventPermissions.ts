import { useAuth } from '@/features/auth/hooks/useAuth';
import type { EventResponse } from '@/api-client';

export function useEventPermissions(event: EventResponse | null) {
    const { user } = useAuth();

    if (!event || !user) {
        return {
            isAdmin: false,
            isOrganizer: false,
            isVolunteer: false,
            isOwner: false,
            canRegister: false,
        };
    }

    const isAdmin = user.role === 'ADMIN';
    const isOrganizer = user.role === 'EVENT_ORGANIZER';
    const isVolunteer = user.role === 'VOLUNTEER';
    const isOwner = user.userId === event.creatorId;
    const canRegister = isVolunteer && !event.isFull && event.isApproved;

    return {
        isAdmin,
        isOrganizer,
        isVolunteer,
        isOwner,
        canRegister,
    };
}
