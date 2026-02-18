import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
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
  AlertCircle,
  QrCode
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';

import projectService from '../services/projectService';

const EditProjectPage = () => {
  const { user } = useSelector((state) => state.auth);
  const isSuperAdmin = user?.role === 'super_admin';
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [configurations, setConfigurations] = useState([]);
  const [amenities, setAmenities] = useState([]);
  const [newAmenity, setNewAmenity] = useState('');
  const [images, setImages] = useState([]);
  const [upiQRCode, setUpiQRCode] = useState(null);
  const [rawProject, setRawProject] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm();

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        const data = await projectService.getProject(id);
        const proj = data.data?.data || data.data || data;

        reset({
          name: proj.name,
          location: proj.location?.address || proj.location,
          area: proj.area,
          type: proj.type || 'Apartment',
          builder: proj.builder,
          rera: proj.reraId || proj.rera,
          status: proj.status,
          possession: proj.possession,
          deliveryDate: proj.completionDate ? new Date(proj.completionDate).toISOString().split('T')[0] : proj.deliveryDate,
          minPrice: proj.pricing?.basePrice ? proj.pricing.basePrice / 100000 : proj.price?.min,
          maxPrice: proj.pricing?.basePrice ? (proj.pricing.basePrice / 100000) + 10 : proj.price?.max, // Approximate max
          commissionPercentage: proj.pricing?.commissionPercentage || 2,
          gstRate: proj.pricing?.gstRate || 18,
          gstType: proj.pricing?.gstType || 'exclusive',
          latePenaltyType: proj.pricing?.penaltyConfig?.latePenaltyType || 'fixed',
          latePenaltyValue: proj.pricing?.penaltyConfig?.latePenaltyValue || 0,
          gracePeriodDays: proj.pricing?.penaltyConfig?.gracePeriodDays || 0,
          description: proj.description
        });

        setConfigurations(proj.configurations || []);
        setAmenities((proj.amenities || []).map(a => typeof a === 'string' ? a : (a.name || '')));
        setImages(proj.images || []);
        setUpiQRCode(proj.pricing?.upiQRCode || null);
        setRawProject(proj);
      } catch (error) {
        console.error('Failed to fetch project:', error);
        toast.error('Failed to load project details');
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id, reset]);

  const onSubmit = async (data) => {
    try {
      setSaving(true);
      const payload = {
        name: data.name,
        type: data.type,
        builder: data.builder,
        possession: data.possession,
        status: data.status,
        area: data.area,
        description: data.description,
        reraId: data.rera || undefined, // Send as undefined if empty to avoid sending empty string
        completionDate: data.deliveryDate || undefined, // Send as undefined if empty
        pricing: {
          basePrice: Number(data.minPrice) * 100000,
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
          upiQRCode: upiQRCode
        },
        location: {
          address: data.location,
          latitude: 12.9716, // Default coordinate if not provided
          longitude: 77.5946
        },
        configurations: configurations.map(c => ({
          ...c,
          price: c.price.toString().includes('Lac') ? c.price : (c.price.toString().includes('L') ? c.price : `${c.price} Lac`)
        })),
        amenities: amenities.map(name => ({ name })),
        images: images
      };

      await projectService.updateProject(id, payload);
      toast.success('Project updated successfully!');
      navigate('/admin/projects');
    } catch (error) {
      console.error('Failed to update project:', error);
      const msg = error.response?.data?.message || error.response?.data?.error || 'Failed to update project';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleAddAmenity = (e) => {
    e.preventDefault();
    if (newAmenity.trim() && !amenities.includes(newAmenity.trim())) {
      setAmenities([...amenities, newAmenity.trim()]);
      setNewAmenity('');
      toast.success('Amenity added');
    }
  };

  const handleRemoveAmenity = (amenity) => {
    setAmenities(amenities.filter(a => a !== amenity));
    toast.success('Amenity removed');
  };

  const handleAddConfiguration = () => {
    setConfigurations([
      ...configurations,
      { type: '', area: '', price: '', available: 0 }
    ]);
  };

  const handleRemoveConfiguration = (index) => {
    setConfigurations(configurations.filter((_, i) => i !== index));
    toast.success('Configuration removed');
  };

  const handleConfigurationChange = (index, field, value) => {
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

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    // In production, these would be uploaded to a server
    const newImages = files.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      url: URL.createObjectURL(file)
    }));
    setImages([...images, ...newImages]);
    toast.success(`${files.length} image(s) added`);
  };

  const handleRemoveImage = (imageId) => {
    setImages(images.filter(img => img.id !== imageId));
    toast.success('Image removed');
  };

  const handleQRUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Mock upload for now - in production use projectService.uploadImage
      setUpiQRCode({
        url: URL.createObjectURL(file),
        name: file.name
      });
      toast.success('UPI QR Code uploaded locally');
    }
  };

  const handleRemoveQR = () => {
    setUpiQRCode(null);
    toast.success('QR Code removed');
  };

  const getTimeAgo = (date) => {
    if (!date) return 'Never';
    const now = new Date();
    const then = new Date(date);
    const diff = now - then;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return `${minutes} min${minutes !== 1 ? 's' : ''} ago`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="hero-gradient text-white">
        <div className="w-full px-4 md:px-6 py-4 md:py-6 font-bold">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 md:gap-4">
              <Button
                variant="ghost"
                className="text-white hover:bg-white/20 p-2 h-auto"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft className="h-5 w-5 md:mr-1" />
                <span className="hidden md:inline">Back</span>
              </Button>
              <div className="flex flex-col gap-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl md:text-3xl font-black">Edit Project</h1>
                  <Badge className="bg-white/20 text-white border-white/30 text-[10px] font-bold px-2">
                    #{id.slice(-6)}
                  </Badge>
                </div>
                <p className="text-white/80 text-xs md:text-sm font-bold">Update project details and settings</p>
              </div>
            </div>
            <div className="flex flex-row md:flex-col md:items-end gap-2 text-right">
              <Badge className="bg-green-500/20 text-green-100 border-green-500/30 text-[10px] uppercase">Active Listing</Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full px-4 md:px-6 py-8">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center">
                  <Building2 className="h-5 w-5 mr-2" />
                  Basic Information
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Project Name *
                    </label>
                    <Input
                      {...register('name', { required: 'Project name is required' })}
                      placeholder="Enter project name"
                    />
                    {errors.name && (
                      <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Location *
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        {...register('location', { required: 'Location is required' })}
                        placeholder="Enter location"
                        className="pl-10"
                      />
                    </div>
                    {errors.location && (
                      <p className="text-red-500 text-xs mt-1">{errors.location.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Property Type *
                    </label>
                    <select
                      {...register('type', { required: 'Type is required' })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Apartment">Apartment</option>
                      <option value="Villa">Villa</option>
                      <option value="Plot">Plot</option>
                      <option value="Commercial">Commercial</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Builder Name *
                    </label>
                    <Input
                      {...register('builder', { required: 'Builder name is required' })}
                      placeholder="Enter builder name"
                    />
                    {errors.builder && (
                      <p className="text-red-500 text-xs mt-1">{errors.builder.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      RERA Number
                    </label>
                    <Input
                      {...register('rera')}
                      placeholder="Enter RERA registration number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Status *
                    </label>
                    <select
                      {...register('status', { required: 'Status is required' })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="upcoming">Upcoming</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="ongoing">Ongoing</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Possession Status
                    </label>
                    <select
                      {...register('possession')}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Ready to Move">Ready to Move</option>
                      <option value="Under Construction">Under Construction</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Delivery Date
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        type="date"
                        {...register('deliveryDate')}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
              </Card>

              {/* Pricing */}
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center">
                  <IndianRupee className="h-5 w-5 mr-2" />
                  Pricing Range
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Minimum Price (in Lac) *
                    </label>
                    <Input
                      type="number"
                      {...register('minPrice', {
                        required: 'Minimum price is required',
                        min: { value: 0, message: 'Price must be positive' }
                      })}
                      placeholder="e.g., 75"
                    />
                    {errors.minPrice && (
                      <p className="text-red-500 text-xs mt-1">{errors.minPrice.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Maximum Price (in Lac) *
                    </label>
                    <Input
                      type="number"
                      {...register('maxPrice', {
                        required: 'Maximum price is required',
                        min: { value: 0, message: 'Price must be positive' }
                      })}
                      placeholder="e.g., 125"
                    />
                    {errors.maxPrice && (
                      <p className="text-red-500 text-xs mt-1">{errors.maxPrice.message}</p>
                    )}
                  </div>
                  {isSuperAdmin && (
                    <>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-2 text-blue-600 font-bold">
                          Platform Commission (%) *
                        </label>
                        <Input
                          type="number"
                          step="0.1"
                          {...register('commissionPercentage', {
                            required: 'Commission is required',
                            min: { value: 0, message: 'Commission must be positive' }
                          })}
                          placeholder="e.g., 2"
                          className="border-blue-200 focus:ring-blue-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">Percentage the platform earns per sale/installment.</p>
                        {errors.commissionPercentage && (
                          <p className="text-red-500 text-xs mt-1">{errors.commissionPercentage.message}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2 text-blue-800 font-bold">
                          GST Rate (%) *
                        </label>
                        <Input
                          type="number"
                          step="1"
                          {...register('gstRate', {
                            required: 'GST Rate is required',
                            min: { value: 0, message: 'GST Rate must be positive' }
                          })}
                          placeholder="e.g., 18"
                          className="border-blue-200 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2 text-blue-800 font-bold">
                          GST Type *
                        </label>
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

              {/* Description */}
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Description
                </h2>
                <textarea
                  {...register('description', { required: 'Description is required' })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="4"
                  placeholder="Enter project description..."
                />
                {errors.description && (
                  <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>
                )}
              </Card>

              {/* Amenities */}
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Amenities
                </h2>
                <div className="flex gap-2 mb-4">
                  <Input
                    value={newAmenity}
                    onChange={e => setNewAmenity(e.target.value)}
                    placeholder="e.g. Gym, Swimming Pool"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddAmenity(e)}
                  />
                  <Button type="button" onClick={handleAddAmenity}>Add</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {amenities.map(amenity => (
                    <Badge key={amenity} variant="secondary" className="flex items-center gap-1 py-1.5 px-3">
                      {amenity}
                      <X className="h-3 w-3 cursor-pointer hover:text-red-500" onClick={() => handleRemoveAmenity(amenity)} />
                    </Badge>
                  ))}
                  {amenities.length === 0 && (
                    <p className="text-sm text-gray-400 italic">No amenities added yet.</p>
                  )}
                </div>
              </Card>

              {/* Configurations */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Configurations</h2>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddConfiguration}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Configuration
                  </Button>
                </div>
                <div className="space-y-4">
                  {configurations.map((config, index) => (
                    <div key={index} className="p-4 border rounded-lg bg-gray-50/50">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        <div>
                          <label className="text-[10px] uppercase font-bold text-gray-400 mb-1 block">Type</label>
                          <Input
                            placeholder="e.g. 2 BHK"
                            value={config.type}
                            onChange={(e) => handleConfigurationChange(index, 'type', e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-bold text-gray-400 mb-1 block">Area</label>
                          <Input
                            placeholder="e.g. 1200 sq.ft"
                            value={config.area}
                            onChange={(e) => handleConfigurationChange(index, 'area', e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-bold text-gray-400 mb-1 block">Price</label>
                          <Input
                            placeholder="e.g. 75 Lac"
                            value={config.price}
                            onChange={(e) => handleConfigurationChange(index, 'price', e.target.value)}
                          />
                        </div>
                        <div className="relative">
                          <label className="text-[10px] uppercase font-bold text-gray-400 mb-1 block">Available Units</label>
                          <div className="flex gap-2">
                            <Input
                              type="number"
                              placeholder="Units"
                              value={config.available}
                              onChange={(e) => handleConfigurationChange(index, 'available', e.target.value)}
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="shrink-0"
                              onClick={() => handleRemoveConfiguration(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {configurations.length === 0 && (
                    <p className="text-gray-500 text-center py-4">
                      No configurations added. Click "Add Configuration" to start.
                    </p>
                  )}
                </div>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* UPI QR Code */}
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center">
                  <QrCode className="h-5 w-5 mr-2" />
                  Owner UPI QR Code
                </h2>
                <div className="space-y-4">
                  {!upiQRCode ? (
                    <label className="block">
                      <div className="flex items-center justify-center w-full h-32 px-4 transition bg-white border-2 border-blue-300 border-dashed rounded-lg appearance-none cursor-pointer hover:border-blue-400 focus:outline-none">
                        <div className="flex flex-col items-center space-y-2">
                          <Upload className="h-8 w-8 text-blue-800" />
                          <span className="text-sm text-gray-600">
                            Upload Owner's Payment QR
                          </span>
                        </div>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleQRUpload}
                      />
                    </label>
                  ) : (
                    <div className="relative group rounded-xl overflow-hidden border-2 border-blue-100 p-2">
                      <img
                        src={upiQRCode.url}
                        alt="UPI QR"
                        className="w-full h-48 object-contain rounded-lg"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={handleRemoveQR}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove QR
                        </Button>
                      </div>
                      <p className="text-[10px] text-center mt-2 text-blue-800 font-bold uppercase tracking-widest italic">Official Payment QR</p>
                    </div>
                  )}
                </div>
              </Card>

              {/* Image Upload */}
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center">
                  <Image className="h-5 w-5 mr-2" />
                  Project Images
                </h2>
                <div className="space-y-4">
                  <label className="block">
                    <div className="flex items-center justify-center w-full h-32 px-4 transition bg-white border-2 border-gray-300 border-dashed rounded-lg appearance-none cursor-pointer hover:border-gray-400 focus:outline-none">
                      <div className="flex flex-col items-center space-y-2">
                        <Upload className="h-8 w-8 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          Drop files or click to upload
                        </span>
                      </div>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </label>

                  {images.length > 0 && (
                    <div className="space-y-2">
                      {images.map((image) => (
                        <div key={image.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm truncate flex-1">{image.name}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveImage(image.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>

              {/* Actions */}
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">Actions</h2>
                <div className="space-y-3">
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <motion.div
                          className="h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => reset()}
                  >
                    Reset Form
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    className="w-full"
                    onClick={() => {
                      if (window.confirm('Are you sure you want to cancel? All changes will be lost.')) {
                        navigate(-1);
                      }
                    }}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </Card>

              {/* Status */}
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">Status</h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Last Updated</span>
                    <span className="text-sm font-medium">{rawProject ? getTimeAgo(rawProject.updatedAt) : '-'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Created</span>
                    <span className="text-sm font-medium">Jan 14, 2026</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Views</span>
                    <span className="text-sm font-medium">{rawProject?.views?.toLocaleString() || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Enquiries</span>
                    <span className="text-sm font-medium">{rawProject?.enquiryCount || 0}</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProjectPage;
