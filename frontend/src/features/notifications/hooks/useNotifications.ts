import { useState, useRef, useCallback, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
  NotificationsApi,
  Configuration,
  type NotificationResponse,
} from "@/api-client";
import axiosInstance from "@/utils/axiosInstance";
import { toast } from "sonner";

const config = new Configuration({ basePath: "" });
const notificationsApi = new NotificationsApi(config, undefined, axiosInstance);

export const useNotifications = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");
  const [daysToLoad, setDaysToLoad] = useState(30);
  const [hasMore, setHasMore] = useState(true);
  const observerTarget = useRef<HTMLDivElement>(null);

  // Fetch notifications based on active tab
  const { data: allNotifications, isLoading: isLoadingAll } = useQuery({
    queryKey: ["allNotifications", daysToLoad],
    queryFn: async () => {
      const response = await notificationsApi.getRecentNotifications({
        pageable: { page: 0, size: 50, sort: ["createdAt,desc"] },
        days: daysToLoad,
      });
      return response.data.content || [];
    },
    enabled: activeTab === "all",
    placeholderData: [],
    staleTime: 30000,
  });

  const { data: unreadNotifications, isLoading: isLoadingUnread } = useQuery({
    queryKey: ["unreadNotifications"],
    queryFn: async () => {
      const response = await notificationsApi.getUnreadNotifications({
        pageable: { page: 0, size: 100 },
      });
      return response.data.content || [];
    },
    enabled: activeTab === "unread",
    placeholderData: [],
    staleTime: 30000,
  });

  const { data: countData } = useQuery({
    queryKey: ["notificationCount"],
    queryFn: async () => {
      const response = await notificationsApi.getUnreadNotificationCount();
      return response.data;
    },
    refetchInterval: 30000,
    staleTime: 30000,
  });

  // Mark notification as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: number) =>
      notificationsApi.markNotificationAsRead({ notificationId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allNotifications"] });
      queryClient.invalidateQueries({ queryKey: ["unreadNotifications"] });
      queryClient.invalidateQueries({ queryKey: ["notificationCount"] });
      queryClient.invalidateQueries({ queryKey: ["recentNotifications"] });
    },
  });

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: () => notificationsApi.markAllNotificationsAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allNotifications"] });
      queryClient.invalidateQueries({ queryKey: ["unreadNotifications"] });
      queryClient.invalidateQueries({ queryKey: ["notificationCount"] });
      queryClient.invalidateQueries({ queryKey: ["recentNotifications"] });
      toast.success("All notifications marked as read");
    },
  });

  // Delete notification mutation
  const deleteNotificationMutation = useMutation({
    mutationFn: (notificationId: number) =>
      notificationsApi.deleteNotification({ notificationId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allNotifications"] });
      queryClient.invalidateQueries({ queryKey: ["unreadNotifications"] });
      queryClient.invalidateQueries({ queryKey: ["notificationCount"] });
      queryClient.invalidateQueries({ queryKey: ["recentNotifications"] });
      toast.success("Notification deleted");
    },
  });

  // Load more notifications (increase days range)
  const loadMore = useCallback(() => {
    if (activeTab === "all") {
      const currentLength = allNotifications?.length || 0;
      const previousLength =
        queryClient.getQueryData<NotificationResponse[]>([
          "allNotifications",
          daysToLoad - 30,
        ])?.length || 0;

      // If we got no new notifications, we've reached the end
      if (currentLength === previousLength && daysToLoad > 30) {
        setHasMore(false);
        return;
      }

      // Stop loading after 365 days (1 year)
      if (daysToLoad >= 365) {
        setHasMore(false);
        return;
      }

      setDaysToLoad((prev) => prev + 30);
    }
  }, [activeTab, allNotifications, daysToLoad, queryClient]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          hasMore &&
          !isLoadingAll &&
          activeTab === "all"
        ) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, isLoadingAll, loadMore, activeTab]);

  const handleNotificationClick = (notification: NotificationResponse) => {
    if (!notification.isRead) {
      markAsReadMutation.mutate(notification.id);
    }
    if (notification.link) {
      navigate({ to: notification.link });
    }
  };

  const handleDelete = (e: React.MouseEvent, notificationId: number) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this notification?")) {
      deleteNotificationMutation.mutate(notificationId);
    }
  };

  return {
    activeTab,
    setActiveTab,
    allNotifications,
    unreadNotifications,
    isLoadingAll,
    isLoadingUnread,
    countData,
    daysToLoad,
    hasMore,
    observerTarget,
    markAllAsReadMutation,
    deleteNotificationMutation,
    handleNotificationClick,
    handleDelete,
  };
};
