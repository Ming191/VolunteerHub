import { Monitor } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AnimatedThemeToggler } from '@/components/ui/animated-theme-toggler';
import { SettingRow } from './SettingRow';
import type { UserSettingsResponse, UpdateUserSettingsRequest } from '@/api-client';

interface AppearanceSectionProps {
    settings: UserSettingsResponse | undefined;
    updateSettings: (field: keyof UpdateUserSettingsRequest, value: UpdateUserSettingsRequest[keyof UpdateUserSettingsRequest]) => void;
    disabled: boolean;
}

export const AppearanceSection = ({ settings, updateSettings, disabled }: AppearanceSectionProps) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-start gap-2">
                    <Monitor className="h-5 w-5" />
                    Appearance
                </CardTitle>
                <CardDescription>
                    Customize how the app looks
                </CardDescription>
            </CardHeader>
            <CardContent>
                <SettingRow
                    id="theme"
                    title="Theme"
                    description="Select your preferred theme"
                >
                    <div className="flex items-center gap-2">
                        <AnimatedThemeToggler
                            disabled={disabled}
                            onToggle={(newTheme: string) => {
                                const backendValue = newTheme === 'dark' ? 'DARK' : 'LIGHT';
                                updateSettings('theme', backendValue);
                            }}
                        />
                    </div>
                </SettingRow>
            </CardContent>
        </Card>
    );
};
