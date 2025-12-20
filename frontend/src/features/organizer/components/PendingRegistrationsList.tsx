import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Clock, Users } from "lucide-react";
import { formatDistanceToNowUTC } from "@/lib/dateUtils";

// Based on usage in OrganizerDashboard.tsx
interface PendingRegistration {
  id: number;
  primaryText: string;
  secondaryText: string;
  timestamp: string; // or Date
}

interface PendingRegistrationsListProps {
  registrations: PendingRegistration[];
  onRegistrationClick: () => void;
}

export const PendingRegistrationsList = ({
  registrations,
  onRegistrationClick,
}: PendingRegistrationsListProps) => {
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle className="text-base">Pending Registrations</CardTitle>
        <CardDescription>
          {registrations.length} volunteers waiting for approval
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-[300px] overflow-y-auto">
          {registrations.map((registration) => (
            <div
              key={registration.id}
              className="p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
              onClick={onRegistrationClick}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-sm">
                    {registration.primaryText}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {registration.secondaryText}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {(() => {
                    try {
                      const date = registration.timestamp
                        ? new Date(registration.timestamp)
                        : new Date();
                      if (isNaN(date.getTime())) return "Recently";
                      return formatDistanceToNowUTC(registration.timestamp, {
                        addSuffix: true,
                      });
                    } catch {
                      return "Recently";
                    }
                  })()}
                </div>
              </div>
            </div>
          ))}
          {registrations.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No pending registrations</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
