import { Bell } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { fcmService } from '@/features/notifications/services/fcmService';
import { SettingRow } from './SettingRow';
import type { UserSettingsResponse, UpdateUserSettingsRequest } from '@/api-client';
import { useState, useEffect } from 'react';

interface NotificationsSectionProps {
    settings: UserSettingsResponse | undefined;
    updateSettings: (field: keyof UpdateUserSettingsRequest, value: UpdateUserSettingsRequest[keyof UpdateUserSettingsRequest]) => void;
    disabled: boolean;
}

export const NotificationsSection = ({ settings, updateSettings, disabled }: NotificationsSectionProps) => {
    const [isPushEnabled, setIsPushEnabled] = useState(settings?.pushNotificationsEnabled ?? true);
    const [isProcessingPush, setIsProcessingPush] = useState(false);

    // Sync state with settings when they change
    useEffect(() => {
        setIsPushEnabled(settings?.pushNotificationsEnabled ?? true);
    }, [settings?.pushNotificationsEnabled]);

    const handlePushNotificationToggle = async (checked: boolean) => {
        if (isProcessingPush) return;

        if (checked) {
            setIsProcessingPush(true);
            setIsPushEnabled(true); // Optimistically enable
            
            try {
                // Request permission first
                const permission = await fcmService.requestNotificationPermission();
                if (permission === 'granted') {
                    const registered = await fcmService.registerDeviceForNotifications();
                    if (registered) {
                        updateSettings('pushNotificationsEnabled', true);
                        toast.success('Push notifications enabled');
                    } else {
                        setIsPushEnabled(false); // Revert on failure
                        toast.error('Failed to register device for notifications');
                    }
                } else {
                    setIsPushEnabled(false); // Revert on denial
                    toast.error('Notification permission denied by browser');
                }
            } catch (error) {
                setIsPushEnabled(false); // Revert on error
                toast.error('Failed to enable push notifications');
            } finally {
                setIsProcessingPush(false);
            }
        } else {
            setIsProcessingPush(true);
            setIsPushEnabled(false);
            
            try {
                // Unregister FCM token when disabling
                await fcmService.unregisterDevice();
                updateSettings('pushNotificationsEnabled', false);
                toast.success('Push notifications disabled');
            } catch (error) {
                console.error('Error disabling push notifications:', error);
                updateSettings('pushNotificationsEnabled', false);
            } finally {
                setIsProcessingPush(false);
            }
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-start gap-2">
                    <Bell className="h-5 w-5" />
                    Notifications
                </CardTitle>
                <CardDescription>
                    Manage how you receive notifications
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <SettingRow
                    id="email-notifications"
                    title="Email Notifications"
                    description="Receive notifications via email"
                >
                    <Switch
                        id="email-notifications"
                        checked={settings?.emailNotificationsEnabled ?? true}
                        onCheckedChange={(checked) => updateSettings('emailNotificationsEnabled', checked)}
                        disabled={disabled}
                    />
                </SettingRow>
                <Separator />
                <SettingRow
                    id="push-notifications"
                    title="Push Notifications"
                    description="Receive push notifications in browser"
                >
                    <Switch
                        id="push-notifications"
                        checked={isPushEnabled}
                        onCheckedChange={handlePushNotificationToggle}
                        disabled={disabled || isProcessingPush}
                    />
                </SettingRow>
                <Separator />
                <SettingRow
                    id="event-reminders"
                    title="Event Reminders"
                    description="Get reminded before events you registered for"
                >
                    <Switch
                        id="event-reminders"
                        checked={settings?.eventReminderNotifications ?? true}
                        onCheckedChange={(checked) => updateSettings('eventReminderNotifications', checked)}
                        disabled={disabled}
                    />
                </SettingRow>
                <Separator />
                <SettingRow
                    id="event-updates"
                    title="Event Updates"
                    description="Receive updates about events you're interested in"
                >
                    <Switch
                        id="event-updates"
                        checked={settings?.eventUpdateNotifications ?? true}
                        onCheckedChange={(checked) => updateSettings('eventUpdateNotifications', checked)}
                        disabled={disabled}
                    />
                </SettingRow>
                <Separator />
                <SettingRow
                    id="comment-notifications"
                    title="Comments"
                    description="Get notified when someone comments on your posts"
                >
                    <Switch
                        id="comment-notifications"
                        checked={settings?.commentNotifications ?? true}
                        onCheckedChange={(checked) => updateSettings('commentNotifications', checked)}
                        disabled={disabled}
                    />
                </SettingRow>
            </CardContent>
        </Card>
    );
};
