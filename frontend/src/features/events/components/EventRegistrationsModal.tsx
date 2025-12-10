import { useGetEventRegistrations, useUpdateRegistrationStatus } from "../hooks/useMyEvents";
import { format } from "date-fns";
import { Users } from "lucide-react";
import { Badge } from "@/components/ui/badge.tsx";
import type { UpdateStatusRequestStatusEnum } from "@/api-client";

// Tách riêng content của registrations
export function EventRegistrationsModal({ eventId }: { eventId: number }) {
  const { data: registrations, isLoading } = useGetEventRegistrations(eventId);
  console.log(registrations);
  const updateStatusMutation = useUpdateRegistrationStatus(eventId);

  if (isLoading) {
    return <div className="flex items-center justify-center h-32">Loading registrations...</div>;
  }

  const updateStatus = (id: number, status: UpdateStatusRequestStatusEnum) => {
    updateStatusMutation.mutate({ registrationId: id, status });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          <span className="text-sm font-medium">
            Total Registrations: {registrations?.length || 0}
          </span>
        </div>
      </div>

      {registrations && registrations.length > 0 ? (
        <div className="space-y-2">
          {registrations.map((registration) => (
            <div key={registration.id} className="p-3 border rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">{registration.volunteerName}</h4>
                  <p className="text-sm text-muted-foreground">
                    Status: {registration.status}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Registered: {format(new Date(registration.registeredAt), 'PPpp')}
                  </p>
                </div>
                <Badge variant={
                  registration.status === 'APPROVED' ? 'default' :
                    registration.status === 'PENDING' ? 'secondary' :
                      'outline'
                } onClick={() => updateStatus(registration.id, "APPROVED")}>
                  {registration.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <Users className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Registrations</h3>
          <p className="text-muted-foreground">
            There are no registrations for this event yet.
          </p>
        </div>
      )}
    </div>
  );
}
