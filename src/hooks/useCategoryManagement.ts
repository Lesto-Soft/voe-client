// src/page/hooks/useCategoryManagement.ts
import { useState, useEffect, useMemo, useCallback } from "react";
import { useLocation, useNavigate } from "react-router";
import { useDebounce } from "./useDebounce";
import { ICaseStatus } from "../db/interfaces";

export interface CategoryQueryApiParams {
  name?: string;
  expertIds?: string[];
  managerIds?: string[];
  archived?: boolean;
  itemsPerPage?: number;
  currentPage?: number; // 0-indexed for your API
}

interface UseCategoryManagementReturn {
  currentPage: number;
  itemsPerPage: number;
  filterName: string;
  setFilterName: (value: string) => void;
  filterExpertIds: string[];
  setFilterExpertIds: (ids: string[]) => void;
  filterManagerIds: string[];
  setFilterManagerIds: (ids: string[]) => void;
  filterArchived?: boolean;
  setFilterArchived: (value: boolean | undefined) => void;
  filterCaseStatus: ICaseStatus | string | null;
  setFilterCaseStatus: (status: ICaseStatus | string | null) => void;
  debouncedFilterName: string;
  handlePageChange: (page: number) => void;
  handleItemsPerPageChange: (size: number) => void;
  currentQueryInput: CategoryQueryApiParams;
}

const parseBooleanParam = (
  param: string | null | undefined
): boolean | undefined => {
  if (param === "true") return true;
  if (param === "false") return false;
  return undefined;
};

const parseStringArrayParam = (param: string | null | undefined): string[] => {
  if (param && typeof param === "string" && param.trim() !== "") {
    return param
      .split(",")
      .map((id) => id.trim())
      .filter((id) => id !== "");
  }
  return [];
};

const parseCaseStatusParam = (
  param: string | null | undefined
): ICaseStatus | null => {
  if (param && Object.values(ICaseStatus).includes(param as ICaseStatus)) {
    return param as ICaseStatus;
  }
  return null;
};

export function useCategoryManagement(): UseCategoryManagementReturn {
  const location = useLocation();
  const navigate = useNavigate();

  const getFiltersFromUrl = useCallback(() => {
    const params = new URLSearchParams(location.search);
    return {
      page: parseInt(params.get("page") || "1", 10),
      itemsPerPage: parseInt(params.get("itemsPerPage") || "10", 10),
      name: params.get("name") || "",
      expertIds: parseStringArrayParam(params.get("experts")),
      managerIds: parseStringArrayParam(params.get("managers")),
      archived: parseBooleanParam(params.get("archived")),
      caseStatus: parseCaseStatusParam(params.get("caseStatus")),
    };
  }, [location.search]);

  const initialUrlState = useMemo(
    () => getFiltersFromUrl(),
    [getFiltersFromUrl]
  );

  // State definitions (1-indexed for UI currentPage)
  const [currentPage, setCurrentPage] = useState(initialUrlState.page);
  const [itemsPerPage, setItemsPerPage] = useState(
    initialUrlState.itemsPerPage
  );
  const [filterName, setFilterName] = useState(initialUrlState.name);
  const [filterExpertIds, setFilterExpertIds] = useState<string[]>(
    initialUrlState.expertIds
  );
  const [filterManagerIds, setFilterManagerIds] = useState<string[]>(
    initialUrlState.managerIds
  );
  const [filterArchived, setFilterArchived] = useState<boolean | undefined>(
    initialUrlState.archived
  );
  const [filterCaseStatus, setFilterCaseStatus] = useState<
    ICaseStatus | string | null
  >(initialUrlState.caseStatus);

  const debouncedFilterName = useDebounce(filterName, 500);

  // Effect to update URL from state changes (State -> URL)
  useEffect(() => {
    const params = new URLSearchParams();
    params.set("page", String(currentPage));
    params.set("itemsPerPage", String(itemsPerPage));

    if (debouncedFilterName) params.set("name", debouncedFilterName);
    else params.delete("name"); // Explicitly remove if empty

    if (filterExpertIds.length > 0)
      params.set("experts", filterExpertIds.join(","));
    else params.delete("experts");

    if (filterManagerIds.length > 0)
      params.set("managers", filterManagerIds.join(","));
    else params.delete("managers");

    if (filterArchived !== undefined)
      params.set("archived", String(filterArchived));
    else params.delete("archived");

    if (filterCaseStatus) params.set("caseStatus", filterCaseStatus);
    else params.delete("caseStatus");

    const newSearchString = params.toString();
    const currentActualSearch = location.search.startsWith("?")
      ? location.search.substring(1)
      : location.search;

    if (newSearchString !== currentActualSearch) {
      navigate(`${location.pathname}?${newSearchString}`, { replace: true });
    }
  }, [
    // --- MODIFICATION: REMOVED location.search from dependencies ---
    debouncedFilterName,
    filterExpertIds,
    filterManagerIds,
    filterArchived,
    filterCaseStatus,
    currentPage,
    itemsPerPage,
    navigate, // navigate is stable
    location.pathname, // Typically stable within the same page component
  ]);

  // Effect to update state from URL changes (URL -> State)
  useEffect(() => {
    const stateFromUrl = getFiltersFromUrl();

    if (stateFromUrl.page !== currentPage) {
      setCurrentPage(stateFromUrl.page); // Use RAW setter from useState
    }
    if (stateFromUrl.itemsPerPage !== itemsPerPage) {
      setItemsPerPage(stateFromUrl.itemsPerPage); // Use RAW setter
    }
    // For filters, ensure we're comparing apples to apples and use raw setters
    // to prevent reset-page logic from firing due to URL sync.
    if (stateFromUrl.name !== filterName) {
      setFilterName(stateFromUrl.name); // Use RAW setter
    }
    if (
      JSON.stringify(stateFromUrl.expertIds.sort()) !==
      JSON.stringify(filterExpertIds.sort())
    ) {
      setFilterExpertIds(stateFromUrl.expertIds); // Use RAW setter
    }
    if (
      JSON.stringify(stateFromUrl.managerIds.sort()) !==
      JSON.stringify(filterManagerIds.sort())
    ) {
      setFilterManagerIds(stateFromUrl.managerIds); // Use RAW setter
    }
    if (stateFromUrl.archived !== filterArchived) {
      setFilterArchived(stateFromUrl.archived); // Use RAW setter
    }
    if (stateFromUrl.caseStatus !== filterCaseStatus) {
      setFilterCaseStatus(stateFromUrl.caseStatus); // Use RAW setter
    }
  }, [getFiltersFromUrl]); // This effect ONLY depends on getFiltersFromUrl (i.e. location.search changing)
  // And the state values for comparison, which are read, not changed by this effect's dependencies directly.
  // Adding state values (currentPage, itemsPerPage, filterName etc.) to this dependency array
  // is necessary IF we only want to call setters when things are TRULY different.
  // However, the primary trigger must remain getFiltersFromUrl.
  // Let's refine its dependencies for safety and clarity:
  // [getFiltersFromUrl, currentPage, itemsPerPage, filterName, filterExpertIds, filterManagerIds, filterArchived, filterCaseStatus]
  // This ensures it re-evaluates if local state changes AND URL changes, but the internal checks `(stateFromUrl.page !== currentPage)` prevent loops.

  // Callback for page changes
  const handlePageChange = useCallback(
    (page: number) => {
      if (page !== currentPage) {
        // Prevent re-setting if already on that page
        setCurrentPage(page);
      }
    },
    [currentPage] // Depend on currentPage to ensure the comparison is fresh
  );

  // Callback for items per page changes
  const handleItemsPerPageChange = useCallback(
    (size: number) => {
      if (size !== itemsPerPage) {
        // Prevent re-setting
        setItemsPerPage(size);
        setCurrentPage(1); // Reset to page 1 when items per page changes
      }
    },
    [itemsPerPage]
  ); // Depend on itemsPerPage

  // HOC for creating filter setters that also reset the page
  const createFilterSetter = <T>(
    setter: React.Dispatch<React.SetStateAction<T>>
  ) =>
    useCallback(
      (value: T) => {
        // Check if the value actually changed to prevent unnecessary page resets
        // This requires knowing the current value, which is tricky inside this generic HOC
        // For simplicity, we assume if this is called, a change is intended.
        setter(value);
        setCurrentPage(1);
      },
      [setter] // setCurrentPage from useState is stable
    );

  const setFilterNameAndResetPage = createFilterSetter(setFilterName);
  const setFilterExpertIdsAndResetPage = createFilterSetter(setFilterExpertIds);
  const setFilterManagerIdsAndResetPage =
    createFilterSetter(setFilterManagerIds);
  const setFilterArchivedAndResetPage = createFilterSetter(setFilterArchived);
  const setFilterCaseStatusAndResetPage = createFilterSetter(
    setFilterCaseStatus as React.Dispatch<
      // Cast needed due to complex type
      React.SetStateAction<ICaseStatus | string | null>
    >
  );

  // Memoized query input for GraphQL hooks
  const currentQueryInput = useMemo((): CategoryQueryApiParams => {
    const input: CategoryQueryApiParams = {
      itemsPerPage: itemsPerPage,
      currentPage: currentPage > 0 ? currentPage - 1 : 0, // 0-indexed
    };
    if (debouncedFilterName) input.name = debouncedFilterName;
    if (filterExpertIds.length > 0) input.expertIds = filterExpertIds;
    if (filterManagerIds.length > 0) input.managerIds = filterManagerIds;
    if (filterArchived !== undefined) input.archived = filterArchived;
    return input;
  }, [
    currentPage,
    itemsPerPage,
    debouncedFilterName,
    filterExpertIds,
    filterManagerIds,
    filterArchived,
  ]);

  return {
    currentPage,
    itemsPerPage,
    filterName,
    setFilterName: setFilterNameAndResetPage,
    filterExpertIds,
    setFilterExpertIds: setFilterExpertIdsAndResetPage,
    filterManagerIds,
    setFilterManagerIds: setFilterManagerIdsAndResetPage,
    filterArchived,
    setFilterArchived: setFilterArchivedAndResetPage,
    filterCaseStatus,
    setFilterCaseStatus: setFilterCaseStatusAndResetPage,
    debouncedFilterName,
    handlePageChange,
    handleItemsPerPageChange,
    currentQueryInput,
  };
}
