import axios from 'axios';
import { authStorage } from '@/features/auth/utils/authStorage';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
const axiosInstance = axios.create({ baseURL: API_BASE_URL, withCredentials: true });

const isTokenExpired = (token: string): boolean => {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return Date.now() >= payload.exp * 1000;
    } catch {
        return true;
    }
};

// One refresh transaction prevents parallel requests from consuming the same rotating cookie.
let pendingRefresh: Promise<string | null> | null = null;
export const refreshAccessToken = (): Promise<string | null> => {
    if (pendingRefresh) return pendingRefresh;
    pendingRefresh = axios.post<{ accessToken: string }>(`${API_BASE_URL}/api/auth/refresh`, {}, {
        withCredentials: true,
        headers: { 'X-VH-Session': '1' },
    }).then(({ data }) => {
        authStorage.setAccessToken(data.accessToken);
        return data.accessToken;
    }).catch(() => {
        authStorage.clearAuth();
        return null;
    }).finally(() => { pendingRefresh = null; });
    return pendingRefresh;
};

const authEndpoints = ['/api/auth/login', '/api/auth/register', '/api/auth/refresh',
    '/api/auth/verify-email', '/api/auth/logout'];

axiosInstance.interceptors.request.use(async config => {
    const isAuthEndpoint = authEndpoints.some(endpoint => config.url?.includes(endpoint));
    if (config.url?.includes('/api/auth/login') || config.url?.includes('/api/auth/logout')) {
        config.headers.set('X-VH-Session', '1');
    }
    if (isAuthEndpoint) return config;

    let token = authStorage.getAccessToken();
    if (token && isTokenExpired(token)) token = await refreshAccessToken();
    if (token) config.headers.set('Authorization', `Bearer ${token}`);
    return config;
});

axiosInstance.interceptors.response.use(response => response, async error => {
    const original = error.config;
    if (error.response?.status !== 401 || !original || original._retry ||
        authEndpoints.some(endpoint => original.url?.includes(endpoint))) {
        return Promise.reject(error);
    }
    original._retry = true;
    const token = await refreshAccessToken();
    if (!token) {
        window.location.href = '/signin';
        return Promise.reject(error);
    }
    original.headers.set('Authorization', `Bearer ${token}`);
    return axiosInstance(original);
});

export default axiosInstance;
