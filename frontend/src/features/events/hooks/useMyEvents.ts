
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { eventService, type MyEventsParams } from "@/features/events/api/eventService";
import type { UpdateStatusRequestStatusEnum, UpdateEventRequest } from "@/api-client";
import { toast } from "sonner";
import { EVENTS_QUERY_KEY } from "@/features/events/hooks/useEvents";


export const MY_EVENTS_QUERY_KEY = "my-events";
export const EVENT_REGISTRATIONS_QUERY_KEY = "event-registrations";

export const useGetMyEvents = (params: MyEventsParams) => {
    return useQuery({
        queryKey: [MY_EVENTS_QUERY_KEY, params],
        queryFn: () => eventService.getMyEvents(params),
        placeholderData: (prev) => prev,
    });
};


export const useGetEventRegistrations = (eventId: number | undefined) => {
    return useQuery({
        queryKey: [EVENT_REGISTRATIONS_QUERY_KEY, eventId],
        queryFn: () => {
            if (!eventId) throw new Error("Event ID is required");
            return eventService.getEventRegistrations(eventId);
        },
        enabled: !!eventId, // Only fetch when eventId is available
        placeholderData: (prev) => prev,
    });
};


export const useUpdateRegistrationStatus = (eventId: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ registrationId, status }: { registrationId: number; status: UpdateStatusRequestStatusEnum }) =>
            eventService.updateRegistrationStatus(registrationId, status),

        onSuccess: () => {
            // Refresh registrations list after update
            queryClient.invalidateQueries({
                queryKey: [EVENT_REGISTRATIONS_QUERY_KEY, eventId],
            });

          // 2️⃣ Refresh event detail (counts pending / approved)
          queryClient.invalidateQueries({
            queryKey: [EVENTS_QUERY_KEY, eventId],
          });
        },
    });
};

export function useUpdateEvent() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ eventId, data, files, remainingImages }: { eventId: number; data: UpdateEventRequest; files: File[]; remainingImages?: string[] }) =>
            eventService.updateEvent(eventId, data, files, remainingImages),
        onSuccess: (_data, variables) => {
            const hasImages = variables.files && variables.files.length > 0;

            if (hasImages) {
                toast.success("Event updated!", {
                    description: "Your images are being processed. This may take a few moments.",
                    duration: 5000,
                });
            } else {
                toast.success("Event updated successfully!", {
                    description: "Your event has been updated",
                });
            }

            queryClient.invalidateQueries({ queryKey: [EVENTS_QUERY_KEY] });
            queryClient.invalidateQueries({ queryKey: [MY_EVENTS_QUERY_KEY] });
        },
        onError: (error: unknown) => {
            const err = error as { response?: { status?: number; data?: { message?: string } }; message?: string };
            const status = err?.response?.status;

            if (status === 401) {
                toast.error('Authentication required', {
                    description: 'Your session has expired. Please log in again.',
                });
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
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
                toast.error('Permission denied', {
                    description: 'You do not have permission to edit events.',
                });
                return;
            }

            const errorMessage = err?.response?.data?.message || err?.message || 'An unexpected error occurred.';
            toast.error('Failed to update event', { description: errorMessage });
        },
    });
}

export function useDeleteEvent() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (eventId: number) => eventService.deleteEvent(eventId),
        onSuccess: () => {
            toast.success("Event deleted successfully!");
            queryClient.invalidateQueries({ queryKey: [EVENTS_QUERY_KEY] });
            queryClient.invalidateQueries({ queryKey: [MY_EVENTS_QUERY_KEY] });
        }, onError: (error: unknown) => {
            const err = error as { message?: string };
            toast.error(err?.message || "Failed to delete event");
        },
    });
}
