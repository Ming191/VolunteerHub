import { RouterProvider } from "@tanstack/react-router";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { router } from "./router";

export const AppRouter = () => {
  const auth = useAuth();
  return <RouterProvider router={router} context={{ auth }} />;
};

