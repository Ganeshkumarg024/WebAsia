import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusIcon } from '@heroicons/react/24/outline';
import DashboardLayout from '../../components/layout/DashboardLayout';
import useRequestStore from '../../store/requestStore';
import DataTable from '../../components/shared/DataTable';
import StatusBadge from '../../components/shared/StatusBadge';
import Tabs from '../../components/shared/Tabs';

const MyRequests = () => {
    const navigate = useNavigate();
    const { requests, fetchRequests, isLoading } = useRequestStore();
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

    const columns = [
        {
            key: 'title',
            label: 'REQUEST',
            sortable: true,
            render: (val, row) => (
                <div>
                    <p className="text-white font-medium">{val}</p>
                    <p className="text-xs text-gray-400">{row.category}</p>
                </div>
            ),
        },
        {
            key: 'status',
            label: 'STATUS',
            render: (val) => <StatusBadge status={val} />,
        },
        {
            key: 'priority',
            label: 'PRIORITY',
            render: (val) => <StatusBadge status={val} size="sm" />,
        },
        {
            key: 'designer',
            label: 'DESIGNER',
            render: (val) => (
                <span className="text-sm text-white">{val?.name || 'Unassigned'}</span>
            ),
        },
        {
            key: 'createdAt',
            label: 'CREATED',
            render: (val) => (
                <span className="text-sm text-white">
                    {val ? new Date(val).toLocaleDateString() : 'N/A'}
                </span>
            ),
        },
    ];

    const filteredRequests = filter === 'all'
        ? requests
        : requests.filter(r => r.status === filter);

    const tabs = [
        {
            label: 'All',
            count: requests.length,
            content: (
                <DataTable
                    columns={columns}
                    data={requests}
                    loading={isLoading}
                    onRowClick={(row) => navigate(`/client/requests/${row.id}`)}
                />
            ),
        },
        {
            label: 'Active',
            count: requests.filter(r => r.status === 'in-progress' || r.status === 'in-review').length,
            content: (
                <DataTable
                    columns={columns}
                    data={requests.filter(r => r.status === 'in-progress' || r.status === 'in-review')}
                    loading={isLoading}
                    onRowClick={(row) => navigate(`/client/requests/${row.id}`)}
                />
            ),
        },
        {
            label: 'Completed',
            count: requests.filter(r => r.status === 'completed').length,
            content: (
                <DataTable
                    columns={columns}
                    data={requests.filter(r => r.status === 'completed')}
                    loading={isLoading}
                    onRowClick={(row) => navigate(`/client/requests/${row.id}`)}
                />
            ),
        },
    ];

    return (
        <DashboardLayout breadcrumbs={['Requests', 'All Requests']}>
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">My Requests</h1>
                        <p className="text-gray-400">View and manage all your creative requests</p>
                    </div>
                    <button
                        onClick={() => navigate('/client/requests/new')}
                        className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium flex items-center gap-2"
                    >
                        <PlusIcon className="w-5 h-5" />
                        New Request
                    </button>
                </div>
            </div>

            <Tabs tabs={tabs} />
        </DashboardLayout>
    );
};

export default MyRequests;
