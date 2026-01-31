import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, CloudArrowUpIcon } from '@heroicons/react/24/outline';
import DashboardLayout from '../../components/layout/DashboardLayout';
import FileUploader from '../../components/shared/FileUploader';
import designerAPI from '../../api/designer';
import showToast from '../../components/shared/Toast';

const UploadDesign = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [files, setFiles] = useState([]);
    const [versionNotes, setVersionNotes] = useState('');
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const handleFilesSelected = (newFiles) => {
        setFiles([...files, ...newFiles]);
    };

    const handleRemoveFile = (index) => {
        const newFiles = [...files];
        newFiles.splice(index, 1);
        setFiles(newFiles);
    };

    const handleSubmit = async () => {
        if (files.length === 0) {
            showToast.error('Please upload at least one file');
            return;
        }

        if (!versionNotes.trim()) {
            showToast.error('Please add version notes');
            return;
        }

        try {
            setUploading(true);
            const formData = new FormData();
            files.forEach((file) => {
                formData.append('files', file);
            });
            formData.append('notes', versionNotes);

            await designerAPI.uploadDesign(id, formData, {
                onUploadProgress: (progressEvent) => {
                    const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(progress);
                },
            });

            showToast.success('Design uploaded successfully!');
            navigate('/designer/workspace');
        } catch (error) {
            console.error('Upload failed:', error);
            showToast.error('Failed to upload design');
        } finally {
            setUploading(false);
            setUploadProgress(0);
        }
    };

    const handleSaveDraft = async () => {
        try {
            // Save as draft logic
            showToast.success('Draft saved');
        } catch (error) {
            showToast.error('Failed to save draft');
        }
    };

    return (
        <DashboardLayout breadcrumbs={['Designer', 'Upload Design']}>
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate('/designer/workspace')}
                        className="flex items-center gap-2 text-gray-400 hover:text-white mb-4"
                    >
                        <ArrowLeftIcon className="w-5 h-5" />
                        Back to Workspace
                    </button>
                    <h1 className="text-3xl font-bold text-white mb-2">Upload Design Files</h1>
                    <p className="text-gray-400">Upload your completed design files for review</p>
                </div>

                {/* Upload Area */}
                <div className="bg-[#151B2E] rounded-lg p-8 border border-[#1E2638] mb-6">
                    <h2 className="text-xl font-bold text-white mb-6">Design Files</h2>

                    <FileUploader
                        onFilesSelected={handleFilesSelected}
                        files={files}
                        onRemove={handleRemoveFile}
                        maxFiles={20}
                        maxSize={52428800} // 50MB
                        accept={{
                            'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.svg'],
                            'application/pdf': ['.pdf'],
                            'application/zip': ['.zip'],
                            'video/*': ['.mp4', '.mov'],
                        }}
                        multiple
                    />

                    {uploading && (
                        <div className="mt-6">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-white">Uploading...</span>
                                <span className="text-sm text-blue-500">{uploadProgress}%</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2">
                                <div
                                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${uploadProgress}%` }}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Version Notes */}
                <div className="bg-[#151B2E] rounded-lg p-8 border border-[#1E2638] mb-6">
                    <h2 className="text-xl font-bold text-white mb-4">Version Notes</h2>
                    <textarea
                        value={versionNotes}
                        onChange={(e) => setVersionNotes(e.target.value)}
                        placeholder="Describe the changes, design decisions, or any notes for the reviewer..."
                        className="w-full px-4 py-3 bg-[#0A0E1A] border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none resize-none"
                        rows={6}
                    />
                    <p className="text-sm text-gray-400 mt-2">
                        Be specific about what you've completed and any areas that need special attention.
                    </p>
                </div>

                {/* Preview Section */}
                {files.length > 0 && (
                    <div className="bg-[#151B2E] rounded-lg p-8 border border-[#1E2638] mb-6">
                        <h2 className="text-xl font-bold text-white mb-4">File Preview</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {files.slice(0, 8).map((file, index) => (
                                <div key={index} className="aspect-square bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg flex items-center justify-center">
                                    {file.type.startsWith('image/') ? (
                                        <img
                                            src={URL.createObjectURL(file)}
                                            alt={file.name}
                                            className="w-full h-full object-cover rounded-lg"
                                        />
                                    ) : (
                                        <div className="text-center">
                                            <CloudArrowUpIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                            <p className="text-xs text-gray-400 truncate px-2">{file.name}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                        {files.length > 8 && (
                            <p className="text-sm text-gray-400 mt-4">
                                +{files.length - 8} more files
                            </p>
                        )}
                    </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between">
                    <button
                        onClick={handleSaveDraft}
                        disabled={uploading}
                        className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium disabled:opacity-50"
                    >
                        Save as Draft
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={uploading || files.length === 0}
                        className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50 flex items-center gap-2"
                    >
                        <CloudArrowUpIcon className="w-5 h-5" />
                        {uploading ? 'Uploading...' : 'Submit for Review'}
                    </button>
                </div>

                {/* Guidelines */}
                <div className="mt-8 grid grid-cols-2 gap-4">
                    <div className="p-4 bg-[#151B2E] rounded-lg border border-[#1E2638]">
                        <h3 className="text-white font-medium mb-2">📋 File Guidelines</h3>
                        <ul className="text-sm text-gray-400 space-y-1">
                            <li>• Max 50MB per file</li>
                            <li>• Accepted: PNG, JPG, PDF, ZIP, MP4</li>
                            <li>• Include source files when possible</li>
                        </ul>
                    </div>
                    <div className="p-4 bg-[#151B2E] rounded-lg border border-[#1E2638]">
                        <h3 className="text-white font-medium mb-2">✅ Best Practices</h3>
                        <ul className="text-sm text-gray-400 space-y-1">
                            <li>• Use descriptive file names</li>
                            <li>• Include multiple formats</li>
                            <li>• Add detailed version notes</li>
                        </ul>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default UploadDesign;
