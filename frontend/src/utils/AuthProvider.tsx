import {type ReactNode, useState, useEffect, useCallback} from "react";
import type {LoginRequest, RegisterRequest} from "@/api-client";
import {useNavigate} from "react-router-dom";
import {authService} from "../services/authService.ts";
import { AuthContext } from "./AuthContext.ts";

interface User {
    userId: number;
    email: string;
    name: string;
    role: string;
    isEmailVerified: boolean;
}

interface AuthContextType {
    user: User | null;
    login: (data: LoginRequest) => Promise<void>;
    register: (data: RegisterRequest) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
    isLoading: boolean;
}


export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState(null as User | null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const initializeAuth = () => {
            try {
                const accessToken = localStorage.getItem('accessToken');
                const storedUser = localStorage.getItem('user');

                if (accessToken && storedUser) {
                    setUser(JSON.parse(storedUser));
                }
            } catch (error) {
                console.error("Failed to initialize auth:", error);
                setUser(null);
                localStorage.clear();
            } finally {
                setIsLoading(false);
            }
        };
        initializeAuth();
    }, []);

    const login = useCallback(async (data: LoginRequest) => {
        try {
            const response = await authService.login(data);
            const userData: User = {
                userId: response.userId,
                email: response.email,
                name: response.name,
                role: response.role,
                isEmailVerified: response.isEmailVerified,
            };
            localStorage.setItem('accessToken', response.accessToken);
            localStorage.setItem('refreshToken', response.refreshToken);
            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);
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
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
            authService.logout(refreshToken).catch(err => console.error("Server logout failed", err));
        }
        setUser(null);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        navigate('/signin');
    }, [navigate]);

    // This is the value that will be available to all components
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