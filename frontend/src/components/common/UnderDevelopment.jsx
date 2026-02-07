import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, WrenchScrewdriverIcon } from '@heroicons/react/24/outline';

const UnderDevelopment = ({ title = "This Feature", backPath = "/" }) => {
    const navigate = useNavigate();

    return (
        <div className="min-h-[calc(100vh-200px)] flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50/30">
            <div className="text-center max-w-md px-6">
                {/* Icon */}
                <div className="inline-flex p-8 bg-gradient-to-br from-blue-100 to-blue-50 rounded-full mb-6 relative">
                    <div className="absolute inset-0 bg-blue-600/5 rounded-full animate-ping"></div>
                    <WrenchScrewdriverIcon className="w-16 h-16 text-blue-600 relative z-10" />
                </div>

                {/* Title */}
                <h1 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">
                    {title} is Under Development
                </h1>

                {/* Description */}
                <p className="text-gray-600 font-medium mb-8 leading-relaxed">
                    We're working hard to bring you this feature. It will be available soon!
                </p>

                {/* Back Button */}
                <button
                    onClick={() => navigate(backPath)}
                    className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl group"
                >
                    <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Go Back
                </button>

                {/* Additional Info */}
                <div className="mt-8 pt-8 border-t border-gray-200">
                    <p className="text-xs text-gray-400 font-medium">
                        Need help? Contact our support team
                    </p>
                </div>
            </div>
        </div>
    );
};

export default UnderDevelopment;
