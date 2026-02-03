import { useRef } from 'react';
import { CameraIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import DashboardLayout from '../../components/layout/DashboardLayout';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

const Settings = () => {
    const { user, uploadAvatar, isLoading } = useAuthStore();
    const fileInputRef = useRef(null);

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

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    return (
        <DashboardLayout breadcrumbs={['Designer', 'Settings']}>
            <div className="max-w-3xl mx-auto w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Header */}
                <div className="text-center space-y-2 mb-12">
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">
                        Profile <span className="text-blue-600">Photo</span>
                    </h1>
                    <p className="text-gray-500 font-medium">Update your professional avatar visible to clients.</p>
                </div>

                <div className="bg-white border border-gray-100 rounded-[40px] overflow-hidden shadow-[0_20px_60px_rgb(0,0,0,0.03)] relative p-12">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/30 rounded-full -mr-32 -mt-32 blur-3xl"></div>

                    <div className="flex flex-col items-center justify-center relative z-10">
                        {/* Avatar Circle */}
                        <div className="relative group cursor-pointer" onClick={triggerFileInput}>
                            <div className="w-48 h-48 rounded-full bg-gray-50 border-4 border-white shadow-2xl flex items-center justify-center overflow-hidden transition-transform group-hover:scale-[1.02] duration-500">
                                {user?.photoUrl || user?.avatar ? (
                                    <img src={user.photoUrl || user.avatar} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <UserCircleIcon className="w-32 h-32 text-gray-300" />
                                )}

                                {/* Overlay on Hover */}
                                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <CameraIcon className="w-12 h-12 text-white" />
                                </div>
                            </div>

                            {/* Floating Button */}
                            <button
                                className="absolute bottom-2 right-2 p-4 bg-blue-600 text-white rounded-2xl shadow-xl hover:bg-blue-700 transition-all hover:rotate-12 group-hover:scale-110"
                            >
                                <CameraIcon className="w-6 h-6" />
                            </button>
                        </div>

                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handlePhotoUpload}
                        />

                        {/* User Info (Read Only) */}
                        <div className="mt-8 text-center space-y-1">
                            <h2 className="text-2xl font-black text-gray-900">
                                {user?.firstName} {user?.lastName}
                            </h2>
                            <p className="text-sm font-bold text-blue-600 tracking-widest uppercase">
                                {user?.role}
                            </p>
                            <p className="text-gray-400 font-medium">
                                {user?.email}
                            </p>
                        </div>

                        {/* Instructions */}
                        <div className="mt-12 bg-blue-50 rounded-2xl p-6 max-w-md text-center">
                            <p className="text-xs text-blue-800 font-medium leading-relaxed">
                                To update your name, email, or password, please contact your System Administrator.
                                Designers are only permitted to manage their display avatar.
                            </p>
                        </div>

                        {isLoading && (
                            <div className="mt-4 flex items-center gap-2 text-sm font-bold text-gray-500 animate-pulse">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                Uploading new avatar...
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Settings;
