import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    DocumentTextIcon,
    ClockIcon,
    CheckCircleIcon,
    ArrowDownTrayIcon,
    SparklesIcon,
    FolderArrowDownIcon,
    PencilSquareIcon,
    ArrowRightIcon,
    ChatBubbleLeftIcon,
    PlusIcon,
    CheckBadgeIcon
} from '@heroicons/react/24/outline';
import useRequestStore from '../../store/requestStore';
import useSubscriptionStore from '../../store/subscriptionStore';
import useAuthStore from '../../store/authStore';
import StatCard from '../../components/shared/StatCard';
import StatusBadge from '../../components/shared/StatusBadge';
import ProgressBar from '../../components/shared/ProgressBar';
import DashboardLayout from '../../components/layout/DashboardLayout';
import BrandKitModal from '../../components/client/BrandKitModal';
import brandKitAPI from '../../api/brandKit';
import showToast from '../../components/shared/Toast';
import { format, isValid } from 'date-fns';

const Dashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { requests, fetchRequests } = useRequestStore();
    const { currentSubscription, fetchCurrentSubscription, isLoading, isInitialized } = useSubscriptionStore();
    const [brandKit, setBrandKit] = useState(null);
    const [showBrandKitModal, setShowBrandKitModal] = useState(false);
    const [downloading, setDownloading] = useState(false);

    useEffect(() => {
        const loadDashboardData = async () => {
            const tasks = [fetchRequests(), fetchBrandKit()];
            if (!isInitialized && !isLoading) {
                tasks.push(fetchCurrentSubscription());
            }
            await Promise.all(tasks);
        };
        loadDashboardData();
    }, [fetchRequests, fetchCurrentSubscription, isInitialized, isLoading]);

    if (isLoading && !currentSubscription) {
        return (
            <DashboardLayout breadcrumbs={['Dashboard', 'Overview']}>
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
            </DashboardLayout>
        );
    }

    const fetchBrandKit = async () => {
        try {
            const result = await brandKitAPI.getBrandKit();
            if (result.success) {
                setBrandKit(result.data);
            }
        } catch (error) {
            console.error('Failed to fetch brand kit:', error);
        }
    };

    const handleDownloadAssets = async () => {
        setDownloading(true);
        try {
            const blob = await brandKitAPI.downloadAssets();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'brand-kit.zip';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            showToast.success('Brand kit downloaded successfully');
        } catch (error) {
            showToast.error('Failed to download brand kit');
        } finally {
            setDownloading(false);
        }
    };

    const calculateDaysUntilReset = () => {
        if (!currentSubscription?.credits?.resetDate) return 'N/A';
        const resetDate = new Date(currentSubscription.credits.resetDate);
        if (!isValid(resetDate)) return 'N/A';

        const today = new Date();
        const diffTime = resetDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? `${diffDays} days` : 'Soon';
    };

    // Format stats for display
    const activeTasksCount = (Array.isArray(requests) ? requests.filter(r => !['completed', 'cancelled'].includes(r.status)) : []).length.toString().padStart(2, '0');

    return (
        <DashboardLayout breadcrumbs={['Dashboard', 'Overview']}>
            <div className="relative min-h-[calc(100vh-200px)]">
                {/* Paywall Overlay */}
                {!currentSubscription && !isLoading && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center backdrop-blur-xl bg-white/40">
                        <div className="max-w-md w-full bg-white p-10 rounded-[32px] shadow-2xl border border-gray-100 text-center space-y-6">
                            <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mx-auto">
                                <SparklesIcon className="w-10 h-10 text-blue-600" />
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-3xl font-black text-gray-900 tracking-tight">Unlock Your Potential</h2>
                                <p className="text-gray-500 font-medium">Choose a plan to start creating with WebAsia today.</p>
                            </div>
                            <button
                                onClick={() => navigate('/client/billing')}
                                className="w-full py-4 bg-blue-600 text-white font-black uppercase tracking-widest rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 hover:-translate-y-1"
                            >
                                View Pricing Plans
                            </button>
                        </div>
                    </div>
                )}

                <div className={`space-y-8 ${!currentSubscription ? 'opacity-40 pointer-events-none grayscale' : ''}`}>
                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="space-y-1">
                            <h1 className="text-4xl font-black text-gray-900 tracking-tight">
                                Welcome back, <span className="text-blue-600">{user?.name?.split(' ')[0] || 'Member'}</span>
                            </h1>
                            <p className="text-gray-500 font-medium">Your creative engine is running smoothly today.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => navigate('/client/requests')}
                                className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-100 rounded-2xl text-gray-900 font-bold hover:bg-gray-50 transition-all shadow-sm"
                            >
                                <ClockIcon className="w-5 h-5 text-blue-600" />
                                <span>Request History</span>
                            </button>
                            <button
                                onClick={() => navigate('/client/requests/new')}
                                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
                            >
                                <PlusIcon className="w-5 h-5" />
                                <span>Create New Request</span>
                            </button>
                        </div>
                    </div>

                    {/* Row 1: Active Tasks & Credit Usage */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Active Tasks Card */}
                        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-500"></div>
                            <div className="relative z-10 flex flex-col justify-between h-full space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="p-3 bg-blue-50 w-fit rounded-2xl">
                                        <DocumentTextIcon className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <span className="px-3 py-1 bg-green-50 text-green-600 text-xs font-black rounded-full uppercase tracking-wider">+2 New</span>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Tasks</p>
                                    <h2 className="text-5xl font-black text-gray-900 tracking-tighter">{activeTasksCount}</h2>
                                </div>
                            </div>
                        </div>

                        {/* Usage Tracking Card */}
                        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex flex-col justify-center">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Credit Usage Tracking</h3>
                                <div className="text-right">
                                    <p className="text-lg font-black text-gray-900 tracking-tight">
                                        {currentSubscription ? (currentSubscription.graphicsCreditsRemaining + currentSubscription.videoCreditsRemaining + currentSubscription.webCreditsRemaining) : 0} Credits
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="h-4 bg-gray-50 rounded-full overflow-hidden border border-gray-100">
                                    <div
                                        className="h-full bg-blue-600 rounded-full shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all duration-1000"
                                        style={{ width: '100%' }}
                                    ></div>
                                </div>
                                <div className="flex justify-between text-[11px] font-black uppercase tracking-widest">
                                    <span className="text-gray-400">
                                        Total available credits for current period
                                    </span>
                                    <span className="text-blue-600 underline">Next reset: {currentSubscription?.creditsResetDate ? format(new Date(currentSubscription.creditsResetDate), 'MMM dd') : 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Row 2: Brand Kit & Subscription Plan */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Brand Kit Card */}
                        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <SparklesIcon className="w-5 h-5 text-blue-600" />
                                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Brand Kit Quick Access</h3>
                                </div>
                                <button
                                    onClick={() => setShowBrandKitModal(true)}
                                    className="text-xs font-black text-blue-600 uppercase tracking-widest hover:underline"
                                >
                                    Edit Kit
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="bg-gray-50/50 rounded-2xl border border-dashed border-gray-200 p-8 flex items-center justify-center group cursor-pointer hover:border-blue-300 transition-colors">
                                    <div className="text-center space-y-2">
                                        {brandKit?.logoUrl ? (
                                            <img
                                                src={`${import.meta.env.VITE_API_URL}${brandKit.logoUrl}`}
                                                alt="Brand Logo"
                                                className="max-w-full max-h-24 mx-auto object-contain"
                                            />
                                        ) : (
                                            <>
                                                <p className="text-2xl font-black text-gray-300 italic group-hover:text-blue-200 transition-colors">BRAND LOGO</p>
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Primary Logo</p>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-3">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Palette</p>
                                        <div className="flex flex-wrap gap-2">
                                            {(brandKit?.colors || ['#2563EB', '#10B981', '#1E293B']).map((color, index) => (
                                                <div key={index} className="group relative">
                                                    <div
                                                        className="w-10 h-10 rounded-xl shadow-sm border border-gray-100 ring-2 ring-transparent group-hover:ring-blue-100 transition-all"
                                                        style={{ backgroundColor: color }}
                                                    ></div>
                                                    <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[9px] font-black text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">{color}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleDownloadAssets}
                                        disabled={downloading}
                                        className="w-full flex items-center justify-center gap-3 py-4 bg-blue-600 text-white rounded-2xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 group disabled:opacity-50"
                                    >
                                        <ArrowDownTrayIcon className="w-4 h-4" />
                                        <span>{downloading ? 'Downloading...' : 'Download Assets'}</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Subscription Plan Card */}
                        <div className="bg-[#0A0E1A] p-8 rounded-3xl border border-[#1E2638] shadow-2xl shadow-black/20 text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none"></div>

                            <div className="relative z-10 h-full flex flex-col justify-between">
                                <div className="space-y-6">
                                    <h3 className="text-sm font-black text-white uppercase tracking-widest">Subscription Plan</h3>

                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Tier</p>
                                        <div className="flex items-center justify-between">
                                            <h2 className="text-2xl font-black text-white tracking-tight leading-none">
                                                {currentSubscription?.plan?.name || 'Professional'} <br />
                                                <span className="text-gray-400">Monthly</span>
                                            </h2>
                                            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/30">
                                                <CheckBadgeIcon className="w-6 h-6 text-white" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 space-y-4 pt-8 border-t border-white/10">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-gray-400 font-medium">Next billing date</span>
                                        <span className="text-white font-bold">{currentSubscription?.nextBillingDate ? format(new Date(currentSubscription.nextBillingDate), 'MMM dd, yyyy') : 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-gray-400 font-medium">Turnaround</span>
                                        <span className="text-white font-bold">{currentSubscription?.plan?.turnaroundHours || '24-48'} Hours</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Row 3: Requests & Deliveries */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Active Requests */}
                        <div className="lg:col-span-8 space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Active Requests</h3>
                                <Link to="/client/requests" className="text-xs font-black text-blue-600 uppercase tracking-widest flex items-center gap-1 hover:underline group">
                                    View all requests
                                    <ArrowRightIcon className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                {requests.filter(r => !['completed', 'cancelled'].includes(r.status)).slice(0, 3).map((request) => (
                                    <div key={request.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.01)] hover:shadow-md transition-all group flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 font-black">
                                                {(requests.findIndex(r => r.id === request.id)) + 1}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-900">{request.title}</h4>
                                                <p className="text-xs text-gray-500 font-medium">
                                                    {request.category} • Assigned to {request.designer?.name || 'Reviewing'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${request.status === 'in-progress'
                                                ? 'bg-blue-50 text-blue-600'
                                                : 'bg-yellow-50 text-yellow-600'
                                                }`}>
                                                {request.status.replace('-', ' ')}
                                            </span>
                                            <button className="p-2 text-gray-300 hover:text-blue-600 transition-colors">
                                                <ChatBubbleLeftIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {requests.filter(r => !['completed', 'cancelled'].includes(r.status)).length === 0 && (
                                    <div className="bg-gray-50/50 border-2 border-dashed border-gray-200 rounded-3xl py-12 text-center">
                                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">
                                            No active requests. Create one now!
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Recent Deliveries */}
                        <div className="lg:col-span-4 space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Recent Deliveries</h3>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                {(Array.isArray(requests) ? requests.filter(r => r.status === 'completed') : []).slice(0, 3).map((file, index) => (
                                    <div
                                        key={index}
                                        className="group bg-white border border-gray-100 rounded-3xl p-4 flex items-center gap-4 hover:shadow-lg hover:shadow-blue-600/5 transition-all cursor-pointer shadow-sm"
                                    >
                                        <div
                                            className="w-14 h-14 flex-shrink-0 bg-gray-50 rounded-2xl bg-cover bg-center overflow-hidden relative border border-gray-50"
                                            style={{ backgroundImage: `url(${file.finalDeliveryUrl || 'https://via.placeholder.com/150'})` }}
                                        >
                                            <div className="absolute inset-0 bg-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <SparklesIcon className="w-5 h-5 text-blue-600" />
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-black text-gray-900 truncate">{file.title}</p>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                                {file.category} • {isValid(new Date(file.updatedAt)) ? format(new Date(file.updatedAt), 'MMM dd') : 'N/A'}
                                            </p>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                window.open(file.finalDeliveryUrl, '_blank');
                                            }}
                                            className="p-3 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-2xl transition-all shadow-sm"
                                        >
                                            <ArrowDownTrayIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                                {(Array.isArray(requests) ? requests.filter(r => r.status === 'completed') : []).length === 0 && (
                                    <div className="bg-gray-50/50 border-2 border-dashed border-gray-200 rounded-3xl py-12 text-center">
                                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">
                                            No deliveries yet.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Brand Kit Modal */}
            <BrandKitModal
                isOpen={showBrandKitModal}
                onClose={() => setShowBrandKitModal(false)}
                brandKit={brandKit}
                onUpdate={(updatedBrandKit) => {
                    setBrandKit(updatedBrandKit);
                }}
            />
        </DashboardLayout>
    );
};

export default Dashboard;
