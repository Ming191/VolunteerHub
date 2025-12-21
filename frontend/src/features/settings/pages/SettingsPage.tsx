import { Settings, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SkeletonTransition } from "@/components/common/SkeletonTransition";
import { SettingsPageSkeleton } from "../components/SettingsPageSkeleton";
import { useSettings } from "../hooks/useSettings";
import { NotificationsSection, PrivacySection } from "../components";
import { ChangePasswordCard } from "../components/ChangePasswordCard";

export const SettingsPage = () => {
  const {
    settings,
    isLoading,
    updateSettings,
    saveSettings,
    discardChanges,
    hasChanges,
    isSaving,
  } = useSettings();

  return (
    <SkeletonTransition
      isLoading={isLoading}
      skeleton={<SettingsPageSkeleton />}
    >
      <div className="w-full max-w-4xl mx-auto px-4 space-y-6 pb-24">
        {/* Header */}
        <div className="flex items-start gap-3">
          <Settings className="h-8 w-8" />
          <h1 className="text-3xl font-bold">Settings</h1>
        </div>

        <NotificationsSection
          settings={settings}
          updateSettings={updateSettings}
          disabled={isSaving}
        />

        {/* Theme switching temporarily disabled - light theme only */}
        {/* <AppearanceSection
          settings={settings}
          updateSettings={updateSettings}
          disabled={isSaving}
        /> */}

        <PrivacySection
          settings={settings}
          updateSettings={updateSettings}
          disabled={isSaving}
        />

        <ChangePasswordCard />

        {/* Fixed Bottom Action Bar */}
        {hasChanges && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
            <div className="w-full max-w-4xl mx-auto px-4 py-4">
              <div className="flex items-center justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={discardChanges}
                  disabled={isSaving}
                >
                  Discard
                </Button>
                <Button onClick={saveSettings} disabled={isSaving}>
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </SkeletonTransition>
  );
};
