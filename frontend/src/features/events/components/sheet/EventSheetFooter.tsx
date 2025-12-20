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
    const { isOrganizer, isOwner, isAdmin, canRegister, isRegistered, isVolunteer, isEventEnded, isRegistrationClosed } = useEventPermissions(event);
    const navigate = useNavigate();

    // Determine button text and state
    const getRegistrationButtonConfig = () => {
        if (isEventEnded) {
            return { text: 'Event Ended', disabled: true };
        }
        if (isRegistrationClosed) {
            return { text: 'Registration Closed', disabled: true };
        }
        if (event.isFull) {
            return { text: event.waitlistEnabled ? 'Join Waitlist' : 'Event Full', disabled: !event.waitlistEnabled };
        }
        if (!event.isApproved) {
            return { text: 'Awaiting Approval', disabled: true };
        }
        return { text: 'Register for Event', disabled: false };
    };

    const buttonConfig = getRegistrationButtonConfig();

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
                ) : isVolunteer && isRegistered ? (
                    <Button
                        className="w-full"
                        size="lg"
                        disabled
                    >
                        Registered
                    </Button>
                ) : isVolunteer && canRegister ? (
                    <Button
                        className="w-full"
                        size="lg"
                        disabled={buttonConfig.disabled}
                        onClick={onRegister}
                    >
                        {buttonConfig.text}
                    </Button>
                ) : null}
            </div>
        </SheetFooter>
    );
}
