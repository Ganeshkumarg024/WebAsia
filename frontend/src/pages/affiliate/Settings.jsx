import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BanknotesIcon } from '@heroicons/react/24/outline';
import affiliateAPI from '../../api/affiliate';
import showToast from '../../components/shared/Toast';
import DashboardLayout from '../../components/layout/DashboardLayout';

const AffiliateSettings = () => {
    const navigate = useNavigate();
    const [bankDetails, setBankDetails] = useState({
        accountName: '',
        accountNumber: '',
        bankName: '',
        routingNumber: '',
        swiftCode: '',
    });
    const [paymentMethod, setPaymentMethod] = useState('bank');
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        try {
            setSaving(true);
            await affiliateAPI.updatePayoutSettings({
                paymentMethod,
                bankDetails,
            });
            showToast.success('Payout settings saved successfully');
            navigate('/affiliate/dashboard');
        } catch (error) {
            showToast.error('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    return (
        <DashboardLayout breadcrumbs={['Affiliate', 'Settings']}>
            <div className="max-w-3xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Payout Settings</h1>
                    <p className="text-gray-400">Configure your payment preferences and bank details</p>
                </div>

                {/* Payment Method */}
                <div className="bg-[#151B2E] rounded-lg p-6 border border-[#1E2638] mb-6">
                    <h2 className="text-lg font-bold text-white mb-4">Payment Method</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => setPaymentMethod('bank')}
                            className={`p-4 rounded-lg border-2 transition-all ${paymentMethod === 'bank'
                                ? 'border-blue-500 bg-blue-500/10'
                                : 'border-gray-700 hover:border-gray-600'
                                }`}
                        >
                            <BanknotesIcon className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                            <p className="text-white font-medium">Bank Transfer</p>
                            <p className="text-xs text-gray-400 mt-1">Direct deposit to your bank</p>
                        </button>
                        <button
                            onClick={() => setPaymentMethod('paypal')}
                            className={`p-4 rounded-lg border-2 transition-all ${paymentMethod === 'paypal'
                                ? 'border-blue-500 bg-blue-500/10'
                                : 'border-gray-700 hover:border-gray-600'
                                }`}
                        >
                            <div className="w-8 h-8 bg-blue-500 rounded mx-auto mb-2"></div>
                            <p className="text-white font-medium">PayPal</p>
                            <p className="text-xs text-gray-400 mt-1">Fast and convenient</p>
                        </button>
                    </div>
                </div>

                {/* Bank Details */}
                {paymentMethod === 'bank' && (
                    <div className="bg-[#151B2E] rounded-lg p-6 border border-[#1E2638] mb-6">
                        <h2 className="text-lg font-bold text-white mb-4">Bank Account Details</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-white mb-2">
                                    Account Holder Name
                                </label>
                                <input
                                    type="text"
                                    value={bankDetails.accountName}
                                    onChange={(e) => setBankDetails({ ...bankDetails, accountName: e.target.value })}
                                    className="w-full px-4 py-3 bg-[#0A0E1A] border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                                    placeholder="John Doe"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-white mb-2">
                                    Account Number
                                </label>
                                <input
                                    type="text"
                                    value={bankDetails.accountNumber}
                                    onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                                    className="w-full px-4 py-3 bg-[#0A0E1A] border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                                    placeholder="1234567890"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-white mb-2">
                                    Bank Name
                                </label>
                                <input
                                    type="text"
                                    value={bankDetails.bankName}
                                    onChange={(e) => setBankDetails({ ...bankDetails, bankName: e.target.value })}
                                    className="w-full px-4 py-3 bg-[#0A0E1A] border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                                    placeholder="Chase Bank"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-white mb-2">
                                        Routing Number
                                    </label>
                                    <input
                                        type="text"
                                        value={bankDetails.routingNumber}
                                        onChange={(e) => setBankDetails({ ...bankDetails, routingNumber: e.target.value })}
                                        className="w-full px-4 py-3 bg-[#0A0E1A] border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                                        placeholder="021000021"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-white mb-2">
                                        SWIFT Code (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        value={bankDetails.swiftCode}
                                        onChange={(e) => setBankDetails({ ...bankDetails, swiftCode: e.target.value })}
                                        className="w-full px-4 py-3 bg-[#0A0E1A] border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                                        placeholder="CHASUS33"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* PayPal Email */}
                {paymentMethod === 'paypal' && (
                    <div className="bg-[#151B2E] rounded-lg p-6 border border-[#1E2638] mb-6">
                        <h2 className="text-lg font-bold text-white mb-4">PayPal Account</h2>
                        <div>
                            <label className="block text-sm font-medium text-white mb-2">
                                PayPal Email Address
                            </label>
                            <input
                                type="email"
                                className="w-full px-4 py-3 bg-[#0A0E1A] border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                                placeholder="your.email@example.com"
                            />
                        </div>
                    </div>
                )}

                {/* Payout Schedule */}
                <div className="bg-[#151B2E] rounded-lg p-6 border border-[#1E2638] mb-6">
                    <h2 className="text-lg font-bold text-white mb-4">Payout Schedule</h2>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-gray-300">Minimum Payout Amount</span>
                            <span className="text-white font-medium">$100</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-300">Payout Frequency</span>
                            <span className="text-white font-medium">Monthly</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-300">Next Payout Date</span>
                            <span className="text-white font-medium">End of Month</span>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/affiliate/dashboard')}
                        className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex-1 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50"
                    >
                        {saving ? 'Saving...' : 'Save Settings'}
                    </button>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AffiliateSettings;
