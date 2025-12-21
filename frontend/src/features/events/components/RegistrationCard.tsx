import type { RegistrationResponse } from "@/api-client";
import { useQuery } from "@tanstack/react-query";
import { eventService } from "@/features/events/api/eventService";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useCancelRegistration } from "@/features/volunteer/hooks/useRegistration.ts";
import { ConfirmDialog } from "@/components/common/ConfirmDialog.tsx";
import { format } from "date-fns";
import { Calendar, MapPin, Clock } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface RegistrationCardProps {
  registration: RegistrationResponse;
  onClick: () => void;
}

const getStatusConfig = (status: string) => {
  switch (status) {
    case 'APPROVED':
      return { variant: 'default' as const, className: 'bg-green-600 hover:bg-green-700' };
    case 'PENDING':
      return { variant: 'secondary' as const, className: 'bg-yellow-500 text-yellow-700 hover:bg-yellow-600 border-yellow-200' };
    case 'COMPLETED':
      return { variant: 'secondary' as const, className: 'bg-blue-600 text-white hover:bg-blue-700' };
    case 'CANCELLED':
    case 'REJECTED':
      return { variant: 'destructive' as const, className: '' };
    default:
      return { variant: 'outline' as const, className: '' };
  }
};


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

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    setCancelDialogOpen(true);
  };

  const confirmCancel = () => {
    cancelMutation.mutate(registration.eventId, {
      onSuccess: () => {
        setCancelDialogOpen(false);
      }
    });
  };

  const statusConfig = getStatusConfig(registration.status);

  return (
    <>
      <Card
        className="
            flex flex-col h-full relative
            transition-all duration-300 ease-out
            hover:-translate-y-2
            hover:shadow-[0_20px_40px_rgba(0,0,0,0.25)]
            dark:hover:shadow-[
              0_8px_30px_rgba(0,0,0,0.9),
              0_0_60px_rgba(255,255,255,0.15)
            ]
        "
        onClick={onClick}
      >
        <div className="relative h-32 bg-muted/30">
          {eventDetail?.imageUrls?.[0] ? (
            <img
              src={eventDetail.imageUrls[0]}
              alt={registration.eventTitle}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10">
              <Calendar className="h-10 w-10 text-primary/20" />
            </div>
          )}
          <div className="absolute top-2 right-2">
            <Badge variant={statusConfig.variant} className={cn("shadow-sm", statusConfig.className)}>
              {registration.status}
            </Badge>
          </div>
        </div>

        <CardHeader className="p-4 pb-2">
          <h3 className="font-bold text-lg leading-tight line-clamp-1 group-hover:text-primary transition-colors">
            {registration.eventTitle}
          </h3>
        </CardHeader>

        <CardContent className="p-4 pt-1 flex-grow space-y-2.5">
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="h-3.5 w-3.5 mr-2 shrink-0" />
            <span>{format(new Date(registration.registeredAt), "PPP")}</span>
          </div>
          {eventDetail && (
            <div className="flex items-center text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 mr-2 shrink-0" />
              <span className="truncate">{eventDetail.location}</span>
            </div>
          )}
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="h-3.5 w-3.5 mr-2 shrink-0" />
            <span className="text-xs">Registered on {format(new Date(registration.registeredAt), "PP")}</span>
          </div>
        </CardContent>

        {canCancel && (
          <CardFooter className="p-4 pt-0 mt-auto">
            <Button
              variant="outline"
              size="sm"
              className="w-full text-destructive hover:text-destructive hover:bg-destructive/5 border-destructive/20"
              onClick={handleCancel}
            >
              Cancel Registration
            </Button>
          </CardFooter>
        )}
      </Card>

      <ConfirmDialog
        open={isCancelDialogOpen}
        onOpenChange={setCancelDialogOpen}
        title="Cancel Registration"
        description={
          <>
            Are you sure you want to cancel your registration for{" "}
            <span className="font-semibold text-foreground">{registration.eventTitle}</span>?
            <br />
            <span className="text-xs mt-2 block text-muted-foreground">This action cannot be undone.</span>
          </>
        }
        confirmText="Yes, Cancel Registration"
        confirmVariant="destructive"
        isLoading={cancelMutation.isPending}
        onConfirm={confirmCancel}
      />
    </>
  );
}
