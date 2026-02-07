import { useEffect, useState } from 'react';
import { CheckCircleIcon, XCircleIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import affiliateAPI from '../../api/affiliate';
import DataTable from '../../components/shared/DataTable';
import showToast from '../../components/shared/Toast';
import { format } from 'date-fns';
import DashboardLayout from '../../components/layout/DashboardLayout';

const AffiliatePayouts = () => {
    const [payouts, setPayouts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPayouts();
    }, []);

    const fetchPayouts = async () => {
        try {
            setLoading(true);
            const response = await affiliateAPI.getPayouts();
            setPayouts(response.data || []);
        } catch (error) {
            console.error('Failed to fetch payouts:', error);
            showToast.error('Failed to load payouts');
        } finally {
            setLoading(false);
        }
    };

    const handleApprovePayout = async (id) => {
        try {
            await affiliateAPI.approvePayout(id);
            showToast.success('Payout approved');
            fetchPayouts();
        } catch (error) {
            showToast.error('Failed to approve payout');
        }
    };

    const columns = [
        {
            key: 'affiliate',
            label: 'AFFILIATE',
            render: (val, row) => (
                <div>
                    <p className="text-white font-medium">{row.affiliateName}</p>
                    <p className="text-xs text-gray-400">{row.affiliateEmail}</p>
                </div>
            ),
        },
        {
            key: 'amount',
            label: 'AMOUNT',
            render: (val) => (
                <span className="text-white font-medium text-lg">${val?.toFixed(2) || '0.00'}</span>
            ),
        },
        {
            key: 'referrals',
            label: 'REFERRALS',
            render: (val) => <span className="text-white">{val || 0}</span>,
        },
        {
            key: 'requestDate',
            label: 'REQUEST DATE',
            render: (val) => (
                <span className="text-sm text-white">
                    {val ? format(new Date(val), 'MMM dd, yyyy') : 'N/A'}
                </span>
            ),
        },
        {
            key: 'status',
            label: 'STATUS',
            render: (val) => (
                <span
                    className={`px-2 py-1 rounded text-xs font-medium ${val === 'approved'
                        ? 'bg-green-500/10 text-green-500'
                        : val === 'pending'
                            ? 'bg-yellow-500/10 text-yellow-500'
                            : val === 'paid'
                                ? 'bg-blue-500/10 text-blue-500'
                                : 'bg-red-500/10 text-red-500'
                        }`}
                >
                    {val}
                </span>
            ),
        },
        {
            key: 'actions',
            label: 'ACTIONS',
            sortable: false,
            render: (val, row) => (
                <div className="flex items-center gap-2">
                    {row.status === 'pending' && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleApprovePayout(row.id);
                            }}
                            className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-sm flex items-center gap-1"
                        >
                            <CheckCircleIcon className="w-4 h-4" />
                            Approve
                        </button>
                    )}
                    {row.status === 'approved' && (
                        <button className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm">
                            Mark as Paid
                        </button>
                    )}
                </div>
            ),
        },
    ];

    const stats = {
        pending: payouts.filter(p => p.status === 'pending').reduce((sum, p) => sum + (p.amount || 0), 0),
        approved: payouts.filter(p => p.status === 'approved').reduce((sum, p) => sum + (p.amount || 0), 0),
        paid: payouts.filter(p => p.status === 'paid').reduce((sum, p) => sum + (p.amount || 0), 0),
    };

    return (
        <DashboardLayout breadcrumbs={['Admin', 'Payouts']}>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Affiliate Payout Management</h1>
                <p className="text-gray-500">Review and process affiliate commission payouts</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-400 font-medium uppercase tracking-wider">Pending Payouts</p>
                        <CurrencyDollarIcon className="w-6 h-6 text-yellow-500" />
                    </div>
                    <p className="text-3xl font-black text-gray-900">${stats.pending.toFixed(2)}</p>
                    <p className="text-xs text-yellow-600 font-bold bg-yellow-50 px-2 py-1 rounded w-fit mt-2">
                        {payouts.filter(p => p.status === 'pending').length} requests pending
                    </p>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-400 font-medium uppercase tracking-wider">Approved</p>
                        <CheckCircleIcon className="w-6 h-6 text-green-500" />
                    </div>
                    <p className="text-3xl font-black text-gray-900">${stats.approved.toFixed(2)}</p>
                    <p className="text-xs text-green-600 font-bold bg-green-50 px-2 py-1 rounded w-fit mt-2">
                        {payouts.filter(p => p.status === 'approved').length} ready to pay
                    </p>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-400 font-medium uppercase tracking-wider">Paid This Month</p>
                        <CurrencyDollarIcon className="w-6 h-6 text-blue-500" />
                    </div>
                    <p className="text-3xl font-black text-gray-900">${stats.paid.toFixed(2)}</p>
                    <p className="text-xs text-blue-600 font-bold bg-blue-50 px-2 py-1 rounded w-fit mt-2">
                        {payouts.filter(p => p.status === 'paid').length} completed
                    </p>
                </div>
            </div>

            {/* Payouts Table */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                <DataTable
                    columns={columns.map(col => ({
                        ...col,
                        render: (val, row) => {
                            if (col.key === 'affiliate') {
                                return (
                                    <div>
                                        <p className="text-gray-900 font-bold">{row.affiliateName}</p>
                                        <p className="text-xs text-gray-500">{row.affiliateEmail}</p>
                                    </div>
                                );
                            }
                            if (col.key === 'amount') {
                                return <span className="text-gray-900 font-bold text-lg">${val?.toFixed(2) || '0.00'}</span>;
                            }
                            if (col.key === 'referrals') {
                                return <span className="text-gray-700 font-medium">{val || 0}</span>;
                            }
                            if (col.key === 'requestDate') {
                                return <span className="text-sm text-gray-500">{val ? format(new Date(val), 'MMM dd, yyyy') : 'N/A'}</span>;
                            }
                            return col.render ? col.render(val, row) : val;
                        }
                    }))}
                    data={payouts}
                    loading={loading}
                    emptyMessage="No payout requests found"
                />
            </div>
        </DashboardLayout>
    );
};

export default AffiliatePayouts;
