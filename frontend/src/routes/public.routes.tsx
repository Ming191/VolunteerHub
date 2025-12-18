import { createRoute, redirect } from "@tanstack/react-router";
import { rootRoute } from "./root.route";
import { LandingPage } from "@/features/home/LandingPage";
import { Suspense, lazy } from "react";
import { SuspenseFallback } from "@/components/common/SuspenseFallback";

const EventListPageComponent = lazy(() =>
  import("@/features/events/pages/EventListPage").then((m) => ({
    default: m.EventListScreen,
  }))
);

// Landing page route (public)
export const landingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  beforeLoad: ({ context }) => {
    // If user is authenticated, redirect to dashboard
    if (context.auth.isAuthenticated) {
      throw redirect({ to: "/dashboard" });
    }
  },
  component: LandingPage,
});

// Public events listing route (no auth required)
export const publicEventsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/events",
  component: () => (
    <Suspense fallback={<SuspenseFallback />}>
      <EventListPageComponent />
    </Suspense>
  ),
});
