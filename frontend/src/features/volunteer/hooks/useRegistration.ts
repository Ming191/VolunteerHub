import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { registrationService } from "@/features/volunteer/api/registrationService.ts";
import { toast } from "sonner";
import { EVENTS_QUERY_KEY } from "@/features/events/hooks/useEvents.ts";

const REGISTRATION_QUERY_KEY = "my-registrations";
const CHECK_REGISTRATION_QUERY_KEY = "check-registration";

export const useRegisterForEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (eventId: number) =>
      registrationService.registerForEvent(eventId),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [CHECK_REGISTRATION_QUERY_KEY, variables],
      });
      queryClient.invalidateQueries({ queryKey: [REGISTRATION_QUERY_KEY] });
      if (data.status === "WAITLISTED") {
        toast.success("Added to Waitlist", {
          description: `Your position: ${data.waitlistPosition}`,
        });
      } else {
        toast.success("Registration Successful", {
          description: "You have successfully registered for this event",
        });
      }
      queryClient.invalidateQueries({
        queryKey: [EVENTS_QUERY_KEY, variables],
      });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error("Registration Failed", {
        description:
          err.response?.data?.message || "Unable to register for this event",
      });
    },
  });
};

export const useGetRegistrationStatus = (
  eventId: number | undefined,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: [CHECK_REGISTRATION_QUERY_KEY, eventId],
    queryFn: () => {
      if (!eventId) throw new Error("Event ID is required");
      return registrationService.getRegistrationStatus(eventId);
    },
    enabled: !!eventId && enabled,
    retry: false,
  });
};

export const useCancelRegistration = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (eventId: number) =>
      registrationService.cancelRegistration(eventId),
    onSuccess: (_, variables) => {
      toast.success("Registration Cancelled", {
        description: "You have successfully cancelled your registration",
      });
      queryClient.invalidateQueries({ queryKey: [REGISTRATION_QUERY_KEY] });
      queryClient.invalidateQueries({
        queryKey: [CHECK_REGISTRATION_QUERY_KEY, variables],
      });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error("Cancellation Failed", {
        description:
          err.response?.data?.message || "Unable to cancel registration",
      });
    },
  });
};

export const useGetMyRegistrationEvents = () => {
  return useQuery({
    queryKey: [REGISTRATION_QUERY_KEY],
    queryFn: () => registrationService.getMyRegistrationEvents(),
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: Infinity, // dữ liệu luôn được coi là fresh
    placeholderData: (prev) => prev,
  });
};
