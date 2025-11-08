import { useState } from 'react';
import { useGetEvents } from '@/hooks/useEvents';
import EventCard from './EventCard';
import EventCardSkeleton from './EventCardSkeleton';
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationLink, PaginationNext } from '@/components/ui/pagination';

const EVENTS_PER_PAGE = 8; // Or any number you prefer

export default function EventListScreen() {
    const [page, setPage] = useState(1); // Use 1-based indexing for UI

    const { data, isLoading, isError, error } = useGetEvents({
        page: page - 1, // Convert to 0-based index for the API
        size: EVENTS_PER_PAGE,
    });

    const handlePageChange = (newPage: number) => {
        if (newPage > 0 && newPage <= (data?.totalPages || 1)) {
            setPage(newPage);
        }
    };

    const renderContent = () => {
        if (isLoading) {
            return (
                // Render a grid of skeletons
                Array.from({ length: EVENTS_PER_PAGE }).map((_, index) => (
                    <EventCardSkeleton key={index} />
                ))
            );
        }

        if (isError) {
            return (
                <div className="col-span-full text-center text-red-500">
                    <p>Failed to load events: {error.message}</p>
                </div>
            );
        }

        if (!data || !data.content || data.content.length === 0) {
            return (
                <div className="col-span-full text-center text-gray-500">
                    <p>No events found.</p>
                </div>
            );
        }

        return (
            // Render the grid of actual event cards
            (data.content || []).map((event) => (
                <EventCard key={event.id} event={event} />
            ))
        );
    };

    return (
        <div className="container mx-auto py-8">
            <div className="mb-8">
                <h1 className="text-4xl font-bold">Upcoming Events</h1>
                <p className="text-muted-foreground">
                    Discover and join events in your community.
                </p>
            </div>

            {/* We will add the filter panel here in a later step */}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {renderContent()}
            </div>

            {data && data.totalPages && data.totalPages > 1 && (
                <div className="mt-8">
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
                                    // Show all pages
                                    for (let i = 1; i <= totalPages; i++) {
                                        pages.push(i);
                                    }
                                } else {
                                    // Always show first page
                                    pages.push(1);

                                    // Calculate range around current page
                                    const start = Math.max(2, page - 1);
                                    const end = Math.min(totalPages - 1, page + 1);

                                    // Add ellipsis after first page if needed
                                    if (start > 2) {
                                        pages.push('ellipsis');
                                    }

                                    // Add pages around current page
                                    for (let i = start; i <= end; i++) {
                                        pages.push(i);
                                    }

                                    // Add ellipsis before last page if needed
                                    if (end < totalPages - 1) {
                                        pages.push('ellipsis');
                                    }

                                    // Always show last page
                                    pages.push(totalPages);
                                }

                                return pages.map((pageNum, index) => {
                                    if (pageNum === 'ellipsis') {
                                        return (
                                            <PaginationItem key={`ellipsis-${index}`}>
                                                <span className="px-4">...</span>
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
    );
}