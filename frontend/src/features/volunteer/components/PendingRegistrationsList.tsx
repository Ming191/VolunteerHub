import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Clock, CheckCircle2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface PendingRegistration {
    eventId: number;
    eventTitle: string;
    registeredAt: string;
}

interface PendingRegistrationsListProps {
    registrations: PendingRegistration[];
    onEventClick: () => void;
}

export const PendingRegistrationsList = ({ registrations, onEventClick }: PendingRegistrationsListProps) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">Pending Approvals</CardTitle>
                <CardDescription>Awaiting response</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-3 max-h-[300px] overflow-y-auto">
                    {registrations.map((registration) => (
                        <div
                            key={`${registration.eventId}-${registration.registeredAt}`}
                            className="p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                            onClick={onEventClick}
                        >
                            <p className="font-medium text-sm line-clamp-1">{registration.eventTitle}</p>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                <Clock className="h-3 w-3" />
                                <span>Registered {formatDistanceToNow(new Date(registration.registeredAt), { addSuffix: true })}</span>
                            </div>
                        </div>
                    ))}
                    {registrations.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground text-sm">
                            <CheckCircle2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p>All caught up!</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};
