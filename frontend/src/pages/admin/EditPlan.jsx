import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import adminAPI from '../../api/admin';
import showToast from '../../components/shared/Toast';
import DashboardLayout from '../../components/layout/DashboardLayout';

const EditPlan = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [plan, setPlan] = useState({
        name: '',
        description: '',
        price: '',
        creditsPerMonth: '',
        concurrentTasks: '',
        turnaroundTime: '',
        features: [''],
        isActive: true,
    });

    useEffect(() => {
        if (id !== 'new') {
            fetchPlan();
        }
    }, [id]);

    const fetchPlan = async () => {
        try {
            const response = await adminAPI.getPlan(id);
            setPlan(response.data);
        } catch (error) {
            showToast.error('Failed to load plan');
        }
    };

    const handleAddFeature = () => {
        setPlan({ ...plan, features: [...plan.features, ''] });
    };

    const handleRemoveFeature = (index) => {
        const newFeatures = [...plan.features];
        newFeatures.splice(index, 1);
        setPlan({ ...plan, features: newFeatures });
    };

    const handleFeatureChange = (index, value) => {
        const newFeatures = [...plan.features];
        newFeatures[index] = value;
        setPlan({ ...plan, features: newFeatures });
    };

    const handleSave = async () => {
        if (!plan.name || !plan.price) {
            showToast.error('Please fill in all required fields');
            return;
        }

        try {
            setLoading(true);
            if (id === 'new') {
                await adminAPI.createPlan(plan);
                showToast.success('Plan created successfully');
            } else {
                await adminAPI.updatePlan(id, plan);
                showToast.success('Plan updated successfully');
            }
            navigate('/admin/plans');
        } catch (error) {
            showToast.error('Failed to save plan');
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout breadcrumbs={['Admin', 'Plans', id === 'new' ? 'New Plan' : 'Edit Plan']}>
            <div className="max-w-3xl mx-auto">
                <div className="mb-8">
                    <button
                        onClick={() => navigate('/admin/plans')}
                        className="flex items-center gap-2 text-gray-400 hover:text-white mb-4"
                    >
                        <ArrowLeftIcon className="w-5 h-5" />
                        Back to Plans
                    </button>
                    <h1 className="text-3xl font-bold text-white mb-2">
                        {id === 'new' ? 'Create New Plan' : 'Edit Plan'}
                    </h1>
                    <p className="text-gray-400">Configure subscription plan details</p>
                </div>

                {/* Basic Info */}
                <div className="bg-[#151B2E] rounded-lg p-6 border border-[#1E2638] mb-6">
                    <h2 className="text-lg font-bold text-white mb-4">Basic Information</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-white mb-2">
                                Plan Name *
                            </label>
                            <input
                                type="text"
                                value={plan.name}
                                onChange={(e) => setPlan({ ...plan, name: e.target.value })}
                                className="w-full px-4 py-3 bg-[#0A0E1A] border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                                placeholder="Professional"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-white mb-2">
                                Description
                            </label>
                            <textarea
                                value={plan.description}
                                onChange={(e) => setPlan({ ...plan, description: e.target.value })}
                                className="w-full px-4 py-3 bg-[#0A0E1A] border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none resize-none"
                                rows={3}
                                placeholder="Perfect for growing businesses"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-white mb-2">
                                    Price ($/month) *
                                </label>
                                <input
                                    type="number"
                                    value={plan.price}
                                    onChange={(e) => setPlan({ ...plan, price: e.target.value })}
                                    className="w-full px-4 py-3 bg-[#0A0E1A] border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                                    placeholder="299"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-white mb-2">
                                    Credits per Month
                                </label>
                                <input
                                    type="number"
                                    value={plan.creditsPerMonth}
                                    onChange={(e) => setPlan({ ...plan, creditsPerMonth: e.target.value })}
                                    className="w-full px-4 py-3 bg-[#0A0E1A] border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                                    placeholder="20"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-white mb-2">
                                    Concurrent Tasks
                                </label>
                                <input
                                    type="number"
                                    value={plan.concurrentTasks}
                                    onChange={(e) => setPlan({ ...plan, concurrentTasks: e.target.value })}
                                    className="w-full px-4 py-3 bg-[#0A0E1A] border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                                    placeholder="2"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-white mb-2">
                                    Turnaround Time (hours)
                                </label>
                                <input
                                    type="number"
                                    value={plan.turnaroundTime}
                                    onChange={(e) => setPlan({ ...plan, turnaroundTime: e.target.value })}
                                    className="w-full px-4 py-3 bg-[#0A0E1A] border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                                    placeholder="48"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Features */}
                <div className="bg-[#151B2E] rounded-lg p-6 border border-[#1E2638] mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-white">Features</h2>
                        <button
                            onClick={handleAddFeature}
                            className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm flex items-center gap-1"
                        >
                            <PlusIcon className="w-4 h-4" />
                            Add Feature
                        </button>
                    </div>
                    <div className="space-y-3">
                        {plan.features.map((feature, index) => (
                            <div key={index} className="flex items-center gap-3">
                                <input
                                    type="text"
                                    value={feature}
                                    onChange={(e) => handleFeatureChange(index, e.target.value)}
                                    className="flex-1 px-4 py-2 bg-[#0A0E1A] border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                                    placeholder="Feature description"
                                />
                                <button
                                    onClick={() => handleRemoveFeature(index)}
                                    className="p-2 hover:bg-gray-700 rounded transition-colors"
                                >
                                    <TrashIcon className="w-5 h-5 text-red-500" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Status */}
                <div className="bg-[#151B2E] rounded-lg p-6 border border-[#1E2638] mb-6">
                    <h2 className="text-lg font-bold text-white mb-4">Status</h2>
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={plan.isActive}
                            onChange={(e) => setPlan({ ...plan, isActive: e.target.checked })}
                            className="w-5 h-5 rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
                        />
                        <span className="text-white">Active (visible to users)</span>
                    </label>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/admin/plans')}
                        className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="flex-1 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50"
                    >
                        {loading ? 'Saving...' : id === 'new' ? 'Create Plan' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default EditPlan;
