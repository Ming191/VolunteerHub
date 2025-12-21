import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FileCheck } from 'lucide-react';
import type {DashboardEventItem} from '@/api-client';

interface EventsInReviewListProps {
    events: DashboardEventItem[];
    onEventClick: (id: number) => void;
}

export const EventsInReviewList = ({ events, onEventClick }: EventsInReviewListProps) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">Events In Review</CardTitle>
                <CardDescription>Awaiting admin approval</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-3 max-h-[300px] overflow-y-auto">
                    {events.map((event) => (
                        <div
                            key={event.id}
                            className="p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                            onClick={() => onEventClick(event.id)}
                        >
                            <p className="font-medium text-sm line-clamp-1">{event.title}</p>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{event.location}</p>
                        </div>
                    ))}
                    {events.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground text-sm">
                            <FileCheck className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p>All events approved</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};
