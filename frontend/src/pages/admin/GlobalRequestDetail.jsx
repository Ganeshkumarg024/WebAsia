import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import useAdminStore from '../../store/adminStore';
import {
    ArrowLeftIcon,
    UserIcon,
    CalendarIcon,
    ClockIcon,
    ShieldCheckIcon,
    ArrowPathIcon,
    ChatBubbleLeftRightIcon,
    DocumentTextIcon,
    PaperClipIcon,
    CheckCircleIcon,
    XCircleIcon,
    ArrowsRightLeftIcon,
    StarIcon
} from '@heroicons/react/24/outline';

const GlobalRequestDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { selectedThread: request, loading, fetchCommThreadDetails: fetchRequestDetails, bulkUpdateRequests, approveRequest, rejectRequest } = useAdminStore();
    const [isReassigning, setIsReassigning] = useState(false);
    const [revisionNotes, setRevisionNotes] = useState('');
    const [qualityChecklist, setQualityChecklist] = useState({
        meetsRequirements: false,
        qualityStandards: false,
        brandGuidelines: false,
        technicalSpecs: false,
    });

    useEffect(() => {
        fetchRequestDetails(id);
    }, [id]);

    const handleBack = () => navigate('/admin/requests');

    const handleUpdateStatus = (status) => {
        bulkUpdateRequests({ requestIds: [id], status });
    };

    const handleApprove = async () => {
        const allChecked = Object.values(qualityChecklist).every(v => v);
        if (!allChecked) {
            alert('Please complete all quality checks before approving');
            return;
        }
        await approveRequest(id, qualityChecklist);
        navigate('/admin/requests');
    };

    const handleReject = async () => {
        if (!revisionNotes.trim()) {
            alert('Please provide revision notes');
            return;
        }
        await rejectRequest(id, revisionNotes);
        navigate('/admin/requests');
    };

    if (loading || !request) {
        return (
            <DashboardLayout breadcrumbs={['Admin', 'Requests', '...']}>
                <div className="flex items-center justify-center min-h-[400px]">
                    <ArrowPathIcon className="w-8 h-8 text-blue-600 animate-spin" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout breadcrumbs={['Admin', 'Requests', request.title || 'Request Detail']}>
            <div className="flex items-center justify-between mb-8">
                <button onClick={handleBack} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors text-sm font-medium">
                    <ArrowLeftIcon className="w-4 h-4" />
                    Back to All Requests
                </button>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 text-xs font-bold border border-gray-100 rounded-xl hover:bg-gray-50 transition-all">
                        <ArrowsRightLeftIcon className="w-4 h-4" />
                        Reassign
                    </button>
                    <button onClick={() => handleUpdateStatus('completed')} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl text-xs font-bold hover:bg-green-700 shadow-lg shadow-green-500/20 transition-all">
                        <CheckCircleIcon className="w-4 h-4" />
                        Force Complete
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="xl:col-span-2 space-y-8">
                    {/* Summary Header */}
                    <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 -mr-16 -mt-16 rounded-full blur-2xl"></div>
                        <div className="flex items-center justify-between mb-6">
                            <span className={`px-2.5 py-1 text-[10px] font-bold rounded-lg uppercase tracking-wider ${request.priority === 'urgent' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-blue-50 text-blue-600 border border-blue-100'}`}>
                                {request.priority} Priority
                            </span>
                            <span className="text-xs text-gray-400 font-mono">ID: #{request.id.slice(0, 8).toUpperCase()}</span>
                        </div>
                        <div className="flex items-center justify-between mb-4">
                            <h1 className="text-3xl font-bold text-gray-900">{request.title}</h1>
                            <div className="text-right">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Service Type</p>
                                <p className="text-sm font-bold text-blue-600 uppercase italic">{request.serviceType?.replace('_', ' ')}</p>
                            </div>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed max-w-2xl mb-8">{request.description}</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-50">
                            <div>
                                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Specifications</h4>
                                <div className="space-y-2">
                                    {request.specifications ? (
                                        <p className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-xl border border-gray-100 italic">
                                            "{request.specifications}"
                                        </p>
                                    ) : (
                                        <p className="text-sm text-gray-400 italic">No specific instructions provided.</p>
                                    )}
                                </div>
                            </div>
                            <div>
                                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Brand Context</h4>
                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <p className="text-sm text-gray-700"><strong>Brand:</strong> {request.brandName || 'N/A'}</p>
                                    <p className="text-sm text-gray-700 mt-1"><strong>Website:</strong> <span className="text-blue-600 underline">{request.brandWebsite || 'N/A'}</span></p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quality Checklist (Manager Feature) */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <ShieldCheckIcon className="w-5 h-5 text-green-600" />
                            Final Quality Control
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            {Object.entries(qualityChecklist).map(([key, value]) => (
                                <label key={key} className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-all border border-transparent has-[:checked]:border-green-500/30 has-[:checked]:bg-green-50/50">
                                    <input
                                        type="checkbox"
                                        checked={value}
                                        onChange={(e) => setQualityChecklist({ ...qualityChecklist, [key]: e.target.checked })}
                                        className="w-5 h-5 rounded border-gray-200 text-green-600 focus:ring-green-500"
                                    />
                                    <span className="text-sm font-medium text-gray-700">
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
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <StarIcon className="w-5 h-5 text-orange-500" />
                            Feedback & Revision Notes
                        </h2>
                        <textarea
                            value={revisionNotes}
                            onChange={(e) => setRevisionNotes(e.target.value)}
                            placeholder="Provide specific feedback or revision requirements for the designer..."
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-gray-400"
                            rows={4}
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleReject}
                            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-orange-50 text-orange-600 border border-orange-100 rounded-2xl text-sm font-bold hover:bg-orange-100 transition-all"
                        >
                            <XCircleIcon className="w-5 h-5" />
                            Request Revisions
                        </button>
                        <button
                            onClick={handleApprove}
                            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 text-white rounded-2xl text-sm font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all"
                        >
                            <CheckCircleIcon className="w-5 h-5" />
                            Approve & Deliver
                        </button>
                    </div>

                    {/* Deliveries & Submissions */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <DocumentTextIcon className="w-5 h-5 text-blue-600" />
                                Project Deliverables
                            </h2>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">3 Versions Submitted</span>
                        </div>
                        <div className="p-6">
                            <div className="space-y-4">
                                {/* Placeholder for versions */}
                                <div className="p-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200 flex items-center justify-between group hover:border-blue-300 transition-all cursor-pointer">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center">
                                            <PaperClipIcon className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">v3_final_branding_pack.zip</p>
                                            <p className="text-[10px] text-gray-500 uppercase tracking-wide">Submitted 2h ago • 24.5 MB</p>
                                        </div>
                                    </div>
                                    <button className="text-[10px] font-bold text-blue-600 opacity-0 group-hover:opacity-100 transition-all uppercase underline tracking-widest">Download</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Communication Log (Summary) */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <ChatBubbleLeftRightIcon className="w-5 h-5 text-purple-600" />
                                Audit Conversation
                            </h2>
                            <Link to="/admin/communication" className="text-xs font-bold text-blue-600 hover:underline">Full Moderation View</Link>
                        </div>
                        <div className="p-6 space-y-6">
                            {request.messages?.slice(-3).map((msg, i) => (
                                <div key={i} className="flex items-start gap-4">
                                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500">
                                        {msg.sender?.firstName.charAt(0)}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-bold text-gray-900 mb-1">{msg.sender?.firstName} <span className="text-[9px] text-gray-400 font-medium uppercase ml-2">{msg.sender?.role}</span></p>
                                        <p className="text-[13px] text-gray-600 leading-relaxed bg-gray-50/50 p-3 rounded-xl">{msg.content}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    {/* Management Sidebar */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6">Internal Management</h3>
                        <div className="space-y-6">
                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase block mb-3">Status Control</label>
                                <div className="grid grid-cols-1 gap-2">
                                    {['active', 'assigned', 'in_progress', 'client_review', 'completed', 'cancelled'].map((s) => (
                                        <button
                                            key={s}
                                            onClick={() => handleUpdateStatus(s)}
                                            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all border ${request.status === s ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-50 text-gray-500 border-transparent hover:bg-gray-100'}`}
                                        >
                                            {s.toUpperCase()}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-6 border-t border-gray-100">
                                <label className="text-[10px] font-bold text-gray-400 uppercase block mb-4">Stakeholders</label>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                                            <UserIcon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-900">{request.client?.firstName} {request.client?.lastName}</p>
                                            <p className="text-[9px] text-gray-500 uppercase">Primary Client</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
                                            < ShieldCheckIcon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-900">
                                                {request.designer ? `${request.designer.firstName} ${request.designer.lastName}` : 'Unassigned'}
                                            </p>
                                            <p className="text-[9px] text-gray-500 uppercase">Lead Designer</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600">
                                            <UserIcon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-900">
                                                {request.manager ? `${request.manager.firstName} ${request.manager.lastName}` : 'System Auto'}
                                            </p>
                                            <p className="text-[9px] text-gray-500 uppercase">Account Manager</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Timeline Sidebar */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-center">
                        <div className="flex items-center justify-center gap-2 mb-6">
                            <ClockIcon className="w-5 h-5 text-orange-500" />
                            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest">SLA Deadline</h3>
                        </div>
                        <p className="text-3xl font-bold text-gray-900 mb-2">14:23:05</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter mb-6">Remaining for next action</p>
                        <div className="flex bg-gray-50 p-4 rounded-2xl items-center gap-4 text-left">
                            <CalendarIcon className="w-8 h-8 text-gray-400" />
                            <div>
                                <p className="text-xs font-bold text-gray-900">Oct 28, 2024</p>
                                <p className="text-[10px] text-gray-500 uppercase">Target Completion</p>
                            </div>
                        </div>
                    </div>

                    {/* Quick Escalation */}
                    <div className="bg-red-50 border border-red-100 p-6 rounded-2xl">
                        <h3 className="text-xs font-bold text-red-700 uppercase tracking-widest mb-4">Incident Control</h3>
                        <p className="text-[11px] text-red-600 leading-relaxed mb-6">This will notify all stakeholders and flag the request for immediate board review.</p>
                        <button className="w-full py-2.5 bg-red-600 text-white text-[10px] font-bold rounded-xl uppercase hover:bg-red-700 transition-all shadow-lg shadow-red-500/10">Flag for Escalation</button>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

// Internal Import for Link since it was missed in code block
import { Link } from 'react-router-dom';

export default GlobalRequestDetail;
