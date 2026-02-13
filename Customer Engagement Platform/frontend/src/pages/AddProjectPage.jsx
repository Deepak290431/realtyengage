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

const AddProjectPage = () => {
    const { user } = useSelector((state) => state.auth);
    const isSuperAdmin = user?.role === 'super_admin';
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [configurations, setConfigurations] = useState([]);
    const [amenities, setAmenities] = useState([]);
    const [newAmenity, setNewAmenity] = useState('');
    const [images, setImages] = useState([]);
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
                    latitude: 12.9716, // Default for Bangalore
                    longitude: 77.5946
                },
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
        updated[index][field] = value;
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

    const handleImageAdd = (e) => {
        // Basic image URL input simulation
        const url = prompt('Enter image URL:');
        if (url) {
            setImages([...images, url]);
            toast.success('Image added');
        }
    };
    const handleQRAdd = () => {
        const url = prompt('Enter Owner UPI QR Code Image URL:');
        if (url) {
            setUpiQRCode(url);
            toast.success('UPI QR Code added');
        }
    };
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="hero-gradient text-white py-6">
                <div className="w-full px-4 md:px-10 lg:px-16 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Button variant="ghost" className="text-white hover:bg-white/20" onClick={() => navigate(-1)}>
                            <ArrowLeft className="h-5 w-5 mr-2" /> Back
                        </Button>
                        <h1 className="text-2xl font-bold">Add New Project</h1>
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
                                    <label className="block text-sm font-medium mb-1">RERA ID</label>
                                    <Input {...register('reraId')} placeholder="PRM/KA/RERA..." />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Completion Date</label>
                                    <Input type="date" {...register('completionDate')} />
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
                                    <div key={index} className="flex gap-2 items-center p-3 border rounded-lg">
                                        <Input placeholder="2 BHK" value={config.type} onChange={e => handleConfigChange(index, 'type', e.target.value)} />
                                        <Input placeholder="1200 sqft" value={config.area} onChange={e => handleConfigChange(index, 'area', e.target.value)} />
                                        <Input placeholder="75L" value={config.price} onChange={e => handleConfigChange(index, 'price', e.target.value)} />
                                        <Button type="button" variant="destructive" size="icon" onClick={() => handleRemoveConfiguration(index)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                                <Button type="button" variant="outline" className="w-full" onClick={handleAddConfiguration}>
                                    <Plus className="h-4 w-4 mr-2" /> Add Configuration
                                </Button>
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
                                    <div key={i} className="relative aspect-square rounded-lg overflow-hidden border">
                                        <img src={url} alt="" className="w-full h-full object-cover" />
                                        <button className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1" onClick={() => setImages(images.filter((_, idx) => idx !== i))}>
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <Button type="button" variant="outline" className="w-full" onClick={handleImageAdd}>
                                <Plus className="h-4 w-4 mr-2" /> Add Image URL
                            </Button>
                        </Card>

                        <Card className="p-6">
                            <h2 className="text-lg font-semibold mb-4 flex items-center">
                                <QrCode className="h-5 w-5 mr-2" /> Owner UPI QR
                            </h2>
                            {upiQRCode ? (
                                <div className="relative aspect-square rounded-lg overflow-hidden border mb-4">
                                    <img src={upiQRCode} alt="Owner UPI QR" className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600 transition-colors"
                                        onClick={() => setUpiQRCode('')}
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            ) : (
                                <Button type="button" variant="outline" className="w-full mb-4 border-dashed border-2 py-8 h-auto flex-col gap-2" onClick={handleQRAdd}>
                                    <Plus className="h-8 w-8 text-gray-400" />
                                    <span>Add Owner's UPI QR URL</span>
                                </Button>
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
