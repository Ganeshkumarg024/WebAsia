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
        primary: 'bg-blue-500',
        success: 'bg-green-500',
        warning: 'bg-yellow-500',
        error: 'bg-red-500',
    };

    const sizeClasses = {
        sm: 'h-1',
        md: 'h-2',
        lg: 'h-3',
    };

    return (
        <div className={className}>
            {showLabel && (
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">{label}</span>
                    <span className="text-sm font-medium text-white">{percentage}%</span>
                </div>
            )}
            <div className={`w-full bg-gray-700 rounded-full overflow-hidden ${sizeClasses[size]}`}>
                <div
                    className={`${colorClasses[color]} ${sizeClasses[size]} rounded-full transition-all duration-300 ease-out`}
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
