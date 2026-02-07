import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { XMarkIcon, PaperAirplaneIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import useSupportChatStore from '../../store/supportChatStore';
import useAuthStore from '../../store/authStore';
import { format, isValid } from 'date-fns';

const SupportChat = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { messages, isLoading, sendMessage, fetchMessages, markAsRead } = useSupportChatStore();
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        fetchMessages();
        markAsRead(user?.id);
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();

        if (!newMessage.trim() || sending) return;

        setSending(true);
        const result = await sendMessage(newMessage.trim());

        if (result.success) {
            setNewMessage('');
        }

        setSending(false);
    };

    const handleClose = () => {
        navigate('/client/dashboard');
    };

    return (
        <div className="fixed inset-0 z-50 bg-white flex flex-col">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 shadow-lg">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/10 rounded-2xl">
                            <ChatBubbleLeftRightIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black tracking-tight">Priority Support</h1>
                            <p className="text-blue-100 text-sm font-medium">Active 24/7 for our partners</p>
                        </div>
                    </div>
                    <button onClick={handleClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
                <div className="max-w-4xl mx-auto space-y-4">
                    {isLoading && messages.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
                            <p className="mt-4 text-gray-500 font-medium">Loading messages...</p>
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="inline-flex p-6 bg-blue-50 rounded-full mb-4">
                                <ChatBubbleLeftRightIcon className="w-12 h-12 text-blue-600" />
                            </div>
                            <h3 className="text-xl font-black text-gray-900 mb-2">Start a Conversation</h3>
                            <p className="text-gray-500 font-medium">Send us a message and we will get back to you right away!</p>
                        </div>
                    ) : (
                        messages.map((msg) => {
                            const isAdmin = msg.senderType === 'admin';
                            const messageDate = msg.createdAt || msg.created_at;

                            return (
                                <div key={msg.id} className={`flex ${isAdmin ? 'justify-start' : 'justify-end'}`}>
                                    <div className={`max-w-[70%] ${isAdmin ? 'order-1' : 'order-2'}`}>
                                        <div className={`rounded-2xl p-4 shadow-sm ${isAdmin ? 'bg-white border border-gray-100' : 'bg-blue-600 text-white'}`}>
                                            {isAdmin && (
                                                <p className="text-xs font-black text-blue-600 uppercase tracking-widest mb-2">
                                                    Admin Support
                                                </p>
                                            )}
                                            <p className={`text-sm leading-relaxed ${isAdmin ? 'text-gray-900' : 'text-white'}`}>
                                                {msg.message}
                                            </p>
                                            <p className={`text-[10px] mt-2 ${isAdmin ? 'text-gray-400' : 'text-blue-100'}`}>
                                                {messageDate && isValid(new Date(messageDate)) ? format(new Date(messageDate), 'MMM dd, HH:mm') : 'Just now'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            <div className="border-t border-gray-200 bg-white p-6 shadow-lg">
                <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto">
                    <div className="flex gap-4">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type your message..."
                            className="flex-1 px-6 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm font-medium"
                            disabled={sending}
                        />
                        <button
                            type="submit"
                            disabled={!newMessage.trim() || sending}
                            className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg"
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
        </div>
    );
};

export default SupportChat;
