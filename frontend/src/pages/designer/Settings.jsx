import { useState, useRef } from 'react';
import { CameraIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import DashboardLayout from '../../components/layout/DashboardLayout';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';
import { getAvatarUrl } from '../../utils/image';

const Settings = () => {
    const { user, uploadAvatar, updateProfile, isLoading } = useAuthStore();
    const fileInputRef = useRef(null);
    const [formData, setFormData] = useState({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        phone: user?.phone || '',
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePhotoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validation
        if (file.size > 5 * 1024 * 1024) {
            toast.error('File size must be less than 5MB');
            return;
        }

        const formData = new FormData();
        formData.append('avatar', file);

        const result = await uploadAvatar(formData);
        if (result.success) {
            toast.success('Profile picture updated successfully');
        } else {
            toast.error(result.error || 'Failed to update profile picture');
        }
    };

    const handleSaveProfile = async () => {
        const result = await updateProfile({
            firstName: formData.firstName,
            lastName: formData.lastName,
            phone: formData.phone,
        });

        if (result.success) {
            toast.success('Profile updated successfully');
        } else {
            toast.error(result.error || 'Failed to update profile');
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    return (
        <DashboardLayout breadcrumbs={['Designer', 'Settings']}>
            <div className="max-w-4xl mx-auto w-full space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
                {/* Header */}
                <div className="space-y-2">
                    <h1 className="text-5xl font-black text-gray-900 tracking-tight leading-tight">
                        Creative <span className="text-blue-600">Settings</span>
                    </h1>
                    <p className="text-gray-500 font-medium text-lg">Manage your identity and professional presence on WebAsia.</p>
                </div>

                <div className="bg-white border border-gray-100 rounded-[40px] overflow-hidden shadow-[0_20px_60px_rgb(0,0,0,0.03)] relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/30 rounded-full -mr-32 -mt-32 blur-3xl"></div>

                    <div className="p-10 relative z-10 space-y-12">
                        {/* Avatar Section */}
                        <div className="flex flex-col md:flex-row items-center gap-8 border-b border-gray-50 pb-12">
                            <div className="relative group cursor-pointer" onClick={triggerFileInput}>
                                <div className="w-40 h-40 rounded-[48px] bg-gray-50 border-4 border-white shadow-2xl flex items-center justify-center overflow-hidden transition-transform group-hover:scale-[1.02] duration-500">
                                    {getAvatarUrl(user) ? (
                                        <img src={getAvatarUrl(user)} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-4xl font-black text-blue-600">{(user?.firstName || 'D').charAt(0)}</span>
                                    )}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <CameraIcon className="w-10 h-10 text-white" />
                                    </div>
                                </div>
                                <button className="absolute -bottom-2 -right-2 p-3 bg-blue-600 text-white rounded-2xl shadow-xl hover:bg-blue-700 transition-all hover:rotate-12">
                                    <CameraIcon className="w-4 h-4" />
                                </button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handlePhotoUpload}
                                />
                            </div>
                            <div className="text-center md:text-left space-y-2">
                                <h3 className="text-2xl font-black text-gray-900 tracking-tight">Professional Avatar</h3>
                                <p className="text-gray-500 text-sm font-medium max-w-xs">This photo will be visible to clients and team members.</p>
                                <div className="flex justify-center md:justify-start gap-4 pt-2">
                                    <button onClick={triggerFileInput} className="px-4 py-2 bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-100 transition-colors">Replace Photo</button>
                                </div>
                            </div>
                        </div>

                        {/* Form Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">First Name</label>
                                <input
                                    type="text"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleInputChange}
                                    placeholder="Enter first name"
                                    className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl py-4 px-6 text-gray-900 font-bold focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 transition-all outline-none"
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Last Name</label>
                                <input
                                    type="text"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleInputChange}
                                    placeholder="Enter last name"
                                    className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl py-4 px-6 text-gray-900 font-bold focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 transition-all outline-none"
                                />
                            </div>
                            <div className="md:col-span-2 space-y-3">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Mobile Number (Optional)</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    placeholder="+1 (555) 000-0000"
                                    className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl py-4 px-6 text-gray-900 font-bold focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 transition-all outline-none"
                                />
                            </div>
                            <div className="md:col-span-2 space-y-3">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Email Registry</label>
                                <input
                                    type="email"
                                    value={user?.email}
                                    className="w-full bg-gray-50/30 border border-gray-100 rounded-2xl py-4 px-6 text-gray-400 font-bold cursor-not-allowed italic"
                                    disabled
                                />
                                <p className="text-[9px] text-gray-400 uppercase tracking-widest px-1">Contact admin for email or role modifications.</p>
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="px-10 py-8 bg-gray-50/50 border-t border-gray-50 flex justify-end">
                        <button
                            onClick={handleSaveProfile}
                            disabled={isLoading}
                            className="px-12 py-4 bg-blue-600 text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-blue-700 transition-all shadow-2xl shadow-blue-600/20 hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Preserving Changes...' : 'Save Profile'}
                        </button>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Settings;
