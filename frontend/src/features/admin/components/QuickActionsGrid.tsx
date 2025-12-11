import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileCheck, Users, BarChart, Settings } from 'lucide-react';

export const QuickActionsGrid = () => {
    const navigate = useNavigate();

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Button variant="outline" className="h-auto py-4 flex-col" onClick={() => navigate({ to: '/admin/pending-events' })}>
                        <FileCheck className="h-5 w-5 mb-2" />
                        <span className="text-sm">Approve Events</span>
                    </Button>
                    <Button variant="outline" className="h-auto py-4 flex-col" onClick={() => navigate({ to: '/admin/users' })}>
                        <Users className="h-5 w-5 mb-2" />
                        <span className="text-sm">Manage Users</span>
                    </Button>
                    <Button variant="outline" className="h-auto py-4 flex-col" onClick={() => navigate({ to: '/admin/reports' })}>
                        <BarChart className="h-5 w-5 mb-2" />
                        <span className="text-sm">View Reports</span>
                    </Button>
                    <Button variant="outline" className="h-auto py-4 flex-col" onClick={() => navigate({ to: '/admin/settings' })}>
                        <Settings className="h-5 w-5 mb-2" />
                        <span className="text-sm">Settings</span>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};
