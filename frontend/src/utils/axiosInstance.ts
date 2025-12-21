import axios from 'axios';
import { authStorage, type AuthUser } from '@/features/auth/utils/authStorage';

const API_BASE_URL = 'http://localhost:8080';

const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
});

const isTokenExpired = (token: string): boolean => {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const expirationTime = payload.exp * 1000;
        const currentTime = Date.now();
        return currentTime >= expirationTime;
    } catch {
        return true;
    }
};

const refreshAccessToken = async (): Promise<string | null> => {
    try {
        const refreshToken = authStorage.getRefreshToken();
        if (!refreshToken) {
            return null;
        }

        const response = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
            refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken, userId, email, name, role, isEmailVerified } = response.data;

        if (userId && email) {
            const userData: AuthUser = {
                userId,
                email,
                name: name || '', // Fallback if missing
                role: role || 'USER',
                isEmailVerified: !!isEmailVerified
            };
            authStorage.setAuth(accessToken, newRefreshToken, userData);
        } else {
            authStorage.setAccessToken(accessToken);
            if (newRefreshToken) authStorage.setRefreshToken(newRefreshToken);
        }

        return accessToken;
    } catch (error: unknown) {
        const err = error as { response?: { data?: unknown }; message?: string };
        console.error('Token refresh failed:', err?.response?.data || err?.message);
        return null;
    }
};

axiosInstance.interceptors.request.use(
    async (config) => {
        // Skip adding Authorization header for auth endpoints
        const authEndpoints = ['/api/auth/login', '/api/auth/register', '/api/auth/refresh', '/api/auth/verify-email'];
        const isAuthEndpoint = authEndpoints.some(endpoint => config.url?.includes(endpoint));

        if (isAuthEndpoint) {
            return config;
        }

        const accessToken = authStorage.getAccessToken();

        if (accessToken) {
            if (isTokenExpired(accessToken)) {
                const newToken = await refreshAccessToken();

                if (newToken) {
                    config.headers.Authorization = `Bearer ${newToken}`;
                } else {
                    authStorage.clearAuth();
                    window.location.href = '/signin';
                    return Promise.reject(new Error('Session expired'));
                }
            } else {
                config.headers.Authorization = `Bearer ${accessToken}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = authStorage.getRefreshToken();
                if (!refreshToken) {
                    authStorage.clearAuth();
                    window.location.href = '/signin';
                    return Promise.reject(error);
                }

                const response = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
                    refreshToken,
                });

                const { accessToken, refreshToken: newRefreshToken } = response.data;

                // Update storage
                authStorage.setAccessToken(accessToken);
                if (newRefreshToken) authStorage.setRefreshToken(newRefreshToken);
                originalRequest.headers.Authorization = `Bearer ${accessToken}`;

                return axiosInstance(originalRequest);

            } catch (refreshError: unknown) {
                const err = refreshError as { response?: { data?: unknown } };
                console.error('Token refresh failed:', err?.response?.data);
                authStorage.clearAuth();
                window.location.href = '/signin';
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;