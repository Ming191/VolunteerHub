import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FileCheck } from 'lucide-react';
import { formatDistanceToNowUTC } from '@/lib/dateUtils';
import type { DashboardActionItem } from '@/api-client';

interface PendingApprovalsCardProps {
    events: DashboardActionItem[];
}

export const PendingApprovalsCard = ({ events }: PendingApprovalsCardProps) => {
    const navigate = useNavigate();
    const handleNavigate = () => navigate({ to: '/admin/pending-events' });

    return (
        <Card className="lg:col-span-2">
            <CardHeader>
                <CardTitle className="text-base">Pending Approvals</CardTitle>
                <CardDescription>{events.length} events need review</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-3 max-h-[280px] overflow-y-auto">
                    {events.map((event) => (
                        <button
                            key={event.id}
                            type="button"
                            className="w-full text-left p-3 rounded-lg border hover:bg-muted/50 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                            onClick={handleNavigate}
                            aria-label={`View details for ${event.primaryText}`}
                        >
                            <p className="font-medium text-sm">{event.primaryText}</p>
                            <p className="text-xs text-muted-foreground mt-1">{event.secondaryText}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                {formatDistanceToNowUTC(event.timestamp, { addSuffix: true })}
                            </p>
                        </button>
                    ))}
                    {events.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground text-sm">
                            <FileCheck className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p>No events pending approval</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};
