import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Activity, AlertCircle } from 'lucide-react';
import type { SystemMetricsResponse } from '@/api-client';
import { formatUptime } from '../utils/formatters';

interface SystemMetricsGridProps {
    metrics: SystemMetricsResponse | undefined;
    isLoading: boolean;
}

export const SystemMetricsGrid = ({ metrics, isLoading }: SystemMetricsGridProps) => {
    return (
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
                {isLoading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-20" />)}
                    </div>
                ) : metrics ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        <div className="p-4 border rounded-lg">
                            <p className="text-2xl font-bold">{metrics.requestMetrics?.totalRequests?.toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground">Requests (1h)</p>
                        </div>
                        <div className="p-4 border rounded-lg">
                            <p className="text-2xl font-bold">{metrics.requestMetrics?.requestsPerMinute?.toFixed(1)}</p>
                            <p className="text-xs text-muted-foreground">Requests/min</p>
                        </div>
                        <div className="p-4 border rounded-lg">
                            <p className="text-2xl font-bold">{metrics.requestMetrics?.errorRate?.toFixed(2)}%</p>
                            <p className="text-xs text-muted-foreground">Error Rate</p>
                        </div>
                        <div className="p-4 border rounded-lg">
                            <p className="text-2xl font-bold">{metrics.systemHealth?.memoryUsagePercent?.toFixed(0)}%</p>
                            <p className="text-xs text-muted-foreground">Memory</p>
                        </div>
                        <div className="p-4 border rounded-lg">
                            <p className="text-2xl font-bold">{metrics.apiPerformance?.avgResponseTimeMs?.toFixed(0)}ms</p>
                            <p className="text-xs text-muted-foreground">Avg Response</p>
                        </div>
                        <div className="p-4 border rounded-lg">
                            <p className="text-2xl font-bold">{formatUptime(metrics.systemHealth?.uptimeSeconds || 0)}</p>
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
    );
};
