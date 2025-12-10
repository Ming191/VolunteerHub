import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import { FloatingDock } from '@/components/ui/floating-dock';
import { LayoutDashboard, CalendarDays, UserCog, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { AnimatePresence, motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';

const DashboardLayout = () => {
    const { user } = useAuth();
    const location = useLocation();

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
                <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                        key={location.pathname}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2 }}
                        className="h-full"
                    >
                        {/* Outlet renders the active child route */}
                        <Outlet />
                    </motion.div>
                </AnimatePresence>
            </main>

            {/* Floating Dock at the bottom */}
            <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
                <FloatingDock items={dockItems} />
            </div>
        </div>
    );
};

export default DashboardLayout;