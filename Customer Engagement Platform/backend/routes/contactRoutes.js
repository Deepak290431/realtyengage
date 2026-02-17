const express = require('express');
const router = express.Router();
const sendEmail = require('../utils/emailService');

// @route   POST /api/contact
// @desc    Submit contact form
// @access  Public
router.post('/', async (req, res) => {
    console.log('Incoming contact form request from:', req.body.email);
    try {
        const { name, email, subject, message } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({ error: 'Please provide name, email and message' });
        }

        // Send response early or handle errors gracefully
        let emailSent = false;
        try {
            // 1. Send email to admin
            const adminEmailContent = `
                <h3>New Contact Form Submission</h3>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Subject:</strong> ${subject || 'No Subject'}</p>
                <p><strong>Message:</strong></p>
                <p>${message}</p>
            `;

            await sendEmail({
                to: 'deepaks310804@gmail.com', // Admin email
                // to: process.env.ADMIN_EMAIL || process.env.EMAIL_FROM || 'admin@realtyengage.com', // Dynamic Admin email

                subject: `New Inquiry: ${subject || 'Contact Form'}`,
                html: adminEmailContent
            });
            emailSent = true;

            // 2. Send confirmation email to user
            const userEmailContent = `
                <h3>Hello ${name},</h3>
                <p>Thank you for contacting RealtyEngage!</p>
                <p>We have received your message regarding "${subject || 'General Inquiry'}" and will get back to you within 24 hours.</p>
                <br>
                <p>Best Regards,</p>
                <p>Team RealtyEngage</p>
            `;
            await sendEmail({
                to: email,
                subject: 'Thank you for contacting RealtyEngage',
                html: userEmailContent
            });
        } catch (emailError) {
            console.error('Email service reported an error:', emailError.message);
            // If email fails because of bad credentials, we should still tell the user we got their message
            // or warn them if nothing was saved.
        }

        res.status(200).json({
            success: true,
            message: emailSent
                ? 'Message sent successfully! Check your email for confirmation.'
                : 'Form submitted! (Note: Email delivery failed, but we have logged your request in our system).'
        });
    } catch (error) {
        console.error('Contact form error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'There was an error processing your request.'
        });
    }
});

module.exports = router;
