import { useState } from 'react';
import { useGetEvents } from '@/hooks/useEvents';
import EventCard from './EventCard';
import EventCardSkeleton from './EventCardSkeleton';
import EventFilterPanel from './eventsFilterPanels';
import AnimatedPage from '@/components/common/AnimatedPage';
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationLink, PaginationNext } from '@/components/ui/pagination';
import { Search } from 'lucide-react';
import type { SearchEventsParams } from '@/services/eventService';

const EVENTS_PER_PAGE = 8;

type FilterState = Omit<SearchEventsParams, 'page' | 'size'>;

export default function EventListScreen() {
    const [page, setPage] = useState(1); // Use 1-based indexing for UI
    const [filters, setFilters] = useState<FilterState>({
        q: '',
        location: '',
        tags: [],
        upcoming: true,
        matchAllTags: false,
    });

    const { data, isLoading, isError, error } = useGetEvents({
        ...filters,
        page: page - 1, // Convert to 0-based index for the API
        size: EVENTS_PER_PAGE,
    });

    const handlePageChange = (newPage: number) => {
        if (newPage > 0 && newPage <= (data?.totalPages || 1)) {
            setPage(newPage);
        }
    };

    const handleFilterChange = (newFilters: FilterState) => {
        setFilters(newFilters);
        setPage(1); // Reset to first page when filters change
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
                    <p className="text-red-600 max-w-md">{error.message}</p>
                </div>
            );
        }

        if (!data || !data.content || data.content.length === 0) {
            return (
                <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
                    <div className="rounded-full bg-muted p-4 mb-4">
                        <Search className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No Events Found</h3>
                    <p className="text-muted-foreground max-w-md">
                        Try adjusting your filters or search criteria to find more events.
                    </p>
                </div>
            );
        }

        return data.content.map((event) => (
            <EventCard key={event.id} event={event} />
        ));
    };

    return (
        <AnimatedPage>
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                {/* Header Section */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold tracking-tight mb-2">Upcoming Events</h1>
                    <p className="text-muted-foreground text-lg">
                        Discover and join events in your community
                    </p>
                </div>

                {/* Filter Panel */}
                <div className="mb-8">
                    <EventFilterPanel onFilterChange={handleFilterChange} />
                </div>

                {/* Results Count */}
                {!isLoading && data && data.totalElements > 0 && (
                    <div className="mb-6 text-sm text-muted-foreground">
                        Showing {data.content.length} of {data.totalElements} event{data.totalElements !== 1 ? 's' : ''}
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
            </div>
        </AnimatedPage>
    );
}