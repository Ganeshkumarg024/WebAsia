import { motion } from 'framer-motion';

const IconWrapper = ({
    children,
    variant = 'primary',
    size = 'md',
    className = '',
    ...props
}) => {
    // Variant styles (gradient backgrounds)
    const variants = {
        primary: 'bg-gradient-to-br from-primary-100 to-primary-200 text-primary-600',
        secondary: 'bg-gradient-to-br from-secondary-100 to-secondary-200 text-secondary-600',
        accent: 'bg-gradient-to-br from-accent-100 to-accent-200 text-accent-600',
        blue: 'bg-gradient-to-br from-blue-100 to-blue-200 text-blue-600',
        green: 'bg-gradient-to-br from-green-100 to-green-200 text-green-600',
        orange: 'bg-gradient-to-br from-orange-100 to-orange-200 text-orange-600',
    };

    // Size styles
    const sizes = {
        sm: 'h-12 w-12',
        md: 'h-16 w-16',
        lg: 'h-20 w-20',
    };

    return (
        <motion.div
            className={`
                ${variants[variant]}
                ${sizes[size]}
                rounded-xl
                flex
                items-center
                justify-center
                ${className}
            `}
            whileHover={{
                rotate: [-10, 10, -10, 0],
                scale: [1, 1.2, 1],
                transition: { duration: 0.5 }
            }}
            {...props}
        >
            {children}
        </motion.div>
    );
};

export default IconWrapper;
