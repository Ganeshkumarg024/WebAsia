import { useState, useEffect } from 'react';
import { BellIcon, MagnifyingGlassIcon, XMarkIcon, CheckIcon, Bars3Icon } from '@heroicons/react/24/outline';
import Sidebar from './Sidebar';
import useAuthStore from '../../store/authStore';
import useNotificationStore from '../../store/notificationStore';
import { format } from 'date-fns';

const DashboardLayout = ({ children, title, breadcrumbs }) => {
    const { user } = useAuthStore();
    const { notifications, unreadCount, markAsRead, markAllAsRead, fetchUnreadCount } = useNotificationStore();
    const [showNotifications, setShowNotifications] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Only designers, managers, and admins use the dark theme. Clients use a professional light theme.
    const isDarkTheme = ['designer', 'manager', 'admin'].includes(user?.role);

    useEffect(() => {
        fetchUnreadCount();
    }, []);

    return (
        <div className={`min-h-screen ${isDarkTheme ? 'bg-[#0A0E1A]' : 'bg-[#F8FAFC]'}`}>
            <Sidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

            {/* Main Content Area */}
            <div className="lg:ml-64 transition-all duration-300">
                {/* Top Header */}
                <header className={`sticky top-0 z-40 ${isDarkTheme ? 'bg-[#0A0E1A] border-b border-[#1E2638]' : 'bg-white border-b border-gray-100 shadow-sm'}`}>
                    <div className="flex items-center justify-between px-4 lg:px-8 py-4 gap-4">
                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className={`lg:hidden p-2 -ml-2 rounded-lg ${isDarkTheme ? 'text-white hover:bg-[#151B2E]' : 'text-gray-600 hover:bg-gray-100'}`}
                        >
                            <Bars3Icon className="w-6 h-6" />
                        </button>

                        {/* Search Bar (for some roles) */}
                        {['designer', 'manager', 'admin'].includes(user?.role) && (
                            <div className="flex-1 max-w-md hidden md:block">
                                <div className="relative">
                                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search tasks, clients, or designers..."
                                        className={`w-full pl-10 pr-4 py-2 rounded-lg border ${isDarkTheme
                                            ? 'bg-[#151B2E] border-gray-700 text-white placeholder-gray-400'
                                            : 'bg-gray-50 border-gray-100 text-gray-900 placeholder-gray-500'
                                            } focus:outline-none focus:border-blue-500 transition-all`}
                                    />
                                </div>
                            </div>
                        )}


                        {/* Breadcrumbs */}
                        {breadcrumbs && (
                            <div className="hidden md:flex items-center gap-2 text-sm">
                                {breadcrumbs.map((crumb, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                        {index > 0 && <span className="text-gray-400">/</span>}
                                        <span className={index === breadcrumbs.length - 1 ? (isDarkTheme ? 'text-white' : 'text-gray-900') : 'text-gray-400'}>
                                            {crumb}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Right Side Actions */}
                        <div className="flex items-center gap-2 lg:gap-4 relative ml-auto">
                            {/* Notifications */}
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className={`relative p-2 rounded-lg transition-colors ${isDarkTheme ? 'text-gray-400 hover:text-white hover:bg-[#151B2E]' : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50'}`}
                                aria-label="Notifications"
                            >
                                <BellIcon className="w-6 h-6" />
                                {unreadCount > 0 && (
                                    <div className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-600 rounded-full flex items-center justify-center text-[10px] font-black text-white ring-2 ring-white dark:ring-[#0A0E1A]">
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </div>
                                )}
                            </button>

                            {/* Notifications Dropdown */}
                            {showNotifications && (
                                <div className={`absolute right-0 top-12 w-80 max-h-[480px] overflow-hidden rounded-2xl border shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-200 ${isDarkTheme ? 'bg-[#0F172A] border-[#1E2638] shadow-black/50' : 'bg-white border-gray-100 shadow-gray-200/50'}`}>
                                    <div className={`p-4 border-b flex items-center justify-between ${isDarkTheme ? 'border-[#1E2638]' : 'border-gray-50'}`}>
                                        <h3 className={`text-xs font-black uppercase tracking-widest ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>Signals</h3>
                                        <div className="flex gap-2">
                                            {unreadCount > 0 && (
                                                <button onClick={markAllAsRead} className="text-[10px] font-black text-blue-600 hover:underline uppercase tracking-widest">Mark all as read</button>
                                            )}
                                            <button onClick={() => setShowNotifications(false)}><XMarkIcon className="w-4 h-4 text-gray-400" /></button>
                                        </div>
                                    </div>
                                    <div className="overflow-y-auto max-h-[400px] custom-scrollbar">
                                        {notifications.length > 0 ? (
                                            notifications.map((n) => (
                                                <div
                                                    key={n.id}
                                                    onClick={() => !n.read && markAsRead(n.id)}
                                                    className={`p-4 border-b last:border-0 transition-colors cursor-pointer ${isDarkTheme ? 'border-[#1E2638] hover:bg-[#151B2E]' : 'border-gray-50 hover:bg-gray-50'} ${!n.read ? (isDarkTheme ? 'bg-blue-600/5' : 'bg-blue-50/30') : ''}`}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${!n.read ? 'bg-blue-600' : 'bg-transparent'}`}></div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className={`text-xs font-bold mb-1 truncate ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>{n.title}</p>
                                                            <p className="text-[11px] text-gray-500 leading-relaxed mb-2 line-clamp-2">{n.message}</p>
                                                            <p className="text-[9px] text-gray-400 uppercase tracking-widest">{format(new Date(n.createdAt), 'MMM dd, HH:mm')}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-8 text-center">
                                                <p className="text-xs text-gray-400 font-bold italic uppercase tracking-widest">No signals received</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* User Avatar */}
                            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium cursor-pointer">
                                {user?.name?.charAt(0) || 'U'}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-4 lg:p-6">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
