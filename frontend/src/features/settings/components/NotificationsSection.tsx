import { Bell } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { fcmService } from '@/features/notifications/services/fcmService';
import { SettingRow } from './SettingRow';
import type { UserSettingsResponse, UpdateUserSettingsRequest } from '@/api-client';

interface NotificationsSectionProps {
    settings: UserSettingsResponse | undefined;
    updateSettings: (field: keyof UpdateUserSettingsRequest, value: UpdateUserSettingsRequest[keyof UpdateUserSettingsRequest]) => void;
    disabled: boolean;
}

export const NotificationsSection = ({ settings, updateSettings, disabled }: NotificationsSectionProps) => {
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
                        checked={settings?.pushNotificationsEnabled ?? true}
                        onCheckedChange={async (checked) => {
                            if (checked) {
                                // Request permission first
                                const permission = await fcmService.requestNotificationPermission();
                                if (permission === 'granted') {
                                    const registered = await fcmService.registerDeviceForNotifications();
                                    if (registered) {
                                        updateSettings('pushNotificationsEnabled', true);
                                    } else {
                                        toast.error('Failed to register device for notifications');
                                    }
                                } else {
                                    toast.error('Notification permission denied by browser');
                                }
                            } else {
                                updateSettings('pushNotificationsEnabled', false);
                            }
                        }}
                        disabled={disabled}
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
