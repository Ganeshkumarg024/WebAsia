import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeftIcon,
    ClockIcon,
    UserCircleIcon,
    DocumentTextIcon,
    PhotoIcon,
    ChatBubbleLeftIcon,
    ClipboardDocumentListIcon,
    PlayIcon,
    PaperAirplaneIcon
} from '@heroicons/react/24/outline';
import useDesignerStore from '../../store/designerStore';
import useRequestStore from '../../store/requestStore';
import useBrandAssetStore from '../../store/brandAssetStore';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { format, formatDistanceToNow } from 'date-fns';
import { SwatchIcon, IdentificationIcon, BookOpenIcon } from '@heroicons/react/24/outline';

const TaskDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { currentTask, fetchTaskById, startTask, isLoading } = useDesignerStore();
    const { requestActivity, fetchRequestActivity } = useRequestStore();
    const { brandAssets, fetchBrandAssets } = useBrandAssetStore();
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        if (id) {
            fetchTaskById(id).then((task) => {
                if (task?.clientId) {
                    fetchBrandAssets(task.clientId);
                }
            });
            fetchRequestActivity(id);
        }
    }, [id, fetchTaskById, fetchRequestActivity, fetchBrandAssets]);

    const handleStartTask = async () => {
        const result = await startTask(id);
        if (result.success) {
            navigate(`/designer/workspace?task=${id}`);
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

    const tabs = [
        { id: 'overview', label: 'Overview', icon: DocumentTextIcon },
        { id: 'brand', label: 'Brand Assets', icon: SwatchIcon },
        { id: 'files', label: 'Files', icon: PhotoIcon },
        { id: 'messages', label: 'Messages', icon: ChatBubbleLeftIcon },
        { id: 'activity', label: 'Activity', icon: ClipboardDocumentListIcon }
    ];

    if (isLoading || !currentTask) {
        return (
            <DashboardLayout breadcrumbs={['Designer', 'Tasks', 'Loading...']}>
                <div className="text-center py-20">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <p className="mt-4 text-gray-500 font-medium">Loading task details...</p>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout breadcrumbs={['Designer', 'Tasks', currentTask.title]}>
            <div className="space-y-6 animate-in fade-in duration-700">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/designer/tasks')}
                        className="p-3 bg-white border border-gray-100 rounded-2xl hover:bg-gray-50 transition-all"
                    >
                        <ArrowLeftIcon className="w-5 h-5 text-gray-900" />
                    </button>
                    <div className="flex-1">
                        <h1 className="text-3xl font-black text-gray-900">{currentTask.title}</h1>
                        <p className="text-gray-500 font-medium mt-1">Task ID: {currentTask.id}</p>
                    </div>
                    {currentTask.status === 'assigned' && (
                        <button
                            onClick={handleStartTask}
                            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
                        >
                            <PlayIcon className="w-5 h-5" />
                            <span>Start Task</span>
                        </button>
                    )}
                    {currentTask.status === 'in_progress' && (
                        <button
                            onClick={() => navigate(`/designer/upload/${id}`)}
                            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
                        >
                            <PaperAirplaneIcon className="w-5 h-5" />
                            <span>Upload Design</span>
                        </button>
                    )}
                </div>

                {/* Task Info Card */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] p-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {/* Client */}
                        <div>
                            <p className="text-sm font-semibold text-gray-500 mb-2">Client</p>
                            <div className="flex items-center gap-3">
                                {currentTask.client?.photoUrl ? (
                                    <img
                                        src={currentTask.client.photoUrl}
                                        alt={`${currentTask.client.firstName} ${currentTask.client.lastName}`}
                                        className="w-10 h-10 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                                        <UserCircleIcon className="w-6 h-6 text-blue-600" />
                                    </div>
                                )}
                                <div>
                                    <p className="font-bold text-gray-900">
                                        {currentTask.client ? `${currentTask.client.firstName} ${currentTask.client.lastName}` : 'Client'}
                                    </p>
                                    <p className="text-xs text-gray-500">{currentTask.client?.email}</p>
                                </div>
                            </div>
                        </div>

                        {/* Status */}
                        <div>
                            <p className="text-sm font-semibold text-gray-500 mb-2">Status</p>
                            <span className={`inline-block px-4 py-2 rounded-full text-sm font-bold border ${getStatusColor(currentTask.status)}`}>
                                {currentTask.status?.replace('_', ' ')}
                            </span>
                        </div>

                        {/* Priority */}
                        <div>
                            <p className="text-sm font-semibold text-gray-500 mb-2">Priority</p>
                            <span className={`inline-block px-4 py-2 rounded-full text-sm font-bold border ${getPriorityColor(currentTask.priority)}`}>
                                {currentTask.priority === 'urgent' ? '🔥 Urgent' : 'Normal'}
                            </span>
                        </div>

                        {/* Deadline */}
                        <div>
                            <p className="text-sm font-semibold text-gray-500 mb-2">Deadline</p>
                            <div className="flex items-center gap-2">
                                <ClockIcon className="w-5 h-5 text-gray-600" />
                                <div>
                                    <p className="font-bold text-gray-900">
                                        {currentTask.deadline ? format(new Date(currentTask.deadline), 'MMM dd, yyyy') : 'No deadline'}
                                    </p>
                                    {currentTask.deadline && (
                                        <p className="text-xs text-gray-500">
                                            {formatDistanceToNow(new Date(currentTask.deadline), { addSuffix: true })}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
                    <div className="border-b border-gray-100 px-8 pt-6">
                        <div className="flex gap-4">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-4 py-3 font-bold rounded-t-2xl transition-all ${activeTab === tab.id
                                        ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                                        : 'text-gray-500 hover:text-gray-900'
                                        }`}
                                >
                                    <tab.icon className="w-5 h-5" />
                                    <span>{tab.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="p-8">
                        {/* Overview Tab */}
                        {activeTab === 'overview' && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-black text-gray-900 mb-3">Description</h3>
                                    <p className="text-gray-700 leading-relaxed">
                                        {currentTask.description || 'No description provided'}
                                    </p>
                                </div>

                                {currentTask.specifications && (
                                    <div>
                                        <h3 className="text-lg font-black text-gray-900 mb-3">Specifications</h3>
                                        <div className="bg-gray-50 rounded-2xl p-6">
                                            <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                                                {JSON.stringify(currentTask.specifications, null, 2)}
                                            </pre>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Brand Assets Tab */}
                        {activeTab === 'brand' && (
                            <div className="space-y-8">
                                {brandAssets.length > 0 ? (
                                    <>
                                        {/* Logos */}
                                        {brandAssets.filter(a => a.type === 'logo').length > 0 && (
                                            <div>
                                                <h3 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
                                                    <IdentificationIcon className="w-5 h-5 text-blue-600" />
                                                    <span>Logos</span>
                                                </h3>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                    {brandAssets.filter(a => a.type === 'logo').map((asset) => (
                                                        <div key={asset.id} className="bg-gray-50 rounded-2xl p-6 border border-gray-100 group hover:border-blue-200 transition-all">
                                                            {asset.file && (
                                                                <div className="aspect-video rounded-xl bg-white flex items-center justify-center p-4 mb-4 border border-gray-100 overflow-hidden">
                                                                    <img
                                                                        src={asset.file.thumbnailUrl || asset.file.s3Url}
                                                                        alt={asset.name}
                                                                        className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform"
                                                                    />
                                                                </div>
                                                            )}
                                                            <p className="font-bold text-gray-900">{asset.name}</p>
                                                            <p className="text-xs text-gray-500 mt-1">{asset.description}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Color Palettes */}
                                        {brandAssets.filter(a => a.type === 'color_palette').length > 0 && (
                                            <div>
                                                <h3 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
                                                    <SwatchIcon className="w-5 h-5 text-blue-600" />
                                                    <span>Color Palette</span>
                                                </h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    {brandAssets.filter(a => a.type === 'color_palette').map((asset) => (
                                                        <div key={asset.id} className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                                                            <p className="font-bold text-gray-900 mb-4">{asset.name}</p>
                                                            <div className="flex flex-wrap gap-4">
                                                                {asset.value?.colors?.map((color, idx) => (
                                                                    <div key={idx} className="flex flex-col items-center gap-2">
                                                                        <div
                                                                            className="w-12 h-12 rounded-xl shadow-sm border border-black/5"
                                                                            style={{ backgroundColor: color.hex }}
                                                                        ></div>
                                                                        <span className="text-[10px] font-bold text-gray-500 font-mono uppercase">{color.hex || color}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Guidelines & Others */}
                                        {brandAssets.filter(a => ['brand_guidelines', 'typography', 'other'].includes(a.type)).length > 0 && (
                                            <div>
                                                <h3 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
                                                    <BookOpenIcon className="w-5 h-5 text-blue-600" />
                                                    <span>Guidelines & Resources</span>
                                                </h3>
                                                <div className="space-y-4">
                                                    {brandAssets.filter(a => ['brand_guidelines', 'typography', 'other'].includes(a.type)).map((asset) => (
                                                        <div key={asset.id} className="bg-gray-50 rounded-2xl p-4 border border-gray-100 flex items-center justify-between">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-gray-100">
                                                                    <DocumentTextIcon className="w-5 h-5 text-gray-400" />
                                                                </div>
                                                                <div>
                                                                    <p className="font-bold text-gray-900">{asset.name}</p>
                                                                    <p className="text-xs text-gray-500">{asset.description}</p>
                                                                </div>
                                                            </div>
                                                            {asset.file && (
                                                                <a
                                                                    href={asset.file.s3Url}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="px-4 py-2 bg-white border border-gray-100 rounded-xl text-xs font-bold text-blue-600 hover:bg-blue-50 transition-all"
                                                                >
                                                                    Download
                                                                </a>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="text-center py-20">
                                        <SwatchIcon className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                                        <p className="text-gray-500 font-semibold uppercase tracking-widest text-xs">No brand assets found for this client</p>
                                        <p className="text-gray-400 text-[11px] mt-2">Ask the client or manager to upload brand materials.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Files Tab */}
                        {activeTab === 'files' && (
                            <div>
                                {currentTask.files && currentTask.files.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {currentTask.files.map((file) => (
                                            <div key={file.id} className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                                                <PhotoIcon className="w-12 h-12 text-gray-400 mb-3" />
                                                <p className="font-bold text-gray-900 truncate">{file.originalName}</p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {(file.fileSize / 1024).toFixed(2)} KB
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <PhotoIcon className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-500">No files uploaded yet</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Messages Tab */}
                        {activeTab === 'messages' && (
                            <div className="text-center py-12">
                                <ChatBubbleLeftIcon className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500">Messages coming soon</p>
                            </div>
                        )}

                        {/* Activity Tab */}
                        {activeTab === 'activity' && (
                            <div className="space-y-4">
                                {requestActivity && requestActivity.length > 0 ? (
                                    requestActivity.map((activity) => (
                                        <div key={activity.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-2xl">
                                            <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                                            <div className="flex-1">
                                                <p className="text-sm text-gray-900 font-medium">{activity.description}</p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-12">
                                        <ClipboardDocumentListIcon className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-500">No activity yet</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default TaskDetails;
