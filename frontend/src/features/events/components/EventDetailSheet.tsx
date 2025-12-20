import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/animate-ui/components/radix/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft } from "lucide-react";
import type { EventResponse } from "@/api-client";
import { useState } from "react";

// Sub-components
import { EventHeader } from "./sheet/EventHeader";
import { EventImages } from "./sheet/EventImages";
import { EventBadges } from "./sheet/EventBadges";
import { EventDateInfo } from "./sheet/EventDateInfo";
import { EventParticipation } from "./sheet/EventParticipation";
import { EventDescription } from "./sheet/EventDescription";
import { EventTags } from "./sheet/EventTags";
import { EventSheetFooter } from "./sheet/EventSheetFooter";
import { EditEventModal } from "./EditEventModal.tsx";
import { useDeleteEvent } from "../hooks/useMyEvents.ts";
import { EventRegistrationsModal } from "@/features/events/components/EventRegistrationsModal.tsx";
import { useEventPermissions } from "@/features/events/hooks/useEventPermissions.ts";
import { useRegisterForEvent } from "@/features/volunteer/hooks/useRegistration.ts";
import { ConfirmDialog } from "@/components/common/ConfirmDialog.tsx";

interface EventDetailSheetProps {
  event: EventResponse | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onEventUpdateStart?: (eventId: number) => void;
  onEventUpdateEnd?: () => void;
  onImageProcessingStart?: (eventId: number) => void;
}

type SheetView = "event-details" | "registrations";

export const EventDetailSheet = ({
  event,
  isOpen,
  onOpenChange,
  onEventUpdateStart,
  onEventUpdateEnd,
  onImageProcessingStart,
}: EventDetailSheetProps) => {
  const [isEditEventModalOpen, setEditEventModalOpen] = useState(false);
  const registerMutation = useRegisterForEvent();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const deleteEventMutation = useDeleteEvent();
  const [currentView, setCurrentView] = useState<SheetView>("event-details");

  // Use custom hook for permissions
  const { canRegister } = useEventPermissions(event);

  if (!event) return null;

  const handleRegister = () => {
    if (!event) return;
    if (!canRegister) return;
    registerMutation.mutate(event.id);
  };

  const handleViewRegistration = () => {
    setCurrentView("registrations");
  };

  const handleBackToDetails = () => {
    setCurrentView("event-details");
  };

  const handleDeleteEvent = () => {
    setDeleteDialogOpen(true);
  };

  const confirmDeleteEvent = () => {
    deleteEventMutation.mutate(event.id, {
      onSuccess: () => {
        setDeleteDialogOpen(false);
        onOpenChange(false);
      },
    });
  };

  const handleEditEvent = () => {
    setEditEventModalOpen(true);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="p-0 flex flex-col">
        {currentView === "event-details" ? (
          <>
            {/* Header - Fixed at top */}
            <div className="px-6 pt-6 pb-4 border-b border-gray-200 bg-white">
              <EventHeader
                event={event}
                onEdit={handleEditEvent}
                onDelete={handleDeleteEvent}
              />
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
              <div className="space-y-6 pb-6">
                <EventImages imageUrls={event.imageUrls} title={event.title} />
                <EventBadges event={event} />
                <EventDateInfo event={event} />
                <Separator className="my-4" />
                <EventParticipation event={event} />
                <Separator className="my-4" />
                <EventDescription description={event.description} />
                <EventTags tags={event.tags} />
              </div>
            </div>

            {/* Footer - Fixed at bottom */}
            <EventSheetFooter
              event={event}
              onViewRegistrations={handleViewRegistration}
              onRegister={handleRegister}
              onClose={() => onOpenChange(false)}
            />
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
          // reload data or callback
        }}
        onUpdateStart={onEventUpdateStart}
        onUpdateEnd={onEventUpdateEnd}
        onImageProcessingStart={onImageProcessingStart}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Event"
        description={
          <>
            Are you sure you want to delete the event{" "}
            <strong>{event.title}</strong>? This action cannot be undone.
          </>
        }
        confirmText="Delete Event"
        confirmVariant="destructive"
        isLoading={deleteEventMutation.isPending}
        onConfirm={confirmDeleteEvent}
      />
    </Sheet>
  );
};
