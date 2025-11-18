import axios from 'axios';

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

const updateTokensAndUserData = (responseData: {
    accessToken: string;
    refreshToken: string;
    userId?: number;
    email?: string;
    name?: string;
    role?: string;
    isEmailVerified?: boolean;
}): void => {
    localStorage.setItem('accessToken', responseData.accessToken);
    localStorage.setItem('refreshToken', responseData.refreshToken);

    if (responseData.userId && responseData.email) {
        const userData = {
            userId: responseData.userId,
            email: responseData.email,
            name: responseData.name,
            role: responseData.role,
            isEmailVerified: responseData.isEmailVerified,
        };
        localStorage.setItem('user', JSON.stringify(userData));
    }
};

const refreshAccessToken = async (): Promise<string | null> => {
    try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
            return null;
        }

        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
        });

        updateTokensAndUserData(response.data);
        return response.data.accessToken;
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

        const accessToken = localStorage.getItem('accessToken');

        if (accessToken) {
            if (isTokenExpired(accessToken)) {
                const newToken = await refreshAccessToken();

                if (newToken) {
                    config.headers.Authorization = `Bearer ${newToken}`;
                } else {
                    localStorage.clear();
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
                const refreshToken = localStorage.getItem('refreshToken');
                if (!refreshToken) {
                    localStorage.clear();
                    window.location.href = '/signin';
                    return Promise.reject(error);
                }

                const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
                    refreshToken,
                });

                updateTokensAndUserData(response.data);
                originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;

                return axiosInstance(originalRequest);

            } catch (refreshError: unknown) {
                const err = refreshError as { response?: { data?: unknown } };
                console.error('Token refresh failed:', err?.response?.data);
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');
                window.location.href = '/signin';
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;