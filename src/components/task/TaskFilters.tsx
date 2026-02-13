import React from "react";
import { TaskStatus, CasePriority } from "../../db/interfaces";
import {
  UserCircleIcon,
  UsersIcon,
  EyeIcon,
  Bars3Icon,
  Squares2X2Icon,
  QueueListIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
import ClearableInput from "../global/inputs/ClearableInput";
import CustomMultiSelectDropdown from "../global/dropdown/CustomMultiSelectDropdown";
import type {
  DueDateFilter,
  CaseRelationFilter,
} from "../../graphql/hooks/task";

export type TaskFilterMode =
  | "assignedToMe"
  | "createdByMe"
  | "accessible"
  | "all";

const TASK_STATUS_OPTIONS = [
  { value: TaskStatus.Todo, label: "Незапочната" },
  { value: TaskStatus.InProgress, label: "В процес" },
  { value: TaskStatus.Done, label: "Завършена" },
];

const TASK_PRIORITY_OPTIONS = [
  { value: CasePriority.High, label: "Висок" },
  { value: CasePriority.Medium, label: "Среден" },
  { value: CasePriority.Low, label: "Нисък" },
];

const DUE_DATE_OPTIONS = [
  { value: "OVERDUE", label: "Просрочена" },
  { value: "CLOSE_TO_OVERDUE", label: "Наближава срок" },
  { value: "ON_TIME", label: "В срок" },
  { value: "FINISHED_ON_TIME", label: "Завършена навреме" },
  { value: "NO_DUE_DATE", label: "Без краен срок" },
];

const CASE_RELATION_OPTIONS = [
  { value: "WITH_CASE", label: "Свързана със сигнал" },
  { value: "WITHOUT_CASE", label: "Без свързан сигнал" },
];

interface TaskFiltersProps {
  filterMode: TaskFilterMode;
  onFilterModeChange: (mode: TaskFilterMode) => void;
  statusFilter: TaskStatus[];
  onStatusFilterChange: (statuses: TaskStatus[]) => void;
  priorityFilter: CasePriority[];
  onPriorityFilterChange: (priorities: CasePriority[]) => void;
  dueDateFilter: DueDateFilter[];
  onDueDateFilterChange: (filters: DueDateFilter[]) => void;
  caseRelationFilter: CaseRelationFilter | null;
  onCaseRelationFilterChange: (filter: CaseRelationFilter | null) => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  viewMode: "grid" | "table";
  onViewModeChange: (mode: "grid" | "table") => void;
  showFilters: boolean;
  onToggleFilters: () => void;
  isAnyFilterActive: boolean;
  onClearFilters: () => void;
}

const FILTER_MODE_CONFIG: {
  key: TaskFilterMode;
  label: string;
  icon: React.ReactNode;
}[] = [
  {
    key: "all",
    label: "Всички",
    icon: <QueueListIcon className="h-5 w-5 mr-2" />,
  },
  {
    key: "assignedToMe",
    label: "Възложени на мен",
    icon: <UserCircleIcon className="h-5 w-5 mr-2" />,
  },
  {
    key: "createdByMe",
    label: "Създадени от мен",
    icon: <UsersIcon className="h-5 w-5 mr-2" />,
  },
  {
    key: "accessible",
    label: "Споменат / Предишен",
    icon: <EyeIcon className="h-5 w-5 mr-2" />,
  },
];

const TaskFilters: React.FC<TaskFiltersProps> = ({
  filterMode,
  onFilterModeChange,
  statusFilter,
  onStatusFilterChange,
  priorityFilter,
  onPriorityFilterChange,
  dueDateFilter,
  onDueDateFilterChange,
  caseRelationFilter,
  onCaseRelationFilterChange,
  searchQuery,
  onSearchQueryChange,
  viewMode,
  onViewModeChange,
  showFilters,
  onToggleFilters,
  isAnyFilterActive,
  onClearFilters,
}) => {
  return (
    <div className="mb-6">
      {/* Top bar: Filter mode buttons (left) + View toggle & Filter button (right) */}
      <div className="flex items-center justify-between gap-2 mb-4">
        {/* Filter mode buttons */}
        <div className="flex flex-wrap gap-2">
          {FILTER_MODE_CONFIG.map((mode) => (
            <button
              key={mode.key}
              type="button"
              onClick={() => onFilterModeChange(mode.key)}
              className={`flex items-center px-4 py-2 rounded-lg font-semibold transition-colors duration-150 ${
                filterMode === mode.key
                  ? "border border-blue-600 text-blue-600 shadow"
                  : "border border-gray-300 shadow-sm bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-blue-600 hover:cursor-pointer"
              }`}
            >
              {mode.icon}
              {mode.label}
            </button>
          ))}
        </div>

        {/* Right side: View toggle + Filter button + Clear */}
        <div className="flex items-center gap-2">
          {/* View mode toggle */}
          <div className="flex items-center bg-gray-100 p-1 rounded-lg border border-gray-300">
            <button
              onClick={() => onViewModeChange("grid")}
              title="Мрежа"
              className={`p-2 rounded-md transition-colors ${
                viewMode === "grid"
                  ? "bg-blue-600 text-white shadow"
                  : "text-gray-600 hover:bg-gray-200 cursor-pointer"
              }`}
            >
              <Squares2X2Icon className="h-5 w-5" />
            </button>
            <button
              onClick={() => onViewModeChange("table")}
              title="Таблица"
              className={`p-2 rounded-md transition-colors ${
                viewMode === "table"
                  ? "bg-blue-600 text-white shadow"
                  : "text-gray-600 hover:bg-gray-200 cursor-pointer"
              }`}
            >
              <Bars3Icon className="h-5 w-5" />
            </button>
          </div>

          {/* Filter toggle + Clear button group */}
          <div className="flex md:gap-0 gap-2">
            <button
              type="button"
              className={`justify-center cursor-pointer group flex items-center px-4 py-2 font-semibold transition-colors duration-150 bg-gray-500 text-white hover:bg-gray-600 ${
                isAnyFilterActive
                  ? "md:rounded-r-none rounded-l-lg rounded-r-lg"
                  : "rounded-lg"
              }`}
              onClick={onToggleFilters}
              title={showFilters ? "Скрий филтри" : "Покажи филтри"}
            >
              {showFilters ? (
                <ChevronUpIcon className="h-5 w-5 mr-1" />
              ) : (
                <ChevronDownIcon className="h-5 w-5 mr-1" />
              )}
              Филтри
            </button>

            {isAnyFilterActive && (
              <button
                type="button"
                className="hidden cursor-pointer md:flex items-center pl-2 pr-3 py-2 rounded-r-lg bg-red-400 text-white hover:bg-red-500 transition-colors duration-150"
                title="Изчисти всички филтри"
                onClick={onClearFilters}
              >
                <XMarkIcon className="h-5 w-5 text-white" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Collapsible filter fields */}
      <div
        className={`transition-all duration-300 ease-in-out ${
          showFilters
            ? "max-h-screen opacity-100"
            : "max-h-0 opacity-0 pointer-events-none"
        }`}
      >
        <div className="py-5">
          <div className="flex flex-wrap gap-x-4 gap-y-3 items-end">
            {/* Search input */}
            <div className="flex-1 min-w-[200px]">
              <ClearableInput
                id="taskSearch"
                label="Търсене"
                value={searchQuery}
                onChange={onSearchQueryChange}
                placeholder="Търсене по заглавие..."
              />
            </div>

            {/* Status multiselect */}
            <CustomMultiSelectDropdown
              label="Статус"
              options={TASK_STATUS_OPTIONS}
              selectedValues={statusFilter}
              onChange={(values) =>
                onStatusFilterChange(values as TaskStatus[])
              }
              placeholder="Всички статуси"
            />

            {/* Priority multiselect */}
            <CustomMultiSelectDropdown
              label="Приоритет"
              options={TASK_PRIORITY_OPTIONS}
              selectedValues={priorityFilter}
              onChange={(values) =>
                onPriorityFilterChange(values as CasePriority[])
              }
              placeholder="Всички приоритети"
            />

            {/* Due date multiselect */}
            <CustomMultiSelectDropdown
              label="Краен срок"
              options={DUE_DATE_OPTIONS}
              selectedValues={dueDateFilter}
              onChange={(values) =>
                onDueDateFilterChange(values as DueDateFilter[])
              }
              placeholder="Всички"
            />

            {/* Case relation filter */}
            <div className="w-48">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Сигнал
              </label>
              <select
                value={caseRelationFilter || ""}
                onChange={(e) =>
                  onCaseRelationFilterChange(
                    (e.target.value as CaseRelationFilter) || null,
                  )
                }
                className="w-full bg-white px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:border-indigo-500"
              >
                <option value="">Всички</option>
                {CASE_RELATION_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskFilters;
