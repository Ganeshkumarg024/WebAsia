import { useEffect, useState } from 'react';
import { PhotoIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import affiliateAPI from '../../api/affiliate';
import DashboardLayout from '../../components/layout/DashboardLayout';
import showToast from '../../components/shared/Toast';

const AffiliateResourcesAdmin = () => {
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [formData, setFormData] = useState({
        title: '', description: '', category: 'banner', fileUrl: '', thumbnailUrl: '', fileName: '', fileSize: 0, dimensions: ''
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchResources();
    }, []);

    const fetchResources = async () => {
        try {
            setLoading(true);
            const res = await affiliateAPI.adminGetResources();
            setResources(res.data || []);
        } catch (error) {
            console.error('Failed to fetch resources:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!formData.title || !formData.fileUrl) {
            showToast.error('Title and File URL are required');
            return;
        }
        try {
            setSubmitting(true);
            await affiliateAPI.adminCreateResource(formData);
            showToast.success('Resource created!');
            setShowCreateForm(false);
            setFormData({ title: '', description: '', category: 'banner', fileUrl: '', thumbnailUrl: '', fileName: '', fileSize: 0, dimensions: '' });
            fetchResources();
        } catch (error) {
            showToast.error('Failed to create resource');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this resource?')) return;
        try {
            await affiliateAPI.adminDeleteResource(id);
            showToast.success('Resource deleted');
            fetchResources();
        } catch (error) {
            showToast.error('Failed to delete resource');
        }
    };

    const handleToggle = async (id) => {
        try {
            await affiliateAPI.adminToggleResource(id);
            showToast.success('Resource toggled');
            fetchResources();
        } catch (error) {
            showToast.error('Failed to toggle resource');
        }
    };

    const categoryColors = {
        banner: 'bg-blue-50 text-blue-600',
        social: 'bg-purple-50 text-purple-600',
        email: 'bg-green-50 text-green-600',
        video: 'bg-red-50 text-red-600',
        other: 'bg-gray-100 text-gray-600'
    };

    return (
        <DashboardLayout breadcrumbs={['Admin', 'Affiliate Resources']}>
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 mb-1">Affiliate Resources</h1>
                    <p className="text-gray-500 font-medium">Manage marketing materials for affiliates</p>
                </div>
                <button
                    onClick={() => setShowCreateForm(true)}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-sm flex items-center gap-2 transition-all shadow-lg shadow-blue-600/20"
                >
                    <PlusIcon className="w-4 h-4" />
                    Add Resource
                </button>
            </div>

            {/* Create Form Modal */}
            {showCreateForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-2xl">
                        <h2 className="text-xl font-black text-gray-900 mb-6">Add New Resource</h2>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Title *</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Resource title"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows={2}
                                    placeholder="Brief description"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Category</label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData(p => ({ ...p, category: e.target.value }))}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="banner">Banner</option>
                                    <option value="social">Social Media</option>
                                    <option value="email">Email Template</option>
                                    <option value="video">Video</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">File URL *</label>
                                <input
                                    type="url"
                                    value={formData.fileUrl}
                                    onChange={(e) => setFormData(p => ({ ...p, fileUrl: e.target.value }))}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="https://..."
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Thumbnail URL</label>
                                <input
                                    type="url"
                                    value={formData.thumbnailUrl}
                                    onChange={(e) => setFormData(p => ({ ...p, thumbnailUrl: e.target.value }))}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="https://..."
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Dimensions</label>
                                    <input
                                        type="text"
                                        value={formData.dimensions}
                                        onChange={(e) => setFormData(p => ({ ...p, dimensions: e.target.value }))}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="e.g. 728x90"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">File Size (bytes)</label>
                                    <input
                                        type="number"
                                        value={formData.fileSize}
                                        onChange={(e) => setFormData(p => ({ ...p, fileSize: parseInt(e.target.value) || 0 }))}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowCreateForm(false)} className="flex-1 py-3 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50 text-sm">
                                    Cancel
                                </button>
                                <button type="submit" disabled={submitting} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 disabled:opacity-50">
                                    {submitting ? 'Creating...' : 'Create Resource'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Resources Grid */}
            {loading ? (
                <div className="flex items-center justify-center h-40">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
                </div>
            ) : resources.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                    <PhotoIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500 font-bold">No resources yet</p>
                    <p className="text-sm text-gray-400 mt-1">Add marketing materials for your affiliates</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {resources.map(r => (
                        <div key={r.id} className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${r.isActive ? 'border-gray-100' : 'border-red-200 opacity-70'}`}>
                            <div className="aspect-video bg-gray-100 flex items-center justify-center overflow-hidden">
                                {r.thumbnailUrl ? (
                                    <img src={r.thumbnailUrl} alt={r.title} className="w-full h-full object-cover" />
                                ) : (
                                    <PhotoIcon className="w-12 h-12 text-gray-300" />
                                )}
                            </div>
                            <div className="p-5">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${categoryColors[r.category] || 'bg-gray-100 text-gray-500'}`}>
                                        {r.category}
                                    </span>
                                    {!r.isActive && (
                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-red-50 text-red-500">Disabled</span>
                                    )}
                                </div>
                                <h3 className="text-sm font-black text-gray-900 mb-1">{r.title}</h3>
                                {r.description && <p className="text-xs text-gray-400 mb-3 line-clamp-2">{r.description}</p>}
                                <div className="flex items-center justify-between">
                                    <p className="text-xs text-gray-400">
                                        by {r.uploader ? `${r.uploader.firstName} ${r.uploader.lastName}` : 'Admin'}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleToggle(r.id)}
                                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${r.isActive
                                                    ? 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100'
                                                    : 'bg-green-50 text-green-600 hover:bg-green-100'
                                                }`}
                                        >
                                            {r.isActive ? 'Disable' : 'Enable'}
                                        </button>
                                        <button
                                            onClick={() => handleDelete(r.id)}
                                            className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                                        >
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </DashboardLayout>
    );
};

export default AffiliateResourcesAdmin;
