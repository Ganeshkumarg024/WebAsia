import { Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import useAuthStore from '../../store/authStore';
import useSubscriptionStore from '../../store/subscriptionStore';

const ProtectedRoute = ({ children, roles = [] }) => {
    const { isAuthenticated, user } = useAuthStore();
    const { currentSubscription, fetchCurrentSubscription, isLoading, isInitialized } = useSubscriptionStore();
    const location = useLocation();

    useEffect(() => {
        if (isAuthenticated && user?.role === 'client' && !isInitialized && !isLoading) {
            fetchCurrentSubscription();
        }
    }, [isAuthenticated, user, isInitialized, isLoading, fetchCurrentSubscription]);

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Check if user has required role
    if (roles.length > 0 && user && !roles.includes(user.role)) {
        // Redirect to appropriate dashboard based on role
        const dashboardMap = {
            client: '/client/dashboard',
            designer: '/designer/dashboard',
            manager: '/manager/dashboard',
            admin: '/admin/dashboard',
        };
        return <Navigate to={dashboardMap[user.role] || '/login'} replace />;
    }

    // Global Subscription Guard for Clients
    if (user?.role === 'client' && location.pathname !== '/client/billing') {
        // If we are still determining the subscription status, show a loader
        if (isLoading && !currentSubscription) {
            return (
                <div className="flex items-center justify-center min-h-screen bg-gray-50">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
            );
        }

        // Redirect if no subscription found after loading
        if (!currentSubscription && !isLoading) {
            return <Navigate to="/client/billing" replace />;
        }
    }

    return children;
};

export default ProtectedRoute;
