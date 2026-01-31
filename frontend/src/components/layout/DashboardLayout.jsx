import { BellIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import Sidebar from './Sidebar';
import useAuthStore from '../../store/authStore';
import useNotificationStore from '../../store/notificationStore';

const DashboardLayout = ({ children, title, breadcrumbs }) => {
    const { user } = useAuthStore();
    const { unreadCount } = useNotificationStore();
    const isDarkTheme = ['designer', 'manager', 'admin'].includes(user?.role);

    return (
        <div className={`min-h-screen ${isDarkTheme ? 'bg-[#0A0E1A]' : 'bg-gray-50'}`}>
            <Sidebar />

            {/* Main Content Area */}
            <div className="ml-64">
                {/* Top Header */}
                <header className={`sticky top-0 z-40 ${isDarkTheme ? 'bg-[#0A0E1A] border-b border-[#1E2638]' : 'bg-white border-b border-gray-200'}`}>
                    <div className="flex items-center justify-between px-6 py-4">
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
                                                : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500'
                                            } focus:outline-none focus:border-blue-500`}
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
                            <button className="relative p-2 hover:bg-gray-100 dark:hover:bg-[#151B2E] rounded-lg transition-colors">
                                <BellIcon className={`w-6 h-6 ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`} />
                                {unreadCount > 0 && (
                                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
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
