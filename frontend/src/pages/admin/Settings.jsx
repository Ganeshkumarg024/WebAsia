import { useState, useRef } from 'react';
import { UserIcon, ShieldCheckIcon, BellIcon, CameraIcon } from '@heroicons/react/24/outline';
import DashboardLayout from '../../components/layout/DashboardLayout';
import FileUpload from '../../components/shared/FileUpload';
import useAuthStore from '../../store/authStore';
import showToast from '../../components/shared/Toast';
import { getAvatarUrl } from '../../utils/image';

const Settings = () => {
    const { user, updateProfile, changePassword, uploadAvatar, isLoading } = useAuthStore();
    const fileInputRef = useRef(null);
    const [activeSection, setActiveSection] = useState('Profile');
    const [formData, setFormData] = useState({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        phone: user?.phone || '',
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

    const handleAvatarUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validation
        if (file.size > 2 * 1024 * 1024) {
            showToast.error('File size must be less than 2MB');
            return;
        }

        const formData = new FormData();
        formData.append('avatar', file);

        const result = await uploadAvatar(formData);
        if (result.success) {
            showToast.success('Avatar updated successfully');
        } else {
            showToast.error(result.error || 'Failed to upload avatar');
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    const handleSaveProfile = async () => {
        const result = await updateProfile({
            firstName: formData.firstName,
            lastName: formData.lastName,
            phone: formData.phone,
            bio: formData.bio,
        });

        if (result.success) {
            showToast.success('Profile updated successfully');
        } else {
            showToast.error(result.error || 'Failed to update profile');
        }
    };

    const handleChangePassword = async () => {
        if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
            showToast.error('Please fill in all password fields');
            return;
        }
        if (formData.newPassword !== formData.confirmPassword) {
            showToast.error('New passwords do not match');
            return;
        }

        const result = await changePassword({
            currentPassword: formData.currentPassword,
            newPassword: formData.newPassword
        });

        if (result.success) {
            showToast.success('Password updated successfully');
            setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
        } else {
            showToast.error(result.error || 'Failed to update password');
        }
    };

    const handleSaveNotifications = () => {
        showToast.success('Notification preferences saved');
    };

    return (
        <DashboardLayout breadcrumbs={['Admin', 'Settings']}>
            <div className="max-w-5xl mx-auto w-full space-y-8">
                {/* Header */}
                <div className="space-y-2">
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                        Admin <span className="text-blue-600">Settings</span>
                    </h1>
                    <p className="text-gray-500 font-medium">Manage your profile and security preferences.</p>
                </div>

                <div className="flex flex-col md:flex-row gap-8">
                    {/* Sidebar */}
                    <aside className="w-full md:w-64 shrink-0">
                        <nav className="flex flex-row md:flex-col gap-2">
                            {sections.map(section => (
                                <button
                                    key={section.id}
                                    onClick={() => setActiveSection(section.id)}
                                    className={`flex-1 md:flex-none flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-black uppercase tracking-wider transition-all ${activeSection === section.id
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

                    {/* Main Content */}
                    <div className="flex-1">
                        <div className="bg-white rounded-[32px] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden">
                            {/* Profile Section */}
                            {activeSection === 'Profile' && (
                                <div className="p-8 space-y-8">
                                    <div>
                                        <h2 className="text-xl font-black text-gray-900 mb-1">Profile Information</h2>
                                        <p className="text-sm text-gray-500 font-medium">Update your account profile information and avatar.</p>
                                    </div>

                                    {/* Avatar Upload */}
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-4">Profile Picture</label>
                                        <div className="flex items-center gap-6">
                                            <div className="relative group">
                                                <div className="w-24 h-24 rounded-2xl bg-gray-100 border-2 border-white shadow-xl flex items-center justify-center text-gray-500 font-black text-3xl overflow-hidden shrink-0 transition-transform group-hover:scale-[1.02]">
                                                    {getAvatarUrl(user) ? (
                                                        <img src={getAvatarUrl(user)} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        user?.firstName?.charAt(0) || user?.name?.charAt(0) || 'A'
                                                    )}
                                                </div>
                                                <button
                                                    onClick={triggerFileInput}
                                                    className="absolute -bottom-2 -right-2 p-2 bg-blue-600 text-white rounded-xl shadow-lg hover:bg-blue-700 transition-all hover:rotate-12"
                                                >
                                                    <CameraIcon className="w-4 h-4" />
                                                </button>
                                                <input
                                                    type="file"
                                                    ref={fileInputRef}
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={handleAvatarUpload}
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-sm font-black text-gray-900 mb-1">Upload New Avatar</h3>
                                                <p className="text-xs text-gray-400">JPG, PNG or GIF. Max size 2MB.</p>
                                                <div className="flex gap-3 mt-3">
                                                    <button onClick={triggerFileInput} className="px-4 py-2 bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-100 transition-colors">Replace</button>
                                                    <button className="px-4 py-2 text-red-500 text-[10px] font-black uppercase tracking-widest hover:underline transition-colors">Wipe Data</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">First Name</label>
                                            <input
                                                type="text"
                                                name="firstName"
                                                value={formData.firstName}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Last Name</label>
                                            <input
                                                type="text"
                                                name="lastName"
                                                value={formData.lastName}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Phone Number (Optional)</label>
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                                placeholder="+1 (555) 000-0000"
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Email Address</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            disabled
                                            className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 font-medium cursor-not-allowed"
                                        />
                                        <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Bio</label>
                                        <textarea
                                            name="bio"
                                            value={formData.bio}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all resize-none"
                                            rows={4}
                                            placeholder="Tell us about yourself..."
                                        />
                                    </div>

                                    <div className="flex justify-end pt-4">
                                        <button
                                            onClick={handleSaveProfile}
                                            disabled={isLoading}
                                            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-black uppercase tracking-widest shadow-lg shadow-blue-600/20 transition-all disabled:opacity-50"
                                        >
                                            {isLoading ? 'Saving...' : 'Save Changes'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Security Section */}
                            {activeSection === 'Security' && (
                                <div className="p-8 space-y-8">
                                    <div>
                                        <h2 className="text-xl font-black text-gray-900 mb-1">Security Settings</h2>
                                        <p className="text-sm text-gray-500 font-medium">Update your password and security preferences.</p>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Current Password</label>
                                        <input
                                            type="password"
                                            name="currentPassword"
                                            value={formData.currentPassword}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                                            placeholder="••••••••"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">New Password</label>
                                            <input
                                                type="password"
                                                name="newPassword"
                                                value={formData.newPassword}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Confirm New Password</label>
                                            <input
                                                type="password"
                                                name="confirmPassword"
                                                value={formData.confirmPassword}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                    </div>

                                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                                        <p className="text-xs text-blue-700 font-bold">Password Requirements:</p>
                                        <ul className="text-xs text-blue-600 mt-2 space-y-1 ml-4 list-disc">
                                            <li>At least 8 characters long</li>
                                            <li>Contains uppercase and lowercase letters</li>
                                            <li>Contains at least one number</li>
                                        </ul>
                                    </div>

                                    <div className="flex justify-end pt-4">
                                        <button
                                            onClick={handleChangePassword}
                                            disabled={isLoading}
                                            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-black uppercase tracking-widest shadow-lg shadow-blue-600/20 transition-all disabled:opacity-50"
                                        >
                                            {isLoading ? 'Updating...' : 'Update Password'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Notifications Section */}
                            {activeSection === 'Notifications' && (
                                <div className="p-8 space-y-8">
                                    <div>
                                        <h2 className="text-xl font-black text-gray-900 mb-1">Notification Preferences</h2>
                                        <p className="text-sm text-gray-500 font-medium">Manage how you receive notifications.</p>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                                            <div>
                                                <p className="text-sm font-bold text-gray-900">System Notifications</p>
                                                <p className="text-xs text-gray-500 mt-0.5">Receive in-app notifications for important updates</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    name="notifSystem"
                                                    checked={formData.notifSystem}
                                                    onChange={handleInputChange}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                            </label>
                                        </div>

                                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                                            <div>
                                                <p className="text-sm font-bold text-gray-900">Email Notifications</p>
                                                <p className="text-xs text-gray-500 mt-0.5">Receive email updates for requests and messages</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    name="notifEmail"
                                                    checked={formData.notifEmail}
                                                    onChange={handleInputChange}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                            </label>
                                        </div>

                                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                                            <div>
                                                <p className="text-sm font-bold text-gray-900">Mobile Push Notifications</p>
                                                <p className="text-xs text-gray-500 mt-0.5">Get push notifications on your mobile device</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    name="notifMobile"
                                                    checked={formData.notifMobile}
                                                    onChange={handleInputChange}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                            </label>
                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-4">
                                        <button
                                            onClick={handleSaveNotifications}
                                            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-black uppercase tracking-widest shadow-lg shadow-blue-600/20 transition-all"
                                        >
                                            Save Preferences
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Settings;
