import { useState } from 'react';
import { UserIcon, ShieldCheckIcon, BellIcon, CameraIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import DashboardLayout from '../../components/layout/DashboardLayout';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

const Settings = () => {
    const { user, updateProfile, changePassword, isLoading } = useAuthStore();
    const [activeSection, setActiveSection] = useState('Profile');
    const [formData, setFormData] = useState({
        firstName: user?.name?.split(' ')[0] || '',
        lastName: user?.name?.split(' ')[1] || '',
        email: user?.email || '',
        bio: user?.bio || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        notifSystem: true,
        notifEmail: true,
        notifMobile: false
    });

    const sections = [
        { id: 'Profile', icon: UserIcon },
        { id: 'Security', icon: ShieldCheckIcon },
        { id: 'Notifications', icon: BellIcon },
    ];

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleCommitState = async () => {
        if (activeSection === 'Security') {
            if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
                toast.error('Please fill in all password fields');
                return;
            }
            if (formData.newPassword !== formData.confirmPassword) {
                toast.error('New passwords do not match');
                return;
            }

            const result = await changePassword({
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword
            });

            if (result.success) {
                toast.success('Password updated successfully');
                setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
            } else {
                toast.error(result.error || 'Failed to update password');
            }
        } else {
            const result = await updateProfile({
                firstName: formData.firstName,
                lastName: formData.lastName,
                bio: formData.bio,
            });

            if (result.success) {
                toast.success('Profile updated successfully');
            } else {
                toast.error(result.error || 'Failed to update profile');
            }
        }
    };

    return (
        <DashboardLayout breadcrumbs={['Admin', 'Settings']}>
            <div className="max-w-5xl mx-auto w-full space-y-8">
                {/* Header */}
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Admin <span className="text-blue-600">Settings</span>
                    </h1>
                    <p className="text-gray-500">Manage your profile and security preferences.</p>
                </div>

                <div className="flex flex-col md:flex-row gap-8">
                    {/* Sidebar */}
                    <aside className="w-full md:w-64 shrink-0">
                        <nav className="flex flex-row md:flex-col gap-2">
                            {sections.map(section => (
                                <button
                                    key={section.id}
                                    onClick={() => setActiveSection(section.id)}
                                    className={`flex-1 md:flex-none flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeSection === section.id
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                                        : 'bg-white text-gray-500 hover:text-gray-900 hover:bg-gray-50 border border-gray-100'
                                        }`}
                                >
                                    <section.icon className="w-5 h-5" />
                                    {section.id}
                                </button>
                            ))}
                        </nav>
                    </aside>

                    {/* Content Area */}
                    <div className="flex-1 bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm relative">
                        <div className="p-8">
                            {activeSection === 'Profile' && (
                                <div className="space-y-8">
                                    <div className="flex items-center gap-6">
                                        <div className="relative group">
                                            <div className="w-24 h-24 rounded-full bg-gray-50 border-4 border-white shadow-sm flex items-center justify-center overflow-hidden">
                                                {user?.avatar ? (
                                                    <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-3xl font-bold text-blue-600">{user?.name?.charAt(0) || 'A'}</span>
                                                )}
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900 mb-1">Admin Profile</h3>
                                            <p className="text-sm text-gray-500">Update your personal information.</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">First Name</label>
                                            <input
                                                type="text"
                                                name="firstName"
                                                value={formData.firstName}
                                                onChange={handleInputChange}
                                                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-gray-900 font-medium focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Last Name</label>
                                            <input
                                                type="text"
                                                name="lastName"
                                                value={formData.lastName}
                                                onChange={handleInputChange}
                                                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-gray-900 font-medium focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                                            />
                                        </div>
                                        <div className="md:col-span-2 space-y-2">
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Email Address</label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                disabled
                                                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-gray-400 font-medium cursor-not-allowed"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeSection === 'Security' && (
                                <div className="space-y-8">
                                    <div className="bg-blue-50 rounded-2xl p-6 flex items-start gap-4 border border-blue-100">
                                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                                            <LockClosedIcon className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <h4 className="text-blue-900 font-bold mb-1">Password Security</h4>
                                            <p className="text-blue-700 text-sm">Ensure your account uses a strong, unique password.</p>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Current Password</label>
                                            <input
                                                type="password"
                                                name="currentPassword"
                                                value={formData.currentPassword}
                                                onChange={handleInputChange}
                                                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-gray-900 font-medium focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">New Password</label>
                                                <input
                                                    type="password"
                                                    name="newPassword"
                                                    value={formData.newPassword}
                                                    onChange={handleInputChange}
                                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-gray-900 font-medium focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Confirm Password</label>
                                                <input
                                                    type="password"
                                                    name="confirmPassword"
                                                    value={formData.confirmPassword}
                                                    onChange={handleInputChange}
                                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-gray-900 font-medium focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeSection === 'Notifications' && (
                                <div className="space-y-8">
                                    <div className="space-y-4">
                                        {[
                                            { id: 'notifSystem', label: 'System Notifications', desc: 'Receive important updates about platform activity' },
                                            { id: 'notifEmail', label: 'Email Alerts', desc: 'Get daily summaries sent to your inbox' }
                                        ].map(item => (
                                            <label key={item.id} className="flex items-start justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 cursor-pointer hover:border-blue-500/30 hover:bg-white transition-all">
                                                <div>
                                                    <p className="font-bold text-gray-900 mb-1">{item.label}</p>
                                                    <p className="text-sm text-gray-500">{item.desc}</p>
                                                </div>
                                                <div className="relative inline-flex items-center cursor-pointer mt-1">
                                                    <input
                                                        type="checkbox"
                                                        name={item.id}
                                                        checked={formData[item.id]}
                                                        onChange={handleInputChange}
                                                        className="sr-only peer"
                                                    />
                                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="px-8 py-6 bg-gray-50 border-t border-gray-100 flex justify-end">
                            <button
                                onClick={handleCommitState}
                                disabled={isLoading}
                                className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                            >
                                {isLoading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Settings;
