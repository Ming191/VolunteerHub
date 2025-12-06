import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import { eventService, type MyEventsParams } from "@/services/eventService";
import type {UpdateStatusRequestStatusEnum} from "@/api-client";
import {toast} from "sonner";
import {EVENTS_QUERY_KEY} from "@/hooks/useEvents.ts";


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
      // Làm mới danh sách registrations sau khi update
      queryClient.invalidateQueries({
        queryKey: [EVENT_REGISTRATIONS_QUERY_KEY, eventId],
      });
    },
  });
};

export function useDeleteEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (eventId: number) => eventService.deleteEvent(eventId),
    onSuccess: () => {
      toast.success("Event deleted successfully!");
      queryClient.invalidateQueries({ queryKey: [EVENTS_QUERY_KEY] });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to delete event");
    },
  });
}
