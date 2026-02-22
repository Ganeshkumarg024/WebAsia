import { useEffect, useState } from 'react';
import { CurrencyDollarIcon, PlusIcon } from '@heroicons/react/24/outline';
import affiliateAPI from '../../api/affiliate';
import { format } from 'date-fns';
import DashboardLayout from '../../components/layout/DashboardLayout';
import showToast from '../../components/shared/Toast';

const AffiliatePayouts = () => {
    const [payouts, setPayouts] = useState([]);
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [showRequestForm, setShowRequestForm] = useState(false);
    const [requestAmount, setRequestAmount] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [payoutRes, dashRes] = await Promise.all([
                affiliateAPI.getPayouts(),
                affiliateAPI.getDashboard()
            ]);
            setPayouts(payoutRes.data || []);
            setStats(dashRes.data || {});
        } catch (error) {
            console.error('Failed to fetch payout data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRequestPayout = async (e) => {
        e.preventDefault();
        const amount = parseFloat(requestAmount);
        if (!amount || amount < 100) {
            showToast.error('Minimum payout amount is ₹100');
            return;
        }
        if (amount > parseFloat(stats.pendingEarnings || 0)) {
            showToast.error('Amount exceeds available balance');
            return;
        }

        try {
            setSubmitting(true);
            await affiliateAPI.requestPayout(amount);
            showToast.success('Payout request submitted!');
            setShowRequestForm(false);
            setRequestAmount('');
            fetchData();
        } catch (error) {
            showToast.error(error.response?.data?.error?.message || 'Failed to submit payout request');
        } finally {
            setSubmitting(false);
        }
    };

    const statusColors = {
        requested: 'bg-yellow-50 text-yellow-600',
        approved: 'bg-blue-50 text-blue-600',
        processing: 'bg-indigo-50 text-indigo-600',
        paid: 'bg-green-50 text-green-600',
        rejected: 'bg-red-50 text-red-600'
    };

    return (
        <DashboardLayout breadcrumbs={['Affiliate', 'Payouts']}>
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 mb-1">Payouts</h1>
                    <p className="text-gray-500 font-medium">Request and track your payment withdrawals</p>
                </div>
                <button
                    onClick={() => setShowRequestForm(true)}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-sm flex items-center gap-2 transition-all shadow-lg shadow-blue-600/20"
                >
                    <PlusIcon className="w-4 h-4" />
                    Request Payout
                </button>
            </div>

            {/* Balance and Payout Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Balance Card */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 relative overflow-hidden h-full">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20"></div>
                    <div className="relative z-10">
                        <p className="text-blue-100 text-sm font-bold uppercase tracking-wider mb-2">Available Balance</p>
                        <p className="text-4xl font-black text-white mb-4">₹{parseFloat(stats.pendingEarnings || 0).toLocaleString()}</p>
                        <div className="flex gap-6 text-sm">
                            <div>
                                <p className="text-blue-200 text-xs font-bold">Total Earned</p>
                                <p className="text-white font-black">₹{parseFloat(stats.totalEarnings || 0).toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="text-blue-200 text-xs font-bold">Already Paid</p>
                                <p className="text-white font-black">₹{parseFloat(stats.paidEarnings || 0).toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Active Payout Method Card */}
                <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-start mb-4">
                            <p className="text-gray-400 text-sm font-bold uppercase tracking-wider">Withdrawal Method</p>
                            <a href="/affiliate/settings" className="text-blue-600 font-bold text-xs hover:underline">Edit Settings</a>
                        </div>

                        {!stats.payoutMethod ? (
                            <div className="text-gray-500 italic text-sm py-4">
                                No payout method set. Please configure in settings.
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">
                                        {stats.payoutMethod === 'upi' ? '📱' : stats.payoutMethod === 'bank_transfer' ? '🏦' : '💳'}
                                    </span>
                                    <div>
                                        <p className="text-gray-900 font-black capitalize">{stats.payoutMethod?.replace('_', ' ')}</p>
                                        <p className="text-xs text-gray-400">Default destination for your payouts</p>
                                    </div>
                                </div>

                                <div className="bg-gray-50 rounded-xl p-4 mt-2">
                                    {stats.payoutMethod === 'upi' && (
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase mb-1">UPI ID</p>
                                            <p className="text-gray-900 font-bold font-mono">{stats.payoutDetails?.upiId}</p>
                                        </div>
                                    )}
                                    {stats.payoutMethod === 'bank_transfer' && (
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Account Number</p>
                                                <p className="text-gray-900 font-bold font-mono text-xs">{stats.payoutDetails?.accountNumber}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-gray-400 uppercase mb-1">IFSC Code</p>
                                                <p className="text-gray-900 font-bold uppercase text-xs">{stats.payoutDetails?.ifscCode}</p>
                                            </div>
                                        </div>
                                    )}
                                    {stats.payoutMethod === 'paypal' && (
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase mb-1">PayPal Email</p>
                                            <p className="text-gray-900 font-bold font-mono">{stats.payoutDetails?.paypalEmail}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Request Payout Modal */}
            {showRequestForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
                        <h2 className="text-xl font-black text-gray-900 mb-6">Request Payout</h2>
                        <form onSubmit={handleRequestPayout}>
                            <div className="mb-6">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Amount (₹)</label>
                                <input
                                    type="number"
                                    value={requestAmount}
                                    onChange={(e) => setRequestAmount(e.target.value)}
                                    placeholder="Enter amount (min ₹100)"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    min="100"
                                    max={stats.pendingEarnings}
                                />
                                <p className="text-xs text-gray-400 mt-2">
                                    Available: ₹{parseFloat(stats.pendingEarnings || 0).toLocaleString()}
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowRequestForm(false)}
                                    className="flex-1 py-3 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50 text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {submitting ? 'Submitting...' : 'Submit Request'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Payout History */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-lg font-black text-gray-900">Payout History</h2>
                </div>
                {loading ? (
                    <div className="flex items-center justify-center h-40">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
                    </div>
                ) : payouts.length === 0 ? (
                    <div className="p-12 text-center">
                        <CurrencyDollarIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p className="text-gray-500 font-bold">No payout requests yet</p>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Amount</th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Method</th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Requested</th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Processed</th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Transaction Ref</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {payouts.map(p => (
                                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 text-sm font-bold text-gray-900">₹{parseFloat(p.amount).toLocaleString()}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600 capitalize">{p.payoutMethod?.replace('_', ' ') || '-'}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {p.requestedAt ? format(new Date(p.requestedAt), 'MMM dd, yyyy') : '-'}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {p.processedAt ? format(new Date(p.processedAt), 'MMM dd, yyyy') : '-'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-lg text-xs font-bold ${statusColors[p.status] || 'bg-gray-100 text-gray-500'}`}>
                                            {p.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 font-mono">{p.transactionRef || '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </DashboardLayout>
    );
};

export default AffiliatePayouts;
