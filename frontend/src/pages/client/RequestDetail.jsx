import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { toast as showToast } from 'react-hot-toast';
import {
    ArrowLeftIcon,
    IdentificationIcon,
    ClockIcon,
    XCircleIcon,
    CheckCircleIcon,
    ChatBubbleLeftIcon,
    PaperClipIcon
} from '@heroicons/react/24/outline';
import requestsAPI from '../../api/requests';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatusBadge from '../../components/shared/StatusBadge';
import useMessageStore from '../../store/messageStore';
import useTestimonialStore from '../../store/testimonialStore';
import FeedbackForm from '../../components/client/FeedbackForm';
import socketClient, { SOCKET_EVENTS } from '../../socket/client';
import useAuthStore from '../../store/authStore';

const RequestDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { messages, fetchMessages, sendMessage, addMessage, typingUsers, setTyping, clearMessages } = useMessageStore();
    const { myTestimonials, fetchMyTestimonials } = useTestimonialStore();
    const [request, setRequest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [revisionNote, setRevisionNote] = useState('');
    const [isTypingLocal, setIsTypingLocal] = useState(false);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);

    useEffect(() => {
        const init = async () => {
            await Promise.all([
                fetchRequest(),
                fetchMessages(id),
                fetchMyTestimonials()
            ]);
            socketClient.emit('join_request', id);
        };
        init();

        return () => {
            socketClient.emit('leave_request', id);
            clearMessages();
        };
    }, [id]);

    const handleTyping = (e) => {
        setRevisionNote(e.target.value);
        if (!isTypingLocal) {
            setIsTypingLocal(true);
            socketClient.emit('typing:start', { requestId: id });
            setTimeout(() => {
                setIsTypingLocal(false);
                socketClient.emit('typing:stop', { requestId: id });
            }, 3000);
        }
    };

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

    const handleSendMessage = async () => {
        if (!revisionNote.trim()) {
            showToast.error('Please provide revision notes');
            return;
        }

        try {
            const success = await sendMessage({
                requestId: id,
                message: revisionNote,
                messageType: 'text'
            });

            if (success) {
                setRevisionNote('');
                setIsTypingLocal(false);
                socketClient.emit('typing:stop', { requestId: id });
            }
        } catch (error) {
            showToast.error('Failed to send message');
        }
    };

    const activeTyping = typingUsers[id]?.filter(uid => uid !== user?.id) || [];

    const hasSubmittedFeedback = myTestimonials.some(t => t.requestId === id);
    const canShowFeedback = request?.status === 'completed' && !hasSubmittedFeedback;

    useEffect(() => {
        if (canShowFeedback) {
            const timer = setTimeout(() => setShowFeedbackModal(true), 1500);
            return () => clearTimeout(timer);
        }
    }, [canShowFeedback]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
                <div className="w-full max-w-7xl animate-pulse space-y-8">
                    <div className="h-20 bg-white rounded-3xl border border-gray-100"></div>
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        <div className="lg:col-span-8 h-96 bg-white rounded-3xl border border-gray-100"></div>
                        <div className="lg:col-span-4 h-96 bg-white rounded-3xl border border-gray-100"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!request) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
                <div className="text-center bg-white p-12 rounded-[40px] shadow-2xl shadow-gray-200/50 border border-gray-100 max-w-md w-full">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <IdentificationIcon className="w-10 h-10 text-gray-300" />
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 mb-2">Request Expired</h3>
                    <p className="text-gray-500 font-medium mb-8">This request might have been archived or deleted from our registry.</p>
                    <button
                        onClick={() => navigate('/client/requests')}
                        className="w-full py-4 bg-blue-600 text-white font-black text-sm uppercase tracking-widest rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20"
                    >
                        Return to Requests
                    </button>
                </div>
            </div>
        );
    }



    return (
        <DashboardLayout breadcrumbs={['Requests', request?.title || 'Detail']}>
            <AnimatePresence>
                {showFeedbackModal && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
                        <FeedbackForm
                            requestId={id}
                            serviceType={request.category}
                            onSuccess={() => {
                                setShowFeedbackModal(false);
                                fetchMyTestimonials();
                            }}
                            onCancel={() => setShowFeedbackModal(false)}
                        />
                    </div>
                )}
            </AnimatePresence>

            <div className="max-w-7xl mx-auto w-full space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Header Section */}
                <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-10">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => navigate('/client/requests')}
                                className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-blue-600 transition-colors"
                            >
                                <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                                Project Index
                            </button>
                        </div>
                        <div className="flex flex-wrap items-center gap-6">
                            <h1 className="text-5xl font-black text-gray-900 tracking-tight leading-none uppercase">
                                {request.title}
                            </h1>
                            <div className="scale-125 origin-left">
                                <StatusBadge status={request.status} />
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-6 text-xs font-bold text-gray-400">
                            <div className="flex items-center gap-2">
                                <IdentificationIcon className="w-4 h-4" />
                                <span className="uppercase tracking-widest">ID: {request.id?.slice(-8).toUpperCase() || '842-A-99'}</span>
                            </div>
                            <div className="w-1.5 h-1.5 bg-gray-200 rounded-full"></div>
                            <div className="flex items-center gap-2">
                                <ClockIcon className="w-4 h-4" />
                                <span className="uppercase tracking-widest">Initiated: {format(new Date(request.createdAt || request.created_at || Date.now()), 'MMM dd, yyyy')}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={() => {/* Open revision modal */ }}
                            className="px-8 py-4 bg-white text-gray-900 text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-gray-50 transition-all border border-gray-100 shadow-[0_4px_12px_rgba(0,0,0,0.02)] flex items-center gap-3"
                        >
                            <XCircleIcon className="w-5 h-5 text-orange-500" />
                            Request Revision
                        </button>
                        <button
                            onClick={handleApprove}
                            className="px-8 py-4 bg-blue-600 text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-blue-700 transition-all shadow-2xl shadow-blue-600/30 flex items-center gap-3"
                        >
                            <CheckCircleIcon className="w-5 h-5" />
                            Seal & Approve
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Left Column: Asset Preview */}
                    <div className="lg:col-span-8 space-y-10">
                        <div className="bg-white border border-gray-100 rounded-[40px] overflow-hidden shadow-[0_20px_60px_rgb(0,0,0,0.03)] group relative">
                            <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
                                <div className="flex items-center gap-3">
                                    <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></div>
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Live Creative Stage</span>
                                </div>
                                <button className="text-blue-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:underline">
                                    Full Resolution View
                                    <ArrowLeftIcon className="w-3 h-3 rotate-90" />
                                </button>
                            </div>
                            <div className="aspect-[16/10] bg-gray-50 relative flex items-center justify-center p-12 overflow-hidden">
                                <div className="absolute inset-0 bg-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

                                {/* Inner Preview Box */}
                                <div className="w-full h-full rounded-3xl border border-gray-100 bg-white flex items-center justify-center shadow-2xl shadow-gray-200/50 relative z-10 scale-100 group-hover:scale-[1.02] transition-transform duration-1000">
                                    <div className="text-center space-y-6 p-10">
                                        <div className="w-24 h-24 bg-blue-50 rounded-[32px] flex items-center justify-center mx-auto text-blue-600 shadow-inner">
                                            <ChatBubbleLeftIcon className="w-12 h-12" />
                                        </div>
                                        <div className="space-y-2">
                                            <h4 className="text-2xl font-black text-gray-900 tracking-tight">Vibrancy Review Pending</h4>
                                            <p className="text-gray-400 font-medium max-w-xs mx-auto leading-relaxed">The creative artifact is currently being rendered by our neural engine.</p>
                                        </div>
                                        <div className="pt-4">
                                            <button className="px-6 py-2 bg-gray-50 text-gray-500 text-[10px] font-black uppercase tracking-widest rounded-xl cursor-not-allowed">
                                                Awaiting Upload...
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Project Context */}
                        <div className="bg-white border border-gray-100 rounded-[40px] p-10 space-y-10 shadow-[0_8px_30px_rgb(0,0,0,0.02)] relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-gray-50/50 rounded-full -mr-32 -mt-32 blur-3xl"></div>

                            <div className="relative z-10">
                                <h3 className="text-2xl font-black text-gray-900 mb-6 tracking-tight flex items-center gap-3">
                                    <span className="w-8 h-8 bg-blue-600/10 text-blue-600 rounded-xl flex items-center justify-center text-sm">#</span>
                                    Operational Brief
                                </h3>
                                <p className="text-gray-600 leading-loose font-medium text-lg">
                                    {request.description}
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-10 border-t border-gray-50 relative z-10">
                                <div className="space-y-6">
                                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Initial Manifest Files</h4>
                                    <div className="space-y-4">
                                        {request.files?.map((file, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl border border-gray-50 hover:border-blue-200 transition-all group/file">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-white rounded-xl border border-gray-100 flex items-center justify-center text-gray-400 shadow-sm group-hover/file:text-blue-600 transition-colors">
                                                        <PaperClipIcon className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-900 font-black truncate max-w-[180px]">{file.name}</p>
                                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Digital Asset</p>
                                                    </div>
                                                </div>
                                                <button className="text-blue-600 text-[10px] font-black uppercase tracking-widest hover:underline px-2">Fetch</button>
                                            </div>
                                        ))}
                                        {(!request.files || request.files.length === 0) && (
                                            <div className="p-10 border-2 border-dashed border-gray-100 rounded-3xl text-center">
                                                <p className="text-xs text-gray-400 font-black uppercase tracking-widest italic">Zero external inputs</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Metrical Preferences</h4>
                                    <div className="space-y-6">
                                        <div className="flex justify-between items-center group">
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-blue-600 transition-colors">Aesthetic Axis</span>
                                            <span className="text-sm text-gray-900 font-black">Geometric / Precision</span>
                                        </div>
                                        <div className="flex justify-between items-center group">
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-blue-600 transition-colors">Registry Category</span>
                                            <span className="text-sm text-gray-900 font-black uppercase">{request.category}</span>
                                        </div>
                                        <div className="flex justify-between items-center group">
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-blue-600 transition-colors">Processing Weight</span>
                                            <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter ${request.priority === 'High' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
                                                }`}>
                                                {request.priority} Priority
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Activity Feed */}
                    <div className="lg:col-span-4 space-y-10">
                        {/* Assignment Details */}
                        <div className="bg-white border border-gray-100 rounded-[40px] p-8 space-y-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
                            <h3 className="text-xl font-black text-gray-900 tracking-tight leading-none px-1">Assignment Logic</h3>

                            <div className="flex items-center gap-4 p-4 bg-gray-50/50 rounded-3xl border border-gray-50">
                                <div className="w-16 h-16 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-blue-600 font-black text-xl shadow-sm">
                                    {request.designer ? `${request.designer.firstName[0]}${request.designer.lastName[0]}` : '??'}
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Lead Architect</p>
                                    <p className="text-gray-900 font-black text-lg tracking-tight uppercase">
                                        {request.designer ? `${request.designer.firstName} ${request.designer.lastName}` : 'In Allocation...'}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-6 pt-2">
                                <div className="flex justify-between items-center px-2">
                                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Final Gateway</p>
                                    <p className="text-sm text-gray-900 font-black">{request.deadline ? format(new Date(request.deadline), 'MMM dd, yyyy') : 'Calibrating...'}</p>
                                </div>
                                <div className="flex justify-between items-center px-2">
                                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Core Domain</p>
                                    <p className="text-sm text-gray-900 font-black uppercase">{request.category}</p>
                                </div>
                            </div>
                        </div>

                        {/* Activity Matrix */}
                        <div className="bg-white border border-gray-100 rounded-[40px] flex flex-col h-[600px] overflow-hidden shadow-[0_20px_60px_rgb(0,0,0,0.03)] relative">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-full -mr-16 -mt-16 blur-3xl"></div>

                            <div className="p-6 border-b border-gray-50 flex items-center justify-between relative z-10">
                                <h3 className="text-[10px] font-black text-gray-900 uppercase tracking-[0.2em]">Activity Matrix</h3>
                                <div className={`w-2.5 h-2.5 rounded-full ${activeTyping.length > 0 ? 'bg-green-500 animate-pulse' : 'bg-blue-600'} shadow-lg shadow-blue-600/20`}></div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-8 gap-4 relative z-10 custom-scrollbar flex flex-col-reverse">
                                {activeTyping.length > 0 && (
                                    <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold italic py-2">
                                        <div className="flex gap-1">
                                            <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></span>
                                            <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                                            <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                                        </div>
                                        Professional is typing...
                                    </div>
                                )}

                                {messages.map((message) => (
                                    <div key={message.id} className={`flex flex-col ${message.senderId === user?.id ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2 duration-500`}>
                                        <div className={`px-6 py-4 rounded-[28px] max-w-[90%] text-sm font-medium leading-relaxed shadow-sm ${message.senderId === user?.id
                                            ? 'bg-blue-600 text-white rounded-tr-none shadow-blue-600/10'
                                            : 'bg-white text-gray-700 rounded-tl-none border border-gray-100'
                                            }`}>
                                            {message.message}
                                        </div>
                                        <span className="text-[9px] font-black text-gray-400 mt-3 uppercase tracking-widest px-1">{format(new Date(message.createdAt || message.created_at || Date.now()), 'HH:mm')}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="p-6 border-t border-gray-50 bg-gray-50/30 relative z-10">
                                <div className="flex items-end gap-3 bg-white border border-gray-100 rounded-[28px] p-2 pr-4 shadow-2xl shadow-gray-200/50 focus-within:border-blue-600 transition-all">
                                    <textarea
                                        value={revisionNote}
                                        onChange={handleTyping}
                                        onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
                                        placeholder={request.designer ? "Transmit signal or revision requirements..." : "Waiting for designer allocation..."}
                                        className="bg-transparent border-none focus:ring-0 text-sm text-gray-900 font-medium flex-1 outline-none resize-none py-3 px-4 min-h-[44px] max-h-[120px]"
                                        rows="1"
                                        disabled={!request.designer}
                                    />
                                    <button
                                        onClick={handleSendMessage}
                                        className="w-10 h-10 bg-blue-600 text-white rounded-2xl flex items-center justify-center hover:bg-blue-700 transition-all hover:scale-110 active:scale-95 disabled:opacity-20 disabled:grayscale disabled:scale-100 disabled:cursor-not-allowed shadow-xl shadow-blue-600/10 mb-1"
                                        disabled={!revisionNote.trim() || !request.designer}
                                    >
                                        <ArrowLeftIcon className="w-5 h-5 rotate-180" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default RequestDetail;
