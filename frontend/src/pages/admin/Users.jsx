import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import useAdminStore from '../../store/adminStore';
import {
    MagnifyingGlassIcon,
    FunnelIcon,
    UserPlusIcon,
    PencilSquareIcon,
    ClockIcon,
    LockClosedIcon,
    NoSymbolIcon,
    CheckCircleIcon,
    EllipsisVerticalIcon
} from '@heroicons/react/24/outline';

const Users = () => {
    const { users, loading, fetchUsers, updateUser } = useAdminStore();
    const [activeTab, setActiveTab] = useState('client');
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        fetchUsers({ role: activeTab, search: searchQuery, status: statusFilter === 'all' ? undefined : statusFilter });
    }, [activeTab, searchQuery, statusFilter]);

    const tabs = [
        { id: 'client', label: 'Clients', count: 124 },
        { id: 'designer', label: 'Designers', count: 48 },
        { id: 'manager', label: 'Managers', count: 12 },
        { id: 'affiliate', label: 'Affiliates', count: 8, pulse: true },
    ];

    const getStatusStyles = (status) => {
        switch (status) {
            case 'active':
                return 'text-green-600 bg-green-50 dark:bg-green-900/20';
            case 'suspended':
                return 'text-red-600 bg-red-50 dark:bg-red-900/20';
            case 'inactive':
                return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20';
            default:
                return 'text-orange-500 bg-orange-50 dark:bg-orange-900/20';
        }
    };

    return (
        <DashboardLayout breadcrumbs={['Admin', 'User Management']}>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Universal User Management</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Manage platform-wide user roles and permissions</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 transition-all">
                    <UserPlusIcon className="w-5 h-5" />
                    Add New User
                </button>
            </div>

            {/* Filters & Search */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm mb-6">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex-1 min-w-[300px] relative">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name, email, or company..."
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-slate-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500/50 transition-all text-gray-900 dark:text-white"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <select
                            className="bg-gray-50 dark:bg-slate-800 border-none rounded-xl text-sm text-gray-900 dark:text-gray-300 focus:ring-2 focus:ring-blue-500/50 px-4 py-2"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="all">Account Status</option>
                            <option value="active">Active</option>
                            <option value="suspended">Suspended</option>
                            <option value="pending">Pending Verification</option>
                        </select>
                        <button className="p-2 rounded-xl bg-gray-50 dark:bg-slate-800 text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
                            <FunnelIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Role Tabs */}
            <div className="mb-6 border-b border-gray-100 dark:border-slate-800">
                <div className="flex gap-8">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-3 text-sm font-bold transition-all relative ${activeTab === tab.id
                                ? 'text-blue-600 border-b-2 border-blue-600'
                                : 'text-gray-500 hover:text-blue-600 border-b-2 border-transparent'
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                {tab.label}
                                <span className={`px-1.5 py-0.5 rounded text-[10px] ${activeTab === tab.id
                                    ? 'bg-blue-100 text-blue-600'
                                    : 'bg-gray-100 dark:bg-slate-800 text-gray-500'
                                    }`}>
                                    {tab.count}
                                </span>
                                {tab.pulse && (
                                    <span className="flex w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
                                )}
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* User Table */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-slate-800">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">User</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Plan / Role</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Join Date</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Status</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan="5" className="px-6 py-4 h-16 bg-gray-50/50 dark:bg-slate-800/20"></td>
                                    </tr>
                                ))
                            ) : users.length > 0 ? (
                                users.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/20 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold overflow-hidden">
                                                    {user.photoUrl ? (
                                                        <img src={user.photoUrl} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        user.firstName?.charAt(0)
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                                                        {user.firstName} {user.lastName}
                                                    </p>
                                                    <p className="text-xs text-gray-500">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {user.role === 'client' ? (
                                                <span className="px-2 py-1 text-[10px] font-bold bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded uppercase">
                                                    {user.subscriptions?.[0]?.plan?.name || 'NO PLAN'}
                                                </span>
                                            ) : (
                                                <span className="px-2 py-1 text-[10px] font-bold bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded uppercase">
                                                    {user.role}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(user.createdAt).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full w-fit ${getStatusStyles(user.status)}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'active' ? 'bg-green-600' : 'bg-red-600'
                                                    }`}></span>
                                                {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-1">
                                                <button className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-all" title="Edit">
                                                    <PencilSquareIcon className="w-5 h-5" />
                                                </button>
                                                <button className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-all" title="History">
                                                    <ClockIcon className="w-5 h-5" />
                                                </button>
                                                <button className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all" title="Reset Password">
                                                    <LockClosedIcon className="w-5 h-5" />
                                                </button>
                                                <button
                                                    className={`p-2 rounded-lg transition-all ${user.status === 'suspended'
                                                        ? 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                                                        : 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                                                        }`}
                                                    onClick={() => updateUser(user.id, { status: user.status === 'suspended' ? 'active' : 'suspended' })}
                                                    title={user.status === 'suspended' ? 'Activate' : 'Suspend'}
                                                >
                                                    {user.status === 'suspended' ? <CheckCircleIcon className="w-5 h-5" /> : <NoSymbolIcon className="w-5 h-5" />}
                                                </button>
                                                <button className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-all">
                                                    <EllipsisVerticalIcon className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                        No users found matching your filters.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 bg-gray-50 dark:bg-slate-800/20 flex items-center justify-between border-t border-gray-100 dark:border-slate-800">
                    <p className="text-xs text-gray-500">
                        Showing <span className="font-bold">{users.length}</span> users
                    </p>
                    <div className="flex gap-2">
                        <button className="px-4 py-1.5 rounded-xl border border-gray-100 dark:border-slate-700 text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-slate-800 transition-all">Previous</button>
                        <button className="px-4 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-md shadow-blue-500/10">1</button>
                        <button className="px-4 py-1.5 rounded-xl border border-gray-100 dark:border-slate-700 text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-slate-800 transition-all">2</button>
                        <button className="px-4 py-1.5 rounded-xl border border-gray-100 dark:border-slate-700 text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-slate-800 transition-all">Next</button>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Users;
