import { useEffect, useState } from 'react';
import { UsersIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import affiliateAPI from '../../api/affiliate';
import { format } from 'date-fns';
import DashboardLayout from '../../components/layout/DashboardLayout';

const AffiliateReferrals = () => {
    const [referrals, setReferrals] = useState([]);
    const [pagination, setPagination] = useState({});
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [page, setPage] = useState(1);

    useEffect(() => {
        fetchReferrals();
    }, [statusFilter, page]);

    const fetchReferrals = async () => {
        try {
            setLoading(true);
            const params = { page, limit: 15 };
            if (statusFilter) params.status = statusFilter;
            const res = await affiliateAPI.getReferrals(params);
            setReferrals(res.data || []);
            setPagination(res.pagination || {});
        } catch (error) {
            console.error('Failed to fetch referrals:', error);
        } finally {
            setLoading(false);
        }
    };

    const statusColors = {
        clicked: 'bg-gray-100 text-gray-600',
        registered: 'bg-blue-50 text-blue-600',
        subscribed: 'bg-indigo-50 text-indigo-600',
        converted: 'bg-green-50 text-green-600',
        churned: 'bg-red-50 text-red-600'
    };

    return (
        <DashboardLayout breadcrumbs={['Affiliate', 'Referrals']}>
            <div className="mb-8">
                <h1 className="text-3xl font-black text-gray-900 mb-1">My Referrals</h1>
                <p className="text-gray-500 font-medium">Track all users you've referred to WebAsia</p>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3 mb-6">
                {['', 'clicked', 'registered', 'subscribed', 'converted'].map(s => (
                    <button
                        key={s}
                        onClick={() => { setStatusFilter(s); setPage(1); }}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${statusFilter === s
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                                : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
                            }`}
                    >
                        {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center h-40">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
                    </div>
                ) : referrals.length === 0 ? (
                    <div className="p-12 text-center">
                        <UsersIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p className="text-gray-500 font-bold">No referrals found</p>
                        <p className="text-sm text-gray-400 mt-1">Share your referral link to start earning!</p>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">User</th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Signed Up</th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Converted</th>
                                <th className="text-right px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Commission</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {referrals.map((ref) => (
                                <tr key={ref.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
                                                <span className="text-blue-600 font-black text-xs">
                                                    {ref.referredUser?.firstName?.charAt(0) || '?'}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-900">
                                                    {ref.referredUser ? `${ref.referredUser.firstName} ${ref.referredUser.lastName}` : ref.referredEmail || 'Anonymous'}
                                                </p>
                                                <p className="text-xs text-gray-400">{ref.referredUser?.email || ''}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-lg text-xs font-bold ${statusColors[ref.status] || 'bg-gray-100 text-gray-500'}`}>
                                            {ref.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {ref.registeredAt ? format(new Date(ref.registeredAt), 'MMM dd, yyyy') : ref.createdAt ? format(new Date(ref.createdAt), 'MMM dd, yyyy') : '-'}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {ref.convertedAt ? format(new Date(ref.convertedAt), 'MMM dd, yyyy') : '-'}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {ref.commissionAmount > 0 ? (
                                            <span className="text-sm font-bold text-green-600">+₹{parseFloat(ref.commissionAmount).toFixed(2)}</span>
                                        ) : (
                                            <span className="text-sm text-gray-400">-</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                        <p className="text-xs text-gray-400 font-medium">
                            Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
                        </p>
                        <div className="flex gap-2">
                            <button
                                disabled={page <= 1}
                                onClick={() => setPage(p => p - 1)}
                                className="px-4 py-2 rounded-xl text-xs font-bold bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50"
                            >
                                Previous
                            </button>
                            <button
                                disabled={page >= pagination.totalPages}
                                onClick={() => setPage(p => p + 1)}
                                className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default AffiliateReferrals;
