export interface AuthUser {
    userId: number;
    email: string;
    name: string;
    role: string;
    isEmailVerified: boolean;
    profilePictureUrl?: string;
}

const STORAGE_KEYS = {
    ACCESS_TOKEN: 'accessToken',
    REFRESH_TOKEN: 'refreshToken',
    USER: 'user',
};

// Access tokens live only in this JavaScript context. Refresh tokens are HttpOnly cookies.
let accessToken: string | null = null;

export const authStorage = {
    getAccessToken: (): string | null => {
        return accessToken;
    },

    setAccessToken: (token: string): void => {
        accessToken = token;
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
        accessToken = null;
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);
        localStorage.removeItem('fcmToken'); // Keeping fcmToken cleanup here as it was in AuthProvider
    },

    // Helper to set all at once and avoid inconsistency
    setAuth: (token: string, user: AuthUser): void => {
        accessToken = token;
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    },
    clearLegacyTokens: (): void => {
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    },
};
