import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { DashboardApi, Configuration } from '@/api-client';
import axiosInstance from '@/utils/axiosInstance';
import { BentoCard, BentoGrid } from '@/components/ui/bento-grid';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, Users, FileCheck, ShieldCheck, TrendingUp, Settings, BarChart, AlertCircle, Activity, Cpu, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { useMemo, useCallback, memo } from 'react';

const config = new Configuration({ basePath: '' });
const dashboardApi = new DashboardApi(config, undefined, axiosInstance);

interface SystemMetrics {
  requestMetrics: {
    totalRequests: number;
    requestsPerMinute: number;
    errorRate: number;
    clientErrors: number;
    serverErrors: number;
  };
  systemHealth: {
    memoryUsedMB: number;
    memoryMaxMB: number;
    memoryUsagePercent: number;
    activeThreads: number;
    uptimeSeconds: number;
  };
  apiPerformance: {
    avgResponseTimeMs: number;
    p95ResponseTimeMs: number;
    p99ResponseTimeMs: number;
    slowestEndpoint: string | null;
    slowestEndpointTimeMs: number;
  };
}

// Memoized Stats Card Component
const StatsCard = memo(({ title, value, description, icon: Icon }: {
  title: string;
  value: number;
  description: string;
  icon: any;
}) => (
  <Card className="hover:shadow-lg transition-shadow">
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">
        {title}
      </CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-3xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground mt-1">
        {description}
      </p>
    </CardContent>
  </Card>
));

StatsCard.displayName = 'StatsCard';

// Memoized Metric Card Component
const MetricCard = memo(({ value, description, color = 'text-primary' }: {
  value: string | number;
  description?: string;
  color?: string;
}) => (
  <div className="bg-background/80 backdrop-blur p-4 rounded-lg border">
    <div className={`text-2xl font-bold ${color}`}>
      {value}
    </div>
    {description && (
      <p className="text-xs text-muted-foreground mt-1">{description}</p>
    )}
  </div>
));

MetricCard.displayName = 'MetricCard';

export default function AdminDashboard() {
  const navigate = useNavigate();

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: async () => {
      const response = await dashboardApi.getAdminDashboard();
      return response.data;
    },
    refetchInterval: 60000,
  });

  const { data: metricsData, isLoading: metricsLoading } = useQuery<SystemMetrics>({
    queryKey: ['admin-metrics'],
    queryFn: async () => {
      const response = await axiosInstance.get('/api/admin/metrics/system');
      return response.data;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Memoize stats object
  const stats = useMemo(() => dashboardData?.stats || {}, [dashboardData?.stats]);
  const userRoleCounts = useMemo(() => dashboardData?.userRoleCounts || {}, [dashboardData?.userRoleCounts]);

  // Memoize expensive calculations
  const engagementRate = useMemo(() => {
    if (stats.totalEvents > 0) {
      return (Number(stats.totalRegistrations) / Number(stats.totalEvents)).toFixed(1);
    }
    return '0';
  }, [stats.totalEvents, stats.totalRegistrations]);

  const formattedUptime = useMemo(() => {
    if (!metricsData) return '0h 0m';
    const hours = Math.floor(metricsData.systemHealth.uptimeSeconds / 3600);
    const minutes = Math.floor((metricsData.systemHealth.uptimeSeconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  }, [metricsData]);

  // Memoize navigation callbacks
  const handleNavigateToPendingEvents = useCallback(() => {
    navigate('/admin/pending-events');
  }, [navigate]);

  const handleNavigateToUsers = useCallback(() => {
    navigate('/admin/users');
  }, [navigate]);

  const handleNavigateToReports = useCallback(() => {
    navigate('/admin/reports');
  }, [navigate]);

  const handleNavigateToSettings = useCallback(() => {
    navigate('/admin/settings');
  }, [navigate]);

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
          Admin Dashboard
        </h1>
        <p className="text-muted-foreground mt-2">
          Platform overview and management
        </p>
      </motion.div>

      {/* Platform Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <StatsCard 
          title="Total Users"
          value={stats.totalUsers || 0}
          description="Registered users"
          icon={Users}
        />
        <StatsCard 
          title="Total Events"
          value={stats.totalEvents || 0}
          description="All time events"
          icon={Calendar}
        />
        <StatsCard 
          title="Total Registrations"
          value={stats.totalRegistrations || 0}
          description="All time registrations"
          icon={FileCheck}
        />
      </motion.div>

      {/* Bento Grid for Main Content */}
      <BentoGrid className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3 auto-rows-[20rem]">
        {/* User Role Distribution */}
        <BentoCard
          name="User Distribution"
          className="col-span-1 md:col-span-1"
          background={
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10" />
          }
          Icon={Users}
          description="User roles breakdown"
          href="/admin/users"
          cta="Manage Users"
        >
          <div className="absolute inset-0 p-6 overflow-y-auto">
            <div className="space-y-4 mt-12">
              {Object.entries(userRoleCounts).map(([role, count]) => (
                <motion.div
                  key={role}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-background/80 backdrop-blur p-4 rounded-lg border"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-sm capitalize">
                        {role.toLowerCase().replace('_', ' ')}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {((Number(count) / Number(stats.totalUsers)) * 100).toFixed(1)}% of users
                      </p>
                    </div>
                    <div className="text-2xl font-bold text-primary">{String(count)}</div>
                  </div>
                  {/* Progress bar */}
                  <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(Number(count) / Number(stats.totalUsers)) * 100}%` }}
                      transition={{ duration: 1, delay: 0.3 }}
                      className="h-full bg-primary"
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </BentoCard>

        {/* Events to Approve */}
        <BentoCard
          name="Events Awaiting Approval"
          className="col-span-1 md:col-span-2"
          background={
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-orange-500/10" />
          }
          Icon={AlertCircle}
          description={`${dashboardData?.eventsToApprove?.length || 0} events need review`}
          href="/admin/pending-events"
          cta="Review Events"
        >
          <div className="absolute inset-0 p-6 overflow-y-auto">
            <div className="space-y-3 mt-12">
              {dashboardData?.eventsToApprove?.map((event) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-background/80 backdrop-blur p-4 rounded-lg border border-amber-500/50 cursor-pointer hover:border-amber-500 transition-colors"
                  onClick={handleNavigateToPendingEvents}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm">{event.primaryText}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{event.secondaryText}</p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        Submitted {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
              {(!dashboardData?.eventsToApprove || dashboardData.eventsToApprove.length === 0) && (
                <div className="text-center py-12 text-muted-foreground text-sm">
                  <FileCheck className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  No events pending approval
                </div>
              )}
            </div>
          </div>
        </BentoCard>

        {/* System Metrics */}
        <BentoCard
          name="System Metrics"
          className="col-span-1 md:col-span-3"
          background={
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-blue-500/10" />
          }
          Icon={Activity}
          description="Real-time system health and performance"
          href="http://localhost:3001"
          cta="View Grafana"
        >
          <div className="absolute inset-0 p-6 overflow-y-auto">
            {metricsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-32" />
                ))}
              </div>
            ) : metricsData ? (
              <div className="space-y-6 mt-12">
                {/* Request Metrics */}
                <div>
                  <h4 className="font-semibold mb-4 flex items-center gap-2">
                    <Zap className="h-5 w-5 text-yellow-600" />
                    API Requests
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-background/80 backdrop-blur p-4 rounded-lg border">
                      <div className="text-2xl font-bold text-yellow-600">
                        {metricsData.requestMetrics.totalRequests.toLocaleString()}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Total Requests (1h)</p>
                    </div>
                    <div className="bg-background/80 backdrop-blur p-4 rounded-lg border">
                      <div className="text-2xl font-bold text-blue-600">
                        {metricsData.requestMetrics.requestsPerMinute.toFixed(1)}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Requests/min</p>
                    </div>
                    <div className="bg-background/80 backdrop-blur p-4 rounded-lg border">
                      <div className={`text-2xl font-bold ${metricsData.requestMetrics.errorRate > 5 ? 'text-red-600' : 'text-green-600'}`}>
                        {metricsData.requestMetrics.errorRate.toFixed(2)}%
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Error Rate</p>
                    </div>
                  </div>
                </div>

                {/* System Health */}
                <div>
                  <h4 className="font-semibold mb-4 flex items-center gap-2">
                    <Cpu className="h-5 w-5 text-purple-600" />
                    System Health
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-background/80 backdrop-blur p-4 rounded-lg border">
                      <div className="text-sm text-muted-foreground mb-1">Memory Usage</div>
                      <div className="text-2xl font-bold text-purple-600">
                        {metricsData.systemHealth.memoryUsagePercent.toFixed(1)}%
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {metricsData.systemHealth.memoryUsedMB.toFixed(0)} / {metricsData.systemHealth.memoryMaxMB.toFixed(0)} MB
                      </p>
                      <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${metricsData.systemHealth.memoryUsagePercent > 80 ? 'bg-red-600' : 'bg-purple-600'}`}
                          style={{ width: `${metricsData.systemHealth.memoryUsagePercent}%` }}
                        />
                      </div>
                    </div>
                    <div className="bg-background/80 backdrop-blur p-4 rounded-lg border">
                      <div className="text-2xl font-bold text-cyan-600">
                        {metricsData.systemHealth.activeThreads}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Active Threads</p>
                    </div>
                    <div className="bg-background/80 backdrop-blur p-4 rounded-lg border">
                      <div className="text-2xl font-bold text-green-600">
                        {formattedUptime}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Uptime</p>
                    </div>
                  </div>
                </div>

                {/* API Performance */}
                <div>
                  <h4 className="font-semibold mb-4 flex items-center gap-2">
                    <Activity className="h-5 w-5 text-green-600" />
                    API Performance
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-background/80 backdrop-blur p-4 rounded-lg border">
                      <div className="text-2xl font-bold text-green-600">
                        {metricsData.apiPerformance.avgResponseTimeMs.toFixed(0)}ms
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Avg Response Time</p>
                    </div>
                    <div className="bg-background/80 backdrop-blur p-4 rounded-lg border">
                      <div className="text-2xl font-bold text-orange-600">
                        {metricsData.apiPerformance.p95ResponseTimeMs.toFixed(0)}ms
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">P95 Response Time</p>
                    </div>
                    <div className="bg-background/80 backdrop-blur p-4 rounded-lg border">
                      <div className="text-2xl font-bold text-red-600">
                        {metricsData.apiPerformance.p99ResponseTimeMs.toFixed(0)}ms
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">P99 Response Time</p>
                    </div>
                  </div>
                  {metricsData.apiPerformance.slowestEndpoint && (
                    <div className="mt-4 bg-background/80 backdrop-blur p-4 rounded-lg border">
                      <div className="text-sm text-muted-foreground mb-1">Slowest Endpoint</div>
                      <div className="font-mono text-sm">{metricsData.apiPerformance.slowestEndpoint}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {metricsData.apiPerformance.slowestEndpointTimeMs.toFixed(0)}ms average
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground text-sm mt-12">
                <AlertCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                Unable to load system metrics
              </div>
            )}
          </div>
        </BentoCard>

        {/* Platform Insights */}
        <BentoCard
          name="Platform Insights"
          className="col-span-1 md:col-span-3"
          background={
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10" />
          }
          Icon={BarChart}
          description="Key platform metrics"
          href="/admin"
          cta="View Reports"
        >
          <div className="absolute inset-0 p-6 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-background/80 backdrop-blur p-6 rounded-lg border"
              >
                <TrendingUp className="h-8 w-8 text-green-600 mb-3" />
                <h4 className="font-semibold mb-2">Engagement Rate</h4>
                <div className="text-3xl font-bold text-green-600">
                  {engagementRate}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Average registrations per event
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-background/80 backdrop-blur p-6 rounded-lg border"
              >
                <Users className="h-8 w-8 text-blue-600 mb-3" />
                <h4 className="font-semibold mb-2">Active Organizers</h4>
                <div className="text-3xl font-bold text-blue-600">
                  {userRoleCounts.EVENT_ORGANIZER || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Users creating events
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-background/80 backdrop-blur p-6 rounded-lg border"
              >
                <ShieldCheck className="h-8 w-8 text-purple-600 mb-3" />
                <h4 className="font-semibold mb-2">Volunteers</h4>
                <div className="text-3xl font-bold text-purple-600">
                  {userRoleCounts.VOLUNTEER || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Active volunteers
                </p>
              </motion.div>
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
            <CardDescription>Admin management tools</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button
              onClick={handleNavigateToPendingEvents}
              className="p-4 rounded-lg border hover:border-primary hover:bg-primary/5 transition-colors text-left group"
            >
              <FileCheck className="h-6 w-6 mb-2 text-primary" />
              <div className="text-sm font-medium">Approve Events</div>
            </button>
            <button
              onClick={handleNavigateToUsers}
              className="p-4 rounded-lg border hover:border-primary hover:bg-primary/5 transition-colors text-left group"
            >
              <Users className="h-6 w-6 mb-2 text-primary" />
              <div className="text-sm font-medium">Manage Users</div>
            </button>
            <button
              onClick={handleNavigateToReports}
              className="p-4 rounded-lg border hover:border-primary hover:bg-primary/5 transition-colors text-left group"
            >
              <BarChart className="h-6 w-6 mb-2 text-primary" />
              <div className="text-sm font-medium">View Reports</div>
            </button>
            <button
              onClick={handleNavigateToSettings}
              className="p-4 rounded-lg border hover:border-primary hover:bg-primary/5 transition-colors text-left group"
            >
              <Settings className="h-6 w-6 mb-2 text-primary" />
              <div className="text-sm font-medium">Settings</div>
            </button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
