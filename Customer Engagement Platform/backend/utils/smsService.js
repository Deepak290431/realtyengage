/**
 * Utility for sending SMS notifications via Twilio
 */
const sendSMS = async (options) => {
    const { to, message } = options;

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromPhone = process.env.TWILIO_PHONE_NUMBER;

    // Check if Twilio is configured
    const isConfigured = accountSid && authToken && fromPhone;

    if (!isConfigured) {
        console.log('---------------------------------------------------------');
        console.log('[SMS SIMULATION MODE] Active (Twilio not configured)');
        console.log(`To: ${to}`);
        console.log(`Message: ${message}`);
        console.log('---------------------------------------------------------');
        return { success: true, simulated: true };
    }

    try {
        const twilio = require('twilio');
        const client = twilio(accountSid, authToken);

        const response = await client.messages.create({
            body: message,
            from: fromPhone,
            to: to.startsWith('+') ? to : `+91${to}` // Defaulting to Indian code if not present
        });

        console.log(`SMS sent successfully! SID: ${response.sid}`);
        return { success: true, sid: response.sid };
    } catch (error) {
        console.error('CRITICAL SMS SEND ERROR:');
        console.error('Error Code:', error.code);
        console.error('Error Message:', error.message);
        throw error;
    }
};

module.exports = sendSMS;
