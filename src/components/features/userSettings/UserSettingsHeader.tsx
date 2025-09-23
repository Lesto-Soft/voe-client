// src/components/features/userSettings/UserSettingsHeader.tsx
import React from "react";

interface UserSettingsHeaderProps {
  onSave: () => void;
  isSaving: boolean;
  hasChanges: boolean;
}

const UserSettingsHeader: React.FC<UserSettingsHeaderProps> = ({
  onSave,
  isSaving,
  hasChanges,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Потребителски Настройки
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Управлявайте предпочитанията си за изглед, известия и други.
        </p>
      </div>
      <div className="mt-4 sm:mt-0 sm:ml-4 flex-shrink-0">
        <button
          type="button"
          onClick={onSave}
          disabled={!hasChanges || isSaving}
          className="w-full sm:w-auto rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSaving ? "Запазване..." : "Запази промените"}
        </button>
      </div>
    </div>
  );
};

export default UserSettingsHeader;
