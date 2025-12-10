import { useState } from 'react';
import { useGetMyEvents } from '../hooks/useMyEvents';
import EventCard from '../components/EventCard';
import EventCardSkeleton from '../components/EventCardSkeleton';
import EventDetailSheet from '../components/EventDetailSheet';
import AnimatedPage from '@/components/common/AnimatedPage';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationLink,
  PaginationNext
} from '@/components/ui/pagination';
import type { EventResponse } from '@/api-client';
import { Search } from 'lucide-react';

const EVENTS_PER_PAGE = 8;

// Only sort/direction allowed by backend
type MyFilterState = {
  sort?: string;
  direction?: 'ASC' | 'DESC';
};

export default function MyEventsScreen() {
  const [page, setPage] = useState(1);
  const [selectedEvent, setSelectedEvent] = useState<EventResponse | null>(null);
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);

  const [filters, setFilters] = useState<MyFilterState>({
    sort: undefined,
    direction: 'DESC',
  });

  const { data, isLoading, isError, error } = useGetMyEvents({
    page: page - 1,
    size: EVENTS_PER_PAGE,
    sort: filters.sort,
    direction: filters.direction,
  });

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= (data?.totalPages || 1)) {
      setPage(newPage);
    }
  };

  const handleViewDetails = (event: EventResponse) => {
    setSelectedEvent(event);
    setIsDetailSheetOpen(true);
  };

  const renderContent = () => {
    if (isLoading) {
      return Array.from({ length: EVENTS_PER_PAGE }).map((_, index) => (
        <EventCardSkeleton key={index} />
      ));
    }

    if (isError) {
      return (
        <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
          <div className="rounded-full bg-red-100 p-4 mb-4">
            <Search className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-red-900 mb-2">Failed to Load Events</h3>
          <p className="text-red-600 max-w-md">{String(error?.message)}</p>
        </div>
      );
    }

    if (!data || !data.content || data.content.length === 0) {
      return (
        <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
          <div className="rounded-full bg-muted p-4 mb-4">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">You have no events</h3>
        </div>
      );
    }

    return data.content.map((event) => (
      <EventCard key={event.id} event={event} onViewDetails={handleViewDetails} />
    ));
  };

  return (
    <AnimatedPage>
      <div className="container mx-auto px-4 py-8 max-w-7xl">

        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-4xl font-bold tracking-tight">My Events</h1>

          {/* Sort (Optional) */}
          <select
            className="border rounded-lg px-3 py-2"
            value={filters.sort || ''}
            onChange={(e) =>
              setFilters({
                ...filters,
                sort: e.target.value || undefined,
              })
            }
          >
            <option value="">Sort by</option>
            <option value="startDate">Start Date</option>
            <option value="createdAt">Created At</option>
          </select>
        </div>

        {/* Count */}
        {!isLoading && data && data.totalElements > 0 && (
          <div className="mb-6 text-sm text-muted-foreground">
            Showing {data.content.length} of {data.totalElements} events
          </div>
        )}

        {/* Events Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {renderContent()}
        </div>

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="flex justify-center">
            <Pagination>
              <PaginationContent>
                {/* Previous */}
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageChange(page - 1);
                    }}
                    className={page <= 1 ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>

                {/* Page numbers */}
                {(() => {
                  const totalPages = data.totalPages;
                  const pageItems: (number | 'ellipsis')[] = [];
                  const maxVisible = 7;

                  if (totalPages <= maxVisible) {
                    for (let i = 1; i <= totalPages; i++) pageItems.push(i);
                  } else {
                    pageItems.push(1);
                    const start = Math.max(2, page - 1);
                    const end = Math.min(totalPages - 1, page + 1);

                    if (start > 2) pageItems.push('ellipsis');
                    for (let i = start; i <= end; i++) pageItems.push(i);
                    if (end < totalPages - 1) pageItems.push('ellipsis');
                    pageItems.push(totalPages);
                  }

                  return pageItems.map((item, idx) =>
                    item === 'ellipsis' ? (
                      <PaginationItem key={`ellipsis-${idx}`}>
                        <span className="px-4 text-muted-foreground">...</span>
                      </PaginationItem>
                    ) : (
                      <PaginationItem key={item}>
                        <PaginationLink
                          href="#"
                          isActive={page === item}
                          onClick={(e) => {
                            e.preventDefault();
                            handlePageChange(item);
                          }}
                        >
                          {item}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  );
                })()}

                {/* Next */}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageChange(page + 1);
                    }}
                    className={page >= data.totalPages ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}

        {/* Detail Sheet */}
        <EventDetailSheet
          event={selectedEvent}
          isOpen={isDetailSheetOpen}
          onOpenChange={setIsDetailSheetOpen}
        />
      </div>
    </AnimatedPage>
  );
}
