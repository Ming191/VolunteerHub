import { useAuth } from '@/features/auth/hooks/useAuth';
import type { EventResponse } from '@/api-client';
import { useGetRegistrationStatus } from "@/features/volunteer/hooks/useRegistration.ts";

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
        };
    }

    const isAdmin = user.role === 'ADMIN';
    const isOrganizer = user.role === 'EVENT_ORGANIZER';
    const isOwner = user.userId === event.creatorId;
    const isRegistered = isVolunteer && (data?.status === 'APPROVED' || data?.status === 'PENDING');
    const isApprovedMember = isVolunteer && data?.status === 'APPROVED';
    const isRejected = isVolunteer && data?.status === 'REJECTED';
    const canRegister = isVolunteer && !event.isFull && event.isApproved;    // Backend strictly requires approved registration to post
    const canPost = isApprovedMember || isOwner;

    return {
        isAdmin,
        isOrganizer,
        isVolunteer,
        isOwner,
        isRegistered,
        isApprovedMember,
        isRejected,
        canRegister,
        canPost,
    };
}
