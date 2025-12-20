import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from "path"

// https://vite.dev/config/
export default defineConfig({
    plugins: [react(), tailwindcss()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    // Vendor chunks for better caching
                    'react-vendor': ['react', 'react-dom', '@tanstack/react-router'],
                    'query-vendor': ['@tanstack/react-query'],
                    'ui-vendor': ['framer-motion', 'lucide-react'],
                    'form-vendor': ['react-hook-form', 'zod'],
                    'date-vendor': ['date-fns'],
                    // Lazy-loaded heavy libraries
                    'charts': ['recharts'],
                    'maps': ['leaflet', 'react-leaflet', 'leaflet-defaulticon-compatibility'],
                    'editor': ['react-easy-crop'],
                },
            },
        },
        chunkSizeWarningLimit: 600,
        sourcemap: false,
        minify: 'esbuild',
    },
    optimizeDeps: {
        include: [
            'react',
            'react-dom',
            '@tanstack/react-router',
            '@tanstack/react-query',
            'framer-motion',
            'lucide-react',
        ],
    },
})
