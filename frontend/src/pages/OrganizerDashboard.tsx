import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { DashboardApi, Configuration } from '@/api-client';
import axiosInstance from '@/utils/axiosInstance';
import { BentoCard, BentoGrid } from '@/components/ui/bento-grid';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Clock, TrendingUp, Users, AlertCircle, FileCheck, PlusCircle, Settings, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';

const config = new Configuration({ basePath: '' });
const dashboardApi = new DashboardApi(config, undefined, axiosInstance);

export default function OrganizerDashboard() {
  const navigate = useNavigate();

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['organizer-dashboard'],
    queryFn: async () => {
      const response = await dashboardApi.getOrganizerDashboard();
      return response.data;
    },
    refetchInterval: 60000,
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

  const stats = dashboardData?.stats || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Organizer Dashboard
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage your events and registrations
        </p>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Registrations
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.pendingRegistrations || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Awaiting your approval
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Events Pending Approval
            </CardTitle>
            <FileCheck className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.eventsPendingAdminApproval || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Awaiting admin review
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Bento Grid for Main Content */}
      <BentoGrid className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3 auto-rows-[20rem]">
        {/* Pending Registrations */}
        <BentoCard
          name="Recent Pending Registrations"
          className="col-span-1 md:col-span-2"
          background={
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-orange-500/10" />
          }
          Icon={AlertCircle}
          description={`${dashboardData?.recentPendingRegistrations?.length || 0} volunteers waiting for approval`}
          href="/my-events"
          cta="Review All"
        >
          <div className="absolute inset-0 p-6 overflow-y-auto">
            <div className="space-y-3 mt-12">
              {dashboardData?.recentPendingRegistrations?.map((registration) => (
                <motion.div
                  key={registration.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-background/80 backdrop-blur p-4 rounded-lg border border-amber-500/50 cursor-pointer hover:border-amber-500 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm">{registration.primaryText}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{registration.secondaryText}</p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(registration.timestamp), { addSuffix: true })}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
              {(!dashboardData?.recentPendingRegistrations || dashboardData.recentPendingRegistrations.length === 0) && (
                <div className="text-center py-12 text-muted-foreground text-sm">
                  <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  No pending registrations
                </div>
              )}
            </div>
          </div>
        </BentoCard>

        {/* Events Pending Admin Approval */}
        <BentoCard
          name="Events Awaiting Approval"
          className="col-span-1"
          background={
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10" />
          }
          Icon={FileCheck}
          description={`${dashboardData?.eventsPendingAdminApproval?.length || 0} events in review`}
          href="/my-events"
          cta="View Events"
        >
          <div className="absolute inset-0 p-6 overflow-y-auto">
            <div className="space-y-3 mt-12">
              {dashboardData?.eventsPendingAdminApproval?.map((event) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-background/80 backdrop-blur p-3 rounded-lg border border-blue-500/50 cursor-pointer hover:border-blue-500 transition-colors"
                  onClick={() => navigate(`/events/${event.id}`)}
                >
                  <h4 className="font-semibold text-sm line-clamp-2">{event.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{event.location}</p>
                </motion.div>
              ))}
              {(!dashboardData?.eventsPendingAdminApproval || dashboardData.eventsPendingAdminApproval.length === 0) && (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  <FileCheck className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  All events approved!
                </div>
              )}
            </div>
          </div>
        </BentoCard>

        {/* Top Events by Registration */}
        <BentoCard
          name="Top Performing Events"
          className="col-span-1 md:col-span-2 lg:col-span-3"
          background={
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10" />
          }
          Icon={Award}
          description="Your most popular events"
          href="/my-events"
          cta="View Details"
        >
          <div className="absolute inset-0 p-6 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12">
              {dashboardData?.topEventsByRegistration?.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-background/80 backdrop-blur p-4 rounded-lg border cursor-pointer hover:border-primary transition-colors relative overflow-hidden"
                  onClick={() => navigate(`/events/${event.id}`)}
                >
                  {/* Ranking Badge */}
                  <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">#{index + 1}</span>
                  </div>
                  
                  <h4 className="font-semibold line-clamp-2 pr-10">{event.title}</h4>
                  <div className="flex items-center gap-2 mt-3">
                    <Users className="h-4 w-4 text-green-600" />
                    <span className="text-2xl font-bold text-green-600">{event.count}</span>
                    <span className="text-sm text-muted-foreground">registrations</span>
                  </div>
                </motion.div>
              ))}
              {(!dashboardData?.topEventsByRegistration || dashboardData.topEventsByRegistration.length === 0) && (
                <div className="text-center py-12 text-muted-foreground text-sm col-span-3">
                  <Award className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  No events with registrations yet
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
            <CardDescription>Common organizer tasks</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button
              onClick={() => navigate('/my-events')}
              className="p-4 rounded-lg border hover:border-primary hover:bg-primary/5 transition-colors text-left group"
            >
              <PlusCircle className="h-6 w-6 mb-2 text-primary" />
              <div className="text-sm font-medium">Create Event</div>
            </button>
            <button
              onClick={() => navigate('/my-events')}
              className="p-4 rounded-lg border hover:border-primary hover:bg-primary/5 transition-colors text-left group"
            >
              <Settings className="h-6 w-6 mb-2 text-primary" />
              <div className="text-sm font-medium">Manage Events</div>
            </button>
            <button
              onClick={() => navigate('/my-events')}
              className="p-4 rounded-lg border hover:border-primary hover:bg-primary/5 transition-colors text-left group"
            >
              <Users className="h-6 w-6 mb-2 text-primary" />
              <div className="text-sm font-medium">Registrations</div>
            </button>
            <button
              onClick={() => navigate('/events')}
              className="p-4 rounded-lg border hover:border-primary hover:bg-primary/5 transition-colors text-left group"
            >
              <TrendingUp className="h-6 w-6 mb-2 text-primary" />
              <div className="text-sm font-medium">Analytics</div>
            </button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
