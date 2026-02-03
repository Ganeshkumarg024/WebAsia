import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import useAdminStore from '../../store/adminStore';
import Modal from '../../components/shared/Modal';
import ConfirmDialog from '../../components/shared/ConfirmDialog';
import showToast from '../../components/shared/Toast';
import {
    MagnifyingGlassIcon,
    FunnelIcon,
    UserPlusIcon,
    PencilSquareIcon,
    ClockIcon,
    NoSymbolIcon,
    CheckCircleIcon,
    TrashIcon
} from '@heroicons/react/24/outline';

const Users = () => {
    const { users, loading, fetchUsers, createUser, updateUser, deleteUser } = useAdminStore();
    const [activeTab, setActiveTab] = useState('client');
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // Modal states
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        role: 'client',
        status: 'active'
    });

    useEffect(() => {
        fetchUsers({ role: activeTab, search: searchQuery, status: statusFilter === 'all' ? undefined : statusFilter });
    }, [activeTab, searchQuery, statusFilter]);

    const tabs = [
        { id: 'client', label: 'Clients', count: users.filter(u => u.role === 'client').length },
        { id: 'designer', label: 'Designers', count: users.filter(u => u.role === 'designer').length },
        { id: 'manager', label: 'Managers', count: users.filter(u => u.role === 'manager').length },
        { id: 'affiliate', label: 'Affiliates', count: users.filter(u => u.role === 'affiliate').length },
    ];

    const getStatusStyles = (status) => {
        switch (status) {
            case 'active':
                return 'text-green-700 bg-green-50 border border-green-200';
            case 'suspended':
                return 'text-red-700 bg-red-50 border border-red-200';
            case 'inactive':
                return 'text-gray-700 bg-gray-50 border border-gray-200';
            default:
                return 'text-orange-700 bg-orange-50 border border-orange-200';
        }
    };

    const handleCreateUser = async () => {
        if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
            showToast.error('Please fill in all required fields');
            return;
        }

        setSubmitting(true);
        const result = await createUser(formData);
        setSubmitting(false);

        if (result.success) {
            showToast.success('User created successfully');
            setShowCreateModal(false);
            resetForm();
            fetchUsers({ role: activeTab });
        } else {
            showToast.error(result.error || 'Failed to create user');
        }
    };

    const handleEditUser = async () => {
        if (!selectedUser) return;

        setSubmitting(true);
        const result = await updateUser(selectedUser.id, formData);
        setSubmitting(false);

        if (result.success) {
            showToast.success('User updated successfully');
            setShowEditModal(false);
            setSelectedUser(null);
            resetForm();
        } else {
            showToast.error(result.error || 'Failed to update user');
        }
    };

    const handleDeleteUser = async () => {
        if (!selectedUser) return;

        setSubmitting(true);
        const result = await deleteUser(selectedUser.id);
        setSubmitting(false);

        if (result.success) {
            showToast.success('User deleted successfully');
            setShowDeleteDialog(false);
            setSelectedUser(null);
        } else {
            showToast.error(result.error || 'Failed to delete user');
        }
    };

    const openEditModal = (user) => {
        setSelectedUser(user);
        setFormData({
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            email: user.email || '',
            role: user.role || 'client',
            status: user.status || 'active',
            password: '' // Don't populate password
        });
        setShowEditModal(true);
    };

    const openDeleteDialog = (user) => {
        setSelectedUser(user);
        setShowDeleteDialog(true);
    };

    const resetForm = () => {
        setFormData({
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            role: 'client',
            status: 'active'
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <DashboardLayout breadcrumbs={['Admin', 'User Management']}>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Universal User Management</h1>
                    <p className="text-gray-500 font-medium mt-1">Manage platform-wide user roles and permissions</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-sm font-bold shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-1"
                >
                    <UserPlusIcon className="w-5 h-5" />
                    Add New User
                </button>
            </div>

            {/* Filters & Search */}
            <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] mb-8">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex-1 min-w-[300px] relative">
                        <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name, email, or company..."
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 font-medium"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <select
                                className="appearance-none bg-gray-50 border border-gray-100 rounded-2xl text-sm text-gray-700 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 px-6 py-3 pr-10 cursor-pointer"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="all">All Status</option>
                                <option value="active">Active</option>
                                <option value="suspended">Suspended</option>
                                <option value="pending">Pending</option>
                            </select>
                            <FunnelIcon className="w-4 h-4 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Role Tabs */}
            <div className="mb-8">
                <div className="flex gap-4 p-2 bg-gray-50/50 rounded-2xl border border-gray-100 w-fit">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-6 py-2.5 text-sm font-bold rounded-xl transition-all relative flex items-center gap-3 ${activeTab === tab.id
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'
                                }`}
                        >
                            {tab.label}
                            <span className={`px-2 py-0.5 rounded-lg text-[10px] ${activeTab === tab.id
                                ? 'bg-blue-50 text-blue-600'
                                : 'bg-gray-200 text-gray-600'
                                }`}>
                                {tab.count}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* User Table */}
            <div className="bg-white rounded-[32px] border border-gray-100 overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-100">
                                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-gray-400">User Profile</th>
                                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-gray-400">Role / Plan</th>
                                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-gray-400">Join Date</th>
                                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-gray-400">Status</th>
                                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-gray-400 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan="5" className="px-8 py-6 h-20 bg-gray-50"></td>
                                    </tr>
                                ))
                            ) : users.length > 0 ? (
                                users.map((user) => (
                                    <tr key={user.id} className="hover:bg-blue-50/30 transition-colors group">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-gray-100 border-2 border-white shadow-sm flex items-center justify-center text-gray-500 font-black text-lg overflow-hidden shrink-0">
                                                    {user.photoUrl ? (
                                                        <img src={user.photoUrl} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        user.firstName?.charAt(0)
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                                        {user.firstName} {user.lastName}
                                                    </p>
                                                    <p className="text-xs font-medium text-gray-400">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            {user.role === 'client' ? (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-black bg-blue-50 text-blue-600 rounded-lg uppercase tracking-wider border border-blue-100">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                                                    {user.subscriptions?.[0]?.plan?.name || 'Standard'}
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-black bg-purple-50 text-purple-600 rounded-lg uppercase tracking-wider border border-purple-100">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-purple-600"></span>
                                                    {user.role}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-2 text-sm font-bold text-gray-500">
                                                <ClockIcon className="w-4 h-4 text-gray-300" />
                                                {new Date(user.createdAt).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${getStatusStyles(user.status)}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'active' ? 'bg-green-600' : 'bg-red-600'
                                                    }`}></span>
                                                {user.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => openEditModal(user)}
                                                    className="p-2 rounded-xl text-gray-400 hover:bg-white hover:text-blue-600 hover:shadow-md transition-all"
                                                    title="Edit user"
                                                >
                                                    <PencilSquareIcon className="w-4 h-4" />
                                                </button>
                                                <button
                                                    className={`p-2 rounded-xl hover:shadow-md transition-all ${user.status === 'suspended'
                                                        ? 'text-green-600 hover:bg-white'
                                                        : 'text-red-400 hover:bg-white hover:text-red-600'
                                                        }`}
                                                    onClick={() => updateUser(user.id, { status: user.status === 'suspended' ? 'active' : 'suspended' })}
                                                    title={user.status === 'suspended' ? 'Activate user' : 'Suspend user'}
                                                >
                                                    {user.status === 'suspended' ? <CheckCircleIcon className="w-4 h-4" /> : <NoSymbolIcon className="w-4 h-4" />}
                                                </button>
                                                <button
                                                    onClick={() => openDeleteDialog(user)}
                                                    className="p-2 rounded-xl text-gray-400 hover:bg-white hover:text-red-600 hover:shadow-md transition-all"
                                                    title="Delete user"
                                                >
                                                    <TrashIcon className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-8 py-20 text-center text-gray-500">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
                                                <MagnifyingGlassIcon className="w-8 h-8 text-gray-300" />
                                            </div>
                                            <p className="font-bold">No users found</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-8 py-6 bg-gray-50 flex items-center justify-between border-t border-gray-100">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Showing <span className="text-gray-900">{users.length}</span> Results
                    </p>
                    <div className="flex gap-2">
                        <button className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-xs font-black text-gray-400 hover:text-gray-900 transition-all uppercase tracking-wider disabled:opacity-50">Previous</button>
                        <button className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-blue-600/20">1</button>
                        <button className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-xs font-black text-gray-400 hover:text-gray-900 transition-all uppercase tracking-wider">Next</button>
                    </div>
                </div>
            </div>

            {/* Create User Modal */}
            <Modal
                isOpen={showCreateModal}
                onClose={() => {
                    setShowCreateModal(false);
                    resetForm();
                }}
                title="Create New User"
                size="lg"
            >
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">First Name *</label>
                            <input
                                type="text"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                                placeholder="John"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Last Name *</label>
                            <input
                                type="text"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                                placeholder="Doe"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Email *</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                            placeholder="john.doe@example.com"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Password *</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                            placeholder="••••••••"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Role *</label>
                            <select
                                name="role"
                                value={formData.role}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all cursor-pointer"
                            >
                                <option value="client">Client</option>
                                <option value="designer">Designer</option>
                                <option value="manager">Manager</option>
                                <option value="affiliate">Affiliate</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Status *</label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all cursor-pointer"
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                                <option value="suspended">Suspended</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 pt-4">
                        <button
                            onClick={() => {
                                setShowCreateModal(false);
                                resetForm();
                            }}
                            disabled={submitting}
                            className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-black uppercase tracking-widest transition-all disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleCreateUser}
                            disabled={submitting}
                            className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-black uppercase tracking-widest shadow-lg shadow-blue-600/20 transition-all disabled:opacity-50"
                        >
                            {submitting ? 'Creating...' : 'Create User'}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Edit User Modal */}
            <Modal
                isOpen={showEditModal}
                onClose={() => {
                    setShowEditModal(false);
                    setSelectedUser(null);
                    resetForm();
                }}
                title="Edit User"
                size="lg"
            >
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">First Name</label>
                            <input
                                type="text"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Last Name</label>
                            <input
                                type="text"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            disabled
                            className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 font-medium cursor-not-allowed"
                        />
                        <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Role</label>
                            <select
                                name="role"
                                value={formData.role}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all cursor-pointer"
                            >
                                <option value="client">Client</option>
                                <option value="designer">Designer</option>
                                <option value="manager">Manager</option>
                                <option value="affiliate">Affiliate</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Status</label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all cursor-pointer"
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                                <option value="suspended">Suspended</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 pt-4">
                        <button
                            onClick={() => {
                                setShowEditModal(false);
                                setSelectedUser(null);
                                resetForm();
                            }}
                            disabled={submitting}
                            className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-black uppercase tracking-widest transition-all disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleEditUser}
                            disabled={submitting}
                            className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-black uppercase tracking-widest shadow-lg shadow-blue-600/20 transition-all disabled:opacity-50"
                        >
                            {submitting ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                isOpen={showDeleteDialog}
                onClose={() => {
                    setShowDeleteDialog(false);
                    setSelectedUser(null);
                }}
                onConfirm={handleDeleteUser}
                title="Delete User"
                message={`Are you sure you want to delete ${selectedUser?.firstName} ${selectedUser?.lastName}? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                variant="danger"
                loading={submitting}
            />
        </DashboardLayout>
    );
};

export default Users;
