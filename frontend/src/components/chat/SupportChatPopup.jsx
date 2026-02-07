import { useState, useEffect, useRef } from 'react';
import { XMarkIcon, PaperAirplaneIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import useSupportChatStore from '../../store/supportChatStore';
import useAuthStore from '../../store/authStore';
import { format, isValid } from 'date-fns';

const SupportChatPopup = ({ isOpen, onClose }) => {
    const { user } = useAuthStore();
    const { messages, isLoading, sendMessage, fetchMessages } = useSupportChatStore();
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            fetchMessages();
        }
    }, [isOpen]);

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

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity"
                onClick={onClose}
            />

            {/* Popup */}
            <div className="fixed bottom-6 right-6 w-[450px] h-[650px] bg-white rounded-3xl shadow-2xl z-50 flex flex-col overflow-hidden border border-gray-200">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm">
                            <ChatBubbleLeftRightIcon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-white tracking-tight">Priority Support</h2>
                            <p className="text-xs text-blue-100 font-medium">Active 24/7 for our partners</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                    >
                        <XMarkIcon className="w-6 h-6 text-white" />
                    </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-gray-50/50 to-white">
                    {isLoading && messages.length === 0 ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mb-3"></div>
                                <p className="text-sm text-gray-500 font-medium">Loading messages...</p>
                            </div>
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                                <div className="inline-flex p-6 bg-blue-50 rounded-full mb-4">
                                    <ChatBubbleLeftRightIcon className="w-12 h-12 text-blue-600" />
                                </div>
                                <h3 className="text-base font-black text-gray-900 mb-1">Start a Conversation</h3>
                                <p className="text-sm text-gray-500 font-medium max-w-xs">
                                    Send us a message and we will get back to you right away!
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {messages.map((msg) => {
                                const isClient = msg.senderType === 'client';
                                const messageDate = msg.createdAt || msg.created_at;

                                return (
                                    <div key={msg.id} className={`flex ${isClient ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[75%] ${isClient ? 'order-2' : 'order-1'}`}>
                                            <div className={`rounded-2xl p-4 shadow-sm ${isClient
                                                    ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white'
                                                    : 'bg-white border-2 border-gray-100'
                                                }`}>
                                                {!isClient && (
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                                                            <span className="text-white text-xs font-black">A</span>
                                                        </div>
                                                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">
                                                            Support Team
                                                        </p>
                                                    </div>
                                                )}
                                                <p className={`text-sm leading-relaxed font-medium ${isClient ? 'text-white' : 'text-gray-900'}`}>
                                                    {msg.message}
                                                </p>
                                                <p className={`text-[10px] mt-2 ${isClient ? 'text-blue-100' : 'text-gray-400'} font-medium`}>
                                                    {messageDate && isValid(new Date(messageDate))
                                                        ? format(new Date(messageDate), 'MMM dd, HH:mm')
                                                        : 'Just now'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>
                    )}
                </div>

                {/* Input */}
                <div className="border-t border-gray-200 bg-white p-4">
                    <form onSubmit={handleSendMessage} className="flex gap-2">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type your message..."
                            className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm font-medium placeholder-gray-400 bg-gray-50"
                            disabled={sending}
                        />
                        <button
                            type="submit"
                            disabled={!newMessage.trim() || sending}
                            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-black uppercase tracking-widest text-xs hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg hover:shadow-xl"
                        >
                            {sending ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                            ) : (
                                <PaperAirplaneIcon className="w-4 h-4" />
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
};

export default SupportChatPopup;
