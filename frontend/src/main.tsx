import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from '@tanstack/react-router';
import './index.css';
import { ThemeProvider } from 'next-themes';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AuthProvider } from "@/features/auth/context/AuthProvider.tsx";
import { router } from './router';
import { useAuth } from '@/features/auth/hooks/useAuth';

const queryClient = new QueryClient();

// Custom wrapper to provide auth context to the router
const AppRouter = () => {
    const auth = useAuth();
    return <RouterProvider router={router} context={{ auth }} />;
};

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <QueryClientProvider client={queryClient}>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                <AuthProvider>
                    <AppRouter />
                </AuthProvider>
            </ThemeProvider>
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    </React.StrictMode>
);