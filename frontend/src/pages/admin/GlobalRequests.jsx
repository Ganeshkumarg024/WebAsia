import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Modal from '../../components/shared/Modal';
import useAdminStore from '../../store/adminStore';
import {
    MagnifyingGlassIcon,
    ArrowDownTrayIcon,
    PlusIcon,
    ArrowPathRoundedSquareIcon,
    ExclamationTriangleIcon,
    ClockIcon,
    CheckCircleIcon,
    DocumentTextIcon,
    EllipsisVerticalIcon,
    UserPlusIcon
} from '@heroicons/react/24/outline';

const GlobalRequests = () => {
    const { requests, designers, loading, fetchAdminRequests, fetchDesigners, bulkUpdateRequests } = useAdminStore();
    const [selectedRequests, setSelectedRequests] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({
        status: 'All Statuses',
        serviceType: 'All Services',
        designerId: 'All Designers',
        clientId: 'All Clients'
    });

    // Modal State
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [selectedDesignerId, setSelectedDesignerId] = useState('');
    const [assigningRequestIds, setAssigningRequestIds] = useState([]); // IDs to assign

    useEffect(() => {
        fetchAdminRequests({ ...filters, search: searchQuery });
    }, [filters, searchQuery]);

    useEffect(() => {
        // Fetch designers for the filter and assignment dropdowns
        fetchDesigners();
    }, []);

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedRequests((requests || []).map(r => r.id));
        } else {
            setSelectedRequests([]);
        }
    };

    const handleSelectOne = (id) => {
        if (selectedRequests.includes(id)) {
            setSelectedRequests(selectedRequests.filter(ri => ri !== id));
        } else {
            setSelectedRequests([...selectedRequests, id]);
        }
    };

    const openAssignModal = (ids) => {
        setAssigningRequestIds(ids);
        setSelectedDesignerId('');
        setIsAssignModalOpen(true);
    };

    const handleAssignDesigner = async () => {
        if (!selectedDesignerId || assigningRequestIds.length === 0) return;

        await bulkUpdateRequests({
            requestIds: assigningRequestIds,
            designerId: selectedDesignerId,
            status: 'assigned' // Automatically update status to assigned
        });

        // Refresh with current filters to ensure UI is consistent
        // (Since the store action might fetch default list)
        fetchAdminRequests({ ...filters, search: searchQuery });

        setIsAssignModalOpen(false);
        setAssigningRequestIds([]);
        setSelectedRequests([]); // Clear selection after bulk action
    };

    const getPriorityStyles = (priority) => {
        switch (priority) {
            case 'urgent':
                return 'bg-red-100 text-red-700';
            default:
                return 'bg-blue-100 text-blue-700';
        }
    };

    const getSLAStatus = (deadline) => {
        if (!deadline) return null;
        const now = new Date();
        const dl = new Date(deadline);
        const diff = dl - now;
        const hours = Math.floor(diff / (1000 * 60 * 60));

        if (diff < 0) {
            return {
                label: `Overdue (${Math.abs(hours)}h)`,
                icon: <ExclamationTriangleIcon className="w-5 h-5" />,
                color: 'text-red-500'
            };
        } else if (hours < 4) {
            return {
                label: `Critical (${hours}h)`,
                icon: <ExclamationTriangleIcon className="w-5 h-5" />,
                color: 'text-red-600 font-bold'
            };
        } else if (hours < 12) {
            return {
                label: `${hours}h remaining`,
                icon: <ClockIcon className="w-5 h-5" />,
                color: 'text-orange-500'
            };
        } else {
            return {
                label: `${hours}h remaining`,
                icon: <CheckCircleIcon className="w-5 h-5" />,
                color: 'text-green-500'
            };
        }
    };

    // Toggle row action menu (simplified for now, ideally strictly controlled or use a library)
    // For this implementation, I'll just put the button there. A real dropdown needs more state or a headless UI component.
    // I will add a simple direct action button for "Assign" instead of a dropdown to keep it clean and robust for now.

    return (
        <DashboardLayout breadcrumbs={['Admin', 'Global Requests']}>
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Global Request Management</h1>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-100 bg-white text-gray-700 text-sm font-bold hover:bg-gray-50 transition-all">
                        <ArrowDownTrayIcon className="w-5 h-5" />
                        Export
                    </button>
                    <div className="w-px h-8 bg-gray-100 mx-1"></div>
                    <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all">
                        <PlusIcon className="w-5 h-5" />
                        New Request
                    </button>
                </div>
            </div>

            <div className="p-8 bg-white rounded-2xl border border-gray-100 shadow-sm mb-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {Object.keys(filters).map((key) => (
                        <div key={key}>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-wider">
                                {key.replace(/([A-Z])/g, ' $1').toUpperCase()}
                            </label>
                            <select
                                className="w-full bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500/50 text-gray-900 py-2 px-4"
                                value={filters[key]}
                                onChange={(e) => setFilters({ ...filters, [key]: e.target.value })}
                            >
                                <option>All {key.charAt(0).toUpperCase() + key.slice(1).replace('Id', '')}s</option>
                                {/* Populate designers filter */}
                                {key === 'designerId' && (designers || []).map(d => (
                                    <option key={d.id} value={d.id}>{d.firstName} {d.lastName}</option>
                                ))}
                            </select>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-500">
                        {selectedRequests.length} items selected
                    </span>
                    {selectedRequests.length > 0 && (
                        <>
                            <button
                                onClick={() => openAssignModal(selectedRequests)}
                                className="px-4 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 text-sm font-bold text-gray-900 dark:text-white border border-gray-100 dark:border-slate-700 flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-slate-700 transition-all"
                            >
                                <UserPlusIcon className="w-5 h-5" />
                                Bulk Assign
                            </button>
                            <button className="px-4 py-2 rounded-xl bg-gray-50 text-sm font-bold text-gray-900 border border-gray-100 flex items-center gap-2 hover:bg-gray-100 transition-all">
                                <ArrowPathRoundedSquareIcon className="w-5 h-5" />
                                Update Status
                            </button>
                        </>
                    )}
                </div>
                <div className="relative max-w-xs w-full">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search requests..."
                        className="w-full pl-10 pr-4 py-2 bg-white border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-gray-400 text-gray-900"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 w-10">
                                    <input
                                        type="checkbox"
                                        className="rounded text-blue-600 focus:ring-blue-500 bg-transparent"
                                        checked={selectedRequests.length === (requests?.length || 0) && (requests?.length || 0) > 0}
                                        onChange={handleSelectAll}
                                    />
                                </th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Request ID</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Client</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Assigned Designer</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Current Manager</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Priority</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">SLA Deadline</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan="8" className="px-6 py-4 h-16 bg-gray-50/50"></td>
                                    </tr>
                                ))
                            ) : (requests || []).length > 0 ? (
                                (requests || []).map((request) => {
                                    const sla = getSLAStatus(request.deadline);
                                    return (
                                        <tr key={request.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <input
                                                    type="checkbox"
                                                    className="rounded text-blue-600 focus:ring-blue-500 bg-transparent"
                                                    checked={selectedRequests.includes(request.id)}
                                                    onChange={() => handleSelectOne(request.id)}
                                                />
                                            </td>
                                            <td className="px-6 py-4">
                                                <Link
                                                    to={`/admin/requests/${request.id}`}
                                                    className="text-xs font-mono font-bold text-blue-600 hover:text-blue-800 hover:underline transition-all"
                                                >
                                                    #{request.id.slice(0, 8).toUpperCase()}
                                                </Link>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm font-bold text-gray-900">{request.client?.firstName} {request.client?.lastName}</p>
                                                <p className="text-[11px] text-gray-500">{request.client?.subscriptions?.[0]?.plan?.name || 'Standard'}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                {request.designer ? (
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 rounded-full bg-blue-100 overflow-hidden">
                                                            {request.designer.photoUrl ? (
                                                                <img src={request.designer.photoUrl} alt="" className="w-full h-full object-cover" />
                                                            ) : (
                                                                <span className="text-[10px] font-bold text-blue-600 flex items-center justify-center h-full">
                                                                    {request.designer?.firstName?.charAt(0)}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <span className="text-sm text-gray-900">{request.designer.firstName} {request.designer.lastName}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-gray-400 italic">Unassigned</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-gray-900">
                                                    {request.manager ? `${request.manager.firstName} ${request.manager.lastName}` : 'Unassigned'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 text-[10px] font-bold rounded uppercase ${getPriorityStyles(request.priority)}`}>
                                                    {request.priority}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {sla ? (
                                                    <div className={`flex items-center gap-2 text-sm ${sla.color}`}>
                                                        {sla.icon}
                                                        <span>{sla.label}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-gray-400">-</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => openAssignModal([request.id])}
                                                        className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-all"
                                                        title="Assign Designer"
                                                    >
                                                        <UserPlusIcon className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => navigate(`/admin/requests/${request.id}`)}
                                                        className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 transition-all"
                                                        title="Review Request"
                                                    >
                                                        <DocumentTextIcon className="w-5 h-5" />
                                                    </button>
                                                    <button className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 transition-all">
                                                        <EllipsisVerticalIcon className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="8" className="px-6 py-12 text-center text-gray-500 italic">
                                        No requests found matching your filters.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="px-6 py-4 bg-gray-50 flex items-center justify-between border-t border-gray-100">
                    <p className="text-xs text-gray-500">
                        Showing <span className="font-bold">{requests.length}</span> requests
                    </p>
                    <div className="flex gap-2">
                        <button className="px-4 py-1.5 rounded-xl border border-gray-100 text-xs font-bold text-gray-600 hover:bg-white transition-all disabled:opacity-50" disabled>Previous</button>
                        <button className="px-4 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-md shadow-blue-500/10">1</button>
                        <button className="px-4 py-1.5 rounded-xl border border-gray-100 text-xs font-bold text-gray-600 hover:bg-white transition-all">2</button>
                        <button className="px-4 py-1.5 rounded-xl border border-gray-100 text-xs font-bold text-gray-600 hover:bg-white transition-all">Next</button>
                    </div>
                </div>
            </div>

            {/* Assignment Modal */}
            <Modal
                isOpen={isAssignModalOpen}
                onClose={() => setIsAssignModalOpen(false)}
                title="Assign Designer"
                size="md"
            >
                <div>
                    <p className="text-sm text-gray-500 mb-6">
                        Select a designer to assign to the selected <strong>{assigningRequestIds.length}</strong> request(s).
                    </p>

                    <div className="space-y-4">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                            Choose Designer
                        </label>
                        <select
                            className="w-full bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500/50 text-gray-900 py-3 px-4"
                            value={selectedDesignerId}
                            onChange={(e) => setSelectedDesignerId(e.target.value)}
                        >
                            <option value="">Select a designer</option>
                            {designers.map((designer) => (
                                <option key={designer.id} value={designer.id}>
                                    {designer.firstName} {designer.lastName} ({designer.activeTasks || 0} active tasks)
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="mt-8 flex justify-end gap-3">
                        <button
                            onClick={() => setIsAssignModalOpen(false)}
                            className="px-4 py-2 rounded-xl border border-gray-100 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleAssignDesigner}
                            disabled={!selectedDesignerId}
                            className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Assign Designer
                        </button>
                    </div>
                </div>
            </Modal>
        </DashboardLayout>
    );
};

export default GlobalRequests;
