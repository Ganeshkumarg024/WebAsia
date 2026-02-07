import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    MagnifyingGlassIcon,
    EyeIcon,
    PaperAirplaneIcon,
    ClockIcon,
    UserCircleIcon
} from '@heroicons/react/24/outline';
import useDesignerStore from '../../store/designerStore';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { formatDistanceToNow } from 'date-fns';

const Submissions = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const { tasks, fetchMyTasks, isLoading } = useDesignerStore();

    const [filters, setFilters] = useState({
        priority: searchParams.get('priority') || '',
        serviceType: searchParams.get('serviceType') || '',
        search: ''
    });

    useEffect(() => {
        const params = { status: 'pending_review' };
        if (filters.priority) params.priority = filters.priority;
        if (filters.serviceType) params.serviceType = filters.serviceType;

        fetchMyTasks(params);
    }, [filters.priority, filters.serviceType, fetchMyTasks]);

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        if (value) {
            searchParams.set(key, value);
        } else {
            searchParams.delete(key);
        }
        setSearchParams(searchParams);
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
        <DashboardLayout breadcrumbs={['Designer', 'Submissions']}>
            <div className="space-y-6 animate-in fade-in duration-700">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                            <PaperAirplaneIcon className="w-10 h-10 text-blue-600" />
                            Submissions
                        </h1>
                        <p className="text-gray-500 font-medium mt-1">
                            Tasks pending review and approval
                        </p>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Search */}
                        <div className="relative">
                            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search submissions..."
                                value={filters.search}
                                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                            />
                        </div>

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
                        <p className="mt-4 text-gray-500 font-medium">Loading submissions...</p>
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
                                        <p className="text-xs text-orange-500 font-medium">
                                            Pending Review
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
                                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-orange-50 text-orange-700 border border-orange-200">
                                        Under Review
                                    </span>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getPriorityColor(task.priority)}`}>
                                        {task.priority === 'urgent' ? '🔥 Urgent' : 'Normal'}
                                    </span>
                                </div>

                                {/* Submitted Time (using UpdatedAt as proxy) */}
                                <div className="flex items-center gap-2 text-sm text-gray-600 mb-4 pt-4 border-t border-gray-100">
                                    <ClockIcon className="w-4 h-4" />
                                    <span>Submitted {task.updatedAt ? formatDistanceToNow(new Date(task.updatedAt), { addSuffix: true }) : 'Recently'}</span>
                                </div>

                                {/* Actions */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/designer/tasks/${task.id}`);
                                    }}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-50 text-gray-900 rounded-xl font-bold hover:bg-gray-100 transition-all border border-transparent hover:border-gray-200"
                                >
                                    <EyeIcon className="w-4 h-4" />
                                    <span>View Details</span>
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                        <PaperAirplaneIcon className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                        <h3 className="text-2xl font-black text-gray-900 mb-2">No active submissions</h3>
                        <p className="text-gray-500">Tasks waiting for review will appear here.</p>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default Submissions;
