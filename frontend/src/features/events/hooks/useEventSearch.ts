import { useNavigate, useSearch } from "@tanstack/react-router";
import { useGetEvents } from "./useEvents";
import type { SearchEventsParams } from "../api/eventService";

export const EVENTS_PER_PAGE = 8;
export type FilterState = Omit<SearchEventsParams, "page" | "size">;

export const useEventSearch = () => {
  const navigate = useNavigate();
  const search = useSearch({ strict: false });

  // Default values
  const page = search.page || 1;
  const filters: FilterState = {
    q: search.q || "",
    location: search.location || "",
    tags: search.tags || [],
    upcoming: search.upcoming || false,
    matchAllTags: search.matchAllTags || false,
  };

  const {
    data: events,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetEvents({
    ...filters,
    page: page - 1, // Convert to 0-based index for the API
    size: EVENTS_PER_PAGE,
  });

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= (events?.totalPages || 1)) {
      navigate({
        to: "/events",
        search: (prev) => ({ ...prev, page: newPage }),
      });
    }
  };

  const handleFilterChange = (newFilters: FilterState) => {
    navigate({
      to: "/events",
      search: (prev) => ({ ...prev, ...newFilters, page: 1 }),
    });
  };

  const handleClearFilters = () => {
    navigate({
      to: "/events",
      search: {},
    });
  };

  return {
    events,
    isLoading,
    isError,
    error,
    refetch,
    page,
    filters,
    handlePageChange,
    handleFilterChange,
    handleClearFilters,
  };
};
