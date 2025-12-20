import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { eventService } from "../api/eventService";
import { UpdateStatusRequestStatusEnum } from '@/api-client';
import { toast } from "sonner";

export const useEventRegistrations = (eventId: number, enabled: boolean = false) => {
    return useQuery({
        queryKey: ['event-registrations', eventId],
        queryFn: () => eventService.getEventRegistrations(eventId),
        enabled: enabled,
    });
};

export const useUpdateRegistrationStatus = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ registrationId, status }: { registrationId: number, status: UpdateStatusRequestStatusEnum }) =>
            eventService.updateRegistrationStatus(registrationId, status),
        onSuccess: () => {
            toast.success("Registration status updated");
            queryClient.invalidateQueries({ queryKey: ['event-registrations'] });
        },
        onError: (error: any) => {
            toast.error("Failed to update status", {
                description: error.response?.data?.message || "Unknown error occurred"
            });
        }
    });
};

export const useEventAttendees = (eventId: number, enabled: boolean = false) => {
    return useQuery({
        queryKey: ['event-attendees', eventId],
        queryFn: () => eventService.getEventAttendees(eventId),
        enabled: enabled,
    });
};
