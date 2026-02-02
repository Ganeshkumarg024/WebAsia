import { useState, useMemo } from 'react';
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
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                <div className="animate-pulse p-6">
                    <div className="h-4 bg-gray-50 rounded w-full mb-4"></div>
                    <div className="h-4 bg-gray-50 rounded w-full mb-4"></div>
                    <div className="h-4 bg-gray-50 rounded w-full"></div>
                </div>
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
                <p className="text-gray-400 font-medium">{emptyMessage}</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50/50 border-b border-gray-100">
                        <tr>
                            {columns.map((column) => (
                                <th
                                    key={column.key}
                                    className={`px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest ${sortable && column.sortable !== false ? 'cursor-pointer hover:text-gray-900' : ''
                                        }`}
                                    onClick={() => column.sortable !== false && handleSort(column.key)}
                                >
                                    <div className="flex items-center gap-2">
                                        {column.label}
                                        {sortable && column.sortable !== false && sortConfig.key === column.key && (
                                            sortConfig.direction === 'asc' ? (
                                                <ChevronUpIcon className="w-4 h-4 text-blue-600" />
                                            ) : (
                                                <ChevronDownIcon className="w-4 h-4 text-blue-600" />
                                            )
                                        )}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {sortedData.map((row, index) => (
                            <tr
                                key={row.id || index}
                                className={`${onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''
                                    } transition-colors group`}
                                onClick={() => onRowClick && onRowClick(row)}
                            >
                                {columns.map((column) => (
                                    <td key={column.key} className="px-6 py-4 whitespace-nowrap">
                                        {column.render ? column.render(row[column.key], row) : (
                                            <span className="text-sm text-gray-600 font-medium">{row[column.key]}</span>
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
