import { SkeletonTransition } from "@/components/common/SkeletonTransition";
import { VolunteerDashboardSkeleton } from "../components/VolunteerDashboardSkeleton";
import AnimatedPage from "@/components/common/AnimatedPage";
import { ApiErrorState } from "@/components/ui/api-error-state";
import { useVolunteerDashboard } from "../hooks/useVolunteerDashboard";
import { VolunteerStats } from "../components/VolunteerStats";
import { UpcomingEventsList } from "../components/UpcomingEventsList";
import { PendingRegistrationsList } from "../components/PendingRegistrationsList";
import { NewOpportunitiesList } from "../components/NewOpportunitiesList";
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
            {/* Welcome Section with Quick Actions */}
            <div className="rounded-xl bg-gradient-to-br from-white via-green-50/20 to-white border border-green-100 shadow-sm">
              <div className="p-4 sm:p-5">
                {/* Compact Greeting */}
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-green-700 via-gray-900 to-green-700 bg-clip-text text-transparent mb-4">
                  {getGreeting()}, {user?.name?.split(" ")[0] || "Volunteer"}!
                </h1>

                {/* Quick Actions with Visual Hierarchy */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                  {/* PRIMARY ACTION - Browse Events (Large, Prominent) */}
                  <button
                    onClick={handleNavigateToEvents}
                    className="md:col-span-5 group relative p-6 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
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
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <span className="font-bold text-lg text-white mb-1">
                        Browse Events
                      </span>
                      <span className="text-sm text-green-50">
                        Discover new opportunities
                      </span>
                    </div>
                  </button>

                  {/* SECONDARY ACTIONS - Smaller, Grid Layout */}
                  <div className="md:col-span-7 grid grid-cols-3 gap-3">
                    <button
                      onClick={handleNavigateToRegisteredEvents}
                      className="group relative p-4 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 hover:from-green-50 hover:to-emerald-50 border border-gray-200 hover:border-green-300 hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex flex-col items-center gap-2 text-center">
                        <div className="p-2 rounded-lg bg-white group-hover:bg-green-100 transition-colors">
                          <svg
                            className="h-5 w-5 text-gray-600 group-hover:text-green-700 transition-colors"
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
                        <span className="font-semibold text-xs text-gray-700 group-hover:text-green-700 transition-colors">
                          My Registrations
                        </span>
                      </div>
                    </button>

                    <button
                      onClick={handleNavigateToNotifications}
                      className="group relative p-4 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 hover:from-green-50 hover:to-emerald-50 border border-gray-200 hover:border-green-300 hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex flex-col items-center gap-2 text-center">
                        <div className="p-2 rounded-lg bg-white group-hover:bg-green-100 transition-colors">
                          <svg
                            className="h-5 w-5 text-gray-600 group-hover:text-green-700 transition-colors"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                            />
                          </svg>
                        </div>
                        <span className="font-semibold text-xs text-gray-700 group-hover:text-green-700 transition-colors">
                          Notifications
                        </span>
                      </div>
                    </button>

                    <button
                      onClick={handleNavigateToProfile}
                      className="group relative p-4 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 hover:from-green-50 hover:to-emerald-50 border border-gray-200 hover:border-green-300 hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex flex-col items-center gap-2 text-center">
                        <div className="p-2 rounded-lg bg-white group-hover:bg-green-100 transition-colors">
                          <svg
                            className="h-5 w-5 text-gray-600 group-hover:text-green-700 transition-colors"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </div>
                        <span className="font-semibold text-xs text-gray-700 group-hover:text-green-700 transition-colors">
                          Profile
                        </span>
                      </div>
                    </button>
                  </div>
                </div>
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
