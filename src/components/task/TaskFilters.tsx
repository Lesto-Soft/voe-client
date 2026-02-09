import React from "react";
import { TaskStatus, CasePriority } from "../../db/interfaces";
import {
  UserCircleIcon,
  UsersIcon,
  Bars3Icon,
  Squares2X2Icon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/solid";

export type TaskFilterMode = "assignedToMe" | "createdByMe" | "all";

interface TaskFiltersProps {
  filterMode: TaskFilterMode;
  onFilterModeChange: (mode: TaskFilterMode) => void;
  statusFilter: TaskStatus | "all";
  onStatusFilterChange: (status: TaskStatus | "all") => void;
  priorityFilter: CasePriority | "all";
  onPriorityFilterChange: (priority: CasePriority | "all") => void;
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
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search input */}
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Търсене по заглавие..."
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
          />
        </div>

        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={(e) =>
            onStatusFilterChange(e.target.value as TaskStatus | "all")
          }
          className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
        >
          <option value="all">Всички статуси</option>
          <option value={TaskStatus.Todo}>Незапочната</option>
          <option value={TaskStatus.InProgress}>В процес</option>
          <option value={TaskStatus.Done}>Завършена</option>
        </select>

        {/* Priority filter */}
        <select
          value={priorityFilter}
          onChange={(e) =>
            onPriorityFilterChange(e.target.value as CasePriority | "all")
          }
          className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
        >
          <option value="all">Всички приоритети</option>
          <option value={CasePriority.High}>Висок</option>
          <option value={CasePriority.Medium}>Среден</option>
          <option value={CasePriority.Low}>Нисък</option>
        </select>
      </div>
    </div>
  );
};

export default TaskFilters;
