// src/pages/UserSettingsPage.tsx
import React, { useState } from "react";
import UserSettingsHeader from "../components/features/userSettings/UserSettingsHeader";
import AppearanceSettings from "../components/features/userSettings/AppearanceSettings";
import NotificationSettings from "../components/features/userSettings/NotificationSettings";
import TableSettings from "../components/features/userSettings/TableSettings";
import PanelSettings from "../components/features/userSettings/PanelSettings";

const mockUserSettings = {
  appearance: {
    theme: "light",
    layoutDensity: "comfortable",
    defaultDateFormat: "relative",
  },
  panelStates: {
    userPage: { leftPanelCollapsed: false, rightPanelCollapsed: false },
    categoryPage: { leftPanelCollapsed: false, rightPanelCollapsed: false },
  },
  notifications: {
    inApp: {
      new_comment_on_case: true,
      new_answer_on_case: true,
      mention_in_comment: true,
      mention_in_answer: false,
      approve_answer_close_case: true,
    },
    email: {
      new_comment_on_case: false,
      new_answer_on_case: true,
      mention_in_comment: true,
      mention_in_answer: false,
    },
  },
  tables: {
    itemsPerPage: 10,
    filtersVisible: true,
    columnVisibility: {
      userManagement: { email: true, position: true, role: true },
      dashboard: { priority: true, type: true, categories: true, status: true },
    },
  },
};

const UserSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState(mockUserSettings);
  const [hasChanges, setHasChanges] = useState(false);

  const handleSaveChanges = () => {
    console.log("Saving settings:", settings);
    setHasChanges(false);
    alert("Settings saved! (Check console for output)");
  };

  const handleSettingsChange = (
    section: keyof typeof settings,
    newValues: any
  ) => {
    setSettings((prev) => ({
      ...prev,
      [section]: { ...prev[section], ...newValues },
    }));
    setHasChanges(true);
  };

  const handleTableSettingsChange = (newValues: any) => {
    setSettings((prev) => ({
      ...prev,
      tables: { ...prev.tables, ...newValues },
    }));
    setHasChanges(true);
  };

  const handleNotificationChange = (
    type: "inApp" | "email",
    key: string,
    value: boolean
  ) => {
    setSettings((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [type]: { ...prev.notifications[type], [key]: value },
      },
    }));
    setHasChanges(true);
  };

  const handleColumnVisibilityChange = (
    table: string,
    column: string,
    value: boolean
  ) => {
    setSettings((prev) => ({
      ...prev,
      tables: {
        ...prev.tables,
        columnVisibility: {
          ...prev.tables.columnVisibility,
          [table]: {
            ...prev.tables.columnVisibility[
              table as keyof typeof prev.tables.columnVisibility
            ],
            [column]: value,
          },
        },
      },
    }));
    setHasChanges(true);
  };

  return (
    // This wrapper now controls the theme for the entire page
    <div className={settings.appearance.theme === "light" ? "dark" : ""}>
      <div className="bg-gray-100 dark:bg-slate-900 min-h-full transition-colors">
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
          <UserSettingsHeader
            onSave={handleSaveChanges}
            isSaving={false}
            hasChanges={hasChanges}
          />
          <div className="space-y-6 mt-6">
            <AppearanceSettings
              settings={settings.appearance}
              onChange={(newAppearanceSettings) =>
                handleSettingsChange("appearance", newAppearanceSettings)
              }
            />
            <NotificationSettings
              settings={settings.notifications}
              density={settings.appearance.layoutDensity}
              onChange={handleNotificationChange}
            />
            <TableSettings
              settings={settings.tables}
              density={settings.appearance.layoutDensity}
              onTableSettingChange={handleTableSettingsChange}
              onColumnVisibilityChange={handleColumnVisibilityChange}
            />
            <PanelSettings density={settings.appearance.layoutDensity} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserSettingsPage;
