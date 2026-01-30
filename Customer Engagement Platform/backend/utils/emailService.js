const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // Create a transporter
    // For development, you can use Mailtrap or similar
    // For production, use SendGrid, Gmail, etc.

    const authUser = process.env.EMAIL_USER || process.env.EMAIL_FROM || 'deepaks310804@gmail.com';
    const authPass = (process.env.EMAIL_PASSWORD || '').replace(/\s+/g, ''); // Remove spaces from app password

    console.log(`Email Service Auth -> User: ${authUser}, Pass defined: ${!!authPass}`);

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: authUser,
            pass: authPass
        }
    });

    // Define email options
    const mailOptions = {
        from: `RealtyEngage <${process.env.EMAIL_FROM || 'noreply@realtyengage.com'}>`,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html
    };

    // Send the email
    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
        return info;
    } catch (error) {
        console.error('Email send error:', error);
        throw error;
    }
};

module.exports = sendEmail;
