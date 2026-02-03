import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import useAdminStore from '../../store/adminStore';
import useMessageStore from '../../store/messageStore';
import socketClient, { SOCKET_EVENTS } from '../../socket/client';
import {
    MagnifyingGlassIcon,
    FolderIcon,
    DocumentTextIcon,
    ArrowDownTrayIcon,
    EyeIcon,
    ExclamationTriangleIcon,
    ShieldCheckIcon,
    FlagIcon as FlagIconOutline,
    PaperClipIcon,
    PaperAirplaneIcon,
    ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import { FlagIcon as FlagIconSolid } from '@heroicons/react/24/solid';

const CommHub = () => {
    const { commThreads, selectedThread, loading, fetchCommThreads, fetchCommThreadDetails, flagCommThread } = useAdminStore();
    const { messages, fetchMessages, typingUsers, clearMessages } = useMessageStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('ALL FILES');

    useEffect(() => {
        fetchCommThreads();
        return () => {
            if (selectedThread?.id) {
                socketClient.emit('leave_request', selectedThread.id);
            }
            clearMessages();
        };
    }, []);

    const handleSelectThread = async (id) => {
        if (selectedThread?.id) {
            socketClient.emit('leave_request', selectedThread.id);
        }
        await fetchCommThreadDetails(id);
        await fetchMessages(id);
        socketClient.emit('join_request', id);
    };

    const handleFlagThread = (id) => {
        const reason = prompt("Reason for flagging this thread?");
        if (reason) flagCommThread(id, reason);
    };

    const isTyping = selectedThread ? typingUsers[selectedThread.id]?.length > 0 : false;

    return (
        <DashboardLayout breadcrumbs={['Admin', 'Comm Hub']}>
            <div className="flex h-[calc(100vh-140px)] overflow-hidden bg-white rounded-[32px] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">

                {/* Threads Sidebar */}
                <div className="w-80 flex-shrink-0 border-r border-gray-100 flex flex-col bg-white">
                    <div className="p-6 border-b border-gray-100">
                        <h2 className="text-xl font-black text-gray-900 mb-4 tracking-tight">Messages</h2>
                        <div className="relative">
                            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search threads..."
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                        {commThreads.length > 0 ? (
                            commThreads.map((thread) => (
                                <div
                                    key={thread.id}
                                    onClick={() => handleSelectThread(thread.id)}
                                    className={`p-4 rounded-2xl cursor-pointer transition-all border border-transparent ${selectedThread?.id === thread.id
                                        ? 'bg-blue-50 border-blue-100 shadow-sm'
                                        : 'hover:bg-gray-50'}`}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className={`text-sm font-black truncate max-w-[140px] ${selectedThread?.id === thread.id ? 'text-blue-900' : 'text-gray-900'}`}>
                                            {thread.title || `Request #${thread.id.slice(0, 8)}`}
                                        </h3>
                                        {thread.isFlagged ? (
                                            <span className="text-[9px] text-red-600 font-bold flex items-center gap-1 uppercase bg-red-50 px-2 py-0.5 rounded-full">
                                                <FlagIconSolid className="w-3 h-3" /> Flagged
                                            </span>
                                        ) : (
                                            <span className="text-[9px] text-gray-400 font-bold">12m</span>
                                        )}
                                    </div>
                                    <p className="text-[11px] text-gray-500 truncate mb-2 font-medium">
                                        {thread.designer?.firstName} vs {thread.client?.firstName}
                                    </p>
                                    <p className={`text-[11px] truncate font-medium ${selectedThread?.id === thread.id ? 'text-blue-700/70' : 'text-gray-400'}`}>
                                        {thread.lastMessage || "No messages yet..."}
                                    </p>
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center text-gray-400 text-xs font-bold">
                                No active threads found.
                            </div>
                        )}
                    </div>
                </div>

                {/* Chat Area */}
                <div className="flex-1 flex flex-col bg-gray-50/30">
                    {selectedThread ? (
                        <>
                            <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between shadow-sm z-10">
                                <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-lg">
                                    <ShieldCheckIcon className="w-4 h-4 text-blue-600" />
                                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">
                                        Moderation Mode Active
                                    </span>
                                </div>
                                <button
                                    onClick={() => handleFlagThread(selectedThread.id)}
                                    className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-[10px] font-black hover:bg-red-100 transition-all uppercase tracking-widest flex items-center gap-2"
                                >
                                    <FlagIconOutline className="w-4 h-4" /> Flag Thread
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar flex flex-col-reverse">
                                {isTyping && (
                                    <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold italic animate-pulse">
                                        <div className="flex gap-1">
                                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                                        </div>
                                        Someone is typing...
                                    </div>
                                )}
                                {messages.map((msg) => (
                                    <div key={msg.id} className={`flex items-start gap-4 ${msg.senderId === selectedThread.clientId ? 'flex-row-reverse' : ''}`}>
                                        <div className="w-10 h-10 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-center text-blue-600 shrink-0 overflow-hidden">
                                            {msg.sender?.photoUrl ? (
                                                <img src={msg.sender.photoUrl} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-sm font-black">{msg.sender?.firstName.charAt(0)}</span>
                                            )}
                                        </div>
                                        <div className={`max-w-md ${msg.senderId === selectedThread.clientId ? 'text-right' : ''} group`}>
                                            <div className={`flex items-baseline gap-2 mb-1.5 ${msg.senderId === selectedThread.clientId ? 'justify-end' : ''}`}>
                                                <span className="text-xs font-black text-gray-900">
                                                    {msg.sender?.firstName} <span className="text-gray-400 font-medium">({msg.sender?.role})</span>
                                                </span>
                                                <span className="text-[10px] text-gray-400 font-bold">
                                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <div className={`p-4 rounded-2xl text-sm font-medium shadow-sm transition-all ${msg.senderId === selectedThread.clientId
                                                ? 'bg-blue-600 text-white rounded-tr-none shadow-blue-600/20'
                                                : 'bg-white text-gray-600 border border-gray-100 rounded-tl-none'}`}>
                                                {msg.message}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="p-6 bg-white border-t border-gray-100 mt-auto">
                                <div className="flex items-center gap-3">
                                    <button className="p-3 text-gray-400 hover:bg-gray-50 rounded-xl transition-all"><PaperClipIcon className="w-5 h-5" /></button>
                                    <div className="flex-1 bg-gray-50 px-4 py-3 rounded-xl text-sm font-bold text-gray-400 border border-transparent focus-within:border-blue-200 focus-within:bg-white transition-all cursor-not-allowed">
                                        Compose moderated message...
                                    </div>
                                    <button className="p-3 bg-gray-100 text-gray-400 rounded-xl cursor-not-allowed"><PaperAirplaneIcon className="w-5 h-5 rotate-90" /></button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-12 text-center">
                            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                                <ChatBubbleLeftRightIcon className="w-10 h-10 text-gray-300" />
                            </div>
                            <h3 className="text-xl font-black text-gray-900 mb-2">Select a conversation</h3>
                            <p className="text-sm font-medium text-gray-500 max-w-xs">Values communications and assets will appear here. Choose a thread to start monitoring.</p>
                        </div>
                    )}
                </div>

                {/* Asset Archive Sidebar */}
                <div className="w-80 flex-shrink-0 border-l border-gray-100 flex flex-col bg-white">
                    <div className="p-6 border-b border-gray-100 sticky top-0 z-10 bg-white">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                                <FolderIcon className="w-5 h-5" />
                            </div>
                            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">File Archive</h3>
                        </div>
                        <div className="flex p-1 bg-gray-50 rounded-xl">
                            {['ALL FILES', 'IMAGES', 'DOCS'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`flex-1 py-1.5 text-[10px] font-black rounded-lg transition-all ${activeTab === tab ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                        <div className="grid grid-cols-2 gap-3">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="group relative aspect-square rounded-xl border border-gray-100 overflow-hidden bg-gray-50 cursor-pointer hover:border-blue-200 transition-all">
                                    <div className="absolute inset-0 flex items-center justify-center text-gray-300 group-hover:text-blue-200 transition-colors">
                                        <DocumentTextIcon className="w-8 h-8" />
                                    </div>
                                    <div className="absolute inset-x-0 bottom-0 p-3 bg-white/90 backdrop-blur-sm translate-y-full group-hover:translate-y-0 transition-transform">
                                        <span className="text-[10px] text-gray-900 font-bold truncate block mb-2">asset_{i}.jpg</span>
                                        <div className="flex gap-2">
                                            <button className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"><EyeIcon className="w-3 h-3" /></button>
                                            <button className="p-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"><ArrowDownTrayIcon className="w-3 h-3" /></button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {selectedThread?.isFlagged && (
                            <div className="mt-8 p-6 bg-red-50 border border-red-100 rounded-[20px]">
                                <div className="flex items-center gap-2 mb-3">
                                    <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
                                    <p className="text-xs font-black text-red-900 uppercase tracking-widest">High Risk Hub</p>
                                </div>
                                <p className="text-[11px] text-red-700 font-medium leading-relaxed italic mb-4">
                                    "System flagged contractual dispute keywords. Admin intervention recommended."
                                </p>
                                <button className="w-full py-3 bg-red-600 text-white text-[10px] font-black rounded-xl uppercase hover:bg-red-700 shadow-lg shadow-red-600/20 transition-all">
                                    Intervene
                                </button>
                            </div>
                        )}

                        <div className="mt-8 space-y-4">
                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Thread Members</h4>
                            <div className="space-y-4 px-2">
                                {selectedThread?.participants?.map((p, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600 font-black text-xs">
                                            {p.firstName?.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-900 leading-none">{p.firstName} {p.lastName}</p>
                                            <p className="text-[10px] text-gray-400 mt-1 font-bold uppercase tracking-wide">{p.role}</p>
                                        </div>
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

export default CommHub;
