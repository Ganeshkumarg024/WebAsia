import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const AnimatedCard = ({
    children,
    className = '',
    delay = 0,
    hover = true,
    ...props
}) => {
    const [ref, inView] = useInView({
        triggerOnce: true,
        threshold: 0.1,
    });

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{
                duration: 0.6,
                delay,
                type: 'spring',
                stiffness: 100,
                damping: 15
            }}
            whileHover={hover ? {
                scale: 1.05,
                y: -10,
                transition: { type: 'spring', stiffness: 400, damping: 10 }
            } : {}}
            whileTap={hover ? { scale: 0.95 } : {}}
            className={`
                bg-white 
                p-8 
                rounded-2xl 
                shadow-lg 
                min-h-[280px]
                transition-shadow
                hover:shadow-2xl
                ${className}
            `}
            style={{ transformStyle: 'preserve-3d' }}
            {...props}
        >
            {children}
        </motion.div>
    );
};

export default AnimatedCard;
