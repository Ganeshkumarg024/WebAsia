import { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, FunnelIcon, ArrowsUpDownIcon, CloudArrowDownIcon, EyeIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import DashboardLayout from '../../components/layout/DashboardLayout';
import filesAPI from '../../api/files';

const Deliveries = () => {
    const [deliveries, setDeliveries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('Final Renders');

    useEffect(() => {
        // Mock data for now as filesAPI might not have a dedicated deliveries endpoint yet
        const mockDeliveries = [
            {
                id: 1,
                title: 'Q4 Brand Refresh Assets',
                category: 'Branding & Identity',
                timeAgo: '2h ago',
                size: '124.5 MB',
                format: 'ZIP (PNG, SVG)',
                image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA1plSzFNqx71B1-WvVj6JMjArKohvOLFcB8znA8F-1HF3jx4AH9McLFzRDbogtsxq5wuRESzbJFBJak3PscM9zDHAR3NonAgQyUCfS9T7NASABwCwQvh-eTor4-NmzgEqg7HzuS9jOANmYQZ8kttwwZqKupbl332gWiDZjnUfb4Uwov1OA6bE1PqzFPdpckthTXEz5YmapioEefLLpSj_uWbc1yePk-m5sdrmkkZdQszpRYdesVS7XVsXKf-vm_dO0aTiPEl5bS4k',
                type: 'Final Renders'
            },
            {
                id: 2,
                title: 'Admin Dashboard UI Kit',
                category: 'Web Development',
                timeAgo: 'Yesterday',
                size: '42.8 MB',
                format: 'Figma, PDF',
                image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCk9ZN4aWXUYoywMbQdK-KaUzN9J3d92WKR4Pny0jqHylBAuTpr9uR-v7LDKdKAsrsvm0GWCcAxnmrTf9_B8viqg4dgfs0MB5B6ahOJktDFiZtL0xLB8C_L8OdAdfZNGqGw8FAVmM19GZAzmbFml-Xoi80cgMM2mGYhuR0JcwRuYATkbxPr-3EF1ARv4M5qckDBzA-au2imp-px9EFqwvvdtiCzuD-BVU1HeiypwVLzq00UitSrKfPsauFJi0g6udqF-rLRZB5Y9qE',
                type: 'Final Renders'
            },
            {
                id: 3,
                title: 'Product Explainer Video',
                category: 'Motion Graphics',
                timeAgo: '3 days ago',
                size: '850.2 MB',
                format: 'MP4 (4K)',
                type: 'Final Renders',
                icon: 'movie'
            },
            {
                id: 4,
                title: 'Social Media Content Plan',
                category: 'Copywriting',
                timeAgo: '5 days ago',
                size: '1.2 MB',
                format: 'DOCX, PDF',
                type: 'Source Files',
                icon: 'description'
            }
        ];

        setTimeout(() => {
            setDeliveries(mockDeliveries);
            setLoading(false);
        }, 500);
    }, []);

    const filteredDeliveries = deliveries.filter(d =>
        (d.type === activeTab) &&
        (d.title.toLowerCase().includes(searchTerm.toLowerCase()) || d.category.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <DashboardLayout breadcrumbs={['Dashboard', 'Deliveries']}>
            <div className="max-w-7xl mx-auto w-full space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* page Header */}
                <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-10">
                    <div className="space-y-2">
                        <h1 className="text-5xl font-black text-gray-900 tracking-tight leading-tight">
                            Digital <span className="text-blue-600">Assets</span> Hub
                        </h1>
                        <p className="text-gray-500 font-medium text-lg">Your central repository for all professional-grade creative deliverables.</p>
                    </div>

                    <div className="flex p-2 bg-white rounded-[24px] w-fit border border-gray-100 shadow-[0_8px_24px_rgba(0,0,0,0.03)] scale-110 xl:scale-100 origin-left xl:origin-bottom">
                        <button
                            onClick={() => setActiveTab('Final Renders')}
                            className={`px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 transition-all ${activeTab === 'Final Renders'
                                ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20'
                                : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50'
                                }`}
                        >
                            <EyeIcon className="w-5 h-5" />
                            Final Renders
                        </button>
                        <button
                            onClick={() => setActiveTab('Source Files')}
                            className={`px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 transition-all ${activeTab === 'Source Files'
                                ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20'
                                : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50'
                                }`}
                        >
                            <CloudArrowDownIcon className="w-5 h-5" />
                            Source Files
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col lg:flex-row gap-6 p-6 bg-white rounded-[32px] border border-gray-100 shadow-[0_4px_30px_rgba(0,0,0,0.01)]">
                    <div className="relative flex-1 w-full">
                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400">
                            <MagnifyingGlassIcon className="w-6 h-6" />
                        </span>
                        <input
                            type="text"
                            placeholder="Identify project by name or metadata..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl py-4 pl-14 pr-6 text-sm font-bold focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 transition-all text-gray-900 placeholder-gray-400 outline-none"
                        />
                    </div>
                    <div className="flex gap-4 w-full lg:w-auto">
                        <div className="flex items-center gap-3 bg-gray-50/50 px-5 py-4 rounded-2xl border border-gray-100 flex-1 lg:flex-none">
                            <ArrowsUpDownIcon className="w-5 h-5 text-gray-400" />
                            <select className="bg-transparent border-none text-[10px] font-black uppercase tracking-widest focus:ring-0 p-0 pr-10 text-gray-900 outline-none cursor-pointer">
                                <option>Sorted: Recency</option>
                                <option>Sorted: Alphabetical</option>
                                <option>Sorted: Magnitude</option>
                            </select>
                        </div>
                        <div className="flex items-center gap-3 bg-gray-50/50 px-5 py-4 rounded-2xl border border-gray-100 flex-1 lg:flex-none">
                            <FunnelIcon className="w-5 h-5 text-gray-400" />
                            <select className="bg-transparent border-none text-[10px] font-black uppercase tracking-widest focus:ring-0 p-0 pr-10 text-gray-900 outline-none cursor-pointer">
                                <option>Type: All Vectors</option>
                                <option>Type: Prototypes</option>
                                <option>Type: Cinema 4D</option>
                                <option>Type: Documents</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Asset Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
                    {loading ? (
                        [1, 2, 3].map(i => (
                            <div key={i} className="bg-gray-50 rounded-[40px] border border-gray-100 h-96 animate-pulse"></div>
                        ))
                    ) : filteredDeliveries.length > 0 ? (
                        filteredDeliveries.map(delivery => (
                            <div key={delivery.id} className="group bg-white border border-gray-100 rounded-[40px] overflow-hidden hover:border-blue-600/20 transition-all duration-500 hover:shadow-[0_40px_100px_-20px_rgba(0,0,0,0.06)] hover:-translate-y-2 relative">
                                <div className="aspect-[4/3] w-full bg-gray-100 relative group-hover:brightness-95 transition-all overflow-hidden flex items-center justify-center">
                                    {delivery.image ? (
                                        <img
                                            src={delivery.image}
                                            alt={delivery.title}
                                            className="w-full h-full object-cover scale-100 group-hover:scale-105 transition-transform duration-1000"
                                        />
                                    ) : (
                                        <div className="text-gray-300">
                                            {delivery.icon === 'movie' ? <EyeIcon className="w-20 h-20" /> : <CloudArrowDownIcon className="w-20 h-20" />}
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-blue-600/60 opacity-0 group-hover:opacity-100 transition-opacity duration-500 backdrop-blur-sm flex items-center justify-center gap-5">
                                        <button className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-blue-600 hover:scale-110 transition-transform shadow-2xl">
                                            <MagnifyingGlassIcon className="w-6 h-6" />
                                        </button>
                                        <button className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-blue-600 hover:scale-110 transition-transform shadow-2xl">
                                            <CloudArrowDownIcon className="w-6 h-6" />
                                        </button>
                                    </div>
                                </div>
                                <div className="p-8 relative">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 mb-2 block">
                                                {delivery.category}
                                            </span>
                                            <h3 className="text-xl font-black text-gray-900 leading-tight tracking-tight">
                                                {delivery.title}
                                            </h3>
                                        </div>
                                        <span className="bg-gray-100 text-gray-500 text-[10px] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest">
                                            {delivery.timeAgo}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 mb-8">
                                        <div className="p-4 bg-gray-50/50 rounded-2xl border border-gray-50">
                                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Payload</p>
                                            <p className="text-sm font-black text-gray-700">{delivery.size}</p>
                                        </div>
                                        <div className="p-4 bg-gray-50/50 rounded-2xl border border-gray-50">
                                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Manifest</p>
                                            <p className="text-sm font-black text-gray-700 line-clamp-1">{delivery.format}</p>
                                        </div>
                                    </div>
                                    <button className="group/btn w-full py-4.5 bg-blue-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl flex items-center justify-center gap-3 hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/10 active:scale-95">
                                        <span>Download Archive</span>
                                        <CloudArrowDownIcon className="w-5 h-5 group-hover/btn:translate-y-0.5 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full py-32 text-center bg-gray-50 rounded-[40px] border border-dashed border-gray-200">
                            <CloudArrowDownIcon className="w-20 h-20 text-gray-300 mx-auto mb-6" />
                            <h3 className="text-xl font-black text-gray-900 mb-2 tracking-tight">Zero Deliveries Detected</h3>
                            <p className="text-gray-400 font-medium">Your assets will manifest here once the kiln completes the bake.</p>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                <div className="flex flex-col md:flex-row items-center justify-between pt-12 border-t border-gray-100 gap-8">
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
                        Catalogue index: <span className="text-gray-900">{filteredDeliveries.length}</span> of 24 manifestations
                    </p>
                    <div className="flex gap-3">
                        <button className="w-12 h-12 flex items-center justify-center rounded-2xl border border-gray-100 text-gray-400 hover:bg-gray-50 transition-all hover:scale-110">
                            <ChevronLeftIcon className="w-5 h-5" />
                        </button>
                        <button className="w-12 h-12 flex items-center justify-center rounded-2xl bg-blue-600 text-white font-black text-sm shadow-xl shadow-blue-600/20 active:scale-95 transition-transform">1</button>
                        <button className="w-12 h-12 flex items-center justify-center rounded-2xl border border-gray-100 text-gray-400 hover:text-gray-900 hover:bg-gray-50 transition-all hover:scale-110 font-bold">2</button>
                        <button className="w-12 h-12 flex items-center justify-center rounded-2xl border border-gray-100 text-gray-400 hover:text-gray-900 hover:bg-gray-50 transition-all hover:scale-110 font-bold">3</button>
                        <button className="w-12 h-12 flex items-center justify-center rounded-2xl border border-gray-100 text-gray-400 hover:bg-gray-50 transition-all hover:scale-110">
                            <ChevronRightIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Deliveries;
