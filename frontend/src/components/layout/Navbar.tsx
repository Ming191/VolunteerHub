import { Search, Bell } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const getPageTitle = (pathname: string): string => {
    const pathSegments = pathname.split('/').filter(Boolean);

    if (pathSegments.length === 0 || pathSegments[0] === 'dashboard') {
        return 'Dashboard';
    }

    const titleMap: Record<string, string> = {
        'events': 'Events',
        'my-events': 'My Events',
        'admin': 'Admin Panel',
    };

    return titleMap[pathSegments[0]] || pathSegments[0].charAt(0).toUpperCase() + pathSegments[0].slice(1);
};

const Navbar = () => {
    const { user, logout } = useAuth();
    const location = useLocation();

    const userInitials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'V';
    const pageTitle = getPageTitle(location.pathname);

    return (
        <header className="flex items-center justify-between p-4 bg-background/80 backdrop-blur-sm border-b sticky top-0 z-40">
            {/* Left side: Logo and Page Title */}
            <div className="flex items-center gap-4">
                <div className="text-2xl font-bold text-primary">VolunteerHub</div>
                <div className="text-xl font-semibold text-muted-foreground">/ {pageTitle}</div>
            </div>


            {/* Right side: Search, Notifications, and User Menu */}
            <div className="flex items-center gap-4">
                <div className="relative hidden sm:block">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input type="search" placeholder="Search events..." className="pl-8" />
                </div>

                <Button size="icon" variant="outline">
                    <Bell className="h-5 w-5" />
                </Button>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                            <Avatar>
                                <AvatarImage src={undefined} alt={user?.name} />
                                <AvatarFallback>{userInitials}</AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>
                            <div className="font-normal text-sm text-muted-foreground">{user?.email}</div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Profile</DropdownMenuItem>
                        <DropdownMenuItem>Settings</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={logout} className="text-red-500">
                            Log Out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
};

export default Navbar;