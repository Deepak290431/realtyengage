import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote, User, Building } from 'lucide-react';
import { Card } from '../components/ui/card';

const TestimonialsPage = () => {
    const testimonials = [
        {
            name: 'Anjali Sharma',
            role: 'Software Engineer',
            content: 'Finding my dream villa was so easy with RealtyEngage. The transparency in pricing and documentation was refreshing.',
            rating: 5,
            project: 'Skyline Heights'
        },
        {
            name: 'Rajesh Kumar',
            role: 'Business Owner',
            content: 'The investment advisory team helped me pick the perfect commercial space. Their technical insights are top-notch.',
            rating: 5,
            project: 'Tech Park Plaza'
        },
        {
            name: 'Suresh Iyer',
            role: 'NR Customer',
            content: 'Being an NRI, I was worried about the process, but the virtual tour and constant updates made me feel like I was right there.',
            rating: 4,
            project: 'Green Valley Villas'
        },
        {
            name: 'Priya Patel',
            role: 'Doctor',
            content: 'I love my new apartment! The amenities are world-class, and the handover process was completely stress-free.',
            rating: 5,
            project: 'Serene Towers'
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-20 px-4">
            <div className="container mx-auto max-w-6xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">Customer Stories</h1>
                    <p className="text-gray-500 max-w-2xl mx-auto text-lg">
                        Hear from the families and businesses that have found their perfect spaces with RealtyEngage.
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-2 gap-8">
                    {testimonials.map((testimonial, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Card className="p-8 h-full relative overflow-hidden group hover:shadow-2xl transition-all duration-300">
                                <Quote className="absolute -top-2 -right-2 h-20 w-20 text-blue-100 dark:text-gray-800 opacity-50 z-0" />
                                <div className="relative z-10">
                                    <div className="flex mb-4">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className={`h-5 w-5 ${i < testimonial.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                                            />
                                        ))}
                                    </div>
                                    <p className="text-gray-700 dark:text-gray-300 text-lg italic mb-6">
                                        "{testimonial.content}"
                                    </p>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                                                <User className="h-6 w-6 text-blue-600" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-900 dark:text-gray-100">{testimonial.name}</h4>
                                                <p className="text-sm text-gray-500">{testimonial.role}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center text-sm text-blue-600 font-semibold">
                                            <Building className="h-4 w-4 mr-1" />
                                            {testimonial.project}
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TestimonialsPage;
