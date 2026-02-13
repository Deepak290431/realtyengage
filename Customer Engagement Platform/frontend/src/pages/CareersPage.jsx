import React from 'react';
import { motion } from 'framer-motion';
import { Briefcase, MapPin, ArrowRight, TrendingUp, Users, Heart } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';

const CareersPage = () => {
    const jobs = [
        {
            title: 'Senior Property Consultant',
            location: 'Coimbatore, TN',
            type: 'Full-time',
            department: 'Sales'
        },
        {
            title: 'Real Estate Analyst',
            location: 'Remote / Bangalore',
            type: 'Full-time',
            department: 'Analysis'
        },
        {
            title: 'Customer Success Manager',
            location: 'Coimbatore, TN',
            type: 'Hybrid',
            department: 'Operations'
        },
        {
            title: 'Digital Marketing Specialist',
            location: 'Coimbatore, TN',
            type: 'Full-time',
            department: 'Marketing'
        }
    ];

    const perks = [
        { icon: TrendingUp, title: 'Growth potential', desc: 'Accelerate your career in a fast-growing company.' },
        { icon: Users, title: 'Great culture', desc: 'Work with a passionate and supportive team.' },
        { icon: Heart, title: 'Benefits', desc: 'Comprehensive health and wellness packages.' }
    ];

    return (
        <div className="min-h-screen bg-white dark:bg-gray-950">
            {/* Hero */}
            <section className="bg-gray-900 text-white py-24 px-4 overflow-hidden relative">
                <div className="container mx-auto max-w-4xl text-center relative z-10">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl md:text-7xl font-bold mb-6"
                    >
                        Join the <span className="text-blue-500">Realty</span> Team
                    </motion.h1>
                    <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
                        We're looking for passionate individuals to help us redefine the real estate experience in India.
                    </p>
                    <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                        View Openings
                    </Button>
                </div>
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-blue-700/10 rounded-full blur-3xl"></div>
            </section>

            {/* Perks */}
            <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
                <div className="container mx-auto">
                    <div className="grid md:grid-cols-3 gap-8">
                        {perks.map((perk, index) => (
                            <div key={index} className="text-center p-6">
                                <div className="h-16 w-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                    <perk.icon className="h-8 w-8 text-blue-600" />
                                </div>
                                <h3 className="text-xl font-bold mb-2">{perk.title}</h3>
                                <p className="text-gray-500">{perk.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Current Openings */}
            <section className="py-20 px-4">
                <div className="container mx-auto max-w-5xl">
                    <h2 className="text-3xl font-bold mb-8 text-center text-gray-900 dark:text-gray-100">Current Openings</h2>
                    <div className="space-y-4">
                        {jobs.map((job, index) => (
                            <Card key={index} className="p-6 hover:shadow-lg transition-shadow border-gray-100 dark:border-gray-800">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex items-start space-x-4">
                                        <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                                            <Briefcase className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold">{job.title}</h3>
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                <Badge variant="outline" className="flex items-center">
                                                    <MapPin className="h-3 w-3 mr-1" /> {job.location}
                                                </Badge>
                                                <Badge variant="secondary">{job.type}</Badge>
                                                <Badge variant="outline">{job.department}</Badge>
                                            </div>
                                        </div>
                                    </div>
                                    <Button variant="outline" className="flex items-center">
                                        Apply Now <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer CTA */}
            <section className="py-20 bg-blue-600 text-white text-center px-4">
                <h2 className="text-3xl font-bold mb-6">Don't see a fit?</h2>
                <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
                    We're always looking for talented people. Send us your resume anyway!
                </p>
                <Button variant="outline" className="text-white border-white hover:bg-white/10">
                    Send General Application
                </Button>
            </section>
        </div>
    );
};

export default CareersPage;
