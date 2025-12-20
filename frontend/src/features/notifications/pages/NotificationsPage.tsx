import { Bell, Check, Loader2, Trash2 } from 'lucide-react';
import { formatDistanceToNowUTC } from '@/lib/dateUtils';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  TabsContents,
} from '@/components/animate-ui/components/animate/tabs';
import { useNotifications } from '../hooks/useNotifications';
import AnimatedPage from '@/components/common/AnimatedPage';
import { motion } from 'motion/react';
import type { NotificationResponse } from '@/api-client';
import React from "react";

interface NotificationItemProps {
  notification: NotificationResponse;
  onClick: (n: NotificationResponse) => void;
  onDelete: (e: React.MouseEvent, id: number) => void;
  deleting: boolean;
}

const NotificationItem = ({
  notification,
  onClick,
  onDelete,
  deleting,
}: NotificationItemProps) => {
  const unread = !notification.isRead;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      onClick={() => onClick(notification)}
      className={`
        p-4 border rounded-lg cursor-pointer transition-colors group
        hover:bg-muted/50
        ${unread
          ? 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900'
          : ''}
      `}
    >
      <div className="flex items-start gap-3">
        {unread && (
          <div className="size-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
        )}

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">{notification.content}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {formatDistanceToNowUTC(notification.createdAt, {
              addSuffix: true,
            })}
          </p>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
          disabled={deleting}
          onClick={(e) => {
            e.stopPropagation();
            onDelete(e, notification.id);
          }}
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>
    </motion.div>
  );
};

export const NotificationsPage = () => {
  const {
    activeTab,
    setActiveTab,
    allNotifications,
    unreadNotifications,
    isLoadingAll,
    countData,
    daysToLoad,
    hasMore,
    observerTarget,
    markAllAsReadMutation,
    deleteNotificationMutation,
    handleNotificationClick,
    handleDelete,
  } = useNotifications();

  const notifications =
    (activeTab === 'all' ? allNotifications : unreadNotifications) || [];

  const unreadCount = countData?.count ?? 0;

  return (
    <AnimatedPage className="container max-w-4xl mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Bell className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">Notifications</CardTitle>
                {unreadCount > 0 && (
                  <p className="text-sm text-muted-foreground mt-1">
                    You have {unreadCount} unread notification
                    {unreadCount !== 1 && 's'}
                  </p>
                )}
              </div>
            </div>

            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => markAllAsReadMutation.mutate()}
                disabled={markAllAsReadMutation.isPending}
              >
                <Check className="h-4 w-4 mr-2" />
                Mark all read
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent>
          <Tabs
            value={activeTab}
            onValueChange={(v) =>
              setActiveTab(v as 'all' | 'unread')
            }
          >
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="unread">
                Unread {unreadCount > 0 && `(${unreadCount})`}
              </TabsTrigger>
            </TabsList>

            <TabsContents>
              {(['all', 'unread'] as const).map((tab) => (
                <TabsContent
                  key={tab}
                  value={tab}
                  className="space-y-2 min-h-[40vh] md:min-h-[500px]"
                >
                  {notifications.length > 0 ? (
                    <>
                      {notifications.map((n) => (
                        <NotificationItem
                          key={n.id}
                          notification={n}
                          onClick={handleNotificationClick}
                          onDelete={handleDelete}
                          deleting={deleteNotificationMutation.isPending}
                        />
                      ))}

                      {/* Infinite scroll only for "all" */}
                      {tab === 'all' && hasMore && (
                        <div
                          ref={observerTarget}
                          className="py-4 flex justify-center"
                        >
                          {isLoadingAll && daysToLoad > 30 && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Loading more notifications...
                            </div>
                          )}
                        </div>
                      )}

                      {!hasMore &&
                        tab === 'all' &&
                        notifications.length > 10 && (
                          <div className="py-8 text-center text-sm text-muted-foreground">
                            You've reached the end of your notifications
                          </div>
                        )}
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <div className="rounded-full bg-muted p-4 mb-4">
                        {tab === 'unread' ? (
                          <Check className="h-8 w-8 text-muted-foreground" />
                        ) : (
                          <Bell className="h-8 w-8 text-muted-foreground" />
                        )}
                      </div>
                      <h3 className="text-lg font-semibold mb-2">
                        {tab === 'unread'
                          ? 'All caught up!'
                          : 'No notifications yet'}
                      </h3>
                      <p className="text-muted-foreground max-w-md">
                        {tab === 'unread'
                          ? 'You have no unread notifications.'
                          : "When you receive notifications, they'll appear here."}
                      </p>
                    </div>
                  )}
                </TabsContent>
              ))}
            </TabsContents>
          </Tabs>
        </CardContent>
      </Card>
    </AnimatedPage>
  );
};
