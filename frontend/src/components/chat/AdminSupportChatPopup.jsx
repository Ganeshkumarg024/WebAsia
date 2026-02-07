import { useState, useEffect, useRef } from 'react';
import { XMarkIcon, ChatBubbleLeftRightIcon, PaperAirplaneIcon, UserCircleIcon, MagnifyingGlassIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { ChatBubbleLeftIcon } from '@heroicons/react/24/solid';
import useSupportChatStore from '../../store/supportChatStore';
import { format, isValid, formatDistanceToNow } from 'date-fns';

const AdminSupportChatPopup = ({ isOpen, onClose }) => {
    const { messages, conversations, isLoading, sendMessage, fetchMessages, fetchConversations, markAsRead, setCurrentConversation, currentConversation } = useSupportChatStore();
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            fetchConversations();
        }
    }, [isOpen]);

    useEffect(() => {
        if (currentConversation) {
            fetchMessages(currentConversation);
            markAsRead(currentConversation);
        }
    }, [currentConversation]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();

        if (!newMessage.trim() || sending || !currentConversation) return;

        setSending(true);
        const result = await sendMessage(newMessage.trim(), currentConversation);

        if (result.success) {
            setNewMessage('');
        }

        setSending(false);
    };

    const handleSelectConversation = (clientId) => {
        setCurrentConversation(clientId);
    };

    const filteredConversations = conversations.filter(conv => {
        const clientName = conv.client?.firstName || conv.client?.name || '';
        const clientEmail = conv.client?.email || '';
        return clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            clientEmail.toLowerCase().includes(searchQuery.toLowerCase());
    });

    const selectedClient = conversations.find(c => c.clientId === currentConversation)?.client;

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity flex items-center justify-center"
                onClick={onClose}
            >
                {/* Popup - Centered */}
                <div
                    className="w-[900px] h-[600px] bg-white rounded-3xl shadow-2xl flex overflow-hidden border border-gray-200"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Conversations Sidebar */}
                    <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
                        {/* Header */}
                        <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-blue-600 to-blue-700">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-white/10 rounded-xl backdrop-blur-sm">
                                        <ChatBubbleLeftIcon className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-black text-white tracking-tight">Support</h2>
                                        <p className="text-[10px] text-blue-100 font-medium">
                                            {conversations.length} conversations
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    <XMarkIcon className="w-5 h-5 text-white" />
                                </button>
                            </div>

                            {/* Search */}
                            <div className="relative">
                                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-200" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search..."
                                    className="w-full pl-10 pr-3 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/30 text-xs font-medium"
                                />
                            </div>
                        </div>

                        {/* Conversations List */}
                        <div className="flex-1 overflow-y-auto">
                            {isLoading && conversations.length === 0 ? (
                                <div className="p-6 text-center">
                                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-4 border-blue-600 border-t-transparent"></div>
                                    <p className="mt-2 text-xs text-gray-500 font-medium">Loading...</p>
                                </div>
                            ) : filteredConversations.length === 0 ? (
                                <div className="p-6 text-center">
                                    <ChatBubbleLeftRightIcon className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                                    <p className="text-xs text-gray-500 font-medium">
                                        {searchQuery ? 'No matches' : 'No conversations'}
                                    </p>
                                </div>
                            ) : (
                                filteredConversations.map((conv) => (
                                    <button
                                        key={conv.clientId}
                                        onClick={() => handleSelectConversation(conv.clientId)}
                                        className={`w-full p-3 border-b border-gray-100 hover:bg-blue-50/50 transition-all text-left ${currentConversation === conv.clientId ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
                                            }`}
                                    >
                                        <div className="flex items-start gap-2">
                                            <div className="relative flex-shrink-0">
                                                {conv.client?.photoUrl ? (
                                                    <img src={conv.client.photoUrl} alt="" className="w-10 h-10 rounded-full object-cover" />
                                                ) : (
                                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                                                        <span className="text-white font-black text-sm">
                                                            {(conv.client?.firstName?.[0] || 'C').toUpperCase()}
                                                        </span>
                                                    </div>
                                                )}
                                                {conv.unreadCount > 0 && (
                                                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center border-2 border-white">
                                                        <span className="text-[9px] text-white font-black">{conv.unreadCount}</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-0.5">
                                                    <p className="text-xs font-black text-gray-900 truncate">
                                                        {conv.client?.firstName || 'Client'}
                                                    </p>
                                                    {conv.lastMessageAt && (
                                                        <span className="text-[9px] text-gray-400 font-medium">
                                                            {formatDistanceToNow(new Date(conv.lastMessageAt), { addSuffix: true })}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-[10px] text-gray-500 truncate font-medium">{conv.client?.email}</p>
                                            </div>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Chat Area */}
                    <div className="flex-1 flex flex-col bg-white">
                        {currentConversation && selectedClient ? (
                            <>
                                {/* Chat Header */}
                                <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                                    <div className="flex items-center gap-3">
                                        {selectedClient?.photoUrl ? (
                                            <img src={selectedClient.photoUrl} alt="" className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-100" />
                                        ) : (
                                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center ring-2 ring-blue-100">
                                                <span className="text-white font-black text-sm">
                                                    {(selectedClient?.firstName?.[0] || 'C').toUpperCase()}
                                                </span>
                                            </div>
                                        )}
                                        <div>
                                            <h3 className="text-sm font-black text-gray-900">
                                                {selectedClient?.firstName || 'Client'}
                                            </h3>
                                            <p className="text-xs text-gray-500 font-medium">{selectedClient?.email}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Messages */}
                                <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-gray-50/50 to-white">
                                    <div className="space-y-3">
                                        {messages.map((msg) => {
                                            const isAdmin = msg.senderType === 'admin';
                                            const messageDate = msg.createdAt || msg.created_at;

                                            return (
                                                <div key={msg.id} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                                                    <div className={`max-w-[70%]`}>
                                                        <div className={`rounded-xl p-3 shadow-sm ${isAdmin
                                                                ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white'
                                                                : 'bg-white border-2 border-gray-100'
                                                            }`}>
                                                            {!isAdmin && (
                                                                <div className="flex items-center gap-1.5 mb-1.5">
                                                                    <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
                                                                        <UserCircleIcon className="w-3 h-3 text-blue-600" />
                                                                    </div>
                                                                    <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest">
                                                                        Client
                                                                    </p>
                                                                </div>
                                                            )}
                                                            <p className={`text-xs leading-relaxed font-medium ${isAdmin ? 'text-white' : 'text-gray-900'}`}>
                                                                {msg.message}
                                                            </p>
                                                            <div className="flex items-center gap-1.5 mt-1.5">
                                                                <p className={`text-[9px] ${isAdmin ? 'text-blue-100' : 'text-gray-400'} font-medium`}>
                                                                    {messageDate && isValid(new Date(messageDate))
                                                                        ? format(new Date(messageDate), 'MMM dd, HH:mm')
                                                                        : 'Just now'}
                                                                </p>
                                                                {isAdmin && msg.isRead && (
                                                                    <CheckCircleIcon className="w-3 h-3 text-blue-200" />
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        <div ref={messagesEndRef} />
                                    </div>
                                </div>

                                {/* Input */}
                                <div className="border-t border-gray-200 bg-white p-3">
                                    <form onSubmit={handleSendMessage} className="flex gap-2">
                                        <input
                                            type="text"
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            placeholder="Type your reply..."
                                            className="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-xs font-medium placeholder-gray-400 bg-gray-50"
                                            disabled={sending}
                                        />
                                        <button
                                            type="submit"
                                            disabled={!newMessage.trim() || sending}
                                            className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 shadow-lg hover:shadow-xl"
                                        >
                                            {sending ? (
                                                <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent"></div>
                                            ) : (
                                                <PaperAirplaneIcon className="w-3 h-3" />
                                            )}
                                            Send
                                        </button>
                                    </form>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50/30">
                                <div className="text-center">
                                    <div className="inline-flex p-6 bg-white rounded-full shadow-lg mb-4">
                                        <ChatBubbleLeftRightIcon className="w-12 h-12 text-blue-600" />
                                    </div>
                                    <h3 className="text-lg font-black text-gray-900 mb-1">Select a Conversation</h3>
                                    <p className="text-xs text-gray-500 font-medium max-w-xs">
                                        Choose a client to view messages
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default AdminSupportChatPopup;
