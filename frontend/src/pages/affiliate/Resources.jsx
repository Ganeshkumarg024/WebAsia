import { useEffect, useState } from 'react';
import { ArrowDownTrayIcon, PhotoIcon } from '@heroicons/react/24/outline';
import affiliateAPI from '../../api/affiliate';
import DashboardLayout from '../../components/layout/DashboardLayout';

const AffiliateResources = () => {
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [categoryFilter, setCategoryFilter] = useState('');

    useEffect(() => {
        fetchResources();
    }, [categoryFilter]);

    const fetchResources = async () => {
        try {
            setLoading(true);
            const res = await affiliateAPI.getMarketingMaterials(categoryFilter || undefined);
            setResources(res.data || []);
        } catch (error) {
            console.error('Failed to fetch resources:', error);
        } finally {
            setLoading(false);
        }
    };

    const categoryColors = {
        banner: 'bg-blue-50 text-blue-600',
        social: 'bg-purple-50 text-purple-600',
        email: 'bg-green-50 text-green-600',
        video: 'bg-red-50 text-red-600',
        other: 'bg-gray-100 text-gray-600'
    };

    const formatFileSize = (bytes) => {
        if (!bytes) return '';
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    return (
        <DashboardLayout breadcrumbs={['Affiliate', 'Resources']}>
            <div className="mb-8">
                <h1 className="text-3xl font-black text-gray-900 mb-1">Marketing Resources</h1>
                <p className="text-gray-500 font-medium">Download banners, social media templates, and brand assets</p>
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-3 mb-6">
                {['', 'banner', 'social', 'email', 'video', 'other'].map(c => (
                    <button
                        key={c}
                        onClick={() => setCategoryFilter(c)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${categoryFilter === c
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                                : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
                            }`}
                    >
                        {c === '' ? 'All' : c.charAt(0).toUpperCase() + c.slice(1)}
                    </button>
                ))}
            </div>

            {/* Resources Grid */}
            {loading ? (
                <div className="flex items-center justify-center h-40">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
                </div>
            ) : resources.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                    <PhotoIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500 font-bold">No resources available</p>
                    <p className="text-sm text-gray-400 mt-1">Check back later for marketing materials</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {resources.map((r) => (
                        <div key={r.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group hover:shadow-md transition-all">
                            {/* Thumbnail */}
                            <div className="aspect-video bg-gray-100 flex items-center justify-center overflow-hidden">
                                {r.thumbnailUrl ? (
                                    <img src={r.thumbnailUrl} alt={r.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                ) : (
                                    <PhotoIcon className="w-12 h-12 text-gray-300" />
                                )}
                            </div>
                            {/* Details */}
                            <div className="p-5">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${categoryColors[r.category] || 'bg-gray-100 text-gray-500'}`}>
                                        {r.category}
                                    </span>
                                    {r.dimensions && (
                                        <span className="text-[10px] text-gray-400 font-mono">{r.dimensions}</span>
                                    )}
                                </div>
                                <h3 className="text-sm font-black text-gray-900 mb-1">{r.title}</h3>
                                {r.description && (
                                    <p className="text-xs text-gray-400 mb-3 line-clamp-2">{r.description}</p>
                                )}
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-400">{formatFileSize(r.fileSize)}</span>
                                    <a
                                        href={r.fileUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
                                    >
                                        <ArrowDownTrayIcon className="w-3.5 h-3.5" />
                                        Download
                                    </a>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </DashboardLayout>
    );
};

export default AffiliateResources;
