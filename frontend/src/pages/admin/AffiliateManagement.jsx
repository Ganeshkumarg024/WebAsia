import { useEffect, useState } from 'react';
import { UsersIcon, MagnifyingGlassIcon, CheckCircleIcon, XCircleIcon, EyeIcon } from '@heroicons/react/24/outline';
import affiliateAPI from '../../api/affiliate';
import { format } from 'date-fns';
import DashboardLayout from '../../components/layout/DashboardLayout';
import showToast from '../../components/shared/Toast';

const AffiliateManagement = () => {
    const [affiliates, setAffiliates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [selectedAffiliate, setSelectedAffiliate] = useState(null);
    const [showDetail, setShowDetail] = useState(false);
    const [detailLoading, setDetailLoading] = useState(false);
    const [editCommission, setEditCommission] = useState(null);

    useEffect(() => {
        fetchAffiliates();
    }, [statusFilter]);

    const fetchAffiliates = async () => {
        try {
            setLoading(true);
            const params = {};
            if (statusFilter) params.status = statusFilter;
            const res = await affiliateAPI.adminGetAffiliates(params);
            setAffiliates(res.data || []);
        } catch (error) {
            console.error('Failed to fetch affiliates:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        try {
            await affiliateAPI.adminApproveAffiliate(id);
            showToast.success('Affiliate approved!');
            fetchAffiliates();
        } catch (error) {
            showToast.error('Failed to approve affiliate');
        }
    };

    const handleReject = async (id) => {
        const reason = prompt('Enter rejection reason (optional):');
        try {
            await affiliateAPI.adminRejectAffiliate(id, reason);
            showToast.success('Affiliate rejected');
            fetchAffiliates();
        } catch (error) {
            showToast.error('Failed to reject affiliate');
        }
    };

    const handleStatusChange = async (id, status) => {
        try {
            await affiliateAPI.adminUpdateAffiliateStatus(id, status);
            showToast.success(`Affiliate ${status}`);
            fetchAffiliates();
        } catch (error) {
            showToast.error('Failed to update status');
        }
    };

    const handleCommissionUpdate = async (id) => {
        if (!editCommission || isNaN(parseFloat(editCommission))) return;
        try {
            await affiliateAPI.adminUpdateCommission(id, parseFloat(editCommission));
            showToast.success('Commission rate updated!');
            setEditCommission(null);
            fetchAffiliates();
            if (selectedAffiliate?.id === id) viewDetail(id);
        } catch (error) {
            showToast.error('Failed to update commission');
        }
    };

    const viewDetail = async (id) => {
        try {
            setDetailLoading(true);
            setShowDetail(true);
            const res = await affiliateAPI.adminGetAffiliateDetail(id);
            setSelectedAffiliate(res.data);
        } catch (error) {
            showToast.error('Failed to fetch details');
        } finally {
            setDetailLoading(false);
        }
    };

    const statusColors = {
        pending: 'bg-yellow-50 text-yellow-600 border-yellow-200',
        active: 'bg-green-50 text-green-600 border-green-200',
        suspended: 'bg-red-50 text-red-600 border-red-200',
        rejected: 'bg-gray-100 text-gray-500 border-gray-200',
        inactive: 'bg-gray-100 text-gray-400 border-gray-200'
    };

    return (
        <DashboardLayout breadcrumbs={['Admin', 'Affiliate Management']}>
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 mb-1">Affiliate Management</h1>
                    <p className="text-gray-500 font-medium">Manage affiliate applications, commissions, and statuses</p>
                </div>
            </div>

            {/* Status Filters */}
            <div className="flex items-center gap-3 mb-6">
                {['', 'pending', 'active', 'suspended', 'rejected', 'inactive'].map(s => (
                    <button
                        key={s}
                        onClick={() => setStatusFilter(s)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${statusFilter === s
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                                : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
                            }`}
                    >
                        {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                ))}
            </div>

            {/* Affiliates Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center h-40">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
                    </div>
                ) : affiliates.length === 0 ? (
                    <div className="p-12 text-center">
                        <UsersIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p className="text-gray-500 font-bold">No affiliates found</p>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Affiliate</th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Tier</th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Commission</th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Referrals</th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Earnings</th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Joined</th>
                                <th className="text-center px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {affiliates.map(a => (
                                <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
                                                <span className="text-blue-600 font-black text-xs">{a.user?.firstName?.charAt(0) || '?'}</span>
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-900">{a.user?.firstName} {a.user?.lastName}</p>
                                                <p className="text-xs text-gray-400">{a.user?.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-lg text-xs font-bold border ${statusColors[a.status]}`}>
                                            {a.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600 capitalize font-medium">{a.tier || 'standard'}</td>
                                    <td className="px-6 py-4 text-sm font-bold text-gray-900">{a.commissionRate}%</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{a.totalReferrals || 0}</td>
                                    <td className="px-6 py-4 text-sm font-bold text-green-600">₹{parseFloat(a.totalEarnings || 0).toLocaleString()}</td>
                                    <td className="px-6 py-4 text-xs text-gray-400">
                                        {a.createdAt ? format(new Date(a.createdAt), 'MMM dd, yyyy') : '-'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => viewDetail(a.id)}
                                                className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                                                title="View Details"
                                            >
                                                <EyeIcon className="w-4 h-4" />
                                            </button>
                                            {a.status === 'pending' && (
                                                <>
                                                    <button
                                                        onClick={() => handleApprove(a.id)}
                                                        className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                                                        title="Approve"
                                                    >
                                                        <CheckCircleIcon className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleReject(a.id)}
                                                        className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                                                        title="Reject"
                                                    >
                                                        <XCircleIcon className="w-4 h-4" />
                                                    </button>
                                                </>
                                            )}
                                            {a.status === 'active' && (
                                                <button
                                                    onClick={() => handleStatusChange(a.id, 'suspended')}
                                                    className="px-3 py-1 rounded-lg text-xs font-bold bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                                                >
                                                    Suspend
                                                </button>
                                            )}
                                            {a.status === 'suspended' && (
                                                <button
                                                    onClick={() => handleStatusChange(a.id, 'active')}
                                                    className="px-3 py-1 rounded-lg text-xs font-bold bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                                                >
                                                    Reactivate
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Detail Modal */}
            {showDetail && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl p-8 w-full max-w-3xl max-h-[85vh] overflow-y-auto shadow-2xl">
                        {detailLoading ? (
                            <div className="flex items-center justify-center h-40">
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
                            </div>
                        ) : selectedAffiliate && (
                            <>
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h2 className="text-xl font-black text-gray-900">
                                            {selectedAffiliate.user?.firstName} {selectedAffiliate.user?.lastName}
                                        </h2>
                                        <p className="text-sm text-gray-400">{selectedAffiliate.user?.email}</p>
                                    </div>
                                    <button onClick={() => setShowDetail(false)} className="text-gray-400 hover:text-gray-600 text-2xl font-bold">&times;</button>
                                </div>

                                {/* Stats Grid */}
                                <div className="grid grid-cols-4 gap-4 mb-6">
                                    <div className="bg-gray-50 rounded-xl p-4">
                                        <p className="text-xs font-bold text-gray-400 uppercase">Status</p>
                                        <p className={`text-sm font-bold mt-1 capitalize ${selectedAffiliate.status === 'active' ? 'text-green-600' : selectedAffiliate.status === 'pending' ? 'text-yellow-600' : 'text-red-600'}`}>
                                            {selectedAffiliate.status}
                                        </p>
                                    </div>
                                    <div className="bg-gray-50 rounded-xl p-4">
                                        <p className="text-xs font-bold text-gray-400 uppercase">Tier</p>
                                        <p className="text-sm font-bold mt-1 text-gray-900 capitalize">{selectedAffiliate.tier || 'standard'}</p>
                                    </div>
                                    <div className="bg-gray-50 rounded-xl p-4">
                                        <p className="text-xs font-bold text-gray-400 uppercase">Referrals</p>
                                        <p className="text-sm font-bold mt-1 text-gray-900">{selectedAffiliate.totalReferrals || 0}</p>
                                    </div>
                                    <div className="bg-gray-50 rounded-xl p-4">
                                        <p className="text-xs font-bold text-gray-400 uppercase">Total Earned</p>
                                        <p className="text-sm font-bold mt-1 text-green-600">₹{parseFloat(selectedAffiliate.totalEarnings || 0).toLocaleString()}</p>
                                    </div>
                                </div>

                                {/* Commission Editor */}
                                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-bold text-gray-400 uppercase">Commission Rate</p>
                                            <p className="text-lg font-black text-gray-900">{selectedAffiliate.commissionRate}%</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="number"
                                                value={editCommission ?? ''}
                                                onChange={(e) => setEditCommission(e.target.value)}
                                                placeholder="New rate"
                                                className="w-24 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                            <button
                                                onClick={() => handleCommissionUpdate(selectedAffiliate.id)}
                                                disabled={!editCommission}
                                                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 disabled:opacity-50"
                                            >
                                                Update
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Application Note */}
                                {selectedAffiliate.applicationNote && (
                                    <div className="bg-blue-50 rounded-xl p-4 mb-6">
                                        <p className="text-xs font-bold text-blue-600 uppercase mb-1">Application Note</p>
                                        <p className="text-sm text-gray-700">{selectedAffiliate.applicationNote}</p>
                                    </div>
                                )}

                                {/* Recent Referrals */}
                                {selectedAffiliate.referrals?.length > 0 && (
                                    <div className="mb-6">
                                        <h3 className="text-sm font-black text-gray-900 mb-3">Recent Referrals</h3>
                                        <div className="space-y-2">
                                            {selectedAffiliate.referrals.slice(0, 5).map(r => (
                                                <div key={r.id} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                                                    <div>
                                                        <p className="text-sm font-bold text-gray-900">
                                                            {r.referredUser ? `${r.referredUser.firstName} ${r.referredUser.lastName}` : 'Anonymous'}
                                                        </p>
                                                        <p className="text-xs text-gray-400">{r.referredUser?.email}</p>
                                                    </div>
                                                    <span className={`px-2 py-1 rounded text-xs font-bold ${r.status === 'converted' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'
                                                        }`}>
                                                        {r.status}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Recent Commissions */}
                                {selectedAffiliate.commissions?.length > 0 && (
                                    <div>
                                        <h3 className="text-sm font-black text-gray-900 mb-3">Recent Commissions</h3>
                                        <div className="space-y-2">
                                            {selectedAffiliate.commissions.slice(0, 5).map(c => (
                                                <div key={c.id} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                                                    <div>
                                                        <p className="text-sm font-bold text-gray-900">₹{parseFloat(c.amount).toFixed(2)}</p>
                                                        <p className="text-xs text-gray-400">{c.createdAt ? format(new Date(c.createdAt), 'MMM dd, yyyy') : '-'}</p>
                                                    </div>
                                                    <span className={`px-2 py-1 rounded text-xs font-bold ${c.status === 'paid' ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'
                                                        }`}>
                                                        {c.status}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default AffiliateManagement;
