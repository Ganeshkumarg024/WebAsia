import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
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
        priority: 'medium',
        deadline: '',
        files: [],
    });

    const categories = [
        {
            id: 'graphic-design',
            name: 'Graphic Design',
            description: 'Logo, social media, print ads, and brand identity',
            image: '/assets/categories/graphic-design.jpg',
        },
        {
            id: 'video-production',
            name: 'Video Production',
            description: 'Short ads, motion graphics, and professional editing',
            image: '/assets/categories/video.jpg',
        },
        {
            id: 'web-development',
            name: 'Web Development',
            description: 'Landing pages, UI/UX design, and React components',
            image: '/assets/categories/web.jpg',
        },
    ];

    const steps = [
        { id: 1, name: 'CATEGORY', label: 'Category' },
        { id: 2, name: 'DETAILS', label: 'Details' },
        { id: 3, name: 'ASSETS', label: 'Assets' },
        { id: 4, name: 'OUTPUT', label: 'Output' },
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

        const result = await createRequest(formData);
        if (result.success) {
            showToast.success('Request created successfully!');
            navigate('/client/requests');
        } else {
            showToast.error(result.error || 'Failed to create request');
        }
    };

    return (
        <DashboardLayout breadcrumbs={['Requests', 'Create New']}>
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Submit New Creative Request</h1>
                    <p className="text-gray-400">
                        Tell us what you need and our experts will handle the rest.
                    </p>
                </div>

                {/* Progress Steps */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        {steps.map((step, index) => (
                            <div key={step.id} className="flex items-center flex-1">
                                <div className="flex flex-col items-center flex-1">
                                    <div
                                        className={`w-10 h-10 rounded-full flex items-center justify-center font-medium transition-colors ${index <= currentStep
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-gray-700 text-gray-400'
                                            }`}
                                    >
                                        {step.id}
                                    </div>
                                    <p
                                        className={`text-xs mt-2 font-medium ${index <= currentStep ? 'text-blue-500' : 'text-gray-400'
                                            }`}
                                    >
                                        {step.name}
                                    </p>
                                </div>
                                {index < steps.length - 1 && (
                                    <div
                                        className={`h-0.5 flex-1 mx-2 ${index < currentStep ? 'bg-blue-500' : 'bg-gray-700'
                                            }`}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Step Content */}
                <div className="bg-[#151B2E] rounded-lg p-8 border border-[#1E2638] mb-6">
                    {/* Step 1: Category */}
                    {currentStep === 0 && (
                        <div>
                            <h2 className="text-xl font-bold text-white mb-6">Select Service Category</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {categories.map((category) => (
                                    <button
                                        key={category.id}
                                        onClick={() => setFormData({ ...formData, category: category.id })}
                                        className={`p-6 rounded-lg border-2 transition-all text-left ${formData.category === category.id
                                            ? 'border-blue-500 bg-blue-500/10'
                                            : 'border-gray-700 hover:border-gray-600'
                                            }`}
                                    >
                                        <div className="w-full h-32 bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg mb-4"></div>
                                        <h3 className="text-lg font-bold text-white mb-2">{category.name}</h3>
                                        <p className="text-sm text-gray-400">{category.description}</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 2: Details */}
                    {currentStep === 1 && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold text-white mb-6">Request Details</h2>

                            <div>
                                <label className="block text-sm font-medium text-white mb-2">
                                    Project Title *
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-4 py-3 bg-[#0A0E1A] border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                                    placeholder="e.g., Logo Design for Tech Startup"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-white mb-2">
                                    Description *
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={6}
                                    className="w-full px-4 py-3 bg-[#0A0E1A] border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none resize-none"
                                    placeholder="Describe your project requirements in detail..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-white mb-2">
                                        Priority
                                    </label>
                                    <select
                                        value={formData.priority}
                                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                        className="w-full px-4 py-3 bg-[#0A0E1A] border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                        <option value="urgent">Urgent</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-white mb-2">
                                        Deadline (Optional)
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.deadline}
                                        onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                                        className="w-full px-4 py-3 bg-[#0A0E1A] border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Assets */}
                    {currentStep === 2 && (
                        <div>
                            <h2 className="text-xl font-bold text-white mb-6">Upload Reference Files</h2>
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
                    )}

                    {/* Step 4: Output */}
                    {currentStep === 3 && (
                        <div>
                            <h2 className="text-xl font-bold text-white mb-6">Review & Submit</h2>
                            <div className="space-y-4">
                                <div className="p-4 bg-[#0A0E1A] rounded-lg">
                                    <p className="text-sm text-gray-400 mb-1">Category</p>
                                    <p className="text-white font-medium">
                                        {categories.find(c => c.id === formData.category)?.name}
                                    </p>
                                </div>
                                <div className="p-4 bg-[#0A0E1A] rounded-lg">
                                    <p className="text-sm text-gray-400 mb-1">Title</p>
                                    <p className="text-white font-medium">{formData.title}</p>
                                </div>
                                <div className="p-4 bg-[#0A0E1A] rounded-lg">
                                    <p className="text-sm text-gray-400 mb-1">Description</p>
                                    <p className="text-white">{formData.description}</p>
                                </div>
                                <div className="p-4 bg-[#0A0E1A] rounded-lg">
                                    <p className="text-sm text-gray-400 mb-1">Files Attached</p>
                                    <p className="text-white font-medium">{formData.files.length} files</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between">
                    <button
                        onClick={handleBack}
                        disabled={currentStep === 0}
                        className="px-6 py-3 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        <ChevronLeftIcon className="w-5 h-5" />
                        Back
                    </button>

                    {currentStep < steps.length - 1 ? (
                        <button
                            onClick={handleNext}
                            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium flex items-center gap-2"
                        >
                            Next Step
                            <ChevronRightIcon className="w-5 h-5" />
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={isLoading}
                            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50"
                        >
                            {isLoading ? 'Submitting...' : 'Submit Request'}
                        </button>
                    )}
                </div>

                {/* Help Section */}
                <div className="mt-8 grid grid-cols-2 gap-4">
                    <div className="p-4 bg-[#151B2E] rounded-lg border border-[#1E2638]">
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-blue-500/10 rounded">
                                <span className="text-2xl">💡</span>
                            </div>
                            <div>
                                <h3 className="text-white font-medium mb-1">Need help choosing?</h3>
                                <p className="text-sm text-gray-400">
                                    If your request spans multiple categories, select the one that fits the majority of the work.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 bg-[#151B2E] rounded-lg border border-[#1E2638]">
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-blue-500/10 rounded">
                                <span className="text-2xl">⏱️</span>
                            </div>
                            <div>
                                <h3 className="text-white font-medium mb-1">Turnaround Time</h3>
                                <p className="text-sm text-gray-400">
                                    Standard requests are delivered within 48-72 hours. High-priority requests average 24 hours.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default CreateRequest;
