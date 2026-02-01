import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

const StatCard = ({
    title,
    value,
    icon: Icon,
    trend,
    trendValue,
    color = 'primary',
    loading = false
}) => {
    const colorClasses = {
        primary: 'bg-blue-600 text-white shadow-blue-600/20',
        success: 'bg-green-600 text-white shadow-green-600/20',
        warning: 'bg-amber-600 text-white shadow-amber-600/20',
        error: 'bg-red-600 text-white shadow-red-600/20',
        info: 'bg-cyan-600 text-white shadow-cyan-600/20',
    };

    const trendColors = {
        up: 'text-green-600 bg-green-50',
        down: 'text-red-600 bg-red-50',
        neutral: 'text-gray-400 bg-gray-50',
    };

    if (loading) {
        return (
            <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
                <div className="animate-pulse space-y-4">
                    <div className="h-3 bg-gray-100 rounded-full w-1/3"></div>
                    <div className="h-8 bg-gray-100 rounded-xl w-2/3"></div>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ y: -4 }}
            className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.02)] hover:shadow-[0_30px_70px_rgba(0,0,0,0.04)] transition-all duration-500 group relative overflow-hidden"
        >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50/50 rounded-full -mr-16 -mt-16 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>

            <div className="flex items-start justify-between relative z-10">
                <div className="flex-1 space-y-4">
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">{title}</p>
                        <h3 className="text-4xl font-black text-gray-900 tracking-tighter leading-none">{value}</h3>
                    </div>

                    {trend && trendValue && (
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-gray-50 bg-white shadow-sm">
                            <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-lg flex items-center gap-1 ${trendColors[trend]}`}>
                                {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {trendValue}
                            </span>
                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Growth</span>
                        </div>
                    )}
                </div>
                {Icon && (
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl transition-transform group-hover:rotate-12 duration-500 ${colorClasses[color]}`}>
                        <Icon className="w-7 h-7" />
                    </div>
                )}
            </div>
        </motion.div>
    );
};

StatCard.propTypes = {
    title: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    icon: PropTypes.elementType,
    trend: PropTypes.oneOf(['up', 'down', 'neutral']),
    trendValue: PropTypes.string,
    color: PropTypes.oneOf(['primary', 'success', 'warning', 'error', 'info']),
    loading: PropTypes.bool,
};

export default StatCard;
