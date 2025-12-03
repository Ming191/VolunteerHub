import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { DashboardApi, Configuration } from '@/api-client';
import axiosInstance from '@/utils/axiosInstance';
import { BentoCard, BentoGrid } from '@/components/ui/bento-grid';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, Clock, TrendingUp, Users, CheckCircle2, AlertCircle, MessageSquare, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { format } from 'date-fns';

const config = new Configuration({ basePath: '' });
const dashboardApi = new DashboardApi(config, undefined, axiosInstance);

export default function VolunteerDashboard() {
  const navigate = useNavigate();

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['volunteer-dashboard'],
    queryFn: async () => {
      const response = await dashboardApi.getVolunteerDashboard();
      return response.data;
    },
    refetchInterval: 60000, // Refetch every minute
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Welcome Back!
        </h1>
        <p className="text-muted-foreground mt-2">
          Here's what's happening with your volunteer activities
        </p>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Upcoming Events
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{dashboardData?.myUpcomingEvents?.length || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Events you're registered for
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Approvals
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{dashboardData?.myPendingRegistrations?.length || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Awaiting organizer approval
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              New Opportunities
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{dashboardData?.newlyApprovedEvents?.length || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Recently published events
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Bento Grid for Main Content */}
      <BentoGrid className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3 auto-rows-[20rem]">
        {/* My Upcoming Events */}
        <BentoCard
          name="My Upcoming Events"
          className="col-span-1 md:col-span-1"
          background={
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10" />
          }
          Icon={Calendar}
          description={`${dashboardData?.myUpcomingEvents?.length || 0} events scheduled`}
          href="/events"
          cta="View All"
        >
          <div className="absolute inset-0 p-6 overflow-y-auto">
            <div className="space-y-3 mt-12">
              {dashboardData?.myUpcomingEvents?.slice(0, 3).map((event) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-background/80 backdrop-blur p-3 rounded-lg border cursor-pointer hover:border-primary transition-colors"
                  onClick={() => navigate(`/events/${event.id}`)}
                >
                  <h4 className="font-semibold text-sm line-clamp-1">{event.title}</h4>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {format(new Date(event.eventDateTime), 'MMM dd, yyyy • h:mm a')}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{event.location}</p>
                </motion.div>
              ))}
              {(!dashboardData?.myUpcomingEvents || dashboardData.myUpcomingEvents.length === 0) && (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  No upcoming events yet
                </div>
              )}
            </div>
          </div>
        </BentoCard>

        {/* Pending Registrations */}
        <BentoCard
          name="Pending Approvals"
          className="col-span-1 md:col-span-1"
          background={
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-orange-500/10" />
          }
          Icon={AlertCircle}
          description={`${dashboardData?.myPendingRegistrations?.length || 0} awaiting response`}
          href="/events"
          cta="View Events"
        >
          <div className="absolute inset-0 p-6 overflow-y-auto">
            <div className="space-y-3 mt-12">
              {dashboardData?.myPendingRegistrations?.map((registration) => (
                <motion.div
                  key={`${registration.eventId}-${registration.registeredAt}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-background/80 backdrop-blur p-3 rounded-lg border border-amber-500/50 cursor-pointer hover:border-amber-500 transition-colors"
                  onClick={() => navigate(`/events/${registration.eventId}`)}
                >
                  <h4 className="font-semibold text-sm line-clamp-1">{registration.eventTitle}</h4>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    Registered {formatDistanceToNow(new Date(registration.registeredAt), { addSuffix: true })}
                  </div>
                </motion.div>
              ))}
              {(!dashboardData?.myPendingRegistrations || dashboardData.myPendingRegistrations.length === 0) && (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  <CheckCircle2 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  All caught up!
                </div>
              )}
            </div>
          </div>
        </BentoCard>

        {/* Trending Events */}
        <BentoCard
          name="Trending Events"
          className="col-span-1 md:col-span-1"
          background={
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10" />
          }
          Icon={TrendingUp}
          description="Most popular events this week"
          href="/events"
          cta="Explore"
        >
          <div className="absolute inset-0 p-6 overflow-y-auto">
            <div className="space-y-3 mt-12">
              {dashboardData?.trendingEvents?.slice(0, 3).map((event) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-background/80 backdrop-blur p-3 rounded-lg border cursor-pointer hover:border-primary transition-colors"
                  onClick={() => navigate(`/events/${event.id}`)}
                >
                  <h4 className="font-semibold text-sm line-clamp-1">{event.title}</h4>
                  <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {format(new Date(event.eventDateTime), 'MMM dd, yyyy')}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-green-600">
                      <Users className="h-3 w-3" />
                      {event.registrationCount}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{event.location}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </BentoCard>

        {/* New Events */}
        <BentoCard
          name="Newly Approved Events"
          className="col-span-1 md:col-span-2 lg:col-span-2"
          background={
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-rose-500/10" />
          }
          Icon={CheckCircle2}
          description="Fresh opportunities just for you"
          href="/events"
          cta="Browse All"
        >
          <div className="absolute inset-0 p-6 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-12">
              {dashboardData?.newlyApprovedEvents?.slice(0, 4).map((event) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-background/80 backdrop-blur p-3 rounded-lg border cursor-pointer hover:border-primary transition-colors"
                  onClick={() => navigate(`/events/${event.id}`)}
                >
                  <h4 className="font-semibold text-sm line-clamp-1">{event.title}</h4>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {format(new Date(event.eventDateTime), 'MMM dd, yyyy • h:mm a')}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{event.location}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </BentoCard>

        {/* Recent Wall Posts */}
        <BentoCard
          name="Community Activity"
          className="col-span-1 md:col-span-1"
          background={
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-purple-500/10" />
          }
          Icon={MessageSquare}
          description="Latest updates from your events"
          href="/events"
          cta="View Posts"
        >
          <div className="absolute inset-0 p-6 overflow-y-auto">
            <div className="space-y-3 mt-12">
              {dashboardData?.recentWallPosts?.map((post) => (
                <motion.div
                  key={post.postId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-background/80 backdrop-blur p-3 rounded-lg border cursor-pointer hover:border-primary transition-colors"
                  onClick={() => navigate(`/events/${post.eventId}`)}
                >
                  <p className="text-sm line-clamp-2">{post.contentPreview}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs font-medium">{post.authorName}</span>
                    <span className="text-xs text-muted-foreground">{post.eventName}</span>
                  </div>
                </motion.div>
              ))}
              {(!dashboardData?.recentWallPosts || dashboardData.recentWallPosts.length === 0) && (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  No recent posts
                </div>
              )}
            </div>
          </div>
        </BentoCard>
      </BentoGrid>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Jump to the most common tasks</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button
              onClick={() => navigate('/events')}
              className="p-4 rounded-lg border hover:border-primary hover:bg-primary/5 transition-colors text-left group"
            >
              <Calendar className="h-6 w-6 mb-2 text-primary" />
              <div className="text-sm font-medium">Browse Events</div>
              <ArrowRight className="h-4 w-4 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
            <button
              onClick={() => navigate('/events')}
              className="p-4 rounded-lg border hover:border-primary hover:bg-primary/5 transition-colors text-left group"
            >
              <Users className="h-6 w-6 mb-2 text-primary" />
              <div className="text-sm font-medium">My Registrations</div>
              <ArrowRight className="h-4 w-4 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
            <button
              onClick={() => navigate('/notifications')}
              className="p-4 rounded-lg border hover:border-primary hover:bg-primary/5 transition-colors text-left group"
            >
              <AlertCircle className="h-6 w-6 mb-2 text-primary" />
              <div className="text-sm font-medium">Notifications</div>
              <ArrowRight className="h-4 w-4 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
            <button
              onClick={() => navigate('/profile')}
              className="p-4 rounded-lg border hover:border-primary hover:bg-primary/5 transition-colors text-left group"
            >
              <CheckCircle2 className="h-6 w-6 mb-2 text-primary" />
              <div className="text-sm font-medium">My Profile</div>
              <ArrowRight className="h-4 w-4 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
