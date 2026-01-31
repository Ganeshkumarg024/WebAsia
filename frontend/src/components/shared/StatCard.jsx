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
        primary: 'bg-blue-500/10 text-blue-500',
        success: 'bg-green-500/10 text-green-500',
        warning: 'bg-yellow-500/10 text-yellow-500',
        error: 'bg-red-500/10 text-red-500',
        info: 'bg-cyan-500/10 text-cyan-500',
    };

    const trendColors = {
        up: 'text-green-500',
        down: 'text-red-500',
        neutral: 'text-gray-400',
    };

    if (loading) {
        return (
            <div className="bg-[#151B2E] rounded-lg p-6 border border-[#1E2638]">
                <div className="animate-pulse">
                    <div className="h-4 bg-gray-700 rounded w-1/2 mb-4"></div>
                    <div className="h-8 bg-gray-700 rounded w-3/4"></div>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#151B2E] rounded-lg p-6 border border-[#1E2638] hover:border-[#2A3447] transition-colors"
        >
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-sm text-gray-400 mb-2">{title}</p>
                    <h3 className="text-3xl font-bold text-white mb-2">{value}</h3>
                    {trend && trendValue && (
                        <div className="flex items-center gap-1">
                            <span className={`text-sm font-medium ${trendColors[trend]}`}>
                                {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {trendValue}
                            </span>
                            <span className="text-xs text-gray-500">vs last period</span>
                        </div>
                    )}
                </div>
                {Icon && (
                    <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
                        <Icon className="w-6 h-6" />
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
