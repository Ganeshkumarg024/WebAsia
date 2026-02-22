import { useEffect, useState } from 'react';
import { CheckCircleIcon, XCircleIcon, CurrencyDollarIcon, DocumentDuplicateIcon, XMarkIcon } from '@heroicons/react/24/outline';
import affiliateAPI from '../../api/affiliate';
import DataTable from '../../components/shared/DataTable';
import showToast from '../../components/shared/Toast';
import { format } from 'date-fns';
import DashboardLayout from '../../components/layout/DashboardLayout';

const AffiliatePayouts = () => {
    const [payouts, setPayouts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPayout, setSelectedPayout] = useState(null);

    useEffect(() => {
        fetchPayouts();
    }, []);

    const fetchPayouts = async () => {
        try {
            setLoading(true);
            const response = await affiliateAPI.adminGetPayouts();
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
            await affiliateAPI.adminApprovePayout(id);
            showToast.success('Payout approved');
            fetchPayouts();
        } catch (error) {
            showToast.error('Failed to approve payout');
        }
    };

    const handleMarkPaid = async (id) => {
        try {
            await affiliateAPI.adminMarkPayoutPaid(id);
            showToast.success('Payout marked as paid');
            fetchPayouts();
            setSelectedPayout(null);
        } catch (error) {
            showToast.error('Failed to mark as paid');
        }
    };

    const copyToClipboard = (text, label) => {
        navigator.clipboard.writeText(text);
        showToast.success(`${label} copied to clipboard`);
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
            key: 'transferInfo',
            label: 'TRANSFER DETAILS',
            render: (val, row) => {
                const details = row.payoutDetails || {};
                const method = row.payoutMethod?.toLowerCase();

                return (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPayout(row);
                        }}
                        className="text-left hover:bg-white/5 p-2 rounded-lg transition-colors border border-transparent hover:border-white/10 group w-full"
                    >
                        {method === 'upi' ? (
                            <div className="text-xs">
                                <p className="text-blue-400 font-bold uppercase mb-1 flex items-center gap-1">
                                    UPI <span className="opacity-0 group-hover:opacity-100 text-[10px] bg-blue-500/20 px-1 rounded transition-opacity">VIEW</span>
                                </p>
                                <p className="text-white font-mono truncate max-w-[120px]">{details.upiId || 'N/A'}</p>
                            </div>
                        ) : method === 'bank_transfer' ? (
                            <div className="text-xs space-y-0.5">
                                <p className="text-green-400 font-bold uppercase mb-1 flex items-center gap-1">
                                    Bank <span className="opacity-0 group-hover:opacity-100 text-[10px] bg-green-500/20 px-1 rounded transition-opacity">VIEW</span>
                                </p>
                                <p className="text-white font-mono truncate max-w-[120px]">{details.accountNumber}</p>
                                <p className="text-gray-400 truncate max-w-[120px]">{details.bankName || 'A/C Details'}</p>
                            </div>
                        ) : method === 'paypal' ? (
                            <div className="text-xs">
                                <p className="text-indigo-400 font-bold uppercase mb-1 flex items-center gap-1">
                                    PayPal <span className="opacity-0 group-hover:opacity-100 text-[10px] bg-indigo-500/20 px-1 rounded transition-opacity">VIEW</span>
                                </p>
                                <p className="text-white font-mono truncate max-w-[120px]">{details.paypalEmail || 'N/A'}</p>
                            </div>
                        ) : (
                            <span className="text-gray-500">-</span>
                        )}
                    </button>
                );
            }
        },
        {
            key: 'status',
            label: 'STATUS',
            render: (val) => (
                <span
                    className={`px-2 py-1 rounded text-xs font-medium ${val === 'approved'
                        ? 'bg-green-500/10 text-green-500'
                        : val === 'requested'
                            ? 'bg-yellow-500/10 text-yellow-500'
                            : val === 'paid'
                                ? 'bg-blue-500/10 text-blue-500'
                                : 'bg-red-500/10 text-red-500'
                        }`}
                >
                    {val === 'requested' ? 'pending' : val}
                </span>
            ),
        },
        {
            key: 'actions',
            label: 'ACTIONS',
            sortable: false,
            render: (val, row) => (
                <div className="flex items-center gap-2">
                    {row.status === 'requested' && (
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
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleMarkPaid(row.id);
                            }}
                            className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm"
                        >
                            Mark as Paid
                        </button>
                    )}
                </div>
            ),
        },
    ];

    const stats = {
        pending: payouts.filter(p => p.status === 'requested').reduce((sum, p) => sum + (p.amount || 0), 0),
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
                        {payouts.filter(p => p.status === 'requested').length} requests pending
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

            {/* Payout Detail Modal */}
            {selectedPayout && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
                    <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        {/* Header */}
                        <div className="bg-gray-900 p-6 flex justify-between items-center text-white">
                            <div>
                                <h3 className="text-xl font-black">Payout Details</h3>
                                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">ID: {selectedPayout.id}</p>
                            </div>
                            <button
                                onClick={() => setSelectedPayout(null)}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                            >
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-8 space-y-8">
                            {/* Affiliate Info */}
                            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-xl">
                                    {selectedPayout.affiliateName[0]}
                                </div>
                                <div>
                                    <p className="text-gray-900 font-black">{selectedPayout.affiliateName}</p>
                                    <p className="text-gray-500 font-medium text-sm">{selectedPayout.affiliateEmail}</p>
                                </div>
                                <div className="ml-auto text-right">
                                    <p className="text-xs text-gray-400 font-bold uppercase">Amount</p>
                                    <p className="text-2xl font-black text-gray-900">${selectedPayout.amount.toFixed(2)}</p>
                                </div>
                            </div>

                            {/* Transfer Info */}
                            <div>
                                <h4 className="text-sm font-black text-gray-400 uppercase tracking-wider mb-4">Transfer Information ({selectedPayout.payoutMethod?.replace('_', ' ')})</h4>
                                <div className="grid grid-cols-1 gap-4">
                                    {selectedPayout.payoutMethod?.toLowerCase() === 'upi' && (
                                        <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex justify-between items-center group">
                                            <div>
                                                <p className="text-[10px] font-black text-blue-400 uppercase mb-1 tracking-widest">UPI ID</p>
                                                <p className="text-lg font-black text-gray-900 font-mono tracking-tight">{selectedPayout.payoutDetails?.upiId || 'N/A'}</p>
                                            </div>
                                            {selectedPayout.payoutDetails?.upiId && (
                                                <button
                                                    onClick={() => copyToClipboard(selectedPayout.payoutDetails.upiId, 'UPI ID')}
                                                    className="p-3 bg-white text-blue-600 rounded-xl shadow-sm hover:shadow-md transition-all active:scale-95 group-hover:bg-blue-600 group-hover:text-white"
                                                >
                                                    <DocumentDuplicateIcon className="w-5 h-5" />
                                                </button>
                                            )}
                                        </div>
                                    )}

                                    {selectedPayout.payoutMethod?.toLowerCase() === 'bank_transfer' && (
                                        <div className="space-y-3">
                                            {[
                                                { label: 'Bank Name', value: selectedPayout.payoutDetails?.bankName, copyable: false },
                                                { label: 'Account Holder', value: selectedPayout.payoutDetails?.accountName, copyable: true },
                                                { label: 'Account Number', value: selectedPayout.payoutDetails?.accountNumber, copyable: true, font: 'mono' },
                                                { label: 'IFSC Code', value: selectedPayout.payoutDetails?.ifscCode, copyable: true, font: 'mono' }
                                            ].map((item, idx) => (
                                                <div key={idx} className="p-4 bg-gray-50 border border-gray-100 rounded-2xl flex justify-between items-center group">
                                                    <div>
                                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{item.label}</p>
                                                        <p className={`font-bold text-gray-900 flex items-center gap-2 ${item.font === 'mono' ? 'font-mono uppercase tracking-tighter text-lg' : ''}`}>
                                                            {item.value || 'N/A'}
                                                        </p>
                                                    </div>
                                                    {item.copyable && item.value && (
                                                        <button
                                                            onClick={() => copyToClipboard(item.value, item.label)}
                                                            className="p-2.5 bg-white text-gray-400 rounded-xl shadow-sm border border-gray-100 hover:text-blue-600 hover:border-blue-200 transition-all opacity-0 group-hover:opacity-100"
                                                        >
                                                            <DocumentDuplicateIcon className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {selectedPayout.payoutMethod?.toLowerCase() === 'paypal' && (
                                        <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl flex justify-between items-center group">
                                            <div>
                                                <p className="text-[10px] font-black text-indigo-400 uppercase mb-1 tracking-widest">PayPal Email</p>
                                                <p className="text-lg font-black text-gray-900 font-mono tracking-tight">{selectedPayout.payoutDetails?.paypalEmail || 'N/A'}</p>
                                            </div>
                                            {selectedPayout.payoutDetails?.paypalEmail && (
                                                <button
                                                    onClick={() => copyToClipboard(selectedPayout.payoutDetails.paypalEmail, 'PayPal Email')}
                                                    className="p-3 bg-white text-indigo-600 rounded-xl shadow-sm hover:shadow-md transition-all active:scale-95 group-hover:bg-indigo-600 group-hover:text-white"
                                                >
                                                    <DocumentDuplicateIcon className="w-5 h-5" />
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Actions In Modal */}
                            <div className="flex gap-4 pt-4 border-t border-gray-100">
                                {selectedPayout.status === 'requested' && (
                                    <button
                                        onClick={() => handleApprovePayout(selectedPayout.id)}
                                        className="flex-1 py-4 bg-green-500 hover:bg-green-600 text-white rounded-2xl font-black transition-all shadow-lg shadow-green-500/20"
                                    >
                                        Approve Payout
                                    </button>
                                )}
                                {selectedPayout.status === 'approved' && (
                                    <button
                                        onClick={() => handleMarkPaid(selectedPayout.id)}
                                        className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black transition-all shadow-lg shadow-blue-600/20"
                                    >
                                        Mark as Paid
                                    </button>
                                )}
                                <button
                                    onClick={() => setSelectedPayout(null)}
                                    className="px-8 py-4 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-2xl font-bold transition-all"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default AffiliatePayouts;
