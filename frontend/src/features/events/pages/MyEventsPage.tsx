import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AddEventModal } from '../components/AddEventModal';
import { EventDetailSheet } from '../components/EventDetailSheet';
import { EventGrid } from '../components/EventGrid';
import AnimatedPage from '@/components/common/AnimatedPage';
import { SmartPagination } from '@/components/common/SmartPagination';
import { useMyEventsPage } from '../hooks/useMyEventsPage';
import { useState, useRef, useEffect } from 'react';

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

  return (
    <AnimatedPage>
      <div className="container mx-auto px-4 py-8 max-w-7xl">

        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-4xl font-bold tracking-tight">My Events</h1>

          <div className="flex gap-2">
            {/* Sort (Optional) */}
            <select
              className="border rounded-lg px-3 py-2"
              value={filters.sort || ''}
              onChange={(e) => handleFilterChange({ sort: e.target.value || undefined })}
            >
              <option value="">Sort by</option>
              <option value="eventDateTime">Start Date</option>
              <option value="createdAt">Created At</option>
            </select>

            <Button onClick={() => setIsCreateModalOpen(true)}>
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
