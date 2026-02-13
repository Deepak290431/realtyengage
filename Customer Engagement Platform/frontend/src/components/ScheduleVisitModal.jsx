import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calendar,
    Clock,
    User,
    Phone,
    Mail,
    Video,
    MapPin,
    X,
    CheckCircle2,
    CalendarDays,
    Users
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import toast from 'react-hot-toast';

import enquiryService from '../services/enquiryService';

const ScheduleVisitModal = ({ isOpen, onClose, projectName, projectLocation, projectId }) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        date: '',
        time: '',
        visitType: 'site', // 'site' or 'virtual'
        attendees: '1',
        name: '',
        email: '',
        phone: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (step < 2) {
            setStep(2);
        } else {
            try {
                const enquiryData = {
                    projectId: projectId,
                    enquiryType: 'site_visit',
                    priority: 'medium',
                    details: `Site Visit Scheduled for ${projectName}.\nDate: ${formData.date}\nTime: ${formData.time}\nType: ${formData.visitType}\nAttendees: ${formData.attendees}`,
                    preferredContactMethod: 'phone',
                    preferredContactTime: formData.time
                };

                await enquiryService.createEnquiry(enquiryData);
                toast.success('Site visit scheduled successfully!');
                setStep(3); // Success step
                setTimeout(() => {
                    onClose();
                    setStep(1);
                }, 3000);
            } catch (error) {
                toast.error('Failed to schedule visit. Please try again.');
            }
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden"
            >
                {/* Header */}
                <div className="hero-gradient p-6 text-white relative">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                    <div className="flex items-center space-x-3 mb-2">
                        <CalendarDays className="h-8 w-8" />
                        <h3 className="text-2xl font-bold">Schedule a Visit</h3>
                    </div>
                    <p className="text-white/80">{projectName} • {projectLocation}</p>
                </div>

                {/* Progress bar */}
                <div className="flex h-1 bg-gray-100 dark:bg-gray-700">
                    <motion.div
                        className="bg-blue-600"
                        initial={{ width: '33.33%' }}
                        animate={{ width: step === 1 ? '33.33%' : step === 2 ? '66.66%' : '100%' }}
                    />
                </div>

                <div className="p-8">
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.form
                                key="step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                onSubmit={handleSubmit}
                                className="space-y-6"
                            >
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold flex items-center">
                                            <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                                            Preferred Date
                                        </label>
                                        <Input
                                            required
                                            type="date"
                                            min={new Date().toISOString().split('T')[0]}
                                            value={formData.date}
                                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold flex items-center">
                                            <Clock className="h-4 w-4 mr-2 text-blue-500" />
                                            Preferred Time
                                        </label>
                                        <select
                                            required
                                            className="w-full h-10 px-3 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                                            value={formData.time}
                                            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                        >
                                            <option value="">Select time...</option>
                                            <option value="10:00 AM">10:00 AM</option>
                                            <option value="12:00 PM">12:00 PM</option>
                                            <option value="02:00 PM">02:00 PM</option>
                                            <option value="04:00 PM">04:00 PM</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-sm font-semibold">Visit Type</label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, visitType: 'site' })}
                                            className={`p-4 rounded-xl border-2 transition-all text-left ${formData.visitType === 'site'
                                                ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                                                : 'border-gray-100 dark:border-gray-700 hover:border-blue-200'
                                                }`}
                                        >
                                            <MapPin className={`h-6 w-6 mb-2 ${formData.visitType === 'site' ? 'text-blue-600' : 'text-gray-400'}`} />
                                            <p className="font-bold">In-Person</p>
                                            <p className="text-xs text-gray-500">Physical site tour</p>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, visitType: 'virtual' })}
                                            className={`p-4 rounded-xl border-2 transition-all text-left ${formData.visitType === 'virtual'
                                                ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                                                : 'border-gray-100 dark:border-gray-700 hover:border-blue-200'
                                                }`}
                                        >
                                            <Video className={`h-6 w-6 mb-2 ${formData.visitType === 'virtual' ? 'text-blue-600' : 'text-gray-400'}`} />
                                            <p className="font-bold">Virtual Tour</p>
                                            <p className="text-xs text-gray-500">Via Video Call</p>
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold flex items-center">
                                        <Users className="h-4 w-4 mr-2 text-blue-500" />
                                        Number of Attendees
                                    </label>
                                    <Input
                                        type="number"
                                        min="1"
                                        max="10"
                                        value={formData.attendees}
                                        onChange={(e) => setFormData({ ...formData, attendees: e.target.value })}
                                    />
                                </div>

                                <Button type="submit" className="w-full bg-[#0B1F33] hover:bg-[#06121f] py-6 text-lg shadow-lg">
                                    Next Step
                                </Button>
                            </motion.form>
                        )}

                        {step === 2 && (
                            <motion.form
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                onSubmit={handleSubmit}
                                className="space-y-4"
                            >
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold">Full Name</label>
                                    <Input
                                        required
                                        placeholder="Enter your name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold">Email Address</label>
                                    <Input
                                        required
                                        type="email"
                                        placeholder="name@example.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold">Phone Number</label>
                                    <Input
                                        required
                                        placeholder="+91 XXXXX XXXXX"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>

                                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl space-y-2 mt-4">
                                    <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Summary</p>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Date & Time</span>
                                        <span className="font-semibold">{formData.date} at {formData.time}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Visit Type</span>
                                        <Badge variant="secondary" className="capitalize">{formData.visitType} Visit</Badge>
                                    </div>
                                </div>

                                <div className="flex space-x-3 pt-4">
                                    <Button variant="outline" className="flex-1 py-6" onClick={() => setStep(1)}>
                                        Back
                                    </Button>
                                    <Button type="submit" className="flex-[2] bg-[#0B1F33] hover:bg-[#06121f] py-6 font-bold shadow-lg">
                                        Confirm Visit
                                    </Button>
                                </div>
                            </motion.form>
                        )}

                        {step === 3 && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="py-12 text-center"
                            >
                                <div className="h-20 w-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <CheckCircle2 className="h-12 w-12 text-green-600" />
                                </div>
                                <h3 className="text-2xl font-bold mb-2">Visit Scheduled!</h3>
                                <p className="text-gray-500 mb-6">
                                    Check your email for confirmation details and calendar invite.
                                </p>
                                <Badge variant="outline" className="px-4 py-1 text-green-600 border-green-200 bg-green-50">
                                    REF: SV-{Math.floor(Math.random() * 90000) + 10000}
                                </Badge>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
};

export default ScheduleVisitModal;
