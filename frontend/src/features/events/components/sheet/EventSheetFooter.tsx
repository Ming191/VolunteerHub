import { SheetFooter } from '@/components/animate-ui/components/radix/sheet';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useEventPermissions } from '../../hooks/useEventPermissions';
import type { EventResponse } from '@/api-client';
import { useNavigate } from '@tanstack/react-router';

interface EventSheetFooterProps {
    event: EventResponse;
    onViewRegistrations: () => void;
    onRegister: () => void;
}

export function EventSheetFooter({ event, onViewRegistrations, onRegister }: EventSheetFooterProps) {
    const { user } = useAuth();
    const { isOrganizer, isOwner, isAdmin, canRegister, isRegistered } = useEventPermissions(event);
    const navigate = useNavigate();

    return (
        <SheetFooter className="sticky bottom-0 bg-background pt-4 pb-4 border-t mt-6 flex flex-col gap-3 sm:flex-row sm:justify-between">
            <Button variant="outline" className="w-full sm:w-auto" onClick={() => navigate({ to: '/events/$eventId', params: { eventId: event.id.toString() } })}>
                View Full Details
            </Button>
            <div className="w-full sm:w-auto flex-1">
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
                        Admin view only
                    </Button>
                ) : isRegistered ? (
                    <Button
                        className="w-full"
                        size="lg"
                        disabled
                    >
                        Registered
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
            </div>
        </SheetFooter>
    );
}
