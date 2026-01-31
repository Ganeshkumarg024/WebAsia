import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import PropTypes from 'prop-types';
import { CloudArrowUpIcon, XMarkIcon, DocumentIcon } from '@heroicons/react/24/outline';

const FileUploader = ({
    onFilesSelected,
    maxFiles = 10,
    maxSize = 10485760, // 10MB
    accept = {},
    multiple = true,
    files = [],
    onRemove,
}) => {
    const onDrop = useCallback((acceptedFiles) => {
        onFilesSelected(acceptedFiles);
    }, [onFilesSelected]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        maxFiles,
        maxSize,
        accept,
        multiple,
    });

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    return (
        <div className="space-y-4">
            <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${isDragActive
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-gray-600 hover:border-gray-500 bg-[#151B2E]'
                    }`}
            >
                <input {...getInputProps()} />
                <CloudArrowUpIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                {isDragActive ? (
                    <p className="text-blue-500 font-medium">Drop the files here...</p>
                ) : (
                    <div>
                        <p className="text-white font-medium mb-2">
                            Drag & drop files here, or click to select
                        </p>
                        <p className="text-sm text-gray-400">
                            Maximum {maxFiles} files, up to {formatFileSize(maxSize)} each
                        </p>
                    </div>
                )}
            </div>

            {files.length > 0 && (
                <div className="space-y-2">
                    <h4 className="text-sm font-medium text-white">Selected Files ({files.length})</h4>
                    <div className="space-y-2">
                        {files.map((file, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between bg-[#151B2E] border border-[#1E2638] rounded-lg p-3"
                            >
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <DocumentIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-white truncate">{file.name}</p>
                                        <p className="text-xs text-gray-400">{formatFileSize(file.size)}</p>
                                    </div>
                                </div>
                                {onRemove && (
                                    <button
                                        onClick={() => onRemove(index)}
                                        className="p-1 hover:bg-red-500/10 rounded transition-colors"
                                    >
                                        <XMarkIcon className="w-5 h-5 text-red-500" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

FileUploader.propTypes = {
    onFilesSelected: PropTypes.func.isRequired,
    maxFiles: PropTypes.number,
    maxSize: PropTypes.number,
    accept: PropTypes.object,
    multiple: PropTypes.bool,
    files: PropTypes.array,
    onRemove: PropTypes.func,
};

export default FileUploader;
