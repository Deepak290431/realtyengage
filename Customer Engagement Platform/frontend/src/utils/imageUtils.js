/**
 * Normalizes image URLs to handle various formats:
 * 1. Base64 data URLs - Returns as is
 * 2. Absolute URLs (http/https) - Replaces deprecated source.unsplash.com
 * 3. Relative paths (e.g. /uploads/...) - Prepends VITE_API_URL
 * 4. Fallback for missing/invalid images
 */
export const normalizeImageUrl = (img) => {
    const fallback = 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800';

    if (!img) return fallback;

    // Handle both object {url: '...'} and string '...'
    const url = typeof img === 'object' ? (img.url || img.imageUrl) : img;

    if (!url || typeof url !== 'string') return fallback;

    // 1. Data URLs (Base64) - return as is
    if (url.startsWith('data:')) {
        return url;
    }

    // 2. Deprecated source.unsplash.com - replace with working featured URL
    if (url.includes('source.unsplash.com')) {
        const query = url.split('?')[1] || 'property';
        return `https://images.unsplash.com/featured/?${query}`;
    }

    // 3. Absolute URLs - return as is if valid
    if (url.startsWith('http')) {
        // Fix for common localhost port mismatch if needed
        // For now just return as is
        return url;
    }

    // 4. Relative paths - prepend backend URL
    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5005/api';
    const baseUrl = apiBase.replace('/api', '');

    // Ensure no double slashes except after protocol
    const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    const cleanPath = url.startsWith('/') ? url : `/${url}`;

    return `${cleanBase}${cleanPath}`;
};

export const handleImageError = (e) => {
    e.target.src = 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800';
    e.target.onerror = null; // Prevent infinite loop if fallback also fails
};
