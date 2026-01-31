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
                        <h1 className="text-3xl font-bold text-white mb-2">Subscription Plan Management</h1>
                        <p className="text-gray-400">Create and manage subscription tiers</p>
                    </div>
                    <button
                        onClick={() => navigate('/admin/plans/new')}
                        className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium flex items-center gap-2"
                    >
                        <PlusIcon className="w-5 h-5" />
                        Create New Plan
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-[#151B2E] rounded-lg p-6 border border-[#1E2638] animate-pulse">
                            <div className="h-6 bg-gray-700 rounded w-1/2 mb-4"></div>
                            <div className="h-10 bg-gray-700 rounded w-3/4 mb-4"></div>
                            <div className="h-4 bg-gray-700 rounded w-full mb-2"></div>
                            <div className="h-4 bg-gray-700 rounded w-full mb-2"></div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {plans.map((plan) => (
                        <div
                            key={plan.id}
                            className="bg-[#151B2E] rounded-lg p-6 border border-[#1E2638] hover:border-[#2A3447] transition-colors"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="text-2xl font-bold text-white mb-1">{plan.name}</h3>
                                    <p className="text-sm text-gray-400">{plan.description}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => navigate(`/admin/plans/${plan.id}/edit`)}
                                        className="p-2 hover:bg-gray-700 rounded transition-colors"
                                    >
                                        <PencilIcon className="w-4 h-4 text-blue-500" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(plan.id)}
                                        className="p-2 hover:bg-gray-700 rounded transition-colors"
                                    >
                                        <TrashIcon className="w-4 h-4 text-red-500" />
                                    </button>
                                </div>
                            </div>

                            <div className="mb-6">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-bold text-white">${plan.price}</span>
                                    <span className="text-gray-400">/month</span>
                                </div>
                            </div>

                            <div className="space-y-3 mb-6">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-400">Monthly Credits</span>
                                    <span className="text-white font-medium">{plan.creditsPerMonth}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-400">Concurrent Tasks</span>
                                    <span className="text-white font-medium">{plan.concurrentTasks}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-400">Turnaround Time</span>
                                    <span className="text-white font-medium">{plan.turnaroundTime}h</span>
                                </div>
                            </div>

                            <div className="space-y-2 mb-6">
                                <p className="text-xs text-gray-400 font-medium">FEATURES</p>
                                {plan.features?.slice(0, 5).map((feature, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <span className="text-green-500">✓</span>
                                        <span className="text-sm text-gray-300">{feature}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                                <span className={`text-sm font-medium ${plan.isActive ? 'text-green-500' : 'text-gray-500'}`}>
                                    {plan.isActive ? 'Active' : 'Inactive'}
                                </span>
                                <span className="text-sm text-gray-400">
                                    {plan.subscriberCount || 0} subscribers
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
