import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClockIcon, PlayIcon, CloudArrowUpIcon } from '@heroicons/react/24/outline';
import DashboardLayout from '../../components/layout/DashboardLayout';
import useAuthStore from '../../store/authStore';
import designerAPI from '../../api/designer';
import DataTable from '../../components/shared/DataTable';
import StatusBadge from '../../components/shared/StatusBadge';
import Tabs from '../../components/shared/Tabs';

const DesignerWorkspace = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [tasks, setTasks] = useState([]);
    const [priorityQueue, setPriorityQueue] = useState([]);
    const [submissions, setSubmissions] = useState([]);
    const [selectedTask, setSelectedTask] = useState(null);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            setLoading(true);
            const response = await designerAPI.getAssignedRequests();
            const allTasks = response.data || [];

            setTasks(allTasks.filter(t => t.status === 'in-progress'));
            setPriorityQueue(allTasks.filter(t => t.priority === 'urgent' || t.priority === 'high').slice(0, 2));
            setSubmissions(allTasks.filter(t => t.status === 'in-review'));
        } catch (error) {
            console.error('Failed to fetch tasks:', error);
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        { key: 'title', label: 'TASK NAME', sortable: true },
        {
            key: 'client',
            label: 'CLIENT',
            render: (val, row) => <span className="text-sm text-white">{row.client?.name || 'N/A'}</span>
        },
        {
            key: 'category',
            label: 'SERVICE',
            render: (val) => (
                <span className="px-2 py-1 bg-blue-500/10 text-blue-500 rounded text-xs uppercase">
                    {val}
                </span>
            )
        },
        {
            key: 'deadline',
            label: 'DEADLINE',
            render: (val) => <span className="text-sm text-white">{val || 'N/A'}</span>
        },
        {
            key: 'status',
            label: 'STATUS',
            render: (val) => <StatusBadge status={val} size="sm" />
        },
    ];

    return (
        <DashboardLayout breadcrumbs={['Designer', 'Workspace']}>
            <div className="flex gap-6">
                {/* Main Content */}
                <div className="flex-1">
                    {/* Header */}
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-white mb-2">Priority Queue</h1>
                        <p className="text-gray-400">Focus on the most urgent tasks first.</p>
                    </div>

                    {/* Priority Queue */}
                    <div className="grid grid-cols-2 gap-4 mb-8">
                        {priorityQueue.map((task) => (
                            <div
                                key={task.id}
                                className="bg-gradient-to-br from-red-500/20 to-orange-500/20 border-2 border-red-500 rounded-lg p-6 cursor-pointer hover:from-red-500/30 hover:to-orange-500/30 transition-all"
                                onClick={() => setSelectedTask(task)}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <span className="text-xs text-red-400 font-medium">URGENT • {task.deadline}</span>
                                        <h3 className="text-lg font-bold text-white mt-1">{task.title}</h3>
                                        <p className="text-sm text-gray-300 mt-1">Client: {task.client?.name}</p>
                                    </div>
                                    <div className="p-2 bg-red-500/20 rounded">
                                        <ClockIcon className="w-5 h-5 text-red-400" />
                                    </div>
                                </div>
                                <button className="px-4 py-2 bg-white text-red-600 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors">
                                    View Brief →
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* My Active Tasks */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-white">My Active Tasks</h2>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'text-gray-400 hover:text-white'}`}
                                >
                                    Grid
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'text-gray-400 hover:text-white'}`}
                                >
                                    List
                                </button>
                            </div>
                        </div>

                        <DataTable
                            columns={columns}
                            data={tasks}
                            loading={loading}
                            onRowClick={(row) => navigate(`/designer/tasks/${row.id}`)}
                            emptyMessage="No active tasks"
                        />
                    </div>

                    {/* Submissions for Review */}
                    <div>
                        <h2 className="text-xl font-bold text-white mb-4">Submissions for Review</h2>
                        <div className="space-y-3">
                            {submissions.map((submission) => (
                                <div
                                    key={submission.id}
                                    className="bg-[#151B2E] rounded-lg p-4 border border-[#1E2638] flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded"></div>
                                        <div>
                                            <h3 className="text-white font-medium">{submission.title}</h3>
                                            <p className="text-sm text-gray-400">Submitted for review</p>
                                        </div>
                                    </div>
                                    <StatusBadge status="in-review" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="w-96 space-y-6">
                    {selectedTask ? (
                        <div className="bg-[#151B2E] rounded-lg p-6 border border-[#1E2638]">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold text-white">Task Details</h3>
                                <button
                                    onClick={() => setSelectedTask(null)}
                                    className="text-gray-400 hover:text-white"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <p className="text-xs text-blue-400 font-medium mb-1">ACTIVE SESSION</p>
                                    <h2 className="text-xl font-bold text-white mb-2">{selectedTask.title}</h2>
                                    <p className="text-sm text-gray-400">
                                        {selectedTask.category} • Due in {selectedTask.deadline}
                                    </p>
                                </div>

                                <div className="p-4 bg-[#0A0E1A] rounded-lg">
                                    <h4 className="text-sm font-medium text-white mb-2">CREATIVE BRIEF</h4>
                                    <p className="text-sm text-gray-400">{selectedTask.description}</p>
                                </div>

                                <div>
                                    <h4 className="text-sm font-medium text-white mb-3">BRAND ASSETS</h4>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="p-3 bg-blue-500/10 rounded text-center">
                                            <div className="w-8 h-8 bg-blue-500 rounded mx-auto mb-1"></div>
                                            <p className="text-xs text-blue-400">Color Palette</p>
                                        </div>
                                        <div className="p-3 bg-blue-500/10 rounded text-center">
                                            <div className="w-8 h-8 bg-blue-500 rounded mx-auto mb-1"></div>
                                            <p className="text-xs text-blue-400">Logo Pack</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 bg-[#0A0E1A] rounded-lg">
                                    <h4 className="text-sm font-medium text-white mb-2">NOTES & ACTIVITY</h4>
                                    <div className="space-y-2">
                                        <div className="flex items-start gap-2">
                                            <div className="w-6 h-6 bg-gray-600 rounded-full flex-shrink-0"></div>
                                            <div>
                                                <p className="text-xs text-gray-400">Remember to use the new rounded corners for all cloud components.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => navigate(`/designer/tasks/${selectedTask.id}/upload`)}
                                    className="w-full px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium flex items-center justify-center gap-2"
                                >
                                    <PlayIcon className="w-5 h-5" />
                                    Start Work
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-[#151B2E] rounded-lg p-6 border border-[#1E2638] text-center">
                            <p className="text-gray-400">Select a task to view details</p>
                        </div>
                    )}

                    <button className="w-full px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium">
                        + New Project
                    </button>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default DesignerWorkspace;
