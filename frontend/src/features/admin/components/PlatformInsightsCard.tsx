import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { TrendingUp, Users, ShieldCheck } from 'lucide-react';
import type { AdminDashboardResponse } from '@/api-client';

interface PlatformInsightsCardProps {
    stats: AdminDashboardResponse['stats'];
    userRoleCounts: AdminDashboardResponse['userRoleCounts'];
}

export const PlatformInsightsCard = ({ stats, userRoleCounts }: PlatformInsightsCardProps) => {
    const engagementRate = useMemo(() => {
        const totalEvents = stats.totalEvents || 0;
        const totalRegistrations = stats.totalRegistrations || 0;
        if (totalEvents === 0) return '0';
        return (totalRegistrations / totalEvents).toFixed(1);
    }, [stats]);

    return (
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
    );
};
