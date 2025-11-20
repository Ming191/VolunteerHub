import { useQuery } from "@tanstack/react-query";
import { eventService, type MyEventsParams } from "@/services/eventService";

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
