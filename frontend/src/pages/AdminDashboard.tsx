import { useMemo, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  DashboardApi,
  AdminMetricsApi,
  Configuration
} from '@/api-client';
import axiosInstance from '@/utils/axiosInstance';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Calendar, Users, FileCheck, ShieldCheck, TrendingUp, Settings, BarChart, AlertCircle, Activity } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import AnimatedPage from '@/components/common/AnimatedPage';

// Stats Card Component
const StatsCard = memo(({ title, value, description, icon: Icon }: {
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
));

StatsCard.displayName = 'StatsCard';

// Format uptime helper
const formatUptime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
};

export default function AdminDashboard() {
  const navigate = useNavigate();

  const dashboardApi = useMemo(() => new DashboardApi(new Configuration(), '', axiosInstance), []);
  const metricsApi = useMemo(() => new AdminMetricsApi(new Configuration(), '', axiosInstance), []);

  // Navigation handlers
  const handleNavigateToPendingEvents = useCallback(() => navigate('/admin/pending-events'), [navigate]);
  const handleNavigateToUsers = useCallback(() => navigate('/admin/users'), [navigate]);
  const handleNavigateToReports = useCallback(() => navigate('/admin/reports'), [navigate]);
  const handleNavigateToSettings = useCallback(() => navigate('/admin/settings'), [navigate]);

  // Fetch dashboard data
  const { data: dashboardData, isLoading: isDashboardLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: async () => {
      const response = await dashboardApi.getAdminDashboard();
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch metrics data
  const { data: metricsData, isLoading: isMetricsLoading } = useQuery({
    queryKey: ['admin-metrics'],
    queryFn: async () => {
      const response = await metricsApi.getSystemMetrics();
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 30000, // Optional: background refresh every 30s, but staleTime prevents immediate refetch on mount
  });

  const stats = dashboardData?.stats || {};
  const userRoleCounts = dashboardData?.userRoleCounts || {};
  const eventsToApprove = dashboardData?.eventsToApprove || [];

  // Computed values
  const engagementRate = useMemo(() => {
    const totalEvents = stats.totalEvents || 0;
    const totalRegistrations = stats.totalRegistrations || 0;
    if (totalEvents === 0) return '0';
    return (totalRegistrations / totalEvents).toFixed(1);
  }, [stats]);

  const formattedUptime = useMemo(() => {
    return metricsData ? formatUptime(metricsData.systemHealth.uptimeSeconds) : '0h 0m';
  }, [metricsData]);

  if (isDashboardLoading) {
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

  return (
    <AnimatedPage>
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatsCard title="Total Users" value={stats.totalUsers || 0} description="Registered users" icon={Users} />
          <StatsCard title="Total Events" value={stats.totalEvents || 0} description="All time events" icon={Calendar} />
          <StatsCard title="Total Registrations" value={stats.totalRegistrations || 0} description="All time registrations" icon={FileCheck} />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">User Distribution</CardTitle>
              <CardDescription>Role breakdown</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(userRoleCounts).map(([role, count]) => (
                <div key={role} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground capitalize">{role.toLowerCase().replace('_', ' ')}</span>
                    <span className="font-medium">{String(count)}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-foreground transition-all"
                      style={{ width: `${(Number(count) / Number(stats.totalUsers || 1)) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Pending Approvals */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Pending Approvals</CardTitle>
              <CardDescription>{eventsToApprove.length} events need review</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[280px] overflow-y-auto">
                {eventsToApprove.map((event) => (
                  <div
                    key={event.id}
                    className="p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={handleNavigateToPendingEvents}
                  >
                    <p className="font-medium text-sm">{event.primaryText}</p>
                    <p className="text-xs text-muted-foreground mt-1">{event.secondaryText}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}
                    </p>
                  </div>
                ))}
                {eventsToApprove.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    <FileCheck className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No events pending approval</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Metrics */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">System Metrics</CardTitle>
                <CardDescription>Real-time performance data from Prometheus</CardDescription>
              </div>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            {isMetricsLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-20" />)}
              </div>
            ) : metricsData ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="p-4 border rounded-lg">
                  <p className="text-2xl font-bold">{metricsData.requestMetrics.totalRequests.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Requests (1h)</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-2xl font-bold">{metricsData.requestMetrics.requestsPerMinute.toFixed(1)}</p>
                  <p className="text-xs text-muted-foreground">Requests/min</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-2xl font-bold">{metricsData.requestMetrics.errorRate.toFixed(2)}%</p>
                  <p className="text-xs text-muted-foreground">Error Rate</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-2xl font-bold">{metricsData.systemHealth.memoryUsagePercent.toFixed(0)}%</p>
                  <p className="text-xs text-muted-foreground">Memory</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-2xl font-bold">{metricsData.apiPerformance.avgResponseTimeMs.toFixed(0)}ms</p>
                  <p className="text-xs text-muted-foreground">Avg Response</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-2xl font-bold">{formattedUptime}</p>
                  <p className="text-xs text-muted-foreground">Uptime</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground text-sm">
                <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Unable to load metrics</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Platform Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Platform Insights</CardTitle>
            <CardDescription>Key performance indicators</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <TrendingUp className="h-5 w-5 mb-2 text-muted-foreground" />
                <p className="text-2xl font-bold">{engagementRate}</p>
                <p className="text-xs text-muted-foreground">Avg registrations/event</p>
              </div>
              <div className="p-4 border rounded-lg">
                <Users className="h-5 w-5 mb-2 text-muted-foreground" />
                <p className="text-2xl font-bold">{userRoleCounts.EVENT_ORGANIZER || 0}</p>
                <p className="text-xs text-muted-foreground">Active Organizers</p>
              </div>
              <div className="p-4 border rounded-lg">
                <ShieldCheck className="h-5 w-5 mb-2 text-muted-foreground" />
                <p className="text-2xl font-bold">{userRoleCounts.VOLUNTEER || 0}</p>
                <p className="text-xs text-muted-foreground">Volunteers</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Infrastructure & Monitoring */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Infrastructure & Monitoring</CardTitle>
            <CardDescription>Direct access to observability tools</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button variant="outline" className="h-auto py-4 flex-col hover:bg-muted/50" onClick={() => window.open('http://localhost:3001', '_blank')}>
                <Activity className="h-5 w-5 mb-2 text-orange-500" />
                <span className="text-sm">Grafana</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col hover:bg-muted/50" onClick={() => window.open('http://localhost:3001/explore?left=%7B%22datasource%22:%22loki%22,%22queries%22:[%7B%22refId%22:%22A%22,%22expr%22:%22%7Bcontainer=%5C%22volunteerhub_backend%5C%22%7D%22%7D]%7D', '_blank')}>
                <FileCheck className="h-5 w-5 mb-2 text-blue-500" />
                <span className="text-sm">View Logs</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col hover:bg-muted/50" onClick={() => window.open('http://localhost:3001/explore?datasource=tempo', '_blank')}>
                <TrendingUp className="h-5 w-5 mb-2 text-green-500" />
                <span className="text-sm">Trace Search</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col hover:bg-muted/50" onClick={() => window.open('http://localhost:15672', '_blank')}>
                <Settings className="h-5 w-5 mb-2 text-red-500" />
                <span className="text-sm">RabbitMQ</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button variant="outline" className="h-auto py-4 flex-col" onClick={handleNavigateToPendingEvents}>
                <FileCheck className="h-5 w-5 mb-2" />
                <span className="text-sm">Approve Events</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col" onClick={handleNavigateToUsers}>
                <Users className="h-5 w-5 mb-2" />
                <span className="text-sm">Manage Users</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col" onClick={handleNavigateToReports}>
                <BarChart className="h-5 w-5 mb-2" />
                <span className="text-sm">View Reports</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col" onClick={handleNavigateToSettings}>
                <Settings className="h-5 w-5 mb-2" />
                <span className="text-sm">Settings</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AnimatedPage>
  );
}
