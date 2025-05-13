// src/page/hooks/useCategoryManagement.ts
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useLocation, useNavigate } from "react-router";
import {
  CategoryFiltersState, // This type will need to be updated to include expertIds and managerIds
  PaginationState,
  StateForUrl as CategoryStateForUrl, // This type will need to be updated
  UrlParamsInput as CategoryUrlParamsInput, // This type will need to be updated
} from "../types/categoryManagementTypes"; // Adjust path as needed
import { useDebounce } from "../../hooks/useDebounce"; // Adjust path
import { getUrlParams, setUrlParams } from "../../utils/urlUtils"; // Adjust path

// Update CategoryQueryApiParams to expect arrays for IDs
export interface CategoryQueryApiParams {
  name?: string;
  expertIds?: string[]; // Changed from string to string[]
  managerIds?: string[]; // Changed from string to string[]
  archived?: boolean;
  itemsPerPage?: number;
  currentPage?: number;
}

// Update return type of the hook
interface UseCategoryManagementReturn extends PaginationState {
  filterName: string;
  setFilterName: React.Dispatch<React.SetStateAction<string>>;
  // expertIds and managerIds are now arrays of strings
  filterExpertIds: string[];
  setFilterExpertIds: React.Dispatch<React.SetStateAction<string[]>>;
  filterManagerIds: string[];
  setFilterManagerIds: React.Dispatch<React.SetStateAction<string[]>>;
  filterArchived?: boolean;
  setFilterArchived: React.Dispatch<React.SetStateAction<boolean | undefined>>;

  debouncedFilterName: string;
  // No debounce needed for ID arrays directly, debounce is for search input within dropdowns

  handlePageChange: (page: number) => void;
  handleItemsPerPageChange: (size: number) => void;
  handleArchivedChange: (value?: boolean | undefined) => void;
  currentQueryInput: Partial<CategoryQueryApiParams>;
}

const parseBooleanParam = (
  param: string | null | undefined
): boolean | undefined => {
  if (param === "true") return true;
  if (param === "false") return false;
  return undefined;
};

// Helper to parse comma-separated string to array of strings
const parseStringArrayParam = (param: string | null | undefined): string[] => {
  if (param && typeof param === "string" && param.trim() !== "") {
    return param
      .split(",")
      .map((id) => id.trim())
      .filter((id) => id !== "");
  }
  return [];
};

type InitialStateFromUrlType = Omit<
  CategoryUrlParamsInput,
  "name" | "experts" | "managers" | "expertIds" | "managerIds" // Omit old string versions and new array versions
> & {
  name: string;
  // These will be initialized from parsed URL params
  expertIds: string[];
  managerIds: string[];
};

const normalizeFiltersForCompare = (filters: CategoryFiltersState) => ({
  name: filters.name || undefined,
  // Ensure expertIds and managerIds are sorted for consistent stringification
  expertIds: filters.expertIds ? [...filters.expertIds].sort() : undefined,
  managerIds: filters.managerIds ? [...filters.managerIds].sort() : undefined,
  archived: filters.archived,
});

export function useCategoryManagement(): UseCategoryManagementReturn {
  const location = useLocation();
  const navigate = useNavigate();

  const searchParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );

  const initialStateFromUrl = useMemo(() => {
    const rawParams = getUrlParams(searchParams) as any;
    return {
      page: parseInt(rawParams.page || "1", 10),
      perPage: parseInt(rawParams.perPage || "10", 10),
      name: rawParams.name || "",
      // Parse expertIds and managerIds from URL (e.g., as comma-separated strings)
      expertIds: parseStringArrayParam(rawParams.expertIds),
      managerIds: parseStringArrayParam(rawParams.managerIds),
      archived: parseBooleanParam(rawParams.archived),
    } as InitialStateFromUrlType & CategoryFiltersState; // Ensure it includes all CategoryFiltersState props
  }, [searchParams]);

  const [currentPage, setCurrentPage] = useState(initialStateFromUrl.page);
  const [itemsPerPage, setItemsPerPage] = useState(initialStateFromUrl.perPage);
  const [filterName, setFilterName] = useState(initialStateFromUrl.name);
  // State for expert and manager IDs (arrays)
  const [filterExpertIds, setFilterExpertIds] = useState<string[]>(
    initialStateFromUrl.expertIds || []
  );
  const [filterManagerIds, setFilterManagerIds] = useState<string[]>(
    initialStateFromUrl.managerIds || []
  );
  const [filterArchived, setFilterArchived] = useState<boolean | undefined>(
    initialStateFromUrl.archived
  );

  const debouncedFilterName = useDebounce(filterName, 500);
  // Debouncing for ID arrays is not directly applicable here;
  // The selection in the dropdown is immediate. Debounce is for search within dropdown.

  const prevAppliedFiltersRef = useRef<CategoryFiltersState | undefined>(
    undefined
  );

  const currentQueryInput = useMemo((): Partial<CategoryQueryApiParams> => {
    const input: Partial<CategoryQueryApiParams> = {
      itemsPerPage: itemsPerPage,
      currentPage: currentPage > 0 ? currentPage - 1 : 0,
      name: debouncedFilterName,
      // Pass ID arrays directly if they have values
      ...(filterExpertIds.length > 0 && { expertIds: filterExpertIds }),
      ...(filterManagerIds.length > 0 && { managerIds: filterManagerIds }),
      archived: filterArchived,
    };

    // Clean up empty/null values, but keep 'archived: false'
    (Object.keys(input) as Array<keyof CategoryQueryApiParams>).forEach(
      (key) => {
        if (key === "currentPage" || key === "itemsPerPage") return;
        const currentValue = input[key];
        let shouldDelete = false;
        if (
          currentValue === "" ||
          currentValue === null ||
          currentValue === undefined
        ) {
          shouldDelete = true;
        }
        // For arrays, check if empty
        if (Array.isArray(currentValue) && currentValue.length === 0) {
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
    filterExpertIds, // Use non-debounced ID arrays for query input
    filterManagerIds, // Use non-debounced ID arrays for query input
    filterArchived,
  ]);

  const updateUrl = useCallback(
    (newState: Partial<CategoryStateForUrl>) => {
      const params = new URLSearchParams(location.search);
      const stateForUrl: CategoryStateForUrl = {
        currentPage: newState.currentPage ?? currentPage,
        itemsPerPage: newState.itemsPerPage ?? itemsPerPage,
        filterName: newState.filterName ?? debouncedFilterName,
        // For URL, serialize ID arrays (e.g., to comma-separated strings)
        filterExpertIds: newState.filterExpertIds ?? filterExpertIds, // Pass array
        filterManagerIds: newState.filterManagerIds ?? filterManagerIds, // Pass array
        filterArchived:
          newState.filterArchived !== undefined
            ? newState.filterArchived
            : filterArchived,
      };
      // setUrlParams needs to handle array-to-string serialization for expertIds/managerIds
      setUrlParams(params, stateForUrl as any);
      navigate(`${location.pathname}?${params.toString()}`, { replace: true });
    },
    [
      currentPage,
      itemsPerPage,
      debouncedFilterName,
      filterExpertIds, // Depend on actual ID arrays
      filterManagerIds, // Depend on actual ID arrays
      filterArchived,
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
    const currentEffectiveFilters: CategoryFiltersState = {
      name: debouncedFilterName,
      expertIds: filterExpertIds, // Use direct array state
      managerIds: filterManagerIds, // Use direct array state
      archived: filterArchived,
    };

    if (prevAppliedFiltersRef.current === undefined) {
      prevAppliedFiltersRef.current = currentEffectiveFilters;
      return;
    }

    const stringifiedCurrent = JSON.stringify(
      normalizeFiltersForCompare(currentEffectiveFilters)
    );
    const stringifiedPrevious = JSON.stringify(
      normalizeFiltersForCompare(prevAppliedFiltersRef.current)
    );

    const filtersHaveChanged = stringifiedCurrent !== stringifiedPrevious;

    if (filtersHaveChanged) {
      prevAppliedFiltersRef.current = currentEffectiveFilters;
      const newPage = 1;
      const filtersForUrlUpdate: Partial<CategoryStateForUrl> = {
        // Match StateForUrl structure
        filterName: debouncedFilterName,
        filterExpertIds: filterExpertIds,
        filterManagerIds: filterManagerIds,
        filterArchived: filterArchived,
      };

      if (currentPage !== newPage) {
        setCurrentPage(newPage);
        updateUrl({ currentPage: newPage, ...filtersForUrlUpdate });
      } else {
        updateUrl(filtersForUrlUpdate);
      }
    }
  }, [
    debouncedFilterName,
    filterExpertIds, // Depend on ID arrays
    filterManagerIds, // Depend on ID arrays
    filterArchived,
    currentPage,
    updateUrl,
  ]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const rawStateFromUrl = getUrlParams(params) as any;

    const urlPage = parseInt(rawStateFromUrl.page || "1", 10);
    const urlPerPage = parseInt(rawStateFromUrl.perPage || "10", 10);
    const urlName = rawStateFromUrl.name || "";
    // Parse ID arrays from URL
    const urlExpertIds = parseStringArrayParam(rawStateFromUrl.expertIds);
    const urlManagerIds = parseStringArrayParam(rawStateFromUrl.managerIds);
    const urlArchived = parseBooleanParam(rawStateFromUrl.archived);

    if (urlPage !== currentPage) setCurrentPage(urlPage);
    if (urlPerPage !== itemsPerPage) setItemsPerPage(urlPerPage);

    if (urlName !== filterName && urlName !== debouncedFilterName) {
      setFilterName(urlName);
    }
    // For ID arrays, compare stringified sorted versions to avoid loop from object reference changes
    if (
      JSON.stringify(urlExpertIds.sort()) !==
      JSON.stringify(filterExpertIds.sort())
    ) {
      setFilterExpertIds(urlExpertIds);
    }
    if (
      JSON.stringify(urlManagerIds.sort()) !==
      JSON.stringify(filterManagerIds.sort())
    ) {
      setFilterManagerIds(urlManagerIds);
    }
    if (urlArchived !== filterArchived) {
      setFilterArchived(urlArchived);
    }
  }, [location.search]); // Only depend on location.search

  return {
    currentPage,
    itemsPerPage,
    filterName,
    setFilterName,
    filterExpertIds, // Return array
    setFilterExpertIds,
    filterManagerIds, // Return array
    setFilterManagerIds,
    filterArchived,
    setFilterArchived,
    debouncedFilterName,
    handlePageChange,
    handleItemsPerPageChange,
    handleArchivedChange,
    currentQueryInput,
  };
}
