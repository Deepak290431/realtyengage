import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Mail,
    Phone,
    MapPin,
    Send,
    MessageCircle,
    Clock,
    Shield,
    CheckCircle2
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import toast from 'react-hot-toast';
import { contactAPI } from '../services/api';

const ContactPage = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await contactAPI.submitForm(formData);
            if (response.data.success) {
                toast.success(response.data.message || 'Message sent successfully!');
                setFormData({ name: '', email: '', subject: '', message: '' });
            }
        } catch (error) {
            console.error('Contact form submission error:', error);
            // Error toast is handled by axios interceptor
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleWhatsApp = () => {
        const message = "Hello! I'm interested in your real estate projects.";
        const whatsappUrl = `https://wa.me/9360726636?text=${encodeURIComponent(message)}`;

        toast((t) => (
            <span>
                <b>Reminder:</b> WhatsApp is for messages only. Please don't call.
                <Button
                    size="sm"
                    className="ml-3"
                    onClick={() => {
                        window.open(whatsappUrl, '_blank');
                        toast.dismiss(t.id);
                    }}
                >
                    OK, Messaging Only
                </Button>
            </span>
        ), { duration: 6000 });
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <section className="hero-gradient text-white py-20">
                <div className="container mx-auto px-4 text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-5xl font-bold mb-4"
                    >
                        Get in Touch
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-xl text-white/90 max-w-2xl mx-auto"
                    >
                        Have questions about our projects or need investment advice?
                        Our team is here to help you every step of the way.
                    </motion.p>
                </div>
            </section>

            <div className="container mx-auto px-4 mt-10 pb-20">
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Contact Information */}
                    <div className="space-y-6">
                        <Card className="p-6">
                            <h3 className="text-xl font-bold mb-6">Contact Info</h3>
                            <div className="space-y-6">
                                <div className="flex items-start space-x-4">
                                    <div className="p-3 bg-[#0B1F33]/10 rounded-lg">
                                        <Mail className="h-6 w-6 text-[#0B1F33]" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Email Address</p>
                                        <p className="font-semibold">deepaks310804@gmail.com</p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-4">
                                    <div className="p-3 bg-[#0B1F33]/10 rounded-lg">
                                        <Phone className="h-6 w-6 text-[#0B1F33]" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Phone Number</p>
                                        <p className="font-semibold">+91 9360726636</p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-4">
                                    <div className="p-3 bg-green-100 rounded-lg">
                                        <MapPin className="h-6 w-6 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Our Office</p>
                                        <p className="font-semibold">Sri Shakthi Institute of Engineering and Technology, Coimbatore</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 pt-8 border-t">
                                <h4 className="font-bold mb-4">Support Hours</h4>
                                <div className="space-y-2 text-sm text-gray-600">
                                    <div className="flex justify-between">
                                        <span>Mon - Fri</span>
                                        <span>9:00 AM - 6:00 PM</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Saturday</span>
                                        <span>10:00 AM - 4:00 PM</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Sunday</span>
                                        <span className="text-red-500 font-medium">Closed</span>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Quick Actions */}
                        <Card className="p-6 bg-[#0B1F33] text-white">
                            <h3 className="text-xl font-bold mb-4">Prefer Messenger?</h3>
                            <p className="mb-6 text-white/80">Chat with us on WhatsApp for lightning fast support.</p>
                            <Button
                                onClick={handleWhatsApp}
                                className="w-full bg-white text-[#0B1F33] hover:bg-gray-100 font-bold"
                            >
                                <MessageCircle className="mr-2 h-5 w-5" />
                                Chat on WhatsApp
                            </Button>
                            <p className="mt-4 text-xs text-white/60 text-center uppercase tracking-widest font-bold">
                                MESSAGES ONLY • NO CALLS
                            </p>
                        </Card>
                    </div>

                    {/* Contact Form */}
                    <div className="lg:col-span-2">
                        <Card className="p-8">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold">Your Name *</label>
                                        <Input
                                            required
                                            placeholder="Enter your name"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold">Email Address *</label>
                                        <Input
                                            required
                                            type="email"
                                            placeholder="Enter your email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold">Subject</label>
                                    <Input
                                        placeholder="How can we help?"
                                        value={formData.subject}
                                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold">Message *</label>
                                    <textarea
                                        required
                                        className="w-full h-40 p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0B1F33] resize-none"
                                        placeholder="Tell us about your requirements..."
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    size="lg"
                                    className="w-full bg-[#0B1F33] hover:opacity-90"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <>Processing...</>
                                    ) : (
                                        <>
                                            <Send className="mr-2 h-5 w-5" />
                                            Send Message Now
                                        </>
                                    )}
                                </Button>
                                <p className="text-xs text-center text-gray-500 italic">
                                    * Your inquiry will be sent directly to our support team and you will receive a confirmation email.
                                </p>
                            </form>
                        </Card>

                        {/* Why Contact Us? */}
                        <div className="grid md:grid-cols-3 gap-6 mt-12">
                            <div className="text-center">
                                <div className="h-12 w-12 bg-[#0B1F33]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Clock className="h-6 w-6 text-[#0B1F33]" />
                                </div>
                                <h4 className="font-bold mb-2">Fast Response</h4>
                                <p className="text-sm text-gray-500">We usually reply within 24 hours.</p>
                            </div>
                            <div className="text-center">
                                <div className="h-12 w-12 bg-[#0B1F33]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Shield className="h-6 w-6 text-[#0B1F33]" />
                                </div>
                                <h4 className="font-bold mb-2">Secure Data</h4>
                                <p className="text-sm text-gray-500">Your information is safe with us.</p>
                            </div>
                            <div className="text-center">
                                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                                </div>
                                <h4 className="font-bold mb-2">Expert Advice</h4>
                                <p className="text-sm text-gray-500">Get insights from property experts.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactPage;
