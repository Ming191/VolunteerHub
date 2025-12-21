import { SheetFooter } from "@/components/animate-ui/components/radix/sheet";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useEventPermissions } from "../../hooks/useEventPermissions";
import type { EventResponse } from "@/api-client";
import { useNavigate } from "@tanstack/react-router";

interface EventSheetFooterProps {
  event: EventResponse;
  onViewRegistrations: () => void;
  onRegister: () => void;
  onClose?: () => void;
}

export function EventSheetFooter({
  event,
  onViewRegistrations,
  onRegister,
  onClose,
}: EventSheetFooterProps) {
  const { user } = useAuth();
  const {
    isOrganizer,
    isOwner,
    isAdmin,
    canRegister,
    isRegistered,
    isVolunteer,
    isEventEnded,
    isRegistrationClosed,
  } = useEventPermissions(event);
  const navigate = useNavigate();

  // Determine button text and state
  const getRegistrationButtonConfig = () => {
    if (isEventEnded) {
      return { text: "Event Ended", disabled: true };
    }
    if (isRegistrationClosed) {
      return { text: "Registration Closed", disabled: true };
    }
    if (event.isFull) {
      return {
        text: event.waitlistEnabled ? "Join Waitlist" : "Event Full",
        disabled: !event.waitlistEnabled,
      };
    }
    if (!event.isApproved) {
      return { text: "Awaiting Approval", disabled: true };
    }
    return { text: "Register for Event", disabled: false };
  };

  const buttonConfig = getRegistrationButtonConfig();

  const handleViewFullDetails = () => {
    // Close sheet first
    if (onClose) {
      onClose();
    }
    // Then navigate - need to include the slash at the end for the default child route
    setTimeout(() => {
      navigate({
        to: "/events/$eventId/",
        params: { eventId: String(event.id) },
      });
    }, 100);
  };

  return (
    <div className="border-t border-gray-200 bg-white px-6 py-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
        <Button
          variant="outline"
          className="w-full sm:w-auto order-2 sm:order-1"
          onClick={handleViewFullDetails}
        >
          View Full Details
        </Button>
        <div className="w-full sm:w-auto sm:flex-1 sm:ml-3 order-1 sm:order-2">
          {!user ? (
            <Button className="w-full" size="lg" disabled>
              Login to Register
            </Button>
          ) : isOrganizer && isOwner ? (
            <Button
              variant="outline"
              className="w-full"
              size="lg"
              onClick={onViewRegistrations}
            >
              View Registrations
            </Button>
          ) : isAdmin ? (
            <Button className="w-full" size="lg" disabled>
              Admin view only
            </Button>
          ) : isVolunteer && isRegistered ? (
            <Button className="w-full" size="lg" disabled>
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
      </div>
    </div>
  );
}
