import {
    AuthenticationApi,
    Configuration,
    type LoginRequest,
    type RegisterRequest, UserProfileApi,
    type VerifyEmailResponse,
} from '@/api-client';
import axiosInstance from '@/utils/axiosInstance';

const config = new Configuration({ basePath: '' });

const authApi = new AuthenticationApi(config, undefined, axiosInstance);

const userProfileApi = new UserProfileApi(config, undefined, axiosInstance);

/**
 * Logs in a user.
 * @param loginData - The user's email and password.
 * @returns The response from the API, containing user info and tokens.
 */
const login = async (loginData: LoginRequest) => {
    try {
        const response = await authApi.login({ loginRequest: loginData });
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
        const response = await authApi.register({ registerRequest: registerData });
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
        await authApi.logout({ requestBody: { refreshToken } });
    } catch (error) {
        console.error('Server logout failed:', error);
    }
};

/**
 * Verifies a user's email address using the token from the verification email.
 * @param token - The verification token from the email link.
 * @returns The response from the API confirming verification.
 */
const verifyEmail = async (token: string): Promise<VerifyEmailResponse> => {
    try {
        const response = await authApi.verifyEmail({ token });
        return response.data as VerifyEmailResponse;
    } catch (error) {
        console.error('Email verification failed:', error);
        throw error;
    }
};

const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
    await userProfileApi.changePassword({
        changePasswordRequest: {
            currentPassword,
            newPassword,
        }
    });
};

export const authService = {
    login,
    register,
    logout,
    verifyEmail,
    changePassword
};
