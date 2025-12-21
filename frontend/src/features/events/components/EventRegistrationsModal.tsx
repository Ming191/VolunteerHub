import { useState } from "react";
import { Users } from "lucide-react";

import {
  useGetEventRegistrations,
  useMarkRegistrationCompleted,
  useUpdateRegistrationStatus,
} from "../hooks/useMyEvents";

import type { UpdateStatusRequestStatusEnum } from "@/api-client";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { EventRegistrationCard } from "@/features/events/components/EventRegistrationCard";

type ActionType = "APPROVED" | "REJECTED" | "COMPLETED";

interface SelectedRegistration {
  id: number;
  volunteerName: string;
  action: ActionType;
}

const ACTION_CONFIG: Record<
  ActionType,
  {
    title: string;
    verb: string;
    confirmText: string;
    variant: "default" | "destructive";
  }
> = {
  APPROVED: {
    title: "Approve Registration",
    verb: "approve",
    confirmText: "Confirm Approve",
    variant: "default",
  },
  REJECTED: {
    title: "Reject Registration",
    verb: "reject",
    confirmText: "Confirm Reject",
    variant: "destructive",
  },
  COMPLETED: {
    title: "Mark Registration as Completed",
    verb: "mark as completed",
    confirmText: "Confirm Completion",
    variant: "default",
  },
};

export function EventRegistrationsModal({ eventId }: { eventId: number }) {
  const { data: registrations, isLoading } = useGetEventRegistrations(eventId);

  const updateStatusMutation = useUpdateRegistrationStatus(eventId);
  const markRegistrationCompletedMutation =
    useMarkRegistrationCompleted(eventId);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedRegistration, setSelectedRegistration] =
    useState<SelectedRegistration | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32 text-muted-foreground">
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

    const { id, action } = selectedRegistration;

    if (action === "COMPLETED") {
      markRegistrationCompletedMutation.mutate(id, {
        onSuccess: () => {
          setConfirmOpen(false);
          setSelectedRegistration(null);
        },
      });
      return;
    }

    updateStatusMutation.mutate(
      {
        registrationId: id,
        status: action as UpdateStatusRequestStatusEnum,
      },
      {
        onSuccess: () => {
          setConfirmOpen(false);
          setSelectedRegistration(null);
        },
      }
    );
  };

  const actionConfig = selectedRegistration
    ? ACTION_CONFIG[selectedRegistration.action]
    : null;

  const isSubmitting =
    selectedRegistration?.action === "COMPLETED"
      ? markRegistrationCompletedMutation.isPending
      : updateStatusMutation.isPending;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Users className="h-4 w-4" />
        <span className="text-sm font-medium">
          Total Registrations: {registrations?.length || 0}
        </span>
      </div>

      {/* Registrations list */}
      {registrations && registrations.length > 0 ? (
        <div className="space-y-3">
          {registrations.map((registration) => (
            <EventRegistrationCard
              key={registration.id}
              registration={registration}
              onAction={openConfirmDialog}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-1">No Registrations</h3>
          <p className="text-muted-foreground">
            There are no registrations for this event yet.
          </p>
        </div>
      )}

      {/* Confirm Dialog */}
      {actionConfig && (
        <ConfirmDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          title={actionConfig.title}
          description={
            <>
              Are you sure you want to{" "}
              <strong>{actionConfig.verb}</strong> the registration of{" "}
              <strong>{selectedRegistration?.volunteerName}</strong>?
              <br />
              This action cannot be undone.
            </>
          }
          confirmText={actionConfig.confirmText}
          confirmVariant={actionConfig.variant}
          isLoading={isSubmitting}
          onConfirm={handleConfirm}
        />
      )}
    </div>
  );
}
