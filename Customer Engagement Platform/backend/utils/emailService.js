const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // Create a transporter
    // For development, you can use Mailtrap or similar
    // For production, use SendGrid, Gmail, etc.

    const authUser = process.env.EMAIL_USER || process.env.EMAIL_FROM || 'deepaks310804@gmail.com';
    const authPass = (process.env.EMAIL_PASSWORD || '').replace(/\s+/g, ''); // Remove spaces from app password

    console.log(`Email Service Auth -> User: ${authUser}, Pass defined: ${!!authPass}`);

    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true, // use TLS
        auth: {
            user: authUser,
            pass: authPass
        },
        debug: true, // show debug output
        logger: true // log to console
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

        if (error.code === 'EAUTH') {
            console.error('---------------------------------------------------------');
            console.error('AUTHENTICATION FAILED: Invalid Gmail Credentials.');
            console.error('1. Ensure 2FA is ENABLED on your Google Account.');
            console.error('2. Generate a NEW "App Password" (16 characters).');
            console.error('3. Update EMAIL_PASSWORD in backend/.env (removing spaces).');
            console.error('4. Visit: https://myaccount.google.com/apppasswords');
            console.error('---------------------------------------------------------');
        }

        if (error.response) console.error('SMTP Response:', error.response);
        throw error;
    }
};

module.exports = sendEmail;
