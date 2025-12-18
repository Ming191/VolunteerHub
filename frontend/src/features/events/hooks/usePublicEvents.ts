import { useQuery } from "@tanstack/react-query";
import type { EventResponse } from "@/api-client";
import { EventsApi, Configuration } from "@/api-client";
import axiosInstance from "@/utils/axiosInstance";

const config = new Configuration({ basePath: "" });
const eventsApi = new EventsApi(config, undefined, axiosInstance);

export const usePublicEvents = () => {
  return useQuery<EventResponse[]>({
    queryKey: ["publicEvents"],
    queryFn: async () => {
      const response = await eventsApi.searchEvents({
        upcoming: true,
        page: 0,
        size: 10,
      });
      return response.data.content || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
