// src/components/features/userSettings/AdminSettings.tsx
import React, { useState, useMemo } from "react";
import {
  Cog8ToothIcon,
  DocumentDuplicateIcon,
  UsersIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import CustomMultiSelectDropdown from "../../global/CustomMultiSelectDropdown";
import ConfirmActionDialog from "../../modals/ConfirmActionDialog";

// Mock types for this component
type Priority = "LOW" | "MEDIUM" | "HIGH";
type Unit = "hours" | "days";
interface IUser {
  _id: string;
  name: string;
  username: string;
  role: { name: string };
}

// Mock a more detailed template structure
interface IMockTemplate {
  _id: string;
  name: string;
  description: string;
  settings: {
    appearance?: { theme?: "light" | "dark" };
    notifications?: { inApp?: { [key: string]: { LOW?: boolean } } };
  };
}

interface AdminSettingsProps {
  globalSettings: {
    priorityReminderDeadlines: {
      [key in Priority]: { value: number; unit: Unit };
    };
  };
  onGlobalSettingsChange: (newSettings: any) => void;
  users: IUser[];
}

const AdminSettings: React.FC<AdminSettingsProps> = ({
  globalSettings,
  onGlobalSettingsChange,
  users,
}) => {
  const [activeTab, setActiveTab] = useState<"global" | "templates" | "bulk">(
    "global"
  );

  const [deadlines, setDeadlines] = useState(
    globalSettings.priorityReminderDeadlines
  );
  const [templates, setTemplates] = useState<IMockTemplate[]>([
    {
      _id: "t1",
      name: "Стандартен Експерт",
      description: "Настройки по подразбиране за експерти.",
      settings: {
        appearance: { theme: "light" },
        notifications: { inApp: { new_comment_on_case: { LOW: true } } },
      },
    },
    {
      _id: "t2",
      name: "Мениджър",
      description: "Всички известия са включени.",
      settings: {
        appearance: { theme: "dark" },
        notifications: { inApp: { new_comment_on_case: { LOW: true } } },
      },
    },
  ]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(
    null
  );
  const [currentTemplateData, setCurrentTemplateData] = useState<
    Partial<IMockTemplate>
  >({});
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [templateToApplyId, setTemplateToApplyId] = useState<string>("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const selectedTemplate = useMemo(
    () => templates.find((t) => t._id === selectedTemplateId),
    [templates, selectedTemplateId]
  );

  const handleDeadlineChange = (
    priority: Priority,
    key: "value" | "unit",
    value: string | number
  ) => {
    const newDeadlines = {
      ...deadlines,
      [priority]: {
        ...deadlines[priority],
        [key]: key === "value" ? Number(value) : value,
      },
    };
    setDeadlines(newDeadlines);
    onGlobalSettingsChange({ priorityReminderDeadlines: newDeadlines });
  };

  const handleSelectTemplate = (id: string) => {
    setSelectedTemplateId(id);
    setCurrentTemplateData(templates.find((t) => t._id === id) || {});
  };

  const handleCreateNewTemplate = () => {
    setSelectedTemplateId(null);
    setCurrentTemplateData({ name: "Нов шаблон", description: "" });
  };

  const handleSaveTemplate = () => {
    if (selectedTemplateId) {
      // Editing
      setTemplates(
        templates.map((t) =>
          t._id === selectedTemplateId
            ? ({ ...t, ...currentTemplateData } as IMockTemplate)
            : t
        )
      );
    } else {
      // Creating
      const newTemplate = {
        _id: `t${Date.now()}`,
        ...currentTemplateData,
      } as IMockTemplate;
      setTemplates([...templates, newTemplate]);
      setSelectedTemplateId(newTemplate._id);
    }
    alert("Шаблонът е запазен!");
  };

  const handleDeleteTemplate = () => {
    if (!selectedTemplateId) return;
    setTemplates(templates.filter((t) => t._id !== selectedTemplateId));
    setShowDeleteConfirm(false);
    setSelectedTemplateId(null);
    setCurrentTemplateData({});
    alert("Шаблонът е изтрит!");
  };

  const userOptions = users.map((u) => ({
    value: u._id,
    label: `${u.name} (${u.role.name})`,
  }));

  return (
    <div className="bg-white dark:bg-slate-800 shadow-md rounded-lg overflow-hidden transition-colors border-2 border-red-500 dark:border-red-600">
      <div className="px-4 py-3 sm:px-6 bg-red-50 dark:bg-slate-900/50 border-b-2 border-red-500 dark:border-red-600">
        <h2 className="text-lg font-medium leading-6 text-red-800 dark:text-red-300">
          Административен Панел
        </h2>
        <p className="mt-1 max-w-2xl text-sm text-red-600 dark:text-red-400">
          Промените тук засягат цялата система или други потребители.
        </p>
      </div>
      <div className="border-t border-gray-200 dark:border-red-600">
        <div className="border-b border-gray-200 dark:border-slate-700">
          <nav className="-mb-px flex space-x-6 px-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab("global")}
              className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium ${
                activeTab === "global"
                  ? "border-red-500 text-red-600 dark:text-red-400"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600"
              }`}
            >
              <Cog8ToothIcon className="h-5 w-5" />
              Глобални
            </button>
            <button
              onClick={() => setActiveTab("templates")}
              className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium ${
                activeTab === "templates"
                  ? "border-red-500 text-red-600 dark:text-red-400"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600"
              }`}
            >
              <DocumentDuplicateIcon className="h-5 w-5" />
              Шаблони
            </button>
            <button
              onClick={() => setActiveTab("bulk")}
              className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium ${
                activeTab === "bulk"
                  ? "border-red-500 text-red-600 dark:text-red-400"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600"
              }`}
            >
              <UsersIcon className="h-5 w-5" />
              Масови Промени
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === "global" && (
            <div>
              <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200">
                Срокове за напомняне
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Задайте след колко време да се изпраща известие за напомняне за
                отворени сигнали.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {(["HIGH", "MEDIUM", "LOW"] as Priority[]).map((p) => (
                  <div
                    key={p}
                    className="p-3 bg-gray-50 dark:bg-slate-700/50 rounded-md"
                  >
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Приоритет: {p}
                    </label>
                    <div className="mt-1 flex gap-2">
                      <input
                        type="number"
                        value={deadlines[p].value}
                        onChange={(e) =>
                          handleDeadlineChange(p, "value", e.target.value)
                        }
                        className="w-20 rounded-md border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 dark:text-gray-200 shadow-sm sm:text-sm"
                      />
                      <select
                        value={deadlines[p].unit}
                        onChange={(e) =>
                          handleDeadlineChange(p, "unit", e.target.value)
                        }
                        className="w-full rounded-md border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 dark:text-gray-200 shadow-sm sm:text-sm"
                      >
                        <option value="hours">часа</option>
                        <option value="days">дни</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "templates" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  Списък с шаблони
                </h3>
                <button
                  onClick={handleCreateNewTemplate}
                  className="w-full flex items-center justify-center gap-2 mb-2 px-3 py-2 text-sm font-semibold bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                >
                  <PlusIcon className="h-5 w-5" />
                  Създай нов
                </button>
                <div className="space-y-1">
                  {templates.map((t) => (
                    <button
                      key={t._id}
                      onClick={() => handleSelectTemplate(t._id)}
                      className={`w-full text-left p-2 rounded-md text-sm transition-colors ${
                        selectedTemplateId === t._id
                          ? "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-semibold"
                          : "hover:bg-gray-100 dark:hover:bg-slate-700"
                      }`}
                    >
                      {t.name}
                    </button>
                  ))}
                </div>
              </div>
              <div className="md:col-span-2">
                {currentTemplateData.name ? (
                  <div className="p-4 border border-gray-200 dark:border-slate-700 rounded-lg">
                    <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-4">
                      {selectedTemplateId
                        ? "Редактиране на шаблон"
                        : "Създаване на нов шаблон"}
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label
                          htmlFor="templateName"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                          Име на шаблона
                        </label>
                        <input
                          type="text"
                          id="templateName"
                          value={currentTemplateData.name || ""}
                          onChange={(e) =>
                            setCurrentTemplateData((p) => ({
                              ...p,
                              name: e.target.value,
                            }))
                          }
                          className="mt-1 bg-white dark:bg-slate-900 w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm sm:text-sm"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="templateDesc"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                          Описание
                        </label>
                        <textarea
                          id="templateDesc"
                          value={currentTemplateData.description || ""}
                          onChange={(e) =>
                            setCurrentTemplateData((p) => ({
                              ...p,
                              description: e.target.value,
                            }))
                          }
                          rows={2}
                          className="mt-1 bg-white dark:bg-slate-900 w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm sm:text-sm"
                        ></textarea>
                      </div>
                      <div className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-md text-center text-sm text-gray-500 dark:text-gray-400">
                        <p className="font-semibold">
                          Пълната форма за настройки ще се покаже тук.
                        </p>
                        <p>
                          (Напр. включен Тъмен режим, изключени известия за
                          коментари с нисък приоритет и т.н.)
                        </p>
                      </div>
                      <div className="flex justify-end gap-2">
                        {selectedTemplateId && (
                          <button
                            onClick={() => setShowDeleteConfirm(true)}
                            className="px-4 py-2 text-sm font-medium text-red-600 bg-red-100 hover:bg-red-200 rounded-md"
                          >
                            Изтрий
                          </button>
                        )}
                        <button
                          onClick={handleSaveTemplate}
                          className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
                        >
                          Запази
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 h-full flex items-center justify-center bg-gray-50 dark:bg-slate-700/50 rounded-md text-center text-gray-500 dark:text-gray-400">
                    <p>Изберете шаблон за редакция или създайте нов.</p>
                  </div>
                )}
              </div>
            </div>
          )}
          {activeTab === "bulk" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200">
                  1. Изберете потребители
                </h3>
                <CustomMultiSelectDropdown
                  label=""
                  options={userOptions}
                  selectedValues={selectedUserIds}
                  onChange={setSelectedUserIds}
                  widthClass="w-full mt-2"
                  placeholder="Търси и избери потребители..."
                />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200">
                  2. Изберете действие
                </h3>
                <div className="mt-2 p-4 border border-gray-200 dark:border-slate-700 rounded-lg space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Прилагане на шаблон
                    </label>
                    <div className="flex gap-2 mt-1">
                      <select
                        value={templateToApplyId}
                        onChange={(e) => setTemplateToApplyId(e.target.value)}
                        className="w-full rounded-md border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 dark:text-gray-200 shadow-sm sm:text-sm"
                      >
                        <option value="">-- Избери шаблон --</option>
                        {templates.map((t) => (
                          <option key={t._id} value={t._id}>
                            {t.name}
                          </option>
                        ))}
                      </select>
                      <button
                        disabled={
                          !templateToApplyId || selectedUserIds.length === 0
                        }
                        className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md disabled:opacity-50"
                      >
                        Приложи
                      </button>
                    </div>
                  </div>
                  <div className="border-t border-gray-200 dark:border-slate-700"></div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Блокиране на настройки
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Предотвратете промяната на настройки от избраните
                      потребители.
                    </p>
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="lock-all"
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <label
                          htmlFor="lock-all"
                          className="ml-2 text-sm dark:text-gray-300"
                        >
                          Блокирай всички настройки
                        </label>
                      </div>
                      <div className="flex items-center ml-4">
                        <input
                          type="checkbox"
                          id="lock-appearance"
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <label
                          htmlFor="lock-appearance"
                          className="ml-2 text-sm dark:text-gray-300"
                        >
                          Блокирай само "Изглед и Оформление"
                        </label>
                      </div>
                    </div>
                    <button
                      disabled={selectedUserIds.length === 0}
                      className="mt-3 px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-md disabled:opacity-50"
                    >
                      Приложи блокиране
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <ConfirmActionDialog
        isOpen={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        onConfirm={handleDeleteTemplate}
        title="Изтриване на шаблон"
        description={`Сигурни ли сте, че искате да изтриете шаблона "${selectedTemplate?.name}"?`}
        confirmButtonText="Изтрий"
        isDestructiveAction
      />
    </div>
  );
};

export default AdminSettings;
