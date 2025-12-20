import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AddEventModal } from '../components/AddEventModal';
import { EventDetailSheet } from '../components/EventDetailSheet';
import { EventGrid } from '../components/EventGrid';
import AnimatedPage from '@/components/common/AnimatedPage';
import { SmartPagination } from '@/components/common/SmartPagination';
import { useMyEventsPage } from '../hooks/useMyEventsPage';
import { useState } from 'react';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";

export const MyEventsScreen = () => {
  const [updatingEventId, setUpdatingEventId] = useState<number | null>(null);

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

  // Derive processing image event IDs from backend data
  const processingImageEventIds = new Set(
    eventsData?.content.filter(event => event.imagesProcessing).map(event => event.id) || []
  );

  const handleEventUpdateStart = (eventId: number) => {
    setUpdatingEventId(eventId);
  };

  const handleEventUpdateEnd = () => {
    setUpdatingEventId(null);
  };

  const handleImageProcessingStart = (eventId: number) => {
    // No longer need manual tracking - backend will provide imagesProcessing status
    // Just trigger a refetch to get updated status
    console.log('Image processing started for event', eventId);
  };

  return (
    <AnimatedPage>
      <div className="container mx-auto px-4 py-8 max-w-7xl">

        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-4xl font-bold tracking-tight">My Events</h1>

          <div className="flex gap-2">
            {/* Sort (Optional) */}
            <Select
              value={
                filters.sort
                  ? `${filters.sort}_${filters.direction}`
                  : 'DEFAULT'
              }
              onValueChange={(value) => {
                if (value === 'DEFAULT') {
                  handleFilterChange({
                    sort: undefined,
                    direction: 'DESC',
                  });
                  return;
                }

                const [sort, direction] = value.split('_');

                handleFilterChange({
                  sort,
                  direction: direction as 'ASC' | 'DESC',
                });
              }}
            >
              <SelectTrigger className="w-full bg-background">
                <SelectValue placeholder="Sort events" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="DEFAULT">Default</SelectItem>

                <SelectItem value="eventDateTime_DESC">
                  🔽 Start Date (Newest)
                </SelectItem>
                <SelectItem value="eventDateTime_ASC">
                  🔼 Start Date (Oldest)
                </SelectItem>

                <SelectItem value="createdAt_DESC">
                  🔽 Created At (Newest)
                </SelectItem>
                <SelectItem value="createdAt_ASC">
                  🔼 Created At (Oldest)
                </SelectItem>
              </SelectContent>
            </Select>


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
          showStatus={true}
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
