// src/page/hooks/useCategoryManagement.ts
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useLocation, useNavigate } from "react-router";
import {
  CategoryFiltersState,
  PaginationState,
  StateForUrl as CategoryStateForUrl,
  UrlParamsInput as CategoryUrlParamsInput,
} from "../types/categoryManagementTypes"; // Adjust path as needed
import { useDebounce } from "../../hooks/useDebounce"; // Adjust path
import { getUrlParams, setUrlParams } from "../../utils/urlUtils"; // Adjust path

// Define an interface for the actual query parameters sent to the API/consumer
export interface CategoryQueryApiParams {
  name?: string;
  experts?: string;
  managers?: string;
  archived?: boolean;
  itemsPerPage?: number;
  currentPage?: number;
}

// Interface for the return value of the hook
interface UseCategoryManagementReturn extends PaginationState {
  filterName: string;
  setFilterName: React.Dispatch<React.SetStateAction<string>>;
  filterExperts: string;
  setFilterExperts: React.Dispatch<React.SetStateAction<string>>;
  filterManagers: string;
  setFilterManagers: React.Dispatch<React.SetStateAction<string>>;
  filterArchived?: boolean;
  setFilterArchived: React.Dispatch<React.SetStateAction<boolean | undefined>>;

  debouncedFilterName: string;
  debouncedFilterExperts: string;
  debouncedFilterManagers: string;

  handlePageChange: (page: number) => void;
  handleItemsPerPageChange: (size: number) => void;
  handleArchivedChange: (value?: boolean) => void;
  currentQueryInput: Partial<CategoryQueryApiParams>;
}

// Helper to parse boolean from string, returning undefined if not 'true' or 'false'
const parseBooleanParam = (
  param: string | null | undefined
): boolean | undefined => {
  if (param === "true") return true;
  if (param === "false") return false;
  return undefined;
};

// Define a more specific type for the result of initialStateFromUrl
// This helps ensure that name, experts, managers are strings after defaulting
type InitialStateFromUrlType = Omit<
  CategoryUrlParamsInput,
  "name" | "experts" | "managers"
> & {
  name: string;
  experts: string;
  managers: string;
};

export function useCategoryManagement(): UseCategoryManagementReturn {
  const location = useLocation();
  const navigate = useNavigate();

  const searchParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );

  const initialStateFromUrl = useMemo(() => {
    const rawParams = getUrlParams(searchParams) as any; // Using 'any' for simplicity for raw URL params
    return {
      page: parseInt(rawParams.page || "1", 10),
      perPage: parseInt(rawParams.perPage || "10", 10),
      name: rawParams.name || "", // Becomes string
      experts: rawParams.experts || "", // Becomes string
      managers: rawParams.managers || "", // Becomes string
      archived: parseBooleanParam(rawParams.archived),
    } as InitialStateFromUrlType; // Use the more specific type
  }, [searchParams]);

  const [currentPage, setCurrentPage] = useState(initialStateFromUrl.page);
  const [itemsPerPage, setItemsPerPage] = useState(initialStateFromUrl.perPage);

  const [filterName, setFilterName] = useState(initialStateFromUrl.name); // Initialized with string
  const [filterExperts, setFilterExperts] = useState(
    initialStateFromUrl.experts // Initialized with string
  );
  const [filterManagers, setFilterManagers] = useState(
    initialStateFromUrl.managers // Initialized with string
  );
  const [filterArchived, setFilterArchived] = useState<boolean | undefined>(
    initialStateFromUrl.archived
  );

  const debouncedFilterName = useDebounce(filterName, 500);
  const debouncedFilterExperts = useDebounce(filterExperts, 500);
  const debouncedFilterManagers = useDebounce(filterManagers, 500);

  const prevFiltersRef = useRef<CategoryFiltersState | undefined>(undefined); // Uses CategoryFiltersState directly

  const currentQueryInput = useMemo((): Partial<CategoryQueryApiParams> => {
    const input: Partial<CategoryQueryApiParams> = {
      itemsPerPage: itemsPerPage,
      currentPage: currentPage > 0 ? currentPage - 1 : 0,
      name: debouncedFilterName,
      experts: debouncedFilterExperts,
      managers: debouncedFilterManagers,
      archived: filterArchived,
    };

    // This logic correctly removes undefined/empty string values, except for 'archived: false'
    (Object.keys(input) as Array<keyof CategoryQueryApiParams>).forEach(
      (key) => {
        if (key === "currentPage" || key === "itemsPerPage") {
          return;
        }
        const currentValue = input[key];
        let shouldDelete = false;
        if (
          currentValue === "" ||
          currentValue === null ||
          currentValue === undefined
        ) {
          shouldDelete = true;
        }
        if (key === "archived" && currentValue === false) {
          shouldDelete = false;
        }
        if (shouldDelete) {
          delete input[key];
        }
      }
    );
    return input;
  }, [
    currentPage,
    itemsPerPage,
    debouncedFilterName,
    debouncedFilterExperts,
    debouncedFilterManagers,
    filterArchived,
  ]);

  const updateUrl = useCallback(
    // newState can be Partial of StateForUrl since StateForUrl correctly defines filterManagers
    (newState: Partial<CategoryStateForUrl>) => {
      const params = new URLSearchParams(location.search);
      // stateForUrl is now correctly typed with StateForUrl
      const stateForUrl: CategoryStateForUrl = {
        currentPage: newState.currentPage ?? currentPage,
        itemsPerPage: newState.itemsPerPage ?? itemsPerPage,
        filterName: newState.filterName ?? debouncedFilterName,
        filterExperts: newState.filterExperts ?? debouncedFilterExperts,
        filterManagers: newState.filterManagers ?? debouncedFilterManagers,
        filterArchived:
          newState.filterArchived !== undefined
            ? newState.filterArchived
            : filterArchived,
      };
      setUrlParams(params, stateForUrl as any); // Cast to any for setUrlParams if it's not perfectly typed for this
      navigate(`${location.pathname}?${params.toString()}`, { replace: true });
    },
    [
      currentPage,
      itemsPerPage,
      debouncedFilterName,
      debouncedFilterExperts,
      debouncedFilterManagers,
      filterArchived,
      location.search,
      location.pathname,
      navigate,
    ]
  );

  const handlePageChange = useCallback(
    (page: number) => {
      if (page === currentPage) return;
      setCurrentPage(page);
      updateUrl({ currentPage: page });
    },
    [currentPage, updateUrl]
  );

  const handleItemsPerPageChange = useCallback(
    (size: number) => {
      if (size === itemsPerPage) return;
      const newPage = 1;
      setItemsPerPage(size);
      setCurrentPage(newPage);
      updateUrl({ currentPage: newPage, itemsPerPage: size });
    },
    [itemsPerPage, updateUrl]
  );

  const handleArchivedChange = useCallback((value?: boolean) => {
    setFilterArchived(value);
  }, []);

  useEffect(() => {
    // currentEffectiveFilters is typed with CategoryFiltersState
    const currentEffectiveFilters: CategoryFiltersState = {
      name: debouncedFilterName,
      experts: debouncedFilterExperts,
      managers: debouncedFilterManagers,
      archived: filterArchived,
    };

    // previousEffectiveFilters is also typed with CategoryFiltersState
    const previousEffectiveFilters =
      prevFiltersRef.current ??
      ({
        // Default to initial URL state structure, matching CategoryFiltersState
        name: initialStateFromUrl.name,
        experts: initialStateFromUrl.experts,
        managers: initialStateFromUrl.managers,
        archived: initialStateFromUrl.archived,
      } as CategoryFiltersState);

    const normalizeFiltersForCompare = (
      filters: CategoryFiltersState // Parameter is CategoryFiltersState
    ) => ({
      name: filters.name || undefined,
      experts: filters.experts || undefined,
      managers: filters.managers || undefined,
      archived: filters.archived,
    });

    const stringifiedCurrent = JSON.stringify(
      normalizeFiltersForCompare(currentEffectiveFilters)
    );
    const stringifiedPrevious = JSON.stringify(
      normalizeFiltersForCompare(previousEffectiveFilters)
    );

    const filtersHaveChanged = stringifiedCurrent !== stringifiedPrevious;
    prevFiltersRef.current = currentEffectiveFilters;

    if (filtersHaveChanged) {
      const newPage = 1;
      // filtersForUrlUpdate matches the structure of filter properties in StateForUrl
      const filtersForUrlUpdate = {
        filterName: debouncedFilterName,
        filterExperts: debouncedFilterExperts,
        filterManagers: debouncedFilterManagers,
        filterArchived: filterArchived,
      };

      if (currentPage !== newPage) {
        setCurrentPage(newPage);
        updateUrl({
          currentPage: newPage,
          ...filtersForUrlUpdate,
        });
      } else {
        updateUrl(filtersForUrlUpdate);
      }
    }
  }, [
    debouncedFilterName,
    debouncedFilterExperts,
    debouncedFilterManagers,
    filterArchived,
    currentPage,
    initialStateFromUrl, // Keep this dependency if prevFiltersRef relies on it for initial comparison logic
    updateUrl,
  ]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const rawStateFromUrl = getUrlParams(params) as any; // Raw params can be loosely typed
    // stateFromUrl correctly reflects the properties including 'managers'
    const stateFromUrl: InitialStateFromUrlType = {
      // Use the specific type for clarity
      page: parseInt(rawStateFromUrl.page || "1", 10),
      perPage: parseInt(rawStateFromUrl.perPage || "10", 10),
      name: rawStateFromUrl.name || "",
      experts: rawStateFromUrl.experts || "",
      managers: rawStateFromUrl.managers || "",
      archived: parseBooleanParam(rawStateFromUrl.archived),
    };

    if (stateFromUrl.page !== currentPage) setCurrentPage(stateFromUrl.page);
    if (stateFromUrl.perPage !== itemsPerPage)
      setItemsPerPage(stateFromUrl.perPage);

    if (stateFromUrl.name !== filterName) setFilterName(stateFromUrl.name);
    if (stateFromUrl.experts !== filterExperts)
      setFilterExperts(stateFromUrl.experts);
    if (stateFromUrl.managers !== filterManagers)
      setFilterManagers(stateFromUrl.managers);
    if (stateFromUrl.archived !== filterArchived) {
      setFilterArchived(stateFromUrl.archived);
    }
  }, [
    location.search,
    currentPage,
    itemsPerPage,
    filterName,
    filterExperts,
    filterManagers,
    filterArchived,
  ]); // Added state dependencies to prevent stale closures if logic becomes more complex

  return {
    currentPage,
    itemsPerPage,
    filterName,
    setFilterName,
    filterExperts,
    setFilterExperts,
    filterManagers,
    setFilterManagers,
    filterArchived,
    setFilterArchived,
    debouncedFilterName,
    debouncedFilterExperts,
    debouncedFilterManagers,
    handlePageChange,
    handleItemsPerPageChange,
    handleArchivedChange,
    currentQueryInput,
  };
}
