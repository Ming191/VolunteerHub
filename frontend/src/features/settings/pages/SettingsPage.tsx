import { Settings, Save, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SkeletonTransition } from "@/components/common/SkeletonTransition";
import { SettingsPageSkeleton } from "../components/SettingsPageSkeleton";
import { useSettings } from "../hooks/useSettings";
import { NotificationsSection, PrivacySection } from "../components";
import { ChangePasswordCard } from "../components/ChangePasswordCard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useNavigate } from "@tanstack/react-router";

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
  const navigate = useNavigate();

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

        {/* Legal Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Legal
            </CardTitle>
            <CardDescription>
              View our terms of service and privacy policy
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start text-left"
              onClick={() => navigate({ to: "/terms-of-service" })}
            >
              <FileText className="mr-2 h-4 w-4" />
              Terms of Service
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start text-left"
              onClick={() => navigate({ to: "/privacy-policy" })}
            >
              <FileText className="mr-2 h-4 w-4" />
              Privacy Policy
            </Button>
          </CardContent>
        </Card>

        <ChangePasswordCard />

        {/* Action Buttons at Bottom */}
        {hasChanges && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={discardChanges}
                  disabled={isSaving}
                >
                  Discard
                </Button>
                <Button
                  variant="green"
                  onClick={saveSettings}
                  disabled={isSaving}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </SkeletonTransition>
  );
};
