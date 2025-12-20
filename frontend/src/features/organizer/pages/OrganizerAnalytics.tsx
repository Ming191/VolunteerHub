import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AnimatedPage from '@/components/common/AnimatedPage';
import { BarChart3, TrendingUp, Users, Calendar } from 'lucide-react';
import { useOrganizerAnalytics } from '../hooks/useOrganizerAnalytics';
import { SkeletonTransition } from '@/components/common/SkeletonTransition';
import { ApiErrorState } from '@/components/ui/api-error-state';
import type { DashboardTopEventItem } from '@/api-client';

const AnalyticsSkeleton = () => (
  <div className="max-w-6xl mx-auto p-6 space-y-6 animate-pulse">
    <div className="h-8 bg-muted rounded w-1/4" />
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-32 bg-muted rounded" />
      ))}
    </div>
    <div className="grid gap-6 md:grid-cols-2">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-64 bg-muted rounded" />
      ))}
    </div>
  </div>
);

export const OrganizerAnalytics = () => {
  const { analyticsData, isLoading, isError, error, refetch } = useOrganizerAnalytics();

  const stats = analyticsData || {
    totalEvents: 0,
    totalRegistrations: 0,
    activeEvents: 0,
    avgRegistrationRate: 0,
    topEvents: [],
    registrationsByStatus: {}
  };

  return (
    <AnimatedPage>
      <SkeletonTransition
        isLoading={isLoading}
        skeleton={<AnalyticsSkeleton />}
      >
        {isError ? (
          <div className="max-w-6xl mx-auto p-6">
            <ApiErrorState error={error} onRetry={refetch} />
          </div>
        ) : (
          <div className="max-w-6xl mx-auto p-6 space-y-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
              <p className="text-muted-foreground mt-2">
                Insights and performance metrics for your events
              </p>
            </div>

            {/* Overview Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Events</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalEvents}</div>
                  <p className="text-xs text-muted-foreground">Events created</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Registrations</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalRegistrations}</div>
                  <p className="text-xs text-muted-foreground">Across all events</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Events</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.activeEvents}</div>
                  <p className="text-xs text-muted-foreground">Currently active</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg. Registration Rate</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.avgRegistrationRate.toFixed(1)}%</div>
                  <p className="text-xs text-muted-foreground">Per event</p>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Analytics Sections */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Top Performing Events</CardTitle>
                  <CardDescription>Events with highest registration count</CardDescription>
                </CardHeader>
                <CardContent>
                  {stats.topEvents && stats.topEvents.length > 0 ? (
                    <div className="space-y-4">
                      {stats.topEvents.map((event: DashboardTopEventItem, index: number) => (
                        <div key={event.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold">
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-medium">{event.title}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold">{event.count}</p>
                            <p className="text-xs text-muted-foreground">registrations</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-20" />
                        <p className="text-sm">No events with registrations yet</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Registration Status Breakdown</CardTitle>
                  <CardDescription>Distribution of registration statuses</CardDescription>
                </CardHeader>
                <CardContent>
                  {stats.registrationsByStatus && Object.keys(stats.registrationsByStatus).length > 0 ? (
                    <div className="space-y-3">
                      {Object.entries(stats.registrationsByStatus).map(([status, count]) => (
                        <div key={status} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`h-3 w-3 rounded-full ${
                              status === 'APPROVED' ? 'bg-green-500' :
                              status === 'PENDING' ? 'bg-yellow-500' :
                              status === 'REJECTED' ? 'bg-red-500' :
                              status === 'COMPLETED' ? 'bg-blue-500' :
                              status === 'CANCELLED' ? 'bg-gray-500' :
                              'bg-orange-500'
                            }`} />
                            <span className="text-sm font-medium capitalize">
                              {status.toLowerCase().replace('_', ' ')}
                            </span>
                          </div>
                          <span className="text-sm font-semibold">{String(count)}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <Users className="h-12 w-12 mx-auto mb-2 opacity-20" />
                        <p className="text-sm">No registrations yet</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </SkeletonTransition>
    </AnimatedPage>
  );
};
