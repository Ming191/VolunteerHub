import { Tabs, TabsContent, TabsList, TabsTrigger, TabsContents } from '@/components/animate-ui/components/animate/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { EventImages } from '../sheet/EventImages';
import type { EventResponse } from '@/api-client';
import { BlogFeed } from '@/features/blog/components/BlogFeed';
import { useEventPermissions } from '@/features/events/hooks/useEventPermissions';
import { EventMap } from './EventMap';

interface EventContentTabsProps {
    event: EventResponse;
}

export const EventContentTabs = ({ event }: EventContentTabsProps) => {
    const { canPost } = useEventPermissions(event);

    return (
        <Tabs defaultValue="about" className="w-full">
            <TabsList className="mb-6">
                <TabsTrigger value="about">About</TabsTrigger>
                <TabsTrigger value="community">Community</TabsTrigger>
                <TabsTrigger value="location">Location</TabsTrigger>
                <TabsTrigger value="attendees">Attendees</TabsTrigger>
                {/* Only show gallery tab if there are images */}
                {event.imageUrls && event.imageUrls.length > 0 && (
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
                            <div className="text-muted-foreground">
                                {event.approvedCount} people are attending this event.
                            </div>
                            {/* We can fetch and list attendees here later */}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="gallery">
                    <Card>
                        <CardContent className="pt-6">
                            <h3 className="text-xl font-semibold mb-4">Event Gallery</h3>
                            <EventImages imageUrls={event.imageUrls} title={event.title} />
                        </CardContent>
                    </Card>
                </TabsContent>
            </TabsContents>
        </Tabs>
    );
};
