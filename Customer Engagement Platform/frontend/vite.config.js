import { defineConfig, splitVendorChunkPlugin } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import viteCompression from 'vite-plugin-compression';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isDev = mode === 'development';
  const isProd = mode === 'production';

  return {
    plugins: [
      react(),
      splitVendorChunkPlugin(),
      // Gzip compression
      viteCompression({
        algorithm: 'gzip',
        ext: '.gz',
        threshold: 10240, // Only compress files larger than 10kb
      }),
      // Brotli compression
      viteCompression({
        algorithm: 'brotliCompress',
        ext: '.br',
        threshold: 10240,
      }),
      // PWA Support
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
        manifest: {
          name: 'RealtyEngage Platform',
          short_name: 'RealtyEngage',
          theme_color: '#1976d2',
          icons: [
            {
              src: '/icon-192.png',
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: '/icon-512.png',
              sizes: '512x512',
              type: 'image/png',
            },
          ],
        },
      }),
      // Bundle analyzer (only in analyze mode)
      process.env.ANALYZE && visualizer({
        open: true,
        filename: 'dist/stats.html',
        gzipSize: true,
        brotliSize: true,
      }),
    ].filter(Boolean),

    define: {
      'import.meta.env.VITE_APP_TYPE': JSON.stringify('customer'),
    },

    server: {
      port: parseInt(process.env.PORT) || 3000,
      host: '127.0.0.1', // Force IPv4 to fix WebSocket issues on some Windows systems
      open: '/',
      hmr: {
        protocol: 'ws',
        host: 'localhost',
      },
      proxy: {
        '/api': {
          target: 'http://localhost:5005',
          changeOrigin: true,
        },
      },
    },

    build: {
      outDir: 'dist',
      sourcemap: isProd ? false : true,
      chunkSizeWarningLimit: 1600,
      minify: isProd ? 'esbuild' : false,
      target: 'es2015',

      rollupOptions: {
        output: {
          // Manual chunking for better caching
          manualChunks: {
            // React ecosystem
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            // Redux and state management
            'redux-vendor': ['@reduxjs/toolkit', 'react-redux'],
            // Material-UI
            'mui-vendor': ['@mui/material', '@mui/icons-material', '@emotion/react', '@emotion/styled'],
            // Data visualization
            'charts-vendor': ['recharts'],
            // Utilities
            'utils-vendor': ['axios', 'date-fns', 'yup'],
            // Forms
            'forms-vendor': ['react-hook-form', '@hookform/resolvers'],
            // Maps (lazy loaded)
            'maps-vendor': ['@react-google-maps/api'],
          },
          // Asset file naming
          assetFileNames: (assetInfo) => {
            const info = assetInfo.name.split('.');
            const ext = info[info.length - 1];
            if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
              return `assets/images/[name]-[hash][extname]`;
            } else if (/woff|woff2|eot|ttf|otf/i.test(ext)) {
              return `assets/fonts/[name]-[hash][extname]`;
            }
            return `assets/[name]-[hash][extname]`;
          },
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
        },
      },

      // CSS code splitting
      cssCodeSplit: true,

      // Terser options for better minification
      terserOptions: isProd ? {
        compress: {
          drop_console: true,
          drop_debugger: true,
        },
      } : undefined,
    },

    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        '@mui/material',
        '@emotion/react',
        '@emotion/styled',
      ],
      exclude: ['@react-google-maps/api'], // Exclude heavy libraries
    },

    resolve: {
      alias: {
        '@': '/src',
        '@components': '/src/components',
        '@pages': '/src/pages',
        '@utils': '/src/utils',
        '@services': '/src/services',
        '@hooks': '/src/hooks',
        '@assets': '/src/assets',
        '@store': '/src/store',
      },
    },

    // Performance hints
    performance: {
      hints: isProd ? 'warning' : false,
      maxEntrypointSize: 512000,
      maxAssetSize: 512000,
    },
  };
});
