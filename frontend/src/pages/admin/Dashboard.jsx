import React, { useEffect } from 'react';
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
    ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
    const { stats, loading, fetchStats } = useAdminStore();

    useEffect(() => {
        fetchStats();
    }, []);

    const statCards = [
        { label: 'Total Users', value: stats.users?.total || 0, change: '+12%', icon: UsersIcon, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
        { label: 'Active Revenue (MRR)', value: `$${(stats.revenue?.total || 0).toLocaleString()}`, change: '+8.4%', icon: CurrencyDollarIcon, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
        { label: 'Pending Requests', value: stats.requests?.active || 0, change: '-4%', icon: ClipboardDocumentListIcon, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20' },
        { label: 'Active Subscriptions', value: stats.revenue?.activeSubscriptions || 0, change: '+5%', icon: BoltIcon, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
    ];

    return (
        <DashboardLayout breadcrumbs={['Admin', 'Dashboard']}>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Command Center Overview</h1>
                    <p className="text-sm text-gray-500 mt-1">Real-time health of the WebAsia platform.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {statCards.map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-2 rounded-xl ${stat.bg} ${stat.color}`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <span className={`text-xs font-bold flex items-center gap-1 ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-500'}`}>
                                {stat.change.startsWith('+') ? <ArrowUpIcon className="w-3 h-3" /> : <ArrowDownIcon className="w-3 h-3" />}
                                {stat.change}
                            </span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</h3>
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-widest mt-1">{stat.label}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Platform Growth Chart Placeholder */}
                    <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <ChartBarIcon className="w-5 h-5 text-blue-600" />
                                Revenue Growth
                            </h2>
                            <select className="text-xs font-bold bg-gray-50 dark:bg-slate-800 border-none rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-500/50">
                                <option>Last 6 Months</option>
                                <option>Last Year</option>
                            </select>
                        </div>
                        <div className="h-64 flex items-end gap-3 px-4">
                            {[40, 60, 45, 80, 70, 95].map((h, i) => (
                                <div key={i} className="flex-1 group relative">
                                    <div
                                        className={`w-full rounded-t-xl transition-all ${i === 5 ? 'bg-blue-600 shadow-lg shadow-blue-500/20' : 'bg-blue-100 dark:bg-blue-900/20 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/40'}`}
                                        style={{ height: `${h}%` }}
                                    ></div>
                                    <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-gray-400">
                                        {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][i]}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <BoltIcon className="w-5 h-5 text-orange-600" />
                                Recent High-Priority Requests
                            </h2>
                            <Link to="/admin/requests" className="text-xs font-bold text-blue-600 hover:underline">View All</Link>
                        </div>
                        <div className="divide-y divide-gray-50 dark:divide-slate-800">
                            {loading ? (
                                <div className="p-12 text-center text-gray-400 animate-pulse">Loading requests...</div>
                            ) : stats.recentRequests?.length > 0 ? (
                                stats.recentRequests.map((req) => (
                                    <div key={req.id} className="p-4 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-gray-500 font-bold text-xs shrink-0">
                                                {req.serviceType?.charAt(0)}
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-gray-900 dark:text-white">{req.title}</h4>
                                                <p className="text-[11px] text-gray-500">Client: {req.client?.firstName} • {req.status}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className={`px-2 py-1 text-[10px] font-bold rounded uppercase ${req.priority === 'urgent' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                                                {req.priority}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-8 text-center text-gray-400 text-sm italic">No recent priority requests.</div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                            <UserGroupIcon className="w-5 h-5 text-purple-600" />
                            Pod Health
                        </h2>
                        <div className="space-y-6">
                            {[
                                { name: 'Operations Root', head: 'Marcus Chen', load: 84, color: 'bg-green-500' },
                                { name: 'Video Graphics', head: 'Sarah J.', load: 92, color: 'bg-orange-500' },
                                { name: 'Web & App', head: 'Alex R.', load: 65, color: 'bg-blue-500' },
                            ].map((pod, i) => (
                                <div key={i}>
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="text-xs font-bold text-gray-900 dark:text-white">{pod.name}</h4>
                                        <span className="text-[10px] font-bold text-gray-400">{pod.load}% Workload</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <div className={`h-full ${pod.color}`} style={{ width: `${pod.load}%` }}></div>
                                    </div>
                                    <p className="text-[10px] text-gray-500 mt-2">Lead: {pod.head}</p>
                                </div>
                            ))}
                        </div>
                        <Link to="/admin/team-mapping" className="w-full mt-8 flex justify-center py-2.5 text-xs font-bold text-blue-600 border border-blue-600/10 rounded-xl hover:bg-blue-50 transition-all">Manage Pods</Link>
                    </div>

                    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-2xl shadow-xl shadow-blue-500/20 text-white relative overflow-hidden">
                        <div className="relative z-10">
                            <h2 className="text-lg font-bold mb-2">System Performance</h2>
                            <p className="text-xs text-blue-100 mb-6">Real-time throughput metrics</p>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-medium text-blue-50 flex items-center gap-2">
                                        <ClockIcon className="w-4 h-4" /> Avg. TAT
                                    </span>
                                    <span className="text-sm font-bold">18.4 Hours</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-medium text-blue-50 flex items-center gap-2">
                                        <CheckCircleIcon className="w-4 h-4" /> SLA Compliance
                                    </span>
                                    <span className="text-sm font-bold">98.2%</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-medium text-blue-50 flex items-center gap-2">
                                        <ExclamationCircleIcon className="w-4 h-4" /> Escalations
                                    </span>
                                    <span className="text-sm font-bold">3 Active</span>
                                </div>
                            </div>
                        </div>
                        <div className="absolute -right-8 -bottom-8 opacity-10">
                            <ChartBarIcon className="w-32 h-32" />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Quick Actions</h2>
                        <div className="grid grid-cols-2 gap-3">
                            <Link to="/admin/users" className="p-4 bg-gray-50 dark:bg-slate-800 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all text-center">
                                <UsersIcon className="w-5 h-5 mx-auto mb-2 text-blue-600" />
                                <span className="text-[10px] font-bold text-gray-700 dark:text-gray-300 uppercase">Users</span>
                            </Link>
                            <Link to="/admin/financials" className="p-4 bg-gray-50 dark:bg-slate-800 rounded-xl hover:bg-green-50 dark:hover:bg-green-900/20 transition-all text-center">
                                <CurrencyDollarIcon className="w-5 h-5 mx-auto mb-2 text-green-600" />
                                <span className="text-[10px] font-bold text-gray-700 dark:text-gray-300 uppercase">Revenue</span>
                            </Link>
                            <Link to="/admin/communication" className="p-4 bg-gray-50 dark:bg-slate-800 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all text-center">
                                <BoltIcon className="w-5 h-5 mx-auto mb-2 text-purple-600" />
                                <span className="text-[10px] font-bold text-gray-700 dark:text-gray-300 uppercase">Comm Hub</span>
                            </Link>
                            <Link to="/admin/plans" className="p-4 bg-gray-50 dark:bg-slate-800 rounded-xl hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all text-center">
                                <ClipboardDocumentListIcon className="w-5 h-5 mx-auto mb-2 text-orange-600" />
                                <span className="text-[10px] font-bold text-gray-700 dark:text-gray-300 uppercase">Plans</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AdminDashboard;
