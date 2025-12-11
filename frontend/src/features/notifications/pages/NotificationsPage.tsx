import { Bell, Check, Loader2, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger, TabsContents } from '@/components/animate-ui/components/animate/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useNotifications } from '../hooks/useNotifications';

export const NotificationsPage = () => {
  const {
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
    handleDelete
  } = useNotifications();

  const displayNotifications = activeTab === 'all' ? allNotifications : unreadNotifications;
  const isLoading = activeTab === 'all' ? isLoadingAll : isLoadingUnread;
  const unreadCount = countData?.count || 0;

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
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
                    You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
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
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'all' | 'unread')}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="all">
                All Notifications
              </TabsTrigger>
              <TabsTrigger value="unread">
                Unread {unreadCount > 0 && `(${unreadCount})`}
              </TabsTrigger>
            </TabsList>

            <TabsContents>
              <TabsContent value="all" className="space-y-2">
                {isLoading && daysToLoad === 30 ? (
                  // Initial loading skeletons
                  Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="p-4 border rounded-lg">
                      <div className="flex items-start gap-3">
                        <Skeleton className="h-2 w-2 rounded-full flex-shrink-0 mt-2" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-1/4" />
                        </div>
                        <Skeleton className="h-8 w-8 rounded" />
                      </div>
                    </div>
                  ))
                ) : displayNotifications && displayNotifications.length > 0 ? (
                  <>
                    {displayNotifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors group ${!notification.isRead ? 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900' : ''
                          }`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex items-start gap-3">
                          {!notification.isRead && (
                            <div className="size-2 rounded-full bg-blue-500 flex-shrink-0 mt-2" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">
                              {notification.content}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatDistanceToNow(new Date(notification.createdAt), {
                                addSuffix: true,
                              })}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                            onClick={(e) => handleDelete(e, notification.id)}
                            disabled={deleteNotificationMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}

                    {/* Infinite scroll trigger */}
                    {activeTab === 'all' && hasMore && (
                      <div ref={observerTarget} className="py-4 flex justify-center">
                        {isLoadingAll && daysToLoad > 30 && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Loading more notifications...
                          </div>
                        )}
                      </div>
                    )}

                    {/* End of list indicator */}
                    {!hasMore && displayNotifications.length > 10 && (
                      <div className="py-8 text-center text-sm text-muted-foreground">
                        You've reached the end of your notifications
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="rounded-full bg-muted p-4 mb-4">
                      <Bell className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No notifications yet</h3>
                    <p className="text-muted-foreground max-w-md">
                      When you receive notifications, they'll appear here.
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="unread" className="space-y-2">
                {isLoadingUnread ? (
                  // Loading skeletons for unread tab
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="p-4 border rounded-lg">
                      <div className="flex items-start gap-3">
                        <Skeleton className="h-2 w-2 rounded-full flex-shrink-0 mt-2" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-1/4" />
                        </div>
                        <Skeleton className="h-8 w-8 rounded" />
                      </div>
                    </div>
                  ))
                ) : displayNotifications && displayNotifications.length > 0 ? (
                  displayNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors group bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900"
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="size-2 rounded-full bg-blue-500 flex-shrink-0 mt-2" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">
                            {notification.content}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDistanceToNow(new Date(notification.createdAt), {
                              addSuffix: true,
                            })}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                          onClick={(e) => handleDelete(e, notification.id)}
                          disabled={deleteNotificationMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="rounded-full bg-muted p-4 mb-4">
                      <Check className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">All caught up!</h3>
                    <p className="text-muted-foreground max-w-md">
                      You have no unread notifications.
                    </p>
                  </div>
                )}
              </TabsContent>
            </TabsContents>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
