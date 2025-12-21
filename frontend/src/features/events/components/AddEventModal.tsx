import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/animate-ui/components/radix/dialog";
import { eventService } from "../api/eventService";
import type { CreateEventRequest } from "@/api-client";
import { EventForm, type EventFormValues } from "./EventForm";
import { RippleButton } from "@/components/animate-ui/components/buttons/ripple";
import { Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

interface AddEventModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const formatDateForBackend = (date: Date): string => {
  return date.toISOString().substring(0, 19);
};

export const AddEventModal = ({
  open,
  onOpenChange,
  onSuccess,
}: AddEventModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const handleError = (error: unknown): void => {
    const err = error as {
      response?: { status?: number; data?: { message?: string } };
      message?: string;
    };
    const status = err?.response?.status;

    if (status === 401) {
      toast.error("Authentication required", {
        description: "Your session has expired. Please log in again.",
      });
      localStorage.clear();
      setTimeout(() => {
        window.location.href = "/signin";
      }, 2000);
      return;
    }

    if (status === 400) {
      const errorMessage =
        err?.response?.data?.message ||
        "Invalid event data. Please check your inputs.";
      toast.error("Validation error", { description: errorMessage });
      return;
    }

    if (status === 403) {
      const storedUser = localStorage.getItem("user");
      const userRole = storedUser ? JSON.parse(storedUser).role : "unknown";
      toast.error("Permission denied", {
        description: `You do not have permission to create events. Current role: ${userRole}. Required: EVENT_ORGANIZER or ADMIN.`,
      });
      return;
    }

    const errorMessage =
      err?.response?.data?.message ||
      err?.message ||
      "An unexpected error occurred.";
    toast.error("Failed to create event", { description: errorMessage });
  };

  const handleCreateEvent = async (values: EventFormValues, files: File[]) => {
    setIsSubmitting(true);
    try {
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

      await eventService.createEvent(eventData as CreateEventRequest, files);

      // Invalidate queries to refresh event lists with new images
      await queryClient.invalidateQueries({ queryKey: ["events"] });
      await queryClient.invalidateQueries({ queryKey: ["my-events"] });

      toast.success("Event created successfully!", {
        description: "Your event has been submitted for approval.",
      });

      onOpenChange(false);

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      handleError(error);
      // Don't rethrow here as we handle the error via toast.
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 py-5 bg-gradient-to-r from-green-50 to-emerald-50 border-b-2 border-green-100 shrink-0">
          <DialogTitle className="text-2xl font-bold text-gray-900">
            Create New Event
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Fill in the details below to create a new volunteer event. Events
            require admin approval before being published.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <EventForm
            onSubmit={handleCreateEvent}
            onCancel={() => onOpenChange(false)}
            submitLabel="Create Event"
            formId="create-event-form"
            hideActions={true}
            isSubmitting={isSubmitting}
          />
        </div>

        <DialogFooter className="px-6 py-4 border-t-2 border-gray-100 shrink-0 bg-gray-50">
          <RippleButton
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </RippleButton>
          <RippleButton
            type="submit"
            form="create-event-form"
            disabled={isSubmitting}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Event
          </RippleButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
