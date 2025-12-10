import { useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { DashboardApi, Configuration } from '@/api-client';
import axiosInstance from '@/utils/axiosInstance';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, TrendingUp, Users, CheckCircle2, AlertCircle } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import AnimatedPage from '@/components/common/AnimatedPage';

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

export default function VolunteerDashboard() {
  const navigate = useNavigate();

  const dashboardApi = useMemo(() => new DashboardApi(new Configuration(), '', axiosInstance), []);

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['volunteer-dashboard'],
    queryFn: async () => {
      const response = await dashboardApi.getVolunteerDashboard();
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const handleNavigateToEvent = useCallback((eventId: number) => navigate(`/events/${eventId}`), [navigate]);
  const handleNavigateToEvents = useCallback(() => navigate('/events'), [navigate]);
  const handleNavigateToRegisteredEvents = useCallback(() => navigate('/my-registrations'), [navigate]);

  if (isLoading) {
    return (
      <AnimatedPage>
        <div className="max-w-6xl mx-auto p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24" />)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="h-64" />
            <Skeleton className="h-64 lg:col-span-2" />
          </div>
        </div>
      </AnimatedPage>
    );
  }

  const myUpcomingEvents = dashboardData?.myUpcomingEvents || [];
  const myPendingRegistrations = dashboardData?.myPendingRegistrations || [];
  const newlyApprovedEvents = dashboardData?.newlyApprovedEvents || [];

  return (
    <AnimatedPage>
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatsCard
            title="Upcoming Events"
            value={myUpcomingEvents.length || 0}
            description="Events you're registered for"
            icon={Calendar}
          />
          <StatsCard
            title="Pending Approvals"
            value={myPendingRegistrations.length || 0}
            description="Awaiting organizer approval"
            icon={Clock}
          />
          <StatsCard
            title="New Opportunities"
            value={newlyApprovedEvents.length || 0}
            description="Recently published events"
            icon={TrendingUp}
          />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upcoming Events */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">My Upcoming Events</CardTitle>
              <CardDescription>{myUpcomingEvents.length} events scheduled</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {myUpcomingEvents.map((event) => (
                  <div
                    key={event.id}
                    className="p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => handleNavigateToEvent(event.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-sm">{event.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">{event.location}</p>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {format(new Date(event.eventDateTime), 'MMM dd, h:mm a')}
                      </div>
                    </div>
                  </div>
                ))}
                {myUpcomingEvents.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No upcoming events</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Pending Registrations */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Pending Approvals</CardTitle>
              <CardDescription>Awaiting response</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {myPendingRegistrations.map((registration) => (
                  <div
                    key={`${registration.eventId}-${registration.registeredAt}`}
                    className="p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => handleNavigateToEvent(registration.eventId)}
                  >
                    <p className="font-medium text-sm line-clamp-1">{registration.eventTitle}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <Clock className="h-3 w-3" />
                      <span>Registered {formatDistanceToNow(new Date(registration.registeredAt), { addSuffix: true })}</span>
                    </div>
                  </div>
                ))}
                {myPendingRegistrations.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    <CheckCircle2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>All caught up!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* New Opportunities */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle className="text-base">New Opportunities</CardTitle>
              <CardDescription>Fresh events just for you</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {newlyApprovedEvents.slice(0, 6).map((event) => (
                  <div
                    key={event.id}
                    className="p-4 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => handleNavigateToEvent(event.id)}
                  >
                    <p className="font-medium text-sm line-clamp-1">{event.title}</p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {format(new Date(event.eventDateTime), 'MMM dd, yyyy')}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{event.location}</p>
                  </div>
                ))}
                {newlyApprovedEvents.length === 0 && (
                  <div className="col-span-3 text-center py-8 text-muted-foreground text-sm">
                    <TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No new events found</p>
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
              <Button variant="outline" className="h-auto py-4 flex-col" onClick={handleNavigateToEvents}>
                <Calendar className="h-5 w-5 mb-2" />
                <span className="text-sm">Browse Events</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col" onClick={handleNavigateToRegisteredEvents}>
                <Users className="h-5 w-5 mb-2" />
                <span className="text-sm">My Registrations</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col" onClick={() => navigate('/notifications')}>
                <AlertCircle className="h-5 w-5 mb-2" />
                <span className="text-sm">Notifications</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col" onClick={() => navigate('/profile')}>
                <CheckCircle2 className="h-5 w-5 mb-2" />
                <span className="text-sm">My Profile</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AnimatedPage>
  );
}
