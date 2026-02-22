import { NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
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
    ArrowRightOnRectangleIcon,
    ChatBubbleLeftRightIcon,
    XMarkIcon,
    ShieldExclamationIcon,
    PhotoIcon
} from '@heroicons/react/24/outline';
import useAuthStore from '../../store/authStore';
import useNotificationStore from '../../store/notificationStore';
import SupportChatPopup from '../chat/SupportChatPopup';
import AdminSupportChatPopup from '../chat/AdminSupportChatPopup';
import { getAvatarUrl } from '../../utils/image';

const Sidebar = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();
    const [isChatPopupOpen, setIsChatPopupOpen] = useState(false);
    const [isAdminChatPopupOpen, setIsAdminChatPopupOpen] = useState(false);
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
                    { name: 'Active Requests', path: '/client/requests', icon: DocumentTextIcon, end: true },
                    { name: 'Request History', path: '/client/requests/history', icon: InboxIcon },
                    { name: 'Deliveries', path: '/client/deliveries', icon: CloudArrowUpIcon },
                    { name: 'Billing', path: '/client/billing', icon: CreditCardIcon },
                    { name: 'Settings', path: '/client/settings', icon: Cog6ToothIcon },
                ];

            case 'designer':
                return [
                    { name: 'Workspace', path: '/designer/workspace', icon: Squares2X2Icon },
                    { name: 'Active Tasks', path: '/designer/tasks', icon: ListBulletIcon, badge: 3 },
                    { name: 'Priority Queue', path: '/designer/priority-queue', icon: FireIcon },
                    { name: 'Submissions', path: '/designer/submissions', icon: CloudArrowUpIcon },
                    { name: 'Analytics', path: '/designer/analytics', icon: ChartBarIcon },
                    { name: 'Archives', path: '/designer/archives', icon: ArchiveBoxIcon },
                    { name: 'Settings', path: '/designer/settings', icon: Cog6ToothIcon },
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
                    { name: 'Dashboard', path: '/admin/dashboard', icon: HomeIcon, badge: unreadCount },
                    { name: 'Request Queue', path: '/admin/requests', icon: ClipboardDocumentListIcon },
                    // { name: 'Assign Designers', path: '/admin/team-mapping', icon: Squares2X2Icon },
                    { name: 'Users', path: '/admin/users', icon: UsersIcon },
                    { name: 'Plans', path: '/admin/plans', icon: CubeIcon },
                    { name: 'Analytics', path: '/admin/analytics', icon: ChartBarIcon },
                    { name: 'Testimonials', path: '/admin/testimonials', icon: StarIcon },
                    { name: 'Leads', path: '/admin/leads', icon: BriefcaseIcon },
                    { name: 'Payouts', path: '/admin/payouts', icon: CurrencyDollarIcon },
                    { name: 'Affiliates', path: '/admin/affiliates', icon: UsersIcon },
                    { name: 'Fraud Detection', path: '/admin/fraud-detection', icon: ShieldExclamationIcon },
                    { name: 'Affiliate Resources', path: '/admin/affiliate-resources', icon: PhotoIcon },
                    { name: 'Settings', path: '/admin/settings', icon: Cog6ToothIcon },
                ];

            case 'affiliate':
                return [
                    { name: 'Dashboard', path: '/affiliate/dashboard', icon: HomeIcon },
                    { name: 'Referrals', path: '/affiliate/referrals', icon: UsersIcon },
                    { name: 'Earnings', path: '/affiliate/earnings', icon: CurrencyDollarIcon },
                    { name: 'Payouts', path: '/affiliate/payouts', icon: CreditCardIcon },
                    { name: 'Resources', path: '/affiliate/resources', icon: PhotoIcon },
                    { name: 'Settings', path: '/affiliate/settings', icon: Cog6ToothIcon },
                ];

            default:
                return [];
        }
    };

    const navigationItems = getNavigationItems();

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
                    onClick={onClose}
                />
            )}

            <div className={`fixed left-4 top-4 h-[calc(100vh-2rem)] w-64 bg-white border border-gray-100 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col z-50 transition-all duration-300 transform ${isOpen ? 'translate-x-0' : '-translate-x-[calc(100%+1rem)] lg:translate-x-0'}`}>
                {/* Logo */}
                <div className="p-2 border-b border-gray-100 flex flex-col items-center">
                    <img
                        src="/assets/webasia-logo-wide.png"
                        alt="WebAsia"
                        className="h-14 w-auto mb-2"
                    />

                    {user?.role && (
                        <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest text-center">
                            {user.role} Portal
                        </p>
                    )}
                </div>


                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto py-6 px-4">
                    <div className="space-y-1.5">
                        {navigationItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                end={item.end}
                                onClick={() => onClose && onClose()} // Close sidebar on mobile nav
                                className={({ isActive }) =>
                                    `flex items-center justify-between gap-3 px-4 py-3 rounded-2xl transition-all duration-200 group ${isActive
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                    }`
                                }
                            >
                                {({ isActive }) => (
                                    <>
                                        <div className="flex items-center gap-3">
                                            <item.icon className={`w-5 h-5 transition-colors ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-blue-600'}`} />
                                            <span className={`font-bold text-sm tracking-tight ${isActive ? 'text-white' : ''}`}>{item.name}</span>
                                        </div>
                                        {item.badge && item.badge > 0 && (
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${isActive
                                                ? 'bg-white/20 text-white'
                                                : 'bg-blue-600 text-white'
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
                    <div className="p-4 border-t border-gray-50">
                        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-4 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10 group-hover:scale-110 transition-transform"></div>
                            <div className="relative z-10 space-y-3">
                                <h3 className="text-white font-black text-sm tracking-tight leading-tight">Priority Support</h3>
                                <p className="text-blue-100 text-[9px] font-medium leading-relaxed">Active 24/7 for partners.</p>
                                <button
                                    onClick={() => setIsChatPopupOpen(true)}
                                    className="w-full py-2 bg-white text-blue-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-50 transition-colors shadow-lg">
                                    Chat Now
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Support Section (Admin only) */}
                {user?.role === 'admin' && (
                    <div className="p-4 border-t border-gray-50">
                        <button
                            onClick={() => setIsAdminChatPopupOpen(true)}
                            className="w-full bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-4 relative overflow-hidden group hover:from-blue-700 hover:to-blue-800 transition-all"
                        >
                            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10 group-hover:scale-110 transition-transform"></div>
                            <div className="relative z-10 flex items-center justify-between">
                                <div className="text-left">
                                    <h3 className="text-white font-black text-sm tracking-tight leading-tight">Support Messages</h3>
                                    <p className="text-blue-100 text-[9px] font-medium leading-relaxed">View client conversations</p>
                                </div>
                                <ChatBubbleLeftRightIcon className="w-6 h-6 text-white" />
                            </div>
                        </button>
                    </div>
                )}

                {/* User Profile */}
                <div className="p-6 border-t border-gray-50">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-center text-blue-600 font-black text-lg shadow-sm overflow-hidden">
                            {getAvatarUrl(user) ? (
                                <img
                                    src={getAvatarUrl(user)}
                                    alt={user?.name || 'User'}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.nextElementSibling.style.display = 'flex';
                                    }}
                                />
                            ) : null}
                            <div className={`w-full h-full flex items-center justify-center ${getAvatarUrl(user) ? 'hidden' : ''}`}>
                                {user?.name?.charAt(0) || 'U'}
                            </div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-black truncate text-gray-900">
                                {user?.name || 'User'}
                            </p>
                            <p className="text-[10px] font-bold text-gray-400 truncate uppercase tracking-widest">{user?.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-3 py-3 border border-gray-100 rounded-2xl transition-all hover:bg-red-50 hover:border-red-100 hover:text-red-500 group text-gray-500 bg-gray-50"
                    >
                        <ArrowRightOnRectangleIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        <span className="text-xs font-black uppercase tracking-widest">Logout</span>
                    </button>
                </div>
            </div>

            {/* Support Chat Popup */}
            <SupportChatPopup
                isOpen={isChatPopupOpen}
                onClose={() => setIsChatPopupOpen(false)}
            />

            {/* Admin Support Chat Popup */}
            <AdminSupportChatPopup
                isOpen={isAdminChatPopupOpen}
                onClose={() => setIsAdminChatPopupOpen(false)}
            />
        </>
    );
};

export default Sidebar;
