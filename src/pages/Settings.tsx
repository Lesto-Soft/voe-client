import React, { useState, useEffect, useCallback } from "react";
import { useCurrentUser } from "../context/UserContext";
import {
  useUpdateNotificationPreferences,
  NotificationPreferencesInput,
} from "../graphql/hooks/user";
import useDocumentTitle from "../hooks/useDocumentTitle";
import { useBlocker } from "react-router";
import { toast } from "react-toastify";
import { EnvelopeIcon } from "@heroicons/react/24/outline";
import ConfirmActionDialog from "../components/modals/ConfirmActionDialog";

interface ToggleCategory {
  key: keyof NotificationPreferencesInput;
  label: string;
  description: string;
}

const CATEGORIES: ToggleCategory[] = [
  {
    key: "caseNotifications",
    label: "Сигнали",
    description:
      "Нов сигнал, ново решение, коментари, одобрения, повторно отваряне",
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
    description: "@ споменавания в сигнали и задачи",
  },
  {
    key: "reminders",
    label: "Напомняния",
    description:
      "Напомняния за сигнали, наближаващ и изтекъл краен срок на задачи",
  },
];

type Prefs = Required<NotificationPreferencesInput>;

const DEFAULT_PREFS: Prefs = {
  caseNotifications: true,
  taskNotifications: true,
  mentions: true,
  reminders: true,
};

const SettingsPage: React.FC = () => {
  useDocumentTitle("Настройки");
  const currentUser = useCurrentUser();
  const { updatePreferences } = useUpdateNotificationPreferences();
  // Saved state (what's in the DB)
  const [savedPrefs, setSavedPrefs] = useState<Prefs>(DEFAULT_PREFS);
  // Local working state
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS);

  const [saving, setSaving] = useState(false);

  // Initialize from user data
  useEffect(() => {
    if (currentUser?.notificationPreferences) {
      const fromServer: Prefs = {
        caseNotifications:
          currentUser.notificationPreferences.caseNotifications ?? true,
        taskNotifications:
          currentUser.notificationPreferences.taskNotifications ?? true,
        mentions: currentUser.notificationPreferences.mentions ?? true,
        reminders: currentUser.notificationPreferences.reminders ?? true,
      };
      setSavedPrefs(fromServer);
      setPrefs(fromServer);
    }
  }, [currentUser?.notificationPreferences]);

  // Track dirty state for navigation blocking
  const isDirty = CATEGORIES.some((cat) => prefs[cat.key] !== savedPrefs[cat.key]);

  // Block in-app navigation when dirty
  const blocker = useBlocker(isDirty);

  // Block browser close/refresh when dirty
  useEffect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  const handleToggle = (key: keyof NotificationPreferencesInput) => {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      await updatePreferences(prefs);
      setSavedPrefs(prefs);
      toast.success("Настройките са запазени.", {className: "notification-toast"});
    } catch {
      toast.error("Грешка при запазване. Опитайте отново.");
    } finally {
      setSaving(false);
    }
  }, [prefs, updatePreferences]);

  return (
    <div className="flex flex-col flex-1 min-h-0 h-full items-center px-8 py-6">
      <div className="w-full max-w-2xl">
        {/* Header with save button */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <EnvelopeIcon className="h-7 w-7 text-gray-600" />
            <h2 className="text-xl font-semibold text-gray-800">
              Имейл известия
            </h2>
          </div>
          <button
            onClick={handleSave}
            disabled={!isDirty || saving}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-150 ${
              isDirty && !saving
                ? "bg-blue-500 text-white hover:bg-blue-600 cursor-pointer"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            {saving ? "Запазване..." : "Запази"}
          </button>
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
                onClick={() => handleToggle(cat.key)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 cursor-pointer ${
                  prefs[cat.key] ? "bg-blue-500" : "bg-gray-300"
                }`}
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
      </div>

      {/* Navigation blocker dialog */}
      <ConfirmActionDialog
        isOpen={blocker.state === "blocked"}
        onOpenChange={(open) => {
          if (!open && blocker.state === "blocked") blocker.reset();
        }}
        onConfirm={() => {
          if (blocker.state === "blocked") blocker.proceed();
        }}
        title="Незапазени промени"
        description="Имате незапазени промени. Сигурни ли сте, че искате да напуснете страницата?"
        confirmButtonText="Напускане"
        cancelButtonText="Остани"
        isDestructiveAction
      />
    </div>
  );
};

export default SettingsPage;
