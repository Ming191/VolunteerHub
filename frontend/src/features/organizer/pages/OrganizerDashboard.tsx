import { SkeletonTransition } from '@/components/common/SkeletonTransition';
import { OrganizerDashboardSkeleton } from '@/features/organizer/components';
import AnimatedPage from '@/components/common/AnimatedPage';
import { ApiErrorState } from '@/components/ui/api-error-state';
import { useOrganizerDashboard } from '../hooks/useOrganizerDashboard';
import { OrganizerStats, PendingRegistrationsList, EventsInReviewList, TopEventsList, OrganizerQuickActions } from '../components';

export const OrganizerDashboard = () => {
  const {
    dashboardData,
    isLoading,
    isError,
    error,
    refetch,
    handleNavigateToEvent,
    handleNavigateToMyEvents,
    handleNavigateToCreateEvent,
    handleNavigateToNotifications,
    handleNavigateToAnalytics
  } = useOrganizerDashboard();

  const stats = dashboardData?.stats || {
    pendingRegistrations: 0,
    eventsPendingAdminApproval: 0
  };

  const recentPendingRegistrations = dashboardData?.recentPendingRegistrations || [];
  const eventsPendingAdminApproval = dashboardData?.eventsPendingAdminApproval || [];
  const topEvents = dashboardData?.topEventsByRegistration || [];

  const componentStats = {
    pendingRegistrations: stats.pendingRegistrations || 0,
    eventsPendingAdminApproval: stats.eventsPendingAdminApproval || 0,
    totalEvents: stats.totalEvents || 0
  };

  return (
    <AnimatedPage>
      <SkeletonTransition
        isLoading={isLoading}
        skeleton={<OrganizerDashboardSkeleton />}
      >
        {isError ? (
          <div className="max-w-6xl mx-auto p-6">
            <ApiErrorState error={error} onRetry={refetch} />
          </div>
        ) : (
          <div className="max-w-6xl mx-auto p-6 space-y-6">
            <OrganizerStats stats={componentStats} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <PendingRegistrationsList
                registrations={recentPendingRegistrations}
                onRegistrationClick={handleNavigateToEvent}
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

            <OrganizerQuickActions
              onCreateEvent={handleNavigateToCreateEvent}
              onManageEvents={handleNavigateToMyEvents}
              onNotifications={handleNavigateToNotifications}
              onAnalytics={handleNavigateToAnalytics}
            />
          </div>
        )}
      </SkeletonTransition>
    </AnimatedPage>
  );
}
