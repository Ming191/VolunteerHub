import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, MapPin, Clock, Users, Ticket, User } from "lucide-react";
import type { EventResponse } from "@/api-client";
import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";
import { EventMap } from "./EventMap";
import { useEventPermissions } from "../../hooks/useEventPermissions";
import { useAuth } from "@/features/auth/hooks/useAuth";

interface EventInfoSidebarProps {
  event: EventResponse;
  onRegister: () => void;
  isOrganizer?: boolean;
}

export const EventInfoSidebar = ({
  event,
  onRegister,
  isOrganizer,
}: EventInfoSidebarProps) => {
  const { user } = useAuth();
  const {
    canRegister,
    isVolunteer,
    isRegistered,
    isEventEnded: eventEnded,
    isRegistrationClosed: registrationClosedByDeadline,
  } = useEventPermissions(event);

  // Determine registration status
  const getRegistrationStatus = () => {
    if (isRegistered) {
      return { label: "Registered", color: "text-green-600" };
    }
    if (eventEnded) {
      return { label: "Ended", color: "text-muted-foreground" };
    }
    if (registrationClosedByDeadline) {
      return { label: "Closed", color: "text-destructive" };
    }
    if (event.isFull) {
      return { label: "Full", color: "text-destructive" };
    }
    return { label: "Open", color: "text-green-600" };
  };

  const getButtonConfig = (): {
    text: string;
    disabled: boolean;
    variant?: "destructive";
  } => {
    if (isRegistered) {
      return { text: "Unregister", disabled: false, variant: "destructive" };
    }
    if (eventEnded) {
      return { text: "Event Ended", disabled: true };
    }
    if (registrationClosedByDeadline) {
      return { text: "Registration Closed", disabled: true };
    }
    if (event.isFull) {
      return {
        text: event.waitlistEnabled ? "Join Waitlist" : "Event Full",
        disabled: !event.waitlistEnabled,
      };
    }
    return { text: "Register Now", disabled: false };
  };

  const status = getRegistrationStatus();
  const buttonConfig = getButtonConfig();

  // Only show registration section to volunteers
  const showRegistrationSection = !isOrganizer && user && isVolunteer;

  return (
    <div className="lg:sticky lg:top-8">
      <Card className="border-2 border-gray-200 shadow-md bg-white">
        <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-green-50 to-emerald-50">
          <CardTitle className="text-xl font-bold text-gray-900">
            Event Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 hover:bg-green-50 transition-colors">
              <div className="p-2 rounded-lg bg-green-100">
                <Calendar className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Date</p>
                <p className="text-sm text-gray-600">
                  {format(new Date(event.eventDateTime), "EEEE, MMMM d, yyyy")}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 hover:bg-green-50 transition-colors">
              <div className="p-2 rounded-lg bg-green-100">
                <Clock className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Time</p>
                <p className="text-sm text-gray-600">
                  {format(new Date(event.eventDateTime), "h:mm a")} -{" "}
                  {format(new Date(event.endDateTime), "h:mm a")}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 hover:bg-green-50 transition-colors">
              <div className="p-2 rounded-lg bg-green-100">
                <MapPin className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Location</p>
                <p className="text-sm text-gray-600">{event.location}</p>
              </div>
            </div>

            {event.latitude != null && event.longitude != null && (
              <div className="rounded-xl overflow-hidden border-2 border-gray-200 shadow-sm">
                <EventMap
                  latitude={event.latitude}
                  longitude={event.longitude}
                />
              </div>
            )}

            <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 hover:bg-green-50 transition-colors">
              <div className="p-2 rounded-lg bg-green-100">
                <Users className="h-5 w-5 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">Capacity</p>
                <p className="text-sm text-gray-600">
                  {event.maxParticipants
                    ? `${event.maxParticipants} Spots Total`
                    : "Unlimited Spots"}
                </p>
              </div>
            </div>
          </div>

          {showRegistrationSection && (
            <>
              <Separator />

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Registration</span>
                  <span className={`text-sm font-medium ${status.color}`}>
                    {status.label}
                  </span>
                </div>

                {canRegister && (
                  <Button
                    className={`w-full ${
                      buttonConfig.variant === "destructive"
                        ? "bg-red-600 hover:bg-red-700 text-white"
                        : ""
                    }`}
                    size="lg"
                    onClick={onRegister}
                    disabled={buttonConfig.disabled}
                  >
                    <Ticket className="mr-2 h-4 w-4" />
                    {buttonConfig.text}
                  </Button>
                )}
              </div>
            </>
          )}

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-green-600" />
              <p className="text-sm font-semibold text-gray-900">Organizer</p>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                {event.creatorName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">
                  {event.creatorName}
                </p>
                <p className="text-xs text-green-600 font-medium">
                  Event Organizer
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
