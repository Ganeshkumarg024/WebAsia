import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StarIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline';
import useTestimonialStore from '../../store/testimonialStore';
import toast from 'react-hot-toast';

const FeedbackForm = ({ requestId, serviceType, icon, onSuccess, onCancel }) => {
    const { submitTestimonial, isLoading } = useTestimonialStore();
    const [rating, setRating] = useState(5);
    const [hoverRating, setHoverRating] = useState(0);
    const [content, setContent] = useState('');
    const [isPublic, setIsPublic] = useState(true);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim()) {
            toast.error('Please share your thoughts');
            return;
        }

        try {
            await submitTestimonial({
                requestId,
                serviceType,
                rating,
                content,
                isPublic
            });
            toast.success('Feedback submitted! Thank you.');
            if (onSuccess) onSuccess();
        } catch (err) {
            toast.error(err.message || 'Failed to submit feedback');
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[2.5rem] p-8 sm:p-10 shadow-2xl border border-gray-100 max-w-lg w-full"
        >
            <div className="text-center space-y-4 mb-8">
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto text-3xl">
                    {icon || '✨'}
                </div>
                <div>
                    <h3 className="text-2xl font-black text-gray-900 tracking-tight">How did we do?</h3>
                    <p className="text-gray-500 font-medium">Your feedback helps us improve and grow.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Rating */}
                <div className="flex justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            className="p-1 transition-transform active:scale-90"
                        >
                            {(hoverRating || rating) >= star ? (
                                <StarIcon className="w-10 h-10 text-yellow-400" />
                            ) : (
                                <StarOutlineIcon className="w-10 h-10 text-gray-200" />
                            )}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Your Thoughts</label>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Tell us about your experience..."
                        rows={4}
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 outline-none focus:border-blue-600 focus:bg-white transition-all font-medium resize-none"
                    />
                </div>

                {/* Consent */}
                <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative">
                        <input
                            type="checkbox"
                            checked={isPublic}
                            onChange={(e) => setIsPublic(e.target.checked)}
                            className="peer sr-only"
                        />
                        <div className="w-5 h-5 border-2 border-gray-200 rounded-lg group-hover:border-blue-600 peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-all"></div>
                        <svg className="absolute top-0.5 left-0.5 w-4 h-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <span className="text-xs font-bold text-gray-500">Allow WebAsia to feature this feedback on the website</span>
                </label>

                <div className="flex gap-4 pt-4">
                    {onCancel && (
                        <button
                            type="button"
                            onClick={onCancel}
                            className="flex-1 h-14 rounded-2xl font-bold text-gray-500 hover:bg-gray-50 transition-colors"
                        >
                            Later
                        </button>
                    )}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="flex-1 bg-blue-600 text-white h-14 rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-blue-600/20 hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-50"
                    >
                        {isLoading ? 'Submitting...' : 'Send Feedback'}
                    </button>
                </div>
            </form>
        </motion.div>
    );
};

export default FeedbackForm;
