// src/pages/UserSettingsPage.tsx
import React, { useState } from "react";
import UserSettingsHeader from "../components/features/userSettings/UserSettingsHeader";
import AppearanceSettings from "../components/features/userSettings/AppearanceSettings";
import NotificationSettings from "../components/features/userSettings/NotificationSettings";
import TableSettings from "../components/features/userSettings/TableSettings";
import PanelSettings from "../components/features/userSettings/PanelSettings";
import { useCurrentUser } from "../context/UserContext";
import { ROLES } from "../utils/GLOBAL_PARAMETERS";
import AdminSettings from "../components/features/userSettings/AdminSettings";

// --- TYPE DEFINITIONS ---
type Theme = "light" | "dark";
type LayoutDensity = "comfortable" | "compact";
type DateFormat = "relative" | "absolute";
type Priority = "LOW" | "MEDIUM" | "HIGH";
type NotificationPreferences = { [key in Priority]: boolean };
interface INotificationSettings {
  inApp: { [key: string]: NotificationPreferences };
  email: { [key: string]: NotificationPreferences };
}
interface IUserSettings {
  appearance: {
    theme: Theme;
    layoutDensity: LayoutDensity;
    defaultDateFormat: DateFormat;
  };
  panelStates: {
    [key: string]: {
      leftPanelCollapsed: boolean;
      rightPanelCollapsed: boolean;
    };
  };
  notifications: INotificationSettings;
  tables: {
    itemsPerPage: number;
    filtersVisible: boolean;
    columnVisibility: { [tableKey: string]: { [columnKey: string]: boolean } };
  };
}

// --- MOCK DATA ---
// This object defines the default state. Note that `theme` is set to 'light'.
const mockUserSettings: IUserSettings = {
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
      new_comment_on_case: { LOW: true, MEDIUM: true, HIGH: true },
      new_answer_on_case: { LOW: false, MEDIUM: true, HIGH: true },
      mention_in_comment: { LOW: true, MEDIUM: true, HIGH: true },
    },
    email: {
      new_comment_on_case: { LOW: false, MEDIUM: false, HIGH: true },
      new_answer_on_case: { LOW: false, MEDIUM: true, HIGH: true },
      mention_in_comment: { LOW: false, MEDIUM: true, HIGH: true },
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

const mockGlobalSettings = {
  priorityReminderDeadlines: {
    LOW: { value: 7, unit: "days" },
    MEDIUM: { value: 3, unit: "days" },
    HIGH: { value: 24, unit: "hours" },
  },
};

const mockUsersForAdmin = [
  {
    _id: "1",
    name: "John Doe",
    username: "john.doe",
    role: { name: "Expert" },
  },
  {
    _id: "2",
    name: "Jane Smith",
    username: "jane.smith",
    role: { name: "Manager" },
  },
  {
    _id: "3",
    name: "Peter Jones",
    username: "peter.jones",
    role: { name: "Admin" },
  },
];

const UserSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<IUserSettings>(mockUserSettings);
  const [globalSettings, setGlobalSettings] = useState(mockGlobalSettings);
  const [hasChanges, setHasChanges] = useState(false);
  const currentUser = useCurrentUser();
  const isAdmin = currentUser.role._id === ROLES.ADMIN;

  const handleSaveChanges = () => {
    console.log("Saving settings:", settings, globalSettings);
    setHasChanges(false);
    alert("Settings saved! (Check console for output)");
  };
  const handleSettingsChange = (
    section: "appearance",
    newValues: Partial<IUserSettings["appearance"]>
  ) => {
    setSettings((prev) => ({
      ...prev,
      [section]: { ...prev[section], ...newValues },
    }));
    setHasChanges(true);
  };
  const handleTableSettingChange = (
    newValues: Partial<Omit<IUserSettings["tables"], "columnVisibility">>
  ) => {
    setSettings((prev) => ({
      ...prev,
      tables: { ...prev.tables, ...newValues },
    }));
    setHasChanges(true);
  };
  const handleNotificationChange = (
    type: "inApp" | "email",
    key: string,
    priority: Priority | "all",
    value: boolean
  ) => {
    setSettings((prev) => {
      const newPrefs = {
        ...(prev.notifications[type][key] || {
          LOW: true,
          MEDIUM: true,
          HIGH: true,
        }),
      };
      if (priority === "all") {
        newPrefs.LOW = value;
        newPrefs.MEDIUM = value;
        newPrefs.HIGH = value;
      } else {
        newPrefs[priority] = value;
      }
      return {
        ...prev,
        notifications: {
          ...prev.notifications,
          [type]: { ...prev.notifications[type], [key]: newPrefs },
        },
      };
    });
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
          [table]: { ...prev.tables.columnVisibility[table], [column]: value },
        },
      },
    }));
    setHasChanges(true);
  };
  const handleGlobalSettingsChange = (newGlobalSettings: any) => {
    setGlobalSettings((prev) => ({ ...prev, ...newGlobalSettings }));
    setHasChanges(true);
  };

  return (
    <div className={settings.appearance.theme}>
      <div className="bg-gray-100 dark:bg-slate-900 min-h-full transition-colors">
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
          <UserSettingsHeader
            onSave={handleSaveChanges}
            isSaving={false}
            hasChanges={hasChanges}
          />
          {isAdmin && (
            <div className="my-8">
              <AdminSettings
                globalSettings={globalSettings}
                onGlobalSettingsChange={handleGlobalSettingsChange}
                users={mockUsersForAdmin}
              />
            </div>
          )}
          <div className="space-y-8 mt-6">
            <AppearanceSettings
              settings={settings.appearance}
              onChange={(newValues) =>
                handleSettingsChange("appearance", newValues)
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
              onTableSettingChange={handleTableSettingChange}
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
