import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/animate-ui/components/radix/dialog';
import { eventService } from '../api/eventService';
import type { UpdateEventRequest, EventResponse } from '@/api-client';
import EventForm, { type EventFormValues } from './EventForm';

interface EditEventModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: EventResponse;
  onSuccess?: () => void;
}

const formatDateForBackend = (date: Date): string => {
  return date.toISOString().substring(0, 19);
};

export default function EditEventModal({ open, onOpenChange, onSuccess, event }: EditEventModalProps) {

  const handleError = (error: unknown): void => {
    const err = error as { response?: { status?: number; data?: { message?: string } }; message?: string };
    const status = err?.response?.status;

    if (status === 401) {
      toast.error('Authentication required', {
        description: 'Your session has expired. Please log in again.',
      });
      localStorage.clear();
      setTimeout(() => {
        window.location.href = '/signin';
      }, 2000);
      return;
    }

    if (status === 400) {
      const errorMessage = err?.response?.data?.message || 'Invalid event data. Please check your inputs.';
      toast.error('Validation error', { description: errorMessage });
      return;
    }

    if (status === 403) {
      const storedUser = localStorage.getItem('user');
      const userRole = storedUser ? JSON.parse(storedUser).role : 'unknown';
      toast.error('Permission denied', {
        description: `You do not have permission to edit events. Current role: ${userRole}. Required: EVENT_ORGANIZER or ADMIN.`,
      });
      return;
    }

    const errorMessage = err?.response?.data?.message || err?.message || 'An unexpected error occurred.';
    toast.error('Failed to update event', { description: errorMessage });
  };

  const handleUpdateEvent = async (values: EventFormValues, files: File[]) => {
    try {
      const eventData = {
        title: values.title,
        description: values.description,
        location: values.location,
        eventDateTime: formatDateForBackend(values.eventDateTime),
        endDateTime: formatDateForBackend(values.endDateTime),
        registrationDeadline: values.registrationDeadline
          ? formatDateForBackend(values.registrationDeadline)
          : undefined,
        maxParticipants: values.maxParticipants,
        waitlistEnabled: values.waitlistEnabled,
        tags: values.tags && values.tags.length > 0 ? values.tags : undefined,
      };
      await eventService.updateEvent(event.id, eventData as UpdateEventRequest);

      toast.success('Event updated successfully!', {
        description: 'Your event has been updated',
      });



      onOpenChange(false);

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      handleError(error);
      throw error;
    }
  };

  const defaultValues: Partial<EventFormValues> = {
    title: event.title || "",
    description: event.description || "",
    location: event.location || "",
    eventDateTime: event.eventDateTime ? new Date(event.eventDateTime) : undefined,
    endDateTime: event.endDateTime ? new Date(event.endDateTime) : undefined,
    registrationDeadline: event.registrationDeadline ? new Date(event.registrationDeadline) : undefined,
    maxParticipants: event.maxParticipants || undefined,
    waitlistEnabled: event.waitlistEnabled ?? false,
    tags: Array.isArray(event.tags) ? [...event.tags] : [],
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Event</DialogTitle>
          <DialogDescription>
            Update the details of your event below.
          </DialogDescription>
        </DialogHeader>

        <EventForm
          defaultValues={defaultValues}
          onSubmit={handleUpdateEvent}
          onCancel={() => onOpenChange(false)}
          submitLabel="Save Changes"
        />
      </DialogContent>
    </Dialog>
  );
}
