import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Clock, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import type { DashboardEventItem } from '@/api-client';

interface NewOpportunitiesListProps {
    events: DashboardEventItem[];
    onEventClick: (id: number) => void;
}
export const NewOpportunitiesList = ({ events, onEventClick }: NewOpportunitiesListProps) => {
    return (
        <Card className="lg:col-span-3">
            <CardHeader>
                <CardTitle className="text-base">New Opportunities</CardTitle>
                <CardDescription>Fresh events just for you</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {events.slice(0, 6).map((event) => (
                        <button
                            key={event.id}
                            className="w-full text-left p-4 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                            onClick={() => onEventClick(event.id)}
                        >
                            <p className="font-medium text-sm line-clamp-1">{event.title}</p>
                            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                {format(new Date(event.eventDateTime), 'MMM dd, yyyy')}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{event.location}</p>
                        </button>
                    ))}
                    {events.length === 0 && (
                        <div className="col-span-3 text-center py-8 text-muted-foreground text-sm">
                            <TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p>No new events found</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card >
    );
};
