import { BellIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import Sidebar from './Sidebar';
import useAuthStore from '../../store/authStore';
import useNotificationStore from '../../store/notificationStore';

const DashboardLayout = ({ children, title, breadcrumbs }) => {
    const { user } = useAuthStore();
    const { unreadCount } = useNotificationStore();
    // Only designers, managers, and admins use the dark theme. Clients use a professional light theme.
    const isDarkTheme = ['designer', 'manager', 'admin'].includes(user?.role);

    return (
        <div className={`min-h-screen ${isDarkTheme ? 'bg-[#0A0E1A]' : 'bg-[#F8FAFC]'}`}>
            <Sidebar />

            {/* Main Content Area */}
            <div className="ml-64">
                {/* Top Header */}
                <header className={`sticky top-0 z-40 ${isDarkTheme ? 'bg-[#0A0E1A] border-b border-[#1E2638]' : 'bg-white border-b border-gray-100 shadow-sm'}`}>
                    <div className="flex items-center justify-between px-8 py-4">
                        {/* Search Bar (for some roles) */}
                        {['designer', 'manager', 'admin'].includes(user?.role) && (
                            <div className="flex-1 max-w-md">
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
                            <div className="flex items-center gap-2 text-sm">
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
                        <div className="flex items-center gap-4">
                            {/* Notifications */}
                            <button
                                className="relative p-2 rounded-lg text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                aria-label="Notifications"
                            >
                                <BellIcon className="w-6 h-6" />
                                {unreadCount > 0 && (
                                    <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center text-xs text-white">
                                        {unreadCount}
                                    </div>
                                )}
                            </button>

                            {/* User Avatar */}
                            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium cursor-pointer">
                                {user?.name?.charAt(0) || 'U'}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-6">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
