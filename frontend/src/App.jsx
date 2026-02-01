import { Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore';

// Landing Page
import LandingPage from './pages/LandingPage';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// Client Pages
import ClientDashboard from './pages/client/Dashboard';
import CreateRequest from './pages/client/CreateRequest';
import RequestDetail from './pages/client/RequestDetail';
import MyRequests from './pages/client/MyRequests';
import ClientDeliveries from './pages/client/Deliveries';
import ClientBilling from './pages/client/Billing';
import ClientSettings from './pages/client/Settings';

// Designer Pages
import DesignerWorkspace from './pages/designer/Workspace';
import UploadDesign from './pages/designer/UploadDesign';
import DesignerAnalytics from './pages/designer/Analytics';
import DesignerDashboard from './pages/designer/Dashboard';
import MyTasks from './pages/designer/MyTasks';
import TaskDetails from './pages/designer/TaskDetails';

// Manager Pages
import ManagerQueue from './pages/manager/Queue';
import ReviewDetail from './pages/manager/ReviewDetail';
import DesignerAnalyticsDetail from './pages/manager/DesignerAnalytics';
import ManagerDashboard from './pages/manager/Dashboard';
import AssignRequests from './pages/manager/AssignRequests';
import TeamWorkload from './pages/manager/TeamWorkload';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import SubscriptionPlans from './pages/admin/SubscriptionPlans';
import EditPlan from './pages/admin/EditPlan';
import TestimonialModeration from './pages/admin/TestimonialModeration';
import LeadManager from './pages/admin/LeadManager';
import AffiliatePayouts from './pages/admin/AffiliatePayouts';
import Users from './pages/admin/Users';
import Analytics from './pages/admin/Analytics';
import GlobalRequests from './pages/admin/GlobalRequests';
import TeamMapping from './pages/admin/TeamMapping';

// Affiliate Pages
import AffiliateDashboard from './pages/affiliate/Dashboard';
import AffiliateSettings from './pages/affiliate/Settings';

// Components
import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {
    const { isAuthenticated } = useAuthStore();

    return (
        <Routes>
            {/* Public Routes */}
            <Route
                path="/login"
                element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />}
            />
            <Route
                path="/register"
                element={isAuthenticated ? <Navigate to="/dashboard" /> : <Register />}
            />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Protected Routes - Client */}
            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute roles={['client']}>
                        <ClientDashboard />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/requests/create"
                element={
                    <ProtectedRoute roles={['client']}>
                        <CreateRequest />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/client/requests"
                element={
                    <ProtectedRoute roles={['client']}>
                        <MyRequests />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/client/requests/history"
                element={
                    <ProtectedRoute roles={['client']}>
                        <MyRequests />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/client/requests/new"
                element={
                    <ProtectedRoute roles={['client']}>
                        <CreateRequest />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/client/requests/:id"
                element={
                    <ProtectedRoute roles={['client']}>
                        <RequestDetail />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/client/deliveries"
                element={
                    <ProtectedRoute roles={['client']}>
                        <ClientDeliveries />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/client/billing"
                element={
                    <ProtectedRoute roles={['client']}>
                        <ClientBilling />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/client/settings"
                element={
                    <ProtectedRoute roles={['client']}>
                        <ClientSettings />
                    </ProtectedRoute>
                }
            />

            {/* Protected Routes - Designer */}
            <Route
                path="/designer/workspace"
                element={
                    <ProtectedRoute roles={['designer']}>
                        <DesignerWorkspace />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/designer/dashboard"
                element={
                    <ProtectedRoute roles={['designer']}>
                        <DesignerDashboard />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/designer/tasks"
                element={
                    <ProtectedRoute roles={['designer']}>
                        <MyTasks />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/designer/tasks/:id/upload"
                element={
                    <ProtectedRoute roles={['designer']}>
                        <UploadDesign />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/designer/analytics"
                element={
                    <ProtectedRoute roles={['designer']}>
                        <DesignerAnalytics />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/designer/tasks/:id"
                element={
                    <ProtectedRoute roles={['designer']}>
                        <TaskDetails />
                    </ProtectedRoute>
                }
            />

            {/* Protected Routes - Manager */}
            <Route
                path="/manager/queue"
                element={
                    <ProtectedRoute roles={['manager']}>
                        <ManagerQueue />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/manager/dashboard"
                element={
                    <ProtectedRoute roles={['manager']}>
                        <ManagerDashboard />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/manager/review/:id"
                element={
                    <ProtectedRoute roles={['manager']}>
                        <ReviewDetail />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/manager/designers/:id/analytics"
                element={
                    <ProtectedRoute roles={['manager']}>
                        <DesignerAnalyticsDetail />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/manager/assign"
                element={
                    <ProtectedRoute roles={['manager']}>
                        <AssignRequests />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/manager/workload"
                element={
                    <ProtectedRoute roles={['manager']}>
                        <TeamWorkload />
                    </ProtectedRoute>
                }
            />

            {/* Protected Routes - Admin */}
            <Route
                path="/admin/dashboard"
                element={
                    <ProtectedRoute roles={['admin']}>
                        <AdminDashboard />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/team-mapping"
                element={
                    <ProtectedRoute roles={['admin']}>
                        <TeamMapping />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/plans"
                element={
                    <ProtectedRoute roles={['admin']}>
                        <SubscriptionPlans />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/plans/:id/edit"
                element={
                    <ProtectedRoute roles={['admin']}>
                        <EditPlan />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/testimonials"
                element={
                    <ProtectedRoute roles={['admin']}>
                        <TestimonialModeration />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/leads"
                element={
                    <ProtectedRoute roles={['admin']}>
                        <LeadManager />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/payouts"
                element={
                    <ProtectedRoute roles={['admin']}>
                        <AffiliatePayouts />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/users"
                element={
                    <ProtectedRoute roles={['admin']}>
                        <Users />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/requests"
                element={
                    <ProtectedRoute roles={['admin']}>
                        <GlobalRequests />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/analytics"
                element={
                    <ProtectedRoute roles={['admin']}>
                        <Analytics />
                    </ProtectedRoute>
                }
            />

            {/* Landing Page */}
            <Route path="/" element={<LandingPage />} />

            {/* Default redirect */}
            {/* Protected Routes - Affiliate */}
            <Route
                path="/affiliate/dashboard"
                element={
                    <ProtectedRoute roles={['affiliate']}>
                        <AffiliateDashboard />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/affiliate/settings"
                element={
                    <ProtectedRoute roles={['affiliate']}>
                        <AffiliateSettings />
                    </ProtectedRoute>
                }
            />

            <Route path="*" element={<Navigate to="/" />} />
        </Routes>
    );
}

export default App;
