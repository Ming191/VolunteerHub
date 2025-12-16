import { useState } from 'react';
import AnimatedPage from '@/components/common/AnimatedPage';
import { ApiErrorState } from '@/components/ui/api-error-state';
import { EventCardSkeleton } from '../components/EventCardSkeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Search } from 'lucide-react';
import { SmartPagination } from '@/components/common/SmartPagination';
import { useGetMyRegistrationEvents } from "@/features/events/hooks/useRegistration";

type RegistrationStatus = 'APPROVED' | 'PENDING';

const EVENTS_PER_PAGE = 8;

export const MyRegistrationsScreen = () => {
  const [page, setPage] = useState(1);
  const [searchByName, setSearchByName] = useState('');


  // Destructure refetch
  const { data, isLoading, isError, error, refetch } = useGetMyRegistrationEvents();
  const [statusFilter, setStatusFilter] = useState<RegistrationStatus | 'ALL'>('ALL');

  if (isError) {
    return (
      <AnimatedPage>
        <div className="container mx-auto px-4 py-8 max-w-7xl">
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
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All</SelectItem>
              <SelectItem value="APPROVED">Approved</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
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



        {/* Events grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {isLoading && (
            <>
              {Array.from({ length: 8 }).map((_, i) => (
                <EventCardSkeleton key={i} />
              ))}
            </>
          )}

          {!isLoading && paginatedEvents.length === 0 ? (
            <div className="col-span-full">
              <EmptyState
                title="No Registrations Found"
                description="Try adjusting your filters or search terms."
              />
            </div>
          ) : (
            !isLoading && paginatedEvents.map((event) => (
              <div
                key={event.id}
                // ... components
                className="border rounded-lg p-4 shadow-sm bg-card hover:shadow-md transition"
              >
                <h3 className="text-lg font-semibold mb-2">{event.eventTitle}</h3>
                <p className="text-sm text-muted-foreground mb-1">📍 {event.registeredAt}</p>
                <p
                  className={`text-sm font-medium ${event.status === 'APPROVED' ? 'text-green-600' : 'text-yellow-600'
                    }`}
                >
                  {event.status}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        <SmartPagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          className="mt-8 justify-center"
        />
      </div>
    </AnimatedPage>
  );
}
