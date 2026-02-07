import React, { useEffect, useMemo } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import useAdminStore from '../../store/adminStore';
import {
    UsersIcon,
    CurrencyDollarIcon,
    ClipboardDocumentListIcon,
    ArrowUpIcon,
    ArrowDownIcon,
    ChartBarIcon,
    BoltIcon,
    UserGroupIcon,
    ClockIcon,
    CheckCircleIcon,
    ExclamationCircleIcon,
    ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
    const { stats, pods, analytics, loading, fetchStats, fetchPods, fetchAdminAnalytics } = useAdminStore();

    useEffect(() => {
        fetchStats();
        fetchPods();
        fetchAdminAnalytics('30d');
    }, []);

    const statCards = [
        { label: 'Total Users', value: stats.users?.total || 0, change: '+12%', icon: UsersIcon, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Active Revenue (MRR)', value: `$${(stats.revenue?.total || 0).toLocaleString()}`, change: '+8.4%', icon: CurrencyDollarIcon, color: 'text-green-600', bg: 'bg-green-50' },
        { label: 'Pending Requests', value: stats.requests?.active || 0, change: '-4%', icon: ClipboardDocumentListIcon, color: 'text-orange-600', bg: 'bg-orange-50' },
        { label: 'Active Subscriptions', value: stats.revenue?.activeSubscriptions || 0, change: '+5%', icon: BoltIcon, color: 'text-purple-600', bg: 'bg-purple-50' },
    ];

    const chartData = useMemo(() => {
        if (!analytics?.dailyStats || analytics.dailyStats.length === 0) {
            // Fallback measurements if no data
            return [40, 60, 45, 80, 70, 95].map((h, i) => ({
                height: h,
                label: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][i]
            }));
        }
        // Normalize data for chart height (0-100%)
        const maxRev = Math.max(...analytics.dailyStats.map(d => d.revenue), 100);
        return analytics.dailyStats.slice(-7).map(d => ({
            height: Math.max((d.revenue / maxRev) * 100, 10), // Min 10% height
            label: d.name
        }));
    }, [analytics]);

    return (
        <DashboardLayout breadcrumbs={['Admin', 'Dashboard']}>
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Command Center</h1>
                    <p className="text-gray-500 font-medium mt-1">Real-time health of the WebAsia platform.</p>
                </div>
                <div className="text-right hidden md:block">
                    <p className="text-sm font-bold text-gray-900">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {statCards.map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-lg transition-all group">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <span className={`text-xs font-black flex items-center gap-1 px-2 py-1 rounded-lg ${stat.change.startsWith('+') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                {stat.change.startsWith('+') ? <ArrowUpIcon className="w-3 h-3" /> : <ArrowDownIcon className="w-3 h-3" />}
                                {stat.change}
                            </span>
                        </div>
                        <h3 className="text-3xl font-black text-gray-900 tracking-tight">{stat.value}</h3>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-2">{stat.label}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Platform Growth Chart */}
                    <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
                        <div className="flex items-center justify-between mb-10">
                            <div>
                                <h2 className="text-xl font-black text-gray-900 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                                        <ChartBarIcon className="w-6 h-6" />
                                    </div>
                                    Revenue Intelligence
                                </h2>
                            </div>
                            <select className="text-xs font-bold bg-gray-50 border-none rounded-xl px-4 py-2 text-gray-600 focus:ring-2 focus:ring-blue-500/50 cursor-pointer hover:bg-gray-100 transition-colors">
                                <option>Last 7 Days</option>
                                <option>Last 30 Days</option>
                                <option>This Quarter</option>
                            </select>
                        </div>
                        <div className="h-64 flex items-end gap-4 px-2">
                            {chartData.map((data, i) => (
                                <div key={i} className="flex-1 flex flex-col justify-end group relative h-full">
                                    <div className="flex-1 w-full flex items-end">
                                        <div
                                            className={`w-full rounded-t-2xl transition-all duration-500 ease-out group-hover:bg-blue-500 ${i === chartData.length - 1 ? 'bg-blue-600 shadow-lg shadow-blue-500/30' : 'bg-blue-100'}`}
                                            style={{ height: `${data.height}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-[10px] font-bold text-gray-400 text-center mt-3 uppercase tracking-wider">{data.label}</span>

                                    {/* Tooltip */}
                                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                                        Rev: {Math.round(data.height * 10)}$
                                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white rounded-[32px] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden">
                        <div className="p-8 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="text-xl font-black text-gray-900 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600">
                                    <BoltIcon className="w-6 h-6" />
                                </div>
                                High-Priority Queue
                            </h2>
                            <Link to="/admin/requests" className="text-xs font-black text-blue-600 hover:text-blue-700 uppercase tracking-widest bg-blue-50 px-4 py-2 rounded-xl border border-blue-100 transition-all hover:bg-blue-100">View All</Link>
                        </div>
                        <div className="divide-y divide-gray-50">
                            {loading ? (
                                <div className="p-12 text-center text-gray-400 animate-pulse font-bold text-sm">Loading activity...</div>
                            ) : stats.recentRequests?.length > 0 ? (
                                stats.recentRequests.map((req) => (
                                    <div key={req.id} className="p-6 hover:bg-gray-50/50 transition-colors flex items-center justify-between group">
                                        <div className="flex items-center gap-5">
                                            <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-500 font-black text-sm shrink-0 border border-gray-200 group-hover:border-blue-200 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all">
                                                {req.serviceType?.charAt(0)}
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">{req.title}</h4>
                                                <p className="text-[11px] text-gray-500 font-medium">Client: <span className="text-gray-900">{req.client?.firstName}</span> • {req.status?.replace('_', ' ')}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className={`px-3 py-1.5 text-[10px] font-black rounded-lg uppercase tracking-wider border ${req.priority === 'urgent' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                                                {req.priority}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-12 text-center text-gray-400 text-sm font-medium">No urgent requests pending.</div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
                        <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600">
                                <UserGroupIcon className="w-6 h-6" />
                            </div>
                            Pod Health
                        </h2>
                        <div className="space-y-6">
                            {(pods || []).length > 0 ? (pods || []).slice(0, 5).map((pod, i) => (
                                <div key={pod.id || i}>
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="text-xs font-bold text-gray-900">{pod.firstName || 'Manager'}'s Pod</h4>
                                        <span className="text-[10px] font-black text-gray-400">{pod.utilization || 0}% Load</span>
                                    </div>
                                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div className={`h-full rounded-full ${['bg-green-500', 'bg-orange-500', 'bg-blue-500', 'bg-purple-500'][i % 4]}`} style={{ width: `${pod.utilization || 0}%` }}></div>
                                    </div>
                                    <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase tracking-wide">Lead: {pod.firstName} {pod.lastName}</p>
                                </div>
                            )) : (
                                <p className="text-xs text-gray-400 font-bold italic text-center py-4">No active pods.</p>
                            )}
                        </div>
                        <Link to="/admin/team-mapping" className="w-full mt-8 flex justify-center py-3 text-xs font-black text-blue-600 border-2 border-blue-50 rounded-xl hover:bg-blue-50 hover:border-blue-100 transition-all uppercase tracking-widest">Manage Pods</Link>
                    </div>

                    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-[32px] shadow-xl shadow-blue-600/20 text-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform"></div>
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-10 -mb-10 group-hover:scale-110 transition-transform delay-75"></div>

                        <div className="relative z-10">
                            <h2 className="text-xl font-black mb-1">System Metrics</h2>
                            <p className="text-xs text-blue-100 mb-8 font-medium opacity-80">Real-time throughput analysis</p>

                            <div className="space-y-5">
                                <div className="flex items-center justify-between p-3 bg-white/10 rounded-2xl border border-white/10 backdrop-blur-sm">
                                    <span className="text-xs font-bold text-blue-50 flex items-center gap-2">
                                        <ClockIcon className="w-4 h-4" /> Avg. TAT
                                    </span>
                                    <span className="text-sm font-black">{analytics?.performance?.avgTat || '24h'}</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-white/10 rounded-2xl border border-white/10 backdrop-blur-sm">
                                    <span className="text-xs font-bold text-blue-50 flex items-center gap-2">
                                        <CheckCircleIcon className="w-4 h-4" /> SLA Compliance
                                    </span>
                                    <span className="text-sm font-black">{analytics?.performance?.slaCompliance || '99%'}</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-white/10 rounded-2xl border border-white/10 backdrop-blur-sm">
                                    <span className="text-xs font-bold text-blue-50 flex items-center gap-2">
                                        <ExclamationCircleIcon className="w-4 h-4" /> Escalations
                                    </span>
                                    <span className="text-sm font-black text-orange-300">{analytics?.performance?.escalations || 0} Active</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
                        <h2 className="text-xl font-black text-gray-900 mb-6">Quick Actions</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <Link to="/admin/users" className="p-4 bg-gray-50 rounded-2xl hover:bg-blue-50 transition-all text-center border border-gray-100 hover:border-blue-100 group">
                                <UsersIcon className="w-6 h-6 mx-auto mb-2 text-gray-400 group-hover:text-blue-600 transition-colors" />
                                <span className="text-[10px] font-black text-gray-600 group-hover:text-blue-700 uppercase tracking-wide">Users</span>
                            </Link>
                            <Link to="/admin/financials" className="p-4 bg-gray-50 rounded-2xl hover:bg-green-50 transition-all text-center border border-gray-100 hover:border-green-100 group">
                                <CurrencyDollarIcon className="w-6 h-6 mx-auto mb-2 text-gray-400 group-hover:text-green-600 transition-colors" />
                                <span className="text-[10px] font-black text-gray-600 group-hover:text-green-700 uppercase tracking-wide">Revenue</span>
                            </Link>
                            <Link to="/admin/communication" className="p-4 bg-gray-50 rounded-2xl hover:bg-purple-50 transition-all text-center border border-gray-100 hover:border-purple-100 group">
                                <ChatBubbleLeftRightIcon className="w-6 h-6 mx-auto mb-2 text-gray-400 group-hover:text-purple-600 transition-colors" />
                                <span className="text-[10px] font-black text-gray-600 group-hover:text-purple-700 uppercase tracking-wide">Comm Hub</span>
                            </Link>
                            <Link to="/admin/plans" className="p-4 bg-gray-50 rounded-2xl hover:bg-orange-50 transition-all text-center border border-gray-100 hover:border-orange-100 group">
                                <ClipboardDocumentListIcon className="w-6 h-6 mx-auto mb-2 text-gray-400 group-hover:text-orange-600 transition-colors" />
                                <span className="text-[10px] font-black text-gray-600 group-hover:text-orange-700 uppercase tracking-wide">Plans</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AdminDashboard;
