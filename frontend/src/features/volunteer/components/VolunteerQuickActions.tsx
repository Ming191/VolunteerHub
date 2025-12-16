import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Users, AlertCircle, CheckCircle2 } from 'lucide-react';

interface VolunteerQuickActionsProps {
    onBrowse: () => void;
    onRegistrations: () => void;
    onNotifications: () => void;
    onProfile: () => void;
}

export const VolunteerQuickActions = ({
    onBrowse,
    onRegistrations,
    onNotifications,
    onProfile
}: VolunteerQuickActionsProps) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Button variant="outline" className="h-auto py-4 flex-col" onClick={onBrowse}>
                        <Calendar className="h-5 w-5 mb-2" />
                        <span className="text-sm">Browse Events</span>
                    </Button>
                    <Button variant="outline" className="h-auto py-4 flex-col" onClick={onRegistrations}>
                        <Users className="h-5 w-5 mb-2" />
                        <span className="text-sm">My Registrations</span>
                    </Button>
                    <Button variant="outline" className="h-auto py-4 flex-col" onClick={onNotifications}>
                        <AlertCircle className="h-5 w-5 mb-2" />
                        <span className="text-sm">Notifications</span>
                    </Button>
                    <Button variant="outline" className="h-auto py-4 flex-col" onClick={onProfile}>
                        <CheckCircle2 className="h-5 w-5 mb-2" />
                        <span className="text-sm">My Profile</span>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};
