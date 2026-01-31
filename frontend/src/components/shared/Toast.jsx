import toast, { Toaster } from 'react-hot-toast';

// Toast configuration
export const toastConfig = {
    duration: 4000,
    position: 'top-right',
    style: {
        background: '#151B2E',
        color: '#fff',
        border: '1px solid #1E2638',
    },
    success: {
        iconTheme: {
            primary: '#10B981',
            secondary: '#fff',
        },
    },
    error: {
        iconTheme: {
            primary: '#EF4444',
            secondary: '#fff',
        },
    },
};

// Toast helper functions
export const showToast = {
    success: (message) => toast.success(message, toastConfig),
    error: (message) => toast.error(message, toastConfig),
    loading: (message) => toast.loading(message, toastConfig),
    promise: (promise, messages) => toast.promise(promise, messages, toastConfig),
};

// Toast container component
export const ToastContainer = () => {
    return <Toaster position={toastConfig.position} />;
};

export default showToast;
