import { useState, useEffect } from 'react';
import { CreditCardIcon, ArrowPathIcon, ShieldCheckIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import DashboardLayout from '../../components/layout/DashboardLayout';
import subscriptionsAPI from '../../api/subscriptions';
import paymentsAPI from '../../api/payments';

const Billing = () => {
    const [subscription, setSubscription] = useState(null);
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBillingData = async () => {
            try {
                // Mock data for now as APIs might need specific adjustments
                const mockSubscription = {
                    plan: { name: 'Professional Monthly', price: 2499 },
                    creditsUsed: 14,
                    creditsTotal: 20,
                    nextBillingDate: '2023-11-24',
                    paymentMethod: 'Visa ending in 4242',
                    status: 'active'
                };
                const mockPayments = [
                    { id: 'INV-001', date: 'Oct 24, 2023', amount: 2499, status: 'Paid', method: 'Visa •••• 4242' },
                    { id: 'INV-002', date: 'Sep 24, 2023', amount: 2499, status: 'Paid', method: 'Visa •••• 4242' },
                    { id: 'INV-003', date: 'Aug 24, 2023', amount: 2499, status: 'Paid', method: 'Visa •••• 4242' },
                ];

                setSubscription(mockSubscription);
                setPayments(mockPayments);
            } catch (error) {
                console.error('Failed to fetch billing data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchBillingData();
    }, []);

    return (
        <DashboardLayout breadcrumbs={['Dashboard', 'Billing']}>
            <div className="max-w-7xl mx-auto w-full space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Header */}
                <div className="space-y-2">
                    <h1 className="text-5xl font-black text-gray-900 tracking-tight leading-tight">
                        Billing & <span className="text-blue-600">Subscription</span>
                    </h1>
                    <p className="text-gray-500 font-medium text-lg">Manage your creative engine, track usage, and oversee your investments.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Current Plan Card */}
                    <div className="lg:col-span-2 space-y-10">
                        <div className="bg-white border border-gray-100 rounded-[40px] overflow-hidden shadow-[0_20px_60px_rgb(0,0,0,0.03)] relative">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-full -mr-32 -mt-32 blur-3xl"></div>

                            <div className="p-10 border-b border-gray-50 relative z-10">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                                    <div className="flex items-center gap-6">
                                        <div className="w-16 h-16 bg-blue-600 text-white rounded-[24px] flex items-center justify-center shadow-xl shadow-blue-600/20">
                                            <ShieldCheckIcon className="w-8 h-8" />
                                        </div>
                                        <div>
                                            <p className="text-blue-600 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Active Membership</p>
                                            <h2 className="text-3xl font-black text-gray-900 tracking-tight">
                                                {subscription?.plan?.name || 'Professional Monthly'}
                                            </h2>
                                        </div>
                                    </div>
                                    <div className="text-left md:text-right">
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-4xl font-black text-gray-900 tracking-tighter">${subscription?.plan?.price?.toLocaleString() || '2,499'}</span>
                                            <span className="text-sm text-gray-400 font-bold">/month</span>
                                        </div>
                                        <div className="mt-2 flex md:justify-end">
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-600 text-[10px] font-black uppercase tracking-widest rounded-full">
                                                <span className="w-1.5 h-1.5 bg-green-600 rounded-full animate-pulse"></span>
                                                Active Account
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-10 grid grid-cols-1 md:grid-cols-3 gap-10 relative z-10">
                                <div className="space-y-5">
                                    <div className="flex items-center justify-between">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Resource Usage</p>
                                        <span className="text-sm font-black text-gray-900">{subscription?.creditsUsed}/{subscription?.creditsTotal} Credits</span>
                                    </div>
                                    <div className="w-full bg-gray-50 h-3 rounded-full overflow-hidden p-0.5 border border-gray-100">
                                        <div
                                            className="bg-blue-600 h-full rounded-full shadow-sm"
                                            style={{ width: `${(subscription?.creditsUsed / subscription?.creditsTotal) * 100}%` }}
                                        ></div>
                                    </div>
                                    <p className="text-[10px] font-bold text-gray-500 flex items-center gap-1.5 uppercase tracking-widest">
                                        <ArrowPathIcon className="w-3 h-3" />
                                        Resets in 12 days
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Billing Cycle</p>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-gray-50 rounded-xl flex items-center justify-center">
                                            <ArrowPathIcon className="w-4 h-4 text-blue-600" />
                                        </div>
                                        <p className="text-gray-900 font-black text-sm">Monthly Renews</p>
                                    </div>
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Next: Nov 24, 2023</p>
                                </div>

                                <div className="space-y-4">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Payment Source</p>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-gray-50 rounded-xl flex items-center justify-center">
                                            <CreditCardIcon className="w-4 h-4 text-blue-600" />
                                        </div>
                                        <p className="text-gray-900 font-black text-sm">Visa •••• 4242</p>
                                    </div>
                                    <button className="text-blue-600 text-[10px] font-black uppercase tracking-widest hover:underline">Update Card</button>
                                </div>
                            </div>

                            <div className="px-10 py-8 bg-gray-50/50 border-t border-gray-50 flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
                                <div className="flex gap-4 w-full md:w-auto">
                                    <button className="flex-1 md:flex-none px-8 py-3.5 bg-blue-600 text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/10 hover:-translate-y-1">
                                        Modify Plan
                                    </button>
                                    <button className="flex-1 md:flex-none px-8 py-3.5 bg-white text-gray-900 text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-gray-100 transition-all border border-gray-200">
                                        Billing Portal
                                    </button>
                                </div>
                                <button className="text-gray-400 text-[10px] font-black uppercase tracking-widest hover:text-red-500 transition-colors">
                                    Deactivate Subscription
                                </button>
                            </div>
                        </div>

                        {/* Payment History */}
                        <div className="space-y-6">
                            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Invoice History</h2>
                            <div className="bg-white border border-gray-100 rounded-[32px] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-gray-50/50 border-b border-gray-50">
                                            <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Invoice</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Issued Date</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Total</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Receipt</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {payments.map(payment => (
                                            <tr key={payment.id} className="hover:bg-gray-50/30 transition-colors group">
                                                <td className="px-8 py-6">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-black text-gray-900 leading-none mb-1">{payment.id}</span>
                                                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{payment.method}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-sm text-gray-500 font-medium">{payment.date}</td>
                                                <td className="px-8 py-6 text-sm font-black text-gray-900">${payment.amount.toLocaleString()}</td>
                                                <td className="px-8 py-6">
                                                    <span className="inline-flex items-center px-2.5 py-1 bg-green-50 text-green-600 text-[10px] font-black uppercase tracking-widest rounded-full">
                                                        {payment.status}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <button className="w-10 h-10 flex items-center justify-center rounded-xl text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all group-hover:scale-110">
                                                        <DocumentTextIcon className="w-5 h-5" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar / Info */}
                    <div className="space-y-8">
                        <div className="bg-white border border-gray-100 rounded-[32px] p-8 space-y-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
                            <h3 className="text-xl font-black text-gray-900 tracking-tight leading-none">Billing Profile</h3>
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Corporate Entity</p>
                                    <p className="text-sm text-gray-900 font-bold">WebAsia Creative Hub</p>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Primary Contact</p>
                                    <p className="text-sm text-gray-900 font-bold">billing@webasia.com</p>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Stripe Reference</p>
                                    <p className="text-[10px] text-gray-500 font-mono break-all font-bold">sub_1N4pXz2eZvKYlo2Cc6X0QZ2H</p>
                                </div>
                            </div>
                            <button className="w-full py-4 bg-gray-50 text-gray-900 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-gray-100 transition-all border border-gray-100">
                                Update Information
                            </button>
                        </div>

                        <div className="bg-blue-600 rounded-[32px] p-8 text-white relative overflow-hidden group shadow-2xl shadow-blue-600/20 hover:-translate-y-1 transition-all duration-500">
                            <div className="absolute -right-8 -top-8 w-40 h-40 bg-white/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
                            <h3 className="text-xl font-black tracking-tight leading-tight mb-3">Enterprise <br />Solutions</h3>
                            <p className="text-blue-100 text-xs font-medium mb-8 leading-relaxed">
                                Need custom turnaround times or a dedicated creative director?
                            </p>
                            <button className="w-full py-4 bg-white text-blue-600 font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-blue-50 transition-all shadow-xl shadow-blue-900/10">
                                Consult With Us
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Billing;
