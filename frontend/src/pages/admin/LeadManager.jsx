import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusIcon, EnvelopeIcon, PhoneIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import leadsAPI from '../../api/leads';
import DataTable from '../../components/shared/DataTable';
import Modal from '../../components/shared/Modal';
import ConfirmDialog from '../../components/shared/ConfirmDialog';
import showToast from '../../components/shared/Toast';
import DashboardLayout from '../../components/layout/DashboardLayout';

const LeadManager = () => {
    const navigate = useNavigate();
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showQuoteModal, setShowQuoteModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [selectedLead, setSelectedLead] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    // Quote form state
    const [quoteAmount, setQuoteAmount] = useState('');
    const [quoteNotes, setQuoteNotes] = useState('');

    // Lead form state
    const [formData, setFormData] = useState({
        company: '',
        contactName: '',
        email: '',
        phone: '',
        projectType: '',
        budget: '',
        notes: ''
    });

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
            setSubmitting(true);
            await leadsAPI.createQuote(selectedLead.id, {
                amount: parseFloat(quoteAmount),
                notes: quoteNotes,
            });
            showToast.success('Quote created successfully');
            setShowQuoteModal(false);
            setQuoteAmount('');
            setQuoteNotes('');
            setSelectedLead(null);
            fetchLeads();
        } catch (error) {
            showToast.error('Failed to create quote');
        } finally {
            setSubmitting(false);
        }
    };

    const handleCreateLead = async () => {
        if (!formData.company || !formData.contactName || !formData.email) {
            showToast.error('Please fill in all required fields');
            return;
        }

        try {
            setSubmitting(true);
            await leadsAPI.createLead(formData);
            showToast.success('Lead created successfully');
            setShowCreateModal(false);
            resetForm();
            fetchLeads();
        } catch (error) {
            showToast.error('Failed to create lead');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEditLead = async () => {
        if (!selectedLead) return;

        try {
            setSubmitting(true);
            await leadsAPI.updateLead(selectedLead.id, formData);
            showToast.success('Lead updated successfully');
            setShowEditModal(false);
            setSelectedLead(null);
            resetForm();
            fetchLeads();
        } catch (error) {
            showToast.error('Failed to update lead');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteLead = async () => {
        if (!selectedLead) return;

        try {
            setSubmitting(true);
            await leadsAPI.deleteLead(selectedLead.id);
            showToast.success('Lead deleted successfully');
            setShowDeleteDialog(false);
            setSelectedLead(null);
            fetchLeads();
        } catch (error) {
            showToast.error('Failed to delete lead');
        } finally {
            setSubmitting(false);
        }
    };

    const openEditModal = (lead) => {
        setSelectedLead(lead);
        setFormData({
            company: lead.company || '',
            contactName: lead.contactName || '',
            email: lead.email || '',
            phone: lead.phone || '',
            projectType: lead.projectType || '',
            budget: lead.budget || '',
            notes: lead.notes || ''
        });
        setShowEditModal(true);
    };

    const openDeleteDialog = (lead) => {
        setSelectedLead(lead);
        setShowDeleteDialog(true);
    };

    const resetForm = () => {
        setFormData({
            company: '',
            contactName: '',
            email: '',
            phone: '',
            projectType: '',
            budget: '',
            notes: ''
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
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
                    {val || 'Not specified'}
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
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            openEditModal(row);
                        }}
                        className="p-2 rounded-xl text-gray-400 hover:bg-white hover:text-blue-600 hover:shadow-md transition-all"
                        title="Edit lead"
                    >
                        <PencilSquareIcon className="w-4 h-4" />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            openDeleteDialog(row);
                        }}
                        className="p-2 rounded-xl text-gray-400 hover:bg-white hover:text-red-600 hover:shadow-md transition-all"
                        title="Delete lead"
                    >
                        <TrashIcon className="w-4 h-4" />
                    </button>
                </div>
            ),
        },
    ];

    const stats = {
        new: (leads || []).filter(l => l.status === 'new').length,
        contacted: (leads || []).filter(l => l.status === 'contacted').length,
        quoted: (leads || []).filter(l => l.status === 'quoted').length,
        won: (leads || []).filter(l => l.status === 'won').length,
    };

    return (
        <DashboardLayout breadcrumbs={['Admin', 'Leads']}>
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">B2B Lead Manager</h1>
                        <p className="text-gray-500 font-medium">Manage enterprise leads and quotes</p>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:-translate-y-0.5 transition-all flex items-center gap-2"
                    >
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

            {/* Create Lead Modal */}
            <Modal
                isOpen={showCreateModal}
                onClose={() => {
                    setShowCreateModal(false);
                    resetForm();
                }}
                title="Create New Lead"
                size="lg"
            >
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Company Name *</label>
                            <input
                                type="text"
                                name="company"
                                value={formData.company}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                                placeholder="Acme Corp"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Contact Name *</label>
                            <input
                                type="text"
                                name="contactName"
                                value={formData.contactName}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                                placeholder="John Doe"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Email *</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                                placeholder="john@acme.com"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Phone</label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                                placeholder="+1 234 567 8900"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Project Type</label>
                            <input
                                type="text"
                                name="projectType"
                                value={formData.projectType}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                                placeholder="Website Redesign"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Budget</label>
                            <input
                                type="number"
                                name="budget"
                                value={formData.budget}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                                placeholder="50000"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Notes</label>
                        <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all resize-none"
                            rows={3}
                            placeholder="Additional information about the lead..."
                        />
                    </div>

                    <div className="flex items-center gap-3 pt-2">
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
                            onClick={handleCreateLead}
                            disabled={submitting}
                            className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50"
                        >
                            {submitting ? 'Creating...' : 'Create Lead'}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Edit Lead Modal */}
            <Modal
                isOpen={showEditModal}
                onClose={() => {
                    setShowEditModal(false);
                    setSelectedLead(null);
                    resetForm();
                }}
                title="Edit Lead"
                size="lg"
            >
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Company Name</label>
                            <input
                                type="text"
                                name="company"
                                value={formData.company}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Contact Name</label>
                            <input
                                type="text"
                                name="contactName"
                                value={formData.contactName}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Phone</label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Project Type</label>
                            <input
                                type="text"
                                name="projectType"
                                value={formData.projectType}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Budget</label>
                            <input
                                type="number"
                                name="budget"
                                value={formData.budget}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Notes</label>
                        <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all resize-none"
                            rows={3}
                        />
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                        <button
                            onClick={() => {
                                setShowEditModal(false);
                                setSelectedLead(null);
                                resetForm();
                            }}
                            disabled={submitting}
                            className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-black uppercase tracking-widest transition-all disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleEditLead}
                            disabled={submitting}
                            className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50"
                        >
                            {submitting ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Quote Modal */}
            <Modal
                isOpen={showQuoteModal}
                onClose={() => {
                    setShowQuoteModal(false);
                    setQuoteAmount('');
                    setQuoteNotes('');
                    setSelectedLead(null);
                }}
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
                            onClick={() => {
                                setShowQuoteModal(false);
                                setQuoteAmount('');
                                setQuoteNotes('');
                                setSelectedLead(null);
                            }}
                            disabled={submitting}
                            className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-black uppercase tracking-widest transition-all disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleCreateQuote}
                            disabled={submitting}
                            className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50"
                        >
                            {submitting ? 'Creating...' : 'Create Quote'}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                isOpen={showDeleteDialog}
                onClose={() => {
                    setShowDeleteDialog(false);
                    setSelectedLead(null);
                }}
                onConfirm={handleDeleteLead}
                title="Delete Lead"
                message={`Are you sure you want to delete the lead from ${selectedLead?.company}? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                variant="danger"
                loading={submitting}
            />
        </DashboardLayout >
    );
};

export default LeadManager;
