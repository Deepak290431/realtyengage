import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Admin-specific Vite configuration
export default defineConfig({
    plugins: [react()],
    server: {
        port: 3001,
        open: '/admin',
    },
    define: {
        'import.meta.env.VITE_APP_TYPE': JSON.stringify('admin'),
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
});
