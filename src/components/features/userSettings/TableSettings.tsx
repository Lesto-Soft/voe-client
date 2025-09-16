// src/components/features/userSettings/TableSettings.tsx
import React from "react";
import * as Switch from "@radix-ui/react-switch";

const mockTableConfigs = {
  dashboard: {
    label: "Табло (Сигнали)",
    columns: {
      priority: "Приоритет",
      type: "Тип",
      categories: "Категории",
      status: "Статус",
    },
  },
  userManagement: {
    label: "Управление на Потребители",
    columns: {
      position: "Позиция",
      email: "Имейл",
      role: "Роля",
    },
  },
};

interface TableSettingsProps {
  settings: {
    itemsPerPage: number;
    filtersVisible: boolean;
    columnVisibility: {
      [tableKey: string]: { [columnKey: string]: boolean };
    };
  };
  onTableSettingChange: (
    newSettings: Partial<TableSettingsProps["settings"]>
  ) => void;
  onColumnVisibilityChange: (
    table: string,
    column: string,
    value: boolean
  ) => void;
  density: "comfortable" | "compact";
}

const TableSettings: React.FC<TableSettingsProps> = ({
  settings,
  onTableSettingChange,
  onColumnVisibilityChange,
  density,
}) => {
  return (
    <div className="bg-white dark:bg-slate-800 shadow-md rounded-lg overflow-hidden transition-colors">
      <div
        className={`px-4 sm:px-6 ${density === "compact" ? "py-4" : "py-5"}`}
      >
        <h2 className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100">
          Настройки на Таблици
        </h2>
        <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
          Контролирайте показването на данни в основните таблици.
        </p>
      </div>
      <div
        className={`border-t border-gray-200 dark:border-slate-700 px-4 sm:p-6 ${
          density === "compact" ? "py-4 space-y-4" : "py-5 space-y-6"
        }`}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="itemsPerPage"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Резултати на страница
            </label>
            <select
              id="itemsPerPage"
              value={settings.itemsPerPage}
              onChange={(e) =>
                onTableSettingChange({ itemsPerPage: Number(e.target.value) })
              }
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-gray-200 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
            >
              <option>10</option>
              <option>20</option>
              <option>50</option>
            </select>
          </div>
          <div className="flex items-end">
            <div className="flex items-center justify-between w-full p-3 bg-gray-50 dark:bg-slate-700/50 rounded-md">
              <label
                htmlFor="filtersVisible"
                className="flex flex-col text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                <span>Филтрите видими по подразбиране</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Дали панелът с филтри да е отворен.
                </span>
              </label>
              <Switch.Root
                id="filtersVisible"
                checked={settings.filtersVisible}
                onCheckedChange={(checked) =>
                  onTableSettingChange({ filtersVisible: checked })
                }
                className="group relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-gray-200 dark:bg-slate-600 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 data-[state=checked]:bg-indigo-600"
              >
                <Switch.Thumb className="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out data-[state=checked]:translate-x-5" />
              </Switch.Root>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200">
            Видимост на колони
          </h3>
          <div className="mt-2 space-y-4">
            {Object.entries(mockTableConfigs).map(([tableKey, tableConfig]) => (
              <div
                key={tableKey}
                className="p-3 border border-gray-200 dark:border-slate-700 rounded-lg"
              >
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2">
                  {tableConfig.label}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {Object.entries(tableConfig.columns).map(
                    ([columnKey, columnLabel]) => (
                      <div key={columnKey} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`${tableKey}-${columnKey}`}
                          checked={
                            settings.columnVisibility[tableKey]?.[columnKey] ??
                            true
                          }
                          onChange={(e) =>
                            onColumnVisibilityChange(
                              tableKey,
                              columnKey,
                              e.target.checked
                            )
                          }
                          className="h-4 w-4 rounded border-gray-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500 bg-gray-100 dark:bg-slate-900"
                        />
                        <label
                          htmlFor={`${tableKey}-${columnKey}`}
                          className="ml-2 text-sm text-gray-700 dark:text-gray-300"
                        >
                          {columnLabel}
                        </label>
                      </div>
                    )
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TableSettings;
