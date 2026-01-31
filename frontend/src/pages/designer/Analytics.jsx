import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import designerAPI from '../../api/designer';
import StatCard from '../../components/shared/StatCard';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartBarIcon, ClockIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const DesignerAnalytics = () => {
    const [stats, setStats] = useState({});
    const [performanceData, setPerformanceData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const response = await designerAPI.getAnalytics();
            setStats(response.data?.stats || {});
            setPerformanceData(response.data?.performance || []);
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout breadcrumbs={['Designer', 'Analytics']}>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Performance Analytics</h1>
                <p className="text-gray-400">Track your productivity and quality metrics</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="Tasks Completed"
                    value={stats.tasksCompleted || '0'}
                    icon={CheckCircleIcon}
                    trend="up"
                    trendValue="+12 this month"
                    color="success"
                    loading={loading}
                />
                <StatCard
                    title="Avg Turnaround"
                    value={`${stats.avgTurnaround || '0'}h`}
                    icon={ClockIcon}
                    trend="down"
                    trendValue="Faster -2h"
                    color="primary"
                    loading={loading}
                />
                <StatCard
                    title="Client Satisfaction"
                    value={`${stats.satisfaction || '0'}%`}
                    icon={ChartBarIcon}
                    trend="up"
                    trendValue="+5%"
                    color="info"
                    loading={loading}
                />
                <StatCard
                    title="Revision Rate"
                    value={`${stats.revisionRate || '0'}%`}
                    icon={ChartBarIcon}
                    trend="down"
                    trendValue="-3%"
                    color="warning"
                    loading={loading}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Performance Trend */}
                <div className="bg-[#151B2E] rounded-lg p-6 border border-[#1E2638]">
                    <h3 className="text-lg font-bold text-white mb-4">Monthly Performance</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={performanceData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1E2638" />
                            <XAxis dataKey="month" stroke="#94A3B8" />
                            <YAxis stroke="#94A3B8" />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#151B2E', border: '1px solid #1E2638' }}
                                labelStyle={{ color: '#fff' }}
                            />
                            <Line type="monotone" dataKey="completed" stroke="#0066FF" strokeWidth={2} name="Completed" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Category Breakdown */}
                <div className="bg-[#151B2E] rounded-lg p-6 border border-[#1E2638]">
                    <h3 className="text-lg font-bold text-white mb-4">Tasks by Category</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={performanceData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1E2638" />
                            <XAxis dataKey="category" stroke="#94A3B8" />
                            <YAxis stroke="#94A3B8" />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#151B2E', border: '1px solid #1E2638' }}
                                labelStyle={{ color: '#fff' }}
                            />
                            <Bar dataKey="count" fill="#0066FF" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Detailed Stats */}
            <div className="grid grid-cols-3 gap-6">
                <div className="bg-[#151B2E] rounded-lg p-6 border border-[#1E2638]">
                    <h3 className="text-sm font-medium text-gray-400 mb-4">THIS MONTH</h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-300">Tasks Completed</span>
                            <span className="text-white font-medium">{stats.monthlyCompleted || 0}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-300">Hours Worked</span>
                            <span className="text-white font-medium">{stats.monthlyHours || 0}h</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-300">Revisions</span>
                            <span className="text-white font-medium">{stats.monthlyRevisions || 0}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-[#151B2E] rounded-lg p-6 border border-[#1E2638]">
                    <h3 className="text-sm font-medium text-gray-400 mb-4">ALL TIME</h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-300">Total Tasks</span>
                            <span className="text-white font-medium">{stats.totalTasks || 0}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-300">Total Hours</span>
                            <span className="text-white font-medium">{stats.totalHours || 0}h</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-300">Avg Rating</span>
                            <span className="text-white font-medium">{stats.avgRating || 0}⭐</span>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 border-2 border-blue-500 rounded-lg p-6">
                    <h3 className="text-sm font-medium text-blue-400 mb-2">PERFORMANCE RANK</h3>
                    <p className="text-4xl font-bold text-white mb-2">Top 10%</p>
                    <p className="text-sm text-gray-300">Among all designers</p>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default DesignerAnalytics;
