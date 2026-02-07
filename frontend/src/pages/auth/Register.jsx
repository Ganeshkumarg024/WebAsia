import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';
import AuthBackground from '../../components/auth/AuthBackground';

// Validation schema
const registerSchema = z.object({
    firstName: z.string().min(2, 'First name must be at least 2 characters'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase, and number'),
    phone: z.string().optional(),
});

const Register = () => {
    const navigate = useNavigate();
    const { register: registerUser, isLoading } = useAuthStore();
    const [showPassword, setShowPassword] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(registerSchema),
    });

    const onSubmit = async (data) => {
        // Retrieve referral code if exists
        let referralCode = null;
        const storedReferral = localStorage.getItem('wa_referral');
        if (storedReferral) {
            try {
                const { code, expiry } = JSON.parse(storedReferral);
                if (expiry > Date.now()) {
                    referralCode = code;
                } else {
                    localStorage.removeItem('wa_referral');
                }
            } catch (err) {
                console.error('Failed to parse referral data:', err);
            }
        }

        const result = await registerUser({ ...data, role: 'client', referralCode });

        if (result.success) {
            toast.success('Registration successful!');
            if (referralCode) {
                localStorage.removeItem('wa_referral');
            }
            navigate('/dashboard');
        } else {
            toast.error(result.error || 'Registration failed');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-purple-50/20 flex flex-col lg:flex-row overflow-hidden font-inter relative">
            {/* 3D Animated Background */}
            <div className="fixed inset-0 z-0">
                <AuthBackground />
            </div>

            {/* Content Container */}
            <div className="relative z-10 flex flex-col lg:flex-row w-full min-h-screen">
                {/* Left Side: Brand Experience - Hidden on mobile */}
                <div className="hidden lg:flex lg:w-1/2 relative bg-white/40 backdrop-blur-sm items-center justify-center p-12 overflow-hidden border-r border-white/50">
                    <div className="absolute inset-0 z-0">
                        <div className="absolute top-20 left-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
                        <div className="absolute bottom-20 right-20 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl animate-pulse delay-700"></div>
                    </div>

                    <div className="relative z-10 w-full max-w-lg space-y-12">
                        <div className="space-y-6 text-center">
                            <img
                                src="/assets/mascot.png"
                                alt="WebAsia Mascot"
                                className="w-full max-w-sm mx-auto drop-shadow-[0_20px_50px_rgba(59,130,246,0.2)] animate-float"
                            />
                            <div className="space-y-4">
                                <h2 className="text-5xl font-black text-gray-900 leading-tight tracking-tight">
                                    Join WebAsia <br />
                                    <span className="text-blue-600 italic">Today</span>
                                </h2>
                                <p className="text-gray-600 text-lg max-w-md mx-auto leading-relaxed font-medium">
                                    Experience the future of creative collaboration. Unlimited design, zero friction.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {[
                                { icon: '💎', title: 'Unlimited Requests', desc: 'No caps on your creativity' },
                                { icon: '🚀', title: 'Express Delivery', desc: 'Average 24h turnaround' },
                                { icon: '👥', title: 'Dedicated Team', desc: 'Assigned world-class designers' }
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-4 bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-white/60 shadow-lg shadow-blue-500/10">
                                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-xl">
                                        {item.icon}
                                    </div>
                                    <div>
                                        <h4 className="text-gray-900 font-bold text-sm tracking-tight">{item.title}</h4>
                                        <p className="text-gray-500 text-xs font-medium">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Side: Register Form */}
                <div className="flex-1 lg:w-1/2 flex flex-col items-center justify-center p-6 sm:p-8 lg:px-20 lg:py-8 bg-white/50 backdrop-blur-md overflow-y-auto">
                    <div className="w-full max-w-md space-y-6 lg:space-y-8 my-auto">
                        {/* Mobile Logo - Only visible on mobile */}
                        <div className="lg:hidden flex flex-col items-center space-y-4 mb-4">
                            <img
                                src="/assets/mascot.png"
                                alt="WebAsia Mascot"
                                className="w-28 h-28 drop-shadow-[0_10px_30px_rgba(59,130,246,0.2)] animate-float"
                            />
                        </div>

                        <div className="space-y-2 text-center lg:text-left">
                            <div className="flex items-center justify-center lg:justify-start gap-3 mb-4">
                                <img
                                    src="/assets/webasia-logo-wide.png"
                                    alt="WebAsia"
                                    className="h-20 w-auto"
                                />
                            </div>
                            <h1 className="text-4xl lg:text-5xl font-black text-gray-900 tracking-tight">Create Account</h1>
                            <p className="text-gray-600 font-medium text-base">Start your creative journey in seconds.</p>
                        </div>

                        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] px-1">First Name</label>
                                        <input
                                            {...register('firstName')}
                                            type="text"
                                            placeholder="John"
                                            className="w-full bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl px-5 py-3.5 text-gray-900 placeholder-gray-400 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all outline-none text-sm font-medium shadow-sm"
                                        />
                                        {errors.firstName && <p className="text-[9px] text-red-500 font-black px-1 uppercase tracking-widest">{errors.firstName.message}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] px-1">Last Name</label>
                                        <input
                                            {...register('lastName')}
                                            type="text"
                                            placeholder="Doe"
                                            className="w-full bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl px-5 py-3.5 text-gray-900 placeholder-gray-400 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all outline-none text-sm font-medium shadow-sm"
                                        />
                                        {errors.lastName && <p className="text-[9px] text-red-500 font-black px-1 uppercase tracking-widest">{errors.lastName.message}</p>}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] px-1">Work Email</label>
                                    <input
                                        {...register('email')}
                                        type="email"
                                        placeholder="john@company.com"
                                        className="w-full bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl px-5 py-3.5 text-gray-900 placeholder-gray-400 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all outline-none text-sm font-medium shadow-sm"
                                    />
                                    {errors.email && <p className="text-[9px] text-red-500 font-black px-1 uppercase tracking-widest">{errors.email.message}</p>}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] px-1">Phone Number (Optional)</label>
                                    <input
                                        {...register('phone')}
                                        type="tel"
                                        placeholder="+1 (555) 000-0000"
                                        className="w-full bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl px-5 py-3.5 text-gray-900 placeholder-gray-400 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all outline-none text-sm font-medium shadow-sm"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] px-1">Password</label>
                                    <div className="relative">
                                        <input
                                            {...register('password')}
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="••••••••••••"
                                            className="w-full bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl px-5 py-3.5 text-gray-900 placeholder-gray-400 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all outline-none text-sm font-medium shadow-sm"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-blue-600 transition-colors"
                                        >
                                            {showPassword ? (
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            ) : (
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                    {errors.password && <p className="text-[9px] text-red-500 font-black px-1 uppercase tracking-widest">{errors.password.message}</p>}
                                    <p className="text-[9px] text-gray-500 px-1 font-bold uppercase tracking-wider">Must include uppercase, lowercase, and a number.</p>
                                </div>
                            </div>

                            <div className="space-y-4 pt-2">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white h-14 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-600/30 hover:shadow-2xl hover:shadow-blue-600/40 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 group"
                                >
                                    {isLoading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        <>
                                            <span>Create Account</span>
                                            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                            </svg>
                                        </>
                                    )}
                                </button>

                                <p className="text-center text-[11px] font-black text-gray-500 uppercase tracking-widest">
                                    Already have an account?{' '}
                                    <Link to="/login" className="text-blue-600 hover:underline ml-1">Sign in instead</Link>
                                </p>
                            </div>
                        </form>
                    </div>

                    <div className="mt-8 text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] text-center">
                        By joining, you agree to our <span className="text-blue-600 cursor-pointer hover:underline">Terms</span> & <span className="text-blue-600 cursor-pointer hover:underline">Privacy Policy</span>.
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-20px); }
                }
                .animate-float { animation: float 6s ease-in-out infinite; }
                .delay-700 { animation-delay: 700ms; }
            ` }} />
        </div>
    );
};

export default Register;
