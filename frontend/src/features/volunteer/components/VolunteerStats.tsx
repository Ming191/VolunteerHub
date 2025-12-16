import { Calendar, Clock, TrendingUp } from 'lucide-react';
import { StatsCard } from '@/components/common/StatsCard';

interface VolunteerStatsProps {
    stats: {
        upcomingCount: number;
        pendingCount: number;
        newCount: number;
    };
}

export const VolunteerStats = ({ stats }: VolunteerStatsProps) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatsCard
                title="Upcoming Events"
                value={stats.upcomingCount}
                description="Events you're registered for"
                icon={Calendar}
            />
            <StatsCard
                title="Pending Approvals"
                value={stats.pendingCount}
                description="Awaiting organizer approval"
                icon={Clock}
            />
            <StatsCard
                title="New Opportunities"
                value={stats.newCount}
                description="Recently published events"
                icon={TrendingUp}
            />
        </div>
    );
};
