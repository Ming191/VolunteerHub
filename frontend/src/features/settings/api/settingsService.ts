import {
    UserSettingsApi,
    Configuration,
    type UserSettingsResponse,
    type UpdateUserSettingsRequest,
    type ActiveSessionResponse,
    type DeleteAccountRequest,
} from '@/api-client';
import axiosInstance from '@/utils/axiosInstance';
import { authStorage } from '@/features/auth/utils/authStorage';

const config = new Configuration({ basePath: '' });
const settingsApi = new UserSettingsApi(config, undefined, axiosInstance);

const getAuthorizationHeader = (): string => {
    const token = authStorage.getAccessToken();
    return token ? `Bearer ${token}` : '';
};

/**
 * Get current user settings
 */
export const getSettings = async (): Promise<UserSettingsResponse> => {
    const response = await settingsApi.getUserSettings();
    return response.data;
};

/**
 * Update user settings
 */
export const updateSettings = async (
    request: UpdateUserSettingsRequest
): Promise<UserSettingsResponse> => {
    const response = await settingsApi.updateUserSettings({ updateUserSettingsRequest: request });
    return response.data;
};

/**
 * Get active sessions
 */
export const getActiveSessions = async (): Promise<ActiveSessionResponse[]> => {
    const response = await settingsApi.getActiveSessions({ authorization: getAuthorizationHeader() });
    return response.data;
};

/**
 * Revoke a specific session
 */
export const revokeSession = async (sessionId: number): Promise<void> => {
    await settingsApi.revokeSession({ sessionId });
};

/**
 * Revoke all other sessions
 */
export const revokeAllOtherSessions = async (): Promise<void> => {
    await settingsApi.revokeAllOtherSessions({ authorization: getAuthorizationHeader() });
};

/**
 * Delete account (soft delete)
 */
export const deleteAccount = async (request: DeleteAccountRequest): Promise<void> => {
    await settingsApi.deleteAccount({ deleteAccountRequest: request });
};

export const settingsService = {
    getSettings,
    updateSettings,
    getActiveSessions,
    revokeSession,
    revokeAllOtherSessions,
    deleteAccount,
};

