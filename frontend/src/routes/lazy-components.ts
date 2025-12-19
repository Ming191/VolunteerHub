import { lazy } from 'react';

export const TabbedAuthScreen = lazy(() => import('@/features/auth/components/TabbedAuthScreen').then(m => ({ default: m.TabbedAuthScreen })));
export const EmailVerificationScreen = lazy(() => import('@/features/auth/components/EmailVerificationScreen').then(m => ({ default: m.EmailVerificationScreen })));
export const VolunteerDashboard = lazy(() => import('@/features/volunteer/pages/VolunteerDashboard').then(m => ({ default: m.VolunteerDashboard })));
export const OrganizerDashboard = lazy(() => import('@/features/organizer/pages/OrganizerDashboard').then(m => ({ default: m.OrganizerDashboard })));
export const AdminDashboard = lazy(() => import('@/features/admin/pages/AdminDashboardPage').then(m => ({ default: m.AdminDashboardPage })));
export const EventListPage = lazy(() => import('@/features/events/pages/EventListPage').then(m => ({ default: m.EventListScreen })));
export const ProfilePage = lazy(() => import('@/features/users/pages/ProfilePage').then(m => ({ default: m.ProfilePage })));
export const NotificationsPage = lazy(() => import('@/features/notifications/pages/NotificationsPage').then(m => ({ default: m.NotificationsPage })));
export const MyEventsPage = lazy(() => import('@/features/events/pages/MyEventsPage').then(m => ({ default: m.MyEventsScreen })));
export const AdminPendingEvents = lazy(() => import('@/features/admin/pages/AdminPendingEvents').then(m => ({ default: m.AdminPendingEvents })));
export const AdminUsers = lazy(() => import('@/features/admin/pages/AdminUsers').then(m => ({ default: m.AdminUsers })));
export const AdminReport = lazy(() => import('@/features/admin/pages/AdminReport').then(m => ({ default: m.AdminReport })));
export const MyRegistrationsScreen = lazy(() => import('@/features/volunteer/pages/MyRegistrationsPage').then(m => ({ default: m.MyRegistrationsScreen })));
export const EventDetailsPage = lazy(() => import('@/features/events/pages/EventDetailsPage').then(m => ({ default: m.EventDetailsPage })));
export const DateTimePicker = lazy(() => import('@/features/events/components/DateTimePicker').then(m => ({ default: m.DateTimePicker })));
export const SettingsPage = lazy(() => import('@/features/settings/pages/SettingsPage').then(m => ({ default: m.SettingsPage })));

