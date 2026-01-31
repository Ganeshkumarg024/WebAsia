import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import managerAPI from '../../api/manager';
import StatusBadge from '../../components/shared/StatusBadge';
import showToast from '../../components/shared/Toast';
import DashboardLayout from '../../components/layout/DashboardLayout';

const ReviewDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [request, setRequest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [revisionNotes, setRevisionNotes] = useState('');
    const [qualityChecklist, setQualityChecklist] = useState({
        meetsRequirements: false,
        qualityStandards: false,
        brandGuidelines: false,
        technicalSpecs: false,
    });

    useEffect(() => {
        fetchRequest();
    }, [id]);

    const fetchRequest = async () => {
        try {
            setLoading(true);
            const response = await managerAPI.getAllRequests({ id });
            setRequest(response.data[0]);
        } catch (error) {
            console.error('Failed to fetch request:', error);
            showToast.error('Failed to load request');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async () => {
        const allChecked = Object.values(qualityChecklist).every(v => v);
        if (!allChecked) {
            showToast.error('Please complete all quality checks before approving');
            return;
        }

        try {
            // Approve logic
            showToast.success('Design approved successfully!');
            navigate('/manager/queue');
        } catch (error) {
            showToast.error('Failed to approve design');
        }
    };

    const handleRequestChanges = async () => {
        if (!revisionNotes.trim()) {
            showToast.error('Please provide revision notes');
            return;
        }

        try {
            // Request changes logic
            showToast.success('Revision requested');
            navigate('/manager/queue');
        } catch (error) {
            showToast.error('Failed to request changes');
        }
    };

    if (loading) {
        return (
            <DashboardLayout breadcrumbs={['Manager', 'Queue', 'Review']}>
                <div className="max-w-6xl mx-auto animate-pulse">
                    <div className="h-8 bg-gray-700 rounded w-1/3 mb-6"></div>
                    <div className="h-64 bg-gray-700 rounded"></div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout breadcrumbs={['Manager', 'Queue', 'Review']}>
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <button
                        onClick={() => navigate('/manager/queue')}
                        className="flex items-center gap-2 text-gray-400 hover:text-white mb-4"
                    >
                        <ArrowLeftIcon className="w-5 h-5" />
                        Back to Queue
                    </button>
                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-2">{request?.title}</h1>
                            <div className="flex items-center gap-4">
                                <StatusBadge status={request?.status} />
                                <span className="text-gray-400">Designer: {request?.designer?.name}</span>
                                <span className="text-gray-400">Client: {request?.client?.name}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="col-span-2 space-y-6">
                        {/* Design Preview */}
                        <div className="bg-[#151B2E] rounded-lg p-6 border border-[#1E2638]">
                            <h2 className="text-lg font-bold text-white mb-4">Design Preview</h2>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="aspect-video bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg"></div>
                                ))}
                            </div>
                            <div className="flex items-center gap-2">
                                <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm">
                                    View Full Size
                                </button>
                                <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm">
                                    Download All
                                </button>
                            </div>
                        </div>

                        {/* Quality Checklist */}
                        <div className="bg-[#151B2E] rounded-lg p-6 border border-[#1E2638]">
                            <h2 className="text-lg font-bold text-white mb-4">Quality Checklist</h2>
                            <div className="space-y-3">
                                {Object.entries(qualityChecklist).map(([key, value]) => (
                                    <label key={key} className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={value}
                                            onChange={(e) => setQualityChecklist({ ...qualityChecklist, [key]: e.target.checked })}
                                            className="w-5 h-5 rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
                                        />
                                        <span className="text-white">
                                            {key === 'meetsRequirements' && 'Meets client requirements'}
                                            {key === 'qualityStandards' && 'Meets quality standards'}
                                            {key === 'brandGuidelines' && 'Follows brand guidelines'}
                                            {key === 'technicalSpecs' && 'Meets technical specifications'}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Revision Notes */}
                        <div className="bg-[#151B2E] rounded-lg p-6 border border-[#1E2638]">
                            <h2 className="text-lg font-bold text-white mb-4">Revision Notes</h2>
                            <textarea
                                value={revisionNotes}
                                onChange={(e) => setRevisionNotes(e.target.value)}
                                placeholder="Provide specific feedback for the designer..."
                                className="w-full px-4 py-3 bg-[#0A0E1A] border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none resize-none"
                                rows={6}
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-4">
                            <button
                                onClick={handleRequestChanges}
                                className="flex-1 px-6 py-3 bg-orange-500/10 hover:bg-orange-500/20 text-orange-500 rounded-lg font-medium flex items-center justify-center gap-2"
                            >
                                <XCircleIcon className="w-5 h-5" />
                                Request Changes
                            </button>
                            <button
                                onClick={handleApprove}
                                className="flex-1 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium flex items-center justify-center gap-2"
                            >
                                <CheckCircleIcon className="w-5 h-5" />
                                Approve & Deliver
                            </button>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Designer Performance */}
                        <div className="bg-[#151B2E] rounded-lg p-6 border border-[#1E2638]">
                            <h3 className="text-lg font-bold text-white mb-4">Designer Context</h3>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-xs text-gray-400 mb-1">COMPLETION RATE</p>
                                    <p className="text-2xl font-bold text-white">94%</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 mb-1">AVG TURNAROUND</p>
                                    <p className="text-2xl font-bold text-white">18h</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 mb-1">REVISION RATE</p>
                                    <p className="text-2xl font-bold text-white">12%</p>
                                </div>
                            </div>
                        </div>

                        {/* Client Brief */}
                        <div className="bg-[#151B2E] rounded-lg p-6 border border-[#1E2638]">
                            <h3 className="text-lg font-bold text-white mb-4">Client Brief</h3>
                            <p className="text-sm text-gray-300">{request?.description}</p>
                        </div>

                        {/* Version History */}
                        <div className="bg-[#151B2E] rounded-lg p-6 border border-[#1E2638]">
                            <h3 className="text-lg font-bold text-white mb-4">Version History</h3>
                            <div className="space-y-3">
                                <div className="p-3 bg-[#0A0E1A] rounded">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm font-medium text-white">Version 2</span>
                                        <span className="text-xs text-gray-400">2h ago</span>
                                    </div>
                                    <p className="text-xs text-gray-400">Updated colors per feedback</p>
                                </div>
                                <div className="p-3 bg-[#0A0E1A] rounded">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm font-medium text-white">Version 1</span>
                                        <span className="text-xs text-gray-400">1d ago</span>
                                    </div>
                                    <p className="text-xs text-gray-400">Initial submission</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default ReviewDetail;
