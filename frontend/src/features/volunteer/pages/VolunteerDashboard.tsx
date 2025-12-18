import { SkeletonTransition } from "@/components/common/SkeletonTransition";
import { VolunteerDashboardSkeleton } from "../components/VolunteerDashboardSkeleton";
import AnimatedPage from "@/components/common/AnimatedPage";
import { ApiErrorState } from "@/components/ui/api-error-state";
import { useVolunteerDashboard } from "../hooks/useVolunteerDashboard";
import { VolunteerStats } from "../components/VolunteerStats";
import { UpcomingEventsList } from "../components/UpcomingEventsList";
import { PendingRegistrationsList } from "../components/PendingRegistrationsList";
import { NewOpportunitiesList } from "../components/NewOpportunitiesList";
import { VolunteerQuickActions } from "../components/VolunteerQuickActions";
import { HeroSection } from "@/components/common/HeroSection";
import { useAuth } from "@/features/auth/hooks/useAuth";

export const VolunteerDashboard = () => {
  const { user } = useAuth();
  const {
    dashboardData,
    isLoading,
    isError,
    error,
    refetch,
    handleNavigateToEvent,
    handleNavigateToEvents,
    handleNavigateToRegisteredEvents,
    handleNavigateToNotifications,
    handleNavigateToProfile,
  } = useVolunteerDashboard();

  const myUpcomingEvents = dashboardData?.myUpcomingEvents || [];
  const myPendingRegistrations = dashboardData?.myPendingRegistrations || [];
  const newlyApprovedEvents = dashboardData?.newlyApprovedEvents || [];

  const stats = {
    upcomingCount: myUpcomingEvents.length,
    pendingCount: myPendingRegistrations.length,
    newCount: newlyApprovedEvents.length,
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <AnimatedPage>
      <SkeletonTransition
        isLoading={isLoading}
        skeleton={<VolunteerDashboardSkeleton />}
      >
        {isError ? (
          <div className="max-w-7xl mx-auto p-6">
            <ApiErrorState error={error} onRetry={refetch} />
          </div>
        ) : (
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Hero Welcome Section with Quick Actions Side-by-Side */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left: Hero Section */}
              <div className="lg:col-span-8">
                <HeroSection
                  title={`${getGreeting()}, ${
                    user?.name?.split(" ")[0] || "Volunteer"
                  }!`}
                  subtitle="Ready to make a difference today? Explore upcoming volunteer opportunities and manage your commitments."
                  variant="volunteer"
                />
              </div>

              {/* Right: Quick Actions - Prominent Position */}
              <div className="lg:col-span-4">
                <VolunteerQuickActions
                  onBrowse={handleNavigateToEvents}
                  onRegistrations={handleNavigateToRegisteredEvents}
                  onNotifications={handleNavigateToNotifications}
                  onProfile={handleNavigateToProfile}
                />
              </div>
            </div>

            {/* Stats Overview */}
            <VolunteerStats stats={stats} />

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <UpcomingEventsList
                events={myUpcomingEvents}
                onEventClick={handleNavigateToEvent}
              />

              <PendingRegistrationsList
                registrations={myPendingRegistrations}
                onEventClick={handleNavigateToEvent}
              />

              <NewOpportunitiesList
                events={newlyApprovedEvents}
                onEventClick={handleNavigateToEvent}
              />
            </div>
          </div>
        )}
      </SkeletonTransition>
    </AnimatedPage>
  );
};
