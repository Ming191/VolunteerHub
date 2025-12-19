import type { LoginRequest, RegisterRequest } from "@/api-client";
import { createContext } from "react";

export interface User {
    userId: number;
    email: string;
    name: string;
    role: string;
    isEmailVerified: boolean;
    profilePictureUrl?: string;
}

export interface AuthContextType {
    user: User | null;
    login: (data: LoginRequest) => Promise<void>;
    register: (data: RegisterRequest) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
    isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);