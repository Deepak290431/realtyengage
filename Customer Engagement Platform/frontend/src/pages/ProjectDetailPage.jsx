import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
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

import projectService from '../services/projectService';

const ProjectDetailPage = ({ isAdmin = false }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);

    const [project, setProject] = useState(null);
    const [projects, setProjects] = useState([]); // For similar properties
    const [loading, setLoading] = useState(true);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isSaved, setIsSaved] = useState(false);
    const [showEnquiryForm, setShowEnquiryForm] = useState(false);
    const [isVisitModalOpen, setIsVisitModalOpen] = useState(false);

    useEffect(() => {
        const fetchProject = async () => {
            try {
                setLoading(true);
                const [projectRes, projectsRes] = await Promise.all([
                    projectService.getProject(id),
                    projectService.getProjects()
                ]);

                // Handle various response formats
                setProject(projectRes.data?.data || projectRes.data || projectRes);
                setProjects(projectsRes.data?.data || projectsRes.data || projectsRes || []);
            } catch (error) {
                console.error('Failed to fetch project:', error);
                toast.error('Failed to load project details');
                navigate('/projects');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchProject();
        }
    }, [id, navigate]);

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
        ? project.images.map(img => img.url || img)
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
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Image Gallery */}
            <div className="relative h-[500px] bg-black">
                <img
                    src={images[currentImageIndex]}
                    alt={project.name}
                    className="w-full h-full object-cover transition-opacity duration-500"
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
                <div className="absolute top-4 right-4 flex space-x-2">
                    <button
                        onClick={handleSave}
                        className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
                    >
                        <Heart className={`h-6 w-6 ${isSaved ? 'fill-red-500 text-red-500' : 'text-white'}`} />
                    </button>
                    <button
                        onClick={handleShare}
                        className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
                    >
                        <Share2 className="h-6 w-6 text-white" />
                    </button>
                </div>

                {/* Project Info Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8 text-white text-shadow-lg bg-gradient-to-t from-black/80 to-transparent">
                    <div className="w-full px-4 md:px-10 lg:px-16">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <Badge className="bg-blue-600 text-white mb-2 uppercase tracking-wide">
                                    <Clock className="h-3 w-3 mr-1" />
                                    {project.status?.replace('_', ' ')}
                                </Badge>
                                <h1 className="text-2xl md:text-4xl font-black mb-2">{project.name}</h1>
                                <div className="flex items-center space-x-4 text-lg text-white/90">
                                    <span className="flex items-center">
                                        <MapPin className="h-5 w-5 mr-1" />
                                        {project.location?.address || project.location}
                                    </span>
                                    <span className="flex items-center">
                                        <Star className="h-5 w-5 mr-1 fill-yellow-400 text-yellow-400" />
                                        {project.rating || '4.5'} ({project.reviews || 0} reviews)
                                    </span>
                                </div>
                            </div>

                            {/* Admin Actions */}
                            {isAdmin && (
                                <div className="flex space-x-2">
                                    <Button
                                        variant="secondary"
                                        onClick={() => navigate(`/admin/projects/edit/${project._id}`)}
                                    >
                                        <Edit className="h-4 w-4 mr-2" />
                                        Edit Project
                                    </Button>
                                    <Button
                                        variant="destructive"
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
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="w-full px-4 md:px-10 lg:px-16 py-8">
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Price & Quick Info */}
                        <Card className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <div className="flex items-baseline mb-2">
                                        <IndianRupee className="h-8 w-8 text-primary" />
                                        <span className="text-4xl font-bold">{(project.pricing?.basePrice / 100000).toFixed(1)}</span>
                                        <span className="text-xl text-gray-500 ml-2">Lakhs onwards</span>
                                    </div>
                                    <p className="text-sm text-gray-500">Starting Price</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-500">RERA ID</p>
                                    <p className="font-mono text-sm uppercase">{project.reraId || 'PRM/KA/RERA/1251'}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                                <div>
                                    <p className="text-sm text-gray-500 text-[10px] uppercase font-bold tracking-wider">Property Type</p>
                                    <p className="font-semibold capitalize">{project.type}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 text-[10px] uppercase font-bold tracking-wider">Developer</p>
                                    <p className="font-semibold">{project.developer?.name || 'Prestige Group'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 text-[10px] uppercase font-bold tracking-wider">Completion</p>
                                    <p className="font-semibold">{project.completionDate ? new Date(project.completionDate).toLocaleDateString() : 'Dec 2025'}</p>
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
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-2xl font-semibold">Available Configurations</h2>
                                {isAdmin && (
                                    <Button
                                        onClick={() => {
                                            toast.success('Add configuration form opened');
                                            // Navigate to add configuration page or open modal
                                        }}
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Configuration
                                    </Button>
                                )}
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                                {(project.configurations && project.configurations.length > 0) ? (
                                    project.configurations.map((config, index) => (
                                        <div key={index} className="p-4 border rounded-lg hover:border-primary transition-colors relative group">
                                            {isAdmin && (
                                                <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => toast.success('Edit configuration')}
                                                        className="p-1 bg-blue-100 hover:bg-blue-200 rounded"
                                                    >
                                                        <Edit className="h-3 w-3 text-blue-600" />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            if (window.confirm('Delete this configuration?')) {
                                                                toast.success('Configuration deleted');
                                                            }
                                                        }}
                                                        className="p-1 bg-red-100 hover:bg-red-200 rounded"
                                                    >
                                                        <Trash2 className="h-3 w-3 text-red-600" />
                                                    </button>
                                                </div>
                                            )}
                                            <div className="flex justify-between items-start mb-3">
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
                                                <span className="text-2xl font-bold">{config.price}</span>
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
                        <Card className="p-6">
                            <h2 className="text-2xl font-semibold mb-6">World-Class Amenities</h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
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
                                            <div key={index} className="flex flex-col items-center p-5 bg-white border border-gray-100 dark:bg-gray-800 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                                                <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                                                    <AmenityIcon className="h-6 w-6 text-primary" />
                                                </div>
                                                <span className="text-sm font-medium text-center text-gray-700 dark:text-gray-300">
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
                            <div className="grid md:grid-cols-2 gap-4">
                                {(project.specifications && project.specifications.length > 0) ? (
                                    project.specifications.map((spec, index) => (
                                        <div key={index} className="flex justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl group hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-100 transition-all">
                                            <span className="text-gray-600 dark:text-gray-400 font-medium">
                                                {spec.label || spec.type}
                                            </span>
                                            <span className="font-bold text-gray-900 dark:text-gray-100">{spec.value}</span>
                                        </div>
                                    ))
                                ) : (
                                    ['Structure', 'Flooring', 'Doors', 'Electrical', 'Plumbing', 'Painting'].map((item) => (
                                        <div key={item} className="flex justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                                            <span className="text-gray-600 dark:text-gray-400 font-medium">{item}</span>
                                            <span className="font-bold">RCC Framed Structure</span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </Card>

                        {/* Location & Map Section */}
                        <Card className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center space-x-2">
                                    <Map className="h-6 w-6 text-primary" />
                                    <h2 className="text-2xl font-semibold">Location & Connectivity</h2>
                                </div>
                                <Button
                                    variant="outline"
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
                            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg">
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
                            <Card className="p-6">
                                <h3 className="font-semibold text-lg mb-4">Contact Builder</h3>
                                <div className="space-y-3">
                                    {(user) && (
                                        <>
                                            <Button className="w-full" onClick={handleEnquiry}>
                                                <MessageCircle className="h-4 w-4 mr-2" />
                                                Send Enquiry
                                            </Button>
                                            <Button variant="outline" className="w-full" onClick={handleCallNow}>
                                                <Phone className="h-4 w-4 mr-2" />
                                                Call Now
                                            </Button>
                                            <Button variant="outline" className="w-full" onClick={handleScheduleVisit}>
                                                <Video className="h-4 w-4 mr-2" />
                                                Schedule Visit
                                            </Button>
                                        </>
                                    )}
                                    <Button variant="outline" className="w-full" onClick={handleDownloadBrochure}>
                                        <Download className="h-4 w-4 mr-2" />
                                        Download Brochure
                                    </Button>
                                </div>
                            </Card>

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
                                    <Button className="w-full" onClick={() => navigate('/dashboard/payments?tab=calculator')}>
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
            />
        </div>
    );
};

export default ProjectDetailPage;
