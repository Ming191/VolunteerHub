import { createRoute, redirect } from "@tanstack/react-router";
import { rootRoute } from "./root.route";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { DashboardRouter } from "./components/DashboardRouter";

// 3. Protected Routes Layout
export const authenticatedLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "_auth",
  beforeLoad: ({ context }) => {
    // If auth is still loading, allow the route to load
    // The component will show a loading state
    if (context.auth.isLoading) {
      return;
    }

    // If auth finished loading and user is not authenticated, redirect
    if (!context.auth.isAuthenticated) {
      throw redirect({
        to: "/signin",
      });
    }
  },
  component: () => <DashboardLayout />,
});

export const dashboardRoute = createRoute({
  getParentRoute: () => authenticatedLayoutRoute,
  path: "/dashboard",
  component: DashboardRouter,
});

// Redirect authenticated users from landing page to dashboard
export const indexRoute = createRoute({
  getParentRoute: () => authenticatedLayoutRoute,
  path: "/app",
  beforeLoad: () => {
    throw redirect({ to: "/dashboard" });
  },
});
