import { useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { DashboardApi, Configuration } from '@/api-client';
import axiosInstance from '@/utils/axiosInstance';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { DashboardStatSkeleton } from '@/components/ui/loaders';
import { Button } from '@/components/ui/button';
import { Clock, TrendingUp, Users, AlertCircle, FileCheck, PlusCircle, Settings, Award, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import AnimatedPage from '@/components/common/AnimatedPage';
import { ApiErrorState } from '@/components/ui/api-error-state';

// Stats Card Component
const StatsCard = ({ title, value, description, icon: Icon }: {
  title: string;
  value: number;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value.toLocaleString()}</div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

export default function OrganizerDashboard() {
  const navigate = useNavigate();

  const dashboardApi = useMemo(() => new DashboardApi(new Configuration(), '', axiosInstance), []);



  const { data: dashboardData, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['organizer-dashboard'],
    queryFn: async () => {
      const response = await dashboardApi.getOrganizerDashboard();
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const handleNavigateToEvent = useCallback((eventId: number) => navigate(`/events/${eventId}`), [navigate]);
  const handleNavigateToMyEvents = useCallback(() => navigate('/my-events'), [navigate]);
  const handleNavigateToCreateEvent = useCallback(() => navigate('/my-events'), [navigate]);


  // ... imports

  if (isLoading) {
    return (
      <AnimatedPage>
        <div className="max-w-6xl mx-auto p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => <DashboardStatSkeleton key={i} />)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 h-[400px]">
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
                </div>
              </CardContent>
            </Card>
            <Card className="h-[400px]">
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </AnimatedPage>
    );
  }

  if (isError) {
    return (
      <AnimatedPage>
        <div className="max-w-6xl mx-auto p-6">
          <ApiErrorState error={error} onRetry={refetch} />
        </div>
      </AnimatedPage>
    );
  }

  const stats = dashboardData?.stats || {};
  const recentPendingRegistrations = dashboardData?.recentPendingRegistrations || [];
  const eventsPendingAdminApproval = dashboardData?.eventsPendingAdminApproval || [];
  const topEvents = dashboardData?.topEventsByRegistration || [];

  return (
    <AnimatedPage>
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatsCard
            title="Pending Registrations"
            value={stats.pendingRegistrations || 0}
            description="Awaiting your approval"
            icon={AlertCircle}
          />
          <StatsCard
            title="Events Pending"
            value={stats.eventsPendingAdminApproval || 0}
            description="Awaiting admin review"
            icon={FileCheck}
          />
          <StatsCard
            title="Total Events"
            value={topEvents.length || 0}
            description="Active events"
            icon={Calendar}
          />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pending Registrations */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Pending Registrations</CardTitle>
              <CardDescription>{recentPendingRegistrations.length} volunteers waiting for approval</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {recentPendingRegistrations.map((registration) => (
                  <div
                    key={registration.id}
                    className="p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={handleNavigateToMyEvents}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-sm">{registration.primaryText}</p>
                        <p className="text-xs text-muted-foreground mt-1">{registration.secondaryText}</p>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(registration.timestamp), { addSuffix: true })}
                      </div>
                    </div>
                  </div>
                ))}
                {recentPendingRegistrations.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No pending registrations</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Events Pending Approval */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Events In Review</CardTitle>
              <CardDescription>Awaiting admin approval</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {eventsPendingAdminApproval.map((event) => (
                  <div
                    key={event.id}
                    className="p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => handleNavigateToEvent(event.id)}
                  >
                    <p className="font-medium text-sm line-clamp-1">{event.title}</p>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{event.location}</p>
                  </div>
                ))}
                {eventsPendingAdminApproval.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    <FileCheck className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>All events approved</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Top Events */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle className="text-base">Top Performing Events</CardTitle>
              <CardDescription>Most popular events by registration</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {topEvents.map((event, index) => (
                  <div
                    key={event.id}
                    className="p-4 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors relative overflow-hidden"
                    onClick={() => handleNavigateToEvent(event.id)}
                  >
                    <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-xs font-bold text-primary">#{index + 1}</span>
                    </div>
                    <p className="font-medium text-sm line-clamp-1 pr-8">{event.title}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Users className="h-4 w-4 text-green-600" />
                      <span className="text-xl font-bold text-green-600">{event.count}</span>
                      <span className="text-xs text-muted-foreground">registrations</span>
                    </div>
                  </div>
                ))}
                {topEvents.length === 0 && (
                  <div className="col-span-3 text-center py-8 text-muted-foreground text-sm">
                    <Award className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No events with registrations yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button variant="outline" className="h-auto py-4 flex-col" onClick={handleNavigateToCreateEvent}>
                <PlusCircle className="h-5 w-5 mb-2" />
                <span className="text-sm">Create Event</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col" onClick={handleNavigateToMyEvents}>
                <Settings className="h-5 w-5 mb-2" />
                <span className="text-sm">Manage Events</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col" onClick={handleNavigateToMyEvents}>
                <Users className="h-5 w-5 mb-2" />
                <span className="text-sm">Registrations</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col" onClick={() => navigate('/events')}>
                <TrendingUp className="h-5 w-5 mb-2" />
                <span className="text-sm">Analytics</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AnimatedPage>
  );
}
