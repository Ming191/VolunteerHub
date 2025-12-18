import { createRootRouteWithContext } from "@tanstack/react-router";
import { type AuthContextType } from "@/features/auth/context/AuthContext";
import { RootComponent, NotFoundComponent } from "./components/RootComponent";

export interface RouterContext {
  auth: AuthContextType;
}

export const rootRoute = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});
