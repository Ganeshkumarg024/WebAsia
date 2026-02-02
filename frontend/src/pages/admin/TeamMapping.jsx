import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import useAdminStore from '../../store/adminStore';
import {
    ChevronRightIcon,
    ArrowsRightLeftIcon,
    StarIcon,
    UserPlusIcon,
    XMarkIcon,
    MagnifyingGlassIcon,
    ArrowPathIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

const TeamMapping = () => {
    const { pods, unassignedDesigners, loading, fetchPods, fetchUnassignedDesigners, assignToPod, removeFromPod } = useAdminStore();
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchPods();
        fetchUnassignedDesigners();
    }, []);

    const handleAssign = async (podId, designerId) => {
        await assignToPod(podId, designerId);
    };

    const handleRemove = async (podId, designerId) => {
        await removeFromPod(podId, designerId);
        // Refresh
        fetchPods();
        fetchUnassignedDesigners();
    };

    return (
        <DashboardLayout breadcrumbs={['Admin', 'Team Mapping']}>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Team Mapping & Workflow Control</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Manage manager pods and designer assignments</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3 px-4 py-2 bg-gray-100 dark:bg-slate-800 rounded-xl">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Skill-based Auto-assignment</span>
                        <div className="w-10 h-6 bg-blue-600 rounded-full relative p-1 cursor-pointer">
                            <div className="w-4 h-4 bg-white rounded-full absolute right-1"></div>
                        </div>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 transition-all">
                        <ArrowPathIcon className="w-5 h-5" />
                        Save Changes
                    </button>
                </div>
            </div>

            <div className="flex gap-8 h-[calc(100vh-200px)]">
                {/* Manager Pods Section */}
                <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 space-y-6">
                    <div className="flex items-center justify-between sticky top-0 bg-[#F8FAFC] dark:bg-[#0A0E1A] py-2 z-10">
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                            Manager Pods
                        </h3>
                        <span className="px-2 py-1 rounded bg-green-100 dark:bg-green-900/30 text-green-600 text-[10px] font-bold">OPTIMIZED</span>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        {pods.map((pod) => (
                            <div key={pod.id} className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                                <div className="flex items-start justify-between mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-full border-2 border-blue-600 p-0.5">
                                            {pod.manager.photoUrl ? (
                                                <img src={pod.manager.photoUrl} alt="" className="w-full h-full rounded-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl">
                                                    {pod.manager.firstName.charAt(0)}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900 dark:text-white text-lg">{pod.manager.firstName} {pod.manager.lastName}</h4>
                                            <p className="text-xs text-gray-500">Creative Lead / Manager</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Performance</p>
                                        <div className="flex gap-0.5">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <StarIconSolid key={star} className={`w-4 h-4 ${star <= 4.5 ? 'text-yellow-400' : 'text-gray-200'}`} />
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-dashed border-gray-200 dark:border-slate-700 min-h-[120px] flex flex-wrap gap-3 items-start">
                                    {pod.designers.map((designer) => (
                                        <div key={designer.id} className="flex items-center gap-3 bg-white dark:bg-slate-900 px-4 py-3 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm group hover:border-blue-500 transition-all">
                                            <div className="w-8 h-8 rounded-full bg-gray-100 overflow-hidden">
                                                {designer.photoUrl ? (
                                                    <img src={designer.photoUrl} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-500">
                                                        {designer.firstName.charAt(0)}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-gray-900 dark:text-white">{designer.firstName}</span>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <div className="h-1.5 w-16 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full ${designer.workload > 80 ? 'bg-orange-500' : 'bg-green-500'}`}
                                                            style={{ width: `${designer.workload}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className={`text-[9px] font-bold ${designer.workload > 80 ? 'text-orange-500' : 'text-green-600'}`}>
                                                        {designer.workload}%
                                                    </span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleRemove(pod.id, designer.id)}
                                                className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all"
                                            >
                                                <XMarkIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                    <div className="border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-xl h-[52px] w-32 flex items-center justify-center text-gray-400">
                                        <span className="text-[10px] font-medium italic">Drop Here</span>
                                    </div>
                                </div>

                                <div className="mt-4 flex items-center justify-between pt-4 border-t border-gray-50 dark:border-slate-800">
                                    <p className="text-xs text-gray-500">Avg. TAT: <span className="font-bold text-gray-900 dark:text-white">{pod.manager.avgTAT}</span></p>
                                    <div className="flex -space-x-2">
                                        {pod.designers.slice(0, 3).map((d, i) => (
                                            <div key={i} className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-900 bg-blue-100 flex items-center justify-center text-[8px] font-bold text-blue-600">
                                                {d.firstName.charAt(0)}
                                            </div>
                                        ))}
                                        {pod.designers.length > 3 && (
                                            <div className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-900 bg-gray-100 flex items-center justify-center text-[8px] font-bold text-gray-500">
                                                +{pod.designers.length - 3}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Design Pool Sidebar */}
                <div className="w-80 bg-gray-50 dark:bg-slate-800/30 rounded-2xl border border-gray-100 dark:border-slate-800 overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                <ArrowsRightLeftIcon className="w-4 h-4 text-blue-600" />
                                Design Pool
                            </h3>
                            <span className="text-[10px] font-bold bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                                {unassignedDesigners.length} Available
                            </span>
                        </div>
                        <div className="relative">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Filter by skill..."
                                className="w-full pl-9 pr-4 py-2 bg-gray-100 dark:bg-slate-800 border-none rounded-xl text-xs focus:ring-2 focus:ring-blue-500/50 transition-all text-gray-900 dark:text-white"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {unassignedDesigners.map((designer) => (
                            <div key={designer.id} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm hover:border-blue-500 transition-all cursor-grab active:cursor-grabbing group">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gray-100 overflow-hidden border border-gray-50 dark:border-slate-800">
                                        {designer.photoUrl ? (
                                            <img src={designer.photoUrl} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="w-full h-full flex items-center justify-center font-bold text-gray-400">
                                                {designer.firstName.charAt(0)}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-bold text-gray-900 dark:text-white leading-none">{designer.firstName}</p>
                                            <ChevronRightIcon className="w-4 h-4 text-gray-300 group-hover:text-blue-500" />
                                        </div>
                                        <p className="text-[10px] text-blue-600 font-medium mt-1 uppercase tracking-wide">UI Design / Web</p>
                                    </div>
                                </div>
                                <div className="mt-4 grid grid-cols-2 gap-3">
                                    <div className="bg-gray-50 dark:bg-slate-800 p-2 rounded-xl">
                                        <p className="text-[9px] text-gray-500 uppercase font-bold">Capacity</p>
                                        <p className="text-xs font-bold text-green-600">Available</p>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-slate-800 p-2 rounded-xl">
                                        <p className="text-[9px] text-gray-500 uppercase font-bold">Tasks</p>
                                        <p className="text-xs font-bold text-gray-900 dark:text-white">0 Active</p>
                                    </div>
                                </div>

                                <div className="mt-4 opacity-0 group-hover:opacity-100 transition-all">
                                    <select
                                        className="w-full bg-blue-50 dark:bg-blue-900/20 border-none rounded-lg text-[10px] font-bold text-blue-600 py-1.5"
                                        onChange={(e) => handleAssign(e.target.value, designer.id)}
                                        value=""
                                    >
                                        <option value="" disabled>Assign to Pod...</option>
                                        {pods.map(p => (
                                            <option key={p.id} value={p.id}>{p.manager.firstName}'s Pod</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default TeamMapping;
