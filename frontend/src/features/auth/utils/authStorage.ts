export interface AuthUser {
    userId: number;
    email: string;
    name: string;
    role: string;
    isEmailVerified: boolean;
}

const STORAGE_KEYS = {
    ACCESS_TOKEN: 'accessToken',
    REFRESH_TOKEN: 'refreshToken',
    USER: 'user',
};

export const authStorage = {
    getAccessToken: (): string | null => {
        return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    },

    setAccessToken: (token: string): void => {
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
    },

    getRefreshToken: (): string | null => {
        return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    },

    setRefreshToken: (token: string): void => {
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, token);
    },

    getUser: (): AuthUser | null => {
        const userStr = localStorage.getItem(STORAGE_KEYS.USER);
        if (!userStr) return null;
        try {
            return JSON.parse(userStr) as AuthUser;
        } catch {
            return null;
        }
    },

    setUser: (user: AuthUser): void => {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    },

    clearAuth: (): void => {
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);
        localStorage.removeItem('fcmToken'); // Keeping fcmToken cleanup here as it was in AuthProvider
    },

    // Helper to set all at once and avoid inconsistency
    setAuth: (accessToken: string, refreshToken: string, user: AuthUser): void => {
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    }
};
