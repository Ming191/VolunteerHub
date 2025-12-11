import { useState } from 'react';
import { EventListSkeleton } from '@/components/ui/loaders';
import { EmptyState } from '@/components/ui/empty-state';
import { ApiErrorState } from '@/components/ui/api-error-state';
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationLink, PaginationNext } from '@/components/ui/pagination';
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
        {data && data.totalPages > 1 && (
          <div className="flex justify-center">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    size="default"
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageChange(page - 1);
                    }}
                    className={page <= 1 ? 'pointer-events-none opacity-50' : ''}
                    aria-disabled={page <= 1}
                  />
                </PaginationItem>
                {/* Smart pagination: show max 7 pages with ellipsis */}
                {(() => {
                  const totalPages = data.totalPages || 0;
                  const pages: (number | 'ellipsis')[] = [];
                  const maxVisible = 7;

                  if (totalPages <= maxVisible) {
                    for (let i = 1; i <= totalPages; i++) {
                      pages.push(i);
                    }
                  } else {
                    pages.push(1);
                    const start = Math.max(2, page - 1);
                    const end = Math.min(totalPages - 1, page + 1);

                    if (start > 2) {
                      pages.push('ellipsis');
                    }

                    for (let i = start; i <= end; i++) {
                      pages.push(i);
                    }

                    if (end < totalPages - 1) {
                      pages.push('ellipsis');
                    }

                    pages.push(totalPages);
                  }

                  return pages.map((pageNum, index) => {
                    if (pageNum === 'ellipsis') {
                      return (
                        <PaginationItem key={`ellipsis-${index}`}>
                          <span className="px-4 text-muted-foreground">...</span>
                        </PaginationItem>
                      );
                    }

                    return (
                      <PaginationItem key={pageNum}>
                        <PaginationLink
                          size="default"
                          href="#"
                          isActive={page === pageNum}
                          onClick={(e) => {
                            e.preventDefault();
                            handlePageChange(pageNum);
                          }}
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  });
                })()}
                <PaginationItem>
                  <PaginationNext
                    size="default"
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageChange(page + 1);
                    }}
                    className={page >= (data.totalPages || 0) ? 'pointer-events-none opacity-50' : ''}
                    aria-disabled={page >= (data.totalPages || 0)}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}

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
