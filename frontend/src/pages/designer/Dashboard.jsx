import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ClockIcon,
    CheckCircleIcon,
    SparklesIcon,
    StarIcon,
    ArrowRightIcon,
    PlayIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import useDesignerStore from '../../store/designerStore';
import useAuthStore from '../../store/authStore';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { format, formatDistanceToNow } from 'date-fns';

const Dashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { dashboardStats, fetchDashboardStats, isLoading } = useDesignerStore();

    useEffect(() => {
        fetchDashboardStats();
    }, [fetchDashboardStats]);

    const statCards = [
        {
            title: 'Active Tasks',
            value: dashboardStats?.activeTasks?.toString().padStart(2, '0') || '00',
            icon: SparklesIcon,
            color: 'blue',
            bgColor: 'bg-blue-50',
            iconColor: 'text-blue-600'
        },
        {
            title: 'Completed Today',
            value: dashboardStats?.completedToday?.toString().padStart(2, '0') || '00',
            icon: CheckCircleIcon,
            color: 'green',
            bgColor: 'bg-green-50',
            iconColor: 'text-green-600'
        },
        {
            title: 'Pending Review',
            value: dashboardStats?.pendingReview?.toString().padStart(2, '0') || '00',
            icon: ClockIcon,
            color: 'orange',
            bgColor: 'bg-orange-50',
            iconColor: 'text-orange-600'
        },
        {
            title: 'Avg Rating',
            value: dashboardStats?.avgRating?.toFixed(1) || '0.0',
            icon: StarIcon,
            color: 'yellow',
            bgColor: 'bg-yellow-50',
            iconColor: 'text-yellow-600'
        }
    ];

    const getStatusColor = (status) => {
        const colors = {
            'assigned': 'bg-blue-50 text-blue-700 border-blue-200',
            'in_progress': 'bg-purple-50 text-purple-700 border-purple-200',
            'pending_review': 'bg-orange-50 text-orange-700 border-orange-200',
            'completed': 'bg-green-50 text-green-700 border-green-200'
        };
        return colors[status] || 'bg-gray-50 text-gray-700 border-gray-200';
    };

    const getPriorityColor = (priority) => {
        return priority === 'urgent'
            ? 'bg-red-50 text-red-700 border-red-200'
            : 'bg-gray-50 text-gray-700 border-gray-200';
    };

    return (
        <DashboardLayout breadcrumbs={['Designer', 'Dashboard']}>
            <div className="space-y-8 animate-in fade-in duration-700">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-1">
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight">
                            Welcome back, <span className="text-blue-600">{user?.firstName || 'Designer'}</span>
                        </h1>
                        <p className="text-gray-500 font-medium">Ready to create something amazing today?</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/designer/tasks')}
                            className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-100 rounded-2xl text-gray-900 font-bold hover:bg-gray-50 transition-all shadow-sm"
                        >
                            <ClockIcon className="w-5 h-5 text-blue-600" />
                            <span>All Tasks</span>
                        </button>
                        <button
                            onClick={() => navigate('/designer/workspace')}
                            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
                        >
                            <PlayIcon className="w-5 h-5" />
                            <span>Start Working</span>
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {statCards.map((stat, index) => (
                        <div
                            key={index}
                            className="bg-white p-8 rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] relative overflow-hidden group hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-300"
                        >
                            <div className={`absolute top-0 right-0 w-32 h-32 ${stat.bgColor} rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-500`}></div>
                            <div className="relative z-10 flex flex-col justify-between h-full space-y-4">
                                <div className={`p-3 ${stat.bgColor} w-fit rounded-2xl`}>
                                    <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                                </div>
                                <div>
                                    <div className="text-4xl font-black text-gray-900 mb-1">{stat.value}</div>
                                    <div className="text-sm font-semibold text-gray-500">{stat.title}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Urgent Tasks & Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Urgent Tasks */}
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] p-8">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-red-50 rounded-xl">
                                    <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
                                </div>
                                <h2 className="text-2xl font-black text-gray-900">Urgent Tasks</h2>
                            </div>
                            <button
                                onClick={() => navigate('/designer/tasks?priority=urgent')}
                                className="text-blue-600 font-bold hover:text-blue-700 transition-colors"
                            >
                                View All
                            </button>
                        </div>

                        <div className="space-y-4">
                            {isLoading ? (
                                <div className="text-center py-8 text-gray-500">Loading...</div>
                            ) : dashboardStats?.urgentTasks && dashboardStats.urgentTasks.length > 0 ? (
                                dashboardStats.urgentTasks.map((task) => (
                                    <div
                                        key={task.id}
                                        onClick={() => navigate(`/designer/tasks/${task.id}`)}
                                        className="p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:bg-gray-100 transition-all cursor-pointer group"
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex-1">
                                                <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                                    {task.title}
                                                </h3>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    {task.client?.name || 'Client'}
                                                </p>
                                            </div>
                                            <ArrowRightIcon className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                                        </div>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getPriorityColor(task.priority)}`}>
                                                {task.priority === 'urgent' ? '🔥 Urgent' : 'Normal'}
                                            </span>
                                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700">
                                                {task.serviceType?.replace('_', ' ')}
                                            </span>
                                            {task.deadline && (
                                                <span className="text-xs text-red-600 font-semibold">
                                                    Due {formatDistanceToNow(new Date(task.deadline), { addSuffix: true })}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8">
                                    <div className="text-6xl mb-3">🎉</div>
                                    <p className="text-gray-500 font-medium">No urgent tasks!</p>
                                    <p className="text-sm text-gray-400">You're all caught up</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] p-8">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-50 rounded-xl">
                                    <ClockIcon className="w-6 h-6 text-blue-600" />
                                </div>
                                <h2 className="text-2xl font-black text-gray-900">Recent Activity</h2>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {isLoading ? (
                                <div className="text-center py-8 text-gray-500">Loading...</div>
                            ) : dashboardStats?.recentActivity && dashboardStats.recentActivity.length > 0 ? (
                                dashboardStats.recentActivity.slice(0, 5).map((activity) => (
                                    <div key={activity.id} className="flex items-start gap-4">
                                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                                        <div className="flex-1">
                                            <p className="text-sm text-gray-900 font-medium">
                                                {activity.description}
                                            </p>
                                            {activity.requestTitle && (
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {activity.requestTitle}
                                                </p>
                                            )}
                                            <p className="text-xs text-gray-400 mt-1">
                                                {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8">
                                    <div className="text-6xl mb-3">📋</div>
                                    <p className="text-gray-500 font-medium">No recent activity</p>
                                    <p className="text-sm text-gray-400">Start working on tasks to see activity</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Dashboard;
