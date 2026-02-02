import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeftIcon, ChevronRightIcon, SparklesIcon, ClockIcon } from '@heroicons/react/24/outline';
import FileUploader from '../../components/shared/FileUploader';
import DashboardLayout from '../../components/layout/DashboardLayout';
import useRequestStore from '../../store/requestStore';
import showToast from '../../components/shared/Toast';

const CreateRequest = () => {
    const navigate = useNavigate();
    const { createRequest, isLoading } = useRequestStore();
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState({
        category: '',
        title: '',
        description: '',
        priority: 'normal',
        deadline: '',
        files: [],
    });

    const categories = [
        {
            id: 'graphic-design',
            name: 'Graphic Design',
            description: 'Logo, social media, print ads, and brand identity.',
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAXuxr4cnLscTasexqUzU0boCusP-7LHSUG6kc9laTbJrBA6Re0Desib9b46J7QRNja15UXbCRByKHbele3E93J9OFen9Z8N48Wjj88gUoZ0UQCS1Sd_U0muRGYrgGIoJiHnDZ9V6MG_UUVd5ziIdCKdM48dSTyYTnh9urXXwYOtuesTLM2qasQXjmW67cT2ytvwudNzAt5Shwvb5xZXmmrABovi6ENzGQiz1h8neSB4cH1-Qy7bllZdKWiZ0fRgNB4Q7z4an4az5U',
        },
        {
            id: 'video-production',
            name: 'Video Production',
            description: 'Short ads, motion graphics, and professional editing.',
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDKYdIdLuDoVRk9Xueb28GleXJxjCyQKj8yncfqz8PWJTfW3H8L6yiPe2fNNdBd_lXQmDb5EekO2s43VCocyC0ib5mmF9z_RQt48D2ZoMcMmV8WqksBu0MwqOzqdxVXVZWBj1bnEp54EglyQbLlyZzzXVZ1LMcXFtLb4adAZsc5jHOv9jOs9tR2e7_nfR6qqWsfGOxrPruO56u7OaFwieLKvmWusOZGvZI0R10A1AMlGDIjG3jlE0TltMZBiRHjL14elRTarxqbQk0',
        },
        {
            id: 'web-development',
            name: 'Web Development',
            description: 'Landing pages, UI/UX design, and React components.',
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuANiExtv25Yt5gw9CN9VEeXFaFZtFRt4PE5pxnrC4gdJY2httr5O32Wh7QuksMmHOr6V4nwg9yIL0UJTPyXmsWXSlhiC_1MgaDXSHEkmkNCcOkV3UWwCBr6etYlDd9BjeHR7IrjMyTQoCSJ6vHnPiZ8pWANm754XkXMreYol4qZ6QagnQh-EgiXM9l7diI7yCE7USU8--SrCjIQfZCqVLBrtLy9wqMLN1kEohr9KCAuKHaEWda5AWTU8fpFLXMjcGOlwadRizdf7JU',
        },
    ];

    const steps = [
        { id: 1, name: 'CATEGORY', label: 'Category', icon: 'category' },
        { id: 2, name: 'DETAILS', label: 'Details', icon: 'description' },
        { id: 3, name: 'ASSETS', label: 'Assets', icon: 'cloud_upload' },
        { id: 4, name: 'OUTPUT', label: 'Output', icon: 'output' },
    ];

    const handleNext = () => {
        if (currentStep === 0 && !formData.category) {
            showToast.error('Please select a service category');
            return;
        }
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSubmit = async () => {
        if (!formData.title || !formData.description) {
            showToast.error('Please fill in all required fields');
            return;
        }

        const payload = {
            ...formData,
            serviceType: formData.category.replace(/-/g, '_'), // Match backend enum format
        };

        const result = await createRequest(payload);
        if (result.success) {
            showToast.success('Request created successfully!');
            navigate('/client/requests');
        } else {
            showToast.error(result.error || 'Failed to create request');
        }
    };

    return (
        <DashboardLayout breadcrumbs={['Requests', 'Create New']}>
            <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Headline Section */}
                <div className="space-y-2">
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">
                        Submit <span className="text-blue-600">New Request</span>
                    </h1>
                    <p className="text-gray-500 font-medium">Tell us what you need and our experts will handle the rest.</p>
                </div>

                {/* Progress Stepper */}
                <div className="bg-white rounded-3xl border border-gray-100 p-2 shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden">
                    <div className="flex items-center">
                        {steps.map((step, index) => (
                            <button
                                key={step.id}
                                onClick={() => index < currentStep && setCurrentStep(index)}
                                className={`flex-1 flex flex-col items-center justify-center py-4 rounded-2xl transition-all duration-300 ${index === currentStep
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                                    : index < currentStep
                                        ? 'text-blue-600 bg-blue-50/50'
                                        : 'text-gray-400'
                                    }`}
                            >
                                <span className={`text-[10px] font-black uppercase tracking-widest leading-none ${index === currentStep ? 'text-white' : index < currentStep ? 'text-blue-600' : 'text-gray-400'}`}>
                                    {step.id}. {step.name}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Form Content */}
                <div className="bg-white rounded-[40px] border border-gray-100 p-10 shadow-[0_20px_60px_rgb(0,0,0,0.03)] relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/30 rounded-full -mr-32 -mt-32 blur-3xl"></div>

                    {/* Step 1: Category */}
                    {currentStep === 0 && (
                        <div className="relative z-10 space-y-8">
                            <div className="space-y-1">
                                <h2 className="text-2xl font-black text-gray-900 tracking-tight">Select Category</h2>
                                <p className="text-gray-500 text-sm font-medium">What kind of creative magic do you need today?</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {categories.map((category) => (
                                    <label key={category.id} className="group cursor-pointer relative block">
                                        <input
                                            type="radio"
                                            name="category"
                                            value={category.id}
                                            checked={formData.category === category.id}
                                            onChange={() => setFormData({ ...formData, category: category.id })}
                                            className="sr-only peer"
                                        />
                                        <div className={`h-full p-6 rounded-[32px] border-2 transition-all duration-300 flex flex-col ${formData.category === category.id
                                            ? 'border-blue-600 bg-blue-50/30 shadow-xl shadow-blue-600/5'
                                            : 'border-gray-50 bg-gray-50/30 hover:border-blue-200 hover:bg-white'
                                            }`}>
                                            <div
                                                className="w-full h-32 mb-6 rounded-2xl bg-cover bg-center border border-gray-100 shadow-inner group-hover:scale-[1.02] transition-transform duration-500"
                                                style={{ backgroundImage: `url(${category.image})` }}
                                            ></div>
                                            <h3 className={`font-black text-lg mb-2 tracking-tight ${formData.category === category.id ? 'text-blue-600' : 'text-gray-900'}`}>{category.name}</h3>
                                            <p className="text-xs text-gray-500 leading-relaxed font-medium flex-1">{category.description}</p>
                                            <div className="mt-6 flex justify-end">
                                                <div className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all ${formData.category === category.id ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-200'
                                                    }`}>
                                                    {formData.category === category.id && <span className="font-bold text-sm">✓</span>}
                                                </div>
                                            </div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 2: Details */}
                    {currentStep === 1 && (
                        <div className="relative z-10 space-y-10">
                            <div className="space-y-1">
                                <h2 className="text-2xl font-black text-gray-900 tracking-tight">Project Details</h2>
                                <p className="text-gray-500 text-sm font-medium">Give us the blueprint for your vision.</p>
                            </div>

                            <div className="space-y-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">Project Title</label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl py-5 px-6 text-gray-900 font-bold focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 transition-all outline-none placeholder-gray-300 text-lg"
                                        placeholder="e.g., Q4 Branding Refresh"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">Detailed Brief</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        rows={6}
                                        className="w-full bg-gray-50/50 border border-gray-100 rounded-[32px] py-5 px-6 text-gray-900 font-medium focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 transition-all outline-none resize-none placeholder-gray-300"
                                        placeholder="Describe your vision, target audience, and any specific requirements..."
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">Priority Level</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            {['normal', 'urgent'].map((prio) => (
                                                <button
                                                    key={prio}
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, priority: prio })}
                                                    className={`py-4 px-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${formData.priority === prio
                                                        ? 'border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                                                        : 'border-transparent bg-gray-50 text-gray-400 hover:bg-gray-100'
                                                        }`}
                                                >
                                                    {prio}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">Target Deadline</label>
                                        <input
                                            type="date"
                                            value={formData.deadline}
                                            onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                                            className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl py-5 px-6 text-gray-900 font-bold focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 transition-all outline-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Assets */}
                    {currentStep === 2 && (
                        <div className="relative z-10 space-y-8">
                            <div className="space-y-1">
                                <h2 className="text-2xl font-black text-gray-900 tracking-tight">Assets & Inspiration</h2>
                                <p className="text-gray-500 text-sm font-medium">Upload brand guidelines or reference files.</p>
                            </div>

                            <div className="bg-gray-50/50 border-4 border-dashed border-gray-100 rounded-[40px] p-12 text-center hover:border-blue-600/30 transition-all group">
                                <FileUploader
                                    onFilesSelected={(files) => setFormData({ ...formData, files: [...formData.files, ...files] })}
                                    files={formData.files}
                                    onRemove={(index) => {
                                        const newFiles = [...formData.files];
                                        newFiles.splice(index, 1);
                                        setFormData({ ...formData, files: newFiles });
                                    }}
                                    maxFiles={10}
                                    multiple
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 4: Output */}
                    {currentStep === 3 && (
                        <div className="relative z-10 space-y-10">
                            <div className="space-y-1">
                                <h2 className="text-2xl font-black text-gray-900 tracking-tight">Review Submission</h2>
                                <p className="text-gray-500 text-sm font-medium">Double check your details before sending them to the kiln.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="p-8 bg-gray-50/50 rounded-[32px] border border-gray-100">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Category</p>
                                    <p className="text-gray-900 font-black text-xl tracking-tight">{categories.find(c => c.id === formData.category)?.name}</p>
                                </div>
                                <div className="p-8 bg-gray-50/50 rounded-[32px] border border-gray-100">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Priority</p>
                                    <p className="text-blue-600 font-black text-xl tracking-tight uppercase">{formData.priority}</p>
                                </div>
                                <div className="md:col-span-2 p-8 bg-gray-50/50 rounded-[32px] border border-gray-100">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Title</p>
                                    <p className="text-gray-900 font-black text-2xl tracking-tight leading-tight">{formData.title}</p>
                                </div>
                                <div className="md:col-span-2 p-8 bg-gray-50/50 rounded-[32px] border border-gray-100">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Brief Summary</p>
                                    <p className="text-gray-600 text-base font-medium leading-relaxed">{formData.description}</p>
                                </div>
                                <div className="p-8 bg-gray-50/50 rounded-[32px] border border-gray-100">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Assets</p>
                                    <p className="text-gray-900 font-black text-xl tracking-tight">{formData.files.length} Files Attached</p>
                                </div>
                                <div className="p-8 bg-gray-50/50 rounded-[32px] border border-gray-100">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Target Date</p>
                                    <p className="text-gray-900 font-black text-xl tracking-tight">{formData.deadline ? new Date(formData.deadline).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Flexible'}</p>
                                </div>
                            </div>
                        </div>
                    )}

                </div>

                {/* Footer Navigation */}
                <div className="flex items-center justify-between gap-6 pt-4">
                    <button
                        onClick={handleBack}
                        disabled={currentStep === 0}
                        className="px-8 py-4 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-2xl transition-all flex items-center gap-2 disabled:opacity-0 disabled:pointer-events-none"
                    >
                        <ChevronLeftIcon className="w-5 h-5" />
                        Back
                    </button>
                    <div className="flex items-center gap-6">
                        <span className="text-[10px] font-black text-blue-600/30 uppercase tracking-[0.2em] hidden sm:block">Draft auto-saved</span>
                        {currentStep < steps.length - 1 ? (
                            <button
                                onClick={handleNext}
                                className="group px-10 py-5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-black uppercase tracking-widest rounded-[24px] shadow-xl shadow-blue-600/20 transition-all flex items-center gap-3 hover:-translate-y-1"
                            >
                                Next Step
                                <ChevronRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={isLoading}
                                className="group px-10 py-5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-black uppercase tracking-widest rounded-[24px] shadow-xl shadow-blue-600/20 transition-all flex items-center gap-3 hover:-translate-y-1 disabled:opacity-50"
                            >
                                {isLoading ? 'Sending to Kiln...' : 'Launch Request'}
                                <ChevronRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Information Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex gap-6 p-8 rounded-[32px] bg-blue-600 text-white shadow-xl shadow-blue-600/10">
                        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center shrink-0">
                            <SparklesIcon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h4 className="text-lg font-black tracking-tight mb-2">Need advice?</h4>
                            <p className="text-xs text-blue-100 leading-relaxed font-medium">
                                If your request involves complex logic or multiple deliverables, select "Web Development" and we'll schedule a kick-off call.
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-6 p-8 rounded-[32px] bg-white border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
                        <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center shrink-0">
                            <ClockIcon className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h4 className="text-lg font-black text-gray-900 tracking-tight mb-2">Turnaround</h4>
                            <p className="text-xs text-gray-400 leading-relaxed font-medium">
                                Most assets are delivered within 48 hours. Urgent requests move to the front of the queue automatically.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout >
    );
};

export default CreateRequest;
