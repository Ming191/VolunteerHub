import { SkeletonTransition } from '@/components/common/SkeletonTransition';
import { VolunteerDashboardSkeleton } from '../components/VolunteerDashboardSkeleton';
import AnimatedPage from '@/components/common/AnimatedPage';
import { ApiErrorState } from '@/components/ui/api-error-state';
import { useVolunteerDashboard } from '../hooks/useVolunteerDashboard';
import { VolunteerStats } from '../components/VolunteerStats';
import { UpcomingEventsList } from '../components/UpcomingEventsList';
import { PendingRegistrationsList } from '../components/PendingRegistrationsList';
import { NewOpportunitiesList } from '../components/NewOpportunitiesList';
import { VolunteerQuickActions } from '../components/VolunteerQuickActions';

export const VolunteerDashboard = () => {
  const {
    dashboardData,
    isLoading,
    isError,
    error,
    refetch,
    handleNavigateToEvent,
    handleNavigateToEvents,
    handleNavigateToNotifications,
    handleNavigateToProfile
  } = useVolunteerDashboard();

  const myUpcomingEvents = dashboardData?.myUpcomingEvents || [];
  const myPendingRegistrations = dashboardData?.myPendingRegistrations || [];
  const newlyApprovedEvents = dashboardData?.newlyApprovedEvents || [];

  const stats = {
    upcomingCount: myUpcomingEvents.length,
    pendingCount: myPendingRegistrations.length,
    newCount: newlyApprovedEvents.length
  };

  return (
    <AnimatedPage>
      <SkeletonTransition
        isLoading={isLoading}
        skeleton={<VolunteerDashboardSkeleton />}
      >
        {isError ? (
          <div className="max-w-6xl mx-auto p-6">
            <ApiErrorState error={error} onRetry={refetch} />
          </div>
        ) : (
          <div className="max-w-6xl mx-auto p-6 space-y-6">
            <VolunteerStats stats={stats} />

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

            <VolunteerQuickActions
              onBrowse={handleNavigateToEvents}
              onRegistrations={handleNavigateToEvents}
              onNotifications={handleNavigateToNotifications}
              onProfile={handleNavigateToProfile}
            />
          </div>
        )}
      </SkeletonTransition>
    </AnimatedPage>
  );
}
