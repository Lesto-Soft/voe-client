import React, { useState, useMemo, useCallback } from "react";
import { useLocation, useNavigate } from "react-router";
import { useCurrentUser } from "../context/UserContext";
import { useGetAllTasks } from "../graphql/hooks/task";
import { TaskStatus, CasePriority } from "../db/interfaces";
import { TaskList, TaskFilters, TaskFilterMode } from "../components/task";
import Pagination from "../components/tables/Pagination";
import { ROLES } from "../utils/GLOBAL_PARAMETERS";

const DEFAULT_ITEMS_PER_PAGE = 12;
const TASK_VIEW_PREFS_KEY = "taskDashboard_viewPrefs";

const VALID_FILTER_MODES: TaskFilterMode[] = [
  "all",
  "assignedToMe",
  "createdByMe",
  "accessible",
];
const VALID_STATUSES = ["all", TaskStatus.Todo, TaskStatus.InProgress, TaskStatus.Done];
const VALID_PRIORITIES = ["all", CasePriority.High, CasePriority.Medium, CasePriority.Low];

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
  } catch {
    // Ignore storage errors
  }
};

/** Read initial filter state from URL search params, falling back to sessionStorage / defaults */
const getInitialState = (search: string) => {
  const params = new URLSearchParams(search);
  const stored = getStoredPrefs();

  const tabParam = params.get("tab");
  const filterMode: TaskFilterMode =
    tabParam && VALID_FILTER_MODES.includes(tabParam as TaskFilterMode)
      ? (tabParam as TaskFilterMode)
      : stored.filterMode || "assignedToMe";

  const statusParam = params.get("status");
  const statusFilter: TaskStatus | "all" =
    statusParam && VALID_STATUSES.includes(statusParam)
      ? (statusParam as TaskStatus | "all")
      : "all";

  const priorityParam = params.get("priority");
  const priorityFilter: CasePriority | "all" =
    priorityParam && VALID_PRIORITIES.includes(priorityParam)
      ? (priorityParam as CasePriority | "all")
      : "all";

  const searchQuery = params.get("search") || "";

  const viewParam = params.get("view");
  const viewMode: "grid" | "table" =
    viewParam === "grid" || viewParam === "table"
      ? viewParam
      : stored.viewMode || "grid";

  const pageParam = Number(params.get("page"));
  const currentPage = pageParam >= 1 ? pageParam : 1;

  const perPageParam = Number(params.get("perPage"));
  const itemsPerPage = perPageParam > 0 ? perPageParam : DEFAULT_ITEMS_PER_PAGE;

  return { filterMode, statusFilter, priorityFilter, searchQuery, viewMode, currentPage, itemsPerPage };
};

const TasksPage: React.FC = () => {
  const currentUser = useCurrentUser();
  const location = useLocation();
  const navigate = useNavigate();

  // Initialize state from URL params
  const initial = useMemo(() => getInitialState(location.search), []);

  const [filterMode, setFilterMode] = useState<TaskFilterMode>(initial.filterMode);
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "all">(initial.statusFilter);
  const [priorityFilter, setPriorityFilter] = useState<CasePriority | "all">(initial.priorityFilter);
  const [searchQuery, setSearchQuery] = useState(initial.searchQuery);
  const [viewMode, setViewMode] = useState<"grid" | "table">(initial.viewMode);
  const [currentPage, setCurrentPage] = useState(initial.currentPage);
  const [itemsPerPage, setItemsPerPage] = useState(initial.itemsPerPage);

  // Sync state to URL
  const syncUrl = useCallback(
    (overrides: Record<string, string | undefined>) => {
      const params = new URLSearchParams();
      const values: Record<string, string | undefined> = {
        tab: filterMode,
        status: statusFilter !== "all" ? statusFilter : undefined,
        priority: priorityFilter !== "all" ? priorityFilter : undefined,
        search: searchQuery.trim() || undefined,
        view: viewMode,
        page: String(currentPage),
        perPage: String(itemsPerPage),
        ...overrides,
      };
      for (const [key, val] of Object.entries(values)) {
        if (val !== undefined && val !== "") params.set(key, val);
      }
      navigate(`${location.pathname}?${params.toString()}`, { replace: true });
    },
    [filterMode, statusFilter, priorityFilter, searchQuery, viewMode, currentPage, itemsPerPage, navigate, location.pathname],
  );

  // Compute accessible-only task IDs
  const accessibleOnlyTaskIds = useMemo(() => {
    return currentUser?.accessibleTasks?.map((t) => t._id) || [];
  }, [currentUser?.accessibleTasks]);

  // Build query input
  const queryInput = useMemo(() => {
    const input: Record<string, unknown> = {
      itemsPerPage,
      currentPage: currentPage - 1,
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
    syncUrl({ tab: mode, page: "1" });
  };

  const handleStatusFilterChange = (status: TaskStatus | "all") => {
    setStatusFilter(status);
    setCurrentPage(1);
    syncUrl({ status: status !== "all" ? status : undefined, page: "1" });
  };

  const handlePriorityFilterChange = (priority: CasePriority | "all") => {
    setPriorityFilter(priority);
    setCurrentPage(1);
    syncUrl({ priority: priority !== "all" ? priority : undefined, page: "1" });
  };

  const handleSearchQueryChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
    syncUrl({ search: query.trim() || undefined, page: "1" });
  };

  const handleViewModeChange = (mode: "grid" | "table") => {
    setViewMode(mode);
    savePrefs({ viewMode: mode });
    syncUrl({ view: mode });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    syncUrl({ page: String(page) });
  };

  const handleItemsPerPageChange = (newSize: number) => {
    setItemsPerPage(newSize);
    setCurrentPage(1);
    syncUrl({ perPage: String(newSize), page: "1" });
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
        onViewModeChange={handleViewModeChange}
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
          onItemsPerPageChange={handleItemsPerPageChange}
          onPageChange={handlePageChange}
        />
      )}

    </div>
  );
};

export default TasksPage;
