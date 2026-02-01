import React from 'react';
import { motion } from 'framer-motion';
import {
    Building,
    Users,
    Award,
    Target,
    TrendingUp,
    CheckCircle2,
    MapPin,
    Heart
} from 'lucide-react';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';

const AboutPage = () => {
    const stats = [
        { value: '500+', label: 'Happy Families', icon: Heart },
        { value: '50+', label: 'Premium Projects', icon: Building },
        { value: '15+', label: 'Years Experience', icon: Award },
        { value: '100%', label: 'Transparency', icon: CheckCircle2 },
    ];

    const milestones = [
        { year: '2010', title: 'The Beginning', desc: 'RealtyEngage was founded with a vision to redefine real estate transparency.' },
        { year: '2015', title: 'Major Expansion', desc: 'Successfully delivered our first 10 gated community projects in Bangalore.' },
        { year: '2020', title: 'Tech Innovation', desc: 'Launched our digital customer engagement platform for seamless interactions.' },
        { year: '2024', title: 'Coimbatore Launch', desc: 'Expanding our premium footprint to the Manchester of South India.' },
    ];

    return (
        <div className="min-h-screen bg-white dark:bg-gray-950">
            {/* Hero Section */}
            <section className="relative h-[60vh] flex items-center justify-center overflow-hidden bg-gray-900">
                <img
                    src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1600"
                    alt="Modern Architecture"
                    className="absolute inset-0 w-full h-full object-cover opacity-40"
                />
                <div className="relative z-10 text-center text-white px-4">
                    <motion.h1
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-5xl md:text-7xl font-bold mb-6"
                    >
                        Our Story
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto"
                    >
                        Building Trust, Delivering Excellence, and Creating Spaces
                        Where Life Happens and Memories are Made.
                    </motion.p>
                </div>
            </section>

            {/* Vision & Mission */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <Badge className="mb-4" variant="secondary">Who We Are</Badge>
                            <h2 className="text-4xl font-bold mb-6 text-gray-900">Redefining Real Estate Engagement</h2>
                            <p className="text-lg text-gray-700 dark:text-gray-400 mb-6 leading-relaxed font-medium">
                                RealtyEngage is more than just a property developer. We are a team of architects,
                                engineers, and visionaries dedicated to creating sustainable and premium living spaces.
                                With over a decade of experience, we have mastered the art of balancing luxury with
                                functionality.
                            </p>
                            <div className="space-y-4">
                                <div className="flex items-center space-x-3">
                                    <Target className="h-6 w-6 text-blue-600" />
                                    <span className="font-semibold text-lg text-gray-800 dark:text-gray-200">Our Mission:</span>
                                    <span className="text-gray-600 dark:text-gray-400">To make dream homes accessible through transparent processes.</span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <TrendingUp className="h-6 w-6 text-purple-600" />
                                    <span className="font-semibold text-lg text-gray-800 dark:text-gray-200">Our Vision:</span>
                                    <span className="text-gray-600 dark:text-gray-400">To be the most trusted real estate brand in India by 2030.</span>
                                </div>
                            </div>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="relative rounded-3xl overflow-hidden shadow-2xl h-[400px]"
                        >
                            <img
                                src="https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800"
                                alt="Luxury Home"
                                className="w-full h-full object-cover"
                            />
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-20 bg-gray-50 dark:bg-gray-900">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {stats.map((stat, index) => {
                            const Icon = stat.icon;
                            return (
                                <motion.div
                                    key={index}
                                    whileHover={{ y: -10 }}
                                    className="text-center"
                                >
                                    <div className="h-16 w-16 bg-white dark:bg-gray-800 rounded-2xl shadow-lg flex items-center justify-center mx-auto mb-6 text-blue-600">
                                        <Icon className="h-8 w-8" />
                                    </div>
                                    <h3 className="text-4xl font-bold mb-2 text-gray-900">{stat.value}</h3>
                                    <p className="text-gray-700 font-bold uppercase tracking-tight">{stat.label}</p>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Timeline Section */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold mb-4 text-gray-900">The Journey So Far</h2>
                        <p className="text-gray-700 dark:text-gray-400 max-w-2xl mx-auto font-medium">From a small startup to a leading real estate firm, our growth has been fueled by your trust.</p>
                    </div>
                    <div className="grid md:grid-cols-4 gap-6">
                        {milestones.map((item, index) => (
                            <Card key={index} className="p-6 relative overflow-hidden border-t-4 border-t-blue-600">
                                <span className="text-5xl font-bold text-gray-100 absolute -bottom-2 -right-2 z-0">{item.year}</span>
                                <div className="relative z-10">
                                    <h4 className="text-xl font-bold mb-3 text-gray-900">{item.title}</h4>
                                    <p className="text-sm text-gray-700 dark:text-gray-400 font-medium">{item.desc}</p>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Contact CTA */}
            <section className="py-20 bg-blue-600 text-white">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-4xl font-bold mb-6">Experience Excellence with Us</h2>
                    <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">Our team is ready to help you find your perfect investment or dream home.</p>
                    <div className="flex justify-center space-x-4">
                        <button className="px-8 py-3 bg-white text-blue-600 font-bold rounded-lg hover:bg-gray-100 transition-colors">
                            Our Projects
                        </button>
                        <button className="px-8 py-3 bg-transparent border-2 border-white text-white font-bold rounded-lg hover:bg-white/10 transition-colors">
                            Contact Us
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default AboutPage;
