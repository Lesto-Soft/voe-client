import React, { useState, useMemo } from "react";
import { FlagIcon } from "@heroicons/react/24/solid";

type Priority = "low" | "medium" | "high";
type NotificationEvent =
  | "mention"
  | "newAnswer"
  | "newComment"
  | "answerApproved"
  | "caseStatusChange"
  | "newCaseInCategory";
type NotificationChannel = "inApp" | "email"; // NEW: Defines the notification channels

// MODIFIED: The setting object now supports multiple channels
type NotificationSetting = {
  inApp: boolean;
  email: boolean;
};

type NotificationMatrix = Record<
  NotificationEvent,
  Record<Priority, NotificationSetting>
>;

const NotificationSettings: React.FC = () => {
  // NEW: State to manage which tab is active
  const [activeTab, setActiveTab] = useState<NotificationChannel>("inApp");

  // MODIFIED: Initial state now includes both `inApp` and `email` properties
  const [settings, setSettings] = useState<NotificationMatrix>({
    mention: {
      low: { inApp: true, email: true },
      medium: { inApp: true, email: true },
      high: { inApp: true, email: true },
    },
    newAnswer: {
      low: { inApp: false, email: false },
      medium: { inApp: true, email: true },
      high: { inApp: true, email: true },
    },
    newComment: {
      low: { inApp: false, email: false },
      medium: { inApp: true, email: false },
      high: { inApp: false, email: false },
    },
    answerApproved: {
      low: { inApp: true, email: false },
      medium: { inApp: true, email: false },
      high: { inApp: true, email: true },
    },
    caseStatusChange: {
      low: { inApp: false, email: false },
      medium: { inApp: false, email: false },
      high: { inApp: true, email: true },
    },
    newCaseInCategory: {
      low: { inApp: false, email: false },
      medium: { inApp: false, email: false },
      high: { inApp: true, email: true },
    },
  });

  const notificationEvents = useMemo(
    () => [
      {
        key: "mention" as NotificationEvent,
        label: "Когато някой ме спомене (@mention)",
      },
      {
        key: "newAnswer" as NotificationEvent,
        label: "Ново решение по мой сигнал",
      },
      {
        key: "newComment" as NotificationEvent,
        label: "Нов коментар по мой сигнал",
      },
      {
        key: "answerApproved" as NotificationEvent,
        label: "Мое решение е одобрено",
      },
      {
        key: "caseStatusChange" as NotificationEvent,
        label: "Статусът на мой сигнал е променен",
      },
      {
        key: "newCaseInCategory" as NotificationEvent,
        label: "Нов сигнал в моя категория (за експерти/мениджъри)",
      },
    ],
    []
  );

  const priorities: Priority[] = ["low", "medium", "high"];
  const priorityInfo: Record<
    Priority,
    { label: string; color: string; accentColor: string }
  > = {
    low: {
      label: "Нисък",
      color: "text-green-600",
      accentColor: "accent-green-600",
    },
    medium: {
      label: "Среден",
      color: "text-yellow-600",
      accentColor: "accent-yellow-500",
    },
    high: {
      label: "Висок",
      color: "text-red-600",
      accentColor: "accent-red-600",
    },
  };

  // MODIFIED: All handlers now accept the active `channel` to modify the correct property
  const handleToggle = (
    event: NotificationEvent,
    priority: Priority,
    channel: NotificationChannel
  ) => {
    setSettings((prev) => ({
      ...prev,
      [event]: {
        ...prev[event],
        [priority]: {
          ...prev[event][priority],
          [channel]: !prev[event][priority][channel],
        },
      },
    }));
  };

  const handleToggleAllRow = (
    event: NotificationEvent,
    channel: NotificationChannel
  ) => {
    const areAllCheckedForRow = priorities.every(
      (p) => settings[event][p][channel]
    );
    const newPrioritySettings = { ...settings[event] };
    priorities.forEach((p) => {
      newPrioritySettings[p] = {
        ...newPrioritySettings[p],
        [channel]: !areAllCheckedForRow,
      };
    });
    setSettings((prev) => ({ ...prev, [event]: newPrioritySettings }));
  };

  const handleToggleAllColumn = (
    priority: Priority,
    channel: NotificationChannel
  ) => {
    const areAllCheckedInColumn = notificationEvents.every(
      (e) => settings[e.key][priority][channel]
    );
    const newSettings = { ...settings };
    notificationEvents.forEach((e) => {
      newSettings[e.key][priority] = {
        ...newSettings[e.key][priority],
        [channel]: !areAllCheckedInColumn,
      };
    });
    setSettings(newSettings);
  };

  const handleToggleMaster = (channel: NotificationChannel) => {
    const areAllCheckedMaster = notificationEvents.every((e) =>
      priorities.every((p) => settings[e.key][p][channel])
    );
    const newSettings = { ...settings };
    notificationEvents.forEach((e) => {
      const newPrioritySettings = { ...newSettings[e.key] };
      priorities.forEach((p) => {
        newPrioritySettings[p] = {
          ...newPrioritySettings[p],
          [channel]: !areAllCheckedMaster,
        };
      });
      newSettings[e.key] = newPrioritySettings;
    });
    setSettings(newSettings);
  };

  const areAllTogglesChecked = useMemo(() => {
    return notificationEvents.every((e) =>
      priorities.every((p) => settings[e.key][activeTab])
    );
  }, [settings, notificationEvents, activeTab]);

  const handleSave = () => {
    console.log("Saving Notification Settings:", settings);
    alert("Настройките за известия са запазени (симулация).");
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-xl font-semibold text-gray-800">
        Настройки за известия
      </h2>
      <p className="mt-1 text-sm text-gray-600">
        Изберете за кои събития и с какъв приоритет да получавате известия.
      </p>

      {/* NEW: Tab Navigation */}
      <div className="mt-4 border-b border-gray-200">
        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
          <button
            onClick={() => setActiveTab("inApp")}
            className={`cursor-pointer whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${
              activeTab === "inApp"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            В приложението
          </button>
          <button
            onClick={() => setActiveTab("email")}
            className={`cursor-pointer whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${
              activeTab === "email"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            По Имейл
          </button>
        </nav>
      </div>

      <div className="overflow-x-auto mt-4">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left font-medium text-gray-600">
                Тип на събитието
              </th>
              <th className="p-3 text-center font-medium text-gray-600">
                <label className="flex flex-col items-center gap-1 cursor-pointer">
                  <span>Всички</span>
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
                    checked={areAllTogglesChecked}
                    onChange={() => handleToggleMaster(activeTab)}
                    title="Превключи абсолютно всички известия"
                  />
                </label>
              </th>
              {priorities.map((p) => (
                <th
                  key={p}
                  className="p-3 text-center font-medium text-gray-600"
                >
                  <label className="flex flex-col items-center gap-1 cursor-pointer">
                    <span
                      className={`flex items-center gap-1.5 font-semibold ${priorityInfo[p].color}`}
                    >
                      <FlagIcon className="h-4 w-4" />
                      {priorityInfo[p].label}
                    </span>
                    <input
                      type="checkbox"
                      className={`h-4 w-4 rounded focus:ring-blue-500 ${priorityInfo[p].accentColor}`}
                      checked={notificationEvents.every(
                        (e) => settings[e.key][p][activeTab]
                      )}
                      onChange={() => handleToggleAllColumn(p, activeTab)}
                      title={`Превключи всички за ${priorityInfo[p].label} приоритет`}
                    />
                  </label>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {notificationEvents.map(({ key, label }) => {
              const areAllPrioritiesCheckedForRow = priorities.every(
                (p) => settings[key][p][activeTab]
              );
              return (
                <tr key={key}>
                  <td className="p-3 text-gray-800">{label}</td>
                  <td className="p-3 text-center">
                    <input
                      type="checkbox"
                      className="h-5 w-5 rounded cursor-pointer text-blue-600 focus:ring-blue-500"
                      checked={areAllPrioritiesCheckedForRow}
                      onChange={() => handleToggleAllRow(key, activeTab)}
                      title="Превключи всички приоритети за този ред"
                    />
                  </td>
                  {priorities.map((p) => (
                    <td key={p} className="p-3 text-center">
                      <input
                        type="checkbox"
                        className={`h-5 w-5 rounded cursor-pointer focus:ring-blue-500 ${priorityInfo[p].accentColor}`}
                        checked={settings[key][p][activeTab]}
                        onChange={() => handleToggle(key, p, activeTab)}
                      />
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="pt-6 mt-6 border-t border-gray-200 text-right">
        <button
          onClick={handleSave}
          className="cursor-pointer bg-blue-600 text-white px-5 py-2 rounded-md text-sm font-semibold hover:bg-blue-700"
        >
          Запази промените
        </button>
      </div>
    </div>
  );
};

export default NotificationSettings;
