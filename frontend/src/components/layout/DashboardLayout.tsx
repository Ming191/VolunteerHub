import { Outlet } from '@tanstack/react-router';
import Navbar from './Navbar';
import { FloatingDock } from '@/components/ui/floating-dock';
import { LayoutDashboard, CalendarDays, UserCog, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/useAuth';

const DashboardLayout = () => {
    const { user } = useAuth();

    const dockItems = [
        {
            title: 'Dashboard',
            icon: <LayoutDashboard className="h-full w-full" />,
            href: '/dashboard',
        },
        {
            title: 'Browse Events',
            icon: <CalendarDays className="h-full w-full" />,
            href: '/events',
        },
        ...(user?.role === 'EVENT_ORGANIZER' ? [{
            title: 'My Events',
            icon: <UserCog className="h-full w-full" />,
            href: '/my-events',
        }] : []),
        ...(user?.role === 'ADMIN' ? [{
            title: 'Admin Panel',
            icon: <ShieldCheck className="h-full w-full" />,
            href: '/admin/pending-events',
        }] : []),
    ];

    return (
        <div className="flex flex-col h-screen w-full">
            {/* Navbar Component */}
            <Navbar />

            {/* Main Content Area */}
            <main className="flex-1 overflow-x-hidden overflow-y-auto bg-transparent p-4 sm:p-6 pb-24">
                {/* Outlet renders the active child route */}
                <Outlet />
            </main>

            {/* Floating Dock at the bottom */}
            <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
                <FloatingDock items={dockItems} />
            </div>
        </div>
    );
};

export default DashboardLayout;