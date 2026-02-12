import React, { useState, useMemo } from "react";
import { useCurrentUser } from "../context/UserContext";
import { useGetAllTasks } from "../graphql/hooks/task";
import { TaskStatus, CasePriority } from "../db/interfaces";
import {
  TaskList,
  TaskFilters,
  TaskFilterMode,
  TaskFormModal,
} from "../components/task";
import { PlusIcon } from "@heroicons/react/24/outline";

const ITEMS_PER_PAGE = 12;
const TASK_VIEW_PREFS_KEY = "taskDashboard_viewPrefs";

interface TaskViewPrefs {
  filterMode: TaskFilterMode;
  viewMode: "grid" | "table";
}

const getStoredPrefs = (): Partial<TaskViewPrefs> => {
  try {
    const saved = sessionStorage.getItem(TASK_VIEW_PREFS_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
};

const savePrefs = (prefs: Partial<TaskViewPrefs>) => {
  try {
    const current = getStoredPrefs();
    sessionStorage.setItem(
      TASK_VIEW_PREFS_KEY,
      JSON.stringify({ ...current, ...prefs }),
    );
  } catch (error) {
    console.warn(
      "Failed to save task view preferences to sessionStorage:",
      error,
    );
  }
};

const TasksPage: React.FC = () => {
  const currentUser = useCurrentUser();

  // Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Filter state - initialize from sessionStorage
  const [filterMode, setFilterMode] = useState<TaskFilterMode>(() => {
    const stored = getStoredPrefs();
    return stored.filterMode || "assignedToMe";
  });
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<CasePriority | "all">(
    "all",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "table">(() => {
    const stored = getStoredPrefs();
    return stored.viewMode || "grid";
  });
  const [currentPage, setCurrentPage] = useState(0);

  // Build query input
  const queryInput = useMemo(() => {
    const input: Record<string, unknown> = {
      itemsPerPage: ITEMS_PER_PAGE,
      currentPage,
    };

    if (statusFilter !== "all") {
      input.status = statusFilter;
    }
    if (priorityFilter !== "all") {
      input.priority = priorityFilter;
    }
    if (searchQuery.trim()) {
      input.searchQuery = searchQuery.trim();
    }
    if (filterMode === "assignedToMe") {
      input.assigneeId = currentUser?._id;
    } else if (filterMode === "createdByMe") {
      input.creatorId = currentUser?._id;
    }

    return input;
  }, [
    statusFilter,
    priorityFilter,
    searchQuery,
    currentPage,
    filterMode,
    currentUser?._id,
  ]);

  // Fetch tasks
  const { tasks, count, loading, error, refetch } = useGetAllTasks(queryInput);

  // Pagination
  const totalPages = Math.ceil(count / ITEMS_PER_PAGE);

  const handleFilterModeChange = (mode: TaskFilterMode) => {
    setFilterMode(mode);
    setCurrentPage(0);
    savePrefs({ filterMode: mode });
  };

  const handleStatusFilterChange = (status: TaskStatus | "all") => {
    setStatusFilter(status);
    setCurrentPage(0);
  };

  const handlePriorityFilterChange = (priority: CasePriority | "all") => {
    setPriorityFilter(priority);
    setCurrentPage(0);
  };

  const handleSearchQueryChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(0);
  };

  if (error) {
    return (
      <div className="min-h-full bg-gray-100 p-6">
        <div className="text-center py-16 text-red-500">
          <p className="text-lg font-semibold">
            Грешка при зареждане на задачите
          </p>
          <p className="text-sm">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gray-100 p-6">
      {/* Header */}
      <header className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Табло за Задачи</h1>
          <p className="text-gray-600 mt-1">
            Преглеждайте и управлявайте вашите задачи.
          </p>
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-md cursor-pointer"
          onClick={() => setIsCreateModalOpen(true)}
        >
          <PlusIcon className="h-5 w-5" />
          Нова задача
        </button>
      </header>

      {/* Filters */}
      <TaskFilters
        filterMode={filterMode}
        onFilterModeChange={handleFilterModeChange}
        statusFilter={statusFilter}
        onStatusFilterChange={handleStatusFilterChange}
        priorityFilter={priorityFilter}
        onPriorityFilterChange={handlePriorityFilterChange}
        searchQuery={searchQuery}
        onSearchQueryChange={handleSearchQueryChange}
        viewMode={viewMode}
        onViewModeChange={(mode) => {
          setViewMode(mode);
          savePrefs({ viewMode: mode });
        }}
      />

      {/* Task List */}
      <main>
        <TaskList tasks={tasks} viewMode={viewMode} loading={loading} />
      </main>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center items-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
            disabled={currentPage === 0}
            className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Предишна
          </button>
          <span className="text-sm text-gray-600">
            Страница {currentPage + 1} от {totalPages}
          </span>
          <button
            onClick={() =>
              setCurrentPage((p) => Math.min(totalPages - 1, p + 1))
            }
            disabled={currentPage >= totalPages - 1}
            className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Следваща
          </button>
        </div>
      )}

      {/* Results count */}
      {!loading && (
        <div className="mt-4 text-center text-sm text-gray-500">
          Показани {tasks.length} от {count} задачи
        </div>
      )}

      {/* Create Task Modal */}
      <TaskFormModal
        isOpen={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        mode="create"
        onSuccess={() => {
          if (filterMode !== "createdByMe") {
            handleFilterModeChange("createdByMe");
          } else {
            refetch();
          }
        }}
      />
    </div>
  );
};

export default TasksPage;
