import { Shield } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { SettingRow } from './SettingRow';
import type { UserSettingsResponse, UpdateUserSettingsRequest } from '@/api-client';

interface PrivacySectionProps {
    settings: UserSettingsResponse | undefined;
    updateSettings: (field: keyof UpdateUserSettingsRequest, value: UpdateUserSettingsRequest[keyof UpdateUserSettingsRequest]) => void;
    disabled: boolean;
}

export const PrivacySection = ({ settings, updateSettings, disabled }: PrivacySectionProps) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-start gap-2">
                    <Shield className="h-5 w-5" />
                    Privacy
                </CardTitle>
                <CardDescription>
                    Control your profile visibility
                </CardDescription>
            </CardHeader>
            <CardContent>
                <SettingRow
                    id="profile-visibility"
                    title="Profile Visibility"
                    description="Control who can see your profile"
                >
                    <Select
                        value={settings?.profileVisibility ?? 'PUBLIC'}
                        onValueChange={(value) => updateSettings('profileVisibility', value as 'PUBLIC' | 'PRIVATE')}
                        disabled={disabled}
                    >
                        <SelectTrigger className="w-40">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="PUBLIC">Public</SelectItem>
                            <SelectItem value="PRIVATE">Private</SelectItem>
                        </SelectContent>
                    </Select>
                </SettingRow>
            </CardContent>
        </Card>
    );
};
