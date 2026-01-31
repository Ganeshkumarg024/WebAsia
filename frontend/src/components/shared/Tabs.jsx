import { useState } from 'react';
import PropTypes from 'prop-types';

const Tabs = ({ tabs, defaultTab = 0, onChange }) => {
    const [activeTab, setActiveTab] = useState(defaultTab);

    const handleTabChange = (index) => {
        setActiveTab(index);
        if (onChange) onChange(index);
    };

    return (
        <div>
            <div className="border-b border-[#1E2638]">
                <nav className="-mb-px flex space-x-8">
                    {tabs.map((tab, index) => (
                        <button
                            key={index}
                            onClick={() => handleTabChange(index)}
                            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === index
                                    ? 'border-blue-500 text-blue-500'
                                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                                }`}
                        >
                            {tab.label}
                            {tab.count !== undefined && (
                                <span
                                    className={`ml-2 py-0.5 px-2 rounded-full text-xs ${activeTab === index
                                            ? 'bg-blue-500/10 text-blue-500'
                                            : 'bg-gray-700 text-gray-400'
                                        }`}
                                >
                                    {tab.count}
                                </span>
                            )}
                        </button>
                    ))}
                </nav>
            </div>
            <div className="mt-6">{tabs[activeTab]?.content}</div>
        </div>
    );
};

Tabs.propTypes = {
    tabs: PropTypes.arrayOf(
        PropTypes.shape({
            label: PropTypes.string.isRequired,
            content: PropTypes.node.isRequired,
            count: PropTypes.number,
        })
    ).isRequired,
    defaultTab: PropTypes.number,
    onChange: PropTypes.func,
};

export default Tabs;
