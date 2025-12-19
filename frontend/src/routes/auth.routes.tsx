import { createRoute } from "@tanstack/react-router";
import { Suspense } from "react";
import { z } from "zod";
import { SuspenseFallback } from "@/components/common/SuspenseFallback";
import { rootRoute } from "./root.route";
import {
  TabbedAuthScreen,
  ModernSignInScreen,
  ModernSignUpScreen,
  ForgotPasswordScreen,
  EmailVerificationScreen,
  DateTimePicker,
} from "./lazy-components";

export const signinRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/signin",
  component: () => (
    <Suspense fallback={<SuspenseFallback />}>
      <ModernSignInScreen />
    </Suspense>
  ),
});

export const signupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/signup",
  component: () => (
    <Suspense fallback={<SuspenseFallback />}>
      <ModernSignUpScreen />
    </Suspense>
  ),
});

export const forgotPasswordRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/forgot-password",
  component: () => (
    <Suspense fallback={<SuspenseFallback />}>
      <ForgotPasswordScreen />
    </Suspense>
  ),
});

export const verifyEmailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/verify-email",
  validateSearch: z.object({
    token: z.string().optional(),
  }),
  component: () => (
    <Suspense fallback={<SuspenseFallback />}>
      <EmailVerificationScreen />
    </Suspense>
  ),
});

export const testRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/test",
  component: () => (
    <Suspense fallback={<SuspenseFallback />}>
      <DateTimePicker onChange={() => {}} />
    </Suspense>
  ),
});
