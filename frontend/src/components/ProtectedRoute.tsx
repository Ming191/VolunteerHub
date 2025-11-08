import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Loading from './common/Loading'; // We'll create this simple component next

interface ProtectedRouteProps {
    allowedRoles?: string[];
}

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
    const { isAuthenticated, user, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loading />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/signin" state={{ from: location }} replace />;
    }

    if (allowedRoles && allowedRoles.length > 0 && user?.role) {
        const isAuthorized = allowedRoles.includes(user.role);
        if (!isAuthorized) {

            return <Navigate to="/dashboard" replace />;
        }
    }

    // 4. If the user is authenticated and authorized, render the child component
    // The <Outlet /> component from React Router renders the matched nested route.
    return <Outlet />;
};

export default ProtectedRoute;