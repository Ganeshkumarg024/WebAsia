import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeftIcon,
    DocumentTextIcon,
    CloudArrowUpIcon,
    PaperAirplaneIcon
} from '@heroicons/react/24/outline';
import useDesignerStore from '../../store/designerStore';
import DashboardLayout from '../../components/layout/DashboardLayout';

const Workspace = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const taskId = searchParams.get('task');
    const { currentTask, fetchTaskById, isLoading } = useDesignerStore();

    useEffect(() => {
        if (taskId) {
            fetchTaskById(taskId);
        }
    }, [taskId, fetchTaskById]);

    if (!taskId) {
        return (
            <DashboardLayout breadcrumbs={['Designer', 'Workspace']}>
                <div className="text-center py-20">
                    <h2 className="text-2xl font-black text-gray-900 mb-2">No Task Selected</h2>
                    <p className="text-gray-500 mb-6">Please select a task to work on</p>
                    <button
                        onClick={() => navigate('/designer/tasks')}
                        className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all"
                    >
                        View My Tasks
                    </button>
                </div>
            </DashboardLayout>
        );
    }

    if (isLoading || !currentTask) {
        return (
            <DashboardLayout breadcrumbs={['Designer', 'Workspace', 'Loading...']}>
                <div className="text-center py-20">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <p className="mt-4 text-gray-500 font-medium">Loading workspace...</p>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout breadcrumbs={['Designer', 'Workspace', currentTask.title]}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-700">
                {/* Left Sidebar - Task Brief */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] p-6 sticky top-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-blue-50 rounded-xl">
                                <DocumentTextIcon className="w-6 h-6 text-blue-600" />
                            </div>
                            <h2 className="text-xl font-black text-gray-900">Task Brief</h2>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <h3 className="text-sm font-bold text-gray-500 mb-1">Title</h3>
                                <p className="text-gray-900 font-medium">{currentTask.title}</p>
                            </div>

                            <div>
                                <h3 className="text-sm font-bold text-gray-500 mb-1">Description</h3>
                                <p className="text-sm text-gray-700 leading-relaxed">
                                    {currentTask.description || 'No description provided'}
                                </p>
                            </div>

                            <div>
                                <h3 className="text-sm font-bold text-gray-500 mb-1">Service Type</h3>
                                <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold">
                                    {currentTask.serviceType?.replace('_', ' ')}
                                </span>
                            </div>

                            {currentTask.specifications && (
                                <div>
                                    <h3 className="text-sm font-bold text-gray-500 mb-1">Specifications</h3>
                                    <div className="bg-gray-50 rounded-2xl p-4 max-h-64 overflow-y-auto">
                                        <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono">
                                            {JSON.stringify(currentTask.specifications, null, 2)}
                                        </pre>
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={() => navigate(`/designer/tasks/${currentTask.id}`)}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-50 text-gray-900 rounded-2xl font-bold hover:bg-gray-100 transition-all"
                            >
                                <ArrowLeftIcon className="w-5 h-5" />
                                <span>Back to Task Details</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Area - Work Canvas */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] p-8">
                        <div className="text-center py-12">
                            <CloudArrowUpIcon className="w-24 h-24 text-gray-300 mx-auto mb-6" />
                            <h2 className="text-2xl font-black text-gray-900 mb-2">Your Canvas</h2>
                            <p className="text-gray-500 mb-8">Upload your design work when ready</p>

                            <button
                                onClick={() => navigate(`/designer/tasks/${currentTask.id}/upload`)}
                                className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
                            >
                                <CloudArrowUpIcon className="w-6 h-6" />
                                <span>Upload Design Files</span>
                            </button>
                        </div>
                    </div>

                    {/* Reference Files */}
                    {currentTask.files && currentTask.files.length > 0 && (
                        <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] p-8">
                            <h3 className="text-xl font-black text-gray-900 mb-4">Reference Files</h3>
                            <div className="grid grid-cols-2 gap-4">
                                {currentTask.files.map((file) => (
                                    <div key={file.id} className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                                        <DocumentTextIcon className="w-12 h-12 text-gray-400 mb-3" />
                                        <p className="font-bold text-gray-900 text-sm truncate">{file.originalName}</p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {(file.fileSize / 1024).toFixed(2)} KB
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Workspace;
