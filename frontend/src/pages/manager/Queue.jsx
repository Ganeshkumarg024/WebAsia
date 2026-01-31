import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ExclamationTriangleIcon, ClockIcon, UsersIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import managerAPI from '../../api/manager';
import DataTable from '../../components/shared/DataTable';
import StatusBadge from '../../components/shared/StatusBadge';
import Tabs from '../../components/shared/Tabs';
import StatCard from '../../components/shared/StatCard';
import DashboardLayout from '../../components/layout/DashboardLayout';

const ManagerQueue = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({});
    const [pendingTasks, setPendingTasks] = useState([]);
    const [deliverables, setDeliverables] = useState([]);
    const [approved, setApproved] = useState([]);
    const [teamWorkload, setTeamWorkload] = useState([]);
    const [slaAlerts, setSlaAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [triageMode, setTriageMode] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [statsRes, pendingRes, teamRes] = await Promise.all([
                managerAPI.getDashboardStats(),
                managerAPI.getPendingRequests(),
                managerAPI.getTeamWorkload(),
            ]);

            setStats(statsRes.data || {});
            const tasks = pendingRes.data || [];
            setPendingTasks(tasks.filter(t => t.status === 'in-review'));
            setDeliverables(tasks.filter(t => t.status === 'pending-feedback'));
            setApproved(tasks.filter(t => t.status === 'completed').slice(0, 10));
            setTeamWorkload(teamRes.data || []);
            setSlaAlerts(tasks.filter(t => t.slaStatus === 'overdue' || t.slaStatus === 'critical'));
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            key: 'thumbnail',
            label: 'PROJECT',
            render: (val, row) => (
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-gray-600 to-gray-700 rounded"></div>
                    <div>
                        <p className="text-white font-medium">{row.title}</p>
                        <p className="text-xs text-gray-400">{row.category}</p>
                    </div>
                </div>
            ),
        },
        {
            key: 'designer',
            label: 'DESIGNER',
            render: (val, row) => (
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-white">{row.designer?.name || 'Unassigned'}</span>
                </div>
            ),
        },
        {
            key: 'priority',
            label: 'PRIORITY',
            render: (val) => <StatusBadge status={val} size="sm" />,
        },
        {
            key: 'sla',
            label: 'SLA / STATUS',
            render: (val, row) => (
                <div>
                    <div className={`text-sm font-medium ${row.slaStatus === 'overdue' ? 'text-red-500' :
                        row.slaStatus === 'critical' ? 'text-orange-500' :
                            'text-blue-500'
                        }`}>
                        {row.slaTime || 'N/A'}
                    </div>
                    <div className="text-xs text-gray-400">{row.slaStatus}</div>
                </div>
            ),
        },
        {
            key: 'actions',
            label: 'ACTIONS',
            sortable: false,
            render: (val, row) => (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/manager/review/${row.id}`);
                    }}
                    className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm"
                >
                    Review
                </button>
            ),
        },
    ];

    const tabs = [
        {
            label: 'Pending QC',
            count: pendingTasks.length,
            content: (
                <DataTable
                    columns={columns}
                    data={pendingTasks}
                    loading={loading}
                    onRowClick={(row) => navigate(`/manager/review/${row.id}`)}
                />
            ),
        },
        {
            label: 'Deliverables',
            count: deliverables.length,
            content: (
                <DataTable
                    columns={columns}
                    data={deliverables}
                    loading={loading}
                    onRowClick={(row) => navigate(`/manager/review/${row.id}`)}
                />
            ),
        },
        {
            label: 'Recently Approved',
            content: (
                <DataTable
                    columns={columns}
                    data={approved}
                    loading={loading}
                    onRowClick={(row) => navigate(`/manager/review/${row.id}`)}
                />
            ),
        },
    ];

    return (
        <DashboardLayout breadcrumbs={['Manager', 'Queue']}>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-1">Manager Control Tower</h1>
                    <p className="text-gray-400">Reviewing 24 pending submissions across 12 clients.</p>
                </div>
                <button
                    onClick={() => setTriageMode(!triageMode)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${triageMode
                        ? 'bg-blue-500 text-white'
                        : 'bg-[#151B2E] text-blue-500 border border-blue-500'
                        }`}
                >
                    ⚡ Quick Triage Mode
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mb-6">
                <StatCard
                    title="Pending Quality Check"
                    value={stats.pendingQC || '24'}
                    trend="up"
                    trendValue="+4 since 1hr ago"
                    color="warning"
                    loading={loading}
                />
                <StatCard
                    title="Critical SLA Alerts"
                    value={stats.slaAlerts || '5'}
                    icon={ExclamationTriangleIcon}
                    color="error"
                    loading={loading}
                />
                <StatCard
                    title="Avg. Review Time"
                    value={stats.avgReviewTime || '14m'}
                    icon={ClockIcon}
                    trend="down"
                    trendValue="Faster -16m"
                    color="success"
                    loading={loading}
                />
                <StatCard
                    title="Team Capacity"
                    value={stats.teamCapacity || '82%'}
                    icon={UsersIcon}
                    color="info"
                    loading={loading}
                />
            </div>

            <div className="grid grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="col-span-2">
                    <Tabs tabs={tabs} />
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Designer Workload */}
                    <div className="bg-[#151B2E] rounded-lg p-6 border border-[#1E2638]">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-white">Designer Workload</h3>
                            <button className="text-blue-500 text-sm">5/5 Active</button>
                        </div>
                        <div className="space-y-3">
                            {teamWorkload.map((designer, index) => (
                                <div key={index}>
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm text-white">{designer.name}</span>
                                        <span className="text-sm text-blue-500">{designer.tasks} Tasks</span>
                                    </div>
                                    <div className="w-full bg-gray-700 rounded-full h-2">
                                        <div
                                            className="bg-blue-500 h-2 rounded-full"
                                            style={{ width: `${(designer.tasks / 10) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className="w-full mt-4 px-4 py-2 bg-[#0A0E1A] hover:bg-gray-800 text-white rounded text-sm">
                            Manage Team
                        </button>
                    </div>

                    {/* SLA Alert Widget */}
                    <div className="bg-gradient-to-br from-red-500/20 to-orange-500/20 border-2 border-red-500 rounded-lg p-6">
                        <h3 className="text-lg font-bold text-white mb-4">⚠️ SLA Alert Widget</h3>
                        <div className="space-y-3">
                            {slaAlerts.slice(0, 2).map((alert, index) => (
                                <div key={index} className="p-3 bg-red-500/20 rounded">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm font-medium text-red-400">{alert.title}</span>
                                        <span className="text-xs text-red-400">{alert.slaTime}</span>
                                    </div>
                                    <p className="text-xs text-gray-300">{alert.slaStatus}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Batch Actions */}
                    <div className="bg-[#151B2E] rounded-lg p-6 border border-[#1E2638]">
                        <h3 className="text-sm font-bold text-white mb-4">Batch Processing</h3>
                        <div className="space-y-2">
                            <button className="w-full px-4 py-2 bg-green-500/10 hover:bg-green-500/20 text-green-500 rounded flex items-center justify-center gap-2">
                                <CheckCircleIcon className="w-4 h-4" />
                                APPROVE ALL
                            </button>
                            <button className="w-full px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded flex items-center justify-center gap-2">
                                <ExclamationTriangleIcon className="w-4 h-4" />
                                REASSIGN
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default ManagerQueue;
