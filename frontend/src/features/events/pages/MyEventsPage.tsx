import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AddEventModal } from '../components/AddEventModal';
import { EventDetailSheet } from '../components/EventDetailSheet';
import { EventGrid } from '../components/EventGrid';
import AnimatedPage from '@/components/common/AnimatedPage';
import { SmartPagination } from '@/components/common/SmartPagination';
import { useMyEventsPage } from '../hooks/useMyEventsPage';

export const MyEventsScreen = () => {
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
