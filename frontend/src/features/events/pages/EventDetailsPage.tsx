import {
  useParams,
  useNavigate,
  useLocation,
  Outlet,
} from "@tanstack/react-router";
import { useGetEvent } from "../hooks/useEvents";
import {
  useRegisterForEvent,
  useCancelRegistration,
} from "@/features/volunteer/hooks/useRegistration";
import { SkeletonTransition } from "@/components/common/SkeletonTransition";
import AnimatedPage from "@/components/common/AnimatedPage";
import { ApiErrorState } from "@/components/ui/api-error-state";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useEventPermissions } from "../hooks/useEventPermissions";
import {
  EventHero,
  EventInfoSidebar,
  EventTabsNavigation,
} from "../components/page";

export const EventDetailsPage = () => {
  const { eventId } = useParams({ strict: false });
  const navigate = useNavigate();
  const location = useLocation();
  const id = parseInt(eventId ?? "0", 10);

  const isPostsPage = location.pathname.endsWith("/posts");
  const isAttendeesPage = location.pathname.endsWith("/attendees");
  const isGalleryPage = location.pathname.endsWith("/gallery");

  let activeTab = "about";
  if (isPostsPage) activeTab = "community";
  else if (isAttendeesPage) activeTab = "attendees";
  else if (isGalleryPage) activeTab = "gallery";

  const { data: event, isLoading, isError, error, refetch } = useGetEvent(id);
  const { isOrganizer, isRegistered } = useEventPermissions(event || null);

  const registerMutation = useRegisterForEvent();
  const cancelMutation = useCancelRegistration();

  if (isNaN(id)) {
    return (
      <AnimatedPage>
        <div className="container mx-auto py-8">
          <ApiErrorState
            error={new Error("Invalid event ID")}
            onRetry={() => navigate({ to: "/events" })}
          />
        </div>
      </AnimatedPage>
    );
  }

  const handleRegister = () => {
    if (!event) return;

    if (isRegistered) {
      if (confirm("Are you sure you want to cancel your registration?")) {
        cancelMutation.mutate(id);
      }
    } else {
      registerMutation.mutate(id);
    }
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate({ to: ".." });
    } else {
      navigate({ to: "/events" });
    }
  };

  return (
    <AnimatedPage>
      <SkeletonTransition
        isLoading={isLoading}
        skeleton={<div className="h-screen w-full bg-muted animate-pulse" />}
      >
        {isError ? (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <ApiErrorState error={error} onRetry={refetch} />
          </div>
        ) : event ? (
          <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <EventHero
              event={event}
              isOrganizer={isOrganizer}
              onRegister={handleRegister}
            />

            {/* Main Content Container */}
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
                {/* Left Column - Main Content */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Tabs Navigation */}
                  <EventTabsNavigation event={event} activeTab={activeTab} />

                  {/* Tab Content */}
                  <Outlet />
                </div>

                {/* Right Column - Sidebar */}
                <div className="lg:col-span-1">
                  <EventInfoSidebar
                    event={event}
                    onRegister={handleRegister}
                    isOrganizer={isOrganizer}
                  />
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </SkeletonTransition>
    </AnimatedPage>
  );
};
