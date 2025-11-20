import {useMutation} from "@tanstack/react-query";
import {eventService} from "@/services/eventService.ts";

export const useCreateEvent = () => {
  return useMutation({
    mutationFn: eventService.createEvent,
  });
};
