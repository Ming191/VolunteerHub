import { useState } from 'react';
import { EventListSkeleton } from '@/components/ui/loaders';
import { EmptyState } from '@/components/ui/empty-state';
import { ApiErrorState } from '@/components/ui/api-error-state';
import { SmartPagination } from '@/components/common/SmartPagination';
import { EventCard } from '../components/EventCard';
import { EventFilterPanel } from '../components/EventFilterPanel';
import { AddEventModal } from '../components/AddEventModal';
import { EventDetailSheet } from '../components/EventDetailSheet';
import AnimatedPage from '@/components/common/AnimatedPage';
import { useEventSearch } from '../hooks/useEventSearch';
import type { UiEvent } from '@/types/ui-models';
import type { EventResponse } from '@/api-client';

export const EventListScreen = () => {
  const {
    events: data,
    isLoading,
    isError,
    error,
    refetch,
    page,
    filters,
    handlePageChange,
    handleFilterChange,
    handleClearFilters
  } = useEventSearch();

  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventResponse | null>(null);
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);


  const handleViewDetails = (event: EventResponse | UiEvent) => {
    setSelectedEvent(event as EventResponse);
    setIsDetailSheetOpen(true);
  };

  return (
    <AnimatedPage>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Filter Panel */}
        <div className="mb-8">
          <EventFilterPanel onFilterChange={handleFilterChange} initialFilters={filters} />
        </div>

        {/* Results Count */}
        {!isLoading && data && data.totalElements > 0 && (
          <div className="mb-6 text-sm text-muted-foreground">
            Showing {data.content.length} of {data.totalElements} event{data.totalElements !== 1 ? 's' : ''}
          </div>
        )}

        {/* Events Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {/* Loading State */}
          {isLoading && <EventListSkeleton count={8} />}

          {/* Error State */}
          {isError && (
            <div className="col-span-full">
              <ApiErrorState error={error} onRetry={refetch} />
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !isError && data && data.content.length === 0 && (
            <div className="col-span-full">
              <EmptyState
                title="No events found"
                description="Try adjusting your filters or search terms."
                actionLabel="Clear Filters"
                onAction={handleClearFilters}
              />
            </div>
          )}

          {/* Events List */}
          {!isLoading && !isError && data && data.content.length > 0 && (
            <>
              {data.content.map((event) => (
                <EventCard key={event.id} event={event} onViewDetails={handleViewDetails} />
              ))}
            </>
          )}
        </div>

        {/* Pagination */}
        <SmartPagination
          currentPage={page}
          totalPages={data?.totalPages || 0}
          onPageChange={handlePageChange}
          className="mt-8"
        />

        {/* Event Detail Sheet */}
        <EventDetailSheet
          event={selectedEvent}
          isOpen={isDetailSheetOpen}
          onOpenChange={setIsDetailSheetOpen}
        />

        {/* Add Event Modal */}
        <AddEventModal
          open={isAddEventModalOpen}
          onOpenChange={setIsAddEventModalOpen}
          onSuccess={() => refetch()}
        />
      </div>
    </AnimatedPage>
  );
}
