import { useState, useRef } from 'react';
import { UserIcon, ShieldCheckIcon, BellIcon, CameraIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import DashboardLayout from '../../components/layout/DashboardLayout';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';
import { getAvatarUrl } from '../../utils/image';

const Settings = () => {
    const { user, updateProfile, uploadAvatar, changePassword, isLoading } = useAuthStore();
    const fileInputRef = useRef(null);
    const [activeSection, setActiveSection] = useState('Profile');
    const [formData, setFormData] = useState({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
        phone: user?.phone || '',
        bio: 'Tech enthusiast and creative director exploring new horizons in digital design.',
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
            // Profile & Notifications (Assume merged for now or just Profile)
            const result = await updateProfile({
                firstName: formData.firstName,
                lastName: formData.lastName,
                phone: formData.phone,
                bio: formData.bio,
                // Add notification prefs if backend supports them
            });

            if (result.success) {
                toast.success('Profile updated successfully');
            } else {
                toast.error(result.error || 'Failed to update profile');
            }
        }
    };

    return (
        <DashboardLayout breadcrumbs={['Dashboard', 'Settings']}>
            <div className="max-w-5xl mx-auto w-full space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Header */}
                <div className="space-y-2">
                    <h1 className="text-5xl font-black text-gray-900 tracking-tight leading-tight">
                        Account <span className="text-blue-600">Settings</span>
                    </h1>
                    <p className="text-gray-500 font-medium text-lg">Personalize your experience and safeguard your creative workflow.</p>
                </div>

                <div className="flex flex-col md:flex-row gap-12">
                    {/* sidebar */}
                    <aside className="w-full md:w-64 shrink-0">
                        <nav className="flex flex-row md:flex-col gap-3">
                            {sections.map(section => (
                                <button
                                    key={section.id}
                                    onClick={() => setActiveSection(section.id)}
                                    className={`flex-1 md:flex-none flex items-center gap-4 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeSection === section.id
                                        ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20'
                                        : 'bg-white text-gray-500 hover:text-gray-900 hover:bg-gray-50 border border-gray-100 shadow-[0_4px_12px_rgba(0,0,0,0.02)]'
                                        }`}
                                >
                                    <section.icon className="w-5 h-5" />
                                    {section.id}
                                </button>
                            ))}
                        </nav>
                    </aside>

                    {/* Content area */}
                    <div className="flex-1 bg-white border border-gray-100 rounded-[40px] overflow-hidden shadow-[0_20px_60px_rgb(0,0,0,0.03)] relative">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/30 rounded-full -mr-32 -mt-32 blur-3xl"></div>

                        <div className="p-10 relative z-10">
                            {activeSection === 'Profile' && (
                                <div className="space-y-10">
                                    <div className="flex items-center gap-8">
                                        <div className="relative group">
                                            <div className="w-28 h-28 rounded-[36px] bg-gray-50 border-4 border-white shadow-xl flex items-center justify-center overflow-hidden transition-transform group-hover:scale-[1.02] duration-500">
                                                {getAvatarUrl(user) ? (
                                                    <img src={getAvatarUrl(user)} alt="Profile" className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-3xl font-black text-blue-600">{(user?.firstName || user?.name || 'U').charAt(0)}</span>
                                                )}
                                            </div>
                                            <button
                                                onClick={triggerFileInput}
                                                className="absolute -bottom-2 -right-2 p-3 bg-blue-600 text-white rounded-2xl shadow-xl hover:bg-blue-700 transition-all hover:rotate-12"
                                            >
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
                                        <div>
                                            <h3 className="text-xl font-black text-gray-900 tracking-tight mb-1">Identity Snapshot</h3>
                                            <p className="text-xs text-gray-500 font-medium mb-4 leading-relaxed">Identity verification is active for high-volume accounts.</p>
                                            <div className="flex gap-4">
                                                <button onClick={triggerFileInput} className="px-4 py-2 bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-100 transition-colors">Replace Asset</button>
                                                <button className="px-4 py-2 text-red-500 text-[10px] font-black uppercase tracking-widest hover:underline transition-colors">Wipe Data</button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Forename</label>
                                            <input
                                                type="text"
                                                name="firstName"
                                                value={formData.firstName}
                                                onChange={handleInputChange}
                                                className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl py-4 px-6 text-gray-900 font-black focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 transition-all outline-none"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Surname</label>
                                            <input
                                                type="text"
                                                name="lastName"
                                                value={formData.lastName}
                                                onChange={handleInputChange}
                                                className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl py-4 px-6 text-gray-900 font-black focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 transition-all outline-none"
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
                                                className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl py-4 px-6 text-gray-900 font-black focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 transition-all outline-none"
                                            />
                                        </div>
                                        <div className="md:col-span-2 space-y-3">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Primary Email Registry</label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                className="w-full bg-gray-50/30 border border-gray-100 rounded-2xl py-4 px-6 text-gray-400 font-bold cursor-not-allowed italic"
                                                disabled
                                            />
                                        </div>
                                        <div className="md:col-span-2 space-y-3">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Creative Philosophy (Bio)</label>
                                            <textarea
                                                name="bio"
                                                value={formData.bio}
                                                onChange={handleInputChange}
                                                rows="4"
                                                className="w-full bg-gray-50/50 border border-gray-100 rounded-[32px] py-4 px-6 text-gray-700 font-medium focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 transition-all outline-none resize-none leading-relaxed"
                                            ></textarea>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeSection === 'Security' && (
                                <div className="space-y-10">
                                    <div className="bg-blue-600 rounded-3xl p-8 flex items-start gap-6 relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform"></div>
                                        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center shrink-0">
                                            <LockClosedIcon className="w-6 h-6 text-white" />
                                        </div>
                                        <div className="relative z-10">
                                            <h4 className="text-white font-black text-lg tracking-tight mb-1">Fortify Your Account</h4>
                                            <p className="text-blue-100 text-xs font-medium leading-relaxed">Use a minimum of 14 characters including geometric symbols for maximum cryptographic strength.</p>
                                        </div>
                                    </div>

                                    <div className="space-y-8">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Authentic Key (Current Password)</label>
                                            <input
                                                type="password"
                                                name="currentPassword"
                                                value={formData.currentPassword}
                                                onChange={handleInputChange}
                                                className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl py-4 px-6 text-gray-900 font-black focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 transition-all outline-none"
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Proposed Key</label>
                                                <input
                                                    type="password"
                                                    name="newPassword"
                                                    value={formData.newPassword}
                                                    onChange={handleInputChange}
                                                    className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl py-4 px-6 text-gray-900 font-black focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 transition-all outline-none"
                                                />
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Verification Key</label>
                                                <input
                                                    type="password"
                                                    name="confirmPassword"
                                                    value={formData.confirmPassword}
                                                    onChange={handleInputChange}
                                                    className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl py-4 px-6 text-gray-900 font-black focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 transition-all outline-none"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-10 border-t border-gray-50">
                                        <div className="flex items-center justify-between p-8 bg-gray-50/50 rounded-[32px] border border-gray-100">
                                            <div>
                                                <h4 className="text-gray-900 font-black text-lg tracking-tight mb-1">Dual-Factor Logic</h4>
                                                <p className="text-xs text-gray-500 font-medium">Add a secondary biometric or app-based challenge to every login.</p>
                                            </div>
                                            <button className="px-6 py-3 bg-white text-gray-900 border border-gray-200 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-gray-50 transition-all shadow-sm">
                                                Enable Guard
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeSection === 'Notifications' && (
                                <div className="space-y-10">
                                    <div className="space-y-8">
                                        <h4 className="text-xl font-black text-gray-900 tracking-tight leading-none px-1">Alert Matrix</h4>
                                        <div className="space-y-4">
                                            {[
                                                { id: 'notifSystem', label: 'Neural Alerts', desc: 'Direct intra-platform signals for immediate project updates' },
                                                { id: 'notifEmail', label: 'External Registry', desc: 'Asynchronous updates delivered via SMTP for archival tracking' },
                                                { id: 'notifMobile', label: 'Kinetic Push', desc: 'Ubiquitous mobile alerts for time-critical creative decisions' }
                                            ].map(item => (
                                                <label key={item.id} className="flex items-start justify-between p-6 bg-gray-50/30 rounded-[32px] border border-gray-50 cursor-pointer hover:border-blue-600/20 transition-all hover:bg-white group">
                                                    <div>
                                                        <p className="text-sm font-black text-gray-900 mb-1 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{item.label}</p>
                                                        <p className="text-xs text-gray-500 font-medium leading-relaxed">{item.desc}</p>
                                                    </div>
                                                    <div className="relative inline-flex items-center cursor-pointer mt-1">
                                                        <input
                                                            type="checkbox"
                                                            name={item.id}
                                                            checked={formData[item.id]}
                                                            onChange={handleInputChange}
                                                            className="sr-only peer"
                                                        />
                                                        <div className="w-14 h-8 bg-gray-100 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-200 after:border-2 after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600 border border-gray-100"></div>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="pt-10 border-t border-gray-50">
                                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1 mb-6">Cadence Settings</h4>
                                        <div className="flex flex-wrap gap-4">
                                            {['Immediate Burst', 'Daily Delta', 'Weekly Overview'].map(freq => (
                                                <button key={freq} className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${freq === 'Immediate Burst' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20 border-transparent' : 'bg-white border-gray-100 text-gray-400 hover:text-gray-900 hover:bg-gray-50'}`}>
                                                    {freq}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="px-10 py-8 bg-gray-50/50 border-t border-gray-50 flex justify-end relative z-10">
                            <button
                                onClick={handleCommitState}
                                disabled={isLoading}
                                className="px-12 py-4 bg-blue-600 text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-blue-700 transition-all shadow-2xl shadow-blue-600/20 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? 'Committing...' : 'Commit State'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Settings;
