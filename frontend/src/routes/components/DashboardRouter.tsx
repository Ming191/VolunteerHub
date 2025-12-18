import { Suspense } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { SuspenseFallback } from "@/components/common/SuspenseFallback";
import {
  AdminDashboard,
  OrganizerDashboard,
  VolunteerDashboard,
} from "../lazy-components";

// Dashboard Logic (Route splitting based on role)
export const DashboardRouter = () => {
  const { user } = useAuth();

  if (!user) {
    // Show a loading or safe default state instead of a blank screen
    return <SuspenseFallback />;
  }

  const role = user.role ?? "VOLUNTEER";

  return (
    <Suspense fallback={<SuspenseFallback />}>
      {role === "ADMIN" ? (
        <AdminDashboard />
      ) : role === "EVENT_ORGANIZER" ? (
        <OrganizerDashboard />
      ) : (
        // Default safe dashboard for VOLUNTEER or any unexpected role
        <VolunteerDashboard />
      )}
    </Suspense>
  );
};
