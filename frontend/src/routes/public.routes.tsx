import { createRoute, redirect } from "@tanstack/react-router";
import { rootRoute } from "./root.route";
import { LandingPage } from "@/features/home/LandingPage";
import { Suspense, lazy } from "react";
import { z } from "zod";
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
  validateSearch: z.object({
    q: z.string().optional(),
    location: z.string().optional(),
    tags: z.array(z.string()).optional(),
    upcoming: z.boolean().optional(),
    matchAllTags: z.boolean().optional(),
    page: z.number().optional(),
    size: z.number().optional(),
  }),
  component: () => (
    <Suspense fallback={<SuspenseFallback />}>
      <EventListPageComponent />
    </Suspense>
  ),
});
