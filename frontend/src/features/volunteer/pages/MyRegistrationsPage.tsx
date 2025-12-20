import { useState } from 'react';
import AnimatedPage from '@/components/common/AnimatedPage.tsx';
import { ApiErrorState } from '@/components/ui/api-error-state.tsx';
import { Input } from '@/components/ui/input.tsx';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select.tsx';
import { Search, Filter } from 'lucide-react';
import { useGetMyRegistrationEvents } from "@/features/volunteer/hooks/useRegistration.ts";
import { EventDetailSheet } from "@/features/events/components/EventDetailSheet.tsx";
import { RegistrationCard } from "@/features/events/components/RegistrationCard.tsx";
import type { EventResponse } from "@/api-client";
import { eventService } from "@/features/events/api/eventService.ts";
import { SmartPagination } from "@/components/common/SmartPagination.tsx";

type RegistrationStatus = 'APPROVED' | 'PENDING' | 'COMPLETED' | 'CANCELLED';

const EVENTS_PER_PAGE = 8;

export const MyRegistrationsScreen = () => {
  const [page, setPage] = useState(1);
  const [searchByName, setSearchByName] = useState('');

  const { data, isLoading, isError, error, refetch } = useGetMyRegistrationEvents();
  const [statusFilter, setStatusFilter] = useState<RegistrationStatus | 'ALL'>('ALL');
  const [selectedEvent, setSelectedEvent] = useState<EventResponse | null>(null);
  const [isDetailOpen, setDetailOpen] = useState(false);

  if (isError) {
    return (
      <AnimatedPage>
        <div className="container mx-auto px-4 py-8 max-w-7xl flex items-center justify-center min-h-[50vh]">
          <ApiErrorState error={error} onRetry={refetch} />
        </div>
      </AnimatedPage>
    );
  }

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
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
      <div className="container mx-auto px-4 py-8 max-w-7xl min-h-screen flex flex-col">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-1">My Registrations</h1>
            <p className="text-muted-foreground">Manage your event registrations and track status</p>
          </div>
          {filteredEvents.length > 0 && (
            <div className="text-sm font-medium bg-muted/50 px-3 py-1 rounded-md text-muted-foreground">
              {filteredEvents.length} Registration{filteredEvents.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="bg-card border rounded-xl p-4 mb-8 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search events..."
                className="pl-9 bg-background"
                value={searchByName}
                onChange={(e) => {
                  setSearchByName(e.target.value);
                  setPage(1);
                }}
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="h-4 w-4 text-muted-foreground hidden sm:block" />
              <Select
                value={statusFilter}
                onValueChange={(val) => {
                  setStatusFilter(val as RegistrationStatus | 'ALL');
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-full sm:w-[180px] bg-background">
                  <SelectValue placeholder="Filter by Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Statuses</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-72 bg-muted/20 rounded-xl animate-pulse border" />
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed rounded-xl bg-muted/10 mx-auto w-full max-w-2xl">
            <div className="rounded-full bg-muted/50 p-6 mb-4">
              <Search className="h-10 w-10 text-muted-foreground/50" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No registrations found</h3>
            <p className="text-muted-foreground max-w-sm mx-auto">
              {searchByName || statusFilter !== 'ALL'
                ? "Try adjusting your search or filters to find what you're looking for."
                : "You haven't registered for any events yet."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {paginatedEvents.map((registration) => (
              <RegistrationCard
                key={registration.id}
                registration={registration}
                onClick={() => handleSelectEvent(registration.eventId)}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-auto pt-8 flex justify-center">
            <SmartPagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}

        {/* Event Detail Sheet */}
        <EventDetailSheet
          event={selectedEvent}
          isOpen={isDetailOpen}
          onOpenChange={setDetailOpen}
        />
      </div>
    </AnimatedPage>
  );
}
