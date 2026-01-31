import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusIcon, EnvelopeIcon, PhoneIcon } from '@heroicons/react/24/outline';
import leadsAPI from '../../api/leads';
import DataTable from '../../components/shared/DataTable';
import Modal from '../../components/shared/Modal';
import showToast from '../../components/shared/Toast';
import DashboardLayout from '../../components/layout/DashboardLayout';

const LeadManager = () => {
    const navigate = useNavigate();
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showQuoteModal, setShowQuoteModal] = useState(false);
    const [selectedLead, setSelectedLead] = useState(null);
    const [quoteAmount, setQuoteAmount] = useState('');
    const [quoteNotes, setQuoteNotes] = useState('');

    useEffect(() => {
        fetchLeads();
    }, []);

    const fetchLeads = async () => {
        try {
            setLoading(true);
            const response = await leadsAPI.getAll();
            setLeads(response.data || []);
        } catch (error) {
            console.error('Failed to fetch leads:', error);
            showToast.error('Failed to load leads');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id, status) => {
        try {
            await leadsAPI.updateStatus(id, status);
            showToast.success('Lead status updated');
            fetchLeads();
        } catch (error) {
            showToast.error('Failed to update status');
        }
    };

    const handleCreateQuote = async () => {
        if (!quoteAmount || !quoteNotes) {
            showToast.error('Please fill in all fields');
            return;
        }

        try {
            await leadsAPI.createQuote(selectedLead.id, {
                amount: parseFloat(quoteAmount),
                notes: quoteNotes,
            });
            showToast.success('Quote created successfully');
            setShowQuoteModal(false);
            setQuoteAmount('');
            setQuoteNotes('');
            fetchLeads();
        } catch (error) {
            showToast.error('Failed to create quote');
        }
    };

    const columns = [
        {
            key: 'company',
            label: 'COMPANY',
            render: (val, row) => (
                <div>
                    <p className="text-white font-medium">{val}</p>
                    <p className="text-xs text-gray-400">{row.contactName}</p>
                </div>
            ),
        },
        {
            key: 'email',
            label: 'CONTACT',
            render: (val, row) => (
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <EnvelopeIcon className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-white">{val}</span>
                    </div>
                    {row.phone && (
                        <div className="flex items-center gap-2">
                            <PhoneIcon className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-white">{row.phone}</span>
                        </div>
                    )}
                </div>
            ),
        },
        {
            key: 'projectType',
            label: 'PROJECT TYPE',
            render: (val) => (
                <span className="px-2 py-1 bg-blue-500/10 text-blue-500 rounded text-xs">
                    {val}
                </span>
            ),
        },
        {
            key: 'budget',
            label: 'BUDGET',
            render: (val) => (
                <span className="text-white font-medium">
                    {val ? `$${val.toLocaleString()}` : 'Not specified'}
                </span>
            ),
        },
        {
            key: 'status',
            label: 'STATUS',
            render: (val) => (
                <span
                    className={`px-2 py-1 rounded text-xs font-medium ${val === 'new'
                        ? 'bg-blue-500/10 text-blue-500'
                        : val === 'contacted'
                            ? 'bg-yellow-500/10 text-yellow-500'
                            : val === 'quoted'
                                ? 'bg-purple-500/10 text-purple-500'
                                : val === 'won'
                                    ? 'bg-green-500/10 text-green-500'
                                    : 'bg-red-500/10 text-red-500'
                        }`}
                >
                    {val}
                </span>
            ),
        },
        {
            key: 'actions',
            label: 'ACTIONS',
            sortable: false,
            render: (val, row) => (
                <div className="flex items-center gap-2">
                    <select
                        value={row.status}
                        onChange={(e) => {
                            e.stopPropagation();
                            handleStatusUpdate(row.id, e.target.value);
                        }}
                        className="px-3 py-1 bg-gray-700 text-white rounded text-sm border border-gray-600 focus:border-blue-500 focus:outline-none"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="quoted">Quoted</option>
                        <option value="won">Won</option>
                        <option value="lost">Lost</option>
                    </select>
                    {row.status !== 'quoted' && row.status !== 'won' && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setSelectedLead(row);
                                setShowQuoteModal(true);
                            }}
                            className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm"
                        >
                            Quote
                        </button>
                    )}
                </div>
            ),
        },
    ];

    const stats = {
        new: leads.filter(l => l.status === 'new').length,
        contacted: leads.filter(l => l.status === 'contacted').length,
        quoted: leads.filter(l => l.status === 'quoted').length,
        won: leads.filter(l => l.status === 'won').length,
    };

    return (
        <DashboardLayout breadcrumbs={['Admin', 'Leads']}>
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">B2B Lead Manager</h1>
                        <p className="text-gray-400">Manage enterprise leads and quotes</p>
                    </div>
                    <button className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium flex items-center gap-2">
                        <PlusIcon className="w-5 h-5" />
                        Add Lead
                    </button>
                </div>
            </div>

            {/* Pipeline Stats */}
            <div className="grid grid-cols-4 gap-6 mb-8">
                <div className="bg-[#151B2E] rounded-lg p-6 border border-[#1E2638]">
                    <p className="text-sm text-gray-400 mb-2">New Leads</p>
                    <p className="text-3xl font-bold text-blue-500">{stats.new}</p>
                </div>
                <div className="bg-[#151B2E] rounded-lg p-6 border border-[#1E2638]">
                    <p className="text-sm text-gray-400 mb-2">Contacted</p>
                    <p className="text-3xl font-bold text-yellow-500">{stats.contacted}</p>
                </div>
                <div className="bg-[#151B2E] rounded-lg p-6 border border-[#1E2638]">
                    <p className="text-sm text-gray-400 mb-2">Quoted</p>
                    <p className="text-3xl font-bold text-purple-500">{stats.quoted}</p>
                </div>
                <div className="bg-[#151B2E] rounded-lg p-6 border border-[#1E2638]">
                    <p className="text-sm text-gray-400 mb-2">Won</p>
                    <p className="text-3xl font-bold text-green-500">{stats.won}</p>
                </div>
            </div>

            {/* Leads Table */}
            <DataTable
                columns={columns}
                data={leads}
                loading={loading}
                emptyMessage="No leads found"
            />

            {/* Quote Modal */}
            <Modal
                isOpen={showQuoteModal}
                onClose={() => setShowQuoteModal(false)}
                title="Create Quote"
            >
                <div className="space-y-4">
                    <div>
                        <p className="text-sm text-gray-400 mb-2">Company</p>
                        <p className="text-white font-medium">{selectedLead?.company}</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-white mb-2">
                            Quote Amount ($)
                        </label>
                        <input
                            type="number"
                            value={quoteAmount}
                            onChange={(e) => setQuoteAmount(e.target.value)}
                            className="w-full px-4 py-3 bg-[#0A0E1A] border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                            placeholder="50000"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-white mb-2">
                            Quote Notes
                        </label>
                        <textarea
                            value={quoteNotes}
                            onChange={(e) => setQuoteNotes(e.target.value)}
                            className="w-full px-4 py-3 bg-[#0A0E1A] border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none resize-none"
                            rows={4}
                            placeholder="Include project scope, timeline, deliverables..."
                        />
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowQuoteModal(false)}
                            className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleCreateQuote}
                            className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium"
                        >
                            Create Quote
                        </button>
                    </div>
                </div>
            </Modal>
        </DashboardLayout>
    );
};

export default LeadManager;
