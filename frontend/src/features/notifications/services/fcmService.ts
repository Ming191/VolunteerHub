import { messaging, getToken, onMessage, VAPID_KEY } from '@/utils/firebaseConfig';
import { UserProfileApi, Configuration } from '@/api-client';
import axiosInstance from '@/utils/axiosInstance';
import type { MessagePayload } from 'firebase/messaging';

const config = new Configuration({ basePath: '' });
const userProfileApi = new UserProfileApi(config, undefined, axiosInstance);

/**
 * Request notification permission from the browser
 * @returns Permission state: 'granted', 'denied', or 'default'
 */
const requestNotificationPermission = async (): Promise<NotificationPermission> => {
    try {
        if (!('Notification' in window)) {
            console.warn('This browser does not support notifications');
            return 'denied';
        }

        if (Notification.permission === 'granted') {
            return 'granted';
        }

        if (Notification.permission === 'denied') {
            return 'denied';
        }

        const permission = await Notification.requestPermission();
        return permission;
    } catch (error) {
        console.error('Error requesting notification permission:', error);
        return 'denied';
    }
};

/**
 * Get FCM device token from Firebase Messaging
 * @returns FCM token string or null if failed
 */
const getFcmToken = async (): Promise<string | null> => {
    const cached = localStorage.getItem('fcmToken');
    if (cached) {
        return cached;
    }
    try {
        if (!messaging) {
            console.warn('Firebase Messaging is not initialized');
            return null;
        }

        const permission = await requestNotificationPermission();
        if (permission !== 'granted') {
            return null;
        }

        const token = await getToken(messaging, {
            vapidKey: VAPID_KEY,
        });

        if (token) {
            localStorage.setItem('fcmToken', token);
            return token;
        } else {
            console.warn('No FCM token available');
            return null;
        }
    } catch (error) {
        console.error('Error getting FCM token:', error);
        return null;
    }
};

/**
 * Register FCM token with the backend
 * @param token - FCM device token
 * @returns True if successful, false otherwise
 * @throws Error if registration fails - handled by caller or retry logic
 */
const registerFcmToken = async (token: string): Promise<boolean> => {
    try {
        await userProfileApi.addFcmToken({
            requestBody: { token },
        });
        return true;
    } catch (error) {
        console.error('Failed to register FCM token with backend:', error);
        // Simple retry once after 3 seconds
        setTimeout(() => {
            userProfileApi.addFcmToken({ requestBody: { token } })
                .catch(e => console.error('Retry failed for FCM token registration:', e));
        }, 3000);
        return false;
    }
};

/**
 * Complete flow: Get FCM token and register with backend
 * Call this after user login or on app initialization
 * @returns True if successful, false otherwise
 */
const registerDeviceForNotifications = async (): Promise<boolean> => {
    try {
        const token = await getFcmToken();
        if (!token) {
            return false;
        }

        const success = await registerFcmToken(token);
        return success;
    } catch (error) {
        console.error('Error registering device for notifications:', error);
        return false;
    }
};

/**
 * Setup foreground message listener
 * Call this once in App.tsx or main.tsx
 * @param callback - Function to handle incoming messages
 */
const setupForegroundMessageListener = (
    callback: (payload: MessagePayload) => void
): (() => void) => {
    if (!messaging) {
        console.warn('Firebase Messaging not initialized, skipping foreground listener');
        return () => { };
    }

    const unsubscribe = onMessage(messaging, (payload) => {
        callback(payload);
    });

    return unsubscribe;
};

export const fcmService = {
    requestNotificationPermission,
    getFcmToken,
    registerFcmToken,
    registerDeviceForNotifications,
    setupForegroundMessageListener,
};
