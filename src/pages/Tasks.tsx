import React, { useState, useMemo } from "react";
import { useCurrentUser } from "../context/UserContext";
import { useGetAllTasks } from "../graphql/hooks/task";
import { TaskStatus, CasePriority } from "../db/interfaces";
import { TaskList, TaskFilters, TaskFilterMode } from "../components/task";
import Pagination from "../components/tables/Pagination";
import { ROLES } from "../utils/GLOBAL_PARAMETERS";

const DEFAULT_ITEMS_PER_PAGE = 12;
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
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(DEFAULT_ITEMS_PER_PAGE);

  // Compute accessible-only task IDs (tasks user has access to but didn't create and isn't assigned to)
  const accessibleOnlyTaskIds = useMemo(() => {
    return currentUser?.accessibleTasks?.map((t) => t._id) || [];
  }, [currentUser?.accessibleTasks]);

  // Build query input
  const queryInput = useMemo(() => {
    const input: Record<string, unknown> = {
      itemsPerPage,
      currentPage: currentPage - 1, // Pagination component is 1-based, server is 0-based
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
    if (filterMode === "all") {
      // Admin sees everything; non-admin sees assigned + created + accessible
      if (currentUser?.role?._id !== ROLES.ADMIN) {
        input.viewableByUserId = currentUser?._id;
      }
    } else if (filterMode === "assignedToMe") {
      input.assigneeId = currentUser?._id;
    } else if (filterMode === "createdByMe") {
      input.creatorId = currentUser?._id;
    } else if (filterMode === "accessible") {
      input.taskIds = accessibleOnlyTaskIds;
      input.excludeAssigneeId = currentUser?._id;
      input.excludeCreatorId = currentUser?._id;
    }

    return input;
  }, [
    statusFilter,
    priorityFilter,
    searchQuery,
    currentPage,
    itemsPerPage,
    filterMode,
    currentUser?._id,
    accessibleOnlyTaskIds,
  ]);

  // Fetch tasks
  const { tasks, count, loading, error } = useGetAllTasks(queryInput);

  // Pagination
  const totalPages = Math.ceil(count / itemsPerPage);

  const handleFilterModeChange = (mode: TaskFilterMode) => {
    setFilterMode(mode);
    setCurrentPage(1);
    savePrefs({ filterMode: mode });
  };

  const handleStatusFilterChange = (status: TaskStatus | "all") => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handlePriorityFilterChange = (priority: CasePriority | "all") => {
    setPriorityFilter(priority);
    setCurrentPage(1);
  };

  const handleSearchQueryChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
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
        <Pagination
          totalPages={totalPages}
          totalCount={count}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={(newSize) => {
            setItemsPerPage(newSize);
            setCurrentPage(1);
          }}
          onPageChange={setCurrentPage}
        />
      )}

    </div>
  );
};

export default TasksPage;
