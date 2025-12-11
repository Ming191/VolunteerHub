import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter
} from '@/components/animate-ui/components/radix/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  UserCheck,
  UserX,
  Image as ImageIcon,
  AlertCircle, ArrowLeft
} from 'lucide-react';
import type { EventResponse } from '@/api-client';
import { format } from 'date-fns';
import { useAuth } from '@/features/auth/hooks/useAuth.ts';
//import { useRegisterForEvent, useGetRegistrationStatus } from "@/hooks/useRegistration.ts";
import { useState } from "react";
import EditEventModal from "./EditEventModal.tsx";
import { useDeleteEvent } from "../hooks/useMyEvents.ts";
import {useGetRegistrationStatus, useRegisterForEvent} from "@/features/volunteer/hooks/useRegistration.ts";
import {EventRegistrationsModal} from "@/features/events/components/EventRegistrationsModal.tsx";

interface EventDetailSheetProps {
  event: EventResponse | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

// Thêm type cho view state
type SheetView = 'event-details' | 'registrations';

export default function EventDetailSheet({ event, isOpen, onOpenChange }: EventDetailSheetProps) {
  const { user } = useAuth();
  const [isEditEventModalOpen, setEditEventModalOpen] = useState(false);
  const registerMutation = useRegisterForEvent();
  const deleteEventMutation = useDeleteEvent();
  const [currentView, setCurrentView] = useState<SheetView>('event-details');

  const tags = Array.from(event?.tags || []);
  const isAdmin = user?.role === 'ADMIN';
  const isOrganizer = user?.role === 'EVENT_ORGANIZER';
  const isVolunteer = user?.role === 'VOLUNTEER';
  const canRegister = isVolunteer && !event?.isFull && event?.isApproved;

  const { data: registrationStatus, isLoading: isLoadingStatus } = useGetRegistrationStatus(
    event?.id,
    !!event && isVolunteer
  );

  if (!event) return null;

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'PPP');
    } catch {
      return dateString;
    }
  };

  const formatTime = (dateString: string) => {
    try {
      return format(new Date(dateString), 'p');
    } catch {
      return dateString;
    }
  };



  const handleRegister = () => {
    if (!event) return;
    if (!canRegister) return;
    registerMutation.mutate(event.id);
  };

  const handleViewRegistration = () => {
    setCurrentView('registrations');
  }

  const handleBackToDetails = () => {
    setCurrentView('event-details');
  }

  const handleDeleteEvent = () => {
    deleteEventMutation.mutate(event.id);
  }


  const isRegistered = registrationStatus?.registered;
  const isWaitlisted = registrationStatus?.status === 'WAITLISTED';

  const getButtonContent = () => {
    if (!user) {
      return (
        <Button className="w-full" size="lg" disabled>
          Login to Register
        </Button>
      );
    }

    if (isAdmin) {
      return (
        <Button className="w-full" size="lg" disabled>
          Admin View Only
        </Button>
      );
    }

    if (isOrganizer) {
      return (
        <Button className="w-full" size="lg" onClick={handleViewRegistration}>
          View Registrations
        </Button>
      );
    }

    // Volunteer Logic
    if (isLoadingStatus) {
      return (
        <Button className="w-full" size="lg" disabled>
          Checking status...
        </Button>
      );
    }

    if (isRegistered) {
      return (
        <Button className="w-full" size="lg" disabled>
          {isWaitlisted ? 'You are on the Waitlist' : 'Registered'}
        </Button>
      );
    }

    return (
      <Button
        className="w-full"
        size="lg"
        disabled={!canRegister}
        onClick={handleRegister}
      >
        {event.isFull ? 'Event Full' : event.isApproved ? 'Register for Event' : 'Awaiting Approval'}
      </Button>
    );
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto p-6">

        {currentView === 'event-details' ? (
          <>
            <SheetHeader className="pb-4 flex justify-between items-start">
              <div className="flex flex-col">
                <SheetTitle className="text-2xl">{event.title}</SheetTitle>
                <SheetDescription>
                  Created by {event.creatorName}
                </SheetDescription>
              </div>

              {isOrganizer ? (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      console.log('Edit clicked', event);
                      setEditEventModalOpen(true);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => {
                      console.log('Delete clicked');
                      handleDeleteEvent();
                    }}
                  >
                    Delete
                  </Button>
                </div>
              ) : null}
            </SheetHeader>

            <div className="space-y-6 pb-20">
              {/* Event Images */}
              {event.imageUrls && event.imageUrls.length > 0 ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    {event.imageUrls.slice(0, 4).map((url, index) => (
                      <div
                        key={index}
                        className="relative aspect-video rounded-lg overflow-hidden bg-muted"
                      >
                        <img
                          src={url}
                          alt={`${event.title} - ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.parentElement?.classList.add('flex', 'items-center', 'justify-center');
                          }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <ImageIcon className="h-8 w-8 text-muted-foreground" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="relative aspect-video rounded-lg overflow-hidden bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                  <div className="text-center">
                    <ImageIcon className="h-16 w-16 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No images available</p>
                  </div>
                </div>
              )}

              {/* Status Badges */}
              <div className="flex flex-wrap gap-2">
                {event.isApproved ? (
                  <Badge variant="default" className="bg-green-500">
                    <UserCheck className="mr-1 h-3 w-3" />
                    Approved
                  </Badge>
                ) : (
                  <Badge variant="secondary">
                    <AlertCircle className="mr-1 h-3 w-3" />
                    Pending Approval
                  </Badge>
                )}
                {event.isFull && (
                  <Badge variant="destructive">
                    <UserX className="mr-1 h-3 w-3" />
                    Full
                  </Badge>
                )}
                {event.isInProgress && (
                  <Badge variant="default" className="bg-blue-500">
                    In Progress
                  </Badge>
                )}
              </div>

              {/* Date & Time Info */}
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Event Date</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(event.eventDateTime)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Time</p>
                    <p className="text-sm text-muted-foreground">
                      {formatTime(event.eventDateTime)} - {formatTime(event.endDateTime)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Location</p>
                    <p className="text-sm text-muted-foreground">{event.location}</p>
                  </div>
                </div>

                {event.registrationDeadline && (
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Registration Deadline</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(event.registrationDeadline)}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              {/* Participation Info */}
              <div className="space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Participation
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <p className="text-sm text-muted-foreground">Max Participants</p>
                    <p className="text-2xl font-bold">
                      {event.maxParticipants || 'Unlimited'}
                    </p>
                  </div>
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <p className="text-sm text-muted-foreground">Available Spots</p>
                    <p className="text-2xl font-bold">
                      {event.availableSpots !== undefined ? event.availableSpots : '∞'}
                    </p>
                  </div>
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <p className="text-sm text-muted-foreground">Approved</p>
                    <p className="text-2xl font-bold text-green-600">
                      {event.approvedCount}
                    </p>
                  </div>
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <p className="text-sm text-muted-foreground">Pending</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {event.pendingCount}
                    </p>
                  </div>
                  {event.waitlistEnabled && (
                    <div className="bg-muted/50 p-3 rounded-lg col-span-2">
                      <p className="text-sm text-muted-foreground">Waitlist</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {event.waitlistCount}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Description */}
              <div className="space-y-2">
                <h3 className="font-semibold">Description</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {event.description}
                </p>
              </div>

              {/* Tags */}
              {tags.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <h3 className="font-semibold">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <Badge key={tag} variant="outline">
                          {tag.replace(/_/g, ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            <SheetFooter className="sticky bottom-0 bg-background pt-4 pb-4 border-t mt-6">
              {getButtonContent()}
            </SheetFooter>
          </>
        ) : (
          // View registrations
          <div className="h-full flex flex-col">
            <SheetHeader className="pb-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleBackToDetails}
                  className="h-8 w-8"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                  <SheetTitle className="text-2xl">Registrations</SheetTitle>
                  <SheetDescription>
                    {event.title} - {event.creatorName}
                  </SheetDescription>
                </div>
              </div>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto">
              {/* Đặt component EventRegistrationsModal content ở đây */}
              <EventRegistrationsModal eventId={event.id} />
            </div>
          </div>
        )}
      </SheetContent>

      <EditEventModal
        open={isEditEventModalOpen}
        onOpenChange={setEditEventModalOpen}
        event={event}
        onSuccess={() => {
          // reload data hoặc callback tùy bạn
        }}
      />
    </Sheet>
  );
}
