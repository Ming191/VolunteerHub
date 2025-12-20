import { type ReactNode, useState, useEffect, useCallback } from "react";
import {
  type LoginRequest,
  type RegisterRequest,
  Configuration,
  UserProfileApi,
} from "@/api-client";
import { router } from "@/router";
import { authService } from "../api/authService";
import { fcmService } from "@/features/notifications/services/fcmService.ts";
import { AuthContext } from "./AuthContext.ts";
import { authStorage, type AuthUser } from "../utils/authStorage";
import axiosInstance from "@/utils/axiosInstance";

interface AuthContextType {
  user: AuthUser | null;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const config = new Configuration({ basePath: "" });
const userProfileApi = new UserProfileApi(config, undefined, axiosInstance);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const accessToken = authStorage.getAccessToken();
        const storedUser = authStorage.getUser();

        if (accessToken && storedUser) {
          // Optimistically set stored user
          setUser(storedUser);

          try {
            // Refresh profile data to get latest avatar
            const profileRes = await userProfileApi.getMyProfile();
            const freshUser = {
              ...storedUser,
              ...profileRes.data,
              // Ensure mapping is correct if field names differ
            };
            // @ts-expect-error - profilePictureUrl might be missing in type definition if unrelated
            if (profileRes.data.profilePictureUrl) {
              // @ts-expect-error
              freshUser.profilePictureUrl = profileRes.data.profilePictureUrl;
            }

            setUser(freshUser);
            authStorage.setUser(freshUser);
          } catch (err) {
            console.warn("Failed to refresh profile on init:", err);
          }

          // Register FCM token for already logged-in users
          fcmService
            .registerDeviceForNotifications()
            .catch((err) =>
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

      // Set token first so axios interceptor picks it up
      authStorage.setAuth(response.accessToken, response.refreshToken, {
        userId: response.userId,
        email: response.email,
        name: response.name,
        role: response.role,
        isEmailVerified: response.isEmailVerified,
      });

      // Fetch full profile to get avatar
      let profilePictureUrl: string | undefined;
      try {
        const profileRes = await userProfileApi.getMyProfile();
        // @ts-expect-error
        profilePictureUrl = profileRes.data.profilePictureUrl;
      } catch (e) {
        console.warn("Failed to fetch profile after login", e);
      }

      const userData: AuthUser = {
        userId: response.userId,
        email: response.email,
        name: response.name,
        role: response.role,
        isEmailVerified: response.isEmailVerified,
        profilePictureUrl: profilePictureUrl,
      };

      // Update storage with full user data
      authStorage.setUser(userData);
      setUser(userData);

      // Register FCM token after successful login
      fcmService
        .registerDeviceForNotifications()
        .catch((err) =>
          console.error("FCM registration failed after login:", err)
        );
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  }, []);

  const register = useCallback(async (data: RegisterRequest) => {
    try {
      await authService.register(data);
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    const refreshToken = authStorage.getRefreshToken();
    if (refreshToken) {
      authService
        .logout(refreshToken)
        .catch((err) => console.error("Server logout failed", err));
    }
    setUser(null);
    authStorage.clearAuth();
    router.navigate({ to: "/signin" });
  }, []);

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
