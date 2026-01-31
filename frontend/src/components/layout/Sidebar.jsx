import { NavLink, useNavigate } from 'react-router-dom';
import {
    HomeIcon,
    DocumentTextIcon,
    InboxIcon,
    CreditCardIcon,
    Cog6ToothIcon,
    Squares2X2Icon,
    ListBulletIcon,
    FireIcon,
    CloudArrowUpIcon,
    ChartBarIcon,
    ArchiveBoxIcon,
    ClipboardDocumentListIcon,
    UsersIcon,
    CubeIcon,
    StarIcon,
    BriefcaseIcon,
    CurrencyDollarIcon,
    ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import useAuthStore from '../../store/authStore';
import useNotificationStore from '../../store/notificationStore';

const Sidebar = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();
    const { unreadCount } = useNotificationStore();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Navigation items based on user role
    const getNavigationItems = () => {
        switch (user?.role) {
            case 'client':
                return [
                    { name: 'Dashboard', path: '/client/dashboard', icon: HomeIcon },
                    { name: 'Requests', path: '/client/requests', icon: DocumentTextIcon },
                    { name: 'Deliveries', path: '/client/deliveries', icon: InboxIcon },
                    { name: 'Billing', path: '/client/billing', icon: CreditCardIcon },
                    { name: 'Settings', path: '/client/settings', icon: Cog6ToothIcon },
                ];

            case 'designer':
                return [
                    { name: 'Workspace', path: '/designer/workspace', icon: Squares2X2Icon },
                    { name: 'Active Tasks', path: '/designer/tasks', icon: ListBulletIcon, badge: 3 },
                    { name: 'Priority Queue', path: '/designer/priority', icon: FireIcon },
                    { name: 'Submissions', path: '/designer/submissions', icon: CloudArrowUpIcon },
                    { name: 'Analytics', path: '/designer/analytics', icon: ChartBarIcon },
                    { name: 'Archives', path: '/designer/archives', icon: ArchiveBoxIcon },
                ];

            case 'manager':
                return [
                    { name: 'Dashboard', path: '/manager/dashboard', icon: HomeIcon },
                    { name: 'Queue', path: '/manager/queue', icon: ClipboardDocumentListIcon, badge: 5 },
                    { name: 'Designers', path: '/manager/designers', icon: UsersIcon },
                    { name: 'Analytics', path: '/manager/analytics', icon: ChartBarIcon },
                    { name: 'Reports', path: '/manager/reports', icon: DocumentTextIcon },
                ];

            case 'admin':
                return [
                    { name: 'Dashboard', path: '/admin/dashboard', icon: HomeIcon },
                    { name: 'Users', path: '/admin/users', icon: UsersIcon },
                    { name: 'Plans', path: '/admin/plans', icon: CubeIcon },
                    { name: 'Analytics', path: '/admin/analytics', icon: ChartBarIcon },
                    { name: 'Testimonials', path: '/admin/testimonials', icon: StarIcon, badge: unreadCount },
                    { name: 'Leads', path: '/admin/leads', icon: BriefcaseIcon },
                    { name: 'Payouts', path: '/admin/payouts', icon: CurrencyDollarIcon },
                ];

            case 'affiliate':
                return [
                    { name: 'Dashboard', path: '/affiliate/dashboard', icon: HomeIcon },
                    { name: 'Referrals', path: '/affiliate/referrals', icon: UsersIcon },
                    { name: 'Earnings', path: '/affiliate/earnings', icon: CurrencyDollarIcon },
                    { name: 'Settings', path: '/affiliate/settings', icon: Cog6ToothIcon },
                ];

            default:
                return [];
        }
    };

    const navigationItems = getNavigationItems();
    const isDarkTheme = ['designer', 'manager', 'admin'].includes(user?.role);

    return (
        <div className={`fixed left-0 top-0 h-screen w-64 ${isDarkTheme ? 'bg-[#0A0E1A] border-r border-[#1E2638]' : 'bg-white border-r border-gray-200'} flex flex-col z-50`}>
            {/* Logo */}
            <div className="p-6 border-b border-gray-200 dark:border-[#1E2638]">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-lg">W</span>
                    </div>
                    <span className={`text-xl font-bold ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
                        WebAsia
                    </span>
                </div>
                {user?.role && (
                    <p className="text-xs text-gray-400 mt-1 capitalize">{user.role} Portal</p>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-4 px-3">
                <div className="space-y-1">
                    {navigationItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg transition-all ${isActive
                                    ? isDarkTheme
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-blue-50 text-blue-600'
                                    : isDarkTheme
                                        ? 'text-gray-400 hover:bg-[#151B2E] hover:text-white'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <div className="flex items-center gap-3">
                                        <item.icon className="w-5 h-5" />
                                        <span className="font-medium">{item.name}</span>
                                    </div>
                                    {item.badge && item.badge > 0 && (
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${isActive
                                                ? 'bg-white text-blue-600'
                                                : 'bg-blue-500 text-white'
                                            }`}>
                                            {item.badge}
                                        </span>
                                    )}
                                </>
                            )}
                        </NavLink>
                    ))}
                </div>
            </nav>

            {/* Support Section (Client only) */}
            {user?.role === 'client' && (
                <div className="p-4 border-t border-gray-200">
                    <div className="bg-blue-50 rounded-lg p-4">
                        <h3 className="text-sm font-medium text-gray-900 mb-1">SUPPORT</h3>
                        <p className="text-xs text-gray-600 mb-3">Need help with a request?</p>
                        <button className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors">
                            Contact Us
                        </button>
                    </div>
                </div>
            )}

            {/* User Profile */}
            <div className={`p-4 border-t ${isDarkTheme ? 'border-[#1E2638]' : 'border-gray-200'}`}>
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                        {user?.name?.charAt(0) || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
                            {user?.name || 'User'}
                        </p>
                        <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${isDarkTheme
                            ? 'text-gray-400 hover:bg-[#151B2E] hover:text-white'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                >
                    <ArrowRightOnRectangleIcon className="w-5 h-5" />
                    <span className="text-sm font-medium">Logout</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
