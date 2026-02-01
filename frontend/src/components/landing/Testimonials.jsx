import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

import { useEffect } from 'react';
import useTestimonialStore from '../../store/testimonialStore';

const Testimonials = () => {
    const { publicTestimonials, fetchPublicTestimonials, isLoading } = useTestimonialStore();
    const [ref, inView] = useInView({
        triggerOnce: true,
        threshold: 0.1,
    });

    useEffect(() => {
        fetchPublicTestimonials();
    }, []);

    // Combine real testimonials with placeholders if empty (for initial look)
    const displayTestimonials = publicTestimonials.length > 0 ? publicTestimonials : [
        {
            user: { firstName: 'Rajesh', lastName: 'Kumar', photoUrl: null },
            content: 'WebAsia transformed our brand identity completely. The unlimited revisions meant we got exactly what we wanted. Best investment we\'ve made!',
            rating: 5,
        },
        {
            user: { firstName: 'Priya', lastName: 'Sharma', photoUrl: null },
            content: 'The turnaround time is incredible! We get professional designs in 24-48 hours. Our social media has never looked better.',
            rating: 5,
        },
        {
            user: { firstName: 'Amit', lastName: 'Patel', photoUrl: null },
            content: 'Having a dedicated designer who understands our brand has been game-changing. The flat monthly fee saves us thousands compared to hiring.',
            rating: 5,
        },
    ];

    return (
        <section id="testimonials" className="py-20 bg-gradient-to-br from-purple-50 to-pink-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    ref={ref}
                    initial={{ opacity: 0, y: 30 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl sm:text-5xl font-bold mb-4">
                        Trusted by{' '}
                        <span className="bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
                            Indian Businesses
                        </span>
                    </h2>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        See what our clients have to say about their experience with WebAsia
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {displayTestimonials.map((testimonial, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            animate={inView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.6, delay: index * 0.2 }}
                            className="bg-white/80 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/20 shadow-xl shadow-purple-500/5 hover:-translate-y-2 transition-transform h-full flex flex-col"
                        >
                            <div className="flex items-center mb-4">
                                {[...Array(testimonial.rating || 5)].map((_, i) => (
                                    <svg
                                        key={i}
                                        className="w-5 h-5 text-yellow-400"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                ))}
                            </div>
                            <p className="text-gray-700 mb-8 leading-relaxed italic text-lg flex-1">
                                "{testimonial.content}"
                            </p>
                            <div className="flex items-center gap-4 mt-auto">
                                {testimonial.user?.photoUrl ? (
                                    <img
                                        src={testimonial.user.photoUrl}
                                        alt={testimonial.user.firstName}
                                        className="w-12 h-12 rounded-2xl object-cover ring-2 ring-purple-100"
                                    />
                                ) : (
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xl shadow-lg ring-2 ring-purple-100">
                                        {(testimonial.user?.firstName?.[0] || 'U')}
                                    </div>
                                )}
                                <div>
                                    <h4 className="font-black text-gray-900 leading-none mb-1">
                                        {testimonial.user?.firstName} {testimonial.user?.lastName}
                                    </h4>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{testimonial.serviceType || 'Client'}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Testimonials;
