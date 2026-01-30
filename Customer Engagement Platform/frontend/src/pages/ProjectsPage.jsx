import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  MapPin,
  Home,
  IndianRupee,
  Bed,
  Square,
  Building2,
  Grid,
  List,
  SlidersHorizontal,
  Star,
  Heart,
  Eye,
  Phone,
  MessageCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  Plus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';

import projectService from '../services/projectService';

const ProjectsPage = ({ isAdmin = false }) => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [savedProjects, setSavedProjects] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const projectsPerPage = 6;

  // Filter states
  const [filters, setFilters] = useState({
    priceRange: { min: 0, max: 1000 },
    propertyType: [],
    status: []
  });

  // Fetch projects from API
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const data = await projectService.getProjects();
        // Handle both standardized response { success, data } and direct array
        const projectsList = Array.isArray(data) ? data : (data.data?.data || data.data || []);
        console.log('Fetched Projects:', projectsList);
        setProjects(projectsList);
        setFilteredProjects(projectsList);
      } catch (error) {
        console.error('Failed to fetch projects:', error);
        toast.error('Failed to load projects');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // Filter functionality
  useEffect(() => {
    let result = [...projects];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(project =>
        project.name?.toLowerCase().includes(query) ||
        project.location?.address?.toLowerCase().includes(query) ||
        project.location?.toLowerCase?.().includes(query) ||
        project.developer?.name?.toLowerCase().includes(query) ||
        project.builder?.toLowerCase().includes(query)
      );
    }

    // Price filter (handling different price structures)
    result = result.filter(project => {
      const price = project.pricing?.basePrice ? project.pricing.basePrice / 100000 : (project.price?.min || 0); // Convert to Lakhs
      return price >= filters.priceRange.min && price <= filters.priceRange.max;
    });

    // Property type filter
    if (filters.propertyType.length > 0) {
      result = result.filter(project =>
        filters.propertyType.includes(project.type || 'Apartment')
      );
    }

    // Status filter
    if (filters.status.length > 0) {
      result = result.filter(project =>
        filters.status.includes(project.status)
      );
    }

    setFilteredProjects(result);
    setCurrentPage(1); // Reset to first page on filter change
  }, [searchQuery, filters, projects]);

  // Pagination
  const indexOfLastProject = currentPage * projectsPerPage;
  const indexOfFirstProject = indexOfLastProject - projectsPerPage;
  const currentProjects = filteredProjects.slice(indexOfFirstProject, indexOfLastProject);
  const totalPages = Math.ceil(filteredProjects.length / projectsPerPage);

  const toggleSaveProject = (projectId) => {
    setSavedProjects(prev => {
      if (prev.includes(projectId)) {
        toast.success('Removed from saved properties');
        return prev.filter(id => id !== projectId);
      } else {
        toast.success('Property saved successfully');
        return [...prev, projectId];
      }
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ready':
      case 'completed': return 'text-green-600 bg-green-50';
      case 'ongoing':
      case 'in_progress': return 'text-blue-600 bg-blue-50';
      case 'upcoming': return 'text-purple-600 bg-purple-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'ready':
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'ongoing':
      case 'in_progress': return <Clock className="h-4 w-4" />;
      case 'upcoming': return <TrendingUp className="h-4 w-4" />;
      default: return null;
    }
  };

  const handleEnquiry = (projectId) => {
    if (user) {
      navigate(`/dashboard/enquiries?project=${projectId}`);
    } else {
      toast.error('Please login to make an enquiry');
      navigate('/login', { state: { from: `/dashboard/enquiries?project=${projectId}` } });
    }
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
      {/* Hero Section */}
      {/* Hero Section */}
      {isAdmin ? (
        <div className="w-full px-4 md:px-10 lg:px-16 py-8">
          <div className="mb-0">
            <h1 className="text-3xl font-black bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Property Management
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1 font-bold">
              Manage your property listings and details
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16 w-full flex flex-col items-center">
          <div className="w-full px-4 md:px-10 lg:px-16 text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl md:text-5xl font-black mb-4"
            >
              Discover Your Dream Property
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg md:text-xl font-bold mb-8 text-white/90"
            >
              {filteredProjects.length} Premium Properties Available
            </motion.p>

            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-2xl mx-auto relative group"
            >
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors h-6 w-6 z-10" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search location, project, or type..."
                className="w-full pl-14 pr-6 h-16 bg-white/10 backdrop-blur-xl border-white/20 text-white placeholder:text-white/60 rounded-full text-lg focus:bg-white focus:text-gray-900 focus:ring-4 focus:ring-blue-500/20 transition-all shadow-2xl"
              />
            </motion.div>
          </div>
        </div>
      )}
      <div className="sticky top-0 z-40 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 w-full">
        <div className="w-full px-4 md:px-10 lg:px-16 py-3">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center space-x-3">
              {isAdmin && (
                <Button
                  onClick={() => navigate('/admin/projects/new')}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Project
                </Button>
              )}
              <Button
                variant={showFilters ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2"
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span>Filters</span>
                {(filters.propertyType.length > 0 || filters.status.length > 0) && (
                  <Badge className="ml-1">
                    {filters.propertyType.length + filters.status.length}
                  </Badge>
                )}
              </Button>

              <div className="flex items-center space-x-1 border rounded-lg p-1">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="px-3"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="px-3"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <span>Showing {currentProjects.length} of {filteredProjects.length} properties</span>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full px-4 md:px-10 lg:px-16 py-8">
        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="w-80 flex-shrink-0"
              >
                <Card className="p-6 sticky top-24">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Filters</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setFilters({
                        priceRange: { min: 0, max: 1000 },
                        propertyType: [],
                        status: []
                      })}
                    >
                      Clear All
                    </Button>
                  </div>

                  {/* Price Range */}
                  <div className="mb-6">
                    <label className="text-sm font-medium mb-2 block">Price Range (Lakhs)</label>
                    <div className="flex items-center space-x-2">
                      <Input
                        type="number"
                        placeholder="Min"
                        value={filters.priceRange.min}
                        onChange={(e) => setFilters({ ...filters, priceRange: { ...filters.priceRange, min: parseInt(e.target.value) || 0 } })}
                        className="w-full"
                      />
                      <span>-</span>
                      <Input
                        type="number"
                        placeholder="Max"
                        value={filters.priceRange.max}
                        onChange={(e) => setFilters({ ...filters, priceRange: { ...filters.priceRange, max: parseInt(e.target.value) || 1000 } })}
                        className="w-full"
                      />
                    </div>
                  </div>

                  {/* Property Type */}
                  <div className="mb-6">
                    <label className="text-sm font-medium mb-2 block">Property Type</label>
                    <div className="space-y-2">
                      {['Apartment', 'Villa', 'Penthouse', 'Plot'].map(type => (
                        <label key={type} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={filters.propertyType.includes(type)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFilters({ ...filters, propertyType: [...filters.propertyType, type] });
                              } else {
                                setFilters({ ...filters, propertyType: filters.propertyType.filter(t => t !== type) });
                              }
                            }}
                            className="rounded text-primary"
                          />
                          <span className="text-sm">{type}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Status */}
                  <div className="mb-6">
                    <label className="text-sm font-medium mb-2 block">Status</label>
                    <div className="space-y-2">
                      {[
                        { value: 'ready', label: 'Ready to Move' },
                        { value: 'in_progress', label: 'Under Construction' },
                        { value: 'upcoming', label: 'Upcoming Projects' }
                      ].map(status => (
                        <label key={status.value} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={filters.status.includes(status.value)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFilters({ ...filters, status: [...filters.status, status.value] });
                              } else {
                                setFilters({ ...filters, status: filters.status.filter(s => s !== status.value) });
                              }
                            }}
                            className="rounded text-primary"
                          />
                          <span className="text-sm">{status.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Projects Grid */}
          <div className="flex-1">
            {currentProjects.length === 0 ? (
              <Card className="p-12 text-center">
                <Building2 className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-semibold mb-2">No Properties Found</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Try adjusting your filters or search criteria.
                </p>
                <Button onClick={() => {
                  setSearchQuery('');
                  setFilters({ priceRange: { min: 0, max: 1000 }, propertyType: [], status: [] });
                }}>
                  Clear Filters
                </Button>
              </Card>
            ) : (
              <>
                <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
                  {currentProjects.map((project) => (
                    <motion.div
                      key={project._id || project.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ y: -4 }}
                    >
                      <Card className="overflow-hidden hover:shadow-xl transition-all duration-300">
                        <div className="relative h-48 overflow-hidden">
                          <img
                            src={project.images && project.images.length > 0 ? (project.images[0].url || project.images[0]) : (project.image || "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800")}
                            alt={project.name}
                            className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                          />
                          <Badge className={`absolute top-3 right-3 ${getStatusColor(project.status)}`}>
                            {getStatusIcon(project.status)}
                            <span className="ml-1 capitalize">{project.status?.replace('_', ' ')}</span>
                          </Badge>
                          <button
                            onClick={() => toggleSaveProject(project._id || project.id)}
                            className="absolute top-3 left-3 p-2 rounded-full bg-white/90 hover:bg-white transition-colors"
                          >
                            <Heart
                              className={`h-5 w-5 ${savedProjects.includes(project._id || project.id)
                                ? 'fill-red-500 text-red-500'
                                : 'text-gray-600'
                                }`}
                            />
                          </button>
                        </div>

                        <div className="p-4">
                          <h3 className="font-semibold text-lg mb-1">{project.name}</h3>
                          <div className="flex flex-col mb-3">
                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                              <MapPin className="h-4 w-4 mr-1" />
                              {project.location?.address || project.location || 'Bangalore'}
                            </div>
                          </div>

                          <div className="flex items-baseline mb-3">
                            <IndianRupee className="h-5 w-5 text-primary" />
                            <span className="text-2xl font-bold">
                              {project.pricing?.basePrice ? (project.pricing.basePrice / 100000).toFixed(1) : (project.price?.min || '0')}
                            </span>
                            <span className="text-sm text-gray-500 ml-1"> Lakhs</span>
                          </div>

                          <div className="grid grid-cols-2 gap-3 text-sm text-gray-600 dark:text-gray-400 mb-3">
                            <div className="flex items-center">
                              <Home className="h-4 w-4 mr-1" />
                              {project.dimensions?.units || project.units || '2, 3 BHK'}
                            </div>
                            <div className="flex items-center">
                              <Square className="h-4 w-4 mr-1" />
                              {project.area || project.dimensions?.totalArea + ' sqft'}
                            </div>
                          </div>

                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center text-sm">
                              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 mr-1" />
                              <span>{project.rating || '4.5'}</span>
                              <span className="text-gray-500 ml-1">({project.reviews || 0})</span>
                            </div>
                            <span className="text-sm text-gray-500">{project.developer?.name || project.builder || 'Developer'}</span>
                          </div>

                          <div className="flex space-x-2">
                            <Button
                              className="flex-1"
                              onClick={() => {
                                const projectId = project._id || project.id;
                                console.log('Navigating to project:', projectId, 'isAdmin:', isAdmin);
                                if (isAdmin) {
                                  navigate(`/admin/projects/${projectId}`)
                                } else {
                                  navigate(`/projects/${projectId}`)
                                }
                              }}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View Details
                            </Button>
                            {(!isAdmin && user?.role !== 'admin') && (
                              <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => handleEnquiry(project._id || project.id)}
                              >
                                <MessageCircle className="h-4 w-4 mr-2" />
                                Enquire Now
                              </Button>
                            )}
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center mt-8">
                    <div className="flex space-x-2">
                      {[...Array(totalPages)].map((_, index) => (
                        <Button
                          key={index + 1}
                          variant={currentPage === index + 1 ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setCurrentPage(index + 1)}
                        >
                          {index + 1}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div >
  );
};

export default ProjectsPage;
