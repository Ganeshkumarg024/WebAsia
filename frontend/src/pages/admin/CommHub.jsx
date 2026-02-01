import useMessageStore from '../../store/messageStore';
import socketClient, { SOCKET_EVENTS } from '../../socket/client';

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
        // Leave previous room if any
        if (selectedThread?.id) {
            socketClient.emit('leave_request', selectedThread.id);
        }

        await fetchCommThreadDetails(id);
        await fetchMessages(id);

        // Join new room
        socketClient.emit('join_request', id);
    };

    const handleFlagThread = (id) => {
        const reason = prompt("Reason for flagging this thread?");
        if (reason) flagCommThread(id, reason);
    };

    const isTyping = selectedThread ? typingUsers[selectedThread.id]?.length > 0 : false;

    return (
        <DashboardLayout breadcrumbs={['Admin', 'Comm Hub']}>
            <div className="flex h-[calc(100vh-140px)] overflow-hidden bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">

                {/* Threads Sidebar */}
                <div className="w-80 flex-shrink-0 border-r border-gray-100 dark:border-slate-800 flex flex-col">
                    <div className="p-4 border-b border-gray-100 dark:border-slate-800">
                        <div className="relative">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search threads..."
                                className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-slate-800 border-none rounded-xl text-xs focus:ring-2 focus:ring-blue-500/50 text-gray-900 dark:text-white transition-all"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {commThreads.length > 0 ? (
                            commThreads.map((thread) => (
                                <div
                                    key={thread.id}
                                    onClick={() => handleSelectThread(thread.id)}
                                    className={`p-4 border-b border-gray-50 dark:border-slate-800 cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-slate-800/50 ${selectedThread?.id === thread.id ? 'bg-blue-50/50 dark:bg-blue-900/10 border-l-4 border-l-blue-600' : ''}`}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate max-w-[140px]">
                                            {thread.title || `Request #${thread.id.slice(0, 8)}`}
                                        </h3>
                                        {thread.isFlagged ? (
                                            <span className="text-[9px] text-red-600 font-bold flex items-center gap-1 uppercase bg-red-50 dark:bg-red-900/20 px-1.5 py-0.5 rounded">
                                                <FlagIconSolid className="w-3 h-3" /> Flagged
                                            </span>
                                        ) : (
                                            <span className="text-[10px] text-gray-400">12m ago</span>
                                        )}
                                    </div>
                                    <p className="text-[11px] text-gray-500 truncate mb-1">
                                        Designer: {thread.designer?.firstName} vs Client: {thread.client?.firstName}
                                    </p>
                                    <p className="text-[10px] text-gray-400 italic truncate">
                                        {thread.lastMessage || "No messages yet..."}
                                    </p>
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center text-gray-400 text-xs italic">
                                No active threads found.
                            </div>
                        )}
                    </div>
                </div>

                {/* Chat Area */}
                <div className="flex-1 flex flex-col bg-white dark:bg-slate-900">
                    {selectedThread ? (
                        <>
                            <div className="bg-blue-600/5 border-b border-blue-600/10 px-6 py-2 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <ShieldCheckIcon className="w-4 h-4 text-blue-600" />
                                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">
                                        Moderation Mode Active
                                    </span>
                                </div>
                                <button
                                    onClick={() => handleFlagThread(selectedThread.id)}
                                    className="text-[10px] font-bold text-red-600 hover:underline uppercase tracking-widest flex items-center gap-1"
                                >
                                    <FlagIconOutline className="w-3 h-3" /> Flag Thread
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-gray-50/30 dark:bg-slate-900/30 flex flex-col-reverse">
                                {isTyping && (
                                    <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold italic animate-pulse">
                                        <div className="flex gap-1">
                                            <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></span>
                                            <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                                            <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                                        </div>
                                        Someone is typing...
                                    </div>
                                )}
                                {messages.map((msg) => (
                                    <div key={msg.id} className={`flex items-start gap-3 ${msg.senderId === selectedThread.clientId ? 'flex-row-reverse' : ''}`}>
                                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                                            {msg.sender?.photoUrl ? (
                                                <img src={msg.sender.photoUrl} alt="" className="w-full h-full rounded-full object-cover" />
                                            ) : (
                                                <span className="text-xs font-bold">{msg.sender?.firstName.charAt(0)}</span>
                                            )}
                                        </div>
                                        <div className={`max-w-md ${msg.senderId === selectedThread.clientId ? 'text-right' : ''}`}>
                                            <div className={`flex items-baseline gap-2 mb-1 ${msg.senderId === selectedThread.clientId ? 'justify-end' : ''}`}>
                                                <span className="text-xs font-bold text-gray-900 dark:text-white">
                                                    {msg.sender?.firstName} ({msg.sender?.role})
                                                </span>
                                                <span className="text-[10px] text-gray-400">
                                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <div className={`p-3 rounded-2xl text-sm ${msg.senderId === selectedThread.clientId ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-100 dark:border-slate-700 rounded-tl-none Shadow-sm'}`}>
                                                {msg.message}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="p-4 border-t border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 mt-auto">
                                <div className="flex items-center gap-3 opacity-50 cursor-not-allowed">
                                    <button className="p-2 text-gray-400"><PaperClipIcon className="w-5 h-5" /></button>
                                    <div className="flex-1 bg-gray-50 dark:bg-slate-800 px-4 py-2.5 rounded-xl text-sm text-gray-400">
                                        Compose moderated message...
                                    </div>
                                    <button className="p-2 text-blue-600"><PaperAirplaneIcon className="w-5 h-5 rotate-90" /></button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-12 text-center">
                            <ChatBubbleLeftRightIcon className="w-16 h-16 mb-4 opacity-20" />
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white opacity-50">Select a conversation</h3>
                            <p className="text-sm max-w-xs mt-2">Choose a thread from the left to monitor communications and assets.</p>
                        </div>
                    )}
                </div>

                {/* Asset Archive Sidebar */}
                <div className="w-80 flex-shrink-0 border-l border-gray-100 dark:border-slate-800 flex flex-col bg-gray-50/30 dark:bg-slate-800/20">
                    <div className="p-6 border-b border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-10">
                        <div className="flex items-center gap-2 mb-6">
                            <FolderIcon className="w-5 h-5 text-blue-600" />
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-widest">File Archive</h3>
                        </div>
                        <div className="flex gap-2">
                            {['ALL FILES', 'IMAGES', 'DOCS'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all ${activeTab === tab ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10' : 'bg-gray-100 dark:bg-slate-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-slate-700'}`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                        <div className="grid grid-cols-2 gap-3">
                            {/* Placeholder for real assets */}
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="group relative aspect-square rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-800 shadow-sm">
                                    <div className="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-slate-900">
                                        <DocumentTextIcon className="w-8 h-8 text-gray-300" />
                                    </div>
                                    <div className="absolute inset-x-0 bottom-0 p-2 bg-black/50 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-between">
                                        <span className="text-[10px] text-white font-bold truncate">asset_{i}.jpg</span>
                                        <div className="flex gap-1">
                                            <button className="p-1 bg-white/20 rounded-full text-white hover:bg-white/40"><EyeIcon className="w-3 h-3" /></button>
                                            <button className="p-1 bg-white/20 rounded-full text-white hover:bg-white/40"><ArrowDownTrayIcon className="w-3 h-3" /></button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {selectedThread?.isFlagged && (
                            <div className="mt-8 p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/50 rounded-2xl">
                                <div className="flex items-center gap-2 mb-2">
                                    <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
                                    <p className="text-xs font-bold text-red-700 dark:text-red-400 uppercase tracking-widest">High Risk Hub</p>
                                </div>
                                <p className="text-[11px] text-red-600 dark:text-red-300 leading-relaxed italic">
                                    "System flagged contractual dispute keywords. Admin intervention recommended."
                                </p>
                                <button className="w-full mt-4 py-2 bg-red-600 text-white text-[10px] font-bold rounded-xl uppercase hover:bg-red-700 shadow-lg shadow-red-500/20 transition-all">
                                    Intervene
                                </button>
                            </div>
                        )}

                        <div className="mt-8 space-y-4">
                            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2">Thread Members</h4>
                            <div className="space-y-3 px-2">
                                {selectedThread?.participants?.map((p, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-[10px]">
                                            {p.firstName?.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-bold text-gray-900 dark:text-white leading-none">{p.firstName} {p.lastName}</p>
                                            <p className="text-[9px] text-gray-400 mt-1 uppercase tracking-wide">{p.role}</p>
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
