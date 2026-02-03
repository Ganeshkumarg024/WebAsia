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
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Financials & Revenue Control</h1>
                    <p className="text-gray-500 font-medium mt-1">Real-time revenue tracking and invoice management</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex bg-gray-100 p-1 rounded-2xl">
                        <button
                            onClick={() => setPeriod('realtime')}
                            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${period === 'realtime' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            Real-time
                        </button>
                        <button
                            onClick={() => setPeriod('30d')}
                            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${period === '30d' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            Last 30 Days
                        </button>
                    </div>
                    <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl text-sm font-bold hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-1">
                        <DocumentTextIcon className="w-5 h-5" />
                        Generate Invoice
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
                    <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-4">Monthly Recurring Revenue</p>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-3xl font-black text-gray-900">${financialStats.mrr?.toLocaleString()}</h3>
                        <span className="text-green-600 text-xs font-bold flex items-center bg-green-50 px-2 py-1 rounded-lg">
                            <ArrowUpIcon className="w-3 h-3 mr-1" />
                            8.4%
                        </span>
                    </div>
                    <div className="mt-6 flex items-end gap-1.5 h-16">
                        {[0.5, 0.7, 0.5, 0.8, 0.6, 0.9, 1].map((h, i) => (
                            <div key={i} className={`${i === 6 ? 'bg-blue-600' : 'bg-blue-100'} w-full rounded-t-sm`} style={{ height: `${h * 100}%` }}></div>
                        ))}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
                    <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-4">Churn Rate</p>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-3xl font-black text-gray-900">{financialStats.churnRate}%</h3>
                        <span className="text-red-500 text-xs font-bold flex items-center bg-red-50 px-2 py-1 rounded-lg">
                            <ArrowUpIcon className="w-3 h-3 mr-1" />
                            0.3%
                        </span>
                    </div>
                    <p className="text-[11px] text-gray-400 font-bold mt-4">Target: &lt; 2.0%</p>
                </div>

                <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
                    <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-4">ARR (Annual Run Rate)</p>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-3xl font-black text-gray-900">${(financialStats.mrr * 12)?.toLocaleString()}</h3>
                        <span className="text-green-600 text-xs font-bold flex items-center bg-green-50 px-2 py-1 rounded-lg">
                            <ArrowUpIcon className="w-3 h-3 mr-1" />
                            $12k
                        </span>
                    </div>
                    <p className="text-[11px] text-gray-400 font-bold mt-4">Projected yearly revenue</p>
                </div>

                <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
                    <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-4">Total Refunds</p>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-3xl font-black text-gray-900">$3,120</h3>
                        <span className="text-gray-500 text-xs font-bold bg-gray-50 px-2 py-1 rounded-lg">14 cases</span>
                    </div>
                    <button className="w-full mt-6 py-3 text-xs font-bold border-2 border-gray-100 text-gray-600 rounded-xl hover:bg-gray-50 hover:text-gray-900 transition-all">Manage Cases</button>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="xl:col-span-2 space-y-8">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-black text-gray-900 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                                <ClockIcon className="w-6 h-6" />
                            </div>
                            Transaction Log
                        </h2>
                        <div className="flex gap-3">
                            <button className="px-4 py-2 text-xs font-bold border border-gray-200 rounded-xl flex items-center gap-2 bg-white hover:bg-gray-50 transition-all text-gray-600">
                                <FunnelIcon className="w-4 h-4" /> Filter
                            </button>
                            <button className="px-4 py-2 text-xs font-bold border border-gray-200 rounded-xl flex items-center gap-2 bg-white hover:bg-gray-50 transition-all text-gray-600">
                                <ArrowDownTrayIcon className="w-4 h-4" /> Export
                            </button>
                        </div>
                    </div>

                    <div className="bg-white rounded-[32px] border border-gray-100 overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-100 bg-gray-50/50">
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Transaction ID</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Client</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Plan</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Amount</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {loading ? (
                                        Array(5).fill(0).map((_, i) => (
                                            <tr key={i} className="animate-pulse">
                                                <td colSpan="6" className="px-8 py-6 h-16 bg-gray-50/50"></td>
                                            </tr>
                                        ))
                                    ) : transactions.length > 0 ? (
                                        transactions.map((tx) => (
                                            <tr key={tx.id} className="hover:bg-blue-50/30 transition-colors group">
                                                <td className="px-8 py-5 font-mono text-xs text-gray-500 font-bold">#{tx.id.slice(0, 8).toUpperCase()}</td>
                                                <td className="px-8 py-5">
                                                    <p className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{tx.user?.firstName} {tx.user?.lastName}</p>
                                                    <p className="text-[10px] text-gray-400 font-medium">
                                                        {new Date(tx.createdAt).toLocaleDateString()}
                                                    </p>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <span className="px-3 py-1 text-[10px] font-bold bg-blue-50 text-blue-600 rounded-lg uppercase tracking-wider border border-blue-100">
                                                        {tx.subscription?.plan?.name || 'Scale Plan'}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-5 text-sm font-black text-gray-900">${tx.amount?.toLocaleString()}</td>
                                                <td className="px-8 py-5">
                                                    <span className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full w-fit ${tx.status === 'completed' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${tx.status === 'completed' ? 'bg-green-600' : 'bg-red-600'}`}></span>
                                                        {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-5 text-right">
                                                    <button className="p-2 rounded-xl text-gray-400 hover:bg-white hover:text-blue-600 hover:shadow-md transition-all">
                                                        <EllipsisVerticalIcon className="w-5 h-5" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="px-8 py-20 text-center text-gray-500 font-medium">No transactions recorded.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    <div>
                        <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                                <BanknotesIcon className="w-6 h-6" />
                            </div>
                            Tax & Systems
                        </h2>
                        <div className="space-y-4">
                            <div className="p-6 bg-white rounded-[32px] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                                            <CreditCardIcon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">Stripe International</p>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Global Payments</p>
                                        </div>
                                    </div>
                                    <span className="px-2 py-1 text-[10px] font-black bg-green-50 text-green-600 rounded-lg border border-green-100">LIVE</span>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <button className="py-2.5 text-[10px] font-bold border-2 border-gray-100 rounded-xl hover:bg-gray-50 hover:text-gray-900 text-gray-500 transition-all">API Config</button>
                                    <button className="py-2.5 text-[10px] font-bold border-2 border-gray-100 rounded-xl hover:bg-gray-50 hover:text-gray-900 text-gray-500 transition-all">View Logs</button>
                                </div>
                            </div>

                            <div className="p-6 bg-white rounded-[32px] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600">
                                            <ReceiptPercentIcon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">India GST System</p>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">HSN/SAC Compliance</p>
                                        </div>
                                    </div>
                                    <span className="px-2 py-1 text-[10px] font-black bg-green-50 text-green-600 rounded-lg border border-green-100">ACTIVE</span>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between text-[11px] p-3 bg-gray-50 rounded-xl font-bold">
                                        <span className="text-gray-500">GST Default Rate:</span>
                                        <span className="text-gray-900">18%</span>
                                    </div>
                                    <button className="w-full py-2.5 text-[10px] font-bold border-2 border-gray-100 rounded-xl hover:bg-gray-50 hover:text-gray-900 text-gray-500 transition-all">Manage Rules</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h2 className="text-xl font-black text-gray-900 mb-6">Quick Tools</h2>
                        <div className="bg-blue-600 rounded-[32px] p-6 text-white shadow-xl shadow-blue-600/20 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 group-hover:scale-110 transition-transform"></div>

                            <div className="flex items-center gap-4 mb-6 relative z-10">
                                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-white backdrop-blur-sm">
                                    <PlusIcon className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-sm font-black">B2B Manual Generator</p>
                                    <p className="text-[11px] text-blue-100 font-medium">For custom deals</p>
                                </div>
                            </div>
                            <div className="space-y-4 relative z-10">
                                <input
                                    className="w-full text-xs px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:bg-white focus:text-gray-900 placeholder-blue-200 focus:placeholder-gray-400 outline-none transition-all font-bold"
                                    placeholder="Client Name / ID"
                                    type="text"
                                />
                                <input
                                    className="w-full text-xs px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:bg-white focus:text-gray-900 placeholder-blue-200 focus:placeholder-gray-400 outline-none transition-all font-bold"
                                    placeholder="Amount ($)"
                                    type="number"
                                />
                                <button className="w-full py-3 bg-white text-blue-600 text-xs font-black rounded-xl hover:bg-blue-50 transition-all shadow-sm">
                                    Create Invoice
                                </button>
                            </div>
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-black text-gray-900">Refund Queue</h2>
                            <span className="px-3 py-1 text-[10px] font-black bg-red-50 text-red-600 rounded-full border border-red-100">{refundQueue.length} Urgent</span>
                        </div>
                        <div className="bg-white rounded-[32px] border border-gray-100 overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
                            {refundQueue.length > 0 ? (
                                refundQueue.map((refund) => (
                                    <div key={refund.id} className="p-6 border-b border-gray-50 hover:bg-red-50/10 transition-colors">
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <p className="text-xs font-black text-gray-900 uppercase tracking-wide">{refund.user?.firstName} {refund.user?.lastName}</p>
                                                <p className="text-[10px] text-red-500 font-bold mt-1">Dispute: Quality</p>
                                            </div>
                                            <p className="text-sm font-black text-gray-900">${refund.amount?.toLocaleString()}</p>
                                        </div>
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => handleRefund(refund.id, { action: 'reject', reason: 'Policy violation' })}
                                                className="flex-1 py-2 bg-white border-2 border-gray-100 text-gray-600 text-[10px] font-black rounded-xl hover:bg-gray-50 hover:text-gray-900 transition-all uppercase tracking-wider"
                                            >
                                                Reject
                                            </button>
                                            <button
                                                onClick={() => handleRefund(refund.id, { action: 'approve', reason: 'Customer satisfaction' })}
                                                className="flex-1 py-2 bg-green-600 text-white text-[10px] font-black rounded-xl hover:bg-green-700 transition-all shadow-lg shadow-green-600/20 uppercase tracking-wider"
                                            >
                                                Approve
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-8 text-center text-gray-400 text-xs font-bold">
                                    Queue is empty.
                                </div>
                            )}
                            <div className="p-4 bg-gray-50 text-center border-t border-gray-100">
                                <button className="text-[10px] font-black text-blue-600 hover:text-blue-700 uppercase tracking-widest transition-colors">View All Requests</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Financials;
