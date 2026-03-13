import React, { useState, useEffect } from "react";
import { useCurrentUser } from "../context/UserContext";
import {
  useUpdateNotificationPreferences,
  NotificationPreferencesInput,
} from "../graphql/hooks/user";
import useDocumentTitle from "../hooks/useDocumentTitle";
import { EnvelopeIcon } from "@heroicons/react/24/outline";

interface ToggleCategory {
  key: keyof NotificationPreferencesInput;
  label: string;
  description: string;
}

const CATEGORIES: ToggleCategory[] = [
  {
    key: "caseNotifications",
    label: "Случаи",
    description:
      "Нов случай, ново решение, коментари, одобрения, повторно отваряне",
  },
  {
    key: "taskNotifications",
    label: "Задачи",
    description:
      "Възложена задача, активност, промяна на статус, смяна на изпълнител",
  },
  {
    key: "mentions",
    label: "Споменавания",
    description: "@ споменавания в случаи и задачи",
  },
  {
    key: "reminders",
    label: "Напомняния",
    description:
      "Напомняния за случаи, наближаващ и изтекъл краен срок на задачи",
  },
];

const SettingsPage: React.FC = () => {
  useDocumentTitle("Настройки");
  const currentUser = useCurrentUser();
  const { updatePreferences, loading } = useUpdateNotificationPreferences();

  const [prefs, setPrefs] = useState({
    caseNotifications: true,
    taskNotifications: true,
    mentions: true,
    reminders: true,
  });

  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  // Initialize from user data
  useEffect(() => {
    if (currentUser?.notificationPreferences) {
      setPrefs({
        caseNotifications:
          currentUser.notificationPreferences.caseNotifications ?? true,
        taskNotifications:
          currentUser.notificationPreferences.taskNotifications ?? true,
        mentions: currentUser.notificationPreferences.mentions ?? true,
        reminders: currentUser.notificationPreferences.reminders ?? true,
      });
    }
  }, [currentUser?.notificationPreferences]);

  const handleToggle = async (key: keyof NotificationPreferencesInput) => {
    const newValue = !prefs[key];
    setPrefs((prev) => ({ ...prev, [key]: newValue }));
    setSaveStatus("saving");

    try {
      await updatePreferences({ [key]: newValue });
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch {
      // Revert on error
      setPrefs((prev) => ({ ...prev, [key]: !newValue }));
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 h-full px-8 py-6">
      <div className="max-w-2xl">
        <div className="flex items-center gap-3 mb-6">
          <EnvelopeIcon className="h-7 w-7 text-gray-600" />
          <h2 className="text-xl font-semibold text-gray-800">
            Имейл известия
          </h2>
        </div>

        <p className="text-sm text-gray-500 mb-6">
          Изберете кои имейл известия искате да получавате. Известията в
          приложението винаги ще пристигат.
        </p>

        <div className="space-y-1">
          {CATEGORIES.map((cat) => (
            <div
              key={cat.key}
              className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
            >
              <div className="flex-1 mr-4">
                <p className="text-sm font-medium text-gray-800">{cat.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {cat.description}
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={prefs[cat.key]}
                disabled={loading}
                onClick={() => handleToggle(cat.key)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 ${
                  prefs[cat.key] ? "bg-blue-500" : "bg-gray-300"
                } ${loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 shadow ${
                    prefs[cat.key] ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          ))}
        </div>

        {saveStatus === "saved" && (
          <p className="text-sm text-green-600 mt-4">Настройките са запазени.</p>
        )}
        {saveStatus === "error" && (
          <p className="text-sm text-red-600 mt-4">
            Грешка при запазване. Опитайте отново.
          </p>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;
