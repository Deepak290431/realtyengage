const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * AI Service for RealtyEngage
 * Handles complex real estate queries using Google Gemini
 */
class AIService {
    constructor() {
        const apiKey = process.env.GEMINI_API_KEY;
        if (apiKey && apiKey !== 'your-gemini-api-key') {
            const genAI = new GoogleGenerativeAI(apiKey);
            this.model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            this.isEnabled = true;
            console.log('[AI Service] Gemini AI successfully initialized');
        } else {
            console.warn('[AI Service] GEMINI_API_KEY not found or invalid. Falling back to template mode.');
            this.isEnabled = false;
        }
    }

    /**
     * Generate a context-aware response for the user
     * @param {string} prompt - User message
     * @param {Array} history - Previous messages
     * @param {Array} projects - List of project data for context
     */
    async generateResponse(prompt, history = [], projects = []) {
        if (!this.isEnabled) {
            return null; // Fallback to template logic in route
        }

        try {
            // Prepare context from projects with robustness
            const projectContext = (projects || []).map(p => ({
                name: p.name || 'Unknown Project',
                type: p.type || 'Property',
                location: p.location?.address || 'Location details on request',
                price: p.pricing ? `${p.pricing.basePrice} ${p.pricing.currency || 'INR'}` : 'Pricing on request',
                gst: (p.pricing?.gstRate || 18) + '%',
                amenities: Array.isArray(p.amenities) ? p.amenities.map(a => a.name).join(', ') : (Array.isArray(p.features) ? p.features.join(', ') : 'Premium amenities available'),
                status: p.status || 'Active',
                description: p.shortDescription || (p.description ? (p.description.substring(0, 100) + '...') : 'A premium property offering.')
            }));

            const systemInstruction = `
            You are "RealtyBot", the premium AI assistant for RealtyEngage.
            
            Current available projects:
            ${projectContext.length > 0 ? JSON.stringify(projectContext, null, 2) : "No project details available right now."}
            
            Rules:
            1. Be professional and helpful. Use the user's name: ${history.userName || 'Customer'}.
            2. Use the provided project data to answer. If data is missing, refer to the sales team.
            3. Explain GST (18%) and EMI if asked.
            4. Always emphasize real-time benefits and premium lifestyle.
            `;

            // Merge context into the prompt to ensure it works across all API versions (v1 and v1beta)
            const contextualPrompt = `Context:\n${systemInstruction}\n\nUser Question: ${prompt}`;

            const apiKey = process.env.GEMINI_API_KEY;
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

            const chat = model.startChat({
                history: (history || []).map(h => ({
                    role: h.user ? "user" : "model",
                    parts: [{ text: String(h.user || h.bot || "") }],
                })).slice(-10)
            });

            let result;
            try {
                result = await chat.sendMessage(contextualPrompt);
            } catch (sendError) {
                // Catch 404/Not Found and fallback to gemini-pro
                if (sendError.message.includes('404') || sendError.message.includes('not found') || sendError.message.includes('supported')) {
                    console.warn('[AI Service] gemini-1.5-flash not supported or found, falling back to gemini-pro');
                    const fallbackModel = genAI.getGenerativeModel({ model: "gemini-pro" });
                    const fallbackChat = fallbackModel.startChat({
                        history: (history || []).map(h => ({
                            role: h.user ? "user" : "model",
                            parts: [{ text: String(h.user || h.bot || "") }],
                        })).slice(-10)
                    });
                    result = await fallbackChat.sendMessage(contextualPrompt);
                } else {
                    throw sendError;
                }
            }

            const response = await result.response;
            const text = response.text();

            if (!text || text.trim().length === 0) return null;
            return text;

        } catch (error) {
            console.error('[AI Service] Error generating Gemini response:', error);
            if (error.message) console.error('[AI Service] Error Message:', error.message);
            return null; // Signal fallback to template in route
        }
    }
}

module.exports = new AIService();
