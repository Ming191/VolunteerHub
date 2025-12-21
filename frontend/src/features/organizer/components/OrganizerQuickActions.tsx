import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {PlusCircle, Settings, TrendingUp, AlertCircle} from 'lucide-react';

interface OrganizerQuickActionsProps {
    onCreateEvent: () => void;
    onManageEvents: () => void;
    onNotifications: () => void;
    onAnalytics: () => void;
}

export const OrganizerQuickActions = ({
    onCreateEvent,
    onManageEvents,
    onNotifications,
    onAnalytics
}: OrganizerQuickActionsProps) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Button variant="outline" className="h-auto py-4 flex-col" onClick={onCreateEvent}>
                        <PlusCircle className="h-5 w-5 mb-2" />
                        <span className="text-sm">Create Event</span>
                    </Button>
                    <Button variant="outline" className="h-auto py-4 flex-col" onClick={onManageEvents}>
                        <Settings className="h-5 w-5 mb-2" />
                        <span className="text-sm">Manage Events</span>
                    </Button>
                    <Button variant="outline" className="h-auto py-4 flex-col" onClick={onNotifications}>
                        <AlertCircle className="h-5 w-5 mb-2" />
                        <span className="text-sm">Notifications</span>
                    </Button>
                    <Button variant="outline" className="h-auto py-4 flex-col" onClick={onAnalytics}>
                        <TrendingUp className="h-5 w-5 mb-2" />
                        <span className="text-sm">Analytics</span>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};
