import { createRoute } from "@tanstack/react-router";
import { Suspense } from "react";
import { SuspenseFallback } from "@/components/common/SuspenseFallback";
import { authenticatedLayoutRoute } from "./dashboard.routes";
import {
  ProfilePage,
  NotificationsPage,
  SettingsPage,
} from "./lazy-components";
import { TermsOfServicePage, PrivacyPolicyPage } from "@/features/legal/pages";

export const profileRoute = createRoute({
  getParentRoute: () => authenticatedLayoutRoute,
  path: "/profile",
  component: () => (
    <Suspense fallback={<SuspenseFallback />}>
      <ProfilePage />
    </Suspense>
  ),
});

export const profileByIdRoute = createRoute({
  getParentRoute: () => authenticatedLayoutRoute,
  path: "/profile/$userId",
  component: () => (
    <Suspense fallback={<SuspenseFallback />}>
      <ProfilePage />
    </Suspense>
  ),
});

export const notificationsRoute = createRoute({
  getParentRoute: () => authenticatedLayoutRoute,
  path: "/notifications",
  component: () => (
    <Suspense fallback={<SuspenseFallback />}>
      <NotificationsPage />
    </Suspense>
  ),
});

export const settingsRoute = createRoute({
  getParentRoute: () => authenticatedLayoutRoute,
  path: "/settings",
  component: () => (
    <Suspense fallback={<SuspenseFallback />}>
      <SettingsPage />
    </Suspense>
  ),
});

export const termsRoute = createRoute({
  getParentRoute: () => authenticatedLayoutRoute,
  path: "/terms-of-service",
  component: () => (
    <Suspense fallback={<SuspenseFallback />}>
      <TermsOfServicePage />
    </Suspense>
  ),
});

export const privacyRoute = createRoute({
  getParentRoute: () => authenticatedLayoutRoute,
  path: "/privacy-policy",
  component: () => (
    <Suspense fallback={<SuspenseFallback />}>
      <PrivacyPolicyPage />
    </Suspense>
  ),
});
