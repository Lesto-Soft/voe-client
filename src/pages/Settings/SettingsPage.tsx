import React, { useState } from "react";
import { useCurrentUser } from "../../context/UserContext";
import { IMe } from "../../db/interfaces";
import { ROLES } from "../../utils/GLOBAL_PARAMETERS";

import SettingsSidebar, { SettingsTab } from "./components/SettingsSidebar";
import AccountSettings from "./components/AccountSettings";
import AppearanceSettings from "./components/AppearanceSettings";
import NotificationSettings from "./components/NotificationSettings";
import BehaviorSettings from "./components/BehaviourSettings";
import AutomationSettings from "./components/AutomationSettings";
import TemplatesSettings from "./components/TemplateSettings";
import BulkChangesSettings from "./components/BulkChangesSettings";

const SettingsPage: React.FC = () => {
  const currentUser = useCurrentUser() as IMe;
  const [activeTab, setActiveTab] = useState<SettingsTab>("account");

  const isAdmin = currentUser.role._id === ROLES.ADMIN;

  const renderContent = () => {
    switch (activeTab) {
      case "account":
        return (
          <AccountSettings currentUser={currentUser} isEditingSelf={true} />
        );
      case "appearance":
        return <AppearanceSettings />;
      case "notifications":
        return <NotificationSettings />;
      case "behavior":
        return <BehaviorSettings />;
      case "automation":
        return isAdmin ? <AutomationSettings /> : null;
      case "templates":
        return isAdmin ? <TemplatesSettings /> : null;
      case "bulkChanges":
        return isAdmin ? <BulkChangesSettings /> : null;
      default:
        return (
          <AccountSettings currentUser={currentUser} isEditingSelf={true} />
        );
    }
  };

  return (
    <div className="container mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Настройки</h1>
        <p className="mt-1 text-md text-gray-600">
          Управлявайте своя профил, известия и предпочитания за приложението.
        </p>
      </header>

      <div className="flex flex-col md:flex-row gap-8">
        <aside className="md:w-1/4 lg:w-1/5 flex-shrink-0">
          <SettingsSidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            isAdmin={isAdmin}
          />
        </aside>
        <main className="flex-1 min-w-0">{renderContent()}</main>
      </div>
    </div>
  );
};

export default SettingsPage;
