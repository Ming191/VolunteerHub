import { AlertCircle, FileCheck, Calendar } from 'lucide-react';
import { StatsCard } from '@/components/common/StatsCard';

export interface OrganizerStatsData {
    pendingRegistrations: number;
    eventsPendingAdminApproval: number;
    totalEvents: number;
}
interface OrganizerStatsProps {
    stats: {
        pendingRegistrations: number;
        eventsPendingAdminApproval: number;
        totalEvents: number;
    };
}

export const OrganizerStats = ({ stats }: OrganizerStatsProps) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatsCard
                title="Pending Registrations"
                value={stats.pendingRegistrations}
                description="Awaiting your approval"
                icon={AlertCircle}
            />
            <StatsCard
                title="Events Pending"
                value={stats.eventsPendingAdminApproval}
                description="Awaiting admin review"
                icon={FileCheck}
            />
            <StatsCard
                title="Total Events"
                value={stats.totalEvents}
                description="Active events"
                icon={Calendar}
            />
        </div>
    );
};
