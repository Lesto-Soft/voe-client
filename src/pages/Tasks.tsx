import React, { useState, useMemo, useCallback } from "react";
import { useLocation, useNavigate } from "react-router";
import moment from "moment";
import { useCurrentUser } from "../context/UserContext";
import { useGetAllTasks, DueDateFilter, CaseRelationFilter } from "../graphql/hooks/task";
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
const VALID_STATUSES: string[] = [TaskStatus.Todo, TaskStatus.InProgress, TaskStatus.Done];
const VALID_PRIORITIES: string[] = [CasePriority.High, CasePriority.Medium, CasePriority.Low];
const VALID_DUE_DATE_FILTERS: string[] = ["OVERDUE", "CLOSE_TO_OVERDUE", "ON_TIME", "FINISHED_ON_TIME", "NO_DUE_DATE"];
const VALID_CASE_RELATIONS: string[] = ["WITH_CASE", "WITHOUT_CASE"];

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

/** Parse a comma-separated URL param into a validated array */
const parseArrayParam = (param: string | null, validValues: string[]): string[] => {
  if (!param) return [];
  return param.split(",").filter((v) => validValues.includes(v));
};

/** Read initial filter state from URL search params, falling back to sessionStorage / defaults */
const getInitialState = (search: string) => {
  const params = new URLSearchParams(search);
  const stored = getStoredPrefs();

  const tabParam = params.get("tab");
  const filterMode: TaskFilterMode =
    tabParam && VALID_FILTER_MODES.includes(tabParam as TaskFilterMode)
      ? (tabParam as TaskFilterMode)
      : stored.filterMode || "all";

  const statusFilter = parseArrayParam(params.get("status"), VALID_STATUSES) as TaskStatus[];
  const priorityFilter = parseArrayParam(params.get("priority"), VALID_PRIORITIES) as CasePriority[];
  const dueDateFilter = parseArrayParam(params.get("dueDate"), VALID_DUE_DATE_FILTERS) as DueDateFilter[];

  const caseRelParam = params.get("caseRelation");
  const caseRelationFilter: CaseRelationFilter | null =
    caseRelParam && VALID_CASE_RELATIONS.includes(caseRelParam)
      ? (caseRelParam as CaseRelationFilter)
      : null;

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

  const startDate = params.get("startDate")
    ? moment(params.get("startDate"), "DD-MM-YYYY").toDate()
    : null;
  const endDate = params.get("endDate")
    ? moment(params.get("endDate"), "DD-MM-YYYY").toDate()
    : null;

  return { filterMode, statusFilter, priorityFilter, dueDateFilter, caseRelationFilter, searchQuery, viewMode, currentPage, itemsPerPage, startDate, endDate };
};

const TasksPage: React.FC = () => {
  const currentUser = useCurrentUser();
  const location = useLocation();
  const navigate = useNavigate();

  // Initialize state from URL params
  const initial = useMemo(() => getInitialState(location.search), []);

  const [filterMode, setFilterMode] = useState<TaskFilterMode>(initial.filterMode);
  const [statusFilter, setStatusFilter] = useState<TaskStatus[]>(initial.statusFilter);
  const [priorityFilter, setPriorityFilter] = useState<CasePriority[]>(initial.priorityFilter);
  const [dueDateFilter, setDueDateFilter] = useState<DueDateFilter[]>(initial.dueDateFilter);
  const [caseRelationFilter, setCaseRelationFilter] = useState<CaseRelationFilter | null>(initial.caseRelationFilter);
  const [searchQuery, setSearchQuery] = useState(initial.searchQuery);
  const [viewMode, setViewMode] = useState<"grid" | "table">(initial.viewMode);
  const [currentPage, setCurrentPage] = useState(initial.currentPage);
  const [itemsPerPage, setItemsPerPage] = useState(initial.itemsPerPage);
  const [startDate, setStartDate] = useState<Date | null>(initial.startDate);
  const [endDate, setEndDate] = useState<Date | null>(initial.endDate);
  const [isDateSelectorVisible, setIsDateSelectorVisible] = useState(initial.startDate !== null || initial.endDate !== null);
  const [showFilters, setShowFilters] = useState(true);

  // Check if any filter field (not filter mode / view) is active
  const isAnyFilterActive = useMemo(() => {
    return (
      statusFilter.length > 0 ||
      priorityFilter.length > 0 ||
      dueDateFilter.length > 0 ||
      caseRelationFilter !== null ||
      searchQuery.trim() !== "" ||
      startDate !== null ||
      endDate !== null
    );
  }, [statusFilter, priorityFilter, dueDateFilter, caseRelationFilter, searchQuery, startDate, endDate]);

  // Sync state to URL
  const syncUrl = useCallback(
    (overrides: Record<string, string | undefined>) => {
      const params = new URLSearchParams();
      const values: Record<string, string | undefined> = {
        tab: filterMode,
        status: statusFilter.length > 0 ? statusFilter.join(",") : undefined,
        priority: priorityFilter.length > 0 ? priorityFilter.join(",") : undefined,
        dueDate: dueDateFilter.length > 0 ? dueDateFilter.join(",") : undefined,
        caseRelation: caseRelationFilter || undefined,
        search: searchQuery.trim() || undefined,
        startDate: startDate ? moment(startDate).format("DD-MM-YYYY") : undefined,
        endDate: endDate ? moment(endDate).format("DD-MM-YYYY") : undefined,
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
    [filterMode, statusFilter, priorityFilter, dueDateFilter, caseRelationFilter, searchQuery, startDate, endDate, viewMode, currentPage, itemsPerPage, navigate, location.pathname],
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

    if (statusFilter.length > 0) {
      input.statuses = statusFilter;
    }
    if (priorityFilter.length > 0) {
      input.priorities = priorityFilter;
    }
    if (dueDateFilter.length > 0) {
      input.dueDateFilters = dueDateFilter;
    }
    if (caseRelationFilter) {
      input.caseRelationFilter = caseRelationFilter;
    }
    if (searchQuery.trim()) {
      input.searchQuery = searchQuery.trim();
    }
    if (startDate) {
      input.startDate = startDate.toISOString();
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      input.endDate = end.toISOString();
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
    dueDateFilter,
    caseRelationFilter,
    searchQuery,
    startDate,
    endDate,
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

  const handleStatusFilterChange = (statuses: TaskStatus[]) => {
    setStatusFilter(statuses);
    setCurrentPage(1);
    syncUrl({ status: statuses.length > 0 ? statuses.join(",") : undefined, page: "1" });
  };

  const handlePriorityFilterChange = (priorities: CasePriority[]) => {
    setPriorityFilter(priorities);
    setCurrentPage(1);
    syncUrl({ priority: priorities.length > 0 ? priorities.join(",") : undefined, page: "1" });
  };

  const handleDueDateFilterChange = (filters: DueDateFilter[]) => {
    setDueDateFilter(filters);
    setCurrentPage(1);
    syncUrl({ dueDate: filters.length > 0 ? filters.join(",") : undefined, page: "1" });
  };

  const handleCaseRelationFilterChange = (filter: CaseRelationFilter | null) => {
    setCaseRelationFilter(filter);
    setCurrentPage(1);
    syncUrl({ caseRelation: filter || undefined, page: "1" });
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

  const handleDateRangeChange = (range: { startDate: Date | null; endDate: Date | null }) => {
    setStartDate(range.startDate);
    setEndDate(range.endDate);
    setCurrentPage(1);
    syncUrl({
      startDate: range.startDate ? moment(range.startDate).format("DD-MM-YYYY") : undefined,
      endDate: range.endDate ? moment(range.endDate).format("DD-MM-YYYY") : undefined,
      page: "1",
    });
  };

  const handleClearFilters = () => {
    setStatusFilter([]);
    setPriorityFilter([]);
    setDueDateFilter([]);
    setCaseRelationFilter(null);
    setSearchQuery("");
    setStartDate(null);
    setEndDate(null);
    setCurrentPage(1);
    syncUrl({
      status: undefined,
      priority: undefined,
      dueDate: undefined,
      caseRelation: undefined,
      search: undefined,
      startDate: undefined,
      endDate: undefined,
      page: "1",
    });
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
        dueDateFilter={dueDateFilter}
        onDueDateFilterChange={handleDueDateFilterChange}
        caseRelationFilter={caseRelationFilter}
        onCaseRelationFilterChange={handleCaseRelationFilterChange}
        searchQuery={searchQuery}
        onSearchQueryChange={handleSearchQueryChange}
        dateRange={{ startDate, endDate }}
        onDateRangeChange={handleDateRangeChange}
        isDateSelectorVisible={isDateSelectorVisible}
        onToggleDateSelector={() => setIsDateSelectorVisible((prev) => !prev)}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(!showFilters)}
        isAnyFilterActive={isAnyFilterActive}
        onClearFilters={handleClearFilters}
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
