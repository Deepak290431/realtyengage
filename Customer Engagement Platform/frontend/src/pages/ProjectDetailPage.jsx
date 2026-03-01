import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
    MapPin,
    Home,
    IndianRupee,
    Calendar,
    Bed,
    Bath,
    Square,
    Car,
    Building2,
    CheckCircle,
    Star,
    Heart,
    Share2,
    Phone,
    Mail,
    MessageCircle,
    Download,
    ChevronLeft,
    ChevronRight,
    Clock,
    TrendingUp,
    Shield,
    Trees,
    Dumbbell,
    Waves,
    Users,
    Camera,
    Video,
    Plus,
    Edit,
    Trash2,
    Navigation,
    Map
} from 'lucide-react';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import GoogleMap from '../components/GoogleMap';
import ScheduleVisitModal from '../components/ScheduleVisitModal';
import VirtualTourViewer from '../components/VirtualTourViewer';
import VirtualTourManager from '../components/VirtualTourManager';

import projectService from '../services/projectService';
import { virtualTourAPI } from '../services/api';
import { normalizeImageUrl, handleImageError } from '../utils/imageUtils';

const ProjectDetailPage = ({ isAdmin = false }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useSelector((state) => state.auth);

    const [project, setProject] = useState(null);
    const [projects, setProjects] = useState([]); // For similar properties
    const [loading, setLoading] = useState(true);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isSaved, setIsSaved] = useState(false);
    const [showEnquiryForm, setShowEnquiryForm] = useState(false);
    const [isVisitModalOpen, setIsVisitModalOpen] = useState(false);
    const [virtualTourData, setVirtualTourData] = useState(null);
    const [showVirtualTour, setShowVirtualTour] = useState(false);
    const [refreshVirtualTour, setRefreshVirtualTour] = useState(0);

    useEffect(() => {
        const fetchProject = async () => {
            try {
                setLoading(true);

                // Fetch project data
                const projectRes = await projectService.getProject(id);
                const projectData = projectRes.data?.data || projectRes.data || projectRes;

                if (!projectData || !projectData._id) {
                    throw new Error('Project not found');
                }

                setProject(projectData);

                // Fetch related data in parallel (don't fail if these fail)
                const [projectsRes, virtualTourRes] = await Promise.allSettled([
                    projectService.getProjects(),
                    virtualTourAPI.getVirtualTour(id)
                ]);

                // Handle projects list
                if (projectsRes.status === 'fulfilled') {
                    setProjects(projectsRes.value.data?.data || projectsRes.value.data || projectsRes.value || []);
                }

                // Handle virtual tour data
                if (virtualTourRes.status === 'fulfilled') {
                    setVirtualTourData(virtualTourRes.value?.data?.data?.virtualTour || null);
                }

            } catch (error) {
                console.error('Failed to fetch project:', error);

                if (error.response?.status === 404 || error.message === 'Project not found') {
                    toast.error('Project not found');
                    navigate('/projects');
                } else {
                    toast.error('Some features may not be available');
                    // Don't navigate away - let the page show with whatever data we have
                }
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchProject();
        }
    }, [id, navigate, refreshVirtualTour]);

    const handleVirtualTourUpdate = () => {
        // Trigger re-fetch of virtual tour data
        setRefreshVirtualTour(prev => prev + 1);
    };

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const hasContent = (virtualTourData?.images360?.length > 0) || !!virtualTourData?.video360?.url;

        if (params.get('viewTour') === 'true' && hasContent) {
            setShowVirtualTour(true);

            // Clean up the URL after opening
            const newParams = new URLSearchParams(location.search);
            newParams.delete('viewTour');
            const newSearch = newParams.toString() ? `?${newParams.toString()}` : '';
            window.history.replaceState(null, '', `${location.pathname}${newSearch}`);
        }
    }, [location.search, virtualTourData, location.pathname]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary mb-4"></div>
                <p className="text-gray-500 font-medium">Loading project details...</p>
            </div>
        );
    }

    if (!project) return null;

    const images = project.images && project.images.length > 0
        ? project.images.map(normalizeImageUrl)
        : ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800'];

    const handlePrevImage = () => {
        setCurrentImageIndex((prev) =>
            prev === 0 ? images.length - 1 : prev - 1
        );
    };

    const handleNextImage = () => {
        setCurrentImageIndex((prev) =>
            prev === images.length - 1 ? 0 : prev + 1
        );
    };

    const handleSave = () => {
        setIsSaved(!isSaved);
        toast.success(isSaved ? 'Removed from saved' : 'Property saved!');
    };

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard!');
    };

    const handleEnquiry = () => {
        if (user) {
            navigate(`/dashboard/enquiries?project=${id}`);
            toast.success('Redirecting to enquiry form...');
        } else {
            toast.error('Please login to make an enquiry');
            navigate('/login', { state: { from: `/projects/${id}` } });
        }
    };

    const handleCallNow = () => {
        const phoneNumber = '+919876543210'; // Builder's phone number
        window.location.href = `tel:${phoneNumber}`;
        toast.success('Opening dialer...');
    };

    const handleScheduleVisit = () => {
        if (user) {
            setIsVisitModalOpen(true);
        } else {
            toast.error('Please login to schedule a visit');
            navigate('/login', { state: { from: `/projects/${id}` } });
        }
    };

    const handleDownloadBrochure = () => {
        toast.loading('Generating Official Brochure...', { id: 'brochure' });

        // Direct link to backend download route with token for auth
        const token = localStorage.getItem('token');
        const downloadUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5005/api'}/projects/${id}/brochure?token=${token}`;

        const link = document.createElement('a');
        link.href = downloadUrl;
        link.setAttribute('download', `${project.name}_Brochure.pdf`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setTimeout(() => {
            toast.success('Official Brochure Downloaded!', { id: 'brochure' });
        }, 2000);
    };

    const handleWhatsApp = () => {
        const message = `Hello, I'm interested in the project: ${project.name} at ${project.location?.address || project.location}`;
        const whatsappUrl = `https://wa.me/9360726636?text=${encodeURIComponent(message)}`;

        toast((t) => (
            <div className="flex flex-col items-center">
                <p className="font-bold text-sm mb-2 text-center">Important: For Messages Only. Please do not make calls.</p>
                <div className="flex space-x-2">
                    <Button size="sm" variant="outline" onClick={() => toast.dismiss(t.id)}>Cancel</Button>
                    <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => {
                        window.open(whatsappUrl, '_blank');
                        toast.dismiss(t.id);
                    }}>Continue to WhatsApp</Button>
                </div>
            </div>
        ), { duration: 6000, position: 'bottom-center' });
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 overflow-x-hidden">
            {/* Image Gallery */}
            <div className="relative h-[400px] md:h-[500px] bg-black">
                <img
                    src={images[currentImageIndex]}
                    alt={project.name}
                    className="w-full h-full object-cover transition-opacity duration-500"
                    onError={handleImageError}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                {/* Navigation Buttons */}
                {images.length > 1 && (
                    <>
                        <button
                            onClick={handlePrevImage}
                            className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
                        >
                            <ChevronLeft className="h-6 w-6 text-white" />
                        </button>
                        <button
                            onClick={handleNextImage}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
                        >
                            <ChevronRight className="h-6 w-6 text-white" />
                        </button>
                    </>
                )}

                {/* Image Indicators */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                    {images.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`w-2 h-2 rounded-full transition-all ${index === currentImageIndex ? 'bg-white w-8' : 'bg-white/50'
                                }`}
                        />
                    ))}
                </div>

                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="absolute top-4 left-4 p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
                >
                    <ChevronLeft className="h-6 w-6 text-white" />
                </button>

                {/* Action Buttons */}
                <div className="absolute top-4 right-4 flex items-center space-x-2 md:space-x-3">
                    {((virtualTourData?.images360?.length > 0) || virtualTourData?.video360?.url) && (
                        <motion.button
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowVirtualTour(true)}
                            className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full shadow-2xl transition-all font-bold text-[10px] md:text-sm ${virtualTourData?.enabled
                                ? 'bg-primary text-white hover:bg-primary/90'
                                : 'bg-blue-600/80 text-white hover:bg-blue-600'
                                }`}
                        >
                            <Video className="h-3 w-3 md:h-4 md:w-4" />
                            <span className="hidden sm:inline">VIRTUAL TOUR</span>
                            <span className="sm:hidden">TOUR</span>
                        </motion.button>
                    )}
                    <button
                        onClick={handleSave}
                        className="p-1.5 md:p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors border border-white/20"
                    >
                        <Heart className={`h-5 w-5 md:h-6 md:w-6 ${isSaved ? 'fill-red-500 text-red-500' : 'text-white'}`} />
                    </button>
                    <button
                        onClick={handleShare}
                        className="p-1.5 md:p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors border border-white/20"
                    >
                        <Share2 className="h-5 w-5 md:h-6 md:w-6 text-white" />
                    </button>
                </div>

                {/* Project Info Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white text-shadow-lg bg-gradient-to-t from-black/90 via-black/40 to-transparent">
                    <div className={isAdmin ? "w-full" : "max-w-[1440px] mx-auto"}>
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                            <div className="flex-1 space-y-2 md:space-y-3">
                                <Badge className="bg-primary text-white uppercase tracking-wider px-3 py-1 text-[10px] md:text-xs">
                                    <Clock className="h-3 w-3 mr-1" />
                                    {project.status?.replace('_', ' ')}
                                </Badge>
                                <h1 className="text-2xl md:text-5xl font-black tracking-tight leading-loose md:leading-tight">{project.name}</h1>
                                <div className="flex flex-wrap items-center gap-3 md:gap-4 text-xs md:text-lg text-white/90">
                                    <span className="flex items-center break-words">
                                        <MapPin className="h-3.5 w-3.5 md:h-5 md:w-5 mr-1.5 text-primary flex-shrink-0" />
                                        <span className="truncate sm:whitespace-normal">{project.location?.address || project.location}</span>
                                    </span>
                                    <span className="flex items-center">
                                        <Star className="h-3.5 w-3.5 md:h-5 md:w-5 mr-1.5 fill-primary text-primary flex-shrink-0" />
                                        {project.rating || '4.5'} ({project.reviews || 0})
                                    </span>
                                </div>
                            </div>

                            {/* Admin Actions */}
                            {isAdmin && (
                                <div className="flex flex-row md:flex-col lg:flex-row gap-2 w-full md:w-auto pt-2 md:pt-0">
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        className="flex-1 md:flex-none bg-white/95 hover:bg-white text-gray-900 border-none shadow-xl"
                                        onClick={() => navigate(`/admin/projects/edit/${project._id}`)}
                                    >
                                        <Edit className="h-4 w-4 mr-1.5" />
                                        Edit
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        className="flex-1 md:flex-none shadow-xl"
                                        onClick={async () => {
                                            if (window.confirm('Are you sure you want to delete this project?')) {
                                                try {
                                                    await projectService.deleteProject(project._id);
                                                    toast.success('Project deleted successfully');
                                                    navigate('/admin/projects');
                                                } catch (error) {
                                                    console.error('Delete project error:', error);
                                                    toast.error('Failed to delete project');
                                                }
                                            }
                                        }}
                                    >
                                        <Trash2 className="h-4 w-4 mr-1.5" />
                                        Delete
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className={isAdmin ? "w-full px-4 md:px-6 py-8" : "max-w-[1440px] mx-auto px-6 md:px-10 lg:px-12 py-8"}>
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Price & Quick Info */}
                        <Card className="p-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                                <div>
                                    <div className="flex items-baseline mb-1">
                                        <IndianRupee className="h-6 w-6 md:h-8 md:w-8 text-primary mr-1" />
                                        <span className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white">{(project.pricing?.basePrice / 100000).toFixed(1)}</span>
                                        <span className="text-lg md:text-xl text-gray-500 ml-2 font-medium">Lakhs onwards</span>
                                    </div>
                                    <p className="text-xs md:text-sm text-gray-500 font-bold uppercase tracking-wider">Starting Price</p>
                                </div>
                                <div className="sm:text-right bg-gray-50 dark:bg-gray-800 p-2 rounded-lg border border-gray-100 dark:border-gray-700 sm:bg-transparent sm:border-none sm:p-0">
                                    <p className="text-[10px] md:text-sm text-gray-500 font-bold uppercase tracking-wider">RERA ID</p>
                                    <p className="font-mono text-xs md:text-sm uppercase font-bold text-primary">{project.reraId || 'PRM/KA/RERA/1251'}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t">
                                <div className="col-span-1">
                                    <p className="text-gray-500 text-[10px] uppercase font-bold tracking-wider mb-0.5">Property Type</p>
                                    <p className="font-bold text-sm sm:text-base capitalize">{project.type}</p>
                                </div>
                                <div className="col-span-1">
                                    <p className="text-gray-500 text-[10px] uppercase font-bold tracking-wider mb-0.5">Developer</p>
                                    <p className="font-bold text-sm sm:text-base truncate">{project.developer?.name || 'Prestige Group'}</p>
                                </div>
                                <div className="col-span-2 sm:col-span-1">
                                    <p className="text-gray-500 text-[10px] uppercase font-bold tracking-wider mb-0.5">Completion</p>
                                    <p className="font-bold text-sm sm:text-base">{project.completionDate ? new Date(project.completionDate).toLocaleDateString() : 'Dec 2025'}</p>
                                </div>
                            </div>
                        </Card>

                        {/* Description */}
                        <Card className="p-6">
                            <h2 className="text-2xl font-semibold mb-4">About Project</h2>
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                {project.description}
                            </p>
                        </Card>

                        {/* Configurations */}
                        <Card className="p-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                                <h2 className="text-2xl font-bold text-primary">Available Configurations</h2>
                                {isAdmin && (
                                    <Button
                                        className="w-full sm:w-auto shadow-md"
                                        onClick={() => {
                                            toast.success('Add configuration form opened');
                                        }}
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Configuration
                                    </Button>
                                )}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {(project.configurations && project.configurations.length > 0) ? (
                                    project.configurations.map((config, index) => (
                                        <div key={index} className="p-4 border rounded-lg hover:border-primary transition-colors relative group bg-white dark:bg-gray-800">
                                            {isAdmin && (
                                                <div className="absolute top-2 right-2 flex space-x-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => toast.success('Edit configuration')}
                                                        className="p-1.5 bg-blue-100 hover:bg-blue-200 rounded text-blue-600 shadow-sm"
                                                    >
                                                        <Edit className="h-3.5 w-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            if (window.confirm('Delete this configuration?')) {
                                                                toast.success('Configuration deleted');
                                                            }
                                                        }}
                                                        className="p-1.5 bg-red-100 hover:bg-red-200 rounded text-red-600 shadow-sm"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                            )}
                                            <div className="flex flex-col sm:flex-row justify-between items-start mb-3 gap-2">
                                                <div>
                                                    <h3 className="font-semibold text-lg">{config.type}</h3>
                                                    <p className="text-sm text-gray-500">{config.area}</p>
                                                </div>
                                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                                    {config.available} units
                                                </Badge>
                                            </div>
                                            <div className="flex items-baseline mb-3">
                                                <IndianRupee className="h-4 w-4 text-primary mr-1" />
                                                <span className="text-xl md:text-2xl font-bold">{config.price}</span>
                                            </div>
                                            {(!isAdmin && user?.role !== 'admin') && (
                                                <Button className="w-full" onClick={handleEnquiry}>
                                                    <MessageCircle className="h-4 w-4 mr-2" />
                                                    Enquire Now
                                                </Button>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-2 py-8 text-center bg-gray-50 rounded-lg border-2 border-dashed">
                                        <Home className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                                        <p className="text-gray-500">No specific configurations listed yet.</p>
                                    </div>
                                )}
                            </div>
                        </Card>

                        {/* Amenities */}
                        <Card className="p-4 sm:p-6 overflow-hidden">
                            <h2 className="text-2xl font-black text-primary mb-6">World-Class Amenities</h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-6">
                                {(project.amenities && project.amenities.length > 0) ? (
                                    project.amenities.map((amenity, index) => {
                                        // Dynamic icon mapping
                                        const IconMap = {
                                            'Waves': Waves,
                                            'Dumbbell': Dumbbell,
                                            'Users': Users,
                                            'Trees': Trees,
                                            'Car': Car,
                                            'Shield': Shield,
                                            'Building2': Building2,
                                            'Home': Home,
                                            'Swimming Pool': Waves,
                                            'Gym': Dumbbell,
                                            'Security': Shield,
                                            'Garden': Trees,
                                            'Parking': Car,
                                            'Club House': Building2
                                        };
                                        const AmenityIcon = IconMap[amenity.icon] || IconMap[amenity.name] || CheckCircle;

                                        return (
                                            <div key={index} className="flex flex-col items-center p-3 sm:p-5 bg-white border border-gray-100 dark:bg-gray-800 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                                                <div className="h-10 w-10 sm:h-12 sm:w-12 bg-primary/10 rounded-full flex items-center justify-center mb-2 sm:mb-3">
                                                    <AmenityIcon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                                                </div>
                                                <span className="text-[11px] sm:text-sm font-bold text-center text-gray-700 dark:text-gray-300 line-clamp-1">
                                                    {amenity.name}
                                                </span>
                                            </div>
                                        );
                                    })
                                ) : (
                                    (project.features || []).map((feature, index) => (
                                        <div key={index} className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                            <CheckCircle className="h-5 w-5 text-green-500" />
                                            <span className="text-sm">{feature}</span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </Card>

                        {/* Specifications */}
                        <Card className="p-6">
                            <h2 className="text-2xl font-semibold mb-6">Technical Specifications</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                {(project.specifications && project.specifications.length > 0) ? (
                                    project.specifications.map((spec, index) => (
                                        <div key={index} className="flex flex-row items-center justify-between p-3 sm:p-4 bg-gray-50 dark:bg-gray-800 rounded-xl group hover:bg-white hover:shadow-sm border border-gray-100/50 dark:border-gray-700/50 transition-all gap-4">
                                            <span className="text-gray-500 dark:text-gray-400 text-[10px] md:text-xs font-bold uppercase tracking-wider whitespace-nowrap">
                                                {spec.label || spec.type}
                                            </span>
                                            <span className="font-black text-gray-900 dark:text-white text-xs md:text-sm text-right break-words">
                                                {spec.value}
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    ['Structure', 'Flooring', 'Doors', 'Electrical'].map((item) => (
                                        <div key={item} className="flex justify-between p-3 sm:p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                                            <span className="text-gray-600 dark:text-gray-400 text-xs font-medium">{item}</span>
                                            <span className="font-bold text-xs uppercase tracking-tight">RCC Framed</span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </Card>

                        {/* Virtual Tour Management - Admin Only */}
                        {isAdmin && (
                            <div className="my-8">
                                <VirtualTourManager
                                    projectId={id}
                                    projectName={project.name}
                                    onUpdate={handleVirtualTourUpdate}
                                />
                            </div>
                        )}

                        {/* Location & Map Section */}
                        <Card className="p-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                                <div className="flex items-center space-x-2">
                                    <Map className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                                    <h2 className="text-xl md:text-2xl font-semibold">Location & Connectivity</h2>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full sm:w-auto"
                                    onClick={() => {
                                        const destination = encodeURIComponent(project.location?.address || project.location || '');
                                        window.open(`https://www.google.com/maps/dir/?api=1&destination=${destination}`, '_blank');
                                    }}
                                >
                                    <Navigation className="h-4 w-4 mr-2" />
                                    Get Directions
                                </Button>
                            </div>

                            {/* Google Map Integration */}
                            <GoogleMap
                                location={project.location}
                                coordinates={project.location}
                                nearbyPlaces={project.nearbyPlaces}
                                projectName={project.name}
                                address={project.location?.address || project.location || ''}
                                height="500px"
                                className="mb-6"
                            />

                            {/* Location Highlights */}
                            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-primary/10">
                                <h3 className="font-semibold mb-3 flex items-center">
                                    <MapPin className="h-5 w-5 mr-2 text-primary" />
                                    Location Advantages
                                </h3>
                                <div className="grid md:grid-cols-2 gap-3">
                                    <div className="flex items-center space-x-2">
                                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                                        <span className="text-sm">Prime location in IT corridor</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                                        <span className="text-sm">Excellent connectivity to ORR</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                                        <span className="text-sm">Close to schools & hospitals</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                                        <span className="text-sm">Metro connectivity (upcoming)</span>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-4 space-y-4">
                            {/* Contact Card */}
                            {!isAdmin && (
                                <Card className="p-6">
                                    <div className="space-y-3">
                                        {(user) && (
                                            <>
                                                <Button className="w-full shadow-lg" onClick={handleEnquiry}>
                                                    <MessageCircle className="h-4 w-4 mr-2" />
                                                    Send Enquiry
                                                </Button>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <Button variant="outline" className="w-full" onClick={handleCallNow}>
                                                        <Phone className="h-4 w-4 mr-2" />
                                                        Call
                                                    </Button>
                                                    <Button variant="outline" className="w-full" onClick={handleScheduleVisit}>
                                                        <Calendar className="h-4 w-4 mr-2" />
                                                        Visit
                                                    </Button>
                                                </div>
                                            </>
                                        )}
                                        <Button variant="outline" className="w-full" onClick={handleDownloadBrochure}>
                                            <Download className="h-4 w-4 mr-2" />
                                            Download Brochure
                                        </Button>
                                    </div>
                                </Card>
                            )}

                            {/* EMI Calculator */}
                            <Card className="p-6">
                                <h3 className="font-semibold text-lg mb-4">EMI Calculator</h3>
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-sm text-gray-500">Loan Amount</label>
                                        <Input type="number" placeholder="50,00,000" />
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-500">Interest Rate (%)</label>
                                        <Input type="number" placeholder="8.5" />
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-500">Tenure (Years)</label>
                                        <Input type="number" placeholder="20" />
                                    </div>
                                    <Button
                                        className="w-full"
                                        onClick={() => {
                                            const amount = project.pricing?.basePrice || 5000000;
                                            const path = isAdmin ? `/admin/emi` : `/dashboard/emi`;
                                            navigate(`${path}?amount=${amount}`);
                                        }}
                                    >
                                        Calculate EMI
                                    </Button>
                                </div>
                            </Card>

                            {/* Similar Properties */}
                            <Card className="p-6">
                                <h3 className="font-semibold text-lg mb-4">Similar Properties</h3>
                                <div className="space-y-4">
                                    {projects.filter(p => p._id !== id).slice(0, 3).map((property) => (
                                        <motion.div
                                            key={property._id}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            className="flex space-x-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-gray-100"
                                            onClick={() => {
                                                navigate(isAdmin ? `/admin/projects/${property._id}` : `/projects/${property._id}`);
                                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                            }}
                                        >
                                            <img
                                                src={property.images && property.images.length > 0 ? (property.images[0].url || property.images[0]) : "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=200"}
                                                alt={property.name}
                                                className="w-20 h-20 rounded-lg object-cover shadow-sm"
                                            />
                                            <div className="flex-1">
                                                <p className="font-bold text-sm text-gray-900 dark:text-gray-100">{property.name}</p>
                                                <p className="text-xs text-gray-500 mb-1 line-clamp-1">{property.location?.address || property.location}</p>
                                                <div className="flex items-center justify-between mt-1">
                                                    <p className="text-sm font-bold text-primary">₹{(property.pricing?.basePrice / 100000).toFixed(1)}L</p>
                                                    <Badge variant="outline" className="text-[10px] px-1 h-5 capitalize">{property.type}</Badge>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}

                                    {(!Array.isArray(projects) || projects.length <= 1) && (
                                        <div className="text-center py-4">
                                            <Building2 className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                                            <p className="text-xs text-gray-400">No other properties available right now.</p>
                                        </div>
                                    )}
                                </div>
                                <Button
                                    variant="outline"
                                    className="w-full mt-6"
                                    onClick={() => navigate(isAdmin ? '/admin/projects' : '/projects')}
                                >
                                    Explore More
                                    <ChevronRight className="h-4 w-4 ml-1" />
                                </Button>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
            <ScheduleVisitModal
                isOpen={isVisitModalOpen}
                onClose={() => setIsVisitModalOpen(false)}
                projectName={project.name}
                projectLocation={project.location?.address || project.location}
                projectId={id}
            />

            {/* Virtual Tour Viewer */}
            {showVirtualTour && virtualTourData && (
                <VirtualTourViewer
                    projectId={id}
                    virtualTourData={virtualTourData}
                    onClose={() => setShowVirtualTour(false)}
                />
            )}
        </div>
    );
};

export default ProjectDetailPage;
