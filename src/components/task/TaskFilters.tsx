import React, { useMemo } from "react";
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
} from "@heroicons/react/24/outline";
import { CalendarDaysIcon } from "@heroicons/react/24/outline";
import ClearableInput from "../global/inputs/ClearableInput";
import UserSelector from "../global/dropdown/UserSelector";
import CustomMultiSelectDropdown from "../global/dropdown/CustomMultiSelectDropdown";
import CustomDropdown from "../global/dropdown/CustomDropdown";
import DateRangeSelector from "../features/userAnalytics/DateRangeSelector";
import type {
  DueDateFilter,
  CaseRelationFilter,
} from "../../graphql/hooks/task";
import { useCurrentUser } from "../../context/UserContext";
import { ROLES } from "../../utils/GLOBAL_PARAMETERS";

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
  taskNumber: string;
  onTaskNumberChange: (value: string) => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  descriptionQuery: string;
  onDescriptionQueryChange: (query: string) => void;
  creatorId: string;
  onCreatorIdChange: (id: string) => void;
  assigneeId: string;
  onAssigneeIdChange: (id: string) => void;
  dateRange: { startDate: Date | null; endDate: Date | null };
  onDateRangeChange: (range: { startDate: Date | null; endDate: Date | null }) => void;
  isDateSelectorVisible: boolean;
  onToggleDateSelector: () => void;
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
  taskNumber,
  onTaskNumberChange,
  searchQuery,
  onSearchQueryChange,
  descriptionQuery,
  onDescriptionQueryChange,
  creatorId,
  onCreatorIdChange,
  assigneeId,
  onAssigneeIdChange,
  dateRange,
  onDateRangeChange,
  isDateSelectorVisible,
  onToggleDateSelector,
  viewMode,
  onViewModeChange,
  showFilters,
  onToggleFilters,
  isAnyFilterActive,
  onClearFilters,
}) => {
  const currentUser = useCurrentUser();
  const isDateFilterActive = dateRange.startDate !== null || dateRange.endDate !== null;

  const visibleModes = useMemo(() => {
    const userRole = currentUser?.role?._id;
    if (userRole === ROLES.NORMAL || userRole === ROLES.LEFT) {
      return FILTER_MODE_CONFIG.filter((m) => m.key === "all");
    }
    return FILTER_MODE_CONFIG;
  }, [currentUser?.role?._id]);

  return (
    <div>
      {/* Top bar: Filter mode buttons (left) + View toggle & Filter button (right) */}
      <div className="flex items-center justify-between gap-2 mb-6 px-8 mt-6">
        {/* Filter mode buttons */}
        <div className="flex flex-wrap gap-2">
          {visibleModes.map((mode) => (
            <button
              key={mode.key}
              type="button"
              onClick={() => onFilterModeChange(mode.key)}
              className={`flex items-center px-4 py-2 rounded-lg font-semibold transition-colors duration-150 min-w-42 ${
                filterMode === mode.key
                  ? "border border-btnRedHover text-btnRedHover shadow"
                  : "border border-gray-300 shadow-sm bg-gray-100 text-gray-700 hover:bg-red-100 hover:text-btnRedHover hover:cursor-pointer"
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
          <div className="flex items-center bg-gray-100 rounded-lg border border-gray-300">
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
        <div className="px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-wrap gap-x-4 gap-y-3 items-end">
            {/* Task number */}
            <div className="w-28">
              <ClearableInput
                id="taskNumber"
                label="Номер"
                value={taskNumber}
                onChange={onTaskNumberChange}
                placeholder="Номер..."
              />
            </div>

            {/* Priority multiselect */}
            <CustomMultiSelectDropdown
              label="Приоритет"
              options={TASK_PRIORITY_OPTIONS}
              selectedValues={priorityFilter}
              onChange={(values) =>
                onPriorityFilterChange(values as CasePriority[])
              }
              placeholder="Всички"
            />

            {/* Case relation filter */}
            <CustomDropdown
              label="Сигнал"
              options={[
                { value: "", label: "Всички" },
                ...CASE_RELATION_OPTIONS,
              ]}
              value={caseRelationFilter || ""}
              onChange={(val) =>
                onCaseRelationFilterChange(
                  (val as CaseRelationFilter) || null,
                )
              }
              placeholder="Всички"
              widthClass="w-48"
            />

            {/* Title search */}
            <div className="flex-1 min-w-[150px]">
              <ClearableInput
                id="taskSearch"
                label="Заглавие"
                value={searchQuery}
                onChange={onSearchQueryChange}
                placeholder="Търсене по заглавие..."
              />
            </div>

            {/* Description search */}
            <div className="flex-1 min-w-[150px]">
              <ClearableInput
                id="taskDescriptionSearch"
                label="Описание"
                value={descriptionQuery}
                onChange={onDescriptionQueryChange}
                placeholder="Търсене по описание..."
              />
            </div>

            {/* Creator/Assignee filters (admin/expert only) */}
            {(currentUser?.role?._id === ROLES.ADMIN || currentUser?.role?._id === ROLES.EXPERT) && (
              <>
                <UserSelector
                  label="Създател"
                  placeholder="Търси създател..."
                  selectedUserId={creatorId}
                  setSelectedUserId={onCreatorIdChange}
                  t={(key) => ({ loading: "Зареждане...", error: "Грешка", no_users: "Няма потребители", clear: "Изчисти" }[key] || key)}
                />
                <UserSelector
                  label="Възложен на"
                  placeholder="Търси изпълнител..."
                  selectedUserId={assigneeId}
                  setSelectedUserId={onAssigneeIdChange}
                  t={(key) => ({ loading: "Зареждане...", error: "Грешка", no_users: "Няма потребители", clear: "Изчисти" }[key] || key)}
                />
              </>
            )}

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

            {/* Date filter toggle */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Дата
              </label>
              <button
                type="button"
                onClick={onToggleDateSelector}
                title="Филтриране по дата"
                className={`cursor-pointer px-3 py-2 flex items-center justify-center border rounded-md shadow-sm transition duration-150 ease-in-out text-sm ${
                  isDateSelectorVisible
                    ? "bg-indigo-100 border-indigo-500 text-indigo-600"
                    : isDateFilterActive
                    ? "bg-white border-indigo-400 text-indigo-600"
                    : "bg-white text-gray-500 border-gray-300 hover:border-gray-400"
                }`}
              >
                <CalendarDaysIcon className="h-5 w-5" />
              </button>
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
          </div>

          {isDateSelectorVisible && (
            <div className="mt-4 border-t border-gray-200 pt-4">
              <DateRangeSelector
                dateRange={dateRange}
                onDateRangeChange={onDateRangeChange}
                justify="end"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskFilters;
