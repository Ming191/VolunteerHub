import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Award, Users } from 'lucide-react';

// Define locally based on dashboard usage
interface TopEvent {
    id: number;
    title: string;
    count: number;
}

interface TopEventsListProps {
    events: TopEvent[];
    onEventClick: (id: number) => void;
}

export const TopEventsList = ({ events, onEventClick }: TopEventsListProps) => {
    return (
        <Card className="lg:col-span-3">
            <CardHeader>
                <CardTitle className="text-base">Top Performing Events</CardTitle>
                <CardDescription>Most popular events by registration</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {events.map((event, index) => (
                        <div
                            key={event.id}
                            className="p-4 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors relative overflow-hidden"
                            onClick={() => onEventClick(event.id)}
                        >
                            <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="text-xs font-bold text-primary">#{index + 1}</span>
                            </div>
                            <p className="font-medium text-sm line-clamp-1 pr-8">{event.title}</p>
                            <div className="flex items-center gap-2 mt-2">
                                <Users className="h-4 w-4 text-green-600" />
                                <span className="text-xl font-bold text-green-600">{event.count}</span>
                                <span className="text-xs text-muted-foreground">registrations</span>
                            </div>
                        </div>
                    ))}
                    {events.length === 0 && (
                        <div className="col-span-3 text-center py-8 text-muted-foreground text-sm">
                            <Award className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p>No events with registrations yet</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};
