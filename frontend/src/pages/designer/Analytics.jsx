import { useEffect, useState } from 'react';
import {
    ChartBarIcon,
    ClockIcon,
    CheckCircleIcon,
    StarIcon,
    CalendarIcon
} from '@heroicons/react/24/outline';
import useAnalyticsStore from '../../store/analyticsStore';
import DashboardLayout from '../../components/layout/DashboardLayout';

const Analytics = () => {
    const { analytics, period, fetchAnalytics, setPeriod, isLoading } = useAnalyticsStore();
    const [selectedPeriod, setSelectedPeriod] = useState(period);

    useEffect(() => {
        fetchAnalytics(selectedPeriod);
    }, [selectedPeriod, fetchAnalytics]);

    const handlePeriodChange = (newPeriod) => {
        setSelectedPeriod(newPeriod);
        setPeriod(newPeriod);
    };

    const kpiCards = [
        {
            title: 'Tasks Completed',
            value: analytics?.totalCompleted?.toString() || '0',
            icon: CheckCircleIcon,
            color: 'green',
            bgColor: 'bg-green-50',
            iconColor: 'text-green-600'
        },
        {
            title: 'Avg Completion Time',
            value: analytics?.avgCompletionTime ? `${analytics.avgCompletionTime}h` : '0h',
            icon: ClockIcon,
            color: 'blue',
            bgColor: 'bg-blue-50',
            iconColor: 'text-blue-600'
        },
        {
            title: 'Client Satisfaction',
            value: analytics?.clientSatisfaction?.toFixed(1) || '0.0',
            icon: StarIcon,
            color: 'yellow',
            bgColor: 'bg-yellow-50',
            iconColor: 'text-yellow-600'
        },
        {
            title: 'Active Period',
            value: period.charAt(0).toUpperCase() + period.slice(1),
            icon: CalendarIcon,
            color: 'purple',
            bgColor: 'bg-purple-50',
            iconColor: 'text-purple-600'
        }
    ];

    const getServiceTypeColor = (type) => {
        const colors = {
            'graphic_design': 'bg-pink-50 text-pink-700',
            'video_production': 'bg-purple-50 text-purple-700',
            'web_development': 'bg-blue-50 text-blue-700',
            'social_media': 'bg-green-50 text-green-700',
            'branding': 'bg-orange-50 text-orange-700'
        };
        return colors[type] || 'bg-gray-50 text-gray-700';
    };

    return (
        <DashboardLayout breadcrumbs={['Designer', 'Analytics']}>
            <div className="space-y-8 animate-in fade-in duration-700">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight">Analytics</h1>
                        <p className="text-gray-500 font-medium mt-1">Track your performance and productivity</p>
                    </div>

                    {/* Period Selector */}
                    <div className="flex items-center gap-2 bg-white rounded-2xl border border-gray-100 p-1">
                        {['week', 'month', 'year'].map((p) => (
                            <button
                                key={p}
                                onClick={() => handlePeriodChange(p)}
                                className={`px-6 py-2 rounded-xl font-bold transition-all ${selectedPeriod === p
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                                        : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                {p.charAt(0).toUpperCase() + p.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {kpiCards.map((kpi, index) => (
                        <div
                            key={index}
                            className="bg-white p-8 rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] relative overflow-hidden group hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-300"
                        >
                            <div className={`absolute top-0 right-0 w-32 h-32 ${kpi.bgColor} rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-500`}></div>
                            <div className="relative z-10 flex flex-col justify-between h-full space-y-4">
                                <div className={`p-3 ${kpi.bgColor} w-fit rounded-2xl`}>
                                    <kpi.icon className={`w-6 h-6 ${kpi.iconColor}`} />
                                </div>
                                <div>
                                    <div className="text-4xl font-black text-gray-900 mb-1">{kpi.value}</div>
                                    <div className="text-sm font-semibold text-gray-500">{kpi.title}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {isLoading ? (
                    <div className="text-center py-20">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        <p className="mt-4 text-gray-500 font-medium">Loading analytics...</p>
                    </div>
                ) : (
                    <>
                        {/* Tasks by Service Type */}
                        {analytics?.tasksByType && Object.keys(analytics.tasksByType).length > 0 && (
                            <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] p-8">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-blue-50 rounded-xl">
                                        <ChartBarIcon className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <h2 className="text-2xl font-black text-gray-900">Tasks by Service Type</h2>
                                </div>

                                <div className="space-y-4">
                                    {Object.entries(analytics.tasksByType).map(([type, count]) => {
                                        const total = Object.values(analytics.tasksByType).reduce((a, b) => a + b, 0);
                                        const percentage = ((count / total) * 100).toFixed(1);

                                        return (
                                            <div key={type}>
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${getServiceTypeColor(type)}`}>
                                                        {type.replace('_', ' ')}
                                                    </span>
                                                    <span className="text-sm font-bold text-gray-900">
                                                        {count} tasks ({percentage}%)
                                                    </span>
                                                </div>
                                                <div className="w-full bg-gray-100 rounded-full h-3">
                                                    <div
                                                        className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                                                        style={{ width: `${percentage}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Tasks Timeline */}
                        {analytics?.tasksByDate && Object.keys(analytics.tasksByDate).length > 0 && (
                            <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] p-8">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-green-50 rounded-xl">
                                        <CalendarIcon className="w-6 h-6 text-green-600" />
                                    </div>
                                    <h2 className="text-2xl font-black text-gray-900">Completion Timeline</h2>
                                </div>

                                <div className="space-y-3">
                                    {Object.entries(analytics.tasksByDate)
                                        .sort(([dateA], [dateB]) => new Date(dateB) - new Date(dateA))
                                        .slice(0, 10)
                                        .map(([date, count]) => (
                                            <div key={date} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                                                <span className="text-sm font-bold text-gray-900">
                                                    {new Date(date).toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric'
                                                    })}
                                                </span>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm text-gray-600">{count} {count === 1 ? 'task' : 'tasks'}</span>
                                                    <CheckCircleIcon className="w-5 h-5 text-green-600" />
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        )}

                        {/* Empty State */}
                        {(!analytics?.tasksByType || Object.keys(analytics.tasksByType).length === 0) && (
                            <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] p-12 text-center">
                                <div className="text-8xl mb-4">📊</div>
                                <h3 className="text-2xl font-black text-gray-900 mb-2">No Data Yet</h3>
                                <p className="text-gray-500">Complete some tasks to see your analytics</p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </DashboardLayout>
    );
};

export default Analytics;
