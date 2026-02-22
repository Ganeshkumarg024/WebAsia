import { useEffect, useState } from 'react';
import { ShieldExclamationIcon } from '@heroicons/react/24/outline';
import affiliateAPI from '../../api/affiliate';
import DashboardLayout from '../../components/layout/DashboardLayout';

const FraudDetection = () => {
    const [flags, setFlags] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFlags();
    }, []);

    const fetchFlags = async () => {
        try {
            setLoading(true);
            const res = await affiliateAPI.adminGetFraudFlags();
            setFlags(res.data || []);
        } catch (error) {
            console.error('Failed to fetch fraud flags:', error);
        } finally {
            setLoading(false);
        }
    };

    const severityColors = {
        high: 'bg-red-50 text-red-600 border-red-200',
        medium: 'bg-yellow-50 text-yellow-600 border-yellow-200',
        low: 'bg-blue-50 text-blue-600 border-blue-200'
    };

    return (
        <DashboardLayout breadcrumbs={['Admin', 'Fraud Detection']}>
            <div className="mb-8">
                <h1 className="text-3xl font-black text-gray-900 mb-1">Fraud Detection</h1>
                <p className="text-gray-500 font-medium">Monitor suspicious affiliate activities and potential fraud</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Total Flags</p>
                    <p className="text-3xl font-black text-gray-900">{flags.length}</p>
                </div>
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">High Severity</p>
                    <p className="text-3xl font-black text-red-600">
                        {flags.filter(f => f.severity === 'high').length}
                    </p>
                </div>
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Medium Severity</p>
                    <p className="text-3xl font-black text-yellow-600">
                        {flags.filter(f => f.severity === 'medium').length}
                    </p>
                </div>
            </div>

            {/* Flags List */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-lg font-black text-gray-900">Fraud Flags</h2>
                </div>
                {loading ? (
                    <div className="flex items-center justify-center h-40">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
                    </div>
                ) : flags.length === 0 ? (
                    <div className="p-12 text-center">
                        <ShieldExclamationIcon className="w-12 h-12 mx-auto mb-4 text-green-300" />
                        <p className="text-green-600 font-bold">No fraud flags detected</p>
                        <p className="text-sm text-gray-400 mt-1">All affiliate activities look clean</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {flags.map((flag, index) => (
                            <div key={index} className="p-6 hover:bg-gray-50 transition-colors">
                                <div className="flex items-start gap-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${flag.severity === 'high' ? 'bg-red-50' : flag.severity === 'medium' ? 'bg-yellow-50' : 'bg-blue-50'
                                        }`}>
                                        <ShieldExclamationIcon className={`w-5 h-5 ${flag.severity === 'high' ? 'text-red-500' : flag.severity === 'medium' ? 'text-yellow-500' : 'text-blue-500'
                                            }`} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-1">
                                            <p className="text-sm font-bold text-gray-900">{flag.type}</p>
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${severityColors[flag.severity] || 'bg-gray-100 text-gray-500'}`}>
                                                {flag.severity}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-2">{flag.description}</p>
                                        {flag.affiliateId && (
                                            <p className="text-xs text-gray-400">
                                                Affiliate ID: <span className="font-mono text-gray-500">{flag.affiliateId}</span>
                                            </p>
                                        )}
                                        {flag.details && (
                                            <div className="mt-2 bg-gray-50 rounded-lg p-3">
                                                <pre className="text-xs text-gray-500 whitespace-pre-wrap break-all">
                                                    {typeof flag.details === 'string' ? flag.details : JSON.stringify(flag.details, null, 2)}
                                                </pre>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default FraudDetection;
