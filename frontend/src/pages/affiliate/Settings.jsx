import { useEffect, useState } from 'react';
import { CogIcon } from '@heroicons/react/24/outline';
import affiliateAPI from '../../api/affiliate';
import DashboardLayout from '../../components/layout/DashboardLayout';
import showToast from '../../components/shared/Toast';

const AffiliateSettings = () => {
    const [settings, setSettings] = useState({
        payoutMethod: 'bank_transfer',
        payoutDetails: {}
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const res = await affiliateAPI.getPayoutSettings();
            if (res.data) {
                setSettings({
                    payoutMethod: res.data.payoutMethod || 'bank_transfer',
                    payoutDetails: res.data.payoutDetails || {}
                });
            }
        } catch (error) {
            console.error('Failed to fetch settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            await affiliateAPI.updatePayoutSettings(settings);
            showToast.success('Payout settings updated!');
        } catch (error) {
            showToast.error('Failed to update settings');
        } finally {
            setSaving(false);
        }
    };

    const updateDetail = (key, value) => {
        setSettings(prev => ({
            ...prev,
            payoutDetails: { ...prev.payoutDetails, [key]: value }
        }));
    };

    if (loading) {
        return (
            <DashboardLayout breadcrumbs={['Affiliate', 'Settings']}>
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout breadcrumbs={['Affiliate', 'Settings']}>
            <div className="mb-8">
                <h1 className="text-3xl font-black text-gray-900 mb-1">Payout Settings</h1>
                <p className="text-gray-500 font-medium">Configure how you'd like to receive your earnings</p>
            </div>

            <div className="max-w-2xl">
                <form onSubmit={handleSave}>
                    {/* Payout Method Selection */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
                        <h2 className="text-lg font-black text-gray-900 mb-5">Payout Method</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[
                                { value: 'bank_transfer', label: 'Bank Transfer', icon: '🏦', desc: 'Direct bank deposit' },
                                { value: 'upi', label: 'UPI', icon: '📱', desc: 'UPI ID payment' },
                                { value: 'paypal', label: 'PayPal', icon: '💳', desc: 'PayPal email' }
                            ].map(method => (
                                <button
                                    key={method.value}
                                    type="button"
                                    onClick={() => setSettings(prev => ({ ...prev, payoutMethod: method.value }))}
                                    className={`p-4 rounded-xl border-2 text-left transition-all ${settings.payoutMethod === method.value
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <span className="text-2xl mb-2 block">{method.icon}</span>
                                    <p className="text-sm font-bold text-gray-900">{method.label}</p>
                                    <p className="text-xs text-gray-400">{method.desc}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Method-specific Details */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
                        <h2 className="text-lg font-black text-gray-900 mb-5">Payment Details</h2>

                        {settings.payoutMethod === 'bank_transfer' && (
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Account Holder Name</label>
                                    <input
                                        type="text"
                                        value={settings.payoutDetails.accountName || ''}
                                        onChange={(e) => updateDetail('accountName', e.target.value)}
                                        placeholder="Enter full name"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Bank Account Number</label>
                                    <input
                                        type="text"
                                        value={settings.payoutDetails.accountNumber || ''}
                                        onChange={(e) => updateDetail('accountNumber', e.target.value)}
                                        placeholder="Enter account number"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">IFSC Code</label>
                                    <input
                                        type="text"
                                        value={settings.payoutDetails.ifscCode || ''}
                                        onChange={(e) => updateDetail('ifscCode', e.target.value)}
                                        placeholder="e.g. SBIN0001234"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Bank Name</label>
                                    <input
                                        type="text"
                                        value={settings.payoutDetails.bankName || ''}
                                        onChange={(e) => updateDetail('bankName', e.target.value)}
                                        placeholder="e.g. State Bank of India"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                        )}

                        {settings.payoutMethod === 'upi' && (
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">UPI ID</label>
                                <input
                                    type="text"
                                    value={settings.payoutDetails.upiId || ''}
                                    onChange={(e) => updateDetail('upiId', e.target.value)}
                                    placeholder="e.g. yourname@paytm"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        )}

                        {settings.payoutMethod === 'paypal' && (
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">PayPal Email</label>
                                <input
                                    type="email"
                                    value={settings.payoutDetails.paypalEmail || ''}
                                    onChange={(e) => updateDetail('paypalEmail', e.target.value)}
                                    placeholder="your@email.com"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        )}
                    </div>

                    {/* Save */}
                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-sm transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50"
                    >
                        {saving ? 'Saving...' : 'Save Settings'}
                    </button>
                </form>
            </div>
        </DashboardLayout>
    );
};

export default AffiliateSettings;
