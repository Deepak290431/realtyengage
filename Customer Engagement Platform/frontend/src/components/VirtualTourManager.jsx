import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import {
    Upload, Trash2, Edit, Eye, EyeOff, Image, Video, Plus,
    Save, X, ArrowUp, ArrowDown, Info, Check, AlertTriangle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { virtualTourAPI } from '../services/api';

/**
 * VirtualTourManager Component
 * Admin panel for managing 360° images and videos
 * Admins & Super Admins: Upload, edit, delete, enable/disable
 */
const VirtualTourManager = ({ projectId, projectName, onUpdate }) => {
    const { user } = useSelector((state) => state.auth);
    const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [virtualTour, setVirtualTour] = useState(null);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [uploadType, setUploadType] = useState('360_image'); // '360_image' or '360_video'

    // Form states
    const [imageUrls, setImageUrls] = useState(['']);
    const [videoUrl, setVideoUrl] = useState('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [duration, setDuration] = useState(0);

    // Edit states
    const [editingItem, setEditingItem] = useState(null); // { id, type, title, description }
    const [editTitle, setEditTitle] = useState('');
    const [editDescription, setEditDescription] = useState('');

    useEffect(() => {
        fetchVirtualTour();
    }, [projectId]);

    const fetchVirtualTour = async () => {
        setLoading(true);
        try {
            const response = await virtualTourAPI.getVirtualTour(projectId);
            setVirtualTour(response.data.data.virtualTour);
        } catch (error) {
            console.error('Error fetching virtual tour:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleEnabled = async () => {
        try {
            const newState = !virtualTour.enabled;
            await virtualTourAPI.toggleVirtualTour(projectId, newState);
            setVirtualTour({ ...virtualTour, enabled: newState });
            toast.success(`Virtual tour ${newState ? 'enabled' : 'disabled'}`);
            onUpdate?.();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to toggle virtual tour');
        }
    };

    const handleUpload360Images = async () => {
        const validUrls = imageUrls.filter(url => url.trim());

        if (validUrls.length === 0) {
            toast.error('Please provide at least one image URL');
            return;
        }

        setSaving(true);
        try {
            const images = validUrls.map((url, index) => ({
                url: url.trim(),
                title: title || `360° View ${virtualTour?.images360?.length + index + 1 || index + 1}`,
                description: description || '',
                order: virtualTour?.images360?.length + index || index
            }));

            await virtualTourAPI.upload360Images(projectId, images);
            toast.success('360° images uploaded successfully');
            setShowUploadModal(false);
            resetForm();
            fetchVirtualTour();
            onUpdate?.();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to upload images');
        } finally {
            setSaving(false);
        }
    };

    const handleUpload360Video = async () => {
        if (!videoUrl.trim()) {
            toast.error('Please provide a video URL');
            return;
        }

        setSaving(true);
        try {
            await virtualTourAPI.upload360Video(projectId, {
                url: videoUrl.trim(),
                title: title || `${projectName} - 360° Virtual Tour`,
                description: description || '',
                duration: duration || 0
            });
            toast.success('360° video uploaded successfully');
            setShowUploadModal(false);
            resetForm();
            fetchVirtualTour();
            onUpdate?.();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to upload video');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete360Image = async (imageId) => {
        if (!isAdmin) {
            toast.error('Only Admins can delete virtual tour content');
            return;
        }

        if (!window.confirm('Are you sure you want to delete this 360° image?')) return;

        try {
            await virtualTourAPI.delete360Image(projectId, imageId);
            toast.success('360° image deleted');
            fetchVirtualTour();
            onUpdate?.();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete image');
        }
    };

    const handleDelete360Video = async () => {
        if (!isAdmin) {
            toast.error('Only Admins can delete virtual tour content');
            return;
        }

        if (!window.confirm('Are you sure you want to delete the 360° video?')) return;

        try {
            await virtualTourAPI.delete360Video(projectId);
            toast.success('360° video deleted');
            fetchVirtualTour();
            onUpdate?.();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete video');
        }
    };

    const handleEditItem = (item, type) => {
        setEditingItem({ id: item._id, type, ...item });
        setEditTitle(item.title || '');
        setEditDescription(item.description || '');
    };

    const handleUpdateMetadata = async () => {
        if (!editingItem) return;

        setSaving(true);
        try {
            if (editingItem.type === '360_image') {
                await virtualTourAPI.update360Image(projectId, editingItem.id, {
                    title: editTitle,
                    description: editDescription
                });
            } else {
                await virtualTourAPI.update360Video(projectId, {
                    title: editTitle,
                    description: editDescription
                });
            }
            toast.success('Content updated successfully');
            setEditingItem(null);
            fetchVirtualTour();
            onUpdate?.();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update content');
        } finally {
            setSaving(false);
        }
    };

    const addImageUrlField = () => {
        setImageUrls([...imageUrls, '']);
    };

    const removeImageUrlField = (index) => {
        setImageUrls(imageUrls.filter((_, i) => i !== index));
    };

    const updateImageUrl = (index, value) => {
        const newUrls = [...imageUrls];
        newUrls[index] = value;
        setImageUrls(newUrls);
    };

    const resetForm = () => {
        setImageUrls(['']);
        setVideoUrl('');
        setTitle('');
        setDescription('');
        setDuration(0);
    };

    if (loading) {
        return (
            <Card className="p-6">
                <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0B1F33]"></div>
                </div>
            </Card>
        );
    }

    const hasContent = virtualTour?.images360?.length > 0 || virtualTour?.video360?.url;

    return (
        <div className="space-y-6">
            {/* Header */}
            <Card className="p-6 border-none shadow-md">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-xl font-semibold flex items-center gap-2">
                            <Video className="h-5 w-5 text-[#0B1F33]" />
                            Virtual Tour Management
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                            Upload and manage 360° images or video for immersive property tours
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        {hasContent && (
                            <>
                                <Button
                                    onClick={handleToggleEnabled}
                                    className={`${virtualTour?.enabled
                                        ? 'bg-green-600 hover:bg-green-700'
                                        : 'bg-gray-400 hover:bg-gray-500'
                                        } text-white`}
                                >
                                    {virtualTour?.enabled ? (
                                        <>
                                            <Eye className="h-4 w-4 mr-2" />
                                            Enabled
                                        </>
                                    ) : (
                                        <>
                                            <EyeOff className="h-4 w-4 mr-2" />
                                            Disabled
                                        </>
                                    )}
                                </Button>
                                <Button
                                    onClick={() => setShowUploadModal(true)}
                                    className="bg-[#0B1F33] hover:opacity-90"
                                >
                                    <Upload className="h-4 w-4 mr-2" />
                                    Upload Content
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                {/* Status Info */}
                <div className="grid md:grid-cols-3 gap-4 mt-6">
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                        <div className="text-lg font-semibold mt-1">
                            {virtualTour?.enabled ? (
                                <Badge className="bg-green-100 text-green-700">Active</Badge>
                            ) : (
                                <Badge className="bg-gray-100 text-gray-700">Inactive</Badge>
                            )}
                        </div>
                    </div>
                    <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Type</p>
                        <p className="text-lg font-semibold mt-1 capitalize">
                            {virtualTour?.type === '360_image' ? '360° Images' :
                                virtualTour?.type === '360_video' ? '360° Video' : 'None'}
                        </p>
                    </div>
                    <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Unique Tour Views</p>
                        <p className="text-lg font-semibold mt-1">{virtualTour?.viewCount || 0}</p>
                    </div>
                </div>

                {/* Unique Viewers List (Admin only) */}
                {isAdmin && virtualTour?.uniqueViewers?.length > 0 && (
                    <div className="mt-8 border-t pt-6">
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                            <Info className="h-4 w-4" />
                            Recent Unique Viewers (Emails)
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {virtualTour.uniqueViewers.map((email, idx) => (
                                <Badge key={idx} variant="outline" className="bg-white dark:bg-gray-800 text-xs py-1">
                                    {email}
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}
            </Card>

            {/* 360° Images Section */}
            {virtualTour?.images360?.length > 0 && (
                <Card className="p-6 border-none shadow-md">
                    <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Image className="h-5 w-5 text-[#0B1F33]" />
                        360° Images ({virtualTour.images360.length})
                    </h4>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {virtualTour.images360.map((img, index) => (
                            <div key={img._id || index} className="relative group">
                                <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                                    <img
                                        src={img.url}
                                        alt={img.title}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="mt-2">
                                    <p className="font-medium text-sm">{img.title}</p>
                                    {img.description && (
                                        <p className="text-xs text-gray-500 mt-1">{img.description}</p>
                                    )}
                                </div>
                                {isAdmin && (
                                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                        <Button
                                            onClick={() => handleEditItem(img, '360_image')}
                                            className="bg-blue-600 hover:bg-blue-700 text-white h-8 w-8 p-0 rounded-full"
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            onClick={() => handleDelete360Image(img._id)}
                                            className="bg-red-600 hover:bg-red-700 text-white h-8 w-8 p-0 rounded-full"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {/* 360° Video Section */}
            {virtualTour?.video360?.url && (
                <Card className="p-6 border-none shadow-md">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold flex items-center gap-2">
                            <Video className="h-5 w-5 text-[#0B1F33]" />
                            360° Video
                        </h4>
                        {isAdmin && (
                            <div className="flex gap-2">
                                <Button
                                    onClick={() => handleEditItem(virtualTour.video360, '360_video')}
                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit Details
                                </Button>
                                <Button
                                    onClick={handleDelete360Video}
                                    className="bg-red-600 hover:bg-red-700 text-white"
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete Video
                                </Button>
                            </div>
                        )}
                    </div>
                    <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                        <video
                            src={virtualTour.video360.url}
                            controls
                            className="w-full h-full"
                        />
                    </div>
                    <div className="mt-4">
                        <p className="font-medium">{virtualTour.video360.title}</p>
                        {virtualTour.video360.description && (
                            <p className="text-sm text-gray-500 mt-1">{virtualTour.video360.description}</p>
                        )}
                        {virtualTour.video360.duration > 0 && (
                            <p className="text-xs text-gray-400 mt-2">
                                Duration: {Math.floor(virtualTour.video360.duration / 60)}:{(virtualTour.video360.duration % 60).toString().padStart(2, '0')}
                            </p>
                        )}
                    </div>
                </Card>
            )}

            {/* No Content State */}
            {!hasContent && (
                <Card className="p-12 border-none shadow-md">
                    <div className="text-center">
                        <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Video className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">No Virtual Tour Content</h3>
                        <p className="text-gray-500 mb-6">
                            Upload 360° images or a 360° video to create an immersive virtual tour
                        </p>
                        <Button
                            onClick={() => setShowUploadModal(true)}
                            className="bg-[#0B1F33] hover:opacity-90"
                        >
                            <Upload className="h-4 w-4 mr-2" />
                            Upload Content
                        </Button>
                    </div>
                </Card>
            )}

            {/* Upload Modal */}
            {showUploadModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                    >
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-semibold">Upload Virtual Tour Content</h3>
                                <Button
                                    onClick={() => {
                                        setShowUploadModal(false);
                                        resetForm();
                                    }}
                                    className="h-8 w-8 p-0 rounded-full"
                                    variant="outline"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>

                            {/* Type Selection */}
                            <div className="mb-6">
                                <label className="text-sm font-medium mb-3 block">Content Type</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={() => setUploadType('360_image')}
                                        className={`p-4 border-2 rounded-lg transition-all ${uploadType === '360_image'
                                            ? 'border-[#0B1F33] bg-[#0B1F33]/5'
                                            : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <Image className="h-6 w-6 mx-auto mb-2" />
                                        <p className="font-medium">360° Images</p>
                                        <p className="text-xs text-gray-500 mt-1">Upload multiple images</p>
                                    </button>
                                    <button
                                        onClick={() => setUploadType('360_video')}
                                        className={`p-4 border-2 rounded-lg transition-all ${uploadType === '360_video'
                                            ? 'border-[#0B1F33] bg-[#0B1F33]/5'
                                            : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <Video className="h-6 w-6 mx-auto mb-2" />
                                        <p className="font-medium">360° Video</p>
                                        <p className="text-xs text-gray-500 mt-1">Upload single video</p>
                                    </button>
                                </div>
                            </div>

                            {/* Image Upload Form */}
                            {uploadType === '360_image' && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium mb-2 block">Image URLs</label>
                                        {imageUrls.map((url, index) => (
                                            <div key={index} className="flex gap-2 mb-2">
                                                <Input
                                                    value={url}
                                                    onChange={(e) => updateImageUrl(index, e.target.value)}
                                                    placeholder="https://example.com/360-image.jpg"
                                                    className="flex-1"
                                                />
                                                {imageUrls.length > 1 && (
                                                    <Button
                                                        onClick={() => removeImageUrlField(index)}
                                                        variant="outline"
                                                        className="h-10 w-10 p-0"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        ))}
                                        <Button
                                            onClick={addImageUrlField}
                                            variant="outline"
                                            className="w-full mt-2"
                                        >
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add Another Image
                                        </Button>
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium mb-2 block">Title (Optional)</label>
                                        <Input
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            placeholder="e.g., Living Room View"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium mb-2 block">Description (Optional)</label>
                                        <Input
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            placeholder="Brief description of the view"
                                        />
                                    </div>

                                    <Button
                                        onClick={handleUpload360Images}
                                        disabled={saving}
                                        className="w-full bg-[#0B1F33] hover:opacity-90"
                                    >
                                        {saving ? 'Uploading...' : 'Upload Images'}
                                    </Button>
                                </div>
                            )}

                            {/* Video Upload Form */}
                            {uploadType === '360_video' && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium mb-2 block">Video URL</label>
                                        <Input
                                            value={videoUrl}
                                            onChange={(e) => setVideoUrl(e.target.value)}
                                            placeholder="https://example.com/360-video.mp4"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium mb-2 block">Title (Optional)</label>
                                        <Input
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            placeholder={`${projectName} - 360° Virtual Tour`}
                                        />
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium mb-2 block">Description (Optional)</label>
                                        <Input
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            placeholder="Brief description of the virtual tour"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium mb-2 block">Duration (seconds, optional)</label>
                                        <Input
                                            type="number"
                                            value={duration}
                                            onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
                                            placeholder="120"
                                        />
                                    </div>

                                    <Button
                                        onClick={handleUpload360Video}
                                        disabled={saving}
                                        className="w-full bg-[#0B1F33] hover:opacity-90"
                                    >
                                        {saving ? 'Uploading...' : 'Upload Video'}
                                    </Button>
                                </div>
                            )}

                            {/* Info Box */}
                            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                <p className="text-sm text-blue-800 dark:text-blue-300 flex items-start gap-2">
                                    <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                    <span>
                                        {uploadType === '360_image'
                                            ? 'Upload equirectangular 360° images (2:1 aspect ratio recommended). Users will be able to pan and zoom through the images.'
                                            : 'Upload an equirectangular 360° video. Only one video can be active at a time.'}
                                    </span>
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Edit Metadata Modal */}
            {editingItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full"
                    >
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-semibold">Edit Content Details</h3>
                                <Button
                                    onClick={() => setEditingItem(null)}
                                    className="h-8 w-8 p-0 rounded-full"
                                    variant="outline"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium mb-2 block">Title</label>
                                    <Input
                                        value={editTitle}
                                        onChange={(e) => setEditTitle(e.target.value)}
                                        placeholder="Enter title"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium mb-2 block">Description</label>
                                    <Input
                                        value={editDescription}
                                        onChange={(e) => setEditDescription(e.target.value)}
                                        placeholder="Enter description"
                                    />
                                </div>

                                <Button
                                    onClick={handleUpdateMetadata}
                                    disabled={saving}
                                    className="w-full bg-[#0B1F33] hover:opacity-90 mt-4"
                                >
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default VirtualTourManager;
