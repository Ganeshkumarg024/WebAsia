import { useEffect, useState } from 'react';
import { CogIcon } from '@heroicons/react/24/outline';
import affiliateAPI from '../../api/affiliate';
import DashboardLayout from '../../components/layout/DashboardLayout';
import showToast from '../../components/shared/Toast';

const AffiliateSettings = () => {
    const [activeTab, setActiveTab] = useState('profile');
    const [profile, setProfile] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        bio: '',
        email: '',
        role: ''
    });
    const [payout, setPayout] = useState({
        payoutMethod: 'bank_transfer',
        payoutDetails: {}
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        init();
    }, []);

    const init = async () => {
        try {
            setLoading(true);

            // Fetch Profile
            try {
                const profileRes = await affiliateAPI.getUserProfile();
                if (profileRes.success) {
                    setProfile(profileRes.data);
                }
            } catch (err) {
                console.error('Failed to fetch profile:', err);
            }

            // Fetch Payout Settings
            try {
                const payoutRes = await affiliateAPI.getPayoutSettings();
                if (payoutRes.success && payoutRes.data) {
                    setPayout({
                        payoutMethod: payoutRes.data.payoutMethod || 'bank_transfer',
                        payoutDetails: payoutRes.data.payoutDetails || {}
                    });
                }
            } catch (err) {
                console.error('Failed to fetch payout settings:', err);
                showToast.error('Failed to load payout details');
            }
        } catch (error) {
            console.error('Initialization error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            await affiliateAPI.updateUserProfile({
                firstName: profile.firstName,
                lastName: profile.lastName,
                phone: profile.phone,
                bio: profile.bio
            });
            showToast.success('Profile updated successfully!');
        } catch (error) {
            showToast.error('Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const handleSavePayout = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            await affiliateAPI.updatePayoutSettings(payout);
            showToast.success('Payout settings updated!');
        } catch (error) {
            showToast.error('Failed to update payout settings');
        } finally {
            setSaving(false);
        }
    };

    const updatePayoutDetail = (key, value) => {
        setPayout(prev => ({
            ...prev,
            payoutDetails: { ...prev.payoutDetails, [key]: value }
        }));
    };

    if (loading) {
        return (
            <DashboardLayout breadcrumbs={['Affiliate', 'Settings']}>
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout breadcrumbs={['Affiliate', 'Settings']}>
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 mb-1">Account Settings</h1>
                    <p className="text-gray-500 font-medium text-sm">Manage your profile and payout preferences</p>
                </div>

                {/* Tab Switcher */}
                <div className="flex bg-gray-100 p-1.5 rounded-2xl w-fit">
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`px-6 py-2.5 rounded-xl font-black text-sm transition-all ${activeTab === 'profile' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Profile
                    </button>
                    <button
                        onClick={() => setActiveTab('payout')}
                        className={`px-6 py-2.5 rounded-xl font-black text-sm transition-all ${activeTab === 'payout' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Payouts
                    </button>
                </div>
            </div>

            <div className="max-w-3xl">
                {activeTab === 'profile' ? (
                    <form onSubmit={handleSaveProfile} className="space-y-6">
                        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="p-8 border-b border-gray-100">
                                <h2 className="text-xl font-black text-gray-900">Personal Information</h2>
                                <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mt-1">Basic details for your account</p>
                            </div>
                            <div className="p-8 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block">First Name</label>
                                        <input
                                            type="text"
                                            value={profile.firstName}
                                            onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                                            className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                            placeholder="Your first name"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block">Last Name</label>
                                        <input
                                            type="text"
                                            value={profile.lastName}
                                            onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                                            className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                            placeholder="Your last name"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block">Email Address</label>
                                    <input
                                        type="email"
                                        value={profile.email}
                                        readOnly
                                        className="w-full px-5 py-4 bg-gray-100 border border-transparent rounded-2xl text-gray-500 font-bold cursor-not-allowed"
                                    />
                                    <p className="text-[10px] text-gray-400 mt-2 italic font-medium">Email cannot be changed directly. Contact support if needed.</p>
                                </div>

                                <div>
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block">Phone Number</label>
                                    <input
                                        type="tel"
                                        value={profile.phone || ''}
                                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                        className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                        placeholder="+91 00000 00000"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block">Bio</label>
                                    <textarea
                                        rows="4"
                                        value={profile.bio || ''}
                                        onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                                        className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                                        placeholder="Tell us a bit about yourself and your marketing reach..."
                                    />
                                </div>
                            </div>
                            <div className="p-8 bg-gray-50 flex items-center justify-end">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-sm transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 active:scale-95"
                                >
                                    {saving ? 'Saving...' : 'Update Profile'}
                                </button>
                            </div>
                        </div>
                    </form>
                ) : (
                    <form onSubmit={handleSavePayout} className="space-y-6">
                        {/* Payout Method Selection */}
                        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="p-8 border-b border-gray-100">
                                <h2 className="text-xl font-black text-gray-900">Withdrawal Method</h2>
                                <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mt-1">Select your preferred way to receive funds</p>
                            </div>
                            <div className="p-8">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                    {[
                                        { value: 'bank_transfer', label: 'Bank Transfer', icon: '🏦', desc: 'Direct Deposit' },
                                        { value: 'upi', label: 'UPI', icon: '📱', desc: 'Instant ID' },
                                        { value: 'paypal', label: 'PayPal', icon: '💳', desc: 'International' }
                                    ].map(method => (
                                        <button
                                            key={method.value}
                                            type="button"
                                            onClick={() => setPayout(prev => ({ ...prev, payoutMethod: method.value }))}
                                            className={`p-6 rounded-2xl border-4 text-left transition-all relative overflow-hidden group ${payout.payoutMethod?.toLowerCase() === method.value
                                                ? 'border-blue-500 bg-blue-50/50'
                                                : 'border-gray-50 hover:border-gray-100 hover:bg-gray-50'
                                                }`}
                                        >
                                            <span className="text-3xl mb-3 block">{method.icon}</span>
                                            <p className="text-sm font-black text-gray-900">{method.label}</p>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">{method.desc}</p>
                                            {payout.payoutMethod === method.value && (
                                                <div className="absolute top-0 right-0 p-2">
                                                    <div className="bg-blue-500 rounded-full p-0.5">
                                                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    </div>
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="px-8 pb-8 space-y-6">
                                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Method Details</h3>

                                {payout.payoutMethod?.toLowerCase() === 'bank_transfer' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-top-2 duration-200">
                                        <div className="md:col-span-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Account Holder Name</label>
                                            <input
                                                type="text"
                                                value={payout.payoutDetails.accountName || ''}
                                                onChange={(e) => updatePayoutDetail('accountName', e.target.value)}
                                                className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="Enter full name"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Account Number</label>
                                            <input
                                                type="text"
                                                value={payout.payoutDetails.accountNumber || ''}
                                                onChange={(e) => updatePayoutDetail('accountNumber', e.target.value)}
                                                className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 font-bold font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="00000000000"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">IFSC Code</label>
                                            <input
                                                type="text"
                                                value={payout.payoutDetails.ifscCode || ''}
                                                onChange={(e) => updatePayoutDetail('ifscCode', e.target.value)}
                                                className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 font-bold uppercase font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="SBIN0001234"
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Bank Name</label>
                                            <input
                                                type="text"
                                                value={payout.payoutDetails.bankName || ''}
                                                onChange={(e) => updatePayoutDetail('bankName', e.target.value)}
                                                className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="e.g. State Bank of India"
                                            />
                                        </div>
                                    </div>
                                )}

                                {payout.payoutMethod?.toLowerCase() === 'upi' && (
                                    <div className="animate-in slide-in-from-top-2 duration-200">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">UPI ID</label>
                                        <input
                                            type="text"
                                            value={payout.payoutDetails.upiId || ''}
                                            onChange={(e) => updatePayoutDetail('upiId', e.target.value)}
                                            className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 font-bold font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="yourname@bank"
                                        />
                                        <p className="text-[10px] bg-blue-50 text-blue-600 p-3 rounded-xl mt-4 font-bold">Payments will be sent to this UPI ID. Ensure it is correct and active.</p>
                                    </div>
                                )}

                                {payout.payoutMethod?.toLowerCase() === 'paypal' && (
                                    <div className="animate-in slide-in-from-top-2 duration-200">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">PayPal Email</label>
                                        <input
                                            type="email"
                                            value={payout.payoutDetails.paypalEmail || ''}
                                            onChange={(e) => updatePayoutDetail('paypalEmail', e.target.value)}
                                            className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="your-paypal@email.com"
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="p-8 bg-gray-50 flex items-center justify-end">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-sm transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 active:scale-95"
                                >
                                    {saving ? 'Saving...' : 'Update Payout Settings'}
                                </button>
                            </div>
                        </div>
                    </form>
                )}
            </div>
        </DashboardLayout>
    );
};

export default AffiliateSettings;
