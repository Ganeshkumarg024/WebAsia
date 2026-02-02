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
            const response = await leadsAPI.getLeads();
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
                    <p className="text-gray-900 font-bold">{val}</p>
                    <p className="text-xs text-gray-500">{row.contactName}</p>
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
                        <span className="text-sm text-gray-600 font-medium">{val}</span>
                    </div>
                    {row.phone && (
                        <div className="flex items-center gap-2">
                            <PhoneIcon className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600 font-medium">{row.phone}</span>
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
                <span className="text-gray-900 font-bold">
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
                        className="px-3 py-1.5 bg-white text-gray-700 rounded-lg text-xs font-bold border border-gray-200 focus:border-blue-500 focus:outline-none shadow-sm uppercase tracking-wider"
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
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider shadow-lg shadow-blue-500/20 transition-all"
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
                        <h1 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">B2B Lead Manager</h1>
                        <p className="text-gray-500 font-medium">Manage enterprise leads and quotes</p>
                    </div>
                    <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:-translate-y-0.5 transition-all flex items-center gap-2">
                        <PlusIcon className="w-5 h-5" />
                        Add Lead
                    </button>
                </div>
            </div>

            {/* Pipeline Stats */}
            <div className="grid grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">New Leads</p>
                    <p className="text-3xl font-black text-blue-600">{stats.new}</p>
                </div>
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Contacted</p>
                    <p className="text-3xl font-black text-yellow-500">{stats.contacted}</p>
                </div>
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Quoted</p>
                    <p className="text-3xl font-black text-purple-600">{stats.quoted}</p>
                </div>
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Won</p>
                    <p className="text-3xl font-black text-green-600">{stats.won}</p>
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
                <div className="space-y-6">
                    <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Company</p>
                        <p className="text-gray-900 font-bold text-lg">{selectedLead?.company}</p>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                            Quote Amount ($)
                        </label>
                        <input
                            type="number"
                            value={quoteAmount}
                            onChange={(e) => setQuoteAmount(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                            placeholder="50000"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                            Quote Notes
                        </label>
                        <textarea
                            value={quoteNotes}
                            onChange={(e) => setQuoteNotes(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all resize-none"
                            rows={4}
                            placeholder="Include project scope, timeline, deliverables..."
                        />
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                        <button
                            onClick={() => setShowQuoteModal(false)}
                            className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleCreateQuote}
                            className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 transition-all"
                        >
                            Create Quote
                        </button>
                    </div>
                </div>
            </Modal>
        </DashboardLayout >
    );
};

export default LeadManager;
