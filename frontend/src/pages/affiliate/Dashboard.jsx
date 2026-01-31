import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CurrencyDollarIcon, UsersIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import affiliateAPI from '../../api/affiliate';
import StatCard from '../../components/shared/StatCard';
import DataTable from '../../components/shared/DataTable';
import { format } from 'date-fns';
import DashboardLayout from '../../components/layout/DashboardLayout';

const AffiliateDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({});
    const [referrals, setReferrals] = useState([]);
    const [earnings, setEarnings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [dashboardRes, referralsRes, earningsRes] = await Promise.all([
                affiliateAPI.getDashboard(),
                affiliateAPI.getReferrals(),
                affiliateAPI.getEarnings(),
            ]);

            setStats(dashboardRes.data || {});
            setReferrals(referralsRes.data || []);
            setEarnings(earningsRes.data || []);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const referralColumns = [
        {
            key: 'name',
            label: 'REFERRAL',
            render: (val, row) => (
                <div>
                    <p className="text-white font-medium">{val}</p>
                    <p className="text-xs text-gray-400">{row.email}</p>
                </div>
            ),
        },
        {
            key: 'status',
            label: 'STATUS',
            render: (val) => (
                <span
                    className={`px-2 py-1 rounded text-xs font-medium ${val === 'active'
                        ? 'bg-green-500/10 text-green-500'
                        : val === 'pending'
                            ? 'bg-yellow-500/10 text-yellow-500'
                            : 'bg-gray-500/10 text-gray-500'
                        }`}
                >
                    {val}
                </span>
            ),
        },
        {
            key: 'signupDate',
            label: 'SIGNUP DATE',
            render: (val) => (
                <span className="text-sm text-white">
                    {val ? format(new Date(val), 'MMM dd, yyyy') : 'N/A'}
                </span>
            ),
        },
        {
            key: 'commission',
            label: 'COMMISSION',
            render: (val) => (
                <span className="text-white font-medium">${val?.toFixed(2) || '0.00'}</span>
            ),
        },
    ];

    return (
        <DashboardLayout breadcrumbs={['Affiliate', 'Dashboard']}>
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Affiliate Dashboard</h1>
                        <p className="text-gray-400">Track your referrals and earnings</p>
                    </div>
                    <button
                        onClick={() => navigate('/affiliate/settings')}
                        className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium"
                    >
                        Payout Settings
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="Total Earnings"
                    value={`$${stats.totalEarnings?.toLocaleString() || '0'}`}
                    icon={CurrencyDollarIcon}
                    color="success"
                    loading={loading}
                />
                <StatCard
                    title="Pending Payout"
                    value={`$${stats.pendingPayout?.toLocaleString() || '0'}`}
                    icon={CurrencyDollarIcon}
                    color="warning"
                    loading={loading}
                />
                <StatCard
                    title="Total Referrals"
                    value={stats.totalReferrals || '0'}
                    icon={UsersIcon}
                    color="primary"
                    loading={loading}
                />
                <StatCard
                    title="Active Referrals"
                    value={stats.activeReferrals || '0'}
                    icon={ChartBarIcon}
                    color="info"
                    loading={loading}
                />
            </div>

            <div className="grid grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="col-span-2 space-y-6">
                    {/* Referral Link */}
                    <div className="bg-[#151B2E] rounded-lg p-6 border border-[#1E2638]">
                        <h2 className="text-lg font-bold text-white mb-4">Your Referral Link</h2>
                        <div className="flex items-center gap-3">
                            <input
                                type="text"
                                value={`https://webasia.in/ref/${stats.referralCode || 'XXXXX'}`}
                                readOnly
                                className="flex-1 px-4 py-3 bg-[#0A0E1A] border border-gray-700 rounded-lg text-white focus:outline-none"
                            />
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(`https://webasia.in/ref/${stats.referralCode}`);
                                }}
                                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium"
                            >
                                Copy
                            </button>
                        </div>
                        <p className="text-sm text-gray-400 mt-3">
                            Earn 20% commission on all referrals for their first 12 months
                        </p>
                    </div>

                    {/* Referrals Table */}
                    <div>
                        <h2 className="text-xl font-bold text-white mb-4">My Referrals</h2>
                        <DataTable
                            columns={referralColumns}
                            data={referrals}
                            loading={loading}
                            emptyMessage="No referrals yet"
                        />
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Recent Earnings */}
                    <div className="bg-[#151B2E] rounded-lg p-6 border border-[#1E2638]">
                        <h3 className="text-lg font-bold text-white mb-4">Recent Earnings</h3>
                        <div className="space-y-3">
                            {earnings.slice(0, 5).map((earning, index) => (
                                <div key={index} className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-white">{earning.referralName}</p>
                                        <p className="text-xs text-gray-400">
                                            {earning.date ? format(new Date(earning.date), 'MMM dd') : 'N/A'}
                                        </p>
                                    </div>
                                    <span className="text-green-500 font-medium">
                                        +${earning.amount?.toFixed(2) || '0.00'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Commission Tiers */}
                    <div className="bg-[#151B2E] rounded-lg p-6 border border-[#1E2638]">
                        <h3 className="text-lg font-bold text-white mb-4">Commission Structure</h3>
                        <div className="space-y-3">
                            <div className="p-3 bg-blue-500/10 rounded">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm text-blue-400">Standard</span>
                                    <span className="text-lg font-bold text-blue-400">20%</span>
                                </div>
                                <p className="text-xs text-gray-400">First 12 months</p>
                            </div>
                            <div className="p-3 bg-purple-500/10 rounded">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm text-purple-400">Premium</span>
                                    <span className="text-lg font-bold text-purple-400">25%</span>
                                </div>
                                <p className="text-xs text-gray-400">10+ active referrals</p>
                            </div>
                        </div>
                    </div>

                    {/* Payout Info */}
                    <div className="bg-gradient-to-br from-green-500/20 to-blue-500/20 border-2 border-green-500 rounded-lg p-6">
                        <h3 className="text-lg font-bold text-white mb-2">Next Payout</h3>
                        <p className="text-3xl font-bold text-green-500 mb-2">
                            ${stats.nextPayout?.toFixed(2) || '0.00'}
                        </p>
                        <p className="text-sm text-gray-300">
                            Scheduled for {stats.nextPayoutDate || 'End of month'}
                        </p>
                    </div>
                </div>
            </div>