import React from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Building2,
    TrendingUp,
    ShieldCheck,
    Users,
    CheckCircle2,
    ArrowRight,
    PieChart,
    Home,
    FileText
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';

const ServicePage = () => {
    const location = useLocation();
    const isManagement = location.pathname.includes('management');

    const content = isManagement ? {
        title: 'Property Management',
        subtitle: 'Worry-free ownership with our expert management services.',
        icon: Building2,
        image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800',
        features: [
            {
                title: 'Tenant Management',
                desc: 'We handle everything from tenant screening to rent collection.',
                icon: Users
            },
            {
                title: 'Maintenance & Repairs',
                desc: 'Routine inspections and coordinates repairs with trusted vendors.',
                icon: ShieldCheck
            },
            {
                title: 'Financial Reporting',
                desc: 'Monthly statements and year-end tax documentation provided.',
                icon: PieChart
            }
        ],
        detailedDesc: 'Our property management team ensures that your investment continues to grow in value while you enjoy the returns without the day-to-day hassles.'
    } : {
        title: 'Investment Advisory',
        subtitle: 'Strategic real estate advice tailored to your financial goals.',
        icon: TrendingUp,
        image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
        features: [
            {
                title: 'Market Analysis',
                desc: 'Deep dives into location potential and upcoming infrastructure growth.',
                icon: PieChart
            },
            {
                title: 'Portfolio Strategy',
                desc: 'Diversify your real estate holdings across different property types.',
                icon: Home
            },
            {
                title: 'Risk Assessment',
                desc: 'Comprehensive due diligence and risk mitigation strategies.',
                icon: FileText
            }
        ],
        detailedDesc: 'RealtyEngage provides data-driven investment advice to help you maximize ROI and build a robust real estate portfolio for long-term wealth.'
    };

    return (
        <div className="min-h-screen bg-white dark:bg-gray-950">
            {/* Hero */}
            <section className="relative py-20 px-4">
                <div className="container mx-auto">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                        >
                            <div className="h-16 w-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
                                <content.icon className="h-8 w-8 text-blue-600" />
                            </div>
                            <h1 className="text-4xl md:text-6xl font-bold mb-6">{content.title}</h1>
                            <p className="text-xl text-gray-500 mb-8">{content.subtitle}</p>
                            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                                Talk to an Expert
                            </Button>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="rounded-3xl overflow-hidden shadow-2xl h-[400px]"
                        >
                            <img src={content.image} alt={content.title} className="w-full h-full object-cover" />
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100">
                <div className="container mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4">Our Approach</h2>
                        <p className="text-gray-500 max-w-2xl mx-auto">{content.detailedDesc}</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        {content.features.map((feature, index) => (
                            <Card key={index} className="p-8 hover:shadow-xl transition-shadow border-none shadow-sm dark:bg-gray-800">
                                <feature.icon className="h-10 w-10 text-blue-600 mb-6" />
                                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                                <p className="text-gray-500 dark:text-gray-400">{feature.desc}</p>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Benefits */}
            <section className="py-20 px-4">
                <div className="container mx-auto max-w-4xl">
                    <h2 className="text-3xl font-bold mb-12 text-center">Why Choose RealtyEngage Experts?</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        {[
                            'Professional & Licensed Expertise',
                            'Data-Driven Market Insights',
                            'Transparent Reporting Systems',
                            'Dedicated Relationship Managers',
                            '24/7 Digital Dashboard Access',
                            'Comprehensive Vendor Network'
                        ].map((benefit, i) => (
                            <div key={i} className="flex items-center space-x-3 p-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl">
                                <CheckCircle2 className="h-6 w-6 text-green-500 flex-shrink-0" />
                                <span className="font-medium text-gray-800 dark:text-gray-200">{benefit}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 bg-blue-600 text-white text-center">
                <div className="container mx-auto px-4">
                    <h2 className="text-4xl font-bold mb-6">Ready to Get Started?</h2>
                    <p className="text-xl mb-8 opacity-90">Book a free consultation call with our {content.title} team today.</p>
                    <Button size="lg" variant="secondary" className="px-12 h-14 text-blue-600 font-bold hover:bg-gray-100 border-none">
                        Schedule a Call
                        <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                </div>
            </section>
        </div>
    );
};

export default ServicePage;
