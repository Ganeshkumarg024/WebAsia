import { motion } from 'framer-motion';

const PricingToggle = ({ isYearly, setIsYearly }) => {
    return (
        <div className="flex items-center justify-center gap-4 mb-12">
            <span className={`text-lg font-semibold transition-colors ${!isYearly ? 'text-gray-900' : 'text-gray-500'}`}>
                Monthly
            </span>

            <button
                onClick={() => setIsYearly(!isYearly)}
                className="relative w-16 h-8 bg-gray-200 rounded-full focus:outline-none focus:ring-4 focus:ring-primary-300 transition-colors"
                style={{ backgroundColor: isYearly ? '#0A7FBF' : '#e5e7eb' }}
                aria-label="Toggle pricing period"
            >
                <motion.div
                    className="absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md"
                    animate={{ x: isYearly ? 32 : 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
            </button>

            <div className="flex items-center gap-2">
                <span className={`text-lg font-semibold transition-colors ${isYearly ? 'text-gray-900' : 'text-gray-500'}`}>
                    Yearly
                </span>
                {isYearly && (
                    <motion.span
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full"
                    >
                        Save 20%
                    </motion.span>
                )}
            </div>
        </div>
    );
};

export default PricingToggle;
