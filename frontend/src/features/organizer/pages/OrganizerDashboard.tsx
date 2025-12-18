import { SkeletonTransition } from "@/components/common/SkeletonTransition";
import { OrganizerDashboardSkeleton } from "../components/OrganizerDashboardSkeleton";
import AnimatedPage from "@/components/common/AnimatedPage";
import { HeroSection } from "@/components/common/HeroSection";
import { ApiErrorState } from "@/components/ui/api-error-state";
import { useOrganizerDashboard } from "../hooks/useOrganizerDashboard";
import { useAuth } from "@/features/auth/hooks/useAuth";
import {
  OrganizerStats,
  PendingRegistrationsList,
  EventsInReviewList,
  TopEventsList,
  OrganizerQuickActions,
} from "../components";

export const OrganizerDashboard = () => {
  const { user } = useAuth();
  const {
    dashboardData,
    isLoading,
    isError,
    error,
    refetch,
    handleNavigateToEvent,
    handleNavigateToMyEvents,
    handleNavigateToCreateEvent,
    handleNavigateToAnalytics,
  } = useOrganizerDashboard();

  const stats = dashboardData?.stats || {
    pendingRegistrations: 0,
    eventsPendingAdminApproval: 0,
  };

  const recentPendingRegistrations =
    dashboardData?.recentPendingRegistrations || [];
  const eventsPendingAdminApproval =
    dashboardData?.eventsPendingAdminApproval || [];
  const topEvents = dashboardData?.topEventsByRegistration || [];

  const componentStats = {
    pendingRegistrations: stats.pendingRegistrations || 0,
    eventsPendingAdminApproval: stats.eventsPendingAdminApproval || 0,
    totalEvents: stats.totalEvents || 0,
  };

  return (
    <AnimatedPage>
      <SkeletonTransition
        isLoading={isLoading}
        skeleton={<OrganizerDashboardSkeleton />}
      >
        {isError ? (
          <div className="max-w-7xl mx-auto">
            <ApiErrorState error={error} onRetry={refetch} />
          </div>
        ) : (
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Organizer Hero Section */}
            <HeroSection
              title={`Welcome back, ${
                user?.name?.split(" ")[0] || "Organizer"
              }!`}
              subtitle="Manage your events, review registrations, and create meaningful volunteer opportunities for your community."
              variant="organizer"
            />

            {/* Stats Overview */}
            <OrganizerStats stats={componentStats} />

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <PendingRegistrationsList
                registrations={recentPendingRegistrations}
                onRegistrationClick={handleNavigateToMyEvents}
              />

              <EventsInReviewList
                events={eventsPendingAdminApproval}
                onEventClick={(id) => handleNavigateToEvent(id)}
              />

              <TopEventsList
                events={topEvents}
                onEventClick={(id) => handleNavigateToEvent(id)}
              />
            </div>

            {/* Quick Actions */}
            <OrganizerQuickActions
              onCreateEvent={handleNavigateToCreateEvent}
              onManageEvents={handleNavigateToMyEvents}
              onRegistrations={handleNavigateToMyEvents}
              onAnalytics={handleNavigateToAnalytics}
            />
          </div>
        )}
      </SkeletonTransition>
    </AnimatedPage>
  );
};
