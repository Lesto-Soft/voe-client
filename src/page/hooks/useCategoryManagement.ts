// src/page/hooks/useCategoryManagement.ts
import { useState, useEffect, useMemo, useCallback } from "react";
import { useLocation, useNavigate } from "react-router"; // Ensure react-router-dom
import {
  CategoryFiltersState,
  PaginationState,
} from "../types/categoryManagementTypes";
import { useDebounce } from "../../hooks/useDebounce";

export interface CategoryQueryApiParams {
  name?: string;
  expertIds?: string[];
  managerIds?: string[];
  archived?: boolean;
  limit?: number; // Changed from itemsPerPage
  page?: number; // Changed from currentPage (0-indexed for API)
}

interface UseCategoryManagementReturn extends PaginationState {
  filterName: string;
  setFilterName: (value: string) => void;
  filterExpertIds: string[];
  setFilterExpertIds: (ids: string[]) => void;
  filterManagerIds: string[];
  setFilterManagerIds: (ids: string[]) => void;
  filterArchived?: boolean;
  setFilterArchived: (value: boolean | undefined) => void;
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
    };
  }, [location.search]);

  const initialUrlState = useMemo(
    () => getFiltersFromUrl(),
    [getFiltersFromUrl]
  );

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

  const debouncedFilterName = useDebounce(filterName, 500);

  // Effect to update URL from state changes (filters, pagination)
  useEffect(() => {
    const params = new URLSearchParams();
    params.set("page", String(currentPage));
    params.set("itemsPerPage", String(itemsPerPage));

    if (debouncedFilterName) params.set("name", debouncedFilterName);
    else params.delete("name");

    if (filterExpertIds.length > 0)
      params.set("experts", filterExpertIds.join(","));
    else params.delete("experts");

    if (filterManagerIds.length > 0)
      params.set("managers", filterManagerIds.join(","));
    else params.delete("managers");

    if (filterArchived !== undefined)
      params.set("archived", String(filterArchived));
    else params.delete("archived");

    const newSearchString = params.toString();
    const currentSearchString = location.search.substring(1); // Remove '?'

    if (newSearchString !== currentSearchString) {
      navigate(`${location.pathname}?${newSearchString}`, { replace: true });
    }
  }, [
    debouncedFilterName,
    filterExpertIds,
    filterManagerIds,
    filterArchived,
    currentPage,
    itemsPerPage,
    navigate,
    location.pathname,
    // IMPORTANT: location.search (or params derived from it like user's 'searchParams') is NOT a dependency here.
  ]);

  // Effect to update state from URL changes (e.g., browser back/forward)
  useEffect(() => {
    const stateFromUrl = getFiltersFromUrl();

    // Compare and set state only if different to avoid unnecessary re-renders
    // that could feed back into the previous useEffect if not careful.
    if (stateFromUrl.name !== filterName) {
      setFilterName(stateFromUrl.name);
    }
    if (
      JSON.stringify(stateFromUrl.expertIds.sort()) !==
      JSON.stringify(filterExpertIds.sort())
    ) {
      setFilterExpertIds(stateFromUrl.expertIds);
    }
    if (
      JSON.stringify(stateFromUrl.managerIds.sort()) !==
      JSON.stringify(filterManagerIds.sort())
    ) {
      setFilterManagerIds(stateFromUrl.managerIds);
    }
    if (stateFromUrl.archived !== filterArchived) {
      setFilterArchived(stateFromUrl.archived);
    }
    if (stateFromUrl.page !== currentPage) {
      setCurrentPage(stateFromUrl.page);
    }
    if (stateFromUrl.itemsPerPage !== itemsPerPage) {
      setItemsPerPage(stateFromUrl.itemsPerPage);
    }
  }, [getFiltersFromUrl]); // Depends on getFiltersFromUrl, which is memoized on location.search.
  // Setters are not in deps. React bails out of state updates if value is same.

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleItemsPerPageChange = useCallback((size: number) => {
    setItemsPerPage(size);
    setCurrentPage(1);
  }, []);

  const createFilterSetter = <T>(
    setter: React.Dispatch<React.SetStateAction<T>>
  ) =>
    useCallback(
      (value: T) => {
        setter(value);
        setCurrentPage(1);
      },
      [setter]
    );

  const setFilterNameAndResetPage = createFilterSetter(setFilterName);
  const setFilterExpertIdsAndResetPage = createFilterSetter(setFilterExpertIds);
  const setFilterManagerIdsAndResetPage =
    createFilterSetter(setFilterManagerIds);
  const setFilterArchivedAndResetPage = createFilterSetter(setFilterArchived);

  const currentQueryInput = useMemo((): CategoryQueryApiParams => {
    const input: CategoryQueryApiParams = {
      limit: itemsPerPage,
      page: currentPage > 0 ? currentPage - 1 : 0, // API 0-indexed
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
    debouncedFilterName,
    handlePageChange,
    handleItemsPerPageChange,
    currentQueryInput,
  };
}
