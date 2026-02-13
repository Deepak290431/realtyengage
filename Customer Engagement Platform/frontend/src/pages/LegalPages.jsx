import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Eye, FileText, Bell, Banknote, Cookie, AlertTriangle } from 'lucide-react';
import { Card } from '../components/ui/card';

const LegalPage = ({ title, content, icon: Icon, iconColor }) => {
    return (
        <div className="min-h-screen bg-white dark:bg-gray-950">
            {/* Hero Section */}
            <section className="hero-gradient text-white py-20">
                <div className="container mx-auto px-4 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex justify-center mb-6"
                    >
                        <div className="h-20 w-20 bg-white/10 backdrop-blur-lg rounded-2xl flex items-center justify-center">
                            <Icon className="h-10 w-10" />
                        </div>
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-6xl font-black mb-4"
                    >
                        {title}
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-xl text-white/80"
                    >
                        Last updated: January 2025
                    </motion.p>
                </div>
            </section>

            {/* Content Section */}
            <section className="py-16 px-4">
                <div className="container mx-auto max-w-4xl">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <Card className="p-8 md:p-12 shadow-2xl border-none prose prose-lg prose-blue dark:prose-invert max-w-none">
                            {content}
                        </Card>
                    </motion.div>
                </div>
            </section>
        </div>
    );
};

export const PrivacyPage = () => {
    const content = (
        <>
            <div className="flex items-center space-x-3 text-[#0B1F33] dark:text-blue-400 mb-6 font-bold text-xl">
                <Shield className="h-6 w-6" />
                <span>Your Privacy is Our Priority</span>
            </div>

            <h3>1. Information We Collect</h3>
            <p>
                At RealtyEngage, we collect information to provide better services to all our users.
                This includes information you provide directly (like your name, email, and phone number)
                and information we get from your use of our services (like device information and location data).
            </p>

            <h3>2. How We Use Information</h3>
            <p>
                We use the information we collect from all our services to:
            </p>
            <ul>
                <li>Provide, maintain, protect and improve our services.</li>
                <li>Develop new ones and protect RealtyEngage and our users.</li>
                <li>Offer you tailored content – like giving you more relevant project results.</li>
                <li>Communicate with you regarding our projects and offers.</li>
            </ul>

            <div className="bg-[#0B1F33]/5 dark:bg-[#0B1F33]/20 p-6 rounded-xl border border-[#0B1F33]/20 dark:border-[#0B1F33]/30 my-8">
                <h4 className="m-0 flex items-center text-[#0B1F33] dark:text-blue-300">
                    <Lock className="h-5 w-5 mr-2" /> Data Security
                </h4>
                <p className="mb-0 mt-2 text-gray-700 dark:text-blue-400">
                    We work hard to protect RealtyEngage and our users from unauthorized access to or
                    unauthorized alteration, disclosure or destruction of information we hold.
                    We use industry-standard encryption for all data transmissions.
                </p>
            </div>

            <h3>3. Sharing Information</h3>
            <p>
                We do not share personal information with companies, organizations and individuals
                outside of RealtyEngage unless one of the following circumstances applies:
            </p>
            <ul>
                <li>With your explicit consent.</li>
                <li>For external processing (e.g., payment gateways like Razorpay).</li>
                <li>For legal reasons.</li>
            </ul>

            <h3>4. Cookie Policy</h3>
            <p>
                We use cookies and similar technologies to help provide, protect, and improve our services.
                You can control the use of cookies at the individual browser level.
            </p>
        </>
    );

    return <LegalPage title="Privacy Policy" content={content} icon={Shield} />;
};

export const TermsPage = () => {
    const content = (
        <>
            <div className="flex items-center space-x-3 text-[#0B1F33] dark:text-blue-400 mb-6 font-bold text-xl">
                <FileText className="h-6 w-6" />
                <span>General Terms & Conditions</span>
            </div>

            <p>
                By accessing this website, you are agreeing to be bound by these website Terms and Conditions
                of Use, all applicable laws and regulations, and agree that you are responsible for compliance
                with any applicable local laws.
            </p>

            <h3>1. Use License</h3>
            <p>
                Permission is granted to temporarily download one copy of the materials (information or software)
                on RealtyEngage's website for personal, non-commercial transitory viewing only.
            </p>

            <h3>2. Disclaimer</h3>
            <p>
                The materials on RealtyEngage's website are provided "as is". RealtyEngage makes no warranties,
                expressed or implied, and hereby disclaims and negates all other warranties, including without
                limitation, implied warranties or conditions of merchantability, fitness for a particular
                purpose, or non-infringement of intellectual property or other violation of rights.
            </p>

            <div className="bg-[#0B1F33]/5 dark:bg-[#0B1F33]/20 p-6 rounded-xl border border-[#0B1F33]/20 dark:border-[#0B1F33]/30 my-8">
                <h4 className="m-0 flex items-center text-[#0B1F33] dark:text-blue-300">
                    <Bell className="h-5 w-5 mr-2" /> RERA Compliance
                </h4>
                <p className="mb-0 mt-2 text-gray-700 dark:text-blue-400">
                    All project information, layouts, and specifications are subject to RERA approvals.
                    While we strive for accuracy, the final agreement for sale between the builder and the
                    customer shall prevail.
                </p>
            </div>

            <h3>3. Limitations</h3>
            <p>
                In no event shall RealtyEngage or its suppliers be liable for any damages (including,
                without limitation, damages for loss of data or profit, or due to business interruption)
                arising out of the use or inability to use the materials on RealtyEngage's Internet site.
            </p>

            <h3>4. Govering Law</h3>
            <p>
                Any claim relating to RealtyEngage's website shall be governed by the laws of the State of
                Tamil Nadu without regard to its conflict of law provisions.
            </p>
        </>
    );

    return <LegalPage title="Terms of Service" content={content} icon={FileText} />;
};

export const RefundPolicyPage = () => {
    const content = (
        <>
            <div className="flex items-center space-x-3 text-[#0B1F33] dark:text-blue-400 mb-6 font-bold text-xl">
                <Banknote className="h-6 w-6" />
                <span>Our Refund & Cancellation Policy</span>
            </div>

            <p>
                We strive to ensure a transparent and fair cancellation process for all our customers. Please read our policy regarding refunds for bookings and platform services.
            </p>

            <h3>1. Booking Amount Refund</h3>
            <p>
                As per standard industry norms, the booking amount paid for a property (Villa, Apartment, or Commercial space) is refundable within 7 days of payment, subject to a small processing fee.
            </p>

            <h3>2. Platform Fees</h3>
            <p>
                Platform commission fees and associated GST are non-refundable as they cover the administrative and technical costs of processing the transaction and verifying documentation.
            </p>

            <div className="bg-amber-50 dark:bg-amber-900/20 p-6 rounded-xl border border-amber-200 dark:border-amber-900/30 my-8">
                <h4 className="m-0 flex items-center text-amber-800 dark:text-amber-300">
                    <AlertTriangle className="h-5 w-5 mr-2" /> Important Note
                </h4>
                <p className="mb-0 mt-2 text-amber-700 dark:text-amber-400">
                    Any cancellation request must be submitted formally through the customer dashboard or via email. The final decision on property refunds rests with the specific builder/developer agreement.
                </p>
            </div>
        </>
    );

    return <LegalPage title="Refund Policy" content={content} icon={Banknote} />;
};

export const CookiePolicyPage = () => {
    const content = (
        <>
            <div className="flex items-center space-x-3 text-[#0B1F33] dark:text-blue-400 mb-6 font-bold text-xl">
                <Cookie className="h-6 w-6" />
                <span>How We Use Cookies</span>
            </div>

            <p>
                RealtyEngage uses cookies and similar technologies to enhance your browsing experience, provide personalized content, and analyze our traffic.
            </p>

            <h3>1. What are Cookies?</h3>
            <p>
                Cookies are small text files stored on your device when you visit a website. They help the website remember your preferences and improve functionality.
            </p>

            <h3>2. Types of Cookies We Use</h3>
            <ul>
                <li><strong>Essential Cookies:</strong> Necessary for the website to function correctly (e.g., authentication).</li>
                <li><strong>Performance Cookies:</strong> Help us understand how visitors interact with our site.</li>
                <li><strong>Functionality Cookies:</strong> Remember choices you make (like your preferred language).</li>
            </ul>

            <p>
                By continuing to use our site, you agree to our use of cookies according to this policy. You can manage your cookie preferences through your browser settings.
            </p>
        </>
    );

    return <LegalPage title="Cookie Policy" content={content} icon={Cookie} />;
};

export const DisclaimerPage = () => {
    const content = (
        <>
            <div className="flex items-center space-x-3 text-[#0B1F33] dark:text-blue-400 mb-6 font-bold text-xl">
                <AlertTriangle className="h-6 w-6" />
                <span>Important Disclaimer</span>
            </div>

            <p>
                The information provided on RealtyEngage is for general informational purposes only. All renderings, pictures, and floor plans are artist's impressions and are not intended to be a guarantee of the final product.
            </p>

            <h3>1. Property Details</h3>
            <p>
                While we make every effort to provide accurate information regarding project status, completion dates, and pricing, these details are subject to change by the developers without prior notice.
            </p>

            <h3>2. Professional Advice</h3>
            <p>
                The content on this website does not constitute financial or investment advice. We recommend consulting with legal and financial professionals before making any property purchase decisions.
            </p>

            <p>
                RealtyEngage shall not be held liable for any loss or damage arising from reliance on the information provided on this platform.
            </p>
        </>
    );

    return <LegalPage title="Disclaimer" content={content} icon={AlertTriangle} />;
};
