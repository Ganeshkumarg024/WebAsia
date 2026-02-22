import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CurrencyDollarIcon, UsersIcon, ChartBarIcon, ClipboardDocumentIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import affiliateAPI from '../../api/affiliate';
import { format } from 'date-fns';
import DashboardLayout from '../../components/layout/DashboardLayout';
import showToast from '../../components/shared/Toast';

const AffiliateDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({});
    const [referralLink, setReferralLink] = useState({});
    const [recentReferrals, setRecentReferrals] = useState([]);
    const [earnings, setEarnings] = useState({});
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [dashRes, linkRes, refRes, earnRes] = await Promise.allSettled([
                affiliateAPI.getDashboard(),
                affiliateAPI.getReferralLink(),
                affiliateAPI.getReferrals({ limit: 5 }),
                affiliateAPI.getEarnings('30d')
            ]);
            if (dashRes.status === 'fulfilled') setStats(dashRes.value?.data || {});
            if (linkRes.status === 'fulfilled') setReferralLink(linkRes.value?.data || {});
            if (refRes.status === 'fulfilled') setRecentReferrals(refRes.value?.data || []);
            if (earnRes.status === 'fulfilled') setEarnings(earnRes.value?.data || {});
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCopyLink = () => {
        if (referralLink.referralLink) {
            navigator.clipboard.writeText(referralLink.referralLink);
            setCopied(true);
            showToast.success('Referral link copied!');
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleShareLink = async () => {
        if (!referralLink.referralLink) return;
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Join WebAsia!',
                    text: 'Check out WebAsia Creative Services — use my referral link to get started!',
                    url: referralLink.referralLink
                });
            } catch (err) {
                if (err.name !== 'AbortError') {
                    handleCopyLink();
                }
            }
        } else {
            handleCopyLink();
        }
    };

    const isPending = stats.status === 'pending';

    if (loading) {
        return (
            <DashboardLayout breadcrumbs={['Affiliate', 'Dashboard']}>
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
                </div>
            </DashboardLayout>
        );
    }

    if (isPending) {
        return (
            <DashboardLayout breadcrumbs={['Affiliate', 'Dashboard']}>
                <div className="flex flex-col items-center justify-center h-[60vh]">
                    <div className="bg-yellow-50 border-2 border-yellow-200 rounded-3xl p-12 text-center max-w-lg">
                        <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <ClipboardDocumentIcon className="w-10 h-10 text-yellow-600" />
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 mb-3">Application Pending</h2>
                        <p className="text-gray-500 mb-6">
                            Your affiliate application is under review. You'll be notified once approved by our team.
                        </p>
                        <div className="bg-yellow-100 rounded-2xl px-4 py-3">
                            <p className="text-sm font-bold text-yellow-800">⏳ Estimated review time: 24-48 hours</p>
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout breadcrumbs={['Affiliate', 'Dashboard']}>
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 mb-1">Affiliate Dashboard</h1>
                        <p className="text-gray-500 font-medium">Track your referrals and earnings</p>
                    </div>
                    <button
                        onClick={() => navigate('/affiliate/payouts')}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-sm transition-all shadow-lg shadow-blue-600/20"
                    >
                        Request Payout
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Earnings</p>
                        <CurrencyDollarIcon className="w-5 h-5 text-green-500" />
                    </div>
                    <p className="text-3xl font-black text-gray-900">₹{parseFloat(stats.totalEarnings || 0).toLocaleString()}</p>
                    <p className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded w-fit mt-2">Lifetime</p>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Pending Payout</p>
                        <CurrencyDollarIcon className="w-5 h-5 text-yellow-500" />
                    </div>
                    <p className="text-3xl font-black text-gray-900">₹{parseFloat(stats.pendingEarnings || 0).toLocaleString()}</p>
                    <p className="text-xs font-bold text-yellow-600 bg-yellow-50 px-2 py-1 rounded w-fit mt-2">Available</p>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Referrals</p>
                        <UsersIcon className="w-5 h-5 text-blue-500" />
                    </div>
                    <p className="text-3xl font-black text-gray-900">{stats.totalReferrals || 0}</p>
                    <p className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded w-fit mt-2">{stats.successfulConversions || 0} converted</p>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Conversion Rate</p>
                        <ArrowTrendingUpIcon className="w-5 h-5 text-purple-500" />
                    </div>
                    <p className="text-3xl font-black text-gray-900">{stats.conversionRate || 0}%</p>
                    <p className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded w-fit mt-2">
                        {stats.commissionRate || 15}% rate
                    </p>
                </div>
            </div>

            {/* Referral Link + Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Referral Link */}
                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                        <h2 className="text-lg font-black text-gray-900 mb-4">Your Referral Link</h2>
                        <div className="flex items-center gap-3">
                            <input
                                type="text"
                                value={referralLink.referralLink || '...'}
                                readOnly
                                className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 font-mono text-sm focus:outline-none"
                            />
                            <button
                                onClick={handleCopyLink}
                                className={`px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${copied
                                    ? 'bg-green-500 text-white'
                                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20'
                                    }`}
                            >
                                {copied ? (
                                    <><CheckCircleIcon className="w-4 h-4" /> Copied!</>
                                ) : (
                                    <><ClipboardDocumentIcon className="w-4 h-4" /> Copy Link</>
                                )}
                            </button>
                            <button
                                onClick={handleShareLink}
                                className="px-5 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-lg shadow-green-500/20"
                            >
                                Share
                            </button>
                        </div>
                        <p className="text-xs text-gray-400 mt-3 font-medium">
                            Earn {stats.commissionRate || 15}% commission on all referral subscriptions • Code: <span className="font-bold text-blue-600">{referralLink.referralCode}</span>
                        </p>
                    </div>

                    {/* Recent Referrals */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="text-lg font-black text-gray-900">Recent Referrals</h2>
                            <button onClick={() => navigate('/affiliate/referrals')} className="text-sm font-bold text-blue-600 hover:text-blue-700">
                                View All →
                            </button>
                        </div>
                        <div className="divide-y divide-gray-50">
                            {recentReferrals.length === 0 ? (
                                <div className="p-8 text-center text-gray-400">
                                    <UsersIcon className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                                    <p className="font-bold">No referrals yet</p>
                                    <p className="text-sm">Share your referral link to get started!</p>
                                </div>
                            ) : (
                                recentReferrals.map((ref, i) => (
                                    <div key={ref.id || i} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                                                <span className="text-blue-600 font-black text-sm">
                                                    {ref.referredUser?.firstName?.charAt(0) || ref.referredEmail?.charAt(0) || '?'}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-900">
                                                    {ref.referredUser ? `${ref.referredUser.firstName} ${ref.referredUser.lastName}` : ref.referredEmail || 'Anonymous'}
                                                </p>
                                                <p className="text-xs text-gray-400">
                                                    {ref.createdAt ? format(new Date(ref.createdAt), 'MMM dd, yyyy') : '-'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className={`px-2 py-1 rounded-lg text-xs font-bold ${ref.status === 'converted' ? 'bg-green-50 text-green-600' :
                                                ref.status === 'registered' ? 'bg-blue-50 text-blue-600' :
                                                    'bg-gray-100 text-gray-500'
                                                }`}>
                                                {ref.status}
                                            </span>
                                            {ref.commissionAmount > 0 && (
                                                <p className="text-sm font-bold text-green-600 mt-1">+₹{parseFloat(ref.commissionAmount).toFixed(2)}</p>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* This Month Earnings */}
                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">This Month</h3>
                        <p className="text-3xl font-black text-gray-900 mb-2">₹{parseFloat(earnings.totalAmount || 0).toLocaleString()}</p>
                        <div className="flex items-center gap-4 text-xs font-bold">
                            <span className="text-yellow-600 bg-yellow-50 px-2 py-1 rounded">₹{parseFloat(earnings.pendingAmount || 0).toFixed(0)} pending</span>
                            <span className="text-green-600 bg-green-50 px-2 py-1 rounded">₹{parseFloat(earnings.paidAmount || 0).toFixed(0)} paid</span>
                        </div>
                    </div>

                    {/* Commission Structure */}
                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Your Commission</h3>
                        <div className="space-y-3">
                            <div className={`p-4 rounded-xl ${stats.tier === 'vip' ? 'bg-purple-50 border-2 border-purple-200' : stats.tier === 'premium' ? 'bg-blue-50 border-2 border-blue-200' : 'bg-green-50 border-2 border-green-200'}`}>
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm font-bold text-gray-900 capitalize">{stats.tier || 'Standard'} Tier</span>
                                    <span className="text-2xl font-black text-blue-600">{stats.commissionRate || 15}%</span>
                                </div>
                                <p className="text-xs text-gray-500">Recurring commission per referral</p>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12"></div>
                        <h3 className="text-white font-black text-sm mb-4 relative z-10">Quick Actions</h3>
                        <div className="space-y-2 relative z-10">
                            <button onClick={() => navigate('/affiliate/earnings')} className="w-full py-2.5 bg-white/20 hover:bg-white/30 text-white rounded-xl text-xs font-bold transition-colors">
                                View Earnings
                            </button>
                            <button onClick={() => navigate('/affiliate/resources')} className="w-full py-2.5 bg-white/20 hover:bg-white/30 text-white rounded-xl text-xs font-bold transition-colors">
                                Marketing Resources
                            </button>
                            <button onClick={() => navigate('/affiliate/settings')} className="w-full py-2.5 bg-white/20 hover:bg-white/30 text-white rounded-xl text-xs font-bold transition-colors">
                                Payout Settings
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AffiliateDashboard;
