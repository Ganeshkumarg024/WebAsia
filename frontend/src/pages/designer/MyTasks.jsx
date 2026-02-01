import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    FunnelIcon,
    MagnifyingGlassIcon,
    PlayIcon,
    EyeIcon,
    ClockIcon,
    UserCircleIcon
} from '@heroicons/react/24/outline';
import useDesignerStore from '../../store/designerStore';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { format, formatDistanceToNow } from 'date-fns';

const MyTasks = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const { tasks, pagination, fetchMyTasks, startTask, isLoading } = useDesignerStore();

    const [filters, setFilters] = useState({
        status: searchParams.get('status') || '',
        priority: searchParams.get('priority') || '',
        serviceType: searchParams.get('serviceType') || '',
        search: ''
    });

    useEffect(() => {
        const params = {};
        if (filters.status) params.status = filters.status;
        if (filters.priority) params.priority = filters.priority;
        if (filters.serviceType) params.serviceType = filters.serviceType;

        fetchMyTasks(params);
    }, [filters.status, filters.priority, filters.serviceType, fetchMyTasks]);

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        if (value) {
            searchParams.set(key, value);
        } else {
            searchParams.delete(key);
        }
        setSearchParams(searchParams);
    };

    const handleStartTask = async (taskId, e) => {
        e.stopPropagation();
        const result = await startTask(taskId);
        if (result.success) {
            navigate(`/designer/workspace?task=${taskId}`);
        }
    };

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

    const getServiceTypeIcon = (type) => {
        const icons = {
            'graphic_design': '🎨',
            'video_production': '🎬',
            'web_development': '💻',
            'social_media': '📱',
            'branding': '✨'
        };
        return icons[type] || '📄';
    };

    const filteredTasks = tasks.filter(task => {
        if (!filters.search) return true;
        const searchLower = filters.search.toLowerCase();
        return (
            task.title?.toLowerCase().includes(searchLower) ||
            task.description?.toLowerCase().includes(searchLower) ||
            task.client?.firstName?.toLowerCase().includes(searchLower) ||
            task.client?.lastName?.toLowerCase().includes(searchLower)
        );
    });

    return (
        <DashboardLayout breadcrumbs={['Designer', 'My Tasks']}>
            <div className="space-y-6 animate-in fade-in duration-700">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight">My Tasks</h1>
                        <p className="text-gray-500 font-medium mt-1">
                            {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'} found
                        </p>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Search */}
                        <div className="relative">
                            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search tasks..."
                                value={filters.search}
                                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                            />
                        </div>

                        {/* Status Filter */}
                        <select
                            value={filters.status}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                            className="px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium appearance-none cursor-pointer"
                        >
                            <option value="">All Status</option>
                            <option value="assigned">Assigned</option>
                            <option value="in_progress">In Progress</option>
                            <option value="pending_review">Pending Review</option>
                        </select>

                        {/* Priority Filter */}
                        <select
                            value={filters.priority}
                            onChange={(e) => handleFilterChange('priority', e.target.value)}
                            className="px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium appearance-none cursor-pointer"
                        >
                            <option value="">All Priority</option>
                            <option value="normal">Normal</option>
                            <option value="urgent">Urgent</option>
                        </select>

                        {/* Service Type Filter */}
                        <select
                            value={filters.serviceType}
                            onChange={(e) => handleFilterChange('serviceType', e.target.value)}
                            className="px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium appearance-none cursor-pointer"
                        >
                            <option value="">All Services</option>
                            <option value="graphic_design">Graphic Design</option>
                            <option value="video_production">Video Production</option>
                            <option value="web_development">Web Development</option>
                            <option value="social_media">Social Media</option>
                            <option value="branding">Branding</option>
                        </select>
                    </div>
                </div>

                {/* Tasks Grid */}
                {isLoading ? (
                    <div className="text-center py-20">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        <p className="mt-4 text-gray-500 font-medium">Loading tasks...</p>
                    </div>
                ) : filteredTasks.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredTasks.map((task) => (
                            <div
                                key={task.id}
                                onClick={() => navigate(`/designer/tasks/${task.id}`)}
                                className="bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] p-6 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 cursor-pointer group"
                            >
                                {/* Client Info */}
                                <div className="flex items-center gap-3 mb-4">
                                    {task.client?.photoUrl ? (
                                        <img
                                            src={task.client.photoUrl}
                                            alt={`${task.client.firstName} ${task.client.lastName}`}
                                            className="w-10 h-10 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                                            <UserCircleIcon className="w-6 h-6 text-blue-600" />
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-gray-900 truncate">
                                            {task.client ? `${task.client.firstName} ${task.client.lastName}` : 'Client'}
                                        </p>
                                        <p className="text-xs text-gray-500 truncate">
                                            {task.client?.email || 'No email'}
                                        </p>
                                    </div>
                                </div>

                                {/* Task Title */}
                                <h3 className="text-lg font-black text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                                    {task.title}
                                </h3>

                                {/* Task Description */}
                                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                    {task.description || 'No description provided'}
                                </p>

                                {/* Badges */}
                                <div className="flex items-center gap-2 flex-wrap mb-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(task.status)}`}>
                                        {task.status?.replace('_', ' ')}
                                    </span>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getPriorityColor(task.priority)}`}>
                                        {task.priority === 'urgent' ? '🔥 Urgent' : 'Normal'}
                                    </span>
                                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-50 text-gray-700">
                                        {getServiceTypeIcon(task.serviceType)} {task.serviceType?.replace('_', ' ')}
                                    </span>
                                </div>

                                {/* Deadline */}
                                {task.deadline && (
                                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                                        <ClockIcon className="w-4 h-4" />
                                        <span>Due {formatDistanceToNow(new Date(task.deadline), { addSuffix: true })}</span>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(`/designer/tasks/${task.id}`);
                                        }}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-50 text-gray-900 rounded-xl font-bold hover:bg-gray-100 transition-all"
                                    >
                                        <EyeIcon className="w-4 h-4" />
                                        <span>View</span>
                                    </button>
                                    {task.status === 'assigned' && (
                                        <button
                                            onClick={(e) => handleStartTask(task.id, e)}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all"
                                        >
                                            <PlayIcon className="w-4 h-4" />
                                            <span>Start</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <div className="text-8xl mb-4">📋</div>
                        <h3 className="text-2xl font-black text-gray-900 mb-2">No tasks found</h3>
                        <p className="text-gray-500">Try adjusting your filters or check back later</p>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default MyTasks;
