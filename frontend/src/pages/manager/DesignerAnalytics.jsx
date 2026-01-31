import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import managerAPI from '../../api/manager';
import StatCard from '../../components/shared/StatCard';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartBarIcon, ClockIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import DashboardLayout from '../../components/layout/DashboardLayout';

const DesignerAnalyticsDetail = () => {
    const { id } = useParams();
    const [designer, setDesigner] = useState(null);
    const [stats, setStats] = useState({});
    const [performanceData, setPerformanceData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, [id]);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const response = await managerAPI.getDesignerAnalytics(id);
            setDesigner(response.data?.designer);
            setStats(response.data?.stats || {});
            setPerformanceData(response.data?.performance || []);
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout breadcrumbs={['Manager', 'Analytics', designer?.name || 'Designer']}>
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                        {designer?.name?.charAt(0) || 'D'}
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white">{designer?.name || 'Designer'}</h1>
                        <p className="text-gray-400">{designer?.email}</p>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="Tasks Completed"
                    value={stats.tasksCompleted || '0'}
                    icon={CheckCircleIcon}
                    color="success"
                    loading={loading}
                />
                <StatCard
                    title="Avg Turnaround"
                    value={`${stats.avgTurnaround || '0'}h`}
                    icon={ClockIcon}
                    color="primary"
                    loading={loading}
                />
                <StatCard
                    title="Client Satisfaction"
                    value={`${stats.satisfaction || '0'}%`}
                    icon={ChartBarIcon}
                    color="info"
                    loading={loading}
                />
                <StatCard
                    title="Revision Rate"
                    value={`${stats.revisionRate || '0'}%`}
                    icon={ChartBarIcon}
                    color="warning"
                    loading={loading}
                />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="bg-[#151B2E] rounded-lg p-6 border border-[#1E2638]">
                    <h3 className="text-lg font-bold text-white mb-4">Performance Trend</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={performanceData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1E2638" />
                            <XAxis dataKey="month" stroke="#94A3B8" />
                            <YAxis stroke="#94A3B8" />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#151B2E', border: '1px solid #1E2638' }}
                                labelStyle={{ color: '#fff' }}
                            />
                            <Line type="monotone" dataKey="completed" stroke="#0066FF" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-[#151B2E] rounded-lg p-6 border border-[#1E2638]">
                    <h3 className="text-lg font-bold text-white mb-4">Quality Metrics</h3>
                    <div className="space-y-4">
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-gray-400">First-Time Approval</span>
                                <span className="text-white font-medium">{stats.firstTimeApproval || 0}%</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2">
                                <div
                                    className="bg-green-500 h-2 rounded-full"
                                    style={{ width: `${stats.firstTimeApproval || 0}%` }}
                                />
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-gray-400">On-Time Delivery</span>
                                <span className="text-white font-medium">{stats.onTimeDelivery || 0}%</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2">
                                <div
                                    className="bg-blue-500 h-2 rounded-full"
                                    style={{ width: `${stats.onTimeDelivery || 0}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Detailed Stats */}
            <div className="grid grid-cols-3 gap-6">
                <div className="bg-[#151B2E] rounded-lg p-6 border border-[#1E2638]">
                    <h3 className="text-sm font-medium text-gray-400 mb-4">THIS MONTH</h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-300">Tasks</span>
                            <span className="text-white font-medium">{stats.monthlyTasks || 0}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-300">Hours</span>
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
                    <h3 className="text-sm font-medium text-blue-400 mb-2">TEAM RANK</h3>
                    <p className="text-4xl font-bold text-white mb-2">#{stats.rank || 1}</p>
                    <p className="text-sm text-gray-300">Out of {stats.totalDesigners || 10} designers</p>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default DesignerAnalyticsDetail;
