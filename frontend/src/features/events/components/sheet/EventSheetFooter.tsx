import { SheetFooter } from '@/components/animate-ui/components/radix/sheet';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useEventPermissions } from '../../hooks/useEventPermissions';
import type { EventResponse } from '@/api-client';

interface EventSheetFooterProps {
    event: EventResponse;
    onViewRegistrations: () => void;
    onRegister: () => void;
}

export function EventSheetFooter({ event, onViewRegistrations, onRegister }: EventSheetFooterProps) {
    const { user } = useAuth();
    const { isOrganizer, isOwner, isAdmin, canRegister } = useEventPermissions(event);

    return (
        <SheetFooter className="sticky bottom-0 bg-background pt-4 pb-4 border-t mt-6">
            {!user ? (
                <Button
                    className="w-full"
                    size="lg"
                    disabled
                >
                    Login to Register
                </Button>
            ) : (isOrganizer && isOwner) ? (
                <Button
                    className="w-full"
                    size="lg"
                    onClick={onViewRegistrations}
                >
                    View Registrations
                </Button>
            ) : isAdmin ? (
                <Button
                    className="w-full"
                    size="lg"
                    disabled
                >
                    Admin can only view
                </Button>
            ) : (
                <Button
                    className="w-full"
                    size="lg"
                    disabled={!canRegister}
                    onClick={onRegister}
                >
                    {event.isFull ? 'Event Full' : event.isApproved ? 'Register for Event' : 'Awaiting Approval'}
                </Button>
            )}
        </SheetFooter>
    );
}
