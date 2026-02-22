import { useEffect, useState } from 'react';
import { CurrencyDollarIcon } from '@heroicons/react/24/outline';
import affiliateAPI from '../../api/affiliate';
import { format } from 'date-fns';
import DashboardLayout from '../../components/layout/DashboardLayout';

const AffiliateEarnings = () => {
    const [earnings, setEarnings] = useState({ commissions: [], totalAmount: 0, pendingAmount: 0, paidAmount: 0 });
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState('30d');

    useEffect(() => {
        fetchEarnings();
    }, [period]);

    const fetchEarnings = async () => {
        try {
            setLoading(true);
            const res = await affiliateAPI.getEarnings(period);
            setEarnings(res.data || {});
        } catch (error) {
            console.error('Failed to fetch earnings:', error);
        } finally {
            setLoading(false);
        }
    };

    const statusColors = {
        pending: 'bg-yellow-50 text-yellow-600',
        approved: 'bg-blue-50 text-blue-600',
        paid: 'bg-green-50 text-green-600',
        cancelled: 'bg-red-50 text-red-600'
    };

    return (
        <DashboardLayout breadcrumbs={['Affiliate', 'Earnings']}>
            <div className="mb-8">
                <h1 className="text-3xl font-black text-gray-900 mb-1">Earnings</h1>
                <p className="text-gray-500 font-medium">Your commission history and earnings breakdown</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Earned</p>
                        <CurrencyDollarIcon className="w-5 h-5 text-green-500" />
                    </div>
                    <p className="text-3xl font-black text-gray-900">₹{parseFloat(earnings.totalAmount || 0).toLocaleString()}</p>
                    <p className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded w-fit mt-2">
                        {earnings.commissions?.length || 0} transactions
                    </p>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Pending</p>
                        <CurrencyDollarIcon className="w-5 h-5 text-yellow-500" />
                    </div>
                    <p className="text-3xl font-black text-gray-900">₹{parseFloat(earnings.pendingAmount || 0).toLocaleString()}</p>
                    <p className="text-xs font-bold text-yellow-600 bg-yellow-50 px-2 py-1 rounded w-fit mt-2">Awaiting approval</p>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Paid</p>
                        <CurrencyDollarIcon className="w-5 h-5 text-blue-500" />
                    </div>
                    <p className="text-3xl font-black text-gray-900">₹{parseFloat(earnings.paidAmount || 0).toLocaleString()}</p>
                    <p className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded w-fit mt-2">Paid out</p>
                </div>
            </div>

            {/* Period Filter */}
            <div className="flex items-center gap-3 mb-6">
                {[
                    { value: '7d', label: '7 Days' },
                    { value: '30d', label: '30 Days' },
                    { value: '90d', label: '90 Days' },
                    { value: '1y', label: '1 Year' }
                ].map(p => (
                    <button
                        key={p.value}
                        onClick={() => setPeriod(p.value)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${period === p.value
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                                : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
                            }`}
                    >
                        {p.label}
                    </button>
                ))}
            </div>

            {/* Commissions Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center h-40">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
                    </div>
                ) : (earnings.commissions || []).length === 0 ? (
                    <div className="p-12 text-center">
                        <CurrencyDollarIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p className="text-gray-500 font-bold">No earnings in this period</p>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Referral</th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Type</th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Date</th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Payment</th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Rate</th>
                                <th className="text-right px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Commission</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {(earnings.commissions || []).map((c) => (
                                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 text-sm font-bold text-gray-900">
                                        {c.referral?.referredUser
                                            ? `${c.referral.referredUser.firstName} ${c.referral.referredUser.lastName}`
                                            : 'N/A'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-xs font-bold text-gray-500 uppercase">{c.type || 'B2C'}</span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {c.createdAt ? format(new Date(c.createdAt), 'MMM dd, yyyy') : '-'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-lg text-xs font-bold ${statusColors[c.status] || 'bg-gray-100 text-gray-500'}`}>
                                            {c.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        ₹{parseFloat(c.paymentAmount || 0).toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {c.rate}%
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="text-sm font-bold text-green-600">+₹{parseFloat(c.amount).toFixed(2)}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </DashboardLayout>
    );
};

export default AffiliateEarnings;
