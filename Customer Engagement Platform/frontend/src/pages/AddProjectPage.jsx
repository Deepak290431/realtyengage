import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
    ArrowLeft,
    Save,
    X,
    Upload,
    Plus,
    Trash2,
    MapPin,
    Building2,
    Calendar,
    IndianRupee,
    FileText,
    Image,
    CheckCircle,
    Hash,
    QrCode
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import projectService from '../services/projectService';
import { normalizeImageUrl, handleImageError } from '../utils/imageUtils';

const AddProjectPage = () => {
    const { user } = useSelector((state) => state.auth);
    const isSuperAdmin = user?.role === 'super_admin';
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [configurations, setConfigurations] = useState([]);
    const [amenities, setAmenities] = useState([]);
    const [newAmenity, setNewAmenity] = useState('');
    const [images, setImages] = useState([]);
    const [imageUrlInput, setImageUrlInput] = useState('');
    const [specifications, setSpecifications] = useState([]);
    const [newSpec, setNewSpec] = useState({ label: '', value: '' });
    const [upiQRCode, setUpiQRCode] = useState('');

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset
    } = useForm({
        defaultValues: {
            status: 'upcoming',
            type: 'Apartment',
            commissionPercentage: 2,
            gstRate: 18,
            gstType: 'exclusive',
            latePenaltyType: 'fixed',
            latePenaltyValue: 0,
            gracePeriodDays: 0
        }
    });

    const onSubmit = async (data) => {
        try {
            setLoading(true);
            const payload = {
                ...data,
                shortDescription: data.description?.substring(0, 160),
                pricing: {
                    basePrice: Number(data.minPrice) * 100000,
                    range: `₹${data.minPrice}L - ₹${data.maxPrice}L`,
                    ...(isSuperAdmin && {
                        commissionPercentage: Number(data.commissionPercentage) || 2,
                        gstRate: Number(data.gstRate) || 18,
                        gstType: data.gstType || 'exclusive',
                        penaltyConfig: {
                            latePenaltyType: data.latePenaltyType || 'fixed',
                            latePenaltyValue: Number(data.latePenaltyValue) || 0,
                            gracePeriodDays: Number(data.gracePeriodDays) || 0
                        },
                    }),
                    upiQRCode: upiQRCode ? { url: upiQRCode } : undefined
                },
                location: {
                    address: data.location,
                    latitude: Number(data.latitude) || 12.9716,
                    longitude: Number(data.longitude) || 77.5946
                },
                specifications,
                configurations: configurations.map(c => ({
                    ...c,
                    price: c.price.toString().includes('L') ? c.price : `${c.price}L`
                })),
                amenities: amenities.map(name => ({ name })),
                status: data.status,
                // Mocking images as the backend current implementation expect objects
                images: images.length > 0 ? images.map((url, index) => ({
                    url,
                    isPrimary: index === 0
                })) : []
            };

            await projectService.createProject(payload);
            toast.success('Project created successfully!');
            navigate('/admin/projects');
        } catch (error) {
            console.error('Failed to create project:', error);
            toast.error('Failed to create project');
        } finally {
            setLoading(false);
        }
    };

    const handleAddConfiguration = () => {
        setConfigurations([
            ...configurations,
            { type: '', area: '', price: '', available: 10 }
        ]);
    };

    const handleRemoveConfiguration = (index) => {
        setConfigurations(configurations.filter((_, i) => i !== index));
    };

    const handleConfigChange = (index, field, value) => {
        const updated = [...configurations];
        let val = value;

        // Auto-append logic for numeric inputs
        if (field === 'type' || field === 'area' || field === 'price') {
            // Remove existing suffixes to process raw number
            const raw = value.replace(' BHK', '').replace(' sq.ft', '').replace(' Lac', '').replace(' Crore', '').trim();

            if (raw && /^[\d.]+$/.test(raw)) {
                const num = parseFloat(raw);
                if (field === 'price' && num >= 100) {
                    val = `${num / 100} Crore`;
                } else {
                    const suffix = field === 'type' ? ' BHK' : (field === 'area' ? ' sq.ft' : ' Lac');
                    val = `${raw}${suffix}`;
                }
            }
        }

        updated[index][field] = val;
        setConfigurations(updated);
    };

    const handleAddAmenity = (e) => {
        e.preventDefault();
        if (newAmenity.trim() && !amenities.includes(newAmenity.trim())) {
            setAmenities([...amenities, newAmenity.trim()]);
            setNewAmenity('');
        }
    };

    const handleRemoveAmenity = (amenity) => {
        setAmenities(amenities.filter(a => a !== amenity));
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        files.forEach(file => {
            if (file.size > 15 * 1024 * 1024) {
                toast.error(`${file.name} is too large (max 15MB)`);
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setImages(prev => [...prev, reader.result]);
            };
            reader.readAsDataURL(file);
        });
    };

    const handleAddImageUrl = () => {
        if (imageUrlInput.trim()) {
            setImages(prev => [...prev, imageUrlInput.trim()]);
            setImageUrlInput('');
            toast.success('Image link added!');
        }
    };

    const handleAddSpec = () => {
        if (newSpec.label.trim() && newSpec.value.trim()) {
            setSpecifications([...specifications, { ...newSpec }]);
            setNewSpec({ label: '', value: '' });
        }
    };

    const handleRemoveSpec = (index) => {
        setSpecifications(specifications.filter((_, i) => i !== index));
    };

    const handleQRChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 1024 * 1024) {
                toast.error('QR code is too large (max 1MB)');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setUpiQRCode(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="hero-gradient text-white py-4 md:py-6">
                <div className="w-full px-4 md:px-10 lg:px-16 flex items-center justify-between">
                    <div className="flex items-center space-x-2 md:space-x-4">
                        <Button variant="ghost" className="text-white hover:bg-white/20 p-2 h-auto" onClick={() => navigate(-1)}>
                            <ArrowLeft className="h-5 w-5 md:mr-2" />
                            <span className="hidden md:inline">Back</span>
                        </Button>
                        <h1 className="text-xl md:text-2xl font-bold">Add New Project</h1>
                    </div>
                </div>
            </div>

            <div className="w-full px-4 md:px-10 lg:px-16 py-8">
                <form onSubmit={handleSubmit(onSubmit)} className="grid lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="p-6">
                            <h2 className="text-lg font-semibold mb-4 flex items-center">
                                <Building2 className="h-5 w-5 mr-2" /> General Information
                            </h2>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium mb-1">Project Name</label>
                                    <Input {...register('name', { required: 'Name is required' })} placeholder="e.g. Skyline Heights" />
                                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Location</label>
                                    <Input {...register('location', { required: 'Location is required' })} placeholder="e.g. Whitefield, Bangalore" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Area (Neighborhood)</label>
                                    <Input {...register('area')} placeholder="e.g. Whitefield" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Builder Name</label>
                                    <Input {...register('builder')} placeholder="e.g. Prestige Group" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Possession Status</label>
                                    <select {...register('possession')} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800">
                                        <option value="Ready to Move">Ready to Move</option>
                                        <option value="Under Construction">Under Construction</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Project Status</label>
                                    <select {...register('status')} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800">
                                        <option value="upcoming">Upcoming</option>
                                        <option value="in_progress">In Progress</option>
                                        <option value="ongoing">Ongoing</option>
                                        <option value="completed">Completed</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Property Type</label>
                                    <select {...register('type')} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800">
                                        <option value="Apartment">Apartment</option>
                                        <option value="Villa">Villa</option>
                                        <option value="Penthouse">Penthouse</option>
                                        <option value="Plot">Plot</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Completion Date</label>
                                    <Input type="date" {...register('completionDate')} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-blue-600">Latitude</label>
                                    <Input type="number" step="any" {...register('latitude')} placeholder="12.9716" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-blue-600">Longitude</label>
                                    <Input type="number" step="any" {...register('longitude')} placeholder="77.5946" />
                                </div>
                            </div>
                        </Card>

                        <Card className="p-6">
                            <h2 className="text-lg font-semibold mb-4 flex items-center">
                                <IndianRupee className="h-5 w-5 mr-2" /> Pricing & Area
                            </h2>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Min Price (Lac)</label>
                                    <Input type="number" {...register('minPrice', { required: true })} placeholder="75" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Max Price (Lac)</label>
                                    <Input type="number" {...register('maxPrice', { required: true })} placeholder="125" />
                                </div>
                                {isSuperAdmin && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium mb-1 text-blue-600 font-bold">Platform Commission (%)</label>
                                            <Input
                                                type="number"
                                                step="0.1"
                                                {...register('commissionPercentage', { required: true })}
                                                placeholder="2"
                                                className="border-blue-200 focus:ring-blue-500"
                                            />
                                            <p className="text-[10px] text-gray-500">Percentage the platform earns per sale/installment.</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1 text-blue-800 font-bold">GST Rate (%)</label>
                                            <Input
                                                type="number"
                                                step="1"
                                                {...register('gstRate', { required: true })}
                                                placeholder="18"
                                                className="border-blue-200 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1 text-blue-800 font-bold">GST Type</label>
                                            <select
                                                {...register('gstType')}
                                                className="w-full px-3 py-2 border border-blue-200 rounded-lg dark:bg-gray-800 focus:ring-blue-500"
                                            >
                                                <option value="exclusive">Exclusive (Add on top)</option>
                                                <option value="inclusive">Inclusive (Deduct from commission)</option>
                                            </select>
                                        </div>
                                        <div className="md:col-span-2 border-t pt-4 mt-2">
                                            <h3 className="text-sm font-bold text-orange-600 uppercase tracking-wider mb-3">EMI Late Payment Rules</h3>
                                            <div className="grid md:grid-cols-3 gap-4">
                                                <div>
                                                    <label className="block text-xs font-medium mb-1">Penalty Type</label>
                                                    <select {...register('latePenaltyType')} className="w-full text-xs px-2 py-1.5 border rounded">
                                                        <option value="fixed">Fixed Amount (₹)</option>
                                                        <option value="percentage">Percentage (%)</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium mb-1">Penalty Value</label>
                                                    <Input type="number" {...register('latePenaltyValue')} placeholder="0" className="h-8 text-xs" />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium mb-1">Grace Period (Days)</label>
                                                    <Input type="number" {...register('gracePeriodDays')} placeholder="0" className="h-8 text-xs" />
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </Card>

                        <Card className="p-6">
                            <h2 className="text-lg font-semibold mb-4 flex items-center">
                                <FileText className="h-5 w-5 mr-2" /> Project Configurations
                            </h2>
                            <div className="space-y-4">
                                {configurations.map((config, index) => (
                                    <div key={index} className="p-4 border rounded-lg bg-gray-50/50 relative">
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                            <div>
                                                <label className="text-[10px] uppercase font-bold text-gray-400 mb-1 block">Type</label>
                                                <Input placeholder="2 BHK" value={config.type} onChange={e => handleConfigChange(index, 'type', e.target.value)} />
                                            </div>
                                            <div>
                                                <label className="text-[10px] uppercase font-bold text-gray-400 mb-1 block">Area</label>
                                                <Input placeholder="1200 sqft" value={config.area} onChange={e => handleConfigChange(index, 'area', e.target.value)} />
                                            </div>
                                            <div className="relative">
                                                <label className="text-[10px] uppercase font-bold text-gray-400 mb-1 block">Price</label>
                                                <div className="flex gap-2">
                                                    <Input placeholder="75L" value={config.price} onChange={e => handleConfigChange(index, 'price', e.target.value)} />
                                                    <Button type="button" variant="destructive" size="icon" className="shrink-0" onClick={() => handleRemoveConfiguration(index)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <Button type="button" variant="outline" className="w-full" onClick={handleAddConfiguration}>
                                    <Plus className="h-4 w-4 mr-2" /> Add Configuration
                                </Button>
                            </div>
                        </Card>

                        <Card className="p-6">
                            <h2 className="text-lg font-semibold mb-4 flex items-center">
                                <FileText className="h-5 w-5 mr-2" /> Specifications
                            </h2>
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                                    <Input
                                        placeholder="Label (e.g. Structure)"
                                        value={newSpec.label}
                                        onChange={e => setNewSpec({ ...newSpec, label: e.target.value })}
                                    />
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="Value (e.g. RCC Framed)"
                                            value={newSpec.value}
                                            onChange={e => setNewSpec({ ...newSpec, value: e.target.value })}
                                        />
                                        <Button type="button" onClick={handleAddSpec} size="icon" className="shrink-0">
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="grid sm:grid-cols-2 gap-3">
                                    {specifications.map((spec, index) => (
                                        <div key={index} className="flex justify-between items-center p-3 border rounded-lg bg-gray-50">
                                            <div className="text-sm">
                                                <span className="font-bold text-gray-500 uppercase text-[10px] block">{spec.label}</span>
                                                <span>{spec.value}</span>
                                            </div>
                                            <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveSpec(index)}>
                                                <Trash2 className="h-4 w-4 text-red-500" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </Card>

                        <Card className="p-6">
                            <h2 className="text-lg font-semibold mb-4">Description</h2>
                            <textarea {...register('description')} className="w-full p-3 border rounded-lg h-32 dark:bg-gray-800" placeholder="Describe the project..." />
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card className="p-6">
                            <h2 className="text-lg font-semibold mb-4">Amenities</h2>
                            <div className="flex gap-2 mb-4">
                                <Input value={newAmenity} onChange={e => setNewAmenity(e.target.value)} placeholder="e.g. Gym" />
                                <Button type="button" onClick={handleAddAmenity}>Add</Button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {amenities.map(amenity => (
                                    <Badge key={amenity} className="flex items-center gap-1">
                                        {amenity} <X className="h-3 w-3 cursor-pointer" onClick={() => handleRemoveAmenity(amenity)} />
                                    </Badge>
                                ))}
                            </div>
                        </Card>

                        <Card className="p-6">
                            <h2 className="text-lg font-semibold mb-4">Project Images</h2>
                            <div className="grid grid-cols-2 gap-2 mb-4">
                                {images.map((url, i) => (
                                    <div key={i} className="relative aspect-square rounded-lg overflow-hidden border group">
                                        <img src={normalizeImageUrl(url)} alt="" className="w-full h-full object-cover" onError={handleImageError} />
                                        <button
                                            type="button"
                                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={() => setImages(images.filter((_, idx) => idx !== i))}
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <div className="flex gap-2 mb-4">
                                <Input
                                    value={imageUrlInput}
                                    onChange={e => setImageUrlInput(e.target.value)}
                                    placeholder="Paste image link here..."
                                />
                                <Button type="button" variant="secondary" onClick={handleAddImageUrl}>Add Link</Button>
                            </div>
                            <input
                                type="file"
                                id="project-images"
                                multiple
                                accept="image/*"
                                className="hidden"
                                onChange={handleImageChange}
                            />
                            <div className="grid grid-cols-2 gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="border-dashed h-20 flex-col gap-1"
                                    onClick={() => document.getElementById('project-images').click()}
                                >
                                    <Upload className="h-5 w-5" />
                                    <span className="text-[10px]">Upload Files</span>
                                </Button>
                                <p className="text-[10px] text-gray-400 p-2 italic flex items-center">
                                    Max size: 15MB per image.
                                </p>
                            </div>
                        </Card>

                        <Card className="p-6">
                            <h2 className="text-lg font-semibold mb-4 flex items-center">
                                <QrCode className="h-5 w-5 mr-2" /> Owner UPI QR
                            </h2>
                            {upiQRCode ? (
                                <div className="relative aspect-square rounded-lg overflow-hidden border mb-4">
                                    <img src={normalizeImageUrl(upiQRCode)} alt="Owner UPI QR" className="w-full h-full object-cover" onError={handleImageError} />
                                    <button
                                        type="button"
                                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600 transition-colors"
                                        onClick={() => setUpiQRCode('')}
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <input
                                        type="file"
                                        id="qr-code"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleQRChange}
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full mb-4 border-dashed border-2 py-8 h-auto flex-col gap-2"
                                        onClick={() => document.getElementById('qr-code').click()}
                                    >
                                        <QrCode className="h-8 w-8 text-gray-400" />
                                        <span>Upload Owner's UPI QR</span>
                                    </Button>
                                </>
                            )}
                            <p className="text-[10px] text-gray-400 italic text-center">This QR will be shown to customers during UPI payment.</p>
                        </Card>

                        <Card className="p-6">
                            <Button type="submit" className="w-full h-12 text-lg" disabled={loading}>
                                {loading ? 'Creating...' : 'Create Project'}
                            </Button>
                            <Button type="button" variant="outline" className="w-full mt-2" onClick={() => navigate('/admin/projects')}>
                                Cancel
                            </Button>
                        </Card>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddProjectPage;
