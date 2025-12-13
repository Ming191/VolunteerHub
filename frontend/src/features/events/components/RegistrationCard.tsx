import type { RegistrationResponse } from "@/api-client";
import { useQuery } from "@tanstack/react-query";
import { eventService } from "@/features/events/api/eventService";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState, type MouseEvent } from "react";

import { Loader2 } from "lucide-react";
import { useCancelRegistration } from "@/features/volunteer/hooks/useRegistration.ts";

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

    const handleCancel = (e: MouseEvent) => {
        e.stopPropagation();
        cancelMutation.mutate(registration.id, {
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
                <p className="text-sm text-muted-foreground mb-1">📍 {registration.registeredAt}</p>
                <p
                    className={`text-sm font-medium ${registration.status === 'APPROVED' ? 'text-green-600' : 'text-yellow-600'
                        }`}
                >
                    {registration.status}
                </p>
                {/* Debug info (optional, remove later) */}
                {/* <p className="text-xs text-gray-400">Event Date: {eventDetail?.eventDateTime}</p> */}
            </div>

            {canCancel && (
                <div onClick={(e) => e.stopPropagation()}>
                    <Dialog open={isCancelDialogOpen} onOpenChange={setCancelDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                                Cancel
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Cancel Registration</DialogTitle>
                                <DialogDescription>
                                    Are you sure you want to cancel your registration for <strong>{registration.eventTitle}</strong>?
                                    This action cannot be undone.
                                </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
                                    Keep Registration
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={handleCancel}
                                    disabled={cancelMutation.isPending}
                                >
                                    {cancelMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Confirm Cancel
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            )}
        </div>
    );
}
