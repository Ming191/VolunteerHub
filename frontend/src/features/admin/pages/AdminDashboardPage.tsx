import AnimatedPage from '@/components/common/AnimatedPage';
import { Skeleton } from '@/components/ui/skeleton';
import { useAdminDashboardData } from '../hooks/useAdminDashboardData';
import { useSystemMetrics } from '../hooks/useSystemMetrics';
import { StatsGrid } from '../components/StatsGrid';
import { UserDistributionChart } from '../components/UserDistributionChart';
import { PendingApprovalsCard } from '../components/PendingApprovalsCard';
import { SystemMetricsGrid } from '../components/SystemMetricsGrid';
import { PlatformInsightsCard } from '../components/PlatformInsightsCard';
import { InfrastructureLinks } from '../components/InfrastructureLinks';
import { QuickActionsGrid } from '../components/QuickActionsGrid';

export const AdminDashboardPage = () => {
    const { data: dashboardData, isLoading: isDashboardLoading, isError: isDashboardError } = useAdminDashboardData();
    const { data: metricsData, isLoading: isMetricsLoading } = useSystemMetrics();

    const stats = dashboardData?.stats || {};
    const userRoleCounts = dashboardData?.userRoleCounts || {};
    const eventsToApprove = dashboardData?.eventsToApprove || [];

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

    if (isDashboardError) {
        return (
            <AnimatedPage>
                <div className="max-w-6xl mx-auto p-6 flex flex-col items-center justify-center min-h-[50vh] text-center space-y-4">
                    <div className="bg-destructive/10 p-4 rounded-full">
                        {/* Need to import AlertCircle or similar. AlertCircle not imported yet? */}
                        {/* I'll use text for now or import it. Skeleton is imported. */}
                        <span className="text-4xl">⚠️</span>
                    </div>
                    <h2 className="text-xl font-semibold">Failed to load dashboard data</h2>
                    <p className="text-muted-foreground">Please check your connection and try again.</p>
                </div>
            </AnimatedPage>
        );
    }

    return (
        <AnimatedPage>
            <div className="max-w-6xl mx-auto p-6 space-y-6">
                {/* Stats Row */}
                <StatsGrid stats={stats} />

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <UserDistributionChart roleCounts={userRoleCounts} totalUsers={stats.totalUsers || 0} />
                    <PendingApprovalsCard events={eventsToApprove} />
                </div>

                {/* System Metrics */}
                <SystemMetricsGrid metrics={metricsData} isLoading={isMetricsLoading} />

                {/* Platform Insights */}
                <PlatformInsightsCard stats={stats} userRoleCounts={userRoleCounts} />

                {/* Infrastructure & Monitoring */}
                <InfrastructureLinks />

                {/* Quick Actions */}
                <QuickActionsGrid />
            </div>
        </AnimatedPage>
    );
}
