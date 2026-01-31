import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DocumentTextIcon, ClockIcon, CheckCircleIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import useRequestStore from '../../store/requestStore';
import useSubscriptionStore from '../../store/subscriptionStore';
import useAuthStore from '../../store/authStore';
import StatCard from '../../components/shared/StatCard';
import StatusBadge from '../../components/shared/StatusBadge';
import ProgressBar from '../../components/shared/ProgressBar';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { format } from 'date-fns';

const ClientDashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { requests, stats, fetchRequests, fetchStats, isLoading } = useRequestStore();
    const { currentSubscription, fetchCurrentSubscription } = useSubscriptionStore();

    useEffect(() => {
        fetchRequests({ status: 'active', limit: 5 });
        fetchStats();
        fetchCurrentSubscription();
    }, [fetchRequests, fetchStats, fetchCurrentSubscription]);

    const activeRequests = requests.filter(r => r.status !== 'completed' && r.status !== 'cancelled');

    return (
        <DashboardLayout breadcrumbs={['Dashboard', 'Overview']}>
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">
                            Good morning, {user?.firstName || 'User'}
                        </h1>
                        <p className="text-gray-400">
                            Manage your creative workflow and track your monthly usage credits here.
                        </p>
                    </div>
                    <button
                        onClick={() => navigate('/client/requests/new')}
                        className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                    >
                        <span className="text-xl">+</span>
                        Create New Request
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard
                    title="Active Requests"
                    value={stats?.active || activeRequests.length.toString().padStart(2, '0')}
                    icon={DocumentTextIcon}
                    color="primary"
                    loading={isLoading}
                />
                <div className="bg-[#151B2E] rounded-lg p-6 border border-[#1E2638]">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <p className="text-sm text-gray-400 mb-2">Credits Status</p>
                            <p className="text-sm text-green-500 font-medium">+2 from last week</p>
                        </div>
                        <div className="p-3 rounded-lg bg-green-500/10 text-green-500">
                            <CheckCircleIcon className="w-6 h-6" />
                        </div>
                    </div>
                </div>
                <div className="bg-[#151B2E] rounded-lg p-6 border border-[#1E2638]">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-400">Monthly Credits Usage</p>
                        <p className="text-sm font-medium text-white">
                            {currentSubscription?.creditsUsed || 14} / {currentSubscription?.creditsTotal || 20} Credits
                        </p>
                    </div>
                    <ProgressBar
                        value={currentSubscription?.creditsUsed || 14}
                        max={currentSubscription?.creditsTotal || 20}
                        color="primary"
                        showLabel={false}
                    />
                    <p className="text-xs text-gray-500 mt-2">
                        Renewed in {currentSubscription?.daysUntilRenewal || 12} days
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Active Requests */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-white">My Active Requests</h2>
                            <button
                                onClick={() => navigate('/client/requests')}
                                className="text-blue-500 hover:text-blue-400 text-sm font-medium"
                            >
                                View All
                            </button>
                        </div>

                        <div className="space-y-3">
                            {isLoading ? (
                                <div className="bg-[#151B2E] rounded-lg p-6 border border-[#1E2638] animate-pulse">
                                    <div className="h-4 bg-gray-700 rounded w-3/4 mb-4"></div>
                                    <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                                </div>
                            ) : activeRequests.length > 0 ? (
                                activeRequests.map((request) => (
                                    <div
                                        key={request.id}
                                        onClick={() => navigate(`/client/requests/${request.id}`)}
                                        className="bg-[#151B2E] rounded-lg p-4 border border-[#1E2638] hover:border-[#2A3447] transition-colors cursor-pointer"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start gap-3 flex-1">
                                                <div className="p-2 bg-gray-700 rounded">
                                                    <DocumentTextIcon className="w-5 h-5 text-gray-400" />
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="text-white font-medium mb-1">{request.title}</h3>
                                                    <p className="text-sm text-gray-400">
                                                        {request.category} • Assigned to {request.designer?.name || 'Unassigned'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <StatusBadge status={request.status} />
                                                <button className="p-1 hover:bg-gray-700 rounded">
                                                    <span className="text-gray-400">⋮</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="bg-[#151B2E] rounded-lg p-12 border border-[#1E2638] text-center">
                                    <DocumentTextIcon className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                                    <p className="text-gray-400 mb-4">No active requests</p>
                                    <button
                                        onClick={() => navigate('/client/requests/new')}
                                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm"
                                    >
                                        Create Your First Request
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Recent Deliveries */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-white">Recent Deliveries</h2>
                            <button className="text-blue-500 hover:text-blue-400 text-sm font-medium">
                                View Full History
                            </button>
                        </div>

                        <div className="space-y-3">
                            {[
                                { name: 'Hero-Banner-V2.p...', size: '2.4 MB', date: '2m ago', type: 'image' },
                                { name: 'Social-Assets-Pac...', size: '42.8 MB', date: 'Yesterday', type: 'zip' },
                            ].map((file, index) => (
                                <div
                                    key={index}
                                    className="bg-[#151B2E] rounded-lg p-4 border border-[#1E2638] flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-pink-400 rounded"></div>
                                        <div>
                                            <p className="text-white font-medium">{file.name}</p>
                                            <p className="text-sm text-gray-400">{file.size} • {file.date}</p>
                                        </div>
                                    </div>
                                    <button className="p-2 hover:bg-gray-700 rounded transition-colors">
                                        <ArrowDownTrayIcon className="w-5 h-5 text-blue-500" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Subscription Plan */}
                    <div className="bg-[#151B2E] rounded-lg p-6 border border-[#1E2638]">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-white">Subscription Plan</h3>
                            <button className="p-1 hover:bg-gray-700 rounded">
                                <CheckCircleIcon className="w-5 h-5 text-blue-500" />
                            </button>
                        </div>
                        <div className="mb-4">
                            <p className="text-xs text-gray-400 mb-1">ACTIVE TIER</p>
                            <p className="text-xl font-bold text-white">
                                {currentSubscription?.plan?.name || 'Professional'}
                            </p>
                            <p className="text-sm text-gray-400">Monthly</p>
                        </div>
                        <div className="space-y-2 mb-4">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-400">Next billing date</span>
                                <span className="text-white">
                                    {currentSubscription?.nextBillingDate
                                        ? format(new Date(currentSubscription.nextBillingDate), 'MMM dd, yyyy')
                                        : 'Oct 24, 2023'
                                    }
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-400">Concurrent Tasks</span>
                                <span className="text-white">{currentSubscription?.concurrentTasks || 2} Active</span>
                            </div>
                        </div>
                    </div>

                    {/* Support */}
                    <div className="bg-[#151B2E] rounded-lg p-6 border border-[#1E2638]">
                        <h3 className="text-sm font-bold text-blue-500 mb-2">SUPPORT</h3>
                        <p className="text-sm text-white mb-4">Need help with a request?</p>
                        <button className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors">
                            Contact Us
                        </button>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default ClientDashboard;
