import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, ChatBubbleLeftIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import DashboardLayout from '../../components/layout/DashboardLayout';
import requestsAPI from '../../api/requests';
import StatusBadge from '../../components/shared/StatusBadge';
import showToast from '../../components/shared/Toast';
import { format } from 'date-fns';

const RequestDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [request, setRequest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [revisionNote, setRevisionNote] = useState('');

    useEffect(() => {
        fetchRequest();
    }, [id]);

    const fetchRequest = async () => {
        try {
            setLoading(true);
            const response = await requestsAPI.getRequestById(id);
            setRequest(response.data);
        } catch (error) {
            console.error('Failed to fetch request:', error);
            showToast.error('Failed to load request details');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async () => {
        try {
            await requestsAPI.approveDesign(id);
            showToast.success('Design approved successfully!');
            navigate('/client/requests');
        } catch (error) {
            showToast.error('Failed to approve design');
        }
    };

    const handleRequestRevision = async () => {
        if (!revisionNote.trim()) {
            showToast.error('Please provide revision notes');
            return;
        }

        try {
            await requestsAPI.addRevision(id, { notes: revisionNote });
            showToast.success('Revision requested successfully');
            setRevisionNote('');
            fetchRequest();
        } catch (error) {
            showToast.error('Failed to request revision');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0A0E1A] p-6">
                <div className="max-w-6xl mx-auto">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-700 rounded w-1/3 mb-6"></div>
                        <div className="h-64 bg-gray-700 rounded mb-6"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!request) {
        return (
            <div className="min-h-screen bg-[#0A0E1A] p-6 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-400 mb-4">Request not found</p>
                    <button
                        onClick={() => navigate('/client/requests')}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg"
                    >
                        Back to Requests
                    </button>
                </div>
            </div>
        );
    }

    return (
        <DashboardLayout breadcrumbs={['Requests', request?.title || 'Detail']}>
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <button
                        onClick={() => navigate('/client/requests')}
                        className="flex items-center gap-2 text-gray-400 hover:text-white mb-4"
                    >
                        <ArrowLeftIcon className="w-5 h-5" />
                        Back to Requests
                    </button>
                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-2">{request.title}</h1>
                            <div className="flex items-center gap-4">
                                <StatusBadge status={request.status} />
                                <span className="text-gray-400">
                                    Created {format(new Date(request.createdAt), 'MMM dd, yyyy')}
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleRequestRevision}
                                className="px-4 py-2 bg-orange-500/10 hover:bg-orange-500/20 text-orange-500 rounded-lg font-medium flex items-center gap-2"
                            >
                                <XCircleIcon className="w-5 h-5" />
                                Request Revision
                            </button>
                            <button
                                onClick={handleApprove}
                                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium flex items-center gap-2"
                            >
                                <CheckCircleIcon className="w-5 h-5" />
                                Approve Design
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="col-span-2 space-y-6">
                        {/* Design Preview */}
                        <div className="bg-[#151B2E] rounded-lg p-6 border border-[#1E2638]">
                            <h2 className="text-lg font-bold text-white mb-4">Design Preview</h2>
                            <div className="aspect-video bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg flex items-center justify-center">
                                <p className="text-gray-400">Design preview will appear here</p>
                            </div>
                        </div>

                        {/* Comments */}
                        <div className="bg-[#151B2E] rounded-lg p-6 border border-[#1E2638]">
                            <h2 className="text-lg font-bold text-white mb-4">Comments & Feedback</h2>
                            <div className="space-y-4 mb-4">
                                {request.comments?.map((comment, index) => (
                                    <div key={index} className="flex gap-3">
                                        <div className="w-8 h-8 bg-blue-500 rounded-full flex-shrink-0"></div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-white font-medium">{comment.author}</span>
                                                <span className="text-xs text-gray-400">{comment.timestamp}</span>
                                            </div>
                                            <p className="text-gray-300 text-sm">{comment.text}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex gap-3">
                                <textarea
                                    value={revisionNote}
                                    onChange={(e) => setRevisionNote(e.target.value)}
                                    placeholder="Add a comment or revision note..."
                                    className="flex-1 px-4 py-3 bg-[#0A0E1A] border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none resize-none"
                                    rows={3}
                                />
                                <button
                                    onClick={handleRequestRevision}
                                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg h-fit"
                                >
                                    Send
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Request Details */}
                        <div className="bg-[#151B2E] rounded-lg p-6 border border-[#1E2638]">
                            <h3 className="text-lg font-bold text-white mb-4">Request Details</h3>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-xs text-gray-400 mb-1">CATEGORY</p>
                                    <p className="text-white">{request.category}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 mb-1">PRIORITY</p>
                                    <StatusBadge status={request.priority} size="sm" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 mb-1">ASSIGNED TO</p>
                                    <p className="text-white">{request.designer?.name || 'Unassigned'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 mb-1">DEADLINE</p>
                                    <p className="text-white">{request.deadline || 'Not set'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="bg-[#151B2E] rounded-lg p-6 border border-[#1E2638]">
                            <h3 className="text-lg font-bold text-white mb-4">Description</h3>
                            <p className="text-gray-300 text-sm">{request.description}</p>
                        </div>

                        {/* Files */}
                        <div className="bg-[#151B2E] rounded-lg p-6 border border-[#1E2638]">
                            <h3 className="text-lg font-bold text-white mb-4">Attached Files</h3>
                            <div className="space-y-2">
                                {request.files?.map((file, index) => (
                                    <div key={index} className="p-3 bg-[#0A0E1A] rounded flex items-center justify-between">
                                        <span className="text-sm text-white truncate">{file.name}</span>
                                        <button className="text-blue-500 text-sm">Download</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default RequestDetail;
