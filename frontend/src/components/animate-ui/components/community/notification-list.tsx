"use client";

import * as React from "react";
import { ArrowUpRight, Bell, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
  NotificationsApi,
  Configuration,
  type NotificationResponse,
} from "@/api-client";
import axiosInstance from "@/utils/axiosInstance";
import { formatDistanceToNowUTC } from "@/lib/dateUtils";
import { Button } from "@/components/ui/button";

const config = new Configuration({ basePath: "" });
const notificationsApi = new NotificationsApi(config, undefined, axiosInstance);

function NotificationList() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Fetch unread notifications count
  const { data: countData } = useQuery({
    queryKey: ["notificationCount"],
    queryFn: async () => {
      const response = await notificationsApi.getUnreadNotificationCount();
      return response.data;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Fetch recent notifications (limit to 5 for the dropdown)
  const { data: notifications, isLoading } = useQuery<NotificationResponse[]>({
    queryKey: ["recentNotifications"],
    queryFn: async () => {
      const response = await notificationsApi.getRecentNotifications({
        days: 7,
        pageable: { page: 0, size: 5 },
      });
      return (response.data.content || []).slice(0, 5); // Only show first 5
    },
    refetchInterval: 30000,
    initialData: [],
  });

  // Mark notification as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: number) =>
      notificationsApi.markNotificationAsRead({ notificationId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recentNotifications"] });
      queryClient.invalidateQueries({ queryKey: ["notificationCount"] });
    },
  });

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: () => notificationsApi.markAllNotificationsAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recentNotifications"] });
      queryClient.invalidateQueries({ queryKey: ["notificationCount"] });
    },
  });

  const handleNotificationClick = (notification: NotificationResponse) => {
    if (!notification.isRead) {
      markAsReadMutation.mutate(notification.id);
    }
    setIsOpen(false);
    if (notification.link) {
      navigate({ to: notification.link });
    }
  };

  const unreadCount = countData?.count || 0;
  const displayNotifications = notifications || [];
  const hasUnread = displayNotifications.some((n) => !n.isRead);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell icon trigger button */}
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="h-5 w-5" />
      </Button>

      {unreadCount > 0 && (
        <span
          className="absolute -top-1 -right-1 size-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-medium cursor-pointer z-10"
          onClick={() => setIsOpen(!isOpen)}
        >
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}

      {/* Dropdown panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl overflow-hidden z-[60] backdrop-blur-sm"
            style={{ maxHeight: "calc(100vh - 180px)" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="size-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-medium">
                    {unreadCount}
                  </span>
                )}
              </div>
              {hasUnread && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    markAllAsReadMutation.mutate();
                  }}
                  className="text-xs text-blue-500 hover:text-blue-600 font-medium"
                  disabled={markAllAsReadMutation.isPending}
                >
                  Mark all read
                </button>
              )}
            </div>

            {/* Notifications list */}
            <div className="max-h-[50vh] overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : displayNotifications.length === 0 ? (
                <div className="text-center py-12 text-sm text-muted-foreground">
                  No notifications yet
                </div>
              ) : (
                displayNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer border-b border-gray-200 dark:border-gray-700 last:border-b-0 transition-colors ${!notification.isRead
                      ? "bg-blue-50 dark:bg-blue-950/30"
                      : "bg-white dark:bg-gray-900"
                      }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium line-clamp-2">
                          {notification.content}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNowUTC(notification.createdAt, {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                      {!notification.isRead && (
                        <div className="size-2 rounded-full bg-blue-500 flex-shrink-0 mt-1.5" />
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate({ to: "/notifications" });
                }}
                className="text-sm text-blue-500 hover:text-blue-600 font-medium flex items-center gap-1 mx-auto"
              >
                View all notifications <ArrowUpRight className="size-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export { NotificationList };
