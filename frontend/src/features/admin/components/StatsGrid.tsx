import { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Calendar, FileCheck } from 'lucide-react';
import type { AdminDashboardResponse } from '@/api-client';

interface StatsCardProps {
    title: string;
    value: number;
    description: string;
    icon: React.ElementType;
}

const StatsCard = memo(({ title, value, description, icon: Icon }: StatsCardProps) => (
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

export const StatsGrid = ({ stats }: { stats: AdminDashboardResponse['stats'] }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
        </div>
    );
};
