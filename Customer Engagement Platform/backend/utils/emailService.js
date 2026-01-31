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
        console.log(`Attempting to send email to: ${options.to}...`);

        // Verify transporter connection
        await transporter.verify();
        console.log('Transporter connection verified successfully.');

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully!');
        console.log('Message ID:', info.messageId);
        console.log('Response:', info.response);
        return info;
    } catch (error) {
        console.error('CRITICAL EMAIL SEND ERROR:');
        console.error('Error Name:', error.name);
        console.error('Error Message:', error.message);
        console.error('Error Code:', error.code);
        if (error.response) console.error('SMTP Response:', error.response);
        throw error;
    }
};

module.exports = sendEmail;
