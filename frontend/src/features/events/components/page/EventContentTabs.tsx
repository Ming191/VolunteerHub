import { Tabs, TabsContent, TabsList, TabsTrigger, TabsContents } from '@/components/animate-ui/components/animate/tabs';
import { useNavigate } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { EventImages } from '../sheet/EventImages';
import type { EventResponse } from '@/api-client';
import { BlogFeed } from '@/features/blog/components/BlogFeed';
import { useEventPermissions } from '@/features/events/hooks/useEventPermissions';
import { useEventRegistrations, useUpdateRegistrationStatus } from '@/features/events/hooks/useEventRegistrations';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';
import { EventMap } from './EventMap';

interface EventContentTabsProps {
    event: EventResponse;
    defaultTab?: string;
}

const AttendeesList = ({ event }: { event: EventResponse }) => {
    const { isOrganizer } = useEventPermissions(event);
    const { data: registrations, isLoading } = useEventRegistrations(event.id, isOrganizer);
    const updateStatusMutation = useUpdateRegistrationStatus();

    if (!isOrganizer) return null;

    if (isLoading) {
        return <div className="text-sm text-muted-foreground">Loading attendees...</div>;
    }

    if (!registrations || registrations.length === 0) {
        return <div className="text-sm text-muted-foreground">No registered attendees yet.</div>;
    }

    const handleStatusUpdate = (registrationId: number, status: 'APPROVED' | 'REJECTED') => {
        updateStatusMutation.mutate({ registrationId, status });
    };

    return (
        <div className="space-y-4">
            <h4 className="font-medium text-sm">Registered Volunteers</h4>
            <div className="grid gap-3">
                {registrations.map((reg) => (
                    <div key={reg.id} className="flex items-center justify-between p-3 border rounded-lg bg-card/50">
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-xs">
                                {reg.volunteerName.charAt(0)}
                            </div>
                            <div>
                                <p className="text-sm font-medium">{reg.volunteerName}</p>
                                <p className="text-xs text-muted-foreground">Volunteer ID: {reg.volunteerId}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className={`text-xs px-2 py-1 rounded-full font-medium ${reg.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                                reg.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                    reg.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                                        'bg-gray-100 text-gray-700'
                                }`}>
                                {reg.status}
                            </div>
                            {reg.status === 'PENDING' && (
                                <>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-7 w-7 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                                        onClick={() => handleStatusUpdate(reg.id, 'APPROVED')}
                                        disabled={updateStatusMutation.isPending}
                                    >
                                        <Check className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                        onClick={() => handleStatusUpdate(reg.id, 'REJECTED')}
                                        disabled={updateStatusMutation.isPending}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export const EventContentTabs = ({ event, defaultTab = 'about' }: EventContentTabsProps) => {
    const { canPost } = useEventPermissions(event);
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState(defaultTab);

    // Sync local state with prop (for URL changes/back button)
    useEffect(() => {
        setActiveTab(defaultTab);
    }, [defaultTab]);

    const handleTabChange = (value: string) => {
        setActiveTab(value);
        if (value === 'attendees') {
            navigate({ to: `/events/${event.id}/registration` });
        } else if (value === 'about') {
            navigate({ to: `/events/${event.id}` });
        }
    };

    return (
        <Tabs defaultValue={defaultTab} value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="mb-6">
                <TabsTrigger value="about">About</TabsTrigger>
                <TabsTrigger value="community">Community</TabsTrigger>
                <TabsTrigger value="location">Location</TabsTrigger>
                <TabsTrigger value="attendees">Attendees</TabsTrigger>
                {/* Show gallery tab if there are any gallery images or regular event images */}
                {((event.galleryImageUrls && event.galleryImageUrls.length > 0) ||
                  (event.imageUrls && event.imageUrls.length > 0)) && (
                    <TabsTrigger value="gallery">Gallery</TabsTrigger>
                )}
            </TabsList>

            <TabsContents>
                <TabsContent value="about" className="space-y-6">
                    <Card>
                        <CardContent className="pt-6">
                            <h3 className="text-xl font-semibold mb-4">Description</h3>
                            <div className="prose max-w-none text-muted-foreground whitespace-pre-wrap">
                                {event.description}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="community">
                    <div className="space-y-6">
                        <BlogFeed eventId={event.id} canPost={canPost} />
                    </div>
                </TabsContent>

                <TabsContent value="location">
                    <Card>
                        <CardContent className="pt-6">
                            <h3 className="text-xl font-semibold mb-4">Event Location</h3>
                            <p className="text-muted-foreground mb-4">{event.location}</p>
                            {event.latitude != null && event.longitude != null ? (
                                <EventMap latitude={event.latitude} longitude={event.longitude} />
                            ) : (
                                <div className="h-[300px] w-full bg-muted rounded-lg flex items-center justify-center text-muted-foreground">
                                    No map coordinates available for this location.
                                </div>
                            )}                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="attendees">
                    <Card>
                        <CardContent className="pt-6">
                            <h3 className="text-xl font-semibold mb-4">Who's attending</h3>
                            <div className="text-muted-foreground mb-4">
                                {event.approvedCount} people are attending this event.
                            </div>

                            <AttendeesList event={event} />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="gallery">
                    <Card>
                        <CardContent className="pt-6">
                            <h3 className="text-xl font-semibold mb-4">Event Gallery</h3>
                            <EventImages
                                imageUrls={event.imageUrls}
                                galleryImageUrls={event.galleryImageUrls}
                                title={event.title}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>
            </TabsContents>
        </Tabs>
    );
};
