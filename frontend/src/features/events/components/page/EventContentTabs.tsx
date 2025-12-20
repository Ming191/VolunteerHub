import { Tabs, TabsList, TabsTrigger } from '@/components/animate-ui/components/animate/tabs';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent } from '@/components/ui/card';
import { EventImages } from '../sheet/EventImages';
import type { EventResponse } from '@/api-client';
import { BlogFeed } from '@/features/blog/components/BlogFeed';
import { useEventPermissions } from '@/features/events/hooks/useEventPermissions';
import { useEventRegistrations, useUpdateRegistrationStatus, useEventAttendees } from '@/features/events/hooks/useEventRegistrations';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';
import { EventMap } from './EventMap';


export const EventAttendees = ({ event }: { event: EventResponse }) => {
    const { isOrganizer, isApprovedMember } = useEventPermissions(event);

    // Organizer Data
    const { data: organizerRegistrations, isLoading: isLoadingOrganizer } = useEventRegistrations(event.id, isOrganizer);

    // Volunteer Data
    const { data: publicAttendees, isLoading: isLoadingPublic } = useEventAttendees(event.id, isApprovedMember && !isOrganizer);

    const updateStatusMutation = useUpdateRegistrationStatus();

    if (!isOrganizer && !isApprovedMember) return null;

    const isLoading = isOrganizer ? isLoadingOrganizer : isLoadingPublic;

    if (isLoading) {
        return <div className="text-sm text-muted-foreground">Loading attendees...</div>;
    }

    // Render for Organizer
    if (isOrganizer) {
        const registrations = organizerRegistrations;
        if (!registrations || registrations.length === 0) {
            return <div className="text-sm text-muted-foreground">No registered attendees yet.</div>;
        }

        const handleStatusUpdate = (registrationId: number, status: 'APPROVED' | 'REJECTED') => {
            updateStatusMutation.mutate({ registrationId, status });
        };

        return (
            <Card>
                <CardContent className="pt-6">
                    <h3 className="text-xl font-semibold mb-4">Who's attending</h3>
                    <div className="text-muted-foreground mb-4">
                        {event.approvedCount} people are attending this event.
                    </div>
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
                </CardContent>
            </Card>
        );
    }

    // Render for Volunteer (Approved Member)
    if (isApprovedMember) {
        if (!publicAttendees || publicAttendees.length === 0) {
            return <div className="text-sm text-muted-foreground">No other attendees yet.</div>;
        }

        return (
            <Card>
                <CardContent className="pt-6">
                    <h3 className="text-xl font-semibold mb-4">Who's attending</h3>
                    <div className="text-muted-foreground mb-4">
                        {event.approvedCount} people are attending this event.
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                        {publicAttendees.map((attendee) => (
                            <div key={attendee.volunteerId} className="flex items-center gap-3 p-3 border rounded-lg bg-card/50">
                                {attendee.profilePictureUrl ? (
                                    <img
                                        src={attendee.profilePictureUrl}
                                        alt={attendee.name}
                                        className="h-10 w-10 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                                        {attendee.name.charAt(0)}
                                    </div>
                                )}
                                <div>
                                    <p className="font-medium text-sm">{attendee.name}</p>
                                    <p className="text-xs text-muted-foreground">{attendee.bio ? attendee.bio.substring(0, 30) + (attendee.bio.length > 30 ? '...' : '') : `Joined ${new Date(attendee.joinedAt).toLocaleDateString()}`}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    return null;
};

export const EventAbout = ({ event }: { event: EventResponse }) => {
    return (
        <Card>
            <CardContent className="pt-6 space-y-8">
                <div>
                    <h3 className="text-xl font-semibold mb-4">Description</h3>
                    <div className="prose max-w-none text-muted-foreground whitespace-pre-wrap">
                        {event.description}
                    </div>
                </div>

                <div className="border-t pt-8">
                    <h3 className="text-xl font-semibold mb-4">Event Location</h3>
                    <p className="text-muted-foreground mb-4">{event.location}</p>
                    {event.latitude != null && event.longitude != null ? (
                        <EventMap latitude={event.latitude} longitude={event.longitude} />
                    ) : (
                        <div className="h-[300px] w-full bg-muted rounded-lg flex items-center justify-center text-muted-foreground">
                            No map coordinates available for this location.
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export const EventGallery = ({ event }: { event: EventResponse }) => {
    return (
        <Card>
            <CardContent className="pt-6">
                <h3 className="text-xl font-semibold mb-4">Event Gallery</h3>
                <EventImages
                    eventId={event.id}
                    imageUrls={event.imageUrls}
                    title={event.title}
                />
            </CardContent>
        </Card>
    );
};

export const EventCommunity = ({ event }: { event: EventResponse }) => {
    const { canPost } = useEventPermissions(event);
    return (
        <div className="space-y-6">
            <BlogFeed eventId={event.id} canPost={canPost} />
        </div>
    );
};

export const EventTabsNavigation = ({ event, activeTab }: { event: EventResponse; activeTab: string }) => {
    const navigate = useNavigate();
    const { isOrganizer, isApprovedMember } = useEventPermissions(event);

    const handleTabChange = (value: string) => {
        if (value === 'about') {
            navigate({ to: `/events/${event.id}` });
        } else if (value === 'community') {
            navigate({ to: `/events/${event.id}/posts` });
        } else if (value === 'attendees') {
            navigate({ to: `/events/${event.id}/attendees` });
        } else if (value === 'gallery') {
            navigate({ to: `/events/${event.id}/gallery` });
        }
    };

    return (
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="mb-6">
                <TabsTrigger value="about">About</TabsTrigger>
                <TabsTrigger value="community">Community</TabsTrigger>
                {(isOrganizer || isApprovedMember) && (
                    <TabsTrigger value="attendees">Attendees</TabsTrigger>
                )}
                <TabsTrigger value="gallery">Gallery</TabsTrigger>
            </TabsList>
        </Tabs>
    );
};
