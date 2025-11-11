import { Outlet } from 'react-router-dom';
import AppSidebar from './Sidebar';
import Navbar from './Navbar';
import { SidebarProvider, SidebarInset } from '@/components/animate-ui/components/radix/sidebar';

const DashboardLayout = () => {
    return (
        <SidebarProvider>
            <div className="flex h-screen w-full">
                {/* Sidebar Component */}
                <AppSidebar />

                <SidebarInset className="flex-1 flex flex-col overflow-hidden">
                    {/* Navbar Component with integrated trigger */}
                    <Navbar />

                    {/* Main Content Area */}
                    <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-900 p-4 sm:p-6">
                        {/* Outlet renders the active child route */}
                        <Outlet />
                    </main>
                </SidebarInset>
            </div>
        </SidebarProvider>
    );
};

export default DashboardLayout;