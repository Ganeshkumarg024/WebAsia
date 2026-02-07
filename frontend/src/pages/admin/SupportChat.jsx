import { useState, useEffect, useRef } from 'react';
import { ChatBubbleLeftRightIcon, PaperAirplaneIcon, UserCircleIcon, MagnifyingGlassIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { ChatBubbleLeftIcon } from '@heroicons/react/24/solid';
import useSupportChatStore from '../../store/supportChatStore';
import useAuthStore from '../../store/authStore';
import { format, isValid, formatDistanceToNow } from 'date-fns';

const AdminSupportChat = () => {
    const { user } = useAuthStore();
    const { messages, conversations, isLoading, sendMessage, fetchMessages, fetchConversations, markAsRead, setCurrentConversation, currentConversation } = useSupportChatStore();
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const messagesEndRef = useRef(null);

    useEffect(() => {
        fetchConversations();
    }, []);

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

    return (
        <div className="h-[calc(100vh-120px)] bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
            <div className="flex h-full">
                {/* Conversations Sidebar */}
                <div className="w-96 bg-white border-r border-gray-200 flex flex-col">
                    {/* Header */}
                    <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-600 to-blue-700">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm">
                                <ChatBubbleLeftIcon className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-white tracking-tight">Support Messages</h2>
                                <p className="text-xs text-blue-100 font-medium">
                                    {conversations.length} {conversations.length === 1 ? 'conversation' : 'conversations'}
                                </p>
                            </div>
                        </div>

                        {/* Search */}
                        <div className="relative">
                            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-200" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search clients..."
                                className="w-full pl-12 pr-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/30 text-sm font-medium"
                            />
                        </div>
                    </div>

                    {/* Conversations List */}
                    <div className="flex-1 overflow-y-auto">
                        {isLoading && conversations.length === 0 ? (
                            <div className="p-8 text-center">
                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
                                <p className="mt-3 text-sm text-gray-500 font-medium">Loading conversations...</p>
                            </div>
                        ) : filteredConversations.length === 0 ? (
                            <div className="p-8 text-center">
                                <div className="inline-flex p-6 bg-gray-50 rounded-full mb-4">
                                    <ChatBubbleLeftRightIcon className="w-12 h-12 text-gray-300" />
                                </div>
                                <h3 className="text-base font-black text-gray-900 mb-1">
                                    {searchQuery ? 'No matches found' : 'No conversations yet'}
                                </h3>
                                <p className="text-sm text-gray-500 font-medium">
                                    {searchQuery ? 'Try a different search term' : 'Client messages will appear here'}
                                </p>
                            </div>
                        ) : (
                            filteredConversations.map((conv) => (
                                <button
                                    key={conv.clientId}
                                    onClick={() => handleSelectConversation(conv.clientId)}
                                    className={`w-full p-4 border-b border-gray-100 hover:bg-blue-50/50 transition-all text-left group ${currentConversation === conv.clientId ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
                                        }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="relative flex-shrink-0">
                                            {conv.client?.photoUrl ? (
                                                <img src={conv.client.photoUrl} alt="" className="w-12 h-12 rounded-full object-cover" />
                                            ) : (
                                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                                                    <span className="text-white font-black text-lg">
                                                        {(conv.client?.firstName?.[0] || conv.client?.name?.[0] || 'C').toUpperCase()}
                                                    </span>
                                                </div>
                                            )}
                                            {conv.unreadCount > 0 && (
                                                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center border-2 border-white">
                                                    <span className="text-[10px] text-white font-black">{conv.unreadCount}</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <p className="text-sm font-black text-gray-900 truncate">
                                                    {conv.client?.firstName || conv.client?.name || 'Client'}
                                                </p>
                                                {conv.lastMessageAt && (
                                                    <span className="text-[10px] text-gray-400 font-medium">
                                                        {formatDistanceToNow(new Date(conv.lastMessageAt), { addSuffix: true })}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-500 truncate font-medium">{conv.client?.email}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[10px] text-gray-400 font-medium">
                                                    {conv.messageCount || 0} messages
                                                </span>
                                            </div>
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
                            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                                <div className="flex items-center gap-4">
                                    {selectedClient?.photoUrl ? (
                                        <img src={selectedClient.photoUrl} alt="" className="w-14 h-14 rounded-full object-cover ring-4 ring-blue-100" />
                                    ) : (
                                        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center ring-4 ring-blue-100">
                                            <span className="text-white font-black text-xl">
                                                {(selectedClient?.firstName?.[0] || selectedClient?.name?.[0] || 'C').toUpperCase()}
                                            </span>
                                        </div>
                                    )}
                                    <div>
                                        <h3 className="text-lg font-black text-gray-900">
                                            {selectedClient?.firstName || selectedClient?.name || 'Client'}
                                        </h3>
                                        <p className="text-sm text-gray-500 font-medium">{selectedClient?.email}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-gray-50/50 to-white">
                                <div className="max-w-4xl mx-auto space-y-4">
                                    {messages.map((msg) => {
                                        const isAdmin = msg.senderType === 'admin';
                                        const messageDate = msg.createdAt || msg.created_at;

                                        return (
                                            <div key={msg.id} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`max-w-[70%] ${isAdmin ? 'order-2' : 'order-1'}`}>
                                                    <div className={`rounded-2xl p-4 shadow-sm ${isAdmin
                                                            ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white'
                                                            : 'bg-white border-2 border-gray-100'
                                                        }`}>
                                                        {!isAdmin && (
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                                                                    <UserCircleIcon className="w-4 h-4 text-blue-600" />
                                                                </div>
                                                                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">
                                                                    Client
                                                                </p>
                                                            </div>
                                                        )}
                                                        <p className={`text-sm leading-relaxed font-medium ${isAdmin ? 'text-white' : 'text-gray-900'}`}>
                                                            {msg.message}
                                                        </p>
                                                        <div className="flex items-center gap-2 mt-2">
                                                            <p className={`text-[10px] ${isAdmin ? 'text-blue-100' : 'text-gray-400'} font-medium`}>
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
                            <div className="border-t border-gray-200 bg-white p-6">
                                <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto">
                                    <div className="flex gap-3">
                                        <input
                                            type="text"
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            placeholder="Type your reply..."
                                            className="flex-1 px-6 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm font-medium placeholder-gray-400 bg-gray-50"
                                            disabled={sending}
                                        />
                                        <button
                                            type="submit"
                                            disabled={!newMessage.trim() || sending}
                                            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg hover:shadow-xl"
                                        >
                                            {sending ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                                    Sending
                                                </>
                                            ) : (
                                                <>
                                                    <PaperAirplaneIcon className="w-4 h-4" />
                                                    Send
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50/30">
                            <div className="text-center">
                                <div className="inline-flex p-8 bg-white rounded-full shadow-lg mb-6">
                                    <ChatBubbleLeftRightIcon className="w-16 h-16 text-blue-600" />
                                </div>
                                <h3 className="text-2xl font-black text-gray-900 mb-2">Select a Conversation</h3>
                                <p className="text-sm text-gray-500 font-medium max-w-sm">
                                    Choose a client from the list to view their messages and start chatting
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminSupportChat;
