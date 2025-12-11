import { Link, useLocation } from '@tanstack/react-router';
import { LayoutDashboard, CalendarDays, UserCog, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarGroup,
    SidebarGroupContent,
} from '@/components/animate-ui/components/radix/sidebar';

const AppSidebar = () => {
    const { user } = useAuth();
    const location = useLocation();

    const navItems = [
        {
            title: 'Dashboard',
            icon: LayoutDashboard,
            path: '/dashboard',
            show: true,
        },
        {
            title: 'Browse Events',
            icon: CalendarDays,
            path: '/events',
            show: true,
        },
        {
            title: 'My Events',
            icon: UserCog,
            path: '/my-events',
            show: user?.role === 'EVENT_ORGANIZER',
        },
        {
            title: 'Admin Panel',
            icon: ShieldCheck,
            path: '/admin',
            show: user?.role === 'ADMIN',
        },
    ];

    return (
        <Sidebar>
            <SidebarHeader>
                <h1 className="text-2xl font-bold text-primary px-2 py-4">VolunteerHub</h1>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {navItems.filter(item => item.show).map((item) => (
                                <SidebarMenuItem key={item.path}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={location.pathname === item.path}
                                    >
                                        <Link to={item.path}>
                                            <item.icon className="h-5 w-5" />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    );
};

export default AppSidebar;
