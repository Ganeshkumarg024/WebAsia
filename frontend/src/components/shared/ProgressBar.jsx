import PropTypes from 'prop-types';

const ProgressBar = ({
    value,
    max = 100,
    color = 'primary',
    size = 'md',
    showLabel = true,
    label,
    className = ''
}) => {
    const percentage = Math.min(Math.round((value / max) * 100), 100);

    const colorClasses = {
        primary: 'bg-blue-600 shadow-[0_0_12px_rgba(37,99,235,0.2)]',
        success: 'bg-green-600 shadow-[0_0_12px_rgba(22,163,74,0.2)]',
        warning: 'bg-amber-600 shadow-[0_0_12px_rgba(217,119,6,0.2)]',
        error: 'bg-red-600 shadow-[0_0_12px_rgba(220,38,38,0.2)]',
    };

    const sizeClasses = {
        sm: 'h-1.5',
        md: 'h-3',
        lg: 'h-4',
    };

    return (
        <div className={className}>
            {showLabel && (
                <div className="flex items-center justify-between mb-3 px-1">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</span>
                    <span className="text-xs font-black text-gray-900 tracking-tight">{percentage}%</span>
                </div>
            )}
            <div className={`w-full bg-gray-100/80 rounded-full overflow-hidden p-0.5 border border-gray-50 ${sizeClasses[size]}`}>
                <div
                    className={`${colorClasses[color]} h-full rounded-full transition-all duration-1000 ease-out shadow-sm`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
};

ProgressBar.propTypes = {
    value: PropTypes.number.isRequired,
    max: PropTypes.number,
    color: PropTypes.oneOf(['primary', 'success', 'warning', 'error']),
    size: PropTypes.oneOf(['sm', 'md', 'lg']),
    showLabel: PropTypes.bool,
    label: PropTypes.string,
    className: PropTypes.string,
};

export default ProgressBar;
