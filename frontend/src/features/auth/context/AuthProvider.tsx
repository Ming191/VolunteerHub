import { type ReactNode, useState, useEffect, useCallback } from "react";
import type { LoginRequest, RegisterRequest } from "@/api-client";
import { useNavigate } from "react-router-dom";
import { authService } from "../api/authService";
import { fcmService } from "@/features/notifications/services/fcmService.ts";
import { AuthContext } from "./AuthContext.ts";
import { authStorage, type AuthUser } from "../utils/authStorage";

interface AuthContextType {
    user: AuthUser | null;
    login: (data: LoginRequest) => Promise<void>;
    register: (data: RegisterRequest) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
    isLoading: boolean;
}


export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const initializeAuth = async () => {
            try {
                const accessToken = authStorage.getAccessToken();
                const storedUser = authStorage.getUser();

                if (accessToken && storedUser) {
                    setUser(storedUser);

                    // Register FCM token for already logged-in users
                    fcmService.registerDeviceForNotifications().catch(err =>
                        console.error("FCM registration failed on init:", err)
                    );
                }
            } catch (error) {
                console.error("Failed to initialize auth:", error);
                setUser(null);
                authStorage.clearAuth();
            } finally {
                setIsLoading(false);
            }
        };
        initializeAuth();
    }, []);

    const login = useCallback(async (data: LoginRequest) => {
        try {
            const response = await authService.login(data);
            const userData: AuthUser = {
                userId: response.userId,
                email: response.email,
                name: response.name,
                role: response.role,
                isEmailVerified: response.isEmailVerified,
            };

            authStorage.setAuth(response.accessToken, response.refreshToken, userData);
            setUser(userData);

            // Register FCM token after successful login
            fcmService.registerDeviceForNotifications().catch(err =>
                console.error("FCM registration failed after login:", err)
            );

            navigate('/dashboard');
        } catch (error) {
            console.log("Login failed:", error);
            throw error;
        }
    }, [navigate]);

    const register = useCallback(async (data: RegisterRequest) => {
        try {
            await authService.register(data);
            navigate('/signin');
        } catch (error) {
            console.log("Registration failed:", error);
            throw error;
        }
    }, [navigate]);

    const logout = useCallback(() => {
        const refreshToken = authStorage.getRefreshToken();
        if (refreshToken) {
            authService.logout(refreshToken).catch(err => console.error("Server logout failed", err));
        }
        setUser(null);
        authStorage.clearAuth();
        navigate('/signin');
    }, [navigate]);

    const value: AuthContextType = {
        user,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        isLoading,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};