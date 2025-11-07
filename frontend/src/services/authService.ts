import {
    AuthenticationApi,
    Configuration,
    type LoginRequest,
    type RegisterRequest,
} from '@/api-client';
import axiosInstance from '../utils/axiosInstance';

const config = new Configuration({ basePath: '' });

const authApi = new AuthenticationApi(config, undefined, axiosInstance);

/**
 * Logs in a user.
 * @param loginData - The user's email and password.
 * @returns The response from the API, containing user info and tokens.
 */
const login = async (loginData: LoginRequest) => {
    try {
        const response = await authApi.login(loginData);
        return response.data;
    } catch (error) {
        console.error('Login failed:', error);
        throw error;
    }
};

/**
 * Registers a new user.
 * @param registerData - The user's registration details.
 * @returns The response from the API confirming registration.
 */
const register = async (registerData: RegisterRequest) => {
    try {
        const response = await authApi.register(registerData);
        return response.data;
    } catch (error) {
        console.error('Registration failed:', error);
        throw error;
    }
};

/**
 * Logs out a user by revoking their refresh token.
 * @param refreshToken - The user's current refresh token.
 */
const logout = async (refreshToken: string) => {
    try {
        await authApi.logout({ refreshToken });
    } catch (error) {
        console.error('Server logout failed:', error);
    }
};

export const authService = {
    login,
    register,
    logout,
};