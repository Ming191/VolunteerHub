import { useTheme } from 'next-themes';
import { useSettings } from '../hooks/useSettings';
import { useEffect, useState } from 'react';

export const ThemeListener = () => {
    const { settings } = useSettings();
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Initial mount check to avoid hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    // Backend -> Frontend Sync
    useEffect(() => {
        if (!mounted || !settings?.theme) return;

        const themeMap: Record<string, string> = {
            'LIGHT': 'light',
            'DARK': 'dark',
            'SYSTEM': 'system',
        };
        const backendTheme = themeMap[settings.theme];

        // Only update if different and valid
        if (backendTheme && backendTheme !== theme) {
            setTheme(backendTheme);
        }
    }, [settings?.theme, mounted, setTheme]); // Sync only one way here to avoid loops

    return null;
};
