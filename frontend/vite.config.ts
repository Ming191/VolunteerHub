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
                    'react-vendor': ['react', 'react-dom', 'react-router-dom'],
                    'query-vendor': ['@tanstack/react-query'],
                    'ui-vendor': ['framer-motion', 'lucide-react'],
                    'form-vendor': ['react-hook-form', 'zod'],
                    'date-vendor': ['date-fns'],
                },
            },
        },
        chunkSizeWarningLimit: 1000,
        sourcemap: false,


    },
    optimizeDeps: {
        include: [
            'react',
            'react-dom',
            'react-router-dom',
            '@tanstack/react-query',
            'framer-motion',
            'lucide-react',
        ],
    },
})
