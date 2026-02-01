import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import useAffiliateStore from '../../store/affiliateStore';
import toast from 'react-hot-toast';
import {
    RocketLaunchIcon,
    GiftIcon,
    ChartBarIcon,
    ShieldCheckIcon
} from '@heroicons/react/24/outline';

const AffiliateRegistration = () => {
    const navigate = useNavigate();
    const { registerAsAffiliate, isLoading } = useAffiliateStore();

    const handleJoin = async () => {
        try {
            await registerAsAffiliate();
            toast.success('Welcome to the Affiliate Program!');
            navigate('/client/affiliate');
        } catch (err) {
            toast.error(err.message || 'Failed to join the program');
        }
    };

    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 sm:p-8 font-inter">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl w-full bg-white rounded-[3rem] p-8 sm:p-12 lg:p-16 border border-gray-100 shadow-2xl shadow-blue-600/5 overflow-hidden relative"
            >
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"></div>

                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <div className="space-y-8">
                        <div className="space-y-4">
                            <span className="inline-block px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-xs font-black uppercase tracking-widest">
                                Partner Program
                            </span>
                            <h1 className="text-4xl sm:text-5xl font-black text-gray-900 leading-tight tracking-tight">
                                Earn <span className="text-blue-600">15%</span> for every referral.
                            </h1>
                            <p className="text-gray-500 text-lg font-medium leading-relaxed">
                                Join our inner circle of creators and agencies. Help us grow and share in our success with recurring commissions.
                            </p>
                        </div>

                        <div className="space-y-5">
                            {[
                                { icon: <RocketLaunchIcon />, title: 'High Conversion', desc: 'Our services sell themselves' },
                                { icon: <GiftIcon />, title: 'Recurring Rewards', desc: 'Earn as long as they stay subscribed' },
                                { icon: <ChartBarIcon />, title: 'Real-time Analytics', desc: 'Track every click and conversion' },
                                { icon: <ShieldCheckIcon />, title: 'Reliable Payouts', desc: 'Monthly payouts to your preferred method' }
                            ].map((feature, i) => (
                                <div key={i} className="flex gap-4 group">
                                    <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-sm border border-gray-100">
                                        <div className="w-6 h-6">{feature.icon}</div>
                                    </div>
                                    <div>
                                        <h4 className="text-gray-900 font-bold tracking-tight">{feature.title}</h4>
                                        <p className="text-gray-500 text-sm font-medium">{feature.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="pt-4">
                            <button
                                onClick={handleJoin}
                                disabled={isLoading}
                                className="w-full sm:w-auto px-10 h-16 bg-blue-600 text-white rounded-[2rem] font-black uppercase tracking-widest shadow-xl shadow-blue-600/20 hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                            >
                                {isLoading ? (
                                    <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        <span>Become a Partner</span>
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                        </svg>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="relative hidden lg:block">
                        <div className="absolute inset-0 bg-blue-600/5 rounded-full blur-3xl"></div>
                        <img
                            src="/assets/affiliate-promo.png"
                            alt="Affiliate Program"
                            className="relative z-10 w-full animate-float drop-shadow-2xl"
                            onError={(e) => e.target.style.display = 'none'}
                        />
                        <div className="absolute -bottom-10 -right-10 bg-white p-6 rounded-3xl border border-gray-100 shadow-xl max-w-[200px] animate-bounce-slow">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">✓</div>
                                <span className="text-[10px] font-black uppercase text-gray-400">Commission Sent</span>
                            </div>
                            <h4 className="text-xl font-black text-gray-900 tracking-tight">+₹4,500</h4>
                        </div>
                    </div>
                </div>
            </motion.div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes float {
                    0%, 100% { transform: translateY(0) rotate(0); }
                    50% { transform: translateY(-20px) rotate(2deg); }
                }
                @keyframes bounce-slow {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                .animate-float { animation: float 6s ease-in-out infinite; }
                .animate-bounce-slow { animation: bounce-slow 4s ease-in-out infinite; }
            ` }} />
        </div>
    );
};

export default AffiliateRegistration;
