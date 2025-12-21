import {ArrowDown, ArrowUp, Check, ListFilter, Plus} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AddEventModal } from '../components/AddEventModal';
import { EventDetailSheet } from '../components/EventDetailSheet';
import { EventGrid } from '../components/EventGrid';
import AnimatedPage from '@/components/common/AnimatedPage';
import { SmartPagination } from '@/components/common/SmartPagination';
import { useMyEventsPage } from '../hooks/useMyEventsPage';
import { useState, useRef, useEffect } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

export const MyEventsScreen = () => {
  const [updatingEventId, setUpdatingEventId] = useState<number | null>(null);
  const [processingImageEventIds, setProcessingImageEventIds] = useState<Set<number>>(new Set());
  const timeoutIdsRef = useRef<Map<number, number>>(new Map());

  const {
    page,
    filters,
    selectedEvent,
    isDetailSheetOpen,
    isCreateModalOpen,
    eventsData,
    isLoading,
    isError,
    error,
    handlePageChange,
    setIsDetailSheetOpen,
    setIsCreateModalOpen,
    handleViewDetails,
    handleCreateSuccess,
    handleFilterChange
  } = useMyEventsPage();

  useEffect(() => {
    const timeoutIds = timeoutIdsRef.current;
    return () => {
      timeoutIds.forEach((timeoutId) => {
        clearTimeout(timeoutId);
      });
      timeoutIds.clear();
    };
  }, []);

  const handleEventUpdateStart = (eventId: number) => {
    setUpdatingEventId(eventId);
  };

  const handleEventUpdateEnd = () => {
    setUpdatingEventId(null);
  };

  const handleImageProcessingStart = (eventId: number) => {
    // Clear existing timeout for this event if any
    const existingTimeoutId = timeoutIdsRef.current.get(eventId);
    if (existingTimeoutId !== undefined) {
      clearTimeout(existingTimeoutId);
    }

    setProcessingImageEventIds(prev => new Set(prev).add(eventId));

    // Automatically remove after 30 seconds as fallback
    const timeoutId = setTimeout(() => {
      setProcessingImageEventIds(prev => {
        const next = new Set(prev);
        next.delete(eventId);
        return next;
      });
      timeoutIdsRef.current.delete(eventId);
    }, 30000);

    timeoutIdsRef.current.set(eventId, timeoutId as unknown as number);
  };

  const isActiveSort = (
    sort?: string,
    direction?: 'ASC' | 'DESC'
  ) => {
    if (!filters.sort) return !sort;
    return filters.sort === sort && filters.direction === direction;
  };

  return (
    <AnimatedPage>
      <div className="container mx-auto px-4 py-8 max-w-7xl">

        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-4xl font-bold tracking-tight">My Events</h1>

          <div className="flex gap-2">
            {/* Sort (Optional) */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <ListFilter className="h-4 w-4" />
                  Sort Events
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-64">

                {/* Default */}
                <DropdownMenuItem
                  onClick={() =>
                    handleFilterChange({ sort: undefined, direction: 'DESC' })
                  }
                  className="flex items-center justify-between"
                >
                  Default
                  {isActiveSort() && <Check className="h-4 w-4 text-primary" />}
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                {/* Start Date */}
                <DropdownMenuItem
                  onClick={() =>
                    handleFilterChange({ sort: 'eventDateTime', direction: 'DESC' })
                  }
                  className="flex items-center justify-between"
                >
      <span className="flex items-center gap-2">
        <ArrowDown className="h-4 w-4" />
        Start Date (Newest)
      </span>
                  {isActiveSort('eventDateTime', 'DESC') && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() =>
                    handleFilterChange({ sort: 'eventDateTime', direction: 'ASC' })
                  }
                  className="flex items-center justify-between"
                >
      <span className="flex items-center gap-2">
        <ArrowUp className="h-4 w-4" />
        Start Date (Oldest)
      </span>
                  {isActiveSort('eventDateTime', 'ASC') && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                {/* Created At */}
                <DropdownMenuItem
                  onClick={() =>
                    handleFilterChange({ sort: 'createdAt', direction: 'DESC' })
                  }
                  className="flex items-center justify-between"
                >
      <span className="flex items-center gap-2">
        <ArrowDown className="h-4 w-4" />
        Created At (Newest)
      </span>
                  {isActiveSort('createdAt', 'DESC') && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() =>
                    handleFilterChange({ sort: 'createdAt', direction: 'ASC' })
                  }
                  className="flex items-center justify-between"
                >
      <span className="flex items-center gap-2">
        <ArrowUp className="h-4 w-4" />
        Created At (Oldest)
      </span>
                  {isActiveSort('createdAt', 'ASC') && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </DropdownMenuItem>

              </DropdownMenuContent>
            </DropdownMenu>



            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="border-2 border-green-600 bg-green-600 hover:bg-green-700 hover:border-green-700 text-white"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Event
            </Button>
          </div>
        </div>

        {/* Count */}
        {!isLoading && eventsData && eventsData.totalElements > 0 && (
          <div className="mb-6 text-sm text-muted-foreground">
            Showing {eventsData.content.length} of {eventsData.totalElements} events
          </div>
        )}

        {/* Events Grid */}
        <EventGrid
          isLoading={isLoading}
          isError={isError}
          error={error}
          events={eventsData?.content || []}
          onViewDetails={handleViewDetails}
          emptyStateTitle="You have no events"
          emptyStateDescription="Created events will appear here."
          updatingEventId={updatingEventId}
          processingImageEventIds={processingImageEventIds}
        />

        {/* Pagination */}
        {eventsData && (
          <div className="flex justify-center">
            <SmartPagination
              currentPage={page}
              totalPages={eventsData.totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}

        {/* Detail Sheet */}
        <EventDetailSheet
          event={selectedEvent}
          isOpen={isDetailSheetOpen}
          onOpenChange={setIsDetailSheetOpen}
          onEventUpdateStart={handleEventUpdateStart}
          onEventUpdateEnd={handleEventUpdateEnd}
          onImageProcessingStart={handleImageProcessingStart}
        />

        {/* Create Event Modal */}
        <AddEventModal
          open={isCreateModalOpen}
          onOpenChange={setIsCreateModalOpen}
          onSuccess={handleCreateSuccess}
        />
      </div>
    </AnimatedPage>
  );
};
