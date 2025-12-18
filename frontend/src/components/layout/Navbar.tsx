import { Search, Heart } from "lucide-react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { NotificationList } from "@/components/animate-ui/components/community/notification-list";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const getPageTitle = (pathname: string): string => {
  const pathSegments = pathname.split("/").filter(Boolean);

  if (pathSegments.length === 0 || pathSegments[0] === "dashboard") {
    return "Dashboard";
  }

  const titleMap: Record<string, string> = {
    events: "Events",
    "my-events": "My Events",
    admin: "Admin Panel",
  };

  return (
    titleMap[pathSegments[0]] ||
    pathSegments[0].charAt(0).toUpperCase() + pathSegments[0].slice(1)
  );
};

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const userInitials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "V";
  const pageTitle = getPageTitle(location.pathname);

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40 shadow-sm">
      <div className="flex items-center justify-between w-full max-w-7xl mx-auto">
        {/* Left side: Logo and Page Title */}
        <div className="flex items-center gap-6">
          <button
            className="flex items-center gap-2 text-xl font-bold text-volunteer-600 dark:text-volunteer-400 cursor-pointer hover:text-volunteer-700 dark:hover:text-volunteer-300 transition-colors bg-transparent border-0 p-0"
            onClick={() => navigate({ to: "/dashboard" })}
            aria-label="Navigate to dashboard"
          >
            <Heart className="h-6 w-6 fill-volunteer-600 dark:fill-volunteer-400" />
            <span>VolunteerHub</span>
          </button>
          <div className="hidden md:flex text-sm font-medium text-gray-500 dark:text-gray-400 items-center gap-2">
            <span>/</span>
            <span className="text-gray-700 dark:text-gray-300">
              {pageTitle}
            </span>
          </div>
        </div>

        {/* Right side: Search, Notifications, and User Menu */}
        <div className="flex items-center gap-4">
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              type="search"
              placeholder="Search events..."
              className="pl-9 w-48 lg:w-64 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
            />
          </div>

          <NotificationList />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-10 w-10 rounded-full"
              >
                <Avatar className="ring-2 ring-volunteer-500 dark:ring-volunteer-400">
                  <AvatarImage src={undefined} alt={user?.name} />
                  <AvatarFallback className="bg-volunteer-500 text-white font-semibold">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="font-semibold">{user?.name}</div>
                <div className="font-normal text-sm text-muted-foreground">
                  {user?.email}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => navigate({ to: "/profile" })}
                className="cursor-pointer"
              >
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => navigate({ to: "/settings" })}
                className="cursor-pointer"
              >
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={logout}
                className="text-red-600 cursor-pointer"
              >
                Log Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
