import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeftIcon,
    CloudArrowUpIcon,
    XMarkIcon,
    DocumentIcon,
    PaperAirplaneIcon
} from '@heroicons/react/24/outline';
import useDesignerStore from '../../store/designerStore';
import DashboardLayout from '../../components/layout/DashboardLayout';

const UploadDesign = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { uploadDesignFiles, submitForReview, isLoading } = useDesignerStore();

    const [files, setFiles] = useState([]);
    const [notes, setNotes] = useState('');
    const [isDragging, setIsDragging] = useState(false);

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);

        const droppedFiles = Array.from(e.dataTransfer.files);
        setFiles(prev => [...prev, ...droppedFiles]);
    };

    const handleFileSelect = (e) => {
        const selectedFiles = Array.from(e.target.files);
        setFiles(prev => [...prev, ...selectedFiles]);
    };

    const removeFile = (index) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleUploadAndSubmit = async () => {
        if (files.length === 0) {
            alert('Please select at least one file to upload');
            return;
        }

        // Upload files
        const uploadResult = await uploadDesignFiles(id, files);

        if (uploadResult.success) {
            // Submit for review
            const submitResult = await submitForReview(id, notes);

            if (submitResult.success) {
                navigate(`/designer/tasks/${id}`);
            }
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    };

    return (
        <DashboardLayout breadcrumbs={['Designer', 'Tasks', 'Upload Design']}>
            <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-700">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(`/designer/tasks/${id}`)}
                        className="p-3 bg-white border border-gray-100 rounded-2xl hover:bg-gray-50 transition-all"
                    >
                        <ArrowLeftIcon className="w-5 h-5 text-gray-900" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black text-gray-900">Upload Design</h1>
                        <p className="text-gray-500 font-medium mt-1">Upload your design files and submit for review</p>
                    </div>
                </div>

                {/* Upload Area */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] p-8">
                    <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`border-2 border-dashed rounded-3xl p-12 text-center transition-all ${isDragging
                                ? 'border-blue-600 bg-blue-50'
                                : 'border-gray-200 hover:border-blue-400 hover:bg-gray-50'
                            }`}
                    >
                        <CloudArrowUpIcon className={`w-16 h-16 mx-auto mb-4 ${isDragging ? 'text-blue-600' : 'text-gray-400'}`} />
                        <h3 className="text-xl font-black text-gray-900 mb-2">
                            {isDragging ? 'Drop files here' : 'Drag and drop files'}
                        </h3>
                        <p className="text-gray-500 mb-4">or</p>
                        <label className="inline-block px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all cursor-pointer shadow-lg shadow-blue-600/20">
                            <span>Browse Files</span>
                            <input
                                type="file"
                                multiple
                                onChange={handleFileSelect}
                                className="hidden"
                                accept="image/*,video/*,.pdf,.ai,.psd,.fig"
                            />
                        </label>
                        <p className="text-sm text-gray-400 mt-4">
                            Supports: Images, Videos, PDF, AI, PSD, Figma files
                        </p>
                    </div>

                    {/* File List */}
                    {files.length > 0 && (
                        <div className="mt-6 space-y-3">
                            <h3 className="text-lg font-black text-gray-900">Selected Files ({files.length})</h3>
                            {files.map((file, index) => (
                                <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                    <DocumentIcon className="w-10 h-10 text-blue-600 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-gray-900 truncate">{file.name}</p>
                                        <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                                    </div>
                                    <button
                                        onClick={() => removeFile(index)}
                                        className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-red-50 hover:border-red-200 transition-all"
                                    >
                                        <XMarkIcon className="w-5 h-5 text-gray-600 hover:text-red-600" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Notes */}
                    <div className="mt-6">
                        <label className="block text-sm font-bold text-gray-900 mb-2">
                            Version Notes (Optional)
                        </label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Add any notes about this version..."
                            rows={4}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        />
                    </div>

                    {/* Actions */}
                    <div className="mt-6 flex items-center gap-3">
                        <button
                            onClick={() => navigate(`/designer/tasks/${id}`)}
                            className="flex-1 px-6 py-3 bg-white border border-gray-100 rounded-2xl text-gray-900 font-bold hover:bg-gray-50 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleUploadAndSubmit}
                            disabled={files.length === 0 || isLoading}
                            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>Uploading...</span>
                                </>
                            ) : (
                                <>
                                    <PaperAirplaneIcon className="w-5 h-5" />
                                    <span>Upload & Submit for Review</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default UploadDesign;
