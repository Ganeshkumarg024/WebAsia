import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import useAffiliateStore from '../../store/affiliateStore';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';
import {
    CurrencyDollarIcon,
    UserGroupIcon,
    LinkIcon,
    ArrowTopRightOnSquareIcon,
    BanknotesIcon,
    CheckCircleIcon,
    ClockIcon,
    ExclamationCircleIcon
} from '@heroicons/react/24/outline';

const AffiliateDashboard = () => {
    const { affiliate, referrals, fetchAffiliateStats, fetchReferrals, requestPayout, isLoading } = useAffiliateStore();
    const { user } = useAuthStore();
    const [payoutAmount, setPayoutAmount] = useState('');
    const [showPayoutModal, setShowPayoutModal] = useState(false);

    useEffect(() => {
        fetchAffiliateStats();
        fetchReferrals();
    }, []);

    const copyReferralLink = () => {
        const link = `${window.location.origin}/register?ref=${affiliate?.referralCode}`;
        navigator.clipboard.writeText(link);
        toast.success('Referral link copied to clipboard!');
    };

    const handlePayoutRequest = async (e) => {
        e.preventDefault();
        if (!payoutAmount || isNaN(payoutAmount)) {
            toast.error('Please enter a valid amount');
            return;
        }

        try {
            await requestPayout(parseFloat(payoutAmount), { bankDetails: 'Stored in profile' });
            toast.success('Payout request submitted successfully!');
            setShowPayoutModal(false);
            setPayoutAmount('');
            fetchAffiliateStats();
        } catch (err) {
            toast.error(err.message || 'Failed to submit payout request');
        }
    };

    const statusColors = {
        registered: 'text-blue-600 bg-blue-50',
        subscribed: 'text-indigo-600 bg-indigo-50',
        converted: 'text-green-600 bg-green-50',
        clicked: 'text-gray-600 bg-gray-50',
        cancelled: 'text-red-600 bg-red-50'
    };

    if (isLoading && !affiliate) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">Affiliate Hub</h1>
                <p className="text-gray-500 font-medium mt-1">Grow with WebAsia and earn commissions.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
                <StatCard
                    title="Total Earnings"
                    value={`₹${affiliate?.totalEarnings || 0}`}
                    icon={<CurrencyDollarIcon className="w-6 h-6" />}
                    color="bg-green-500"
                />
                <StatCard
                    title="Pending Payout"
                    value={`₹${affiliate?.pendingEarnings || 0}`}
                    icon={<BanknotesIcon className="w-6 h-6" />}
                    color="bg-blue-500"
                />
                <StatCard
                    title="Conversions"
                    value={affiliate?.successfulConversions || 0}
                    icon={<CheckCircleIcon className="w-6 h-6" />}
                    color="bg-indigo-500"
                />
                <StatCard
                    title="Referrals"
                    value={affiliate?.totalReferrals || 0}
                    icon={<UserGroupIcon className="w-6 h-6" />}
                    color="bg-orange-500"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Referral Link Section */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm shadow-blue-600/5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-[4rem] -z-0 opacity-50"></div>
                        <div className="relative z-10 space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-600/20">
                                    <LinkIcon className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-gray-900 tracking-tight">Your Referral Link</h3>
                                    <p className="text-gray-500 text-sm font-medium">Share this link and earn {affiliate?.commissionRate}% recurring commission.</p>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <div className="flex-1 bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 font-mono text-sm text-gray-600 truncate">
                                    {window.location.origin}/register?ref={affiliate?.referralCode}
                                </div>
                                <button
                                    onClick={copyReferralLink}
                                    className="bg-gray-900 text-white px-6 rounded-2xl font-bold hover:bg-gray-800 transition-colors"
                                >
                                    Copy
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Referrals Table */}
                    <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden text-center">
                        <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between">
                            <h3 className="text-xl font-black text-gray-900 tracking-tight">Recent Referrals</h3>
                            <button className="text-blue-600 font-bold text-sm hover:underline flex items-center gap-1">
                                View All <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50/50">
                                    <tr>
                                        <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">User ID</th>
                                        <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                                        <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Earnings</th>
                                        <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {referrals.map((ref, i) => (
                                        <tr key={i} className="hover:bg-gray-50/30 transition-colors text-center">
                                            <td className="px-8 py-4 font-mono text-xs text-gray-500 truncate max-w-[120px]">
                                                {ref.referredUserId?.split('-')[0]}...
                                            </td>
                                            <td className="px-8 py-4">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${statusColors[ref.status]}`}>
                                                    {ref.status}
                                                </span>
                                            </td>
                                            <td className="px-8 py-4 font-bold text-gray-900">
                                                ₹{ref.commissionAmount || 0}
                                            </td>
                                            <td className="px-8 py-4 text-xs font-medium text-gray-500">
                                                {new Date(ref.createdAt).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                    {referrals.length === 0 && (
                                        <tr>
                                            <td colSpan="4" className="px-8 py-12 text-center text-gray-400 font-medium">
                                                No referrals yet. Start sharing your link!
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Sidebar: Payouts */}
                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-gray-900 to-blue-900 rounded-[2rem] p-8 text-white shadow-xl shadow-blue-900/20 text-center">
                        <div className="space-y-4">
                            <p className="text-blue-200 text-sm font-bold uppercase tracking-widest">Available for Payout</p>
                            <h2 className="text-4xl font-black tracking-tight">₹{affiliate?.pendingEarnings || 0}</h2>
                            <button
                                onClick={() => setShowPayoutModal(true)}
                                disabled={!affiliate?.pendingEarnings || affiliate?.pendingEarnings < 1000}
                                className="w-full bg-white text-gray-900 h-14 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Request Payout
                            </button>
                            <p className="text-[10px] text-blue-300 font-bold text-center">Minimum payout: ₹1,000</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm space-y-6 text-center">
                        <h3 className="text-lg font-black text-gray-900 tracking-tight">Marketing Assets</h3>
                        <p className="text-gray-500 text-sm font-medium">Download our brand kit to use in your promotions.</p>
                        <button className="w-full border border-gray-100 h-12 rounded-xl font-bold text-sm text-gray-600 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                            Download Assets
                        </button>
                    </div>
                </div>
            </div>

            {/* Payout Modal */}
            {showPayoutModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl space-y-8"
                    >
                        <div className="text-center space-y-2">
                            <h3 className="text-2xl font-black text-gray-900">Request Payout</h3>
                            <p className="text-gray-500 font-medium">Maximum available: ₹{affiliate?.pendingEarnings}</p>
                        </div>

                        <form onSubmit={handlePayoutRequest} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Amount (INR)</label>
                                <input
                                    type="number"
                                    value={payoutAmount}
                                    onChange={(e) => setPayoutAmount(e.target.value)}
                                    placeholder="Enter amount"
                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 outline-none focus:border-blue-600 focus:bg-white transition-all font-bold"
                                />
                            </div>

                            <div className="flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setShowPayoutModal(false)}
                                    className="flex-1 h-14 rounded-2xl font-bold text-gray-500 hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-blue-600 text-white h-14 rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-colors"
                                >
                                    Submit
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

const StatCard = ({ title, value, icon, color }) => (
    <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm shadow-blue-600/5 hover:scale-[1.02] transition-all group">
        <div className="flex flex-col items-center gap-4">
            <div className={`p-3 rounded-2xl ${color} text-white shadow-lg group-hover:rotate-12 transition-transform`}>
                {icon}
            </div>
            <div className="space-y-1">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{title}</p>
                <h4 className="text-2xl font-black text-gray-900 tracking-tight">{value}</h4>
            </div>
        </div>
    </div>
);

export default AffiliateDashboard;
