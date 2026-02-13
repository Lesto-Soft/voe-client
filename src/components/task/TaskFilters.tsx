import React from "react";
import { TaskStatus, CasePriority } from "../../db/interfaces";
import {
  UserCircleIcon,
  UsersIcon,
  EyeIcon,
  Bars3Icon,
  Squares2X2Icon,
  MagnifyingGlassIcon,
  QueueListIcon,
} from "@heroicons/react/24/solid";
import CustomMultiSelectDropdown from "../global/dropdown/CustomMultiSelectDropdown";

export type TaskFilterMode = "assignedToMe" | "createdByMe" | "accessible" | "all";

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

interface TaskFiltersProps {
  filterMode: TaskFilterMode;
  onFilterModeChange: (mode: TaskFilterMode) => void;
  statusFilter: TaskStatus[];
  onStatusFilterChange: (statuses: TaskStatus[]) => void;
  priorityFilter: CasePriority[];
  onPriorityFilterChange: (priorities: CasePriority[]) => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  viewMode: "grid" | "table";
  onViewModeChange: (mode: "grid" | "table") => void;
}

const TaskFilters: React.FC<TaskFiltersProps> = ({
  filterMode,
  onFilterModeChange,
  statusFilter,
  onStatusFilterChange,
  priorityFilter,
  onPriorityFilterChange,
  searchQuery,
  onSearchQueryChange,
  viewMode,
  onViewModeChange,
}) => {
  return (
    <div className="mb-6 p-4 bg-white rounded-lg shadow-sm flex flex-col gap-4">
      {/* Top row: Filter mode toggle and view mode */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        {/* Filter mode buttons */}
        <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => onFilterModeChange("all")}
            className={`px-4 py-2 text-sm font-semibold rounded-md flex items-center gap-2 transition-colors ${
              filterMode === "all"
                ? "bg-blue-600 text-white shadow"
                : "text-gray-700 hover:bg-gray-200 cursor-pointer"
            }`}
          >
            <QueueListIcon className="h-5 w-5" /> Всички
          </button>
          <button
            onClick={() => onFilterModeChange("assignedToMe")}
            className={`px-4 py-2 text-sm font-semibold rounded-md flex items-center gap-2 transition-colors ${
              filterMode === "assignedToMe"
                ? "bg-blue-600 text-white shadow"
                : "text-gray-700 hover:bg-gray-200 cursor-pointer"
            }`}
          >
            <UserCircleIcon className="h-5 w-5" /> Възложени на мен
          </button>
          <button
            onClick={() => onFilterModeChange("createdByMe")}
            className={`px-4 py-2 text-sm font-semibold rounded-md flex items-center gap-2 transition-colors ${
              filterMode === "createdByMe"
                ? "bg-blue-600 text-white shadow"
                : "text-gray-700 hover:bg-gray-200 cursor-pointer"
            }`}
          >
            <UsersIcon className="h-5 w-5" /> Създадени от мен
          </button>
          <button
            onClick={() => onFilterModeChange("accessible")}
            className={`px-4 py-2 text-sm font-semibold rounded-md flex items-center gap-2 transition-colors ${
              filterMode === "accessible"
                ? "bg-blue-600 text-white shadow"
                : "text-gray-700 hover:bg-gray-200 cursor-pointer"
            }`}
          >
            <EyeIcon className="h-5 w-5" /> Споменат / Предишен
          </button>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
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
      </div>

      {/* Bottom row: Search and dropdown filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-end">
        {/* Search input */}
        <div className="relative flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Търсене
          </label>
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Търсене по заглавие..."
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
            />
          </div>
        </div>

        {/* Status multiselect */}
        <CustomMultiSelectDropdown
          label="Статус"
          options={TASK_STATUS_OPTIONS}
          selectedValues={statusFilter}
          onChange={(values) => onStatusFilterChange(values as TaskStatus[])}
          placeholder="Всички статуси"
        />

        {/* Priority multiselect */}
        <CustomMultiSelectDropdown
          label="Приоритет"
          options={TASK_PRIORITY_OPTIONS}
          selectedValues={priorityFilter}
          onChange={(values) => onPriorityFilterChange(values as CasePriority[])}
          placeholder="Всички приоритети"
        />
      </div>
    </div>
  );
};

export default TaskFilters;
