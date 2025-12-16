import { Outlet, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import Navbar from './Navbar';
import { FloatingDock } from '@/components/ui/floating-dock';
import { LayoutDashboard, CalendarDays, UserCog, ShieldCheck, Users } from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { SuspenseFallback } from '@/components/common/SuspenseFallback';
import { ThemeListener } from '@/features/settings/components/ThemeListener';

const DashboardLayout = () => {
    const { user, isLoading, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    // Redirect to signin if not authenticated after loading completes
    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            navigate({ to: '/signin', replace: true });
        }
    }, [isLoading, isAuthenticated, navigate]);

    // Show loading state while auth is initializing
    if (isLoading) {
        return <SuspenseFallback />;
    }

    // If not authenticated, return null (will redirect via useEffect)
    if (!isAuthenticated) {
        return (
            <div
                role="status"
                aria-live="polite"
                className="flex items-center justify-center h-screen w-full text-lg"
            >
                Redirecting...
            </div>
        );
    }

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
        ...(user?.role === 'ADMIN' ? [
            {
                title: 'Admin Panel',
                icon: <ShieldCheck className="h-full w-full" />,
                href: '/admin/pending-events',
            },
            {
                title: 'Users',
                icon: <Users className="h-full w-full" />,
                href: '/admin/users',
            }
        ] : []),
    ];

    return (
        <div className="flex flex-col h-screen w-full">
            {/* Navbar Component */}
            <Navbar />
            <ThemeListener />

            {/* Main Content Area */}
            <main className="flex-1 overflow-x-hidden overflow-y-auto bg-transparent p-4 sm:p-6 pb-24 sm:pb-16">
                {/* Outlet renders the active child route */}
                <Outlet />
                {/* Spacer for Floating Dock removed; use padding instead */}
            </main>

            {/* Floating Dock at the bottom */}
            <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
                <FloatingDock items={dockItems} />
            </div>
        </div>
    );
};

export default DashboardLayout;