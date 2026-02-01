import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import useAdminStore from '../../store/adminStore';
import {
    ChatBubbleBottomCenterTextIcon,
    CheckCircleIcon,
    XCircleIcon,
    StarIcon as StarIconOutline,
    FunnelIcon,
    MagnifyingGlassIcon,
    EyeIcon,
    TrashIcon,
    HandThumbUpIcon,
    ShieldExclamationIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

const Testimonials = () => {
    const { testimonials, loading, fetchTestimonials, approveTestimonial, rejectTestimonial } = useAdminStore();
    const [filter, setFilter] = useState('pending');

    useEffect(() => {
        fetchTestimonials(filter);
    }, [filter]);

    return (
        <DashboardLayout breadcrumbs={['Admin', 'Testimonials']}>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <ChatBubbleBottomCenterTextIcon className="w-8 h-8 text-blue-600" />
                        Testimonial Moderation Panel
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">Review and approve client feedback for public display.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex bg-gray-100 dark:bg-slate-800 p-1 rounded-xl">
                        {['pending', 'approved', 'rejected'].map((s) => (
                            <button
                                key={s}
                                onClick={() => setFilter(s)}
                                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all uppercase tracking-wider ${filter === s ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
                    <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-4">Pending Review</p>
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-white">12</h3>
                    <div className="mt-4 flex items-center text-orange-500 text-xs font-bold gap-1">
                        <ShieldExclamationIcon className="w-4 h-4" /> Priority Attention
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
                    <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-4">Total Approved</p>
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-white">142</h3>
                    <div className="mt-4 flex items-center text-green-600 text-xs font-bold gap-1">
                        <CheckCircleIcon className="w-4 h-4" /> 92% Approval Rate
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
                    <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-4">Avg. Rating</p>
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-white font-mono flex items-baseline gap-2">
                        4.8
                        <span className="text-yellow-400 flex"><StarIconSolid className="w-5 h-5" /></span>
                    </h3>
                    <p className="mt-4 text-[11px] text-gray-500">Based on last 50 reviews</p>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
                    <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-4">Positive Sentiment</p>
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-white">96%</h3>
                    <div className="w-full h-1 bg-gray-100 dark:bg-slate-800 rounded-full mt-6 overflow-hidden">
                        <div className="h-full bg-green-500 w-[96%]"></div>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 overflow-hidden shadow-sm">
                <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-gray-50/50 dark:bg-slate-800/50">
                    <div className="relative w-96">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search feedback..."
                            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                        />
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-all border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                        <FunnelIcon className="w-4 h-4" /> Advanced Filters
                    </button>
                </div>

                <div className="p-6">
                    <div className="space-y-4">
                        {testimonials.length > 0 ? (
                            testimonials.map((t) => (
                                <div key={t.id} className="p-6 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl hover:shadow-lg hover:shadow-gray-200/50 dark:hover:shadow-none transition-all group">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 font-bold shrink-0">
                                                {t.user?.firstName?.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className="text-base font-bold text-gray-900 dark:text-white">{t.user?.firstName} {t.user?.lastName}</h4>
                                                    <span className="px-2 py-0.5 text-[10px] font-bold bg-gray-100 dark:bg-slate-800 text-gray-500 rounded-full uppercase tracking-tighter">{t.user?.role}</span>
                                                </div>
                                                <p className="text-xs text-gray-500 mb-4">{t.user?.email} • {new Date(t.createdAt).toLocaleDateString()}</p>

                                                <div className="flex gap-1 mb-4">
                                                    {Array(5).fill(0).map((_, i) => (
                                                        i < t.rating ? (
                                                            <StarIconSolid key={i} className="w-4 h-4 text-yellow-500" />
                                                        ) : (
                                                            <StarIconOutline key={i} className="w-4 h-4 text-gray-300" />
                                                        )
                                                    ))}
                                                </div>

                                                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed italic border-l-4 border-gray-100 dark:border-slate-800 pl-4 py-1">
                                                    "{t.content}"
                                                </p>

                                                {t.requestId && (
                                                    <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-blue-600 uppercase tracking-widest bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded w-fit">
                                                        <HandThumbUpIcon className="w-3.5 h-3.5" /> Project #{t.requestId?.slice(0, 8)}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {t.status === 'pending' && (
                                                <>
                                                    <button
                                                        onClick={() => approveTestimonial(t.id)}
                                                        className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white text-xs font-bold rounded-xl hover:bg-green-600 shadow-lg shadow-green-500/20 transition-all"
                                                    >
                                                        <CheckCircleIcon className="w-4 h-4" /> Approve
                                                    </button>
                                                    <button
                                                        onClick={() => rejectTestimonial(t.id)}
                                                        className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/10 text-red-600 text-xs font-bold rounded-xl hover:bg-red-100 dark:hover:bg-red-900/20 transition-all border border-red-100 dark:border-red-900/50"
                                                    >
                                                        <XCircleIcon className="w-4 h-4" /> Reject
                                                    </button>
                                                </>
                                            )}
                                            <button className="flex items-center gap-2 px-4 py-2 text-gray-500 hover:text-blue-600 text-xs font-bold hover:bg-blue-50 dark:hover:bg-blue-900/10 rounded-xl transition-all">
                                                <EyeIcon className="w-4 h-4" /> Details
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-20 text-center flex flex-col items-center justify-center text-gray-400">
                                <ChatBubbleBottomCenterTextIcon className="w-16 h-16 mb-4 opacity-20" />
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white opacity-40">No testimonials to show</h3>
                                <p className="text-sm max-w-xs mt-2">There are currently no feedback submissions matching this filter.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Testimonials;
