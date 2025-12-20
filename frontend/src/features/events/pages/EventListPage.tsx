import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { EventListSkeleton } from "@/components/ui/loaders";
import { EmptyState } from "@/components/ui/empty-state";
import { ApiErrorState } from "@/components/ui/api-error-state";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationLink,
  PaginationNext,
} from "@/components/ui/pagination";
import { EventCard } from "../components/EventCard";
import { EventFilterPanel } from "../components/EventFilterPanel";
import { AddEventModal } from "../components/AddEventModal";
import AnimatedPage from "@/components/common/AnimatedPage";
import { HeroSection } from "@/components/common/HeroSection";
import { useEventSearch } from "../hooks/useEventSearch";
import type { UiEvent } from "@/types/ui-models";
import type { EventResponse } from "@/api-client";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";

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
    handleClearFilters,
  } = useEventSearch();

  const [selectedEvent, setSelectedEvent] = useState<EventResponse | UiEvent | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);

  const navigate = useNavigate();

  const handleViewDetails = (event: EventResponse | UiEvent) => {
    navigate({
      to: "/blog",
      search: { eventId: event.id.toString() },
    });
    setSelectedEvent(event);
    setIsDetailOpen(true);
  };

  return (
    <AnimatedPage>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Hero Section */}
        <HeroSection
          title="Discover Volunteer Opportunities"
          subtitle="Join events that match your passion and make a meaningful impact in your community."
          variant="default"
        >
          <div className="flex flex-wrap gap-4">
            <Button
              onClick={() => setIsAddEventModalOpen(true)}
              size="lg"
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Plus className="mr-2 h-5 w-5" />
              Create Event
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-2 hover:bg-green-50 hover:border-green-600 text-gray-700"
            >
              <Search className="mr-2 h-5 w-5" />
              Advanced Search
            </Button>
          </div>
        </HeroSection>

        {/* Filter Panel */}
        <div className="mb-8">
          <EventFilterPanel
            onFilterChange={handleFilterChange}
            initialFilters={filters}
          />
        </div>

        {/* Results Count */}
        {!isLoading && data && data.totalElements > 0 && (
          <div className="mb-6 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing{" "}
              <span className="font-semibold text-foreground">
                {data.content.length}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-foreground">
                {data.totalElements}
              </span>{" "}
              event{data.totalElements !== 1 ? "s" : ""}
            </div>
          </div>
        )}

        {/* Events Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {/* Loading State */}
          {isLoading && (
            <>
              {Array.from({ length: 8 }).map((_, i) => (
                <EventCardSkeleton key={i} />
              ))}
            </>
          )}

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
                <EventCard
                  key={event.id}
                  event={event}
                  onViewDetails={handleViewDetails}
                />
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
                    className={
                      page <= 1 ? "pointer-events-none opacity-50" : ""
                    }
                    aria-disabled={page <= 1}
                  />
                </PaginationItem>
                {/* Smart pagination: show max 7 pages with ellipsis */}
                {(() => {
                  const totalPages = data.totalPages || 0;
                  const pages: (number | "ellipsis")[] = [];
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
                      pages.push("ellipsis");
                    }

                    for (let i = start; i <= end; i++) {
                      pages.push(i);
                    }

                    if (end < totalPages - 1) {
                      pages.push("ellipsis");
                    }

                    pages.push(totalPages);
                  }

                  return pages.map((pageNum, index) => {
                    if (pageNum === "ellipsis") {
                      return (
                        <PaginationItem key={`ellipsis-${index}`}>
                          <span className="px-4 text-muted-foreground">
                            ...
                          </span>
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
                    className={
                      page >= (data.totalPages || 0)
                        ? "pointer-events-none opacity-50"
                        : ""
                    }
                    aria-disabled={page >= (data.totalPages || 0)}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
            <div className="flex justify-center">
              <SmartPagination
                currentPage={page}
                totalPages={data.totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          </div>
        )}

        {/* Add Event Modal */}
        <AddEventModal
          open={isAddEventModalOpen}
          onOpenChange={setIsAddEventModalOpen}
          onSuccess={() => refetch()}
        />

        {/* Event Detail Sheet */}
        <EventDetailSheet
          event={selectedEvent as EventResponse}
          isOpen={isDetailOpen}
          onOpenChange={setIsDetailOpen}
        />
      </div>
    </AnimatedPage>
  );
}
