import { Outlet, Link } from "@tanstack/react-router";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { Toaster } from "@/components/ui/sonner";
import { useQueryClient } from "@tanstack/react-query";
import { fcmService } from "@/features/notifications/services/fcmService.ts";
import { toast } from "sonner";
import { useEffect } from "react";

export const RootComponent = () => {
  const queryClient = useQueryClient();

  // Setup FCM foreground message listener
  useEffect(() => {
    const unsubscribe = fcmService.setupForegroundMessageListener((payload) => {
      const title = payload.notification?.title || "New Notification";
      const body = payload.notification?.body || "";

      toast.info(title, {
        description: body,
        duration: 5000,
      });

      // Invalidate notification queries to update UI
      queryClient.invalidateQueries({ queryKey: ["recentNotifications"] });
      queryClient.invalidateQueries({ queryKey: ["notificationCount"] });
    });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [queryClient]);

  return (
    <>
      {/* Vibrant, Light Background - Bright & Energetic! */}
      <div className="fixed inset-0 -z-10 bg-gradient-hero" />
      <ErrorBoundary>
        <Outlet />
        <Toaster richColors position="top-right" />
      </ErrorBoundary>
    </>
  );
};

export const NotFoundComponent = () => (
  <div className="p-4 text-white">
    Page Not Found{" "}
    <Link to="/" className="underline">
      Go Home
    </Link>
  </div>
);
