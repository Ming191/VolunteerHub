import { Users } from 'lucide-react';
import type { EventResponse } from '@/api-client';

interface EventParticipationProps {
    event: EventResponse;
}

export function EventParticipation({ event }: EventParticipationProps) {
  return (
    <div className="space-y-3">
      <h3 className="font-semibold flex items-center gap-2">
        <Users className="h-5 w-5" />
        Participation
      </h3>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-muted/50 p-3 rounded-lg border border-black">
          <p className="text-sm text-muted-foreground">Max Participants</p>
          <p className="text-2xl font-bold">
            {event.maxParticipants || 'Unlimited'}
          </p>
        </div>

        <div className="bg-muted/50 p-3 rounded-lg border border-black">
          <p className="text-sm text-muted-foreground">Available Spots</p>
          <p className="text-2xl font-bold">
            {event.availableSpots !== undefined ? event.availableSpots : '∞'}
          </p>
        </div>

        <div className="bg-muted/50 p-3 rounded-lg border border-black">
          <p className="text-sm text-muted-foreground">Approved</p>
          <p className="text-2xl font-bold text-green-600">
            {event.approvedCount}
          </p>
        </div>

        <div className="bg-muted/50 p-3 rounded-lg border border-black">
          <p className="text-sm text-muted-foreground">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">
            {event.pendingCount}
          </p>
        </div>

        {event.waitlistEnabled && (
          <div className="bg-muted/50 p-3 rounded-lg border border-black col-span-2">
            <p className="text-sm text-muted-foreground">Waitlist</p>
            <p className="text-2xl font-bold text-blue-600">
              {event.waitlistCount}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
