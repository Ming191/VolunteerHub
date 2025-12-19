import type { RegistrationResponse } from "@/api-client";
import { useQuery } from "@tanstack/react-query";
import { eventService } from "@/features/events/api/eventService";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useCancelRegistration } from "@/features/volunteer/hooks/useRegistration.ts";
import {ConfirmDialog} from "@/components/common/ConfirmDialog.tsx";
import {format} from "date-fns";

interface RegistrationCardProps {
    registration: RegistrationResponse;
    onClick: () => void;
}

export function RegistrationCard({ registration, onClick }: RegistrationCardProps) {
    const [isCancelDialogOpen, setCancelDialogOpen] = useState(false);
    const cancelMutation = useCancelRegistration();

    const { data: eventDetail } = useQuery({
        queryKey: ['event', registration.eventId],
        queryFn: () => eventService.getEventById(registration.eventId),
    });

    const isApproved = registration.status === 'APPROVED';

    // Check if event hasn't started yet
    const isUpcoming = eventDetail
        ? new Date(eventDetail.eventDateTime) > new Date()
        : false;

    const canCancel = isApproved && isUpcoming;

    const handleCancel = () => {
        cancelMutation.mutate(registration.eventId, {
            onSuccess: () => {
                setCancelDialogOpen(false);
            }
        });
    };

    return (
        <div
            className="border rounded-lg p-4 shadow-sm bg-card hover:bg-muted/50 transition cursor-pointer flex justify-between items-center"
            onClick={onClick}
        >
            <div>
                <h3 className="text-lg font-semibold mb-1">{registration.eventTitle}</h3>
                <p className="text-sm text-muted-foreground mb-1">📍 {format(new Date(registration.registeredAt), "PPpp")}</p>
                <p
                    className={`text-sm font-medium ${registration.status === 'APPROVED' ? 'text-green-600' : 'text-yellow-600'}`}
                >
                    {registration.status}
                </p>
                {/* Debug info (optional, remove later) */}
                {/* <p className="text-xs text-gray-400">Event Date: {eventDetail?.eventDateTime}</p> */}
            </div>

          {canCancel && (
            <div onClick={(e) => e.stopPropagation()}>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setCancelDialogOpen(true)}
              >
                Cancel
              </Button>

              <ConfirmDialog
                open={isCancelDialogOpen}
                onOpenChange={setCancelDialogOpen}
                title="Cancel Registration"
                description={
                  <>
                    Are you sure you want to cancel your registration for{" "}
                    <strong>{registration.eventTitle}</strong>?
                    This action cannot be undone.
                  </>
                }
                confirmText="Confirm Cancel"
                confirmVariant="destructive"
                isLoading={cancelMutation.isPending}
                onConfirm={handleCancel}
              />
            </div>
          )}
        </div>
    );
}
