import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type {RegistrationResponse} from "@/api-client";

type ActionType = "APPROVED" | "REJECTED" | "COMPLETED";

interface EventRegistrationCardProps {
  registration: RegistrationResponse
  onAction: (
    id: number,
    volunteerName: string,
    action: ActionType
  ) => void;
}

export function EventRegistrationCard({
                                        registration,
                                        onAction,
                                      }: EventRegistrationCardProps) {
  const { status } = registration;

  // COMPLETED → disable context menu
  const enableContextMenu = status !== "COMPLETED";

  const renderActions = () => {
    switch (status) {
      case "PENDING":
        return (
          <>
            <DropdownMenuItem
              onClick={() =>
                onAction(registration.id, registration.volunteerName, "APPROVED")
              }
            >
              Approve
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive"
              onClick={() =>
                onAction(registration.id, registration.volunteerName, "REJECTED")
              }
            >
              Reject
            </DropdownMenuItem>
          </>
        );

      case "REJECTED":
        return (
          <DropdownMenuItem
            onClick={() =>
              onAction(registration.id, registration.volunteerName, "APPROVED")
            }
          >
            Approve
          </DropdownMenuItem>
        );

      case "APPROVED":
        return (
          <>
            <DropdownMenuItem
              className="text-destructive"
              onClick={() =>
                onAction(registration.id, registration.volunteerName, "REJECTED")
              }
            >
              Reject
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                onAction(
                  registration.id,
                  registration.volunteerName,
                  "COMPLETED"
                )
              }
            >
              Mark as completed
            </DropdownMenuItem>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={!enableContextMenu}>
        <div
          onContextMenu={(e) => {
            if (!enableContextMenu) return;
            e.preventDefault(); // chặn menu mặc định của browser
          }}
          className="p-3 border rounded-lg cursor-context-menu"
        >
          <div className="flex justify-between items-start">
            {/* Info */}
            <div>
              <h4 className="font-medium">
                {registration.volunteerName}
              </h4>
              <p className="text-sm text-muted-foreground">
                Status: {registration.status}
              </p>
              <p className="text-sm text-muted-foreground">
                Registered:{" "}
                {format(new Date(registration.registeredAt), "PPpp")}
              </p>
            </div>
          </div>
        </div>
      </DropdownMenuTrigger>

      {enableContextMenu && (
        <DropdownMenuContent align="start">
          {renderActions()}
        </DropdownMenuContent>
      )}
    </DropdownMenu>
  );
}
