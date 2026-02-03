import { useState } from 'react';
import {
    DocumentIcon,
    ArrowDownTrayIcon,
    TrashIcon,
    PhotoIcon,
    DocumentTextIcon,
    ArchiveBoxIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import ConfirmDialog from './ConfirmDialog';
import showToast from './Toast';

// Safe date formatter helper function
const safeFormatDate = (dateString, formatString) => {
    if (!dateString) return 'N/A';
    try {
        return format(new Date(dateString), formatString);
    } catch (error) {
        console.error('Date formatting error:', error);
        return 'Invalid Date';
    }
};

const FileList = ({
    files = [],
    onDownload,
    onDelete,
    showUploader = true,
    groupByRole = false,
    currentUserRole = 'client'
}) => {
    const [deleteFileId, setDeleteFileId] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    };

    const getFileIcon = (mimeType) => {
        if (mimeType.startsWith('image/')) {
            return <PhotoIcon className="w-6 h-6 text-blue-600" />;
        } else if (mimeType.includes('pdf')) {
            return <DocumentTextIcon className="w-6 h-6 text-red-600" />;
        } else if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('7z')) {
            return <ArchiveBoxIcon className="w-6 h-6 text-purple-600" />;
        } else {
            return <DocumentIcon className="w-6 h-6 text-gray-600" />;
        }
    };

    const getRoleBadgeColor = (role) => {
        switch (role) {
            case 'client':
                return 'bg-blue-100 text-blue-700';
            case 'designer':
                return 'bg-green-100 text-green-700';
            case 'admin':
                return 'bg-purple-100 text-purple-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    const handleDelete = async () => {
        if (!deleteFileId) return;

        setDeleting(true);
        try {
            await onDelete(deleteFileId);
            showToast.success('File deleted successfully');
            setDeleteFileId(null);
        } catch (error) {
            showToast.error('Failed to delete file');
        } finally {
            setDeleting(false);
        }
    };

    const canDeleteFile = (file) => {
        // User can delete their own files or admin can delete any file
        return file.uploadedBy === currentUserRole || currentUserRole === 'admin';
    };

    const renderFileList = (fileList, title) => {
        if (fileList.length === 0) return null;

        return (
            <div className="space-y-3">
                {title && (
                    <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest">
                        {title}
                    </h4>
                )}
                <div className="space-y-2">
                    {fileList.map((file) => (
                        <div
                            key={file.id}
                            className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-sm transition-all"
                        >
                            {/* File Icon */}
                            <div className="w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
                                {getFileIcon(file.mimeType)}
                            </div>

                            {/* File Info */}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900 truncate">
                                    {file.originalName}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs text-gray-500">
                                        {formatFileSize(file.fileSize)}
                                    </span>
                                    <span className="text-gray-300">•</span>
                                    <span className="text-xs text-gray-500">
                                        {safeFormatDate(file.created_at, 'MMM dd, yyyy')}
                                    </span>
                                    {showUploader && file.uploader && (
                                        <>
                                            <span className="text-gray-300">•</span>
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${getRoleBadgeColor(file.uploadedByRole)}`}>
                                                {file.uploader.firstName} {file.uploader.lastName}
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 shrink-0">
                                <button
                                    onClick={() => onDownload(file.id, file.originalName)}
                                    className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
                                    title="Download"
                                >
                                    <ArrowDownTrayIcon className="w-5 h-5" />
                                </button>
                                {canDeleteFile(file) && (
                                    <button
                                        onClick={() => setDeleteFileId(file.id)}
                                        className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                                        title="Delete"
                                    >
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    if (files.length === 0) {
        return (
            <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                <DocumentIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm font-semibold text-gray-500">No files uploaded yet</p>
            </div>
        );
    }

    if (groupByRole) {
        const clientFiles = files.filter(f => f.uploadedByRole === 'client');
        const designerFiles = files.filter(f => f.uploadedByRole === 'designer');
        const adminFiles = files.filter(f => f.uploadedByRole === 'admin');

        return (
            <div className="space-y-6">
                {renderFileList(clientFiles, 'Client Files')}
                {renderFileList(designerFiles, 'Designer Files')}
                {renderFileList(adminFiles, 'Admin Files')}

                {/* Delete Confirmation Dialog */}
                <ConfirmDialog
                    isOpen={!!deleteFileId}
                    onClose={() => setDeleteFileId(null)}
                    onConfirm={handleDelete}
                    title="Delete File"
                    message="Are you sure you want to delete this file? This action cannot be undone."
                    confirmText="Delete"
                    variant="danger"
                    loading={deleting}
                />
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {renderFileList(files)}

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                isOpen={!!deleteFileId}
                onClose={() => setDeleteFileId(null)}
                onConfirm={handleDelete}
                title="Delete File"
                message="Are you sure you want to delete this file? This action cannot be undone."
                confirmText="Delete"
                variant="danger"
                loading={deleting}
            />
        </div>
    );
};

export default FileList;
