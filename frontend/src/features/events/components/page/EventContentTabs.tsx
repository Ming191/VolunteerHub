import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/animate-ui/components/animate/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EventImages } from "../sheet/EventImages";
import type { EventResponse } from "@/api-client";
import { BlogFeed } from "@/features/blog/components/BlogFeed";
import { useEventPermissions } from "@/features/events/hooks/useEventPermissions";
import {
  useEventRegistrations,
  useUpdateRegistrationStatus,
  useEventAttendees,
} from "@/features/events/hooks/useEventRegistrations";
import { Button } from "@/components/ui/button";
import { Check, X, MapPin, FileText } from "lucide-react";
import { EventMap } from "./EventMap";
import { useNavigate } from "@tanstack/react-router";

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
      return (
        <div className="text-sm text-muted-foreground">
          No registered attendees yet.
        </div>
      );
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
                <div
                  key={reg.id}
                  className="flex items-center justify-between p-3 border rounded-lg bg-card/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-xs">
                      {reg.volunteerName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{reg.volunteerName}</p>
                      <p className="text-xs text-muted-foreground">
                        Volunteer ID: {reg.volunteerId}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className={`text-xs px-2 py-1 rounded-full font-medium ${
                        reg.status === "APPROVED"
                          ? "bg-green-100 text-green-700"
                          : reg.status === "PENDING"
                          ? "bg-yellow-100 text-yellow-700"
                          : reg.status === "REJECTED"
                          ? "bg-red-100 text-red-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {reg.status}
                    </div>
                    {reg.status === "PENDING" && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 w-7 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                          onClick={() => handleStatusUpdate(reg.id, "APPROVED")}
                          disabled={updateStatusMutation.isPending}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleStatusUpdate(reg.id, "REJECTED")}
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
    <div className="space-y-4">
      {/* Description Card */}
      <Card className="border-2 border-gray-200 shadow-md hover:shadow-lg transition-shadow">
        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100">
              <FileText className="h-5 w-5 text-green-600" />
            </div>
            <CardTitle className="text-xl font-bold text-gray-900">
              About This Event
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="prose max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed">
            {event.description}
          </div>
        </CardContent>
      </Card>

      {/* Location Card */}
      <Card className="border-2 border-gray-200 shadow-md hover:shadow-lg transition-shadow">
        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100">
              <MapPin className="h-5 w-5 text-green-600" />
            </div>
            <CardTitle className="text-xl font-bold text-gray-900">
              Location
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
            <MapPin className="h-5 w-5 text-green-600 mt-0.5" />
            <p className="text-gray-700 font-medium">{event.location}</p>
          </div>
          {event.latitude != null && event.longitude != null ? (
            <EventMap latitude={event.latitude} longitude={event.longitude} />
          ) : (
            <div className="h-[200px] w-full bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg flex flex-col items-center justify-center border-2 border-dashed border-gray-300">
              <MapPin className="h-12 w-12 text-gray-400 mb-2" />
              <p className="text-sm text-gray-500 font-medium">
                No map coordinates available
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
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
          showGallery={true}
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
                {event.status !== 'PENDING' && (
                  <TabsTrigger value="community">Community</TabsTrigger>
                )}
                {(isOrganizer || isApprovedMember) && (
                    <TabsTrigger value="attendees">Attendees</TabsTrigger>
                )}
                {/* Show gallery tab if there are any gallery images or regular event images */}
                {((event.galleryImageUrls && event.galleryImageUrls.length > 0) ||
                    (event.imageUrls && event.imageUrls.length > 0)) && (
                        <TabsTrigger value="gallery">Gallery</TabsTrigger>
                    )}
            </TabsList>
        </Tabs>
    );
};
