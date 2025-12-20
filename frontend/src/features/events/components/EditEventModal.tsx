import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/animate-ui/components/radix/dialog';
import type { UpdateEventRequest, EventResponse } from '@/api-client';
import { EventForm, type EventFormValues } from './EventForm';
import { useMemo, useEffect } from "react";
import { useUpdateEvent } from "../hooks/useMyEvents";
import { Loader2 } from "lucide-react";

interface EditEventModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: EventResponse;
  onSuccess?: () => void;
  onUpdateStart?: (eventId: number) => void;
  onUpdateEnd?: () => void;
  onImageProcessingStart?: (eventId: number) => void;
}

const formatDateForBackend = (date: Date): string => {
  return date.toISOString().substring(0, 19);
};

export const EditEventModal = ({ open, onOpenChange, onSuccess, event, onUpdateStart, onUpdateEnd, onImageProcessingStart }: EditEventModalProps) => {
  const updateEventMutation = useUpdateEvent();

  // Track mutation state and notify parent
  useEffect(() => {
    if (updateEventMutation.isPending && onUpdateStart) {
      onUpdateStart(event.id);
    } else if (!updateEventMutation.isPending && onUpdateEnd) {
      onUpdateEnd();
    }
  }, [updateEventMutation.isPending, event.id, onUpdateStart, onUpdateEnd]);

  const handleUpdateEvent = async (values: EventFormValues, files: File[], remainingImages: string[]) => {
    const eventData = {
      title: values.title,
      description: values.description,
      location: values.location,
      latitude: values.latitude,
      longitude: values.longitude,
      eventDateTime: formatDateForBackend(values.eventDateTime),
      endDateTime: formatDateForBackend(values.endDateTime),
      registrationDeadline: values.registrationDeadline
        ? formatDateForBackend(values.registrationDeadline)
        : undefined,
      maxParticipants: values.maxParticipants,
      waitlistEnabled: values.waitlistEnabled,
      tags: values.tags && values.tags.length > 0 ? values.tags : undefined,
    };

    await updateEventMutation.mutateAsync({
      eventId: event.id,
      data: eventData as UpdateEventRequest,
      files,
      remainingImages,
    });

    // If images were uploaded, trigger image processing indicator
    if (files && files.length > 0 && onImageProcessingStart) {
      onImageProcessingStart(event.id);
    }

    onOpenChange(false);

    if (onSuccess) {
      onSuccess();
    }
  };

  const defaultValues: Partial<EventFormValues> = useMemo(() => ({
    title: event.title || "",
    description: event.description || "",
    location: event.location || "",
    eventDateTime: event.eventDateTime ? new Date(event.eventDateTime) : undefined,
    endDateTime: event.endDateTime ? new Date(event.endDateTime) : undefined,
    registrationDeadline: event.registrationDeadline ? new Date(event.registrationDeadline) : undefined,
    maxParticipants: event.maxParticipants || undefined,
    waitlistEnabled: event.waitlistEnabled ?? false,
    tags: Array.isArray(event.tags) ? [...event.tags] : [],
    latitude: event.latitude || undefined,
    longitude: event.longitude || undefined,
  }), [event]);

  const initialImages = useMemo(() =>
    Array.isArray(event.imageUrls) ? [...event.imageUrls] : [],
    [event]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {updateEventMutation.isPending && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Updating event...</p>
            </div>
          </div>
        )}

        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Edit Event</DialogTitle>
          <DialogDescription>
            Update the details of your event below.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto min-h-0 -mx-6 px-6">
          <EventForm
            defaultValues={defaultValues}
            initialImages={initialImages}
            onSubmit={handleUpdateEvent}
            onCancel={() => onOpenChange(false)}
            submitLabel="Save Changes"
            isSubmitting={updateEventMutation.isPending}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
