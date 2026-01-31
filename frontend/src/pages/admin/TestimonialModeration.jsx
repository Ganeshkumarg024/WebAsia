import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircleIcon, XCircleIcon, EyeIcon } from '@heroicons/react/24/outline';
import adminAPI from '../../api/admin';
import testimonialAPI from '../../api/testimonials';
import DataTable from '../../components/shared/DataTable';
import Modal from '../../components/shared/Modal';
import showToast from '../../components/shared/Toast';
import DashboardLayout from '../../components/layout/DashboardLayout';

const TestimonialModeration = () => {
    const navigate = useNavigate();
    const [testimonials, setTestimonials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTestimonial, setSelectedTestimonial] = useState(null);
    const [showPreview, setShowPreview] = useState(false);

    useEffect(() => {
        fetchTestimonials();
    }, []);

    const fetchTestimonials = async () => {
        try {
            setLoading(true);
            const response = await testimonialAPI.getAll();
            setTestimonials(response.data || []);
        } catch (error) {
            console.error('Failed to fetch testimonials:', error);
            showToast.error('Failed to load testimonials');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        try {
            await testimonialAPI.approve(id);
            showToast.success('Testimonial approved');
            fetchTestimonials();
        } catch (error) {
            showToast.error('Failed to approve testimonial');
        }
    };

    const handleReject = async (id) => {
        try {
            await testimonialAPI.reject(id);
            showToast.success('Testimonial rejected');
            fetchTestimonials();
        } catch (error) {
            showToast.error('Failed to reject testimonial');
        }
    };

    const handlePreview = (testimonial) => {
        setSelectedTestimonial(testimonial);
        setShowPreview(true);
    };

    const columns = [
        {
            key: 'client',
            label: 'CLIENT',
            render: (val, row) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                        {row.clientName?.charAt(0) || 'U'}
                    </div>
                    <div>
                        <p className="text-white font-medium">{row.clientName}</p>
                        <p className="text-xs text-gray-400">{row.company}</p>
                    </div>
                </div>
            ),
        },
        {
            key: 'rating',
            label: 'RATING',
            render: (val) => (
                <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                        <span key={i} className={i < val ? 'text-yellow-500' : 'text-gray-600'}>
                            ★
                        </span>
                    ))}
                </div>
            ),
        },
        {
            key: 'message',
            label: 'MESSAGE',
            render: (val) => (
                <p className="text-sm text-gray-300 truncate max-w-md">{val}</p>
            ),
        },
        {
            key: 'status',
            label: 'STATUS',
            render: (val) => (
                <span
                    className={`px-2 py-1 rounded text-xs font-medium ${val === 'approved'
                        ? 'bg-green-500/10 text-green-500'
                        : val === 'rejected'
                            ? 'bg-red-500/10 text-red-500'
                            : 'bg-yellow-500/10 text-yellow-500'
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
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handlePreview(row);
                        }}
                        className="p-2 hover:bg-gray-700 rounded transition-colors"
                        title="Preview"
                    >
                        <EyeIcon className="w-4 h-4 text-blue-500" />
                    </button>
                    {row.status === 'pending' && (
                        <>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleApprove(row.id);
                                }}
                                className="p-2 hover:bg-gray-700 rounded transition-colors"
                                title="Approve"
                            >
                                <CheckCircleIcon className="w-4 h-4 text-green-500" />
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleReject(row.id);
                                }}
                                className="p-2 hover:bg-gray-700 rounded transition-colors"
                                title="Reject"
                            >
                                <XCircleIcon className="w-4 h-4 text-red-500" />
                            </button>
                        </>
                    )}
                </div>
            ),
        },
    ];

    const pendingCount = testimonials.filter(t => t.status === 'pending').length;
    const approvedCount = testimonials.filter(t => t.status === 'approved').length;

    return (
        <DashboardLayout breadcrumbs={['Admin', 'Testimonials']}>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Testimonial Moderation</h1>
                <p className="text-gray-400">Review and approve client testimonials</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mb-8">
                <div className="bg-[#151B2E] rounded-lg p-6 border border-[#1E2638]">
                    <p className="text-sm text-gray-400 mb-2">Pending Review</p>
                    <p className="text-3xl font-bold text-yellow-500">{pendingCount}</p>
                </div>
                <div className="bg-[#151B2E] rounded-lg p-6 border border-[#1E2638]">
                    <p className="text-sm text-gray-400 mb-2">Approved</p>
                    <p className="text-3xl font-bold text-green-500">{approvedCount}</p>
                </div>
                <div className="bg-[#151B2E] rounded-lg p-6 border border-[#1E2638]">
                    <p className="text-sm text-gray-400 mb-2">Total</p>
                    <p className="text-3xl font-bold text-white">{testimonials.length}</p>
                </div>
            </div>

            {/* Table */}
            <DataTable
                columns={columns}
                data={testimonials}
                loading={loading}
                onRowClick={handlePreview}
                emptyMessage="No testimonials found"
            />

            {/* Preview Modal */}
            <Modal
                isOpen={showPreview}
                onClose={() => setShowPreview(false)}
                title="Testimonial Preview"
            >
                {selectedTestimonial && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-medium">
                                {selectedTestimonial.clientName?.charAt(0) || 'U'}
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">{selectedTestimonial.clientName}</h3>
                                <p className="text-gray-400">{selectedTestimonial.company}</p>
                                <div className="flex items-center gap-1 mt-1">
                                    {[...Array(5)].map((_, i) => (
                                        <span
                                            key={i}
                                            className={i < selectedTestimonial.rating ? 'text-yellow-500' : 'text-gray-600'}
                                        >
                                            ★
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-[#0A0E1A] rounded-lg">
                            <p className="text-gray-300 italic">"{selectedTestimonial.message}"</p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <p className="text-xs text-gray-400 mb-1">PROJECT</p>
                                <p className="text-white">{selectedTestimonial.projectName || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 mb-1">DATE</p>
                                <p className="text-white">{selectedTestimonial.createdAt || 'N/A'}</p>
                            </div>
                        </div>

                        {selectedTestimonial.status === 'pending' && (
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => {
                                        handleReject(selectedTestimonial.id);
                                        setShowPreview(false);
                                    }}
                                    className="flex-1 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg font-medium"
                                >
                                    Reject
                                </button>
                                <button
                                    onClick={() => {
                                        handleApprove(selectedTestimonial.id);
                                        setShowPreview(false);
                                    }}
                                    className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium"
                                >
                                    Approve
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </DashboardLayout>
    );
};

export default TestimonialModeration;
