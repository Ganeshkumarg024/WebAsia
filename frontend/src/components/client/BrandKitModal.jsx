import { useState, useEffect } from 'react';
import { XMarkIcon, PhotoIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import Modal from '../shared/Modal';
import FileUpload from '../shared/FileUpload';
import showToast from '../shared/Toast';
import brandKitAPI from '../../api/brandKit';

const BrandKitModal = ({ isOpen, onClose, brandKit, onUpdate }) => {
    const [formData, setFormData] = useState({
        primaryColor: '#2563EB',
        secondaryColor: '#10B981',
        accentColor: '#1E293B',
        colors: ['#2563EB', '#10B981', '#1E293B']
    });
    const [logoFile, setLogoFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (brandKit) {
            setFormData({
                primaryColor: brandKit.primaryColor || '#2563EB',
                secondaryColor: brandKit.secondaryColor || '#10B981',
                accentColor: brandKit.accentColor || '#1E293B',
                colors: brandKit.colors || ['#2563EB', '#10B981', '#1E293B']
            });
        }
    }, [brandKit]);

    const handleColorChange = (index, value) => {
        const newColors = [...formData.colors];
        newColors[index] = value;
        setFormData({ ...formData, colors: newColors });
    };

    const handleAddColor = () => {
        if (formData.colors.length < 5) {
            setFormData({ ...formData, colors: [...formData.colors, '#000000'] });
        }
    };

    const handleRemoveColor = (index) => {
        if (formData.colors.length > 1) {
            const newColors = formData.colors.filter((_, i) => i !== index);
            setFormData({ ...formData, colors: newColors });
        }
    };

    const handleLogoUpload = async (file) => {
        setLogoFile(file);
        setUploading(true);

        try {
            const result = await brandKitAPI.uploadLogo(file);
            if (result.success) {
                showToast.success('Logo uploaded successfully');
                onUpdate(result.data);
            } else {
                showToast.error(result.error?.message || 'Failed to upload logo');
            }
        } catch (error) {
            showToast.error('Failed to upload logo');
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);

        try {
            const result = await brandKitAPI.updateBrandKit(formData);
            if (result.success) {
                showToast.success('Brand kit updated successfully');
                onUpdate(result.data);
                onClose();
            } else {
                showToast.error(result.error?.message || 'Failed to update brand kit');
            }
        } catch (error) {
            showToast.error('Failed to update brand kit');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Edit Brand Kit" size="lg">
            <div className="space-y-6">
                {/* Logo Upload */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">
                        Brand Logo
                    </label>
                    <div className="flex items-center gap-6">
                        {brandKit?.logoUrl && !logoFile && (
                            <div className="w-24 h-24 rounded-2xl bg-gray-100 border-2 border-gray-200 flex items-center justify-center overflow-hidden shrink-0">
                                <img
                                    src={brandKit.logoUrl.startsWith('http') ? brandKit.logoUrl : `${import.meta.env.VITE_API_URL}${brandKit.logoUrl}`}
                                    alt="Brand Logo"
                                    className="w-full h-full object-contain"
                                />
                            </div>
                        )}
                        <div className="flex-1">
                            <FileUpload
                                onFileSelect={handleLogoUpload}
                                accept="image/*"
                                maxSize={5 * 1024 * 1024}
                                preview={false}
                                label={uploading ? 'Uploading...' : 'Upload Logo'}
                                className="w-full"
                            />
                            <p className="text-xs text-gray-400 mt-2">PNG, JPG, SVG. Max size 5MB.</p>
                        </div>
                    </div>
                </div>

                {/* Primary Colors */}
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                            Primary Color
                        </label>
                        <div className="flex items-center gap-2">
                            <input
                                type="color"
                                value={formData.primaryColor}
                                onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                                className="w-12 h-12 rounded-xl border-2 border-gray-200 cursor-pointer"
                            />
                            <input
                                type="text"
                                value={formData.primaryColor}
                                onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                                className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono uppercase"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                            Secondary Color
                        </label>
                        <div className="flex items-center gap-2">
                            <input
                                type="color"
                                value={formData.secondaryColor}
                                onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                                className="w-12 h-12 rounded-xl border-2 border-gray-200 cursor-pointer"
                            />
                            <input
                                type="text"
                                value={formData.secondaryColor}
                                onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                                className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono uppercase"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                            Accent Color
                        </label>
                        <div className="flex items-center gap-2">
                            <input
                                type="color"
                                value={formData.accentColor}
                                onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                                className="w-12 h-12 rounded-xl border-2 border-gray-200 cursor-pointer"
                            />
                            <input
                                type="text"
                                value={formData.accentColor}
                                onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                                className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono uppercase"
                            />
                        </div>
                    </div>
                </div>

                {/* Color Palette */}
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">
                            Color Palette
                        </label>
                        {formData.colors.length < 5 && (
                            <button
                                onClick={handleAddColor}
                                className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700"
                            >
                                <PlusIcon className="w-4 h-4" />
                                Add Color
                            </button>
                        )}
                    </div>
                    <div className="grid grid-cols-5 gap-3">
                        {formData.colors.map((color, index) => (
                            <div key={index} className="relative group">
                                <input
                                    type="color"
                                    value={color}
                                    onChange={(e) => handleColorChange(index, e.target.value)}
                                    className="w-full h-16 rounded-xl border-2 border-gray-200 cursor-pointer"
                                />
                                <input
                                    type="text"
                                    value={color}
                                    onChange={(e) => handleColorChange(index, e.target.value)}
                                    className="w-full mt-1 px-2 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs font-mono uppercase text-center"
                                />
                                {formData.colors.length > 1 && (
                                    <button
                                        onClick={() => handleRemoveColor(index)}
                                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                                    >
                                        <TrashIcon className="w-3 h-3" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-black uppercase tracking-widest transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-black uppercase tracking-widest shadow-lg shadow-blue-600/20 transition-all disabled:opacity-50"
                    >
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default BrandKitModal;
