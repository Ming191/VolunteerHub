import {useMutation, useQuery} from "@tanstack/react-query";
import { registrationService } from "@/services/registrationService.ts";
import { toast } from "sonner";

const REGISTRATION_QUERY_KEY = 'my-registrations';

export const useRegisterForEvent = () => {
  return useMutation({
    mutationFn: (eventId: number) => registrationService.registerForEvent(eventId),
    onSuccess: (data) => {
      if (data.status === 'WAITLISTED') {
        toast.success("Added to Waitlist", {
          description: `Your position: ${data.waitlistPosition}`,
        });
      } else {
        toast.success("Registration Successful", {
          description: "You have successfully registered for this event",
        });
      }
    },
    onError: (error: any) => {
      toast.error("Registration Failed", {
        description: error.response?.data?.message || "Unable to register for this event",
      });
    },
  });
};


export const useGetMyRegistrationEvents = () => {
  return useQuery({
    queryKey: [REGISTRATION_QUERY_KEY],
    queryFn: () => registrationService.getMyRegistrationEvents(),
    placeholderData: (prev) => prev
  })
}
