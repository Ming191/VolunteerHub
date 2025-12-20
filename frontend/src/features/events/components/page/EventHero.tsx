import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
import type { EventResponse } from "@/api-client";
import { format } from "date-fns";
import { useEventPermissions } from "../../hooks/useEventPermissions";
import { useAuth } from "@/features/auth/hooks/useAuth";

interface EventHeroProps {
  event: EventResponse;
  isOrganizer?: boolean;
  onRegister?: () => void;
}

export const EventHero = ({
  event,
  isOrganizer,
  onRegister,
}: EventHeroProps) => {
  const bgImage = event.imageUrls?.[0] || null;
  const { user } = useAuth();
  const {
    canRegister,
    isVolunteer,
    isEventEnded: eventEnded,
    isRegistrationClosed: registrationClosedByDeadline,
    isRegistered,
  } = useEventPermissions(event);

  const getButtonConfig = (): {
    text: string;
    disabled: boolean;
    variant?: "secondary";
  } => {
    if (isRegistered) {
      return { text: "Unregister", disabled: false, variant: "secondary" };
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

  const buttonConfig = getButtonConfig();

  const handleShare = async () => {
    const shareData = {
      title: event.title,
      text: `Check out ${event.title} on VolunteerHub!`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        // Ideally we'd show a toast here, but for now this is the fallback
      }
    } catch (err) {
      console.error("Error sharing:", err);
    }
  };

  return (
    <div className="w-full bg-white">
      {/* Hero Image Section */}
      <div className="relative w-full h-[400px] md:h-[500px] overflow-hidden">
        {bgImage ? (
          <>
            {/* Main Image */}
            <div className="absolute inset-0">
              <img
                src={bgImage}
                alt={event.title}
                className="w-full h-full object-cover object-center"
              />
            </div>
            {/* Gradient Overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600" />
        )}

        {/* Content Overlay */}
        <div className="absolute inset-0 flex items-end">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
            <div className="space-y-4 md:space-y-6 max-w-4xl">
              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {Array.from(event.tags || []).map((tag) => (
                  <Badge
                    key={tag}
                    className="bg-green-500/90 hover:bg-green-600 text-white border-none backdrop-blur-sm px-3 py-1 text-xs md:text-sm"
                  >
                    {tag.replace(/_/g, " ")}
                  </Badge>
                ))}
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold leading-tight text-white drop-shadow-lg">
                {event.title}
              </h1>

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-3 md:gap-4 text-white/95 text-sm md:text-lg">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">
                    Hosted by {event.creatorName}
                  </span>
                </div>
                <span className="text-white/60">•</span>
                <span className="font-medium">
                  {format(new Date(event.eventDateTime), "MMMM d, yyyy")}
                </span>
              </div>

              {/* Action Buttons */}
              {!isOrganizer && user && isVolunteer && canRegister && (
                <div className="flex flex-wrap gap-3 pt-2 md:pt-4">
                  <Button
                    size="lg"
                    className={
                      buttonConfig.variant === "secondary"
                        ? "bg-red-600 text-white hover:bg-red-700 shadow-lg"
                        : "bg-green-600 text-white hover:bg-green-700 shadow-lg px-6 md:px-8 py-5 md:py-6 text-base md:text-lg font-semibold"
                    }
                    onClick={onRegister}
                    disabled={buttonConfig.disabled}
                  >
                    {buttonConfig.text}
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="bg-white/10 text-white border-white/30 hover:bg-white/20 backdrop-blur-sm shadow-lg px-4 md:px-6 py-5 md:py-6"
                    onClick={handleShare}
                  >
                    <Share2 className="mr-2 h-4 w-4 md:h-5 md:w-5" /> Share
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
