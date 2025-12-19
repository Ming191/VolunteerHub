import { useState } from "react";
import { format } from "date-fns";
import { Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";

import {
  useGetEventRegistrations,
  useUpdateRegistrationStatus,
} from "../hooks/useMyEvents";

import type { UpdateStatusRequestStatusEnum } from "@/api-client";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";

type ActionType = "APPROVED" | "REJECTED";

interface SelectedRegistration {
  id: number;
  volunteerName: string;
  action: ActionType;
}

export function EventRegistrationsModal({ eventId }: { eventId: number }) {
  const { data: registrations, isLoading } =
    useGetEventRegistrations(eventId);

  const updateStatusMutation = useUpdateRegistrationStatus(eventId);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedRegistration, setSelectedRegistration] =
    useState<SelectedRegistration | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        Loading registrations...
      </div>
    );
  }

  const openConfirmDialog = (
    id: number,
    volunteerName: string,
    action: ActionType
  ) => {
    setSelectedRegistration({ id, volunteerName, action });
    setConfirmOpen(true);
  };

  const handleConfirm = () => {
    if (!selectedRegistration) return;

    updateStatusMutation.mutate(
      {
        registrationId: selectedRegistration.id,
        status:
          selectedRegistration.action as UpdateStatusRequestStatusEnum,
      },
      {
        onSuccess: () => {
          setConfirmOpen(false);
          setSelectedRegistration(null);
        },
      }
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          <span className="text-sm font-medium">
            Total Registrations: {registrations?.length || 0}
          </span>
        </div>
      </div>

      {/* Registrations list */}
      {registrations && registrations.length > 0 ? (
        <div className="space-y-2">
          {registrations.map((registration) => (
            <div
              key={registration.id}
              className="p-3 border rounded-lg"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">
                    {registration.volunteerName}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Status: {registration.status}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Registered:{" "}
                    {format(
                      new Date(registration.registeredAt),
                      "PPpp"
                    )}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  {registration.status === "PENDING" && (
                    <>
                      <Badge
                        className="cursor-pointer"
                        variant="secondary"
                        onClick={() =>
                          openConfirmDialog(
                            registration.id,
                            registration.volunteerName,
                            "APPROVED"
                          )
                        }
                      >
                        APPROVE
                      </Badge>

                      <Badge
                        className="cursor-pointer"
                        variant="destructive"
                        onClick={() =>
                          openConfirmDialog(
                            registration.id,
                            registration.volunteerName,
                            "REJECTED"
                          )
                        }
                      >
                        REJECT
                      </Badge>
                    </>
                  )}

                  {registration.status === "APPROVED" && (
                    <Badge variant="default">APPROVED</Badge>
                  )}

                  {registration.status === "REJECTED" && (
                    <Badge variant="outline">REJECTED</Badge>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <Users className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            No Registrations
          </h3>
          <p className="text-muted-foreground">
            There are no registrations for this event yet.
          </p>
        </div>
      )}

      {/* Confirm Dialog (Approve / Reject) */}
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={
          selectedRegistration?.action === "APPROVED"
            ? "Approve Registration"
            : "Reject Registration"
        }
        description={
          <>
            Are you sure you want to{" "}
            <strong>
              {selectedRegistration?.action === "APPROVED"
                ? "approve"
                : "reject"}
            </strong>{" "}
            the registration of{" "}
            <strong>
              {selectedRegistration?.volunteerName}
            </strong>
            ? This action cannot be undone.
          </>
        }
        confirmText={
          selectedRegistration?.action === "APPROVED"
            ? "Confirm Approve"
            : "Confirm Reject"
        }
        confirmVariant={
          selectedRegistration?.action === "APPROVED"
            ? "default"
            : "destructive"
        }
        isLoading={updateStatusMutation.isPending}
        onConfirm={handleConfirm}
      />
    </div>
  );
}
