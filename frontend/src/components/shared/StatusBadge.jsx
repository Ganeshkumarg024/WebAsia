import PropTypes from 'prop-types';

const StatusBadge = ({ status, size = 'md' }) => {
    const statusConfig = {
        // Request statuses
        pending: { label: 'Pending', color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' },
        'in-progress': { label: 'In Progress', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
        'in-review': { label: 'In Review', color: 'bg-purple-500/10 text-purple-500 border-purple-500/20' },
        'pending-feedback': { label: 'Pending Feedback', color: 'bg-orange-500/10 text-orange-500 border-orange-500/20' },
        completed: { label: 'Completed', color: 'bg-green-500/10 text-green-500 border-green-500/20' },
        cancelled: { label: 'Cancelled', color: 'bg-red-500/10 text-red-500 border-red-500/20' },

        // Priority levels
        low: { label: 'Low', color: 'bg-gray-500/10 text-gray-400 border-gray-500/20' },
        medium: { label: 'Medium', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
        high: { label: 'High', color: 'bg-orange-500/10 text-orange-500 border-orange-500/20' },
        urgent: { label: 'Urgent', color: 'bg-red-500/10 text-red-500 border-red-500/20' },

        // Subscription statuses
        active: { label: 'Active', color: 'bg-green-500/10 text-green-500 border-green-500/20' },
        inactive: { label: 'Inactive', color: 'bg-gray-500/10 text-gray-400 border-gray-500/20' },
        paused: { label: 'Paused', color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' },

        // Generic statuses
        approved: { label: 'Approved', color: 'bg-green-500/10 text-green-500 border-green-500/20' },
        rejected: { label: 'Rejected', color: 'bg-red-500/10 text-red-500 border-red-500/20' },
        draft: { label: 'Draft', color: 'bg-gray-500/10 text-gray-400 border-gray-500/20' },
    };

    const sizeClasses = {
        sm: 'text-xs px-2 py-0.5',
        md: 'text-sm px-2.5 py-1',
        lg: 'text-base px-3 py-1.5',
    };

    const config = statusConfig[status.toLowerCase()] || statusConfig.pending;

    return (
        <span
            className={`inline-flex items-center rounded-full font-medium border ${config.color} ${sizeClasses[size]}`}
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
