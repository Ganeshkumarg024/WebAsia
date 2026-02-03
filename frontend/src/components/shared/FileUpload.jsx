import { useState, useRef } from 'react';
import { CloudArrowUpIcon, XMarkIcon, PhotoIcon } from '@heroicons/react/24/outline';

const FileUpload = ({
    onFileSelect,
    accept = 'image/*',
    maxSize = 5 * 1024 * 1024, // 5MB default
    preview = true,
    currentImage = null,
    label = 'Upload File',
    className = '',
}) => {
    const [dragActive, setDragActive] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(currentImage);
    const [error, setError] = useState('');
    const inputRef = useRef(null);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const validateFile = (file) => {
        if (file.size > maxSize) {
            setError(`File size must be less than ${maxSize / 1024 / 1024}MB`);
            return false;
        }
        setError('');
        return true;
    };

    const handleFile = (file) => {
        if (!validateFile(file)) return;

        if (preview && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result);
            };
            reader.readAsDataURL(file);
        }

        onFileSelect(file);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleRemove = () => {
        setPreviewUrl(null);
        setError('');
        if (inputRef.current) {
            inputRef.current.value = '';
        }
        onFileSelect(null);
    };

    return (
        <div className={className}>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                {label}
            </label>

            {previewUrl ? (
                <div className="relative group">
                    <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-2xl border-2 border-gray-200"
                    />
                    <button
                        onClick={handleRemove}
                        className="absolute top-3 right-3 p-2 bg-red-600 text-white rounded-xl opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                    >
                        <XMarkIcon className="w-4 h-4" />
                    </button>
                </div>
            ) : (
                <div
                    className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${dragActive
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-blue-50/50'
                        }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => inputRef.current?.click()}
                >
                    <input
                        ref={inputRef}
                        type="file"
                        accept={accept}
                        onChange={handleChange}
                        className="hidden"
                    />
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center">
                            {accept.startsWith('image/') ? (
                                <PhotoIcon className="w-8 h-8 text-blue-600" />
                            ) : (
                                <CloudArrowUpIcon className="w-8 h-8 text-blue-600" />
                            )}
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-900 mb-1">
                                Drop your file here, or <span className="text-blue-600">browse</span>
                            </p>
                            <p className="text-xs text-gray-500 font-medium">
                                Max size: {maxSize / 1024 / 1024}MB
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {error && (
                <p className="mt-2 text-xs font-bold text-red-600">{error}</p>
            )}
        </div>
    );
};

export default FileUpload;
