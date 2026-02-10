import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import {
  Building,
  Home,
  Users,
  TrendingUp,
  Shield,
  Award,
  Clock,
  MapPin,
  ArrowRight,
  Play,
  Star,
  Check,
  Phone,
  Mail,
  Calendar,
  Sparkles,
  DollarSign,
  Key,
  HeadphonesIcon,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import projectService from '../services/projectService';

const HomePage = () => {
  const navigate = useNavigate();
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const controls = useAnimation();
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  useEffect(() => {
    if (inView) {
      controls.start('visible');
    }
  }, [controls, inView]);

  const stats = [
    { value: '500+', label: 'Happy Families', icon: Users },
    { value: '50+', label: 'Premium Projects', icon: Building },
    { value: '15+', label: 'Years Experience', icon: Award },
    { value: '24/7', label: 'Customer Support', icon: HeadphonesIcon },
  ];

  const features = [
    {
      icon: Home,
      title: 'Premium Properties',
      description: 'Handpicked luxury villas and apartments with world-class amenities',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Shield,
      title: 'Secure Transactions',
      description: 'End-to-end encrypted payments with multiple payment options',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: MapPin,
      title: 'Prime Locations',
      description: 'Strategic locations with excellent connectivity and infrastructure',
      color: 'from-green-500 to-teal-500',
    },
    {
      icon: TrendingUp,
      title: 'Investment Growth',
      description: 'Properties with high appreciation potential and rental yields',
      color: 'from-orange-500 to-red-500',
    },
  ];

  const testimonials = [
    {
      name: 'Deepakkumar',
      role: 'Business Owner',
      image: 'https://ui-avatars.com/api/?name=Deepak+Kumar&background=4F46E5&color=fff',
      content: 'RealtyEngage made my dream of owning a villa come true. The entire process was smooth and transparent.',
      rating: 5,
      project: 'Green Valley Villas',
    },
    {
      name: 'Dharnish RM',
      role: 'IT Professional',
      image: 'https://ui-avatars.com/api/?name=Dharnish+RM&background=EC4899&color=fff',
      content: 'Excellent service and support throughout. The team helped me find the perfect apartment within my budget.',
      rating: 5,
      project: 'Sky Heights Apartments',
    },
    {
      name: 'Jeeva',
      role: 'Software Engineer',
      image: 'https://ui-avatars.com/api/?name=Jeeva&background=10B981&color=fff',
      content: 'Professional team, quality construction, and timely delivery. Highly recommend RealtyEngage!',
      rating: 5,
      project: 'Sunrise Residency',
    },
  ];

  const [realProjects, setRealProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);

  useEffect(() => {
    const fetchFeaturedProjects = async () => {
      try {
        const response = await projectService.getProjects();
        const data = response.data || response;
        if (Array.isArray(data)) {
          setRealProjects(data.slice(0, 3));
        }
      } catch (error) {
        console.error('Failed to fetch projects for homepage');
      } finally {
        setLoadingProjects(false);
      }
    };
    fetchFeaturedProjects();
  }, []);

  const upcomingProjects = realProjects.length > 0 ? realProjects.map(p => ({
    id: p._id,
    name: p.name,
    location: p.location?.address || p.area,
    type: p.type || 'Property',
    price: `₹${(p.pricing?.basePrice / 100000).toFixed(1)} Lakhs`,
    image: p.images?.[0]?.url || p.images?.[0] || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
    status: p.status
  })) : [
    {
      id: '1',
      name: 'Lakeside Villas',
      location: 'Powai, Mumbai',
      type: '3 & 4 BHK Villas',
      price: 'Starting ₹2.5 Cr',
      image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800',
      status: 'upcoming',
    },
    {
      id: '2',
      name: 'Royal Gardens',
      location: 'Bandra, Mumbai',
      type: '2 & 3 BHK Apartments',
      price: 'Starting ₹1.8 Cr',
      image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
      status: 'in-progress',
    },
    {
      id: '3',
      name: 'Elite Towers',
      location: 'Andheri, Mumbai',
      type: 'Commercial Spaces',
      price: 'Starting ₹85 Lakhs',
      image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800',
      status: 'completed',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[#F8FAFC] dark:bg-gray-950">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="w-full px-4 md:px-16 lg:px-24 py-16 md:py-24 relative z-10">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Badge className="mb-4" variant="secondary">
                <Sparkles className="h-4 w-4 mr-2" />
                Welcome to the Future of Real Estate
              </Badge>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-6 md:mb-8 leading-[1.1] bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Find Your Dream Home with{' '}
                <span className="text-primary">
                  RealtyEngage
                </span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
                Discover premium villas, apartments, and commercial spaces with
                world-class amenities. Your journey to the perfect property starts here.
              </p>
              <div className="flex flex-wrap gap-5 mb-10">
                <Button
                  className="h-14 px-8 text-lg bg-primary hover:bg-primary/90 shadow-xl shadow-blue-500/20"
                  onClick={() => navigate('/projects')}
                >
                  <Home className="mr-3 h-6 w-6" />
                  Explore Properties
                </Button>
                <Button
                  className="h-14 px-8 text-lg text-gray-900 border-gray-300 hover:bg-gray-50 dark:text-white dark:border-gray-700 dark:hover:bg-gray-800"
                  variant="outline"
                  onClick={() => navigate('/register')}
                >
                  <Calendar className="mr-3 h-6 w-6" />
                  Schedule Visit
                </Button>
              </div>
              <div className="flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span>100% Verified Properties</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span>Best Price Guarantee</span>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-8 border-white dark:border-gray-800">
                <img
                  src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200"
                  alt="Luxury Villa"
                  className="w-full h-[400px] md:h-[600px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              </div>
              {/* Floating Cards */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 3 }}
                className="absolute -top-4 -right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3"
              >
                <div className="flex items-center space-x-2">
                  <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">ROI</p>
                    <p className="font-semibold text-gray-900 dark:text-white">15% Annually</p>
                  </div>
                </div>
              </motion.div>
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ repeat: Infinity, duration: 3, delay: 1 }}
                className="absolute -bottom-4 -left-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3"
              >
                <div className="flex items-center space-x-2">
                  <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                    <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Happy Customers</p>
                    <p className="font-semibold text-gray-900 dark:text-white">500+ Families</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-primary text-white mb-4">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-3xl font-bold mb-1 text-gray-900 dark:text-white">{stat.value}</h3>
                  <p className="text-gray-700 dark:text-gray-400 font-medium">{stat.label}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-center mb-12"
          >
            <Badge className="mb-4" variant="secondary">
              Why Choose Us
            </Badge>
            <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">Experience Excellence in Real Estate</h2>
            <p className="text-xl text-gray-700 dark:text-gray-400 max-w-3xl mx-auto font-medium">
              We provide comprehensive solutions for all your real estate needs with
              unmatched quality and service.
            </p>
          </motion.div>

          <motion.div
            ref={ref}
            variants={containerVariants}
            initial="hidden"
            animate={controls}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div key={index} variants={itemVariants}>
                  <Card className="h-full hover:shadow-xl transition-shadow duration-300 border-0">
                    <CardHeader>
                      <div className={`h-12 w-12 rounded-lg bg-gradient-to-r ${feature.color} flex items-center justify-center text-white mb-4`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <CardTitle className="text-gray-900 dark:text-white">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 dark:text-gray-400 font-medium">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Upcoming Projects */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-center mb-12"
          >
            <Badge className="mb-4" variant="secondary">
              Featured Properties
            </Badge>
            <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">Discover Our Premium Projects</h2>
            <p className="text-xl text-gray-700 dark:text-gray-400 max-w-3xl mx-auto font-medium">
              Explore our handpicked selection of luxury properties in prime locations
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {upcomingProjects.map((project, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="cursor-pointer"
                onClick={() => navigate(project.id ? `/projects/${project.id}` : '/projects')}
              >
                <Card className="overflow-hidden hover:shadow-2xl transition-shadow duration-300">
                  <div className="relative h-64">
                    <img
                      src={project.image}
                      alt={project.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 left-4">
                      <Badge
                        variant={
                          project.status === 'upcoming'
                            ? 'warning'
                            : project.status === 'in-progress'
                              ? 'info'
                              : 'success'
                        }
                      >
                        {project.status === 'upcoming' && 'Coming Soon'}
                        {project.status === 'in-progress' && 'Under Construction'}
                        {project.status === 'completed' && 'Ready to Move'}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{project.name}</h3>
                    <div className="flex items-center text-gray-700 dark:text-gray-400 mb-2 font-medium">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span className="text-sm">{project.location}</span>
                    </div>
                    <p className="text-gray-700 dark:text-gray-400 mb-3 font-semibold">{project.type}</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-primary">{project.price}</p>
                      </div>
                      <Button size="sm" variant="outline">
                        View Details
                        <ArrowRight className="ml-1 h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button
              size="lg"
              onClick={() => navigate('/projects')}
              className="bg-primary hover:bg-primary/90 text-white"
            >
              View All Projects
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-center mb-12"
          >
            <Badge className="mb-4" variant="secondary">
              Testimonials
            </Badge>
            <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">What Our Customers Say</h2>
            <p className="text-xl text-gray-700 dark:text-gray-400 max-w-3xl mx-auto font-medium">
              Join hundreds of satisfied families who found their dream homes with us
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            <Card className="p-8">
              <div className="flex items-center justify-between mb-6">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={prevTestimonial}
                  className="hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <div className="flex space-x-2">
                  {testimonials.map((_, index) => (
                    <div
                      key={index}
                      className={`h-2 w-2 rounded-full transition-colors duration-300 ${index === currentTestimonial
                        ? 'bg-primary'
                        : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                    />
                  ))}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={nextTestimonial}
                  className="hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </div>

              <motion.div
                key={currentTestimonial}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="text-center"
              >
                <img
                  src={testimonials[currentTestimonial].image}
                  alt={testimonials[currentTestimonial].name}
                  className="h-20 w-20 rounded-full mx-auto mb-4"
                />
                <div className="flex justify-center mb-4">
                  {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-primary fill-current" />
                  ))}
                </div>
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-6 italic">
                  "{testimonials[currentTestimonial].content}"
                </p>
                <h4 className="font-semibold text-lg">{testimonials[currentTestimonial].name}</h4>
                <p className="text-gray-600 dark:text-gray-400">{testimonials[currentTestimonial].role}</p>
                <Badge variant="secondary" className="mt-2">
                  {testimonials[currentTestimonial].project}
                </Badge>
              </motion.div>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-20 hero-gradient">
        <div className="w-full px-4 md:px-10 lg:px-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to Find Your Dream Home?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Get personalized property recommendations and exclusive deals.
              Start your journey with us today!
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button
                size="lg"
                variant="secondary"
                onClick={() => navigate('/register')}
              >
                <Key className="mr-2 h-5 w-5" />
                Get Started Free
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-white/10 text-white border-white hover:bg-white hover:text-purple-600"
                onClick={() => navigate('/contact')}
              >
                <Phone className="mr-2 h-5 w-5" />
                Contact Sales
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
