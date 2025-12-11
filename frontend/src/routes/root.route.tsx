import { createRootRouteWithContext, Link, Outlet } from '@tanstack/react-router';
import { type AuthContextType } from '@/features/auth/context/AuthContext';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { GravityStarsBackground } from "@/components/animate-ui/components/backgrounds/gravity-stars.tsx";
import { Toaster } from '@/components/ui/sonner';
import { useQueryClient } from '@tanstack/react-query';
import { fcmService } from "@/features/notifications/services/fcmService.ts";
import { toast } from 'sonner';
import { useEffect } from 'react';

export interface RouterContext {
    auth: AuthContextType;
}

export const rootRoute = createRootRouteWithContext<RouterContext>()({
    component: () => {
        const queryClient = useQueryClient();

        // Setup FCM foreground message listener
        useEffect(() => {
            const unsubscribe = fcmService.setupForegroundMessageListener((payload) => {
                const title = payload.notification?.title || 'New Notification';
                const body = payload.notification?.body || '';

                toast.info(title, {
                    description: body,
                    duration: 5000,
                });

                // Invalidate notification queries to update UI
                queryClient.invalidateQueries({ queryKey: ['recentNotifications'] });
                queryClient.invalidateQueries({ queryKey: ['notificationCount'] });
            });

            return () => {
                if (unsubscribe) {
                    unsubscribe();
                }
            };
        }, [queryClient]);

        return (
            <>
                <div className="fixed inset-0 -z-10">
                    <GravityStarsBackground
                        starsCount={100}
                        starsSize={2}
                        starsOpacity={0.75}
                        glowIntensity={15}
                        glowAnimation="ease"
                        movementSpeed={0.3}
                        mouseInfluence={150}
                        mouseGravity="attract"
                        gravityStrength={75}
                        starsInteraction={true}
                        starsInteractionType="bounce"
                    />
                </div>
                <ErrorBoundary>
                    <Outlet />
                    <Toaster richColors position="top-right" />
                </ErrorBoundary>
            </>
        );
    },
    notFoundComponent: () => <div className="p-4 text-white">Page Not Found <Link to="/" className="underline">Go Home</Link></div>,
});
