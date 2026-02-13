import React, { useEffect } from 'react';
import { settingsAPI } from '../services/api';

// Helper to convert hex to HSL for Tailwind/Shadcn compatibility
const hexToHSL = (hex) => {
    let r = 0, g = 0, b = 0;
    if (hex.length === 4) {
        r = "0x" + hex[1] + hex[1];
        g = "0x" + hex[2] + hex[2];
        b = "0x" + hex[3] + hex[3];
    } else if (hex.length === 7) {
        r = "0x" + hex[1] + hex[2];
        g = "0x" + hex[3] + hex[4];
        b = "0x" + hex[5] + hex[6];
    }
    // Then to HSL
    r /= 255;
    g /= 255;
    b /= 255;
    let cmin = Math.min(r, g, b),
        cmax = Math.max(r, g, b),
        delta = cmax - cmin,
        h = 0,
        s = 0,
        l = 0;

    if (delta === 0)
        h = 0;
    else if (cmax === r)
        h = ((g - b) / delta) % 6;
    else if (cmax === g)
        h = (b - r) / delta + 2;
    else
        h = (r - g) / delta + 4;

    h = Math.round(h * 60);

    if (h < 0)
        h += 360;

    l = (cmax + cmin) / 2;
    s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));

    s = +(s * 100).toFixed(1);
    l = +(l * 100).toFixed(1);

    return `${h} ${s}% ${l}%`;
};

const ThemeApplicator = () => {
    useEffect(() => {
        const applyTheme = async () => {
            try {
                const response = await settingsAPI.getSettings();
                const settings = response.data.data;
                const primaryColor = settings?.general?.brandColors?.primary || '#0B1F33';
                const darkModeEnabled = settings?.general?.darkModeEnabled || false;

                // Toggle Dark Mode globally based on Admin Setting
                if (darkModeEnabled) {
                    document.documentElement.classList.add('dark');
                    document.documentElement.setAttribute('data-theme', 'dark');
                } else {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.setAttribute('data-theme', 'light');
                }

                if (primaryColor) {
                    const hsl = hexToHSL(primaryColor);
                    document.documentElement.style.setProperty('--primary', hsl);
                    document.documentElement.style.setProperty('--ring', hsl);
                }
            } catch (error) {
                console.error('Failed to apply theme settings:', error);
            }
        };

        applyTheme();
    }, []);

    return null; // This component renders nothing
};

export default ThemeApplicator;
