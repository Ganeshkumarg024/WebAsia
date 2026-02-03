import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline';

const ConfirmDialog = ({
    isOpen,
    onClose,
    onConfirm,
    title = 'Confirm Action',
    message = 'Are you sure you want to proceed?',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'danger', // 'danger' | 'warning' | 'info'
    loading = false,
}) => {
    const variantStyles = {
        danger: {
            icon: 'text-red-600 bg-red-50',
            button: 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/20',
        },
        warning: {
            icon: 'text-orange-600 bg-orange-50',
            button: 'bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-600/20',
        },
        info: {
            icon: 'text-blue-600 bg-blue-50',
            button: 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20',
        },
    };

    const styles = variantStyles[variant];

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95 translate-y-4"
                            enterTo="opacity-100 scale-100 translate-y-0"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100 translate-y-0"
                            leaveTo="opacity-0 scale-95 translate-y-4"
                        >
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-[32px] bg-white text-left align-middle shadow-2xl transition-all border border-gray-100">
                                <div className="p-8">
                                    <div className="flex items-start gap-4">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${styles.icon}`}>
                                            <ExclamationTriangleIcon className="w-6 h-6" />
                                        </div>
                                        <div className="flex-1">
                                            <Dialog.Title as="h3" className="text-xl font-black text-gray-900 mb-2 tracking-tight">
                                                {title}
                                            </Dialog.Title>
                                            <p className="text-sm text-gray-600 font-medium leading-relaxed">
                                                {message}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 mt-8">
                                        <button
                                            onClick={onClose}
                                            disabled={loading}
                                            className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-black uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {cancelText}
                                        </button>
                                        <button
                                            onClick={onConfirm}
                                            disabled={loading}
                                            className={`flex-1 px-4 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed ${styles.button}`}
                                        >
                                            {loading ? 'Processing...' : confirmText}
                                        </button>
                                    </div>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

export default ConfirmDialog;
