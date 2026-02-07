import { useState, useEffect } from 'react';
import { CreditCardIcon, ArrowPathIcon, ShieldCheckIcon, DocumentTextIcon, XMarkIcon, CheckIcon } from '@heroicons/react/24/outline';
import DashboardLayout from '../../components/layout/DashboardLayout';
import useSubscriptionStore from '../../store/subscriptionStore';
import useAuthStore from '../../store/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import useRazorpay from '../../hooks/useRazorpay';
import toast from 'react-hot-toast';

const Billing = () => {
    const { user } = useAuthStore();
    const {
        currentSubscription,
        paymentHistory,
        plans,
        isLoading,
        error,
        fetchCurrentSubscription,
        fetchPaymentHistory,
        fetchPlans,
        changePlan,
        cancelSubscription
    } = useSubscriptionStore();

    const { processPayment, isProcessing } = useRazorpay();
    const [isModifyModalOpen, setIsModifyModalOpen] = useState(false);

    useEffect(() => {
        fetchCurrentSubscription();
        fetchPaymentHistory();
        fetchPlans();
    }, [fetchCurrentSubscription, fetchPaymentHistory, fetchPlans]);

    const handlePlanChange = async (plan) => {
        // If it's a paid plan, initiate Razorpay
        if (plan.price > 0) {
            await processPayment({
                plan,
                user,
                onSuccess: async (paymentData) => {
                    const result = await useSubscriptionStore.getState().subscribe(plan.id, {
                        paymentId: paymentData.paymentId,
                        paymentMethod: 'razorpay',
                        amount: paymentData.amount,
                        currency: paymentData.currency,
                        gateway: 'razorpay'
                    });

                    if (result.success) {
                        toast.success(`Successfully subscribed to ${plan.name}`);
                        setIsModifyModalOpen(false);
                        fetchCurrentSubscription();
                        fetchPaymentHistory();
                    }
                },
                onError: (err) => {
                    toast.error(err.message || 'Payment failed');
                }
            });
        } else {
            // Handle free/trial plans if any
            const result = await changePlan(plan.id);
            if (result.success) {
                toast.success(`Plan updated to ${plan.name}`);
                setIsModifyModalOpen(false);
            }
        }
    };

    const handleCancel = async () => {
        if (!currentSubscription) return;
        if (window.confirm('Are you sure you want to deactivate your subscription? This will take effect at the end of your current billing cycle.')) {
            await cancelSubscription(currentSubscription.paymentId);
        }
    };

    // Calculate credits
    const plan = currentSubscription?.plan;
    const totalCreditsAvailable = plan ? (plan.monthlyGraphicsCredits + plan.monthlyVideoCredits + plan.monthlyWebCredits) : 0;
    const remainingCredits = currentSubscription ? (currentSubscription.graphicsCreditsRemaining + currentSubscription.videoCreditsRemaining + currentSubscription.webCreditsRemaining) : 0;
    const usedCredits = totalCreditsAvailable - remainingCredits;
    const usagePercentage = totalCreditsAvailable > 0 ? (usedCredits / totalCreditsAvailable) * 100 : 0;

    // Format currency
    const formatCurrency = (amount, currency = 'INR') => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: currency,
            maximumFractionDigits: 0
        }).format(amount);
    };

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
                                <AnimatePresence mode="wait">
                                    {currentSubscription ? (
                                        <motion.div
                                            key="active"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8"
                                        >
                                            <div className="flex items-center gap-6">
                                                <div className="w-16 h-16 bg-blue-600 text-white rounded-[24px] flex items-center justify-center shadow-xl shadow-blue-600/20">
                                                    <ShieldCheckIcon className="w-8 h-8" />
                                                </div>
                                                <div>
                                                    <p className="text-blue-600 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Active Membership</p>
                                                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">
                                                        {currentSubscription.plan.name}
                                                    </h2>
                                                </div>
                                            </div>
                                            <div className="text-left md:text-right">
                                                <div className="flex items-baseline gap-1">
                                                    <span className="text-4xl font-black text-gray-900 tracking-tighter">
                                                        {formatCurrency(currentSubscription.plan.price, currentSubscription.plan.currency)}
                                                    </span>
                                                    <span className="text-sm text-gray-400 font-bold">/cycle</span>
                                                </div>
                                                <div className="mt-2 flex md:justify-end">
                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 ${currentSubscription.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'} text-[10px] font-black uppercase tracking-widest rounded-full`}>
                                                        <span className={`w-1.5 h-1.5 ${currentSubscription.status === 'active' ? 'bg-green-600' : 'bg-yellow-600'} rounded-full animate-pulse`}></span>
                                                        {currentSubscription.status.replace('_', ' ')}
                                                    </span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="none"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="flex flex-col md:flex-row justify-between items-center gap-8"
                                        >
                                            <div className="text-center md:text-left">
                                                <h2 className="text-3xl font-black text-gray-900 tracking-tight">No Active Plan</h2>
                                                <p className="text-gray-500 mt-2">Subscribe to start your creative journey.</p>
                                            </div>
                                            <button
                                                onClick={() => setIsModifyModalOpen(true)}
                                                className="px-10 py-4 bg-blue-600 text-white font-black uppercase tracking-widest rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20"
                                            >
                                                View Plans
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {currentSubscription && (
                                <>
                                    <div className="p-10 grid grid-cols-1 md:grid-cols-3 gap-10 relative z-10">
                                        <div className="space-y-5">
                                            <div className="flex items-center justify-between">
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Resource Usage</p>
                                                <span className="text-sm font-black text-gray-900">{usedCredits}/{totalCreditsAvailable} Credits</span>
                                            </div>
                                            <div className="w-full bg-gray-50 h-3 rounded-full overflow-hidden p-0.5 border border-gray-100">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${usagePercentage}%` }}
                                                    transition={{ duration: 1, ease: "easeOut" }}
                                                    className="bg-blue-600 h-full rounded-full shadow-sm"
                                                ></motion.div>
                                            </div>
                                            <p className="text-[10px] font-bold text-gray-500 flex items-center gap-1.5 uppercase tracking-widest">
                                                <ArrowPathIcon className="w-3 h-3" />
                                                Resets on {new Date(currentSubscription.creditsResetDate).toLocaleDateString()}
                                            </p>
                                        </div>

                                        <div className="space-y-4">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Billing Cycle</p>
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-gray-50 rounded-xl flex items-center justify-center">
                                                    <ArrowPathIcon className="w-4 h-4 text-blue-600" />
                                                </div>
                                                <p className="text-gray-900 font-black text-sm">{currentSubscription.plan.duration.charAt(0).toUpperCase() + currentSubscription.plan.duration.slice(1)} Renews</p>
                                            </div>
                                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Next: {new Date(currentSubscription.nextBillingDate).toLocaleDateString()}</p>
                                        </div>

                                        <div className="space-y-4">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Payment Source</p>
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-gray-50 rounded-xl flex items-center justify-center">
                                                    <CreditCardIcon className="w-4 h-4 text-blue-600" />
                                                </div>
                                                <p className="text-gray-900 font-black text-sm">{currentSubscription.paymentMethod || 'Credit Card'}</p>
                                            </div>
                                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">ID: {currentSubscription.paymentId?.slice(0, 10)}...</p>
                                        </div>
                                    </div>

                                    <div className="px-10 py-8 bg-gray-50/50 border-t border-gray-50 flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
                                        <div className="flex gap-4 w-full md:w-auto">
                                            <button
                                                onClick={() => setIsModifyModalOpen(true)}
                                                className="flex-1 md:flex-none px-8 py-3.5 bg-blue-600 text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/10 hover:-translate-y-1"
                                            >
                                                Modify Plan
                                            </button>
                                            <button className="flex-1 md:flex-none px-8 py-3.5 bg-white text-gray-900 text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-gray-100 transition-all border border-gray-200">
                                                Payment Methods
                                            </button>
                                        </div>
                                        <button
                                            onClick={handleCancel}
                                            className="text-gray-400 text-[10px] font-black uppercase tracking-widest hover:text-red-500 transition-colors"
                                        >
                                            Deactivate Subscription
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Payment History */}
                        <div className="space-y-6">
                            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Invoice History</h2>
                            <div className="bg-white border border-gray-100 rounded-[32px] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
                                {paymentHistory.length > 0 ? (
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="bg-gray-50/50 border-b border-gray-50">
                                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Payment ID</th>
                                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Issued Date</th>
                                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Total</th>
                                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Receipt</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {paymentHistory.map(payment => (
                                                <tr key={payment.id} className="hover:bg-gray-50/30 transition-colors group">
                                                    <td className="px-8 py-6">
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-black text-gray-900 leading-none mb-1">{payment.gatewayPaymentId || payment.id.slice(0, 12)}</span>
                                                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{payment.paymentGateway} • {payment.paymentMethod}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6 text-sm text-gray-500 font-medium">
                                                        {new Date(payment.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </td>
                                                    <td className="px-8 py-6 text-sm font-black text-gray-900">{formatCurrency(payment.amount, payment.currency)}</td>
                                                    <td className="px-8 py-6">
                                                        <span className={`inline-flex items-center px-2.5 py-1 ${payment.status === 'completed' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'} text-[10px] font-black uppercase tracking-widest rounded-full`}>
                                                            {payment.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-6 text-right">
                                                        <button
                                                            onClick={() => paymentsAPI.downloadInvoice(payment.id)}
                                                            className="w-10 h-10 flex items-center justify-center rounded-xl text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all group-hover:scale-110"
                                                        >
                                                            <DocumentTextIcon className="w-5 h-5" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <div className="p-20 text-center">
                                        <p className="text-gray-400 font-medium">No payment history available.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar / Info */}
                    <div className="space-y-8">
                        <div className="bg-white border border-gray-100 rounded-[32px] p-8 space-y-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
                            <h3 className="text-xl font-black text-gray-900 tracking-tight leading-none">Billing Profile</h3>
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Primary Contact</p>
                                    <p className="text-sm text-gray-900 font-bold">{user?.email}</p>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Account Type</p>
                                    <p className="text-sm text-gray-900 font-bold capitalize">{user?.role}</p>
                                </div>
                                {currentSubscription && (
                                    <div className="space-y-2">
                                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Gateway Reference</p>
                                        <p className="text-[10px] text-gray-500 font-mono break-all font-bold">
                                            {currentSubscription.paymentId}
                                        </p>
                                    </div>
                                )}
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

            {/* Modify Plan Modal */}
            <AnimatePresence>
                {isModifyModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsModifyModalOpen(false)}
                            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
                        ></motion.div>
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-white rounded-[40px] w-full max-w-5xl max-h-[90vh] overflow-y-auto relative z-10 shadow-2xl p-8"
                        >
                            <div className="flex justify-between items-center mb-10">
                                <div>
                                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">Select Your <span className="text-blue-600">Evolution</span></h2>
                                    <p className="text-gray-500 font-medium">Upgrade or scale your creative capacity in real-time.</p>
                                </div>
                                <button
                                    onClick={() => setIsModifyModalOpen(false)}
                                    className="p-3 bg-gray-50 rounded-2xl text-gray-400 hover:text-gray-900 transition-colors"
                                >
                                    <XMarkIcon className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {plans.map((plan) => (
                                    <div
                                        key={plan.id}
                                        className={`glass-card p-8 group relative flex flex-col ${currentSubscription?.planId === plan.id ? 'ring-2 ring-blue-600' : ''}`}
                                    >
                                        {currentSubscription?.planId === plan.id && (
                                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full">
                                                Current Plan
                                            </div>
                                        )}
                                        <div className="mb-8">
                                            <h3 className="text-xl font-black text-gray-900 mb-2">{plan.name}</h3>
                                            <p className="text-gray-500 text-xs font-medium">{plan.description}</p>
                                        </div>
                                        <div className="mb-10">
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-3xl font-black text-gray-900">{formatCurrency(plan.price, plan.currency)}</span>
                                                <span className="text-xs text-gray-400 font-bold lowercase">/{plan.duration}</span>
                                            </div>
                                        </div>
                                        <ul className="space-y-4 mb-10 flex-grow">
                                            <li className="flex items-center gap-3 text-xs font-bold text-gray-700">
                                                <CheckIcon className="w-4 h-4 text-blue-600" />
                                                {plan.activeRequestLimit} Active Request(s)
                                            </li>
                                            <li className="flex items-center gap-3 text-xs font-bold text-gray-700">
                                                <CheckIcon className="w-4 h-4 text-blue-600" />
                                                {plan.monthlyGraphicsCredits} Graphics Credits
                                            </li>
                                            <li className="flex items-center gap-3 text-xs font-bold text-gray-700">
                                                <CheckIcon className="w-4 h-4 text-blue-600" />
                                                {plan.monthlyVideoCredits} Video Credits
                                            </li>
                                        </ul>
                                        <button
                                            disabled={currentSubscription?.planId === plan.id || isLoading || isProcessing}
                                            onClick={() => handlePlanChange(plan)}
                                            className={`w-full py-4 text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all ${currentSubscription?.planId === plan.id
                                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-xl shadow-blue-600/10'
                                                }`}
                                        >
                                            {currentSubscription?.planId === plan.id ? 'Current Plan' : isProcessing ? 'Processing...' : 'Select Plan'}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </DashboardLayout>
    );
};

export default Billing;
