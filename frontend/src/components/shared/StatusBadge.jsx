import PropTypes from 'prop-types';

const StatusBadge = ({ status, size = 'md' }) => {
    const statusConfig = {
        // Request statuses
        pending: { label: 'Pending', color: 'bg-amber-50 text-amber-600 border-amber-200' },
        'in-progress': { label: 'In Progress', color: 'bg-blue-50 text-blue-600 border-blue-200' },
        'in-review': { label: 'In Review', color: 'bg-purple-50 text-purple-600 border-purple-200' },
        'pending-feedback': { label: 'Pending Feedback', color: 'bg-orange-50 text-orange-600 border-orange-200' },
        completed: { label: 'Completed', color: 'bg-green-50 text-green-600 border-green-200' },
        cancelled: { label: 'Cancelled', color: 'bg-gray-50 text-gray-500 border-gray-200' },

        // Priority levels
        low: { label: 'Low', color: 'bg-gray-50 text-gray-400 border-gray-200' },
        medium: { label: 'Medium', color: 'bg-blue-50 text-blue-600 border-blue-100' },
        high: { label: 'High', color: 'bg-orange-50 text-orange-600 border-orange-100' },
        urgent: { label: 'Urgent', color: 'bg-red-50 text-red-600 border-red-100' },

        // Subscription statuses
        active: { label: 'Active', color: 'bg-green-50 text-green-600 border-green-200' },
        inactive: { label: 'Inactive', color: 'bg-gray-100 text-gray-400 border-gray-200' },
        paused: { label: 'Paused', color: 'bg-amber-50 text-amber-600 border-amber-200' },

        // Generic statuses
        approved: { label: 'Approved', color: 'bg-green-50 text-green-600 border-green-200' },
        rejected: { label: 'Rejected', color: 'bg-red-50 text-red-600 border-red-200' },
        draft: { label: 'Draft', color: 'bg-gray-50 text-gray-400 border-gray-200' },
    };

    const sizeClasses = {
        sm: 'text-[9px] px-2 py-0.5 tracking-widest uppercase font-black',
        md: 'text-[10px] px-3 py-1 tracking-widest uppercase font-black',
        lg: 'text-xs px-4 py-1.5 tracking-widest uppercase font-black',
    };

    const config = statusConfig[status.toLowerCase()] || statusConfig.pending;

    return (
        <span
            className={`inline-flex items-center rounded-xl border shadow-sm transition-all duration-300 ${config.color} ${sizeClasses[size]}`}
        >
            {config.label}
        </span>
    );
};

StatusBadge.propTypes = {
    status: PropTypes.string.isRequired,
    size: PropTypes.oneOf(['sm', 'md', 'lg']),
};

export default StatusBadge;
