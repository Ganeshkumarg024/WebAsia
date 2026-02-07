import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import subscriptionsAPI from '../../api/subscriptions';
import adminAPI from '../../api/admin';
import showToast from '../../components/shared/Toast';
import DashboardLayout from '../../components/layout/DashboardLayout';

const SubscriptionPlans = () => {
    const navigate = useNavigate();
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        try {
            setLoading(true);
            const response = await subscriptionsAPI.getPlans();
            setPlans(response.data || []);
        } catch (error) {
            console.error('Failed to fetch plans:', error);
            showToast.error('Failed to load subscription plans');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this plan?')) return;

        try {
            await adminAPI.deletePlan(id);
            showToast.success('Plan deleted successfully');
            fetchPlans();
        } catch (error) {
            showToast.error('Failed to delete plan');
        }
    };

    return (
        <DashboardLayout breadcrumbs={['Admin', 'Plans']}>
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Subscription Plan Management</h1>
                        <p className="text-gray-500">Create and manage subscription tiers</p>
                    </div>
                    <button
                        onClick={() => navigate('/admin/plans/new')}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 flex items-center gap-2 transition-all"
                    >
                        <PlusIcon className="w-5 h-5" />
                        Create New Plan
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm animate-pulse">
                            <div className="h-6 bg-gray-100 rounded w-1/2 mb-4"></div>
                            <div className="h-10 bg-gray-100 rounded w-3/4 mb-4"></div>
                            <div className="h-4 bg-gray-100 rounded w-full mb-2"></div>
                            <div className="h-4 bg-gray-100 rounded w-full mb-2"></div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {plans.map((plan) => (
                        <div
                            key={plan.id}
                            className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all group"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-1">{plan.name}</h3>
                                    <p className="text-sm text-gray-500">{plan.description}</p>
                                </div>
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => navigate(`/admin/plans/${plan.id}/edit`)}
                                        className="p-2 hover:bg-blue-50 text-gray-400 hover:text-blue-600 rounded-lg transition-colors"
                                    >
                                        <PencilIcon className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(plan.id)}
                                        className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-lg transition-colors"
                                    >
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="mb-6">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-black text-gray-900">${plan.price}</span>
                                    <span className="text-gray-500 font-medium">/{plan.duration}</span>
                                </div>
                            </div>

                            <div className="space-y-3 mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-500 font-medium">Monthly Graphics</span>
                                    <span className="text-gray-900 font-bold">{plan.monthlyGraphicsCredits}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-500 font-medium">Monthly Video</span>
                                    <span className="text-gray-900 font-bold">{plan.monthlyVideoCredits}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-500 font-medium">Active Requests</span>
                                    <span className="text-gray-900 font-bold">{plan.activeRequestLimit}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-500 font-medium">Turnaround Time</span>
                                    <span className="text-gray-900 font-bold">{plan.turnaroundHours}h</span>
                                </div>
                            </div>

                            <div className="space-y-2 mb-6">
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-3">Features</p>
                                {plan.features && Object.entries(plan.features).map(([key, value]) => (
                                    <div key={key} className="flex items-center gap-2">
                                        <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${value ? 'bg-green-100' : 'bg-gray-100'}`}>
                                            <span className={`${value ? 'text-green-600' : 'text-gray-400'} text-xs font-bold`}>{value ? '✓' : '×'}</span>
                                        </div>
                                        <span className={`text-sm font-medium ${value ? 'text-gray-600' : 'text-gray-400 line-through'}`}>
                                            {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                <span className={`px-2.5 py-1 text-xs font-bold rounded-lg ${plan.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                    {plan.status === 'active' ? 'Active' : 'Inactive'}
                                </span>
                                <span className="text-xs font-bold text-gray-400">
                                    {plan.isPublic ? 'Public' : 'Hidden'}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </DashboardLayout>
    );
};

export default SubscriptionPlans;
