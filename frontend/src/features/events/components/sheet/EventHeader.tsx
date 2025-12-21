import { SheetHeader, SheetTitle, SheetDescription } from '@/components/animate-ui/components/radix/sheet';
import { Button } from '@/components/ui/button';
import { useEventPermissions } from '../../hooks/useEventPermissions';
import type { EventResponse } from '@/api-client';

interface EventHeaderProps {
    event: EventResponse;
    onEdit: () => void;
    onDelete: () => void;
}

export function EventHeader({ event, onEdit, onDelete }: EventHeaderProps) {
    const { isOrganizer, isOwner } = useEventPermissions(event);

    return (
        <SheetHeader className="pb-4 flex flex-row justify-between items-start">
            <div className="flex flex-col">
                <SheetTitle className="text-2xl">{event.title}</SheetTitle>
                <SheetDescription>
                    Created by {event.creatorName}
                </SheetDescription>
            </div>

      <div className="flex gap-2 mt-1">
        {isOrganizer && isOwner ? (
          <>
            <Button size="sm" variant="outline" onClick={onEdit}>
              Edit
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onDelete}
              className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white transition-colors"
            >
              Delete
            </Button>
          </>
        ) : null}
      </div>
    </SheetHeader>
  );
}
