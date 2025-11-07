import { Routes, Route, Navigate } from 'react-router-dom';

// Import Layouts and Route Guards
import DashboardLayout from './components/layout/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Import Page Components
import LoginScreen from './components/auth/LoginScreen';
import SignUpScreen from './components/auth/SignUpScreen';

// Import a Toaster for notifications
import { Toaster } from '@/components/ui/sonner';

// --- Placeholder Pages (to be replaced in later phases) ---
const Dashboard = () => <div className="text-3xl font-bold">Welcome to your Dashboard!</div>;
const EventList = () => <div className="text-3xl font-bold">Browse Events</div>;
const MyEvents = () => <div className="text-3xl font-bold">My Events (Organizer)</div>;
const AdminPanel = () => <div className="text-3xl font-bold">Admin Panel</div>;
// -----------------------------------------------------------

function App() {
    return (
        <>
            <Routes>
                {/* ============================================= */}
                {/*           Public Routes                       */}
                {/* ============================================= */}
                <Route path="/signin" element={<LoginScreen />} />
                <Route path="/signup" element={<SignUpScreen />} />

                {/* ============================================= */}
                {/*           Protected Routes                    */}
                {/* ============================================= */}
                <Route element={<ProtectedRoute />}>
                    <Route element={<DashboardLayout />}>
                        {/* Redirect root path to the dashboard */}
                        <Route path="/" element={<Navigate to="/dashboard" replace />} />

                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/events" element={<EventList />} />

                        {/* Role-specific routes can be nested here too */}
                        <Route path="/my-events" element={<MyEvents />} />
                        <Route path="/admin" element={<AdminPanel />} />
                    </Route>
                </Route>

                {/* Add a 404 Not Found route here if desired */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>

            {/* Toaster for notifications, available on all pages */}
            <Toaster richColors position="top-right" />
        </>
    );
}

export default App;