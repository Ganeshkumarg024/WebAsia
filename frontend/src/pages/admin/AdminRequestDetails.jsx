import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ChevronLeftIcon,
    DocumentTextIcon,
    UserCircleIcon,
    ClockIcon,
    CheckCircleIcon,
    XCircleIcon,
    ExclamationTriangleIcon,
    PaperClipIcon,
    ChatBubbleLeftRightIcon,
    LinkIcon,
    PencilSquareIcon
} from '@heroicons/react/24/outline';
import DashboardLayout from '../../components/layout/DashboardLayout';
import FileList from '../../components/shared/FileList';
import FileUploadZone from '../../components/shared/FileUploadZone';
import adminAPI from '../../api/admin';
import requestFilesAPI from '../../api/requestFiles';
import requestsAPI from '../../api/requests';
import showToast from '../../components/shared/Toast';
import { format } from 'date-fns';

// Safe date formatter helper function
const safeFormatDate = (dateString, formatString) => {
    if (!dateString) return 'N/A';
    try {
        return format(new Date(dateString), formatString);
    } catch (error) {
        console.error('Date formatting error:', error);
        return 'Invalid Date';
    }
};

const AdminRequestDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [request, setRequest] = useState(null);
    const [activities, setActivities] = useState([]);
    const [files, setFiles] = useState([]);
    const [designers, setDesigners] = useState([]);
    const [managers, setManagers] = useState([]);

    const [selectedStatus, setSelectedStatus] = useState('');
    const [selectedDesigner, setSelectedDesigner] = useState('');
    const [selectedManager, setSelectedManager] = useState('');
    const [note, setNote] = useState('');
    const [isInternalNote, setIsInternalNote] = useState(true);
    const [isEditingLink, setIsEditingLink] = useState(false);
    const [workLink, setWorkLink] = useState('');

    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        fetchRequestDetails();
        fetchDesignersAndManagers();
    }, [id]);

    const fetchRequestDetails = async () => {
        try {
            setLoading(true);
            const result = await adminAPI.getRequestDetails(id);
            console.log('API Response:', result); // Debug log
            if (result.success) {
                console.log('Request data:', result.data.request); // Debug log
                setRequest(result.data.request);
                setActivities(result.data.activities || []);
                setFiles(result.data.request.files || []);
                setSelectedStatus(result.data.request.status);
                setSelectedDesigner(result.data.request.assignedDesignerId || '');
                setSelectedManager(result.data.request.assignedManagerId || '');
                setWorkLink(result.data.request.workLink || '');
            }
        } catch (error) {
            console.error('Failed to fetch request details:', error);
            showToast.error('Failed to load request details');
        } finally {
            setLoading(false);
        }
    };

    const fetchDesignersAndManagers = async () => {
        try {
            const [designersResult, managersResult] = await Promise.all([
                adminAPI.getAvailableDesigners(),
                adminAPI.getAvailableManagers()
            ]);

            if (designersResult.success) {
                setDesigners(designersResult.data);
            }
            if (managersResult.success) {
                setManagers(managersResult.data);
            }
        } catch (error) {
            console.error('Failed to fetch designers/managers:', error);
        }
    };

    const handleStatusChange = async (newStatus) => {
        if (newStatus === selectedStatus) return;

        try {
            setUpdating(true);
            const result = await adminAPI.updateRequestStatus(id, newStatus);
            if (result.success) {
                setRequest(result.data);
                setSelectedStatus(newStatus);
                showToast.success('Status updated successfully');
                fetchRequestDetails(); // Refresh to get new activity
            }
        } catch (error) {
            console.error('Failed to update status:', error);
            showToast.error('Failed to update status');
        } finally {
            setUpdating(false);
        }
    };

    const handleDesignerAssignment = async (designerId) => {
        if (designerId === selectedDesigner) return;

        try {
            setUpdating(true);
            const result = await adminAPI.assignDesigner(id, designerId);
            if (result.success) {
                setRequest(result.data);
                setSelectedDesigner(designerId);
                showToast.success('Designer assigned successfully');
                fetchRequestDetails();
            }
        } catch (error) {
            console.error('Failed to assign designer:', error);
            showToast.error('Failed to assign designer');
        } finally {
            setUpdating(false);
        }
    };

    const handleManagerAssignment = async (managerId) => {
        if (managerId === selectedManager) return;

        try {
            setUpdating(true);
            const result = await adminAPI.assignManager(id, managerId);
            if (result.success) {
                setRequest(result.data);
                setSelectedManager(managerId);
                showToast.success('Manager assigned successfully');
                fetchRequestDetails();
            }
        } catch (error) {
            console.error('Failed to assign manager:', error);
            showToast.error('Failed to assign manager');
        } finally {
            setUpdating(false);
        }
    };

    const handleAddNote = async () => {
        if (!note.trim()) {
            showToast.error('Please enter a note');
            return;
        }

        try {
            setUpdating(true);
            const result = await adminAPI.addRequestNote(id, note, isInternalNote);
            if (result.success) {
                showToast.success('Note added successfully');
                setNote('');
                fetchRequestDetails();
            }
        } catch (error) {
            console.error('Failed to add note:', error);
            showToast.error('Failed to add note');
        } finally {
            setUpdating(false);
        }
    };

    const handleUpdateWorkLink = async () => {
        try {
            setUpdating(true);
            await requestsAPI.updateWorkLink(id, workLink);
            showToast.success('Work link updated');
            setIsEditingLink(false);
            fetchRequestDetails();
        } catch (error) {
            console.error('Failed to update work link:', error);
            showToast.error('Failed to update work link');
        } finally {
            setUpdating(false);
        }
    };

    const handleFileUpload = async (uploadedFiles) => {
        try {
            await requestFilesAPI.uploadMultipleFiles(id, uploadedFiles, 'other', 'final_deliverable');
            showToast.success('Files uploaded successfully');
            fetchRequestDetails();
        } catch (error) {
            console.error('Failed to upload files:', error);
            showToast.error('Failed to upload files');
        }
    };

    const handleFileDelete = async (fileId) => {
        try {
            await requestFilesAPI.deleteFile(fileId);
            showToast.success('File deleted successfully');
            fetchRequestDetails();
        } catch (error) {
            console.error('Failed to delete file:', error);
            showToast.error('Failed to delete file');
        }
    };

    const handleFileDownload = async (fileId, fileName) => {
        try {
            const blob = await requestFilesAPI.downloadFile(fileId);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            showToast.success('File downloaded successfully');
        } catch (error) {
            console.error('Failed to download file:', error);
            showToast.error('Failed to download file');
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            queued: 'bg-gray-100 text-gray-800',
            active: 'bg-blue-100 text-blue-800',
            assigned: 'bg-purple-100 text-purple-800',
            in_progress: 'bg-yellow-100 text-yellow-800',
            pending_review: 'bg-orange-100 text-orange-800',
            client_review: 'bg-orange-100 text-orange-800',
            completed: 'bg-green-100 text-green-800',
            cancelled: 'bg-red-100 text-red-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const getPriorityColor = (priority) => {
        const colors = {
            low: 'bg-gray-100 text-gray-600',
            normal: 'bg-blue-100 text-blue-600',
            high: 'bg-orange-100 text-orange-600',
            urgent: 'bg-red-100 text-red-600'
        };
        return colors[priority] || 'bg-gray-100 text-gray-600';
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-64">
                    <div className="text-gray-500">Loading request details...</div>
                </div>
            </DashboardLayout>
        );
    }

    if (!request) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-64">
                    <div className="text-gray-500">Request not found</div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate('/admin/requests')}
                        className="flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
                    >
                        <ChevronLeftIcon className="w-4 h-4 mr-1" />
                        Back to All Requests
                    </button>

                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-3xl font-black text-gray-900 mb-2">
                                {request.title}
                            </h1>
                            <div className="flex items-center gap-3">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusColor(request.status)}`}>
                                    {request.status.replace('_', ' ')}
                                </span>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getPriorityColor(request.priority)}`}>
                                    {request.priority} Priority
                                </span>
                                <span className="text-sm text-gray-500">
                                    ID: {request.id.slice(0, 8)}
                                </span>
                            </div>
                        </div>

                        <div className="flex gap-2 items-center">
                            {request.status === 'pending_review' && (
                                <>
                                    <button
                                        onClick={() => handleStatusChange('client_review')}
                                        className="px-4 py-2 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 shadow-lg shadow-green-600/20"
                                    >
                                        Approve for Client
                                    </button>
                                    <button
                                        onClick={() => handleStatusChange('in_progress')}
                                        className="px-4 py-2 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 shadow-lg shadow-orange-500/20"
                                    >
                                        Request Revision
                                    </button>
                                </>
                            )}

                            <select
                                value={selectedStatus}
                                onChange={(e) => handleStatusChange(e.target.value)}
                                disabled={updating}
                                className="px-4 py-2 bg-white border border-gray-200 rounded-xl font-bold focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            >
                                <option value="queued">Queued</option>
                                <option value="active">Active</option>
                                <option value="assigned">Assigned</option>
                                <option value="in_progress">In Progress</option>
                                <option value="pending_review">Pending Review</option>
                                <option value="client_review">Client Review</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Request Information */}
                        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
                            <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                                <DocumentTextIcon className="w-6 h-6 text-blue-600" />
                                Request Information
                            </h2>

                            <div className="space-y-6">
                                <div>
                                    <label className="text-sm font-bold text-gray-500 uppercase tracking-wider">Service Type</label>
                                    <p className="mt-1 text-gray-900 font-semibold">{request.serviceType.replace('_', ' ')}</p>
                                </div>

                                <div>
                                    <label className="text-sm font-bold text-gray-500 uppercase tracking-wider">Description</label>
                                    <p className="mt-1 text-gray-700">{request.description}</p>
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                                            <LinkIcon className="w-4 h-4" />
                                            Work Link
                                        </label>
                                        <button
                                            onClick={() => setIsEditingLink(!isEditingLink)}
                                            className="text-blue-600 hover:text-blue-700 text-xs font-bold uppercase"
                                        >
                                            {isEditingLink ? 'Cancel' : 'Edit'}
                                        </button>
                                    </div>
                                    {isEditingLink ? (
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="url"
                                                value={workLink}
                                                onChange={(e) => setWorkLink(e.target.value)}
                                                placeholder="https://..."
                                                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                                            />
                                            <button
                                                onClick={handleUpdateWorkLink}
                                                className="px-3 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold"
                                                disabled={updating}
                                            >
                                                Save
                                            </button>
                                        </div>
                                    ) : (
                                        request.workLink ? (
                                            <a href={request.workLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-blue-50/50 border border-blue-100 rounded-xl group hover:bg-blue-50 transition-colors mt-2">
                                                <div className="w-8 h-8 bg-blue-600/10 rounded-lg flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform flex-shrink-0">
                                                    <LinkIcon className="w-4 h-4" />
                                                </div>
                                                <div className="overflow-hidden min-w-0 flex-1">
                                                    <p className="text-xs font-bold text-gray-900 truncate">Open Link</p>
                                                    <p className="text-[10px] text-blue-600 truncate">{request.workLink}</p>
                                                </div>
                                            </a>
                                        ) : (
                                            <p className="text-gray-400 italic text-sm mt-1">No link provided</p>
                                        )
                                    )}
                                </div>

                                {request.specifications && (
                                    <div>
                                        <label className="text-sm font-bold text-gray-500 uppercase tracking-wider">Specifications</label>
                                        <div className="mt-2 bg-gray-50 rounded-xl p-4">
                                            <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                                                {JSON.stringify(request.specifications, null, 2)}
                                            </pre>
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-bold text-gray-500 uppercase tracking-wider">Created</label>
                                        <p className="mt-1 text-gray-900">{safeFormatDate(request.created_at, 'MMM dd, yyyy')}</p>
                                    </div>
                                    {request.completedAt && (
                                        <div>
                                            <label className="text-sm font-bold text-gray-500 uppercase tracking-wider">Completed</label>
                                            <p className="mt-1 text-gray-900">{safeFormatDate(request.completedAt, 'MMM dd, yyyy')}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Client Information */}
                        {request.client && (
                            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
                                <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                                    <UserCircleIcon className="w-6 h-6 text-blue-600" />
                                    Client Information
                                </h2>

                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-bold text-gray-500 uppercase tracking-wider">Name</label>
                                        <p className="mt-1 text-gray-900 font-semibold">
                                            {request.client.firstName} {request.client.lastName}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-bold text-gray-500 uppercase tracking-wider">Email</label>
                                        <p className="mt-1 text-gray-900">{request.client.email}</p>
                                    </div>
                                    {request.client.phone && (
                                        <div>
                                            <label className="text-sm font-bold text-gray-500 uppercase tracking-wider">Phone</label>
                                            <p className="mt-1 text-gray-900">{request.client.phone}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Files Section */}
                        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
                            <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                                <PaperClipIcon className="w-6 h-6 text-blue-600" />
                                Files & Attachments
                            </h2>

                            {/* Work Link Display */}
                            {request.workLink && (
                                <div className="mb-6 p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                                            <LinkIcon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900">Work Link / Deliverable</p>
                                            <a href={request.workLink} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline truncate block max-w-md">
                                                {request.workLink}
                                            </a>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => {
                                                setIsEditingLink(true);
                                                // Scroll to top or handle UI focus if needed, though for now just setting edit mode is enough
                                                // Ideally point user to the edit section above, or allow inline edit here. 
                                                // For simplicity, we just link to the main existing Work Link section by reusing existing state.
                                                document.querySelector('h2')?.scrollIntoView({ behavior: 'smooth' });
                                            }}
                                            className="px-3 py-2 bg-white text-gray-700 text-xs font-bold rounded-xl border border-gray-200 hover:bg-gray-50"
                                        >
                                            Edit
                                        </button>
                                        <a
                                            href={request.workLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-3 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 flex items-center gap-1"
                                        >
                                            Open
                                        </a>
                                    </div>
                                </div>
                            )}

                            {files.length > 0 ? (
                                <FileList
                                    files={files}
                                    onDownload={handleFileDownload}
                                    onDelete={handleFileDelete}
                                    canDelete={true}
                                />
                            ) : (
                                <p className="text-gray-500 text-center py-8">No files uploaded yet</p>
                            )}

                            <div className="mt-6">
                                <label className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 block">
                                    Upload Admin Files
                                </label>
                                <FileUploadZone
                                    onFilesSelected={handleFileUpload}
                                    maxFiles={10}
                                    multiple={true}
                                />
                            </div>
                        </div>

                        {/* Activity Timeline */}
                        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
                            <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                                <ClockIcon className="w-6 h-6 text-blue-600" />
                                Activity Timeline
                            </h2>

                            <div className="space-y-4">
                                {activities.map((activity) => (
                                    <div key={activity.id} className="flex gap-4 border-l-2 border-gray-200 pl-4 pb-4">
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-1">
                                                <p className="font-semibold text-gray-900">{activity.description}</p>
                                                <span className="text-xs text-gray-500">
                                                    {safeFormatDate(activity.created_at, 'MMM dd, HH:mm')}
                                                </span>
                                            </div>
                                            {activity.user && (
                                                <p className="text-sm text-gray-600">
                                                    by {activity.user.firstName} {activity.user.lastName} ({activity.user.role})
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Status Management */}
                        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                            <h3 className="text-lg font-black text-gray-900 mb-4">Status Control</h3>
                            <select
                                value={selectedStatus}
                                onChange={(e) => handleStatusChange(e.target.value)}
                                disabled={updating}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl font-semibold focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="queued">Queued</option>
                                <option value="active">Active</option>
                                <option value="assigned">Assigned</option>
                                <option value="in_progress">In Progress</option>
                                <option value="client_review">Review</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>

                        {/* Designer Assignment */}
                        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                            <h3 className="text-lg font-black text-gray-900 mb-4">Assign Designer</h3>
                            <select
                                value={selectedDesigner}
                                onChange={(e) => handleDesignerAssignment(e.target.value)}
                                disabled={updating}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl font-semibold focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">Unassigned</option>
                                {designers.map((designer) => (
                                    <option key={designer.id} value={designer.id}>
                                        {designer.firstName} {designer.lastName}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Manager Assignment */}
                        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                            <h3 className="text-lg font-black text-gray-900 mb-4">Assign Manager</h3>
                            <select
                                value={selectedManager}
                                onChange={(e) => handleManagerAssignment(e.target.value)}
                                disabled={updating}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl font-semibold focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">Unassigned</option>
                                {managers.map((manager) => (
                                    <option key={manager.id} value={manager.id}>
                                        {manager.firstName} {manager.lastName}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Admin Notes */}
                        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                            <h3 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
                                <ChatBubbleLeftRightIcon className="w-5 h-5 text-blue-600" />
                                Add Note
                            </h3>
                            <textarea
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                placeholder="Enter admin note..."
                                rows={4}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            />
                            <div className="mt-3 flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="internal"
                                    checked={isInternalNote}
                                    onChange={(e) => setIsInternalNote(e.target.checked)}
                                    className="rounded"
                                />
                                <label htmlFor="internal" className="text-sm text-gray-600">
                                    Internal note (not visible to client)
                                </label>
                            </div>
                            <button
                                onClick={handleAddNote}
                                disabled={updating || !note.trim()}
                                className="mt-4 w-full px-4 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Add Note
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AdminRequestDetails;
