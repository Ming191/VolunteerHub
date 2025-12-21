import { SkeletonTransition } from "@/components/common/SkeletonTransition";
import { OrganizerDashboardSkeleton } from "../components/OrganizerDashboardSkeleton";
import AnimatedPage from "@/components/common/AnimatedPage";
import { ApiErrorState } from "@/components/ui/api-error-state";
import { useOrganizerDashboard } from "../hooks/useOrganizerDashboard";
import { useAuth } from "@/features/auth/hooks/useAuth";
import {
  OrganizerStats,
  PendingRegistrationsList,
  EventsInReviewList,
  TopEventsList,
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
    handleNavigateToNotifications,
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
        skeleton={<OrganizerDashboardSkeleton />}
      >
        {isError ? (
          <div className="max-w-7xl mx-auto p-6">
            <ApiErrorState error={error} onRetry={refetch} />
          </div>
        ) : (
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Welcome Section with Quick Actions */}
            <div className="rounded-xl bg-gradient-to-br from-white via-orange-50/20 to-white border border-orange-100 shadow-sm">
              <div className="p-4 sm:p-5">
                {/* Compact Greeting */}
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-orange-700 via-gray-900 to-orange-700 bg-clip-text text-transparent mb-4">
                  {getGreeting()}, {user?.name?.split(" ")[0] || "Organizer"}!
                </h1>

                {/* Quick Actions with Visual Hierarchy */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                  {/* PRIMARY ACTION - Create Event (Large, Prominent) */}
                  <button
                    onClick={handleNavigateToCreateEvent}
                    className="md:col-span-5 group relative p-6 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
                    <div className="relative z-10 flex flex-col items-start text-left">
                      <div className="p-3 rounded-lg bg-white/20 backdrop-blur-sm mb-3">
                        <svg
                          className="h-7 w-7 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                      </div>
                      <span className="font-bold text-lg text-white mb-1">
                        Create Event
                      </span>
                      <span className="text-sm text-orange-50">
                        Start a new opportunity
                      </span>
                    </div>
                  </button>

                  {/* SECONDARY ACTIONS - Smaller, Grid Layout */}
                  <div className="md:col-span-7 grid grid-cols-3 gap-3">
                    <button
                      onClick={handleNavigateToMyEvents}
                      className="group relative p-4 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 hover:from-orange-50 hover:to-amber-50 border border-gray-200 hover:border-orange-300 hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex flex-col items-center gap-2 text-center">
                        <div className="p-2 rounded-lg bg-white group-hover:bg-orange-100 transition-colors">
                          <svg
                            className="h-5 w-5 text-gray-600 group-hover:text-orange-700 transition-colors"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                        <span className="font-semibold text-xs text-gray-700 group-hover:text-orange-700 transition-colors">
                          My Events
                        </span>
                      </div>
                    </button>

                    <button
                      onClick={handleNavigateToNotifications}
                      className="group relative p-4 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 hover:from-orange-50 hover:to-amber-50 border border-gray-200 hover:border-orange-300 hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex flex-col items-center gap-2 text-center">
                        <div className="p-2 rounded-lg bg-white group-hover:bg-orange-100 transition-colors">
                          <svg
                            className="h-5 w-5 text-gray-600 group-hover:text-orange-700 transition-colors"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                            />
                          </svg>
                        </div>
                        <span className="font-semibold text-xs text-gray-700 group-hover:text-orange-700 transition-colors">
                          Notifications
                        </span>
                      </div>
                    </button>

                    <button
                      onClick={handleNavigateToAnalytics}
                      className="group relative p-4 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 hover:from-orange-50 hover:to-amber-50 border border-gray-200 hover:border-orange-300 hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex flex-col items-center gap-2 text-center">
                        <div className="p-2 rounded-lg bg-white group-hover:bg-orange-100 transition-colors">
                          <svg
                            className="h-5 w-5 text-gray-600 group-hover:text-orange-700 transition-colors"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                            />
                          </svg>
                        </div>
                        <span className="font-semibold text-xs text-gray-700 group-hover:text-orange-700 transition-colors">
                          Analytics
                        </span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Overview */}
            <OrganizerStats stats={componentStats} />

            {/* Main Content Grid */}
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
          </div>
        )}
      </SkeletonTransition>
    </AnimatedPage>
  );
};
