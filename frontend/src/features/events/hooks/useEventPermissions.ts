import { useAuth } from '@/features/auth/hooks/useAuth';
import type { EventResponse } from '@/api-client';
import { useGetRegistrationStatus } from "@/features/volunteer/hooks/useRegistration.ts";
import { isEventEnded, isRegistrationClosed } from '@/lib/dateUtils';

export function useEventPermissions(event: EventResponse | null) {
    const { user } = useAuth();
    const isVolunteer = user?.role === 'VOLUNTEER';
    const { data } = useGetRegistrationStatus(event?.id, isVolunteer);

    if (!event || !user) {
        return {
            isAdmin: false,
            isOrganizer: false,
            isVolunteer: false,
            isOwner: false,
            canRegister: false,
            canPost: false,
            isEventEnded: false,
            isRegistrationClosed: false,
        };
    }

    const isAdmin = user.role === 'ADMIN';
    const isOrganizer = user.role === 'EVENT_ORGANIZER';
    const isOwner = user.userId === event.creatorId;
    const isRegistered = isVolunteer && data?.registered;
    const isApprovedMember = isVolunteer && data?.status === 'APPROVED';
    const eventEnded = isEventEnded(event.endDateTime);
    const registrationClosed = isRegistrationClosed(event.registrationDeadline);
    const canRegister = isVolunteer && !event.isFull && event.isApproved && !eventEnded && !registrationClosed;
    // Backend strictly requires approved registration to post
    const canPost = isApprovedMember || isOwner;

    return {
        isAdmin,
        isOrganizer,
        isVolunteer,
        isOwner,
        isRegistered,
        isApprovedMember,
        canRegister,
        canPost,
        isEventEnded: eventEnded,
        isRegistrationClosed: registrationClosed,
    };
}
