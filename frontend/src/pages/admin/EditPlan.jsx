import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import DashboardLayout from '../../components/layout/DashboardLayout';
import adminAPI from '../../api/admin';
import showToast from '../../components/shared/Toast';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

const EditPlan = () => {
    const { id } = useParams();
    const isEditMode = id && id !== 'new';
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const { register, handleSubmit, setValue, formState: { errors } } = useForm({
        defaultValues: {
            name: '',
            slug: '',
            description: '',
            price: 0,
            duration: 'monthly',
            activeRequestLimit: 1,
            monthlyGraphicsCredits: 0,
            monthlyVideoCredits: 0,
            monthlyWebCredits: 0,
            turnaroundHours: 48,
            features: {
                brandGuidelines: false,
                prioritySupport: false,
                dedicatedDesigner: false,
                unlimitedRevisions: true,
                accountManager: false
            },
            status: 'active',
            isPublic: true
        }
    });

    useEffect(() => {
        if (isEditMode) {
            fetchPlan();
        }
    }, [id]);

    const fetchPlan = async () => {
        try {
            setLoading(true);
            const plan = await adminAPI.getPlan(id);
            if (plan) {
                // Set values
                Object.keys(plan).forEach(key => {
                    setValue(key, plan[key]);
                });
            }
        } catch (error) {
            console.error('Fetch plan error:', error);
            showToast.error('Failed to load plan details');
            navigate('/admin/plans');
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (data) => {
        try {
            setLoading(true);
            // Ensure numeric values
            const payload = {
                ...data,
                price: parseFloat(data.price),
                activeRequestLimit: parseInt(data.activeRequestLimit),
                monthlyGraphicsCredits: parseInt(data.monthlyGraphicsCredits),
                monthlyVideoCredits: parseInt(data.monthlyVideoCredits),
                monthlyWebCredits: parseInt(data.monthlyWebCredits),
                turnaroundHours: parseInt(data.turnaroundHours)
            };

            if (isEditMode) {
                await adminAPI.updatePlan(id, payload);
                showToast.success('Plan updated successfully');
            } else {
                await adminAPI.createPlan(payload);
                showToast.success('Plan created successfully');
            }
            navigate('/admin/plans');
        } catch (error) {
            console.error('Save plan error:', error);
            showToast.error(error.response?.data?.error?.message || 'Failed to save plan');
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout breadcrumbs={['Admin', 'Plans', isEditMode ? 'Edit' : 'Create']}>
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => navigate('/admin/plans')}
                    className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                    <ArrowLeftIcon className="w-5 h-5 text-gray-500" />
                </button>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">{isEditMode ? 'Edit Plan' : 'Create New Plan'}</h1>
                    <p className="text-gray-500">Configure subscription details and features</p>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl">
                <div className="bg-white rounded-[32px] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden">
                    <div className="p-8 border-b border-gray-100">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Basic Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-gray-700 mb-2">Plan Name</label>
                                <input
                                    {...register('name', { required: 'Plan name is required' })}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                                    placeholder="e.g. Professional"
                                />
                                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Slug (URL Identifier)</label>
                                <input
                                    {...register('slug', { required: 'Slug is required' })}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                                    placeholder="e.g. professional-monthly"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Billing Duration</label>
                                <select
                                    {...register('duration')}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                                >
                                    <option value="weekly">Weekly</option>
                                    <option value="monthly">Monthly</option>
                                    <option value="quarterly">Quarterly</option>
                                    <option value="yearly">Yearly</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Price ($)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    {...register('price', { required: 'Price is required', min: 0 })}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                                <textarea
                                    {...register('description')}
                                    rows="3"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                                ></textarea>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 border-b border-gray-100">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Credits & Limits</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Monthly Graphics Credits</label>
                                <input
                                    type="number"
                                    {...register('monthlyGraphicsCredits', { min: 0 })}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Monthly Video Credits</label>
                                <input
                                    type="number"
                                    {...register('monthlyVideoCredits', { min: 0 })}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Monthly Web Credits</label>
                                <input
                                    type="number"
                                    {...register('monthlyWebCredits', { min: 0 })}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Simultaneous Active Requests</label>
                                <input
                                    type="number"
                                    {...register('activeRequestLimit', { min: 1 })}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Turnaround Time (Hours)</label>
                                <input
                                    type="number"
                                    {...register('turnaroundHours')}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="p-8 border-b border-gray-100">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Features Toggle</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                                { key: 'brandGuidelines', label: 'Brand Guidelines' },
                                { key: 'prioritySupport', label: 'Priority Support' },
                                { key: 'dedicatedDesigner', label: 'Dedicated Designer' },
                                { key: 'unlimitedRevisions', label: 'Unlimited Revisions' },
                                { key: 'accountManager', label: 'Account Manager' }
                            ].map((feature) => (
                                <label key={feature.key} className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                                    <input
                                        type="checkbox"
                                        {...register(`features.${feature.key}`)}
                                        className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 border-gray-300"
                                    />
                                    <span className="font-bold text-gray-700">{feature.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="p-8 bg-gray-50 flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    {...register('isPublic')}
                                    className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 border-gray-300"
                                />
                                <span className="font-bold text-gray-700">Publicly Visible</span>
                            </label>
                            <div className="h-6 w-px bg-gray-300"></div>
                            <label className="flex items-center gap-2">
                                <span className="font-bold text-gray-700">Status:</span>
                                <select {...register('status')} className="bg-white border border-gray-300 rounded-lg px-2 py-1 text-sm font-bold text-gray-700">
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </label>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-600/20 disabled:opacity-50 transition-all hover:-translate-y-1"
                        >
                            {loading ? 'Saving...' : 'Save Plan'}
                        </button>
                    </div>
                </div>
            </form>
        </DashboardLayout>
    );
};

export default EditPlan;
