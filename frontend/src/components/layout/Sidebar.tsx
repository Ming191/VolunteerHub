import { NavLink } from 'react-router-dom';
import { LayoutDashboard, CalendarDays, UserCog, ShieldCheck, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SidebarProps {
    isSidebarOpen: boolean;
    setIsSidebarOpen: (isOpen: boolean) => void;
}

const Sidebar = ({ isSidebarOpen, setIsSidebarOpen }: SidebarProps) => {
    const { user } = useAuth();

    const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
        cn(
            'w-full justify-start text-base',
            isActive
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-accent hover:text-accent-foreground'
        );

    return (
        <>
            {/* Overlay for mobile */}
            <div
                className={cn(
                    'fixed inset-0 bg-black/60 z-30 lg:hidden',
                    isSidebarOpen ? 'block' : 'hidden'
                )}
                onClick={() => setIsSidebarOpen(false)}
            ></div>

            {/* Sidebar */}
            <aside
                className={cn(
                    'fixed lg:relative inset-y-0 left-0 z-40 w-64 bg-background border-r transform transition-transform duration-300 ease-in-out',
                    isSidebarOpen ? 'translate-x-0' : '-translate-x-full',
                    'lg:translate-x-0'
                )}
            >
                <div className="flex items-center justify-between p-4 border-b">
                    <h1 className="text-2xl font-bold text-primary">VolunteerHub</h1>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="lg:hidden"
                        onClick={() => setIsSidebarOpen(false)}
                    >
                        <X className="h-6 w-6" />
                    </Button>
                </div>
                <nav className="p-4 space-y-2">
                    <NavLink to="/dashboard" className={navLinkClasses}>
                        <Button variant="ghost" className="w-full justify-start">
                            <LayoutDashboard className="mr-2 h-5 w-5" />
                            Dashboard
                        </Button>
                    </NavLink>
                    <NavLink to="/events" className={navLinkClasses}>
                        <Button variant="ghost" className="w-full justify-start">
                            <CalendarDays className="mr-2 h-5 w-5" />
                            Browse Events
                        </Button>
                    </NavLink>

                    {/* Organizer-only link */}
                    {user?.role === 'EVENT_ORGANIZER' && (
                        <NavLink to="/my-events" className={navLinkClasses}>
                            <Button variant="ghost" className="w-full justify-start">
                                <UserCog className="mr-2 h-5 w-5" />
                                My Events
                            </Button>
                        </NavLink>
                    )}

                    {/* Admin-only link */}
                    {user?.role === 'ADMIN' && (
                        <NavLink to="/admin" className={navLinkClasses}>
                            <Button variant="ghost" className="w-full justify-start">
                                <ShieldCheck className="mr-2 h-5 w-5" />
                                Admin Panel
                            </Button>
                        </NavLink>
                    )}
                </nav>
            </aside>
        </>
    );
};

export default Sidebar;