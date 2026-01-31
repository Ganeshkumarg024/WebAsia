import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ChartBarIcon,
    CurrencyDollarIcon,
    UsersIcon,
    DocumentTextIcon
} from '@heroicons/react/24/outline';
import adminAPI from '../../api/admin';
import StatCard from '../../components/shared/StatCard';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import DashboardLayout from '../../components/layout/DashboardLayout';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({});
    const [revenueData, setRevenueData] = useState([]);
    const [userGrowth, setUserGrowth] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [statsRes, revenueRes] = await Promise.all([
                adminAPI.getAnalytics(),
                adminAPI.getRevenueStats(),
            ]);

            setStats(statsRes.data || {});
            setRevenueData(revenueRes.data?.monthly || []);
            setUserGrowth(revenueRes.data?.userGrowth || []);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout breadcrumbs={['Admin', 'Dashboard']}>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Super Admin Command Center</h1>
                <p className="text-gray-400">Platform-wide metrics and system health</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="Total Revenue"
                    value={`$${stats.totalRevenue?.toLocaleString() || '0'}`}
                    icon={CurrencyDollarIcon}
                    trend="up"
                    trendValue="+12.5%"
                    color="success"
                    loading={loading}
                />
                <StatCard
                    title="Active Users"
                    value={stats.activeUsers || '0'}
                    icon={UsersIcon}
                    trend="up"
                    trendValue="+8.2%"
                    color="primary"
                    loading={loading}
                />
                <StatCard
                    title="Total Requests"
                    value={stats.totalRequests || '0'}
                    icon={DocumentTextIcon}
                    trend="up"
                    trendValue="+15.3%"
                    color="info"
                    loading={loading}
                />
                <StatCard
                    title="Active Subscriptions"
                    value={stats.activeSubscriptions || '0'}
                    icon={ChartBarIcon}
                    trend="up"
                    trendValue="+5.1%"
                    color="warning"
                    loading={loading}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Revenue Chart */}
                <div className="bg-[#151B2E] rounded-lg p-6 border border-[#1E2638]">
                    <h3 className="text-lg font-bold text-white mb-4">Revenue Overview</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={revenueData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1E2638" />
                            <XAxis dataKey="month" stroke="#94A3B8" />
                            <YAxis stroke="#94A3B8" />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#151B2E', border: '1px solid #1E2638' }}
                                labelStyle={{ color: '#fff' }}
                            />
                            <Line type="monotone" dataKey="revenue" stroke="#0066FF" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* User Growth Chart */}
                <div className="bg-[#151B2E] rounded-lg p-6 border border-[#1E2638]">
                    <h3 className="text-lg font-bold text-white mb-4">User Growth</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={userGrowth}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1E2638" />
                            <XAxis dataKey="month" stroke="#94A3B8" />
                            <YAxis stroke="#94A3B8" />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#151B2E', border: '1px solid #1E2638' }}
                                labelStyle={{ color: '#fff' }}
                            />
                            <Bar dataKey="users" fill="#0066FF" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <button
                    onClick={() => navigate('/admin/plans')}
                    className="bg-[#151B2E] hover:bg-[#1E2638] rounded-lg p-6 border border-[#1E2638] text-left transition-colors"
                >
                    <h3 className="text-lg font-bold text-white mb-2">Manage Plans</h3>
                    <p className="text-sm text-gray-400">Create and edit subscription plans</p>
                </button>

                <button
                    onClick={() => navigate('/admin/users')}
                    className="bg-[#151B2E] hover:bg-[#1E2638] rounded-lg p-6 border border-[#1E2638] text-left transition-colors"
                >
                    <h3 className="text-lg font-bold text-white mb-2">User Management</h3>
                    <p className="text-sm text-gray-400">View and manage all users</p>
                </button>

                <button
                    onClick={() => navigate('/admin/analytics')}
                    className="bg-[#151B2E] hover:bg-[#1E2638] rounded-lg p-6 border border-[#1E2638] text-left transition-colors"
                >
                    <h3 className="text-lg font-bold text-white mb-2">Analytics</h3>
                    <p className="text-sm text-gray-400">Detailed platform analytics</p>
                </button>
            </div>
        </DashboardLayout>
    );
};

export default AdminDashboard;
