import { useState } from 'react';
import AnimatedPage from '@/components/common/AnimatedPage.tsx';
import { ApiErrorState } from '@/components/ui/api-error-state.tsx';
import { Input } from '@/components/ui/input.tsx';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select.tsx';
import { Search } from 'lucide-react';
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationLink, PaginationNext } from '@/components/ui/pagination.tsx';
import { useGetMyRegistrationEvents } from "@/features/volunteer/hooks/useRegistration.ts";
import {EventDetailSheet} from "@/features/events/components/EventDetailSheet.tsx";
import { RegistrationCard } from "@/features/events/components/RegistrationCard.tsx";
import type { EventResponse } from "@/api-client";
import { eventService } from "@/features/events/api/eventService.ts"; // giả sử bạn export sẵn

type RegistrationStatus = 'APPROVED' | 'PENDING' | 'COMPLETED' | 'CANCELLED';

const EVENTS_PER_PAGE = 8;

export const MyRegistrationsScreen = () => {
  const [page, setPage] = useState(1);
  const [searchByName, setSearchByName] = useState('');


  // Destructure refetch
  const { data, isLoading, isError, error, refetch } = useGetMyRegistrationEvents();
  const [statusFilter, setStatusFilter] = useState<RegistrationStatus | 'ALL'>('ALL');
  const [selectedEvent, setSelectedEvent] = useState<EventResponse | null>(null);
  const [isDetailOpen, setDetailOpen] = useState(false);

  if (isError) {
    return (
      <AnimatedPage>
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <ApiErrorState error={error} onRetry={refetch} />
        </div>
      </AnimatedPage>
    );
  }

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error: {error.message}</div>;

  const filteredEvents = data?.filter((event) => {
    const matchesSearchByName = event.eventTitle.toLowerCase().includes(searchByName.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || event.status === statusFilter;
    return matchesSearchByName && matchesStatus;
  }) ?? [];

  const totalPages = Math.ceil(filteredEvents.length / EVENTS_PER_PAGE);
  const paginatedEvents = filteredEvents.slice((page - 1) * EVENTS_PER_PAGE, page * EVENTS_PER_PAGE);

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const handleSelectEvent = async (eventId: number) => {
    try {
      const eventDetail = await eventService.getEventById(eventId);
      setSelectedEvent(eventDetail);
      setDetailOpen(true);
    } catch (err) {
      console.error("Failed to load event detail", err);
    }
  };

  return (
    <AnimatedPage>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-2">My Registrations</h1>
          <p className="text-muted-foreground text-lg">List events you registered</p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 w-full sm:w-1/2">
            <Search className="h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search by name..."
              value={searchByName}
              onChange={(e) => {
                setSearchByName(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <Select
            value={statusFilter}
            onValueChange={(val) => {
              setStatusFilter(val as RegistrationStatus | 'ALL');
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All</SelectItem>
              <SelectItem value="APPROVED">Approved</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Results count */}
        {filteredEvents.length > 0 && (
          <div className="mb-6 text-sm text-muted-foreground">
            Showing {paginatedEvents.length} of {filteredEvents.length} registration
            {filteredEvents.length !== 1 ? 's' : ''}
          </div>
        )}

        {/* Events list */}
        <div className="space-y-4 mb-8">
          {paginatedEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="rounded-full bg-muted p-4 mb-4">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No Registrations Found</h3>
              <p className="text-muted-foreground max-w-md">
                Try changing your search filters or keywords.
              </p>
            </div>
          ) : (
            paginatedEvents.map((registration) => (
              <RegistrationCard
                key={registration.id}
                registration={registration}
                onClick={() => handleSelectEvent(registration.eventId)}
              />
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center">
            <Pagination>
              <PaginationContent>
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
                {Array.from({ length: totalPages }).map((_, i) => (
                  <PaginationItem key={i + 1}>
                    <PaginationLink
                      href="#"
                      isActive={page === i + 1}
                      onClick={(e) => {
                        e.preventDefault();
                        handlePageChange(i + 1);
                      }}
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageChange(page + 1);
                    }}
                    className={page >= totalPages ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}

        {/* Event detail sheet */}
        <EventDetailSheet
          event={selectedEvent}
          isOpen={isDetailOpen}
          onOpenChange={setDetailOpen}
        />
      </div>
    </AnimatedPage>
  );
}
