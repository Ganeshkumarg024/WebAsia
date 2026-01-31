import { useState, useMemo } from 'prop-types';
import PropTypes from 'prop-types';
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

const DataTable = ({
    columns,
    data,
    loading = false,
    emptyMessage = 'No data available',
    onRowClick,
    sortable = true,
}) => {
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

    const sortedData = useMemo(() => {
        if (!sortConfig.key) return data;

        return [...data].sort((a, b) => {
            const aValue = a[sortConfig.key];
            const bValue = b[sortConfig.key];

            if (aValue < bValue) {
                return sortConfig.direction === 'asc' ? -1 : 1;
            }
            if (aValue > bValue) {
                return sortConfig.direction === 'asc' ? 1 : -1;
            }
            return 0;
        });
    }, [data, sortConfig]);

    const handleSort = (key) => {
        if (!sortable) return;

        setSortConfig((prev) => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
        }));
    };

    if (loading) {
        return (
            <div className="bg-[#151B2E] rounded-lg border border-[#1E2638] overflow-hidden">
                <div className="animate-pulse p-6">
                    <div className="h-4 bg-gray-700 rounded w-full mb-4"></div>
                    <div className="h-4 bg-gray-700 rounded w-full mb-4"></div>
                    <div className="h-4 bg-gray-700 rounded w-full"></div>
                </div>
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="bg-[#151B2E] rounded-lg border border-[#1E2638] p-12 text-center">
                <p className="text-gray-400">{emptyMessage}</p>
            </div>
        );
    }

    return (
        <div className="bg-[#151B2E] rounded-lg border border-[#1E2638] overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-[#0A0E1A] border-b border-[#1E2638]">
                        <tr>
                            {columns.map((column) => (
                                <th
                                    key={column.key}
                                    className={`px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider ${sortable && column.sortable !== false ? 'cursor-pointer hover:text-white' : ''
                                        }`}
                                    onClick={() => column.sortable !== false && handleSort(column.key)}
                                >
                                    <div className="flex items-center gap-2">
                                        {column.label}
                                        {sortable && column.sortable !== false && sortConfig.key === column.key && (
                                            sortConfig.direction === 'asc' ? (
                                                <ChevronUpIcon className="w-4 h-4" />
                                            ) : (
                                                <ChevronDownIcon className="w-4 h-4" />
                                            )
                                        )}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1E2638]">
                        {sortedData.map((row, index) => (
                            <tr
                                key={row.id || index}
                                className={`${onRowClick ? 'cursor-pointer hover:bg-[#1E2638]' : ''
                                    } transition-colors`}
                                onClick={() => onRowClick && onRowClick(row)}
                            >
                                {columns.map((column) => (
                                    <td key={column.key} className="px-6 py-4 whitespace-nowrap">
                                        {column.render ? column.render(row[column.key], row) : (
                                            <span className="text-sm text-white">{row[column.key]}</span>
                                        )}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

DataTable.propTypes = {
    columns: PropTypes.arrayOf(
        PropTypes.shape({
            key: PropTypes.string.isRequired,
            label: PropTypes.string.isRequired,
            sortable: PropTypes.bool,
            render: PropTypes.func,
        })
    ).isRequired,
    data: PropTypes.array.isRequired,
    loading: PropTypes.bool,
    emptyMessage: PropTypes.string,
    onRowClick: PropTypes.func,
    sortable: PropTypes.bool,
};

export default DataTable;
