import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    MagnifyingGlassIcon,
    Squares2X2Icon,
    ListBulletIcon,
    CalendarIcon,
    ChatBubbleLeftIcon,
    InboxIcon,
    CheckCircleIcon,
    XCircleIcon,
    ArchiveBoxIcon
} from '@heroicons/react/24/outline';
import DashboardLayout from '../../components/layout/DashboardLayout';
import requestsAPI from '../../api/requests';

const RequestHistory = () => {
    const [requests, setRequests] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            setIsLoading(true);
            // Fetch only completed and cancelled requests
            const response = await requestsAPI.getMyRequests();
            // Filter for completed and cancelled requests only
            const historyRequests = (response.data || []).filter(
                r => r.status === 'completed' || r.status === 'cancelled'
            );
            setRequests(historyRequests);
        } catch (error) {
            console.error('Failed to fetch request history:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const categories = [
        { name: 'All History', status: 'all', icon: ArchiveBoxIcon, count: requests.length },
        { name: 'Completed', status: 'completed', icon: CheckCircleIcon, count: requests.filter(r => r.status === 'completed').length },
        { name: 'Cancelled', status: 'cancelled', icon: XCircleIcon, count: requests.filter(r => r.status === 'cancelled').length },
    ];

    const filteredRequests = requests.filter(request => {
        const matchesStatus = filterStatus === 'all' || request.status === filterStatus;
        const matchesSearch = request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            request.category.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    return (
        <DashboardLayout breadcrumbs={['Dashboard', 'Request History']}>
            <div className="max-w-7xl mx-auto flex flex-col xl:flex-row gap-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Sidebar Filter */}
                <aside className="w-full xl:w-80 space-y-10">
                    <div className="bg-white border border-gray-100 rounded-[40px] p-8 space-y-10 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
                        <div className="space-y-4">
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Search</h3>
                            <div className="relative group">
                                <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Search projects..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-medium focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 transition-all outline-none"
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Categories</h3>
                            <div className="space-y-2">
                                {categories.map((cat) => (
                                    <button
                                        key={cat.status}
                                        onClick={() => setFilterStatus(cat.status)}
                                        className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all group ${filterStatus === cat.status
                                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                                            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <cat.icon className={`w-5 h-5 ${filterStatus === cat.status ? 'text-white' : 'text-gray-400 group-hover:text-blue-600'}`} />
                                            <span className="text-sm font-bold tracking-tight">{cat.name}</span>
                                        </div>
                                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${filterStatus === cat.status ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-400'
                                            }`}>
                                            {cat.count}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-gray-700 to-gray-900 rounded-3xl p-8 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform"></div>
                        <div className="relative z-10 space-y-4">
                            <h4 className="text-white font-black text-xl tracking-tight leading-tight">Archive<br />Complete</h4>
                            <p className="text-gray-300 text-xs font-medium">All your completed and cancelled projects are stored here.</p>
                        </div>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 space-y-8">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Request History</h2>
                            <p className="text-gray-500 font-medium">Viewing {filteredRequests.length} archived projects</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex bg-white border border-gray-100 p-1 rounded-2xl shadow-sm">
                                <button className="p-2.5 bg-gray-50 text-blue-600 rounded-xl">
                                    <Squares2X2Icon className="w-5 h-5" />
                                </button>
                                <button className="p-2.5 text-gray-400 hover:text-gray-600">
                                    <ListBulletIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {isLoading ? (
                            [1, 2, 3, 4].map(i => (
                                <div key={i} className="bg-white p-8 rounded-3xl border border-gray-100 animate-pulse space-y-4">
                                    <div className="h-4 w-1/4 bg-gray-100 rounded-full"></div>
                                    <div className="h-8 w-3/4 bg-gray-100 rounded-full"></div>
                                    <div className="h-20 w-full bg-gray-100 rounded-2xl"></div>
                                </div>
                            ))
                        ) : filteredRequests.length > 0 ? (
                            filteredRequests.map((request) => (
                                <Link
                                    key={request.id}
                                    to={`/client/requests/${request.id}`}
                                    className="group bg-white p-8 rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-xl hover:shadow-blue-600/5 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between min-h-[280px]"
                                >
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between">
                                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${request.status === 'completed'
                                                ? 'bg-green-50 text-green-600'
                                                : 'bg-red-50 text-red-600'
                                                }`}>
                                                {request.status}
                                            </span>
                                            <div className="flex -space-x-2">
                                                {[1, 2, 3].map(i => (
                                                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-400">
                                                        D{i}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{request.category}</p>
                                            <h3 className="text-xl font-black text-gray-900 tracking-tight group-hover:text-blue-600 transition-colors uppercase leading-tight">
                                                {request.title}
                                            </h3>
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-gray-50 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center">
                                                <CalendarIcon className="w-4 h-4 text-gray-400" />
                                            </div>
                                            <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                                                {new Date(request.completedAt || request.updatedAt || request.created_at || new Date()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="p-2 text-gray-300 group-hover:text-blue-600 transition-colors">
                                                <ChatBubbleLeftIcon className="w-5 h-5" />
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className="col-span-2 py-20 bg-gray-50/50 border-2 border-dashed border-gray-200 rounded-3xl text-center">
                                <div className="w-20 h-20 bg-white rounded-3xl shadow-sm border border-gray-100 flex items-center justify-center mx-auto mb-6 transform -rotate-6 transition-transform hover:rotate-0">
                                    <InboxIcon className="w-10 h-10 text-gray-200" />
                                </div>
                                <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight mb-2">No History Yet</h3>
                                <p className="text-gray-400 font-medium max-w-xs mx-auto text-sm">You don't have any completed or cancelled requests yet.</p>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </DashboardLayout>
    );
};

export default RequestHistory;
