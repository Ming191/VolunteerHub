import { Search } from "lucide-react";
import LogoImg from "@/assets/logo.svg";
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

  if (titleMap[pathSegments[0]]) {
    return titleMap[pathSegments[0]];
  }

  // Generic formatter: replace dashes with spaces and Capitalize Each Word
  return pathSegments[0]
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
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
    <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
      <div className="flex items-center justify-between w-full max-w-7xl mx-auto">
        {/* Left side: Logo */}
        <div className="flex items-center">
          <button
            className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity bg-transparent border-0 p-0"
            onClick={() => navigate({ to: "/dashboard" })}
            aria-label="Navigate to dashboard"
          >
            <img src={LogoImg} alt="VolunteerHub" className="h-10 w-10" />
            <span className="text-2xl font-bold text-gray-900">
              VolunteerHub
            </span>
          </button>
        </div>

        {/* Right side: Search, Notifications, and User Menu */}
        <div className="flex items-center gap-4">
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              type="search"
              placeholder="Search events..."
              className="pl-9 w-48 lg:w-64 text-gray-900 bg-white border-gray-300 focus:border-green-600 focus:ring-green-600"
            />
          </div>

          <NotificationList />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-10 w-10 rounded-full"
              >
                <Avatar className="ring-2 ring-green-600">
                  <AvatarImage src={undefined} alt={user?.name} />
                  <AvatarFallback className="bg-green-600 text-white font-semibold">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-white z-50">
              <DropdownMenuLabel className="bg-white">
                <div className="font-semibold text-gray-900">{user?.name}</div>
                <div className="font-normal text-sm text-gray-600">
                  {user?.email}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-gray-200" />
              <DropdownMenuItem
                onClick={() => navigate({ to: "/profile" })}
                className="cursor-pointer text-gray-900 hover:bg-green-50 hover:text-green-700 focus:bg-green-50 focus:text-green-700"
              >
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => navigate({ to: "/settings" })}
                className="cursor-pointer text-gray-900 hover:bg-green-50 hover:text-green-700 focus:bg-green-50 focus:text-green-700"
              >
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-gray-200" />
              <DropdownMenuItem
                onClick={logout}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 focus:bg-red-50 focus:text-red-700 cursor-pointer"
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
