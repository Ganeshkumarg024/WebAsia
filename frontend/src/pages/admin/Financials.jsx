import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import useAdminStore from '../../store/adminStore';
import {
    BanknotesIcon,
    ArrowUpIcon,
    ArrowDownIcon,
    DocumentTextIcon,
    ClockIcon,
    CurrencyDollarIcon,
    FunnelIcon,
    ArrowDownTrayIcon,
    EllipsisVerticalIcon,
    CreditCardIcon,
    ReceiptPercentIcon,
    PlusIcon
} from '@heroicons/react/24/outline';

const Financials = () => {
    const { financialStats, transactions, refundQueue, loading, fetchFinancialStats, fetchTransactions, fetchRefundRequests, handleRefund } = useAdminStore();
    const [period, setPeriod] = useState('30d');

    useEffect(() => {
        fetchFinancialStats(period);
        fetchTransactions();
        fetchRefundRequests();
    }, [period]);

    return (
        <DashboardLayout breadcrumbs={['Admin', 'Financials']}>
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Financials & Revenue Control</h1>
                <div className="flex items-center gap-4">
                    <div className="flex bg-gray-100 dark:bg-slate-800 p-1 rounded-xl">
                        <button
                            onClick={() => setPeriod('realtime')}
                            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${period === 'realtime' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600' : 'text-gray-500'}`}
                        >
                            Real-time
                        </button>
                        <button
                            onClick={() => setPeriod('30d')}
                            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${period === '30d' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600' : 'text-gray-500'}`}
                        >
                            Last 30 Days
                        </button>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all">
                        <DocumentTextIcon className="w-5 h-5" />
                        Generate Invoice
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
                    <p className="text-gray-500 dark:text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-4">Monthly Recurring Revenue</p>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-3xl font-bold text-gray-900 dark:text-white">${financialStats.mrr?.toLocaleString()}</h3>
                        <span className="text-green-600 text-xs font-bold flex items-center">
                            <ArrowUpIcon className="w-3 h-3" />
                            8.4%
                        </span>
                    </div>
                    <div className="mt-6 flex items-end gap-1.5 h-16">
                        {[0.5, 0.7, 0.5, 0.8, 0.6, 0.9, 1].map((h, i) => (
                            <div key={i} className={`${i === 6 ? 'bg-blue-600' : 'bg-blue-600/20'} w-full rounded-t-sm`} style={{ height: `${h * 100}%` }}></div>
                        ))}
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
                    <p className="text-gray-500 dark:text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-4">Churn Rate</p>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{financialStats.churnRate}%</h3>
                        <span className="text-red-500 text-xs font-bold flex items-center">
                            <ArrowUpIcon className="w-3 h-3" />
                            0.3%
                        </span>
                    </div>
                    <p className="text-[11px] text-gray-500 mt-4">Target: &lt; 2.0%</p>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
                    <p className="text-gray-500 dark:text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-4">ARR (Annual Run Rate)</p>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-3xl font-bold text-gray-900 dark:text-white">${(financialStats.mrr * 12)?.toLocaleString()}</h3>
                        <span className="text-green-600 text-xs font-bold flex items-center">
                            <ArrowUpIcon className="w-3 h-3" />
                            $12k
                        </span>
                    </div>
                    <p className="text-[11px] text-gray-500 mt-4">Projected yearly revenue</p>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
                    <p className="text-gray-500 dark:text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-4">Total Refunds</p>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-3xl font-bold text-gray-900 dark:text-white">$3,120</h3>
                        <span className="text-gray-500 text-xs font-bold">14 cases</span>
                    </div>
                    <button className="w-full mt-6 py-2.5 text-xs font-bold border border-gray-100 dark:border-slate-700 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition-all">Manage Cases</button>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="xl:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <ClockIcon className="w-5 h-5 text-blue-600" />
                            Transaction Log
                        </h2>
                        <div className="flex gap-2">
                            <button className="px-4 py-2 text-xs font-bold border border-gray-100 dark:border-slate-800 rounded-xl flex items-center gap-2 bg-white dark:bg-slate-900 hover:bg-gray-50 transition-all">
                                <FunnelIcon className="w-4 h-4" /> Filter
                            </button>
                            <button className="px-4 py-2 text-xs font-bold border border-gray-100 dark:border-slate-800 rounded-xl flex items-center gap-2 bg-white dark:bg-slate-900 hover:bg-gray-50 transition-all">
                                <ArrowDownTrayIcon className="w-4 h-4" /> Export
                            </button>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-slate-800">
                                    <tr>
                                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Transaction ID</th>
                                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Client</th>
                                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Plan</th>
                                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Amount</th>
                                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Status</th>
                                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
                                    {loading ? (
                                        Array(5).fill(0).map((_, i) => (
                                            <tr key={i} className="animate-pulse">
                                                <td colSpan="6" className="px-6 py-4 h-16 bg-gray-50/50 dark:bg-slate-800/20"></td>
                                            </tr>
                                        ))
                                    ) : transactions.length > 0 ? (
                                        transactions.map((tx) => (
                                            <tr key={tx.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/20 transition-colors">
                                                <td className="px-6 py-4 font-mono text-xs text-gray-500">#{tx.id.slice(0, 8).toUpperCase()}</td>
                                                <td className="px-6 py-4">
                                                    <p className="text-sm font-bold text-gray-900 dark:text-white">{tx.user?.firstName} {tx.user?.lastName}</p>
                                                    <p className="text-[10px] text-gray-500">
                                                        {new Date(tx.createdAt).toLocaleDateString()}
                                                    </p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="px-2 py-1 text-[10px] font-bold bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded uppercase">
                                                        {tx.subscription?.plan?.name || 'Scale Plan'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-white">${tx.amount?.toLocaleString()}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`flex items-center gap-1.5 text-xs font-medium ${tx.status === 'completed' ? 'text-green-600' : 'text-red-600'}`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${tx.status === 'completed' ? 'bg-green-600' : 'bg-red-600'}`}></span>
                                                        {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-all">
                                                        <EllipsisVerticalIcon className="w-5 h-5" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-12 text-center text-gray-500">No transactions recorded.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Tax & Invoice Systems</h2>
                        <div className="space-y-4">
                            <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600">
                                            <CreditCardIcon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900 dark:text-white">Stripe International</p>
                                            <p className="text-[10px] text-gray-500">Global Payments Gateway</p>
                                        </div>
                                    </div>
                                    <span className="px-2 py-0.5 text-[10px] font-bold bg-green-100 text-green-600 rounded">LIVE</span>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <button className="py-2 text-[10px] font-bold border border-gray-100 dark:border-slate-800 rounded-xl hover:bg-gray-50 transition-all">API Config</button>
                                    <button className="py-2 text-[10px] font-bold border border-gray-100 dark:border-slate-800 rounded-xl hover:bg-gray-50 transition-all">Logs</button>
                                </div>
                            </div>

                            <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600">
                                            <ReceiptPercentIcon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900 dark:text-white">India GST System</p>
                                            <p className="text-[10px] text-gray-500">HSN/SAC Compliance</p>
                                        </div>
                                    </div>
                                    <span className="px-2 py-0.5 text-[10px] font-bold bg-green-100 text-green-600 rounded">ACTIVE</span>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between text-[11px] p-3 bg-gray-50 dark:bg-slate-800 rounded-xl">
                                        <span className="text-gray-500">GST Default Rate:</span>
                                        <span className="font-bold text-gray-900 dark:text-white">18%</span>
                                    </div>
                                    <button className="w-full py-2 text-[10px] font-bold border border-gray-100 dark:border-slate-800 rounded-xl hover:bg-gray-50 transition-all">Manage Regional Rules</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Quick Tools</h2>
                        <div className="bg-blue-600/5 dark:bg-blue-600/10 rounded-2xl border border-blue-600/10 p-6">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                                    <PlusIcon className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white">B2B Manual Generator</p>
                                    <p className="text-[11px] text-gray-500">For custom deals & wire transfers</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <input
                                    className="w-full text-xs px-4 py-3 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                                    placeholder="Client Name / ID"
                                    type="text"
                                />
                                <input
                                    className="w-full text-xs px-4 py-3 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                                    placeholder="Amount ($)"
                                    type="number"
                                />
                                <button className="w-full py-3 bg-blue-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-500/10 hover:bg-blue-700 transition-all">
                                    Create Custom Invoice
                                </button>
                            </div>
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Refund Queue</h2>
                            <span className="px-2 py-0.5 text-[10px] font-bold bg-red-100 text-red-600 rounded-full">{refundQueue.length} Urgent</span>
                        </div>
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 overflow-hidden shadow-sm">
                            {refundQueue.length > 0 ? (
                                refundQueue.map((refund) => (
                                    <div key={refund.id} className="p-6 border-b border-gray-50 dark:border-slate-800">
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <p className="text-xs font-bold text-gray-900 dark:text-white">{refund.user?.firstName} {refund.user?.lastName}</p>
                                                <p className="text-[10px] text-red-500 font-medium">Dispute: Design Quality</p>
                                            </div>
                                            <p className="text-xs font-bold text-gray-900 dark:text-white">${refund.amount?.toLocaleString()}</p>
                                        </div>
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => handleRefund(refund.id, { action: 'reject', reason: 'Policy violation' })}
                                                className="flex-1 py-2 bg-red-50 dark:bg-red-900/10 text-red-600 text-[10px] font-bold rounded-lg hover:bg-red-100 transition-all"
                                            >
                                                Reject
                                            </button>
                                            <button
                                                onClick={() => handleRefund(refund.id, { action: 'approve', reason: 'Customer satisfaction' })}
                                                className="flex-1 py-2 bg-green-50 dark:bg-green-900/10 text-green-600 text-[10px] font-bold rounded-lg hover:bg-green-100 transition-all"
                                            >
                                                Approve
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-6 text-center text-gray-500 text-xs italic">
                                    Queue is empty.
                                </div>
                            )}
                            <div className="p-4 bg-gray-50/50 dark:bg-slate-900/50 text-center">
                                <button className="text-[10px] font-bold text-blue-600 hover:underline">View All Refund Requests</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Financials;
