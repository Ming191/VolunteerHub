import { useAuth } from '@/features/auth/hooks/useAuth';
import type { EventResponse } from '@/api-client';
import { useGetRegistrationStatus } from "@/features/volunteer/hooks/useRegistration.ts";

export function useEventPermissions(event: EventResponse | null) {
    const { user } = useAuth();
    const { data } = useGetRegistrationStatus(event?.id);
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
    const isRegistered = isVolunteer && data?.registered;
    const isApprovedMember = isVolunteer && data?.status === 'APPROVED';
    const canRegister = isVolunteer && !event.isFull && event.isApproved;
    // Backend strictly requires approved registration to post
    const canPost = isApprovedMember;

    return {
        isAdmin,
        isOrganizer,
        isVolunteer,
        isOwner,
        isRegistered,
        isApprovedMember,
        canRegister,
        canPost,
    };
}
